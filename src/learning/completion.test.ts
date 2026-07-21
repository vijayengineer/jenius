import { describe, expect, it } from "vitest";
import { applyLearningOutcome, createInitialLearnerState } from "@/storage/learner-state";
import { getNextCuriosityIndex, getReopenedCompletion } from "./completion";

const outcome = {
  conceptId: "seasons",
  completed: true,
  primaryCorrect: true,
  selectedMisconceptionId: null,
  retryCorrect: null,
  xpAwarded: 100,
  understandingLevel: 5,
} as const;

describe("completion presentation", () => {
  it("reopens persisted completion without presenting another XP award", () => {
    const state = applyLearningOutcome(createInitialLearnerState(), outcome);
    expect(getReopenedCompletion(state, "seasons")).toEqual({
      conceptId: "seasons",
      xpAwarded: 0,
      understandingLevel: 5,
      reopened: true,
    });
    expect(getReopenedCompletion(state, "unknown")).toBeNull();
  });

  it("advances to the next card and then the end-of-feed card predictably", () => {
    const ids = ["first", "second", "last"];
    expect(getNextCuriosityIndex(ids, "first")).toBe(1);
    expect(getNextCuriosityIndex(ids, "last")).toBe(ids.length);
    expect(getNextCuriosityIndex(ids, "missing")).toBeNull();
  });
});
