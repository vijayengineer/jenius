import { createFileRoute } from "@tanstack/react-router";
import { CreateScreen } from "@/components/jenius/CreateScreen";
import { TabShell, useActiveTab } from "@/components/jenius/TabShell";

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
  return (
    <TabShell active={active}>
      <CreateScreen />
    </TabShell>
  );
}
