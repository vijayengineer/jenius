import { describe, expect, it } from "vitest";
import {
  applyLearningOutcome,
  createInitialLearnerState,
  deserializeLearnerState,
  toggleSavedConcept,
} from "./learner-state";
import { createMemoryLearningRepository } from "./repository";

const completion = {
  conceptId: "seasons",
  completed: true,
  primaryCorrect: false,
  selectedMisconceptionId: "seasons-a",
  retryCorrect: true,
  xpAwarded: 75,
  understandingLevel: 4,
} as const;

describe("learner state", () => {
  it("saves and unsaves a concept", () => {
    const saved = toggleSavedConcept(createInitialLearnerState(), "seasons");
    expect(saved.savedConcepts.seasons).toBeDefined();
    expect(toggleSavedConcept(saved, "seasons").savedConcepts.seasons).toBeUndefined();
  });

  it("prevents duplicate XP and stores understanding", () => {
    const first = applyLearningOutcome(createInitialLearnerState(), completion);
    const duplicate = applyLearningOutcome(first, completion);
    expect(first.xp).toBe(75);
    expect(first.completedConcepts.seasons.understandingLevel).toBe(4);
    expect(duplicate).toBe(first);
  });

  it("serializes through the repository", async () => {
    const repository = createMemoryLearningRepository();
    const state = applyLearningOutcome(createInitialLearnerState(), completion);
    await repository.save(state);
    expect(await repository.load()).toEqual(state);
  });

  it("gracefully resets unknown persistence versions", () => {
    expect(deserializeLearnerState({ version: 99 })).toEqual(createInitialLearnerState());
  });
});
