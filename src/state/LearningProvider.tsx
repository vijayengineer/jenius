import * as React from "react";
import type { LearningOutcome } from "@/content/schema";
import type { CreateFormValues } from "@/lib/jenius/generatedPack";
import {
  applyLearningOutcome,
  createInitialLearnerState,
  deleteGeneratedConcept,
  failTopicRequest,
  queueTopicRequest,
  storeGeneratedConcept,
  toggleSavedConcept,
  type LearnerState,
  type SavedCollection,
  recordAttempt,
} from "@/storage/learner-state";
import { createLearningRepository, type LearningRepository } from "@/storage/repository";
import type { GeneratedConcept } from "../../shared/contracts";

interface LearningContextValue {
  state: LearnerState;
  hydrated: boolean;
  toggleSaved: (conceptId: string, collection?: SavedCollection) => void;
  complete: (outcome: LearningOutcome) => void;
  recordAttempt: (attempt: Omit<LearnerState["attempts"][number], "id" | "createdAt">) => void;
  saveTopicRequest: (values: CreateFormValues) => void;
  queueTopicRequest: (values: CreateFormValues, requestId: string) => void;
  failTopicRequest: (requestId: string, errorCategory: string) => void;
  storeGeneratedConcept: (requestId: string, concept: GeneratedConcept) => void;
  deleteGeneratedConcept: (conceptId: string) => void;
}

const LearningContext = React.createContext<LearningContextValue | null>(null);

export function LearningProvider({
  children,
  repository,
}: {
  children: React.ReactNode;
  repository?: LearningRepository;
}) {
  const repositoryRef = React.useRef(repository ?? createLearningRepository());
  const [state, setState] = React.useState(createInitialLearnerState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    repositoryRef.current
      .load()
      .then((stored) => {
        if (active) setState(stored);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = React.useCallback((producer: (current: LearnerState) => LearnerState) => {
    setState((current) => {
      const next = producer(current);
      if (next !== current) void repositoryRef.current.save(next);
      return next;
    });
  }, []);

  const value = React.useMemo<LearningContextValue>(
    () => ({
      state,
      hydrated,
      toggleSaved: (conceptId, collection) =>
        update((current) => toggleSavedConcept(current, conceptId, collection)),
      complete: (outcome) => update((current) => applyLearningOutcome(current, outcome)),
      recordAttempt: (attempt) => update((current) => recordAttempt(current, attempt)),
      saveTopicRequest: (values) =>
        update((current) => {
          const createdAt = new Date().toISOString();
          return {
            ...current,
            topicRequests: [
              {
                id: `topic-${createdAt}`,
                topic: values.topic.trim(),
                subject: values.subject,
                readingLevel: values.readingLevel,
                length: values.length,
                goal: values.goal,
                createdAt,
                status: "local-request",
              },
              ...current.topicRequests,
            ],
          };
        }),
      queueTopicRequest: (values, requestId) =>
        update((current) => queueTopicRequest(current, values, requestId)),
      failTopicRequest: (requestId, errorCategory) =>
        update((current) => failTopicRequest(current, requestId, errorCategory)),
      storeGeneratedConcept: (requestId, concept) =>
        update((current) => storeGeneratedConcept(current, requestId, concept)),
      deleteGeneratedConcept: (conceptId) =>
        update((current) => deleteGeneratedConcept(current, conceptId)),
    }),
    [hydrated, state, update],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning(): LearningContextValue {
  const value = React.useContext(LearningContext);
  if (!value) throw new Error("useLearning must be used inside LearningProvider");
  return value;
}
