import * as React from "react";
import type { LearningState } from "@/learning/engine";
import { useMotion } from "./context";
import { getLearningMotionCues, type LearningMotionCue } from "./timeline";
import type { MotionConceptId, MotionHandle } from "./types";

export function useLearningMotionTimeline(
  learning: LearningState,
  conceptMotionId: MotionConceptId | null,
) {
  const motion = useMotion();
  const previousRef = React.useRef(learning);
  const latestRef = React.useRef(learning);
  latestRef.current = learning;

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
