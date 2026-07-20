import { z } from "zod";

const NonEmptyText = z.string().trim().min(1);
const StableId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const LocalAssetPath = z
  .string()
  .startsWith("/")
  .refine((value) => !value.startsWith("//"), "Media paths must be same-origin");

export const SubjectSchema = z.enum(["geography", "earth-science", "physics", "biology"]);

export const ContentMediaSchema = z
  .object({
    mode: z.enum(["video", "svg", "image", "text", "none"]),
    src: LocalAssetPath.optional(),
    poster: LocalAssetPath.optional(),
    caption: NonEmptyText.optional(),
    alt: NonEmptyText.optional(),
    textFallback: NonEmptyText.optional(),
    aspectRatio: z.number().positive().optional(),
    hasCaptions: z.boolean().optional(),
    animationReady: z.boolean().default(false),
  })
  .strict()
  .superRefine((media, ctx) => {
    if (["video", "svg", "image"].includes(media.mode) && !media.alt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alt"],
        message: "Visual media requires accessible alternative text",
      });
    }
  });

export const AnswerOptionSchema = z
  .object({
    id: StableId,
    label: NonEmptyText,
    isCorrect: z.boolean(),
    misconceptionId: StableId.optional(),
  })
  .strict();

export const QuestionSchema = z
  .object({
    id: StableId,
    prompt: NonEmptyText,
    options: z.array(AnswerOptionSchema).length(4),
  })
  .strict()
  .superRefine((question, ctx) => {
    if (question.options.filter((option) => option.isCorrect).length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "A question must contain exactly one correct option",
      });
    }
  });

export const TeacherFeedbackSchema = z
  .object({
    acknowledgement: NonEmptyText,
    whyUnderstandable: NonEmptyText,
    whyIncorrect: NonEmptyText,
    correction: NonEmptyText,
    memoryHook: NonEmptyText,
  })
  .strict();

export const MisconceptionSchema = z
  .object({
    id: StableId,
    label: NonEmptyText,
    feedback: TeacherFeedbackSchema,
  })
  .strict();

export const RetryQuestionSchema = z
  .object({
    id: StableId,
    supportiveIntro: NonEmptyText,
    prompt: NonEmptyText,
    options: z.array(AnswerOptionSchema).min(2),
    wrapUp: NonEmptyText,
  })
  .strict()
  .superRefine((question, ctx) => {
    if (question.options.filter((option) => option.isCorrect).length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "A retry question must contain exactly one correct option",
      });
    }
  });

export const MindBlownFactSchema = z
  .object({
    headline: NonEmptyText,
    detail: NonEmptyText.optional(),
  })
  .strict();

export const FeedConceptSchema = z
  .object({
    id: StableId,
    title: NonEmptyText,
    hook: NonEmptyText,
    subject: SubjectSchema,
    category: NonEmptyText,
    explanation: NonEmptyText,
    takeaway: NonEmptyText,
    memoryHook: NonEmptyText.optional(),
    media: ContentMediaSchema.optional(),
    primaryQuestion: QuestionSchema,
    correctFeedback: z
      .object({
        acknowledgement: NonEmptyText,
        explanation: NonEmptyText,
        memoryHook: NonEmptyText,
      })
      .strict(),
    misconceptions: z.array(MisconceptionSchema).min(1),
    retryQuestion: RetryQuestionSchema,
    mindBlown: MindBlownFactSchema,
    estimatedDurationSeconds: z.number().int().positive(),
    tags: z.array(NonEmptyText).min(1),
    verifiedStatus: z.literal("verified"),
  })
  .strict()
  .superRefine((concept, ctx) => {
    const misconceptionIds = new Set(concept.misconceptions.map(({ id }) => id));
    for (const [index, option] of concept.primaryQuestion.options.entries()) {
      if (option.isCorrect && option.misconceptionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primaryQuestion", "options", index, "misconceptionId"],
          message: "Correct answers cannot reference a misconception",
        });
      }
      if (!option.isCorrect && !option.misconceptionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primaryQuestion", "options", index, "misconceptionId"],
          message: "Wrong answers must reference a misconception",
        });
      } else if (option.misconceptionId && !misconceptionIds.has(option.misconceptionId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primaryQuestion", "options", index, "misconceptionId"],
          message: `Unknown misconception: ${option.misconceptionId}`,
        });
      }
    }
  });

export const LearningOutcomeSchema = z
  .object({
    conceptId: StableId,
    completed: z.boolean(),
    primaryCorrect: z.boolean().nullable(),
    selectedMisconceptionId: StableId.nullable(),
    retryCorrect: z.boolean().nullable(),
    xpAwarded: z.number().int().nonnegative(),
    understandingLevel: z.number().int().min(0).max(5),
  })
  .strict();

export type Subject = z.infer<typeof SubjectSchema>;
export type ContentMedia = z.infer<typeof ContentMediaSchema>;
export type AnswerOption = z.infer<typeof AnswerOptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type TeacherFeedback = z.infer<typeof TeacherFeedbackSchema>;
export type Misconception = z.infer<typeof MisconceptionSchema>;
export type RetryQuestion = z.infer<typeof RetryQuestionSchema>;
export type MindBlownFact = z.infer<typeof MindBlownFactSchema>;
export type FeedConcept = z.infer<typeof FeedConceptSchema>;
export type LearningOutcome = z.infer<typeof LearningOutcomeSchema>;
