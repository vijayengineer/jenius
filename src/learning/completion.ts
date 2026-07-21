import type { LearnerState } from "@/storage/learner-state";

export interface ReopenedCompletion {
  conceptId: string;
  xpAwarded: 0;
  understandingLevel: number;
  reopened: true;
}

/** Resolves a completed-concept reopen without implying a second XP award. */
export function getReopenedCompletion(
  state: LearnerState,
  conceptId: string,
): ReopenedCompletion | null {
  const completed = state.completedConcepts[conceptId];
  if (!completed) return null;
  return {
    conceptId,
    xpAwarded: 0,
    understandingLevel: completed.understandingLevel,
    reopened: true,
  };
}

/** Returns a feed-card index, including the end card after the final concept. */
export function getNextCuriosityIndex(conceptIds: string[], completedConceptId: string) {
  const currentIndex = conceptIds.indexOf(completedConceptId);
  return currentIndex < 0 ? null : currentIndex + 1;
}

export function getFeedScrollBehavior(reducedMotion: boolean): ScrollBehavior {
  return reducedMotion ? "auto" : "smooth";
}
