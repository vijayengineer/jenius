import { describe, expect, it } from "vitest";
import { getVerifiedConcept } from "@/content/catalog";
import {
  initialLearningState,
  learningReducer,
  toLearningOutcome,
  type LearningEvent,
} from "./engine";
import { applyLearningOutcome, createInitialLearnerState } from "@/storage/learner-state";

describe("complete learning flow", () => {
  it("persists wrong answer → misconception → correct retry → Mind Blown → completion", () => {
    const concept = getVerifiedConcept("seasons")!;
    let learning = initialLearningState;
    const send = (event: LearningEvent) => {
      learning = learningReducer(learning, event);
    };

    send({ type: "OPEN_CONCEPT", conceptId: concept.id });
    send({ type: "SELECT_ANSWER", optionId: "a" });
    send({ type: "SUBMIT_ANSWER", concept });
    expect(learning.phase).toBe("misconception");
    expect(learning.selectedMisconceptionId).toBe("seasons-a");

    send({ type: "START_RETRY" });
    send({ type: "SELECT_RETRY", optionId: "b" });
    send({ type: "SUBMIT_RETRY", concept });
    expect(learning.retryCorrect).toBe(true);

    send({ type: "CONTINUE" });
    expect(learning.phase).toBe("mind-blown");
    send({ type: "COMPLETE" });

    const outcome = toLearningOutcome(learning)!;
    const persisted = applyLearningOutcome(createInitialLearnerState(), outcome);
    expect(persisted.xp).toBe(75);
    expect(persisted.completedConcepts.seasons.understandingLevel).toBe(4);
    expect(persisted.misconceptionHistory[0].misconceptionId).toBe("seasons-a");
    expect(persisted.retryOutcomes[0].correct).toBe(true);
  });
});
