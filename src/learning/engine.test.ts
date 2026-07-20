import { describe, expect, it } from "vitest";
import { VERIFIED_CONCEPTS } from "@/content/catalog";
import {
  initialLearningState,
  learningReducer,
  resolvePrimaryAnswer,
  toLearningOutcome,
  type LearningState,
} from "./engine";

const seasons = VERIFIED_CONCEPTS.find((concept) => concept.id === "seasons")!;

describe("learning engine", () => {
  it("resolves answers and matches a specific misconception", () => {
    const result = resolvePrimaryAnswer(seasons, "a");
    expect(result.correct).toBe(false);
    expect(result.misconception?.label).toBe("Distance causes the seasons");
  });

  it("covers wrong answer, misconception, retry, Mind Blown, and completion", () => {
    let state = learningReducer(initialLearningState, {
      type: "OPEN_CONCEPT",
      conceptId: seasons.id,
    });
    state = learningReducer(state, { type: "SELECT_ANSWER", optionId: "a" });
    state = learningReducer(state, { type: "SUBMIT_ANSWER", concept: seasons });
    expect(state.phase).toBe("misconception");
    expect(state.selectedMisconceptionId).toBe("seasons-a");

    state = learningReducer(state, { type: "START_RETRY" });
    state = learningReducer(state, { type: "SELECT_RETRY", optionId: "b" });
    state = learningReducer(state, { type: "SUBMIT_RETRY", concept: seasons });
    expect(state.phase).toBe("retry-feedback");
    expect(state.retryCorrect).toBe(true);

    state = learningReducer(state, { type: "CONTINUE" });
    expect(state.phase).toBe("mind-blown");
    state = learningReducer(state, { type: "COMPLETE" });
    expect(state.phase).toBe("completed");
    expect(state.xpAwarded).toBe(75);
    expect(toLearningOutcome(state)?.understandingLevel).toBe(4);
  });

  it("does not award XP twice", () => {
    let state: LearningState = {
      ...initialLearningState,
      conceptId: seasons.id,
      phase: "mind-blown" as const,
      primaryCorrect: true,
    };
    state = learningReducer(state, { type: "COMPLETE" });
    expect(state.xpAwarded).toBe(100);
    expect(learningReducer(state, { type: "COMPLETE" })).toEqual(state);
  });

  it("preserves progress when the panel closes unexpectedly", () => {
    const answering = learningReducer(
      learningReducer(initialLearningState, {
        type: "OPEN_CONCEPT",
        conceptId: seasons.id,
      }),
      { type: "SELECT_ANSWER", optionId: "a" },
    );
    const closed = learningReducer(answering, { type: "CLOSE_PANEL" });
    const reopened = learningReducer(closed, { type: "REOPEN_PANEL" });
    expect(reopened.selectedOptionId).toBe("a");
    expect(reopened.phase).toBe("answering");
    expect(reopened.panelOpen).toBe(true);
  });
});
