import { describe, expect, it } from "vitest";
import { getLessonProgress } from "./progress";

describe("lesson progress", () => {
  it.each([
    ["viewing", "learn"],
    ["answering", "challenge"],
    ["teacher-feedback", "understand"],
    ["misconception", "understand"],
    ["retry", "retry"],
    ["retry-feedback", "retry"],
    ["mind-blown", "mind-blown"],
    ["completed", "complete"],
  ] as const)("maps %s to %s", (phase, expected) => {
    expect(getLessonProgress(phase).current.id).toBe(expected);
  });

  it("does not present retry on a correct path", () => {
    const progress = getLessonProgress("teacher-feedback");
    expect(progress.steps.map(({ id }) => id)).not.toContain("retry");
    expect(progress.accessibleText).toBe("Lesson progress: Understand, step 3 of 5");
  });

  it("adds retry only when the learning state requires it", () => {
    const progress = getLessonProgress("misconception", { retryRequired: true });
    expect(progress.steps.map(({ id }) => id)).toEqual([
      "learn",
      "challenge",
      "understand",
      "retry",
      "mind-blown",
      "complete",
    ]);
    expect(progress.accessibleText).toBe("Lesson progress: Understand, step 3 of 6");
  });
});
