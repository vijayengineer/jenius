import { z } from "zod";

const Text = z.string().trim().min(1);
const MobileText = Text.max(700);
const StableId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const ExplanationStyleSchema = z.enum([
  "simpler",
  "analogy",
  "visual",
  "example",
  "concise",
]);

export const ExplainRequestSchema = z
  .object({
    conceptId: StableId.max(80),
    explanationStyle: ExplanationStyleSchema,
    misconceptionId: StableId.max(100).optional(),
    learnerContextId: z
      .string()
      .regex(/^[a-zA-Z0-9_-]{1,100}$/)
      .optional(),
    previousExplanationFingerprint: z
      .string()
      .regex(/^[a-f0-9]{16,64}$/)
      .optional(),
  })
  .strict();

export const ExplanationPayloadSchema = z
  .object({
    explanation: MobileText.max(520),
    memoryHook: MobileText.max(180),
    miniExample: MobileText.max(260).optional(),
  })
  .strict();

export const ExplainResponseSchema = ExplanationPayloadSchema.extend({
  conceptId: StableId,
  style: ExplanationStyleSchema,
  cached: z.boolean(),
  generatedAt: z.string().datetime(),
  requestId: z.string().min(1).max(128),
}).strict();

export const LearnerLevelSchema = z.enum(["8-10", "11-14", "15-18", "adult"]);
export const PreferredStyleSchema = z.enum([
  "balanced",
  "simpler",
  "analogy",
  "visual",
  "example",
  "concise",
]);

export const GenerateRequestSchema = z
  .object({
    topic: z.string().trim().min(2).max(80),
    learnerLevel: LearnerLevelSchema.optional(),
    reasonForLearning: z.string().trim().min(2).max(180).optional(),
    preferredStyle: PreferredStyleSchema.optional(),
  })
  .strict();

export const GeneratedSubjectSchema = z.enum([
  "geography",
  "earth-science",
  "physics",
  "biology",
  "general",
]);

export const GeneratedAnswerOptionSchema = z
  .object({
    id: StableId,
    label: Text.max(180),
    isCorrect: z.boolean(),
    misconceptionId: StableId.optional(),
  })
  .strict();

export const GeneratedQuestionSchema = z
  .object({
    id: StableId,
    prompt: Text.max(280),
    options: z.array(GeneratedAnswerOptionSchema).length(4),
  })
  .strict()
  .superRefine((question, context) => {
    if (question.options.filter((option) => option.isCorrect).length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Exactly one primary option must be correct",
      });
    }
    if (new Set(question.options.map((option) => option.id)).size !== 4) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Primary option IDs must be unique",
      });
    }
  });

export const GeneratedMisconceptionSchema = z
  .object({
    id: StableId,
    label: Text.max(160),
    feedback: z
      .object({
        acknowledgement: Text.max(180),
        whyUnderstandable: Text.max(260),
        whyIncorrect: Text.max(300),
        correction: Text.max(300),
        memoryHook: Text.max(180),
      })
      .strict(),
  })
  .strict();

export const GeneratedRetryQuestionSchema = z
  .object({
    id: StableId,
    supportiveIntro: Text.max(180),
    prompt: Text.max(280),
    options: z
      .array(GeneratedAnswerOptionSchema.omit({ misconceptionId: true }))
      .min(2)
      .max(4),
    wrapUp: Text.max(280),
  })
  .strict()
  .superRefine((question, context) => {
    if (question.options.filter((option) => option.isCorrect).length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Exactly one retry option must be correct",
      });
    }
    if (new Set(question.options.map((option) => option.id)).size !== question.options.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Retry option IDs must be unique",
      });
    }
  });

export const GeneratedConceptSchema = z
  .object({
    id: StableId,
    title: Text.max(120),
    hook: Text.max(180),
    subject: GeneratedSubjectSchema,
    category: Text.max(60),
    explanation: MobileText,
    takeaway: Text.max(180),
    memoryHook: Text.max(180).optional(),
    primaryQuestion: GeneratedQuestionSchema,
    correctFeedback: z
      .object({
        acknowledgement: Text.max(180),
        explanation: Text.max(300),
        memoryHook: Text.max(180),
      })
      .strict(),
    misconceptions: z.array(GeneratedMisconceptionSchema).length(3),
    retryQuestion: GeneratedRetryQuestionSchema,
    mindBlown: z
      .object({
        headline: Text.max(220),
        detail: Text.max(320).optional(),
      })
      .strict(),
    estimatedDurationSeconds: z.number().int().min(30).max(600),
    tags: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
    generatedStatus: z.literal("ai-generated"),
    contentLabel: z.literal("AI-generated"),
    generatedAt: z.string().datetime(),
  })
  .strict()
  .superRefine((concept, context) => {
    const misconceptionIds = new Set(concept.misconceptions.map((item) => item.id));
    for (const [index, option] of concept.primaryQuestion.options.entries()) {
      if (option.isCorrect && option.misconceptionId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primaryQuestion", "options", index, "misconceptionId"],
          message: "A correct option cannot reference a misconception",
        });
      } else if (!option.isCorrect && !option.misconceptionId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primaryQuestion", "options", index, "misconceptionId"],
          message: "Each wrong option must reference a misconception",
        });
      } else if (option.misconceptionId && !misconceptionIds.has(option.misconceptionId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["primaryQuestion", "options", index, "misconceptionId"],
          message: "An option references an unknown misconception",
        });
      }
    }
    const referenced = new Set(
      concept.primaryQuestion.options.flatMap((option) =>
        option.misconceptionId ? [option.misconceptionId] : [],
      ),
    );
    if (
      referenced.size !== misconceptionIds.size ||
      [...misconceptionIds].some((id) => !referenced.has(id))
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["misconceptions"],
        message: "Every misconception must map to exactly one wrong primary option",
      });
    }
  });

export const GenerateResponseSchema = z
  .object({
    concept: GeneratedConceptSchema,
    requestId: z.string().min(1).max(128),
  })
  .strict();

export const ApiErrorResponseSchema = z
  .object({
    error: z
      .object({
        code: z.enum([
          "bad_request",
          "not_found",
          "offline",
          "not_configured",
          "rate_limited",
          "timeout",
          "upstream_unavailable",
          "validation_failed",
          "internal_error",
        ]),
        message: z.string().min(1).max(240),
        requestId: z.string().min(1).max(128),
        retryable: z.boolean(),
      })
      .strict(),
  })
  .strict();

export type ExplanationStyle = z.infer<typeof ExplanationStyleSchema>;
export type ExplainRequest = z.infer<typeof ExplainRequestSchema>;
export type ExplanationPayload = z.infer<typeof ExplanationPayloadSchema>;
export type ExplainResponse = z.infer<typeof ExplainResponseSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type GeneratedConcept = z.infer<typeof GeneratedConceptSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
