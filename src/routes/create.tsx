import { createFileRoute } from "@tanstack/react-router";
import { CreateScreen } from "@/components/jenius/CreateScreen";
import { TabShell, useActiveTab } from "@/components/jenius/TabShell";
import * as React from "react";
import { useOffline } from "@/lib/jenius/offline";
import { RemoteTopicGenerationService } from "@/services/topic-generation";
import { useLearning } from "@/state/LearningProvider";
import { createJeniusApiClient, JeniusApiError } from "@/api/client";
import {
  toGeneratedConceptPack,
  type CreateFormValues,
  type GeneratedConceptPack,
  type GenerationStatus,
} from "@/lib/jenius/generatedPack";
import type { RetainedTopicRequest } from "@/components/jenius/CreateScreen";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create — Jenius" },
      {
        name: "description",
        content: "Turn a topic into a short Jenius learning sequence.",
      },
      { property: "og:title", content: "Create — Jenius" },
      {
        property: "og:description",
        content: "Turn a topic into a short Jenius learning sequence.",
      },
    ],
  }),
  component: CreateRoute,
});

function CreateRoute() {
  const active = useActiveTab();
  const { online } = useOffline();
  const {
    state,
    queueTopicRequest,
    failTopicRequest,
    storeGeneratedConcept,
    deleteGeneratedConcept,
  } = useLearning();
  const [status, setStatus] = React.useState<GenerationStatus | undefined>();
  const [error, setError] = React.useState<string>();
  const [pack, setPack] = React.useState<GeneratedConceptPack | null>(null);
  const service = React.useMemo(
    () => new RemoteTopicGenerationService(createJeniusApiClient()),
    [],
  );
  const personalPacks = React.useMemo(
    () => state.generatedConcepts.map(toGeneratedConceptPack),
    [state.generatedConcepts],
  );
  const retryableRequests = React.useMemo<RetainedTopicRequest[]>(
    () =>
      state.topicRequests
        .filter((request) => request.status === "failed")
        .map((request) => ({
          id: request.id,
          values: {
            topic: request.topic,
            subject: request.subject,
            readingLevel: request.readingLevel,
            length: request.length,
            goal: request.goal,
          },
        })),
    [state.topicRequests],
  );

  const generate = async (values: CreateFormValues, retainedRequestId?: string) => {
    const requestId =
      retainedRequestId ??
      `topic-${
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : new Date().toISOString()
      }`;
    queueTopicRequest(values, requestId);
    setPack(null);
    setError(undefined);
    if (!online) {
      failTopicRequest(requestId, "offline");
      setStatus("offline");
      setError("You're offline. The request is saved on this device for retry.");
      return;
    }
    setStatus("generating");
    try {
      const result = await service.request(values);
      if (result.status !== "generated" || !result.concept) {
        throw new Error("Generation did not return a concept");
      }
      storeGeneratedConcept(requestId, result.concept);
      const generatedPack = toGeneratedConceptPack(result.concept);
      setPack(generatedPack);
      setStatus("success");
    } catch (caught) {
      const category = caught instanceof JeniusApiError ? caught.category : "network";
      failTopicRequest(requestId, category);
      setStatus(
        category === "offline"
          ? "offline"
          : category === "rate-limit"
            ? "rate-limit"
            : "network-error",
      );
      setError(
        `${
          caught instanceof Error ? caught.message : "Jenius couldn't generate that lesson."
        } Your request is saved on this device for retry.`,
      );
    }
  };

  return (
    <TabShell active={active}>
      <CreateScreen
        online={online}
        generationStatus={status}
        generatedPack={pack}
        personalPacks={personalPacks}
        retryableRequests={retryableRequests}
        error={error}
        onOpenPersonal={(selected) => {
          setPack(selected);
          setStatus("success");
        }}
        onDelete={(selected) => {
          deleteGeneratedConcept(selected.id);
          setPack(null);
          setStatus(undefined);
        }}
        onSave={() => {}}
        onRetryRequest={(request) => void generate(request.values, request.id)}
        onGenerate={(values) => void generate(values)}
      />
    </TabShell>
  );
}
