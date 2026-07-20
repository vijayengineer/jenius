import { describe, expect, it, vi } from "vitest";
import { GeneratedConceptSchema, type GeneratedConcept } from "../../shared/contracts";
import { validGeneratedConceptDraft } from "../../server/src/test-fixtures";
import { createJeniusApiClient } from "@/api/client";
import { getVerifiedConcept } from "@/content/catalog";
import {
  createInitialLearnerState,
  failTopicRequest,
  queueTopicRequest,
  storeGeneratedConcept,
} from "@/storage/learner-state";
import { createMemoryLearningRepository } from "@/storage/repository";

const values = {
  topic: "Rainbows",
  subject: "physics",
  readingLevel: "11-14",
  length: "standard",
  goal: "basics",
} as const;

function generatedConcept(): GeneratedConcept {
  const draft = validGeneratedConceptDraft();
  const options = draft.primaryQuestion.options.map((option) => {
    if (option.misconceptionId === null) {
      const { misconceptionId: _removed, ...rest } = option;
      return rest;
    }
    return option;
  });
  return GeneratedConceptSchema.parse({
    ...draft,
    primaryQuestion: { ...draft.primaryQuestion, options },
    id: "generated-rainbows-1234abcd",
    generatedStatus: "ai-generated",
    contentLabel: "AI-generated",
    generatedAt: "2026-07-20T12:00:00.000Z",
  });
}

describe("optional AI integration", () => {
  it("validates API success, persists it, and keeps the AI-generated label", async () => {
    const concept = generatedConcept();
    const client = createJeniusApiClient({
      baseUrl: "https://api.jns.fun",
      isOnline: () => true,
      fetch: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ concept, requestId: "server-request" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    });
    const response = await client.generate({
      topic: values.topic,
      learnerLevel: values.readingLevel,
    });
    let state = queueTopicRequest(createInitialLearnerState(), values, "topic-request");
    state = storeGeneratedConcept(state, "topic-request", response.concept);
    const repository = createMemoryLearningRepository();
    await repository.save(state);
    const persisted = await repository.load();

    expect(persisted.generatedConcepts[0]).toMatchObject({
      id: concept.id,
      generatedStatus: "ai-generated",
      contentLabel: "AI-generated",
    });
    expect(persisted.topicRequests[0]).toMatchObject({
      status: "generated",
      generatedConceptId: concept.id,
    });
  });

  it("retains a failed generation request for retry", async () => {
    const client = createJeniusApiClient({
      baseUrl: "https://api.jns.fun",
      isOnline: () => true,
      fetch: vi.fn().mockRejectedValue(new TypeError("network unavailable")),
    });
    let state = queueTopicRequest(createInitialLearnerState(), values, "topic-request");
    await expect(client.generate({ topic: values.topic })).rejects.toMatchObject({
      category: "network",
    });
    state = failTopicRequest(state, "topic-request", "network");
    expect(state.topicRequests[0]).toMatchObject({
      topic: "Rainbows",
      status: "failed",
      errorCategory: "network",
    });
  });

  it("leaves the deterministic lesson usable when explaining fails", async () => {
    const before = structuredClone(getVerifiedConcept("seasons"));
    const client = createJeniusApiClient({
      baseUrl: "https://api.jns.fun",
      isOnline: () => true,
      fetch: vi.fn().mockRejectedValue(new TypeError("backend stopped")),
    });
    await expect(
      client.explain({ conceptId: "seasons", explanationStyle: "example" }),
    ).rejects.toMatchObject({ category: "network" });
    expect(getVerifiedConcept("seasons")).toEqual(before);
    expect(getVerifiedConcept("seasons")?.verifiedStatus).toBe("verified");
  });
});
