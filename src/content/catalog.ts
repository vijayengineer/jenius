import { CHALLENGES, CHALLENGE_FEEDBACK } from "@/lib/jenius/challenges";
import { MOCK_CONCEPTS } from "@/lib/jenius/mockConcepts";
import type { MediaSlotData, SubjectId } from "@/lib/jenius/types";
import { type FeedConcept, type Subject } from "./schema";
import { validateContent } from "./validation";

const subjectByConcept: Record<string, Subject> = {
  seasons: "earth-science",
  volcanoes: "earth-science",
  deserts: "geography",
  planes: "physics",
  falling: "physics",
  "sky-blue": "physics",
  dna: "biology",
  leaves: "biology",
  vaccines: "biology",
  yawning: "biology",
};

const titleByConcept: Record<string, string> = {
  seasons: "Why do seasons exist?",
  volcanoes: "Why do volcanoes erupt?",
  deserts: "Why do deserts form?",
  planes: "How do planes fly?",
  falling: "Why do heavy and light objects fall together?",
  "sky-blue": "Why is the sky blue?",
  dna: "What is DNA?",
  leaves: "Why do leaves change colour?",
  vaccines: "How do vaccines train the immune system?",
  yawning: "Why do we yawn?",
};

const uiSubjectBySubject: Record<Subject, SubjectId> = {
  geography: "history",
  "earth-science": "science",
  physics: "science",
  biology: "life",
};

const legacyMediaToContent = (media: MediaSlotData | undefined, animationReady?: boolean) => {
  if (!media) return undefined;
  const mode = media.mode === "diagram" ? "svg" : media.mode;
  return {
    mode,
    src: media.src,
    poster: media.poster,
    caption: media.caption,
    alt: media.alt,
    textFallback: media.textFallback,
    aspectRatio: media.aspectRatio,
    hasCaptions: media.hasCaptions,
    animationReady: Boolean(animationReady),
  };
};

const rawConcepts = MOCK_CONCEPTS.map((concept) => {
  const question = CHALLENGES[concept.id];
  const feedback = CHALLENGE_FEEDBACK[concept.id];
  if (!question || !feedback) {
    throw new Error(`Verified concept ${concept.id} is missing challenge content`);
  }

  const misconceptionIdByOption = Object.fromEntries(
    Object.values(feedback.incorrect).map((item) => [
      item.optionId,
      `${concept.id}-${item.optionId}`,
    ]),
  );

  return {
    id: concept.id,
    title: titleByConcept[concept.id] ?? concept.hook,
    hook: concept.hook,
    subject: subjectByConcept[concept.id],
    category: concept.category,
    explanation: concept.explanation,
    takeaway: concept.takeaway,
    memoryHook: feedback.correct.memoryHook,
    media: legacyMediaToContent(concept.media, concept.animationReady),
    primaryQuestion: {
      id: `${concept.id}-question`,
      prompt: question.prompt,
      options: question.options.map((option) => ({
        id: option.id,
        label: option.label,
        isCorrect: option.id === question.correctOptionId,
        misconceptionId:
          option.id === question.correctOptionId ? undefined : misconceptionIdByOption[option.id],
      })),
    },
    correctFeedback: feedback.correct,
    misconceptions: Object.values(feedback.incorrect).map((item) => ({
      id: misconceptionIdByOption[item.optionId],
      label: item.misconceptionLabel,
      feedback: {
        acknowledgement: item.acknowledgement,
        whyUnderstandable: item.whyUnderstandable,
        whyIncorrect: item.whyIncorrect,
        correction: item.correctiveStatement,
        memoryHook: item.memoryHook,
      },
    })),
    retryQuestion: {
      id: feedback.retry.id,
      supportiveIntro: feedback.retry.supportiveIntro,
      prompt: feedback.retry.prompt,
      options: feedback.retry.options.map((option) => ({
        id: option.id,
        label: option.label,
        isCorrect: option.id === feedback.retry.correctOptionId,
      })),
      wrapUp: feedback.retry.wrapUp,
    },
    mindBlown: feedback.mindBlown,
    estimatedDurationSeconds: concept.readingSeconds + 45,
    tags: [concept.category.toLowerCase().replaceAll(" ", "-"), subjectByConcept[concept.id]],
    verifiedStatus: "verified" as const,
  };
});

export const VERIFIED_CONCEPTS: FeedConcept[] = validateContent(rawConcepts);

export function getVerifiedConcept(id: string): FeedConcept | undefined {
  return VERIFIED_CONCEPTS.find((concept) => concept.id === id);
}

/** Adapter for the stable Lovable presenter contract. */
export const FEED_CONCEPTS = VERIFIED_CONCEPTS.map((concept) => ({
  id: concept.id,
  subject: uiSubjectBySubject[concept.subject],
  category:
    concept.subject === "earth-science"
      ? "Earth Science"
      : concept.subject[0].toUpperCase() + concept.subject.slice(1),
  hook: concept.hook,
  explanation: concept.explanation,
  takeaway: concept.takeaway,
  readingSeconds: Math.max(15, concept.estimatedDurationSeconds - 45),
  animationReady: concept.media?.animationReady,
  media: concept.media
    ? {
        mode: concept.media.mode,
        src: concept.media.src,
        poster: concept.media.poster,
        caption: concept.media.caption,
        alt: concept.media.alt,
        textFallback: concept.media.textFallback,
        aspectRatio: concept.media.aspectRatio,
        hasCaptions: concept.media.hasCaptions,
      }
    : undefined,
}));
