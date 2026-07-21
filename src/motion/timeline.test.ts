import { describe, expect, it } from "vitest";
import { VERIFIED_CONCEPTS } from "@/content/catalog";
import { initialLearningState, learningReducer, type LearningState } from "@/learning/engine";
import { getLearningMotionCues } from "./timeline";

const seasons = VERIFIED_CONCEPTS.find(({ id }) => id === "seasons")!;
const correctPrimary = seasons.primaryQuestion.options.find(({ isCorrect }) => isCorrect)!;
const wrongPrimary = seasons.primaryQuestion.options.find(({ isCorrect }) => !isCorrect)!;
const correctRetry = seasons.retryQuestion.options.find(({ isCorrect }) => isCorrect)!;
const wrongRetry = seasons.retryQuestion.options.find(({ isCorrect }) => !isCorrect)!;

function transition(state: LearningState, event: Parameters<typeof learningReducer>[1]) {
  const next = learningReducer(state, event);
  return { next, cues: getLearningMotionCues(state, next, "seasons") };
}

describe("learning motion timeline", () => {
  it("synchronizes the direct-success path with real reducer transitions", () => {
    let result = transition(initialLearningState, {
      type: "OPEN_CONCEPT",
      conceptId: seasons.id,
    });
    expect(result.cues).toEqual(["curiosity"]);

    const state = learningReducer(result.next, {
      type: "SELECT_ANSWER",
      optionId: correctPrimary.id,
    });
    result = transition(state, { type: "SUBMIT_ANSWER", concept: seasons });
    expect(result.cues).toEqual(["success"]);

    result = transition(result.next, { type: "CONTINUE" });
    expect(result.cues).toEqual(["transition"]);
    result = transition(result.next, { type: "COMPLETE" });
    expect(result.cues).toEqual(["completion"]);
  });

  it("plays misconception before the concept cinematic on a wrong answer", () => {
    let state = learningReducer(initialLearningState, {
      type: "OPEN_CONCEPT",
      conceptId: seasons.id,
    });
    state = learningReducer(state, { type: "SELECT_ANSWER", optionId: wrongPrimary.id });
    const result = transition(state, { type: "SUBMIT_ANSWER", concept: seasons });
    expect(result.cues).toEqual(["misunderstanding", { conceptId: "seasons" }]);
  });

  it("uses success only for a correct retry", () => {
    const retryState: LearningState = {
      ...initialLearningState,
      conceptId: seasons.id,
      phase: "retry",
      panelOpen: true,
      primaryCorrect: false,
    };
    let selected = learningReducer(retryState, {
      type: "SELECT_RETRY",
      optionId: correctRetry.id,
    });
    expect(transition(selected, { type: "SUBMIT_RETRY", concept: seasons }).cues).toEqual([
      "success",
    ]);

    selected = learningReducer(retryState, {
      type: "SELECT_RETRY",
      optionId: wrongRetry.id,
    });
    expect(transition(selected, { type: "SUBMIT_RETRY", concept: seasons }).cues).toEqual([
      "misunderstanding",
      { conceptId: "seasons" },
    ]);
  });

  it("does not replay completion or create cues for selection-only updates", () => {
    const answering = learningReducer(initialLearningState, {
      type: "OPEN_CONCEPT",
      conceptId: seasons.id,
    });
    const selected = learningReducer(answering, {
      type: "SELECT_ANSWER",
      optionId: correctPrimary.id,
    });
    expect(getLearningMotionCues(answering, selected, "seasons")).toEqual([]);

    const completed: LearningState = {
      ...selected,
      phase: "completed",
      completed: true,
      panelOpen: false,
    };
    expect(getLearningMotionCues(completed, completed, "seasons")).toEqual([]);
  });
});
