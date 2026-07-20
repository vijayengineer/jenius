import type { FeedConcept, LearningOutcome } from "@/content/schema";

export type LearningPhase =
  | "viewing"
  | "answering"
  | "teacher-feedback"
  | "misconception"
  | "retry"
  | "retry-feedback"
  | "mind-blown"
  | "completed";

export interface LearningState {
  conceptId: string | null;
  phase: LearningPhase;
  panelOpen: boolean;
  selectedOptionId: string | null;
  selectedMisconceptionId: string | null;
  primaryCorrect: boolean | null;
  retrySelectedOptionId: string | null;
  retryCorrect: boolean | null;
  completed: boolean;
  xpAwarded: number;
}

export type LearningEvent =
  | { type: "OPEN_CONCEPT"; conceptId: string }
  | { type: "REOPEN_PANEL" }
  | { type: "CLOSE_PANEL" }
  | { type: "SELECT_ANSWER"; optionId: string }
  | { type: "SUBMIT_ANSWER"; concept: FeedConcept }
  | { type: "START_RETRY" }
  | { type: "SELECT_RETRY"; optionId: string }
  | { type: "SUBMIT_RETRY"; concept: FeedConcept }
  | { type: "CONTINUE" }
  | { type: "SKIP_RETRY" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

export const initialLearningState: LearningState = {
  conceptId: null,
  phase: "viewing",
  panelOpen: false,
  selectedOptionId: null,
  selectedMisconceptionId: null,
  primaryCorrect: null,
  retrySelectedOptionId: null,
  retryCorrect: null,
  completed: false,
  xpAwarded: 0,
};

export function resolvePrimaryAnswer(concept: FeedConcept, optionId: string) {
  const option = concept.primaryQuestion.options.find((candidate) => candidate.id === optionId);
  if (!option) throw new Error(`Unknown answer option ${optionId} for ${concept.id}`);
  return {
    correct: option.isCorrect,
    misconception:
      concept.misconceptions.find((item) => item.id === option.misconceptionId) ?? null,
  };
}

export function resolveRetryAnswer(concept: FeedConcept, optionId: string): boolean {
  const option = concept.retryQuestion.options.find((candidate) => candidate.id === optionId);
  if (!option) throw new Error(`Unknown retry option ${optionId} for ${concept.id}`);
  return option.isCorrect;
}

export function learningReducer(state: LearningState, event: LearningEvent): LearningState {
  switch (event.type) {
    case "OPEN_CONCEPT":
      if (state.conceptId === event.conceptId && state.phase !== "viewing") {
        return { ...state, panelOpen: true };
      }
      return {
        ...initialLearningState,
        conceptId: event.conceptId,
        phase: "answering",
        panelOpen: true,
      };
    case "REOPEN_PANEL":
      return state.conceptId ? { ...state, panelOpen: true } : state;
    case "CLOSE_PANEL":
      return { ...state, panelOpen: false };
    case "SELECT_ANSWER":
      return state.phase === "answering" ? { ...state, selectedOptionId: event.optionId } : state;
    case "SUBMIT_ANSWER": {
      if (
        state.phase !== "answering" ||
        !state.selectedOptionId ||
        state.conceptId !== event.concept.id
      ) {
        return state;
      }
      const result = resolvePrimaryAnswer(event.concept, state.selectedOptionId);
      return {
        ...state,
        primaryCorrect: result.correct,
        selectedMisconceptionId: result.misconception?.id ?? null,
        phase: result.correct ? "teacher-feedback" : "misconception",
      };
    }
    case "START_RETRY":
      return state.phase === "misconception"
        ? {
            ...state,
            phase: "retry",
            retrySelectedOptionId: null,
            retryCorrect: null,
          }
        : state;
    case "SELECT_RETRY":
      return state.phase === "retry" ? { ...state, retrySelectedOptionId: event.optionId } : state;
    case "SUBMIT_RETRY":
      if (
        state.phase !== "retry" ||
        !state.retrySelectedOptionId ||
        state.conceptId !== event.concept.id
      ) {
        return state;
      }
      return {
        ...state,
        retryCorrect: resolveRetryAnswer(event.concept, state.retrySelectedOptionId),
        phase: "retry-feedback",
      };
    case "SKIP_RETRY":
      return state.phase === "misconception" || state.phase === "retry"
        ? { ...state, phase: "mind-blown" }
        : state;
    case "CONTINUE":
      return ["teacher-feedback", "retry-feedback"].includes(state.phase)
        ? { ...state, phase: "mind-blown" }
        : state;
    case "COMPLETE": {
      if (state.completed || state.phase !== "mind-blown") return state;
      const xpAwarded = state.primaryCorrect ? 100 : state.retryCorrect ? 75 : 50;
      return {
        ...state,
        phase: "completed",
        panelOpen: false,
        completed: true,
        xpAwarded,
      };
    }
    case "RESET":
      return initialLearningState;
  }
}

export function toLearningOutcome(state: LearningState): LearningOutcome | null {
  if (!state.conceptId) return null;
  return {
    conceptId: state.conceptId,
    completed: state.completed,
    primaryCorrect: state.primaryCorrect,
    selectedMisconceptionId: state.selectedMisconceptionId,
    retryCorrect: state.retryCorrect,
    xpAwarded: state.xpAwarded,
    understandingLevel: state.completed
      ? state.primaryCorrect
        ? 5
        : state.retryCorrect
          ? 4
          : 3
      : 0,
  };
}
