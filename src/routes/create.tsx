import { createFileRoute } from "@tanstack/react-router";
import { CreateScreen } from "@/components/jenius/CreateScreen";
import { TabShell, useActiveTab } from "@/components/jenius/TabShell";
import * as React from "react";
import { useOffline } from "@/lib/jenius/offline";
import { LocalTopicGenerationService } from "@/services/topic-generation";
import { useLearning } from "@/state/LearningProvider";

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
  const { saveTopicRequest } = useLearning();
  const [requestStored, setRequestStored] = React.useState(false);
  const service = React.useMemo(
    () => new LocalTopicGenerationService(saveTopicRequest),
    [saveTopicRequest],
  );
  return (
    <TabShell active={active}>
      <CreateScreen
        online={online}
        localOnly
        requestStored={requestStored}
        onGenerate={(values) => {
          void service.request(values).then(() => {
            setRequestStored(true);
          });
        }}
      />
    </TabShell>
  );
}
