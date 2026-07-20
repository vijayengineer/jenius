import { createHash } from "node:crypto";
import {
  GeneratedConceptSchema,
  type GenerateRequest,
  type GenerateResponse,
  type GeneratedConcept,
} from "../../../shared/contracts.js";
import type { ServerConfig } from "../config.js";
import { ApiError } from "../errors.js";
import { createGenerationRequestFingerprint, normalizeTopic } from "../fingerprints.js";
import type { StructuredModelGateway } from "../model/gateway.js";
import { GENERATED_CONCEPT_JSON_SCHEMA } from "../model/schema.js";
import { buildGenerationPrompt, buildRepairPrompt } from "../prompts/generation.js";
import type { JeniusRepository } from "../repositories/types.js";
import { assertSafeGenerateRequest, containsPromptLeakage } from "../safety.js";
import { consumeUsageOrThrow, mapModelError } from "./common.js";

export interface GenerationServiceInput {
  request: GenerateRequest;
  requestId: string;
  requestFingerprint: string;
}

function stableGeneratedId(topic: string, raw: unknown): string {
  const slug =
    topic
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 36) || "lesson";
  const hash = createHash("sha256")
    .update(`${normalizeTopic(topic)}\u0000${JSON.stringify(raw)}`)
    .digest("hex")
    .slice(0, 12);
  return `generated-${slug}-${hash}`;
}

function normalizeModelConcept(raw: unknown, topic: string, generatedAt: string): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const candidate = structuredClone(raw) as Record<string, unknown>;
  if (candidate.memoryHook === null || candidate.memoryHook === "") delete candidate.memoryHook;
  if (
    candidate.mindBlown &&
    typeof candidate.mindBlown === "object" &&
    "detail" in candidate.mindBlown &&
    (candidate.mindBlown.detail === null || candidate.mindBlown.detail === "")
  ) {
    delete candidate.mindBlown.detail;
  }
  if (
    candidate.primaryQuestion &&
    typeof candidate.primaryQuestion === "object" &&
    "options" in candidate.primaryQuestion &&
    Array.isArray(candidate.primaryQuestion.options)
  ) {
    candidate.primaryQuestion.options = candidate.primaryQuestion.options.map((option) => {
      if (
        option &&
        typeof option === "object" &&
        "misconceptionId" in option &&
        option.misconceptionId === null
      ) {
        const copy = { ...option };
        delete copy.misconceptionId;
        return copy;
      }
      return option;
    });
  }
  return {
    ...candidate,
    id: stableGeneratedId(topic, candidate),
    generatedStatus: "ai-generated",
    contentLabel: "AI-generated",
    generatedAt,
  };
}

function validationSummary(result: ReturnType<typeof GeneratedConceptSchema.safeParse>): string {
  if (result.success) return "";
  return result.error.issues
    .slice(0, 12)
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

export class GenerationService {
  constructor(
    private readonly config: ServerConfig,
    private readonly repository: JeniusRepository,
    private readonly model: StructuredModelGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async generate(input: GenerationServiceInput): Promise<GenerateResponse> {
    if (!this.config.configurationReady) {
      throw new ApiError(
        503,
        "not_configured",
        "Personal lesson generation is not configured.",
        false,
      );
    }
    assertSafeGenerateRequest(input.request);
    await consumeUsageOrThrow(() =>
      this.repository.consumeUsage({
        fingerprint: input.requestFingerprint,
        kind: "generate",
        day: this.now().toISOString().slice(0, 10),
        limit: this.config.usage.dailyGenerateLimit,
      }),
    );

    const prompt = buildGenerationPrompt(input.request);
    const generatedAt = this.now().toISOString();
    let raw = await this.callModel({
      ...prompt,
      safetyIdentifier: input.requestFingerprint,
    });
    let parsed = GeneratedConceptSchema.safeParse(
      normalizeModelConcept(raw, input.request.topic, generatedAt),
    );

    if (!parsed.success || containsPromptLeakage(parsed.data)) {
      const repair = buildRepairPrompt(
        input.request,
        raw,
        parsed.success
          ? "Lesson content referenced hidden prompts or internal instructions"
          : validationSummary(parsed),
      );
      raw = await this.callModel({
        ...repair,
        safetyIdentifier: input.requestFingerprint,
      });
      parsed = GeneratedConceptSchema.safeParse(
        normalizeModelConcept(raw, input.request.topic, generatedAt),
      );
    }
    if (!parsed.success || containsPromptLeakage(parsed.data)) {
      throw new ApiError(
        502,
        "validation_failed",
        "The generated lesson did not pass Jenius validation.",
        true,
      );
    }

    const concept: GeneratedConcept = parsed.data;
    const normalizedTopic = normalizeTopic(input.request.topic);
    try {
      await this.repository.saveGeneratedConcept({
        generatedConceptId: concept.id,
        normalizedTopic,
        payload: concept,
        promptVersion: this.config.prompts.generationVersion,
        model: this.config.openai.model,
        createdAt: concept.generatedAt,
        requestFingerprint: createGenerationRequestFingerprint(
          this.config.usage.hashSalt,
          input.requestFingerprint,
          normalizedTopic,
        ),
      });
    } catch {
      throw new ApiError(
        503,
        "upstream_unavailable",
        "The generated lesson could not be saved safely.",
        true,
      );
    }
    return { concept, requestId: input.requestId };
  }

  private async callModel(input: {
    instructions: string;
    input: string;
    safetyIdentifier: string;
  }): Promise<unknown> {
    try {
      return await this.model.complete({
        name: "jenius_generated_concept",
        instructions: input.instructions,
        input: input.input,
        schema: GENERATED_CONCEPT_JSON_SCHEMA,
        maxOutputTokens: 2_600,
        safetyIdentifier: input.safetyIdentifier,
      });
    } catch (error) {
      mapModelError(error);
    }
  }
}
