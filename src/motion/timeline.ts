import type { LearningState } from "@/learning/engine";
import type { MotionConceptId } from "./types";

export type LearningMotionCue =
  | "curiosity"
  | "transition"
  | "misunderstanding"
  | "success"
  | "completion"
  | { conceptId: MotionConceptId };

export function getLearningMotionCues(
  previous: LearningState,
  current: LearningState,
  conceptMotionId: MotionConceptId | null,
): LearningMotionCue[] {
  if (previous.phase !== "completed" && current.phase === "completed") return ["completion"];
  if (!previous.panelOpen && current.panelOpen && current.phase === "answering") {
    return ["curiosity"];
  }
  if (previous.phase === current.phase) return [];

  switch (current.phase) {
    case "teacher-feedback":
      return ["success"];
    case "misconception":
      return conceptMotionId
        ? ["misunderstanding", { conceptId: conceptMotionId }]
        : ["misunderstanding"];
    case "retry-feedback":
      if (current.retryCorrect) return ["success"];
      return conceptMotionId
        ? ["misunderstanding", { conceptId: conceptMotionId }]
        : ["misunderstanding"];
    case "mind-blown":
      return ["transition"];
    default:
      return [];
  }
}
