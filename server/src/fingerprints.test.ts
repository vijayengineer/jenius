import { describe, expect, it } from "vitest";
import { createExplanationCacheKey, createRequestFingerprint } from "./fingerprints.js";

describe("one-way keys", () => {
  it("creates deterministic cache keys across all reuse dimensions", () => {
    const input = {
      conceptId: "seasons",
      style: "analogy" as const,
      contextFingerprint: "context",
      promptVersion: "v1",
      model: "gpt-test",
    };
    expect(createExplanationCacheKey(input)).toBe(createExplanationCacheKey(input));
    expect(createExplanationCacheKey({ ...input, style: "simpler" })).not.toBe(
      createExplanationCacheKey(input),
    );
  });

  it("does not expose raw network identifiers", () => {
    const fingerprint = createRequestFingerprint("salt", "203.0.113.10", "test-agent");
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(fingerprint).not.toContain("203.0.113.10");
  });
});
