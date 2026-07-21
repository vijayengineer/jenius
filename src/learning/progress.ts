import type { LearningPhase } from "./engine";

export type LessonProgressStepId =
  "learn" | "challenge" | "understand" | "retry" | "mind-blown" | "complete";

export interface LessonProgressStep {
  id: LessonProgressStepId;
  label: string;
}

export interface LessonProgressModel {
  steps: LessonProgressStep[];
  current: LessonProgressStep;
  currentIndex: number;
  accessibleText: string;
}

const BASE_STEPS: LessonProgressStep[] = [
  { id: "learn", label: "Learn" },
  { id: "challenge", label: "Challenge" },
  { id: "understand", label: "Understand" },
  { id: "mind-blown", label: "Mind Blown" },
  { id: "complete", label: "Complete" },
];

const STEP_BY_PHASE: Record<LearningPhase, LessonProgressStepId> = {
  viewing: "learn",
  answering: "challenge",
  "teacher-feedback": "understand",
  misconception: "understand",
  retry: "retry",
  "retry-feedback": "retry",
  "mind-blown": "mind-blown",
  completed: "complete",
};

export function getLessonProgress(
  phase: LearningPhase,
  { retryRequired = false }: { retryRequired?: boolean } = {},
): LessonProgressModel {
  const includeRetry = retryRequired || phase === "retry" || phase === "retry-feedback";
  const steps = includeRetry
    ? [...BASE_STEPS.slice(0, 3), { id: "retry" as const, label: "Retry" }, ...BASE_STEPS.slice(3)]
    : BASE_STEPS;
  const currentId = STEP_BY_PHASE[phase];
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentId),
  );
  const current = steps[currentIndex];

  return {
    steps,
    current,
    currentIndex,
    accessibleText: `Lesson progress: ${current.label}, step ${currentIndex + 1} of ${steps.length}`,
  };
}
