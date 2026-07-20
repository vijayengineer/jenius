import { VERIFIED_CONCEPTS } from "@/content/catalog";
import type { ProgressStats } from "@/lib/jenius/progress";
import type { SavedItem } from "@/lib/jenius/savedCollections";
import type { SubjectId } from "@/lib/jenius/types";
import type { LearnerState } from "@/storage/learner-state";

const uiSubject = {
  geography: "history",
  "earth-science": "science",
  physics: "science",
  biology: "life",
} satisfies Record<string, SubjectId>;

export function selectSavedItems(state: LearnerState): SavedItem[] {
  return Object.entries(state.savedConcepts).flatMap(([conceptId, saved]) => {
    const concept = VERIFIED_CONCEPTS.find((item) => item.id === conceptId);
    if (!concept) return [];
    return [
      {
        conceptId,
        subject: uiSubject[concept.subject],
        category: concept.category,
        hook: concept.hook,
        takeaway: concept.takeaway,
        savedAtLabel: new Date(saved.savedAt).toLocaleDateString(),
        collection: saved.collection,
      },
    ];
  });
}

export function selectProgressStats(state: LearnerState): ProgressStats {
  const completedIds = Object.keys(state.completedConcepts);
  const now = new Date();
  const weekly = Array.from({ length: 7 }, (_, dayIndex) => {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - (6 - dayIndex));
    const key = date.toISOString().slice(0, 10);
    return Object.values(state.completedConcepts).filter(
      ({ completedAt }) => completedAt.slice(0, 10) === key,
    ).length;
  });
  const subjectCounts = new Map<SubjectId, number>();
  for (const id of completedIds) {
    const concept = VERIFIED_CONCEPTS.find((item) => item.id === id);
    if (concept) {
      const subject = uiSubject[concept.subject];
      subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
    }
  }
  const recentMisconceptionsFixed = state.misconceptionHistory
    .slice(-5)
    .reverse()
    .flatMap((history) => {
      const concept = VERIFIED_CONCEPTS.find((item) => item.id === history.conceptId);
      const misconception = concept?.misconceptions.find(
        (item) => item.id === history.misconceptionId,
      );
      return concept && misconception
        ? [
            {
              conceptId: concept.id,
              label: misconception.label,
              correction: misconception.feedback.correction,
            },
          ]
        : [];
    });
  const retries = state.retryOutcomes;
  return {
    xp: state.xp,
    averageUnderstanding: completedIds.length
      ? Object.values(state.completedConcepts).reduce(
          (total, item) => total + item.understandingLevel,
          0,
        ) / completedIds.length
      : 0,
    streakDays: calculateStreak(state),
    conceptsExplored: new Set(state.attempts.map(({ conceptId }) => conceptId)).size,
    conceptsUnderstood: completedIds.length,
    retrySuccessRate: retries.length
      ? retries.filter(({ correct }) => correct).length / retries.length
      : 0,
    dailyTarget: 5,
    dailyProgress: weekly[6],
    weekly,
    subjectBalance: [...subjectCounts].map(([subject, count]) => ({ subject, count })),
    recentMisconceptionsFixed,
    recentActivity: state.recentActivity.map(({ id, label, createdAt }) => ({
      id,
      label,
      createdAt,
    })),
  };
}

function calculateStreak(state: LearnerState): number {
  const days = new Set(
    Object.values(state.completedConcepts).map(({ completedAt }) => completedAt.slice(0, 10)),
  );
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
