/**
 * Jenius — challenge data & types.
 *
 * Visual components MUST NOT decide correctness. They receive
 * `resolvedOptionStates` from this module (or from a real backend later).
 * `resolveChallenge` here is a demo-only helper.
 */

export type SubmissionState =
  | "idle"
  | "submitting"
  | "submitted"
  | "error";

export type ResolvedOptionState =
  | "unanswered" // pre-submit
  | "correct"    // post-submit, this is the correct answer
  | "incorrect"  // post-submit, learner picked this and it was wrong
  | "locked";    // post-submit, another option (not chosen, not correct)

export interface ChallengeOption {
  id: string;
  label: string;
}

export interface Challenge {
  /** Concept id this challenge belongs to. */
  conceptId: string;
  prompt: string;
  options: ChallengeOption[];
  /** Kept out of props: presenter only ever sees `resolvedOptionStates`. */
  correctOptionId: string;
}

export const CHALLENGES: Record<string, Challenge> = {
  seasons: {
    conceptId: "seasons",
    prompt: "What mainly causes summer in the Northern Hemisphere?",
    options: [
      { id: "a", label: "Earth is much closer to the Sun" },
      { id: "b", label: "The Northern Hemisphere tilts towards the Sun" },
      { id: "c", label: "The Sun becomes hotter" },
      { id: "d", label: "Earth rotates more slowly" },
    ],
    correctOptionId: "b",
  },
  volcanoes: {
    conceptId: "volcanoes",
    prompt: "What most directly drives magma up through a volcano?",
    options: [
      { id: "a", label: "The Moon's gravity pulling on rock" },
      { id: "b", label: "Rain seeping down and heating up" },
      { id: "c", label: "Pressure from hot gases and lighter magma rising" },
      { id: "d", label: "Earth spinning faster near the equator" },
    ],
    correctOptionId: "c",
  },
  deserts: {
    conceptId: "deserts",
    prompt: "Which condition is most essential for a desert to form?",
    options: [
      { id: "a", label: "Very high daytime temperatures" },
      { id: "b", label: "Very little rainfall reaching the ground" },
      { id: "c", label: "Sandy soil that cannot hold water" },
      { id: "d", label: "Being far from any ocean" },
    ],
    correctOptionId: "b",
  },
  planes: {
    conceptId: "planes",
    prompt: "What generates the lift that holds a plane up?",
    options: [
      { id: "a", label: "The engines blowing air downward" },
      { id: "b", label: "Hot air trapped inside the fuselage" },
      { id: "c", label: "Wings pushing air down as they cut through it" },
      { id: "d", label: "Earth's magnetic field pushing on the metal" },
    ],
    correctOptionId: "c",
  },
  falling: {
    conceptId: "falling",
    prompt:
      "In a vacuum, what happens when a heavy ball and a light ball are dropped together?",
    options: [
      { id: "a", label: "The heavy ball falls much faster" },
      { id: "b", label: "The light ball falls much faster" },
      { id: "c", label: "They accelerate at the same rate" },
      { id: "d", label: "Neither falls without air" },
    ],
    correctOptionId: "c",
  },
  "sky-blue": {
    conceptId: "sky-blue",
    prompt: "Why does the daytime sky look blue to us?",
    options: [
      { id: "a", label: "The ocean reflects its colour upward" },
      { id: "b", label: "Air molecules scatter blue light more than others" },
      { id: "c", label: "The Sun mainly emits blue light" },
      { id: "d", label: "Our eyes can only see blue in bright light" },
    ],
    correctOptionId: "b",
  },
  dna: {
    conceptId: "dna",
    prompt: "What is DNA's main job inside a cell?",
    options: [
      { id: "a", label: "To give the cell its shape and colour" },
      { id: "b", label: "To store instructions for building proteins" },
      { id: "c", label: "To supply the cell with energy" },
      { id: "d", label: "To fight off invading germs directly" },
    ],
    correctOptionId: "b",
  },
  leaves: {
    conceptId: "leaves",
    prompt: "Why do many leaves turn yellow or orange in autumn?",
    options: [
      { id: "a", label: "Cold air paints new pigments into the leaves" },
      { id: "b", label: "Trees pull green sap out and refill with orange" },
      { id: "c", label: "Chlorophyll fades, revealing colours that were already there" },
      { id: "d", label: "The Sun bleaches the green out of them" },
    ],
    correctOptionId: "c",
  },
  vaccines: {
    conceptId: "vaccines",
    prompt: "How do vaccines protect you from a real infection?",
    options: [
      { id: "a", label: "They kill any germ that touches your skin" },
      { id: "b", label: "They give your immune system a safe practice run" },
      { id: "c", label: "They replace your blood with cleaner blood" },
      { id: "d", label: "They warm your body up to burn germs off" },
    ],
    correctOptionId: "b",
  },
  yawning: {
    conceptId: "yawning",
    prompt: "What is a leading scientific idea for why we yawn?",
    options: [
      { id: "a", label: "It refills our lungs with fresh oxygen we badly need" },
      { id: "b", label: "It stretches the throat to help us speak" },
      { id: "c", label: "It helps cool the brain down" },
      { id: "d", label: "It resets our sense of balance" },
    ],
    correctOptionId: "c",
  },
};

/**
 * Demo-only helper. In the real app this lives on the server and the
 * presenter component only ever receives `resolvedOptionStates`.
 */
export function resolveChallenge(
  challenge: Challenge,
  selectedOptionId: string,
): Record<string, ResolvedOptionState> {
  const out: Record<string, ResolvedOptionState> = {};
  for (const opt of challenge.options) {
    if (opt.id === challenge.correctOptionId) out[opt.id] = "correct";
    else if (opt.id === selectedOptionId) out[opt.id] = "incorrect";
    else out[opt.id] = "locked";
  }
  return out;
}
