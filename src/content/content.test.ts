import { describe, expect, it } from "vitest";
import { VERIFIED_CONCEPTS } from "./catalog";
import { FeedConceptSchema } from "./schema";
import { createContentReport, validateContent } from "./validation";

describe("verified content", () => {
  it("contains exactly ten valid concepts with complete coverage", () => {
    const concepts = validateContent(VERIFIED_CONCEPTS);
    const report = createContentReport(concepts);
    expect(report.conceptCount).toBe(10);
    expect(report.questionCount).toBe(20);
    expect(report.misconceptionCount).toBe(30);
    expect(report.misconceptionCoverage).toBe(1);
    expect(report.animationReadyConcepts).toEqual([
      "seasons",
      "volcanoes",
      "planes",
      "falling",
      "dna",
    ]);
  });

  it("rejects a remote media URL", () => {
    const invalid = structuredClone(VERIFIED_CONCEPTS[0]) as Record<string, unknown>;
    invalid.media = {
      ...(invalid.media as object),
      src: "https://example.com/video.webm",
    };
    expect(FeedConceptSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects duplicate concept IDs", () => {
    expect(() => validateContent([VERIFIED_CONCEPTS[0], VERIFIED_CONCEPTS[0]])).toThrow(
      /duplicate IDs/,
    );
  });

  it("rejects unknown misconception references", () => {
    const invalid = structuredClone(VERIFIED_CONCEPTS[0]);
    invalid.primaryQuestion.options[0].misconceptionId = "missing-idea";
    expect(FeedConceptSchema.safeParse(invalid).success).toBe(false);
  });
});
