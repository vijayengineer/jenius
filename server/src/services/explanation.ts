import { createHash } from "node:crypto";
import {
  ExplanationPayloadSchema,
  type ExplainRequest,
  type ExplainResponse,
} from "../../../shared/contracts.js";
import { getVerifiedConceptSummary } from "../catalogue.js";
import type { ServerConfig } from "../config.js";
import { ApiError } from "../errors.js";
import { createExplanationCacheKey } from "../fingerprints.js";
import type { StructuredModelGateway } from "../model/gateway.js";
import { EXPLANATION_JSON_SCHEMA } from "../model/schema.js";
import { buildExplanationPrompt } from "../prompts/explanation.js";
import type { JeniusRepository } from "../repositories/types.js";
import { containsPromptLeakage } from "../safety.js";
import { consumeUsageOrThrow, mapModelError } from "./common.js";

export interface ExplanationServiceInput {
  request: ExplainRequest;
  requestId: string;
  requestFingerprint: string;
}

function contextFingerprint(request: ExplainRequest): string | undefined {
  const context = [
    request.misconceptionId,
    request.learnerContextId,
    request.previousExplanationFingerprint,
  ]
    .filter(Boolean)
    .join("\u0000");
  return context ? createHash("sha256").update(context).digest("hex") : undefined;
}

export class ExplanationService {
  constructor(
    private readonly config: ServerConfig,
    private readonly repository: JeniusRepository,
    private readonly model: StructuredModelGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async explain(input: ExplanationServiceInput): Promise<ExplainResponse> {
    if (!this.config.configurationReady) {
      throw new ApiError(
        503,
        "not_configured",
        "The optional learning coach is not configured.",
        false,
      );
    }
    const concept = getVerifiedConceptSummary(input.request.conceptId);
    if (!concept) {
      throw new ApiError(404, "not_found", "That verified concept was not found.");
    }
    if (
      input.request.misconceptionId &&
      !input.request.misconceptionId.startsWith(`${concept.id}-`)
    ) {
      throw new ApiError(400, "bad_request", "That misconception does not belong to the concept.");
    }

    const cacheKey = createExplanationCacheKey({
      conceptId: concept.id,
      style: input.request.explanationStyle,
      contextFingerprint: contextFingerprint(input.request),
      promptVersion: this.config.prompts.explanationVersion,
      model: this.config.openai.model,
    });

    let cached;
    try {
      cached = await this.repository.getExplanation(cacheKey);
    } catch {
      throw new ApiError(
        503,
        "upstream_unavailable",
        "The explanation cache is temporarily unavailable.",
        true,
      );
    }
    if (cached) {
      return {
        conceptId: concept.id,
        style: input.request.explanationStyle,
        ...cached.payload,
        cached: true,
        generatedAt: cached.createdAt,
        requestId: input.requestId,
      };
    }

    await consumeUsageOrThrow(() =>
      this.repository.consumeUsage({
        fingerprint: input.requestFingerprint,
        kind: "explain",
        day: this.now().toISOString().slice(0, 10),
        limit: this.config.usage.dailyExplainLimit,
      }),
    );

    const prompt = buildExplanationPrompt(concept, input.request);
    let raw: unknown;
    try {
      raw = await this.model.complete({
        name: "jenius_alternative_explanation",
        instructions: prompt.instructions,
        input: prompt.input,
        schema: EXPLANATION_JSON_SCHEMA,
        maxOutputTokens: 500,
        safetyIdentifier: input.requestFingerprint,
      });
    } catch (error) {
      mapModelError(error);
    }
    const normalized =
      raw && typeof raw === "object" && "miniExample" in raw && raw.miniExample === null
        ? { ...raw, miniExample: undefined }
        : raw;
    const payload = ExplanationPayloadSchema.safeParse(normalized);
    if (!payload.success || containsPromptLeakage(payload.data)) {
      throw new ApiError(
        502,
        "validation_failed",
        "The coach returned an explanation Jenius could not safely use.",
        true,
      );
    }

    const createdAt = this.now();
    try {
      await this.repository.saveExplanation({
        cacheKey,
        conceptId: concept.id,
        style: input.request.explanationStyle,
        payload: payload.data,
        promptVersion: this.config.prompts.explanationVersion,
        model: this.config.openai.model,
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1_000).toISOString(),
        cachePolicy: "reusable-30-days",
      });
    } catch {
      throw new ApiError(
        503,
        "upstream_unavailable",
        "The explanation could not be saved safely.",
        true,
      );
    }

    return {
      conceptId: concept.id,
      style: input.request.explanationStyle,
      ...payload.data,
      cached: false,
      generatedAt: createdAt.toISOString(),
      requestId: input.requestId,
    };
  }
}
