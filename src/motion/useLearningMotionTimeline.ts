import * as React from "react";
import type { LearningState } from "@/learning/engine";
import { useMotion } from "./context";
import { shouldRevealAfterMotion } from "./presentation";
import { getLearningMotionCues, type LearningMotionCue } from "./timeline";
import type { MotionConceptId, MotionHandle } from "./types";

export type InterfaceMotionCue = Exclude<LearningMotionCue, { conceptId: MotionConceptId }>;

interface LearningMotionTimelineOptions {
  onInterfaceMotionSettled?: (cue: InterfaceMotionCue, learning: LearningState) => void;
}

export function useLearningMotionTimeline(
  learning: LearningState,
  conceptMotionId: MotionConceptId | null,
  options: LearningMotionTimelineOptions = {},
) {
  const motion = useMotion();
  const previousRef = React.useRef(learning);
  const latestRef = React.useRef(learning);
  const settledRef = React.useRef(options.onInterfaceMotionSettled);
  latestRef.current = learning;
  settledRef.current = options.onInterfaceMotionSettled;

  React.useEffect(() => {
    const previous = previousRef.current;
    const current = latestRef.current;
    previousRef.current = current;
    const cues = getLearningMotionCues(previous, current, conceptMotionId);
    let active = true;
    let handle: MotionHandle | null = null;

    const play = (cue: LearningMotionCue) => {
      if (typeof cue === "object") return motion.playConcept(cue.conceptId);
      if (cue === "curiosity") return motion.playCuriosity();
      if (cue === "transition") return motion.playTransition();
      if (cue === "misunderstanding") return motion.playMisunderstanding();
      if (cue === "success") return motion.playSuccess();
      return motion.playCompletion();
    };

    const run = async () => {
      for (const cue of cues) {
        if (!active) return;
        handle = play(cue);
        const result = await handle.finished;
        if (!active) return;
        if (shouldRevealAfterMotion(result) && typeof cue === "string") {
          settledRef.current?.(cue, latestRef.current);
        }
        if (result !== "completed" || !latestRef.current.panelOpen) return;
      }
    };
    void run();

    return () => {
      active = false;
      handle?.cancel();
    };
  }, [
    conceptMotionId,
    learning.completed,
    learning.panelOpen,
    learning.phase,
    learning.primaryCorrect,
    learning.retryCorrect,
    motion,
  ]);
}
