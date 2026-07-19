import type { SubjectId } from "./types";

/**
 * Personal progress stats. Framed as curiosity and discovery, never as
 * accuracy shame or ranking. Consumers should treat these as read-only
 * mock data during Stage 1.
 */
export interface ProgressStats {
  /** Current curiosity streak in days. */
  streakDays: number;
  conceptsExplored: number;
  conceptsUnderstood: number;
  /** 0..1 — how often retries land the correct idea. */
  retrySuccessRate: number;
  /** Today's discovery target (e.g. 5 concepts). */
  dailyTarget: number;
  /** Today's discoveries so far. */
  dailyProgress: number;
  /** Last 7 days of concept views, oldest → newest. */
  weekly: number[];
  /** Rough spread of subjects the learner has explored. */
  subjectBalance: Array<{ subject: SubjectId; count: number }>;
  /** Named misconceptions the learner has recently corrected. */
  recentMisconceptionsFixed: Array<{
    conceptId: string;
    label: string;
    correction: string;
  }>;
}

export const MOCK_PROGRESS_ACTIVE: ProgressStats = {
  streakDays: 6,
  conceptsExplored: 47,
  conceptsUnderstood: 34,
  retrySuccessRate: 0.72,
  dailyTarget: 5,
  dailyProgress: 3,
  weekly: [2, 4, 3, 6, 5, 4, 3],
  subjectBalance: [
    { subject: "science", count: 18 },
    { subject: "life", count: 12 },
    { subject: "tech", count: 8 },
    { subject: "history", count: 5 },
    { subject: "math", count: 4 },
  ],
  recentMisconceptionsFixed: [
    {
      conceptId: "seasons",
      label: "Distance causes the seasons",
      correction: "It's the axis tilt, not distance, that decides which hemisphere warms.",
    },
    {
      conceptId: "falling",
      label: "Heavier objects fall faster",
      correction: "In a vacuum, all masses fall at the same rate.",
    },
    {
      conceptId: "yawning",
      label: "Yawns fix an oxygen shortage",
      correction: "Yawning looks more like a brain-cooling reset than an oxygen top-up.",
    },
  ],
};

export const MOCK_PROGRESS_NEW: ProgressStats = {
  streakDays: 0,
  conceptsExplored: 0,
  conceptsUnderstood: 0,
  retrySuccessRate: 0,
  dailyTarget: 5,
  dailyProgress: 0,
  weekly: [0, 0, 0, 0, 0, 0, 0],
  subjectBalance: [],
  recentMisconceptionsFixed: [],
};

export const MOCK_PROGRESS_SEVEN_DAY: ProgressStats = {
  ...MOCK_PROGRESS_ACTIVE,
  streakDays: 7,
  weekly: [3, 5, 4, 6, 5, 7, 4],
  dailyProgress: 5,
};
