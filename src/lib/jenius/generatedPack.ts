import type { SubjectId } from "./types";

/**
 * Concept-generation states for the Create tab. Frontend-only for now —
 * a future Node API will drive real transitions.
 */
export type GenerationStatus =
  | "disabled" // form incomplete
  | "ready" // form valid, not yet submitted
  | "submitting" // click acknowledged, request being made
  | "generating" // long-running work in progress
  | "success" // pack ready
  | "rate-limit" // too many generations
  | "network-error" // transient failure
  | "offline"; // browser is offline

export type SubjectChoice = "science" | "geography" | "biology" | "physics" | "general";

export const SUBJECT_CHOICES: Array<{ id: SubjectChoice; label: string }> = [
  { id: "science", label: "Science" },
  { id: "geography", label: "Geography" },
  { id: "biology", label: "Biology" },
  { id: "physics", label: "Physics" },
  { id: "general", label: "General curiosity" },
];

export type ReadingLevel = "8-10" | "11-14" | "15-18" | "adult";

export const READING_LEVELS: Array<{ id: ReadingLevel; label: string }> = [
  { id: "8-10", label: "8–10" },
  { id: "11-14", label: "11–14" },
  { id: "15-18", label: "15–18" },
  { id: "adult", label: "Adult" },
];

export type LengthChoice = "quick" | "standard";

export const LENGTH_CHOICES: Array<{
  id: LengthChoice;
  label: string;
  hint: string;
}> = [
  { id: "quick", label: "Quick", hint: "~30 seconds" },
  { id: "standard", label: "Standard", hint: "~2 minutes" },
];

export type LearningGoal = "basics" | "misconception" | "test" | "";

export const LEARNING_GOALS: Array<{ id: LearningGoal; label: string }> = [
  { id: "", label: "No specific goal" },
  { id: "basics", label: "Understand the basics" },
  { id: "misconception", label: "Correct a misconception" },
  { id: "test", label: "Prepare for a test" },
];

export interface CreateFormValues {
  topic: string;
  subject: SubjectChoice | "";
  readingLevel: ReadingLevel | "";
  length: LengthChoice | "";
  goal: LearningGoal;
}

export const EMPTY_CREATE_FORM: CreateFormValues = {
  topic: "",
  subject: "",
  readingLevel: "",
  length: "",
  goal: "",
};

export function isFormReady(v: CreateFormValues): boolean {
  return v.topic.trim().length >= 2 && !!v.subject && !!v.readingLevel && !!v.length;
}

export interface GenerationStep {
  id: string;
  label: string;
}

export const GENERATION_STEPS: GenerationStep[] = [
  { id: "find", label: "Finding the key idea" },
  { id: "explain", label: "Building the explanation" },
  { id: "challenge", label: "Creating a challenge" },
  { id: "misconception", label: "Mapping misconceptions" },
  { id: "cards", label: "Preparing your Jenius cards" },
];

export interface GeneratedConceptPack {
  id: string;
  topic: string;
  subject: SubjectId;
  categoryLabel: string;
  hook: string;
  explanation: string;
  challenge: {
    prompt: string;
    options: Array<{ id: string; label: string }>;
    correctOptionId: string;
  };
  misconception: {
    label: string;
    whyUnderstandable: string;
    correction: string;
  };
  mindBlown: { headline: string; detail?: string };
  createdAtLabel: string;
}

export const SAMPLE_BLACK_HOLES_PACK: GeneratedConceptPack = {
  id: "draft-black-holes",
  topic: "Black holes",
  subject: "science",
  categoryLabel: "Physics",
  hook: "What actually is a black hole?",
  explanation:
    "A black hole is a region of space where gravity is so strong that not even light can escape once it crosses a boundary called the event horizon. They usually form when massive stars collapse under their own weight. From outside, you don't see the hole itself — you see the light being bent around it.",
  challenge: {
    prompt: "What's at the edge of a black hole called?",
    options: [
      { id: "a", label: "The gravity wall" },
      { id: "b", label: "The event horizon" },
      { id: "c", label: "The photon shell" },
      { id: "d", label: "The dark rim" },
    ],
    correctOptionId: "b",
  },
  misconception: {
    label: "Black holes suck everything in like vacuums",
    whyUnderstandable:
      "Movies show black holes as cosmic drains, so it feels like they must pull in anything nearby.",
    correction:
      "Black holes only have strong gravity up close. From far enough away, orbiting one is just like orbiting a star of the same mass.",
  },
  mindBlown: {
    headline: "If the Sun suddenly became a black hole, Earth's orbit would barely change.",
    detail: "It would just get very dark and very cold.",
  },
  createdAtLabel: "Just now",
};
