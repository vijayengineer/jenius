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
      "deserts",
      "planes",
      "falling",
      "sky-blue",
      "dna",
      "leaves",
      "vaccines",
      "yawning",
    ]);
    expect(concepts.every((concept) => concept.media?.mode === "video")).toBe(true);
    expect(new Set(concepts.map(({ id }) => id)).size).toBe(10);
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

  it.each([
    [
      "an empty required field",
      (value: (typeof VERIFIED_CONCEPTS)[number]) => {
        value.explanation = "";
      },
    ],
    [
      "a missing Mind Blown fact",
      (value: (typeof VERIFIED_CONCEPTS)[number]) => {
        value.mindBlown.headline = "";
      },
    ],
    [
      "fewer than four answers",
      (value: (typeof VERIFIED_CONCEPTS)[number]) => {
        value.primaryQuestion.options.pop();
      },
    ],
    [
      "multiple correct answers",
      (value: (typeof VERIFIED_CONCEPTS)[number]) => {
        value.primaryQuestion.options[0].isCorrect = true;
        value.primaryQuestion.options[1].isCorrect = true;
      },
    ],
    [
      "an incomplete retry",
      (value: (typeof VERIFIED_CONCEPTS)[number]) => {
        value.retryQuestion.wrapUp = "";
      },
    ],
  ])("rejects %s", (_label, mutate) => {
    const invalid = structuredClone(VERIFIED_CONCEPTS[0]);
    mutate(invalid);
    expect(FeedConceptSchema.safeParse(invalid).success).toBe(false);
  });
});
