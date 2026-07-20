import { z } from "zod";
import type { LearningOutcome } from "@/content/schema";
import { GeneratedConceptSchema, type GeneratedConcept } from "../../shared/contracts";
import type { CreateFormValues } from "@/lib/jenius/generatedPack";

const SavedCollectionSchema = z.enum(["mind-blown", "finally-get-it"]);
const TopicRequestStatusSchema = z.enum(["local-request", "pending", "failed", "generated"]);

const TopicRequestSchema = z.object({
  id: z.string(),
  topic: z.string(),
  subject: z.string(),
  readingLevel: z.string(),
  length: z.string(),
  goal: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  status: TopicRequestStatusSchema,
  errorCategory: z.string().optional(),
  generatedConceptId: z.string().optional(),
});

const LearnerStateV1Schema = z.object({
  version: z.literal(1),
  completedConcepts: z.record(
    z.object({
      completedAt: z.string(),
      xpAwarded: z.number().int().nonnegative(),
      understandingLevel: z.number().int().min(0).max(5),
    }),
  ),
  savedConcepts: z.record(
    z.object({
      collection: SavedCollectionSchema,
      savedAt: z.string(),
    }),
  ),
  attempts: z.array(
    z.object({
      id: z.string(),
      conceptId: z.string(),
      kind: z.enum(["primary", "retry"]),
      optionId: z.string(),
      correct: z.boolean(),
      createdAt: z.string(),
    }),
  ),
  misconceptionHistory: z.array(
    z.object({
      conceptId: z.string(),
      misconceptionId: z.string(),
      createdAt: z.string(),
    }),
  ),
  retryOutcomes: z.array(
    z.object({
      conceptId: z.string(),
      correct: z.boolean(),
      createdAt: z.string(),
    }),
  ),
  xp: z.number().int().nonnegative(),
  recentActivity: z.array(
    z.object({
      id: z.string(),
      conceptId: z.string().optional(),
      label: z.string(),
      createdAt: z.string(),
    }),
  ),
  reviews: z.record(
    z.object({
      dueAt: z.string(),
      intervalDays: z.number().int().positive(),
    }),
  ),
  topicRequests: z.array(TopicRequestSchema),
  generatedConcepts: z.array(GeneratedConceptSchema).default([]),
});

export type LearnerState = z.infer<typeof LearnerStateV1Schema>;
export type SavedCollection = z.infer<typeof SavedCollectionSchema>;

export function createInitialLearnerState(): LearnerState {
  return {
    version: 1,
    completedConcepts: {},
    savedConcepts: {},
    attempts: [],
    misconceptionHistory: [],
    retryOutcomes: [],
    xp: 0,
    recentActivity: [],
    reviews: {},
    topicRequests: [],
    generatedConcepts: [],
  };
}

export function deserializeLearnerState(value: unknown): LearnerState {
  const parsed = LearnerStateV1Schema.safeParse(value);
  return parsed.success ? parsed.data : createInitialLearnerState();
}

export function toggleSavedConcept(
  state: LearnerState,
  conceptId: string,
  collection: SavedCollection = "mind-blown",
  now = new Date(),
): LearnerState {
  const savedConcepts = { ...state.savedConcepts };
  if (savedConcepts[conceptId]) {
    delete savedConcepts[conceptId];
  } else {
    savedConcepts[conceptId] = { collection, savedAt: now.toISOString() };
  }
  return { ...state, savedConcepts };
}

export function applyLearningOutcome(
  state: LearnerState,
  outcome: LearningOutcome,
  now = new Date(),
): LearnerState {
  if (!outcome.completed || state.completedConcepts[outcome.conceptId]) return state;
  const createdAt = now.toISOString();
  const next: LearnerState = {
    ...state,
    completedConcepts: {
      ...state.completedConcepts,
      [outcome.conceptId]: {
        completedAt: createdAt,
        xpAwarded: outcome.xpAwarded,
        understandingLevel: outcome.understandingLevel,
      },
    },
    xp: state.xp + outcome.xpAwarded,
    recentActivity: [
      {
        id: `complete-${outcome.conceptId}-${createdAt}`,
        conceptId: outcome.conceptId,
        label: "Completed a concept",
        createdAt,
      },
      ...state.recentActivity,
    ].slice(0, 30),
    reviews: {
      ...state.reviews,
      [outcome.conceptId]: {
        dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        intervalDays: 1,
      },
    },
  };
  if (outcome.selectedMisconceptionId) {
    next.misconceptionHistory = [
      ...next.misconceptionHistory,
      {
        conceptId: outcome.conceptId,
        misconceptionId: outcome.selectedMisconceptionId,
        createdAt,
      },
    ];
  }
  if (outcome.retryCorrect !== null) {
    next.retryOutcomes = [
      ...next.retryOutcomes,
      {
        conceptId: outcome.conceptId,
        correct: outcome.retryCorrect,
        createdAt,
      },
    ];
  }
  return next;
}

export function recordAttempt(
  state: LearnerState,
  attempt: Omit<LearnerState["attempts"][number], "id" | "createdAt">,
  now = new Date(),
): LearnerState {
  const createdAt = now.toISOString();
  return {
    ...state,
    attempts: [
      ...state.attempts,
      { ...attempt, id: `${attempt.conceptId}-${attempt.kind}-${createdAt}`, createdAt },
    ],
  };
}

export function queueTopicRequest(
  state: LearnerState,
  values: CreateFormValues,
  requestId: string,
  now = new Date(),
): LearnerState {
  const createdAt = now.toISOString();
  return {
    ...state,
    topicRequests: [
      {
        id: requestId,
        topic: values.topic.trim(),
        subject: values.subject,
        readingLevel: values.readingLevel,
        length: values.length,
        goal: values.goal,
        createdAt,
        updatedAt: createdAt,
        status: "pending",
      },
      ...state.topicRequests.filter((request) => request.id !== requestId),
    ],
  };
}

export function failTopicRequest(
  state: LearnerState,
  requestId: string,
  errorCategory: string,
  now = new Date(),
): LearnerState {
  return {
    ...state,
    topicRequests: state.topicRequests.map((request) =>
      request.id === requestId
        ? {
            ...request,
            status: "failed" as const,
            errorCategory,
            updatedAt: now.toISOString(),
          }
        : request,
    ),
  };
}

export function storeGeneratedConcept(
  state: LearnerState,
  requestId: string,
  concept: GeneratedConcept,
  now = new Date(),
): LearnerState {
  const validated = GeneratedConceptSchema.parse(concept);
  return {
    ...state,
    generatedConcepts: [
      validated,
      ...state.generatedConcepts.filter((item) => item.id !== validated.id),
    ],
    topicRequests: state.topicRequests.map((request) =>
      request.id === requestId
        ? {
            ...request,
            status: "generated" as const,
            generatedConceptId: validated.id,
            errorCategory: undefined,
            updatedAt: now.toISOString(),
          }
        : request,
    ),
  };
}

export function deleteGeneratedConcept(state: LearnerState, conceptId: string): LearnerState {
  return {
    ...state,
    generatedConcepts: state.generatedConcepts.filter((concept) => concept.id !== conceptId),
    topicRequests: state.topicRequests.filter(
      (request) => request.generatedConceptId !== conceptId,
    ),
  };
}
