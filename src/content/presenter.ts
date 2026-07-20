import type { Challenge, ChallengeFeedback, OptionFeedback } from "@/lib/jenius/challenges";
import { VERIFIED_CONCEPTS } from "./catalog";

export const CONTENT_CHALLENGES: Record<string, Challenge> = Object.fromEntries(
  VERIFIED_CONCEPTS.map((concept) => [
    concept.id,
    {
      conceptId: concept.id,
      prompt: concept.primaryQuestion.prompt,
      options: concept.primaryQuestion.options.map(({ id, label }) => ({ id, label })),
      correctOptionId: concept.primaryQuestion.options.find((option) => option.isCorrect)!.id,
    },
  ]),
);

export const CONTENT_FEEDBACK: Record<string, ChallengeFeedback> = Object.fromEntries(
  VERIFIED_CONCEPTS.map((concept) => {
    const misconceptionById = Object.fromEntries(
      concept.misconceptions.map((misconception) => [misconception.id, misconception]),
    );
    const incorrect = Object.fromEntries(
      concept.primaryQuestion.options
        .filter((option) => !option.isCorrect && option.misconceptionId)
        .map((option) => {
          const misconception = misconceptionById[option.misconceptionId!];
          const feedback: OptionFeedback = {
            optionId: option.id,
            misconceptionLabel: misconception.label,
            acknowledgement: misconception.feedback.acknowledgement,
            whyUnderstandable: misconception.feedback.whyUnderstandable,
            whyIncorrect: misconception.feedback.whyIncorrect,
            correctiveStatement: misconception.feedback.correction,
            memoryHook: misconception.feedback.memoryHook,
            retryQuestionId: concept.retryQuestion.id,
          };
          return [option.id, feedback];
        }),
    );
    const retryCorrect = concept.retryQuestion.options.find((option) => option.isCorrect)!;
    return [
      concept.id,
      {
        correct: concept.correctFeedback,
        incorrect,
        retry: {
          id: concept.retryQuestion.id,
          supportiveIntro: concept.retryQuestion.supportiveIntro,
          prompt: concept.retryQuestion.prompt,
          options: concept.retryQuestion.options.map(({ id, label }) => ({ id, label })),
          correctOptionId: retryCorrect.id,
          wrapUp: concept.retryQuestion.wrapUp,
        },
        mindBlown: concept.mindBlown,
      },
    ];
  }),
);
