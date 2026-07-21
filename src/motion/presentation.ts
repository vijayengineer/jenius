import type { LearningPhase, LearningState } from "@/learning/engine";
import type { InterfaceMotionCue } from "./useLearningMotionTimeline";
import type { MotionPlaybackResult } from "./types";

export type MotionReveal = "feedback-correct" | "feedback-incorrect" | "completion" | null;

export function getMotionReveal(cue: InterfaceMotionCue, phase: LearningPhase): MotionReveal {
  if (cue === "success" && phase === "teacher-feedback") return "feedback-correct";
  if (cue === "misunderstanding" && phase === "misconception") return "feedback-incorrect";
  if (cue === "completion" && phase === "completed") return "completion";
  return null;
}

export function getMotionRevealForState(cue: InterfaceMotionCue, learning: LearningState) {
  return getMotionReveal(cue, learning.phase);
}

export function shouldRevealAfterMotion(result: MotionPlaybackResult) {
  return result !== "interrupted";
}
