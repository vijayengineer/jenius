/**
 * Jenius shared media and subject types.
 */

export type SubjectId =
  "math" | "science" | "history" | "language" | "tech" | "arts" | "mind" | "life";

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

/**
 * Media modes.
 *
 *  - `video`    — future short webm/mp4 clip (Stage 1 renders the poster UI).
 *  - `svg`      — inline vector diagram (data-only, no remote assets).
 *  - `image`    — raster still (future asset).
 *  - `text`     — no media area; the card renders text only.
 *  - `none`     — explicitly no media; useful for opting out of the media slot.
 */
export type MediaMode = "video" | "svg" | "image" | "text" | "none" | "diagram";

/**
 * MediaSlotData — the resolved media contract passed into <MediaSlot>. The
 * component never fetches anything; hosts pass fully-resolved paths and
 * fallbacks.
 */
export interface MediaSlotData {
  mode: MediaMode;
  /** Future file path (e.g. "/media/seasons.webm"). Not required to exist. */
  src?: string;
  /** Poster image path (future asset). */
  poster?: string;
  /** Short human caption shown under the media. */
  caption?: string;
  /** Alt/description for assistive tech — always required for real media. */
  alt?: string;
  /**
   * Text fallback used when the mode is `video`/`image` but a fallback is
   * requested (reduced motion, load failure, offline with no cache).
   */
  textFallback?: string;
  /** Optional aspect ratio hint (width / height). Defaults to 4/5. */
  aspectRatio?: number;
  /** Optional accent color token. */
  accent?: string;
  /** True when the future clip will ship captions/subtitles. */
  hasCaptions?: boolean;
}

/** Playback state for the video-ready MediaSlot UI. */
export type MediaPlaybackState = "poster" | "loading" | "playing" | "paused" | "failed";

export interface AnswerOptionData {
  id: string;
  label: string;
  isCorrect?: boolean;
}
