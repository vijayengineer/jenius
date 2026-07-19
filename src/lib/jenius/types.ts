/**
 * Jenius — shared types for the mock design-system layer.
 * A separate Codex workflow will replace mock data with real feed/API types.
 */

export type SubjectId =
  | "math"
  | "science"
  | "history"
  | "language"
  | "tech"
  | "arts"
  | "mind"
  | "life";

export interface Subject {
  id: SubjectId;
  label: string;
  /** CSS color token name, e.g. "subject-math" → text-subject-math */
  colorToken: `subject-${SubjectId}`;
}

export const SUBJECTS: Record<SubjectId, Subject> = {
  math: { id: "math", label: "Math", colorToken: "subject-math" },
  science: { id: "science", label: "Science", colorToken: "subject-science" },
  history: { id: "history", label: "History", colorToken: "subject-history" },
  language: { id: "language", label: "Language", colorToken: "subject-language" },
  tech: { id: "tech", label: "Tech", colorToken: "subject-tech" },
  arts: { id: "arts", label: "Arts", colorToken: "subject-arts" },
  mind: { id: "mind", label: "Mind", colorToken: "subject-mind" },
  life: { id: "life", label: "Life", colorToken: "subject-life" },
};

export type MediaMode = "video" | "diagram" | "image" | "text";

export interface MediaSlotData {
  mode: MediaMode;
  /** Placeholder-only for Stage 1. No remote URLs. */
  src?: string;
  alt?: string;
  /** Optional aspect ratio hint (width / height). Defaults to 4/5. */
  aspectRatio?: number;
  /** Optional accent color token for text-only cards. */
  accent?: string;
}

export interface AnswerOptionData {
  id: string;
  label: string;
  isCorrect?: boolean;
}
