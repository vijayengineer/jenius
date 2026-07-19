import { createFileRoute } from "@tanstack/react-router";
import { SavedScreen } from "@/components/jenius/SavedScreen";
import { TabShell, useActiveTab } from "@/components/jenius/TabShell";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved — Jenius" },
      {
        name: "description",
        content: "Your Mind Blown moments and the ideas that finally clicked.",
      },
      { property: "og:title", content: "Saved — Jenius" },
      {
        property: "og:description",
        content: "Your Mind Blown moments and the ideas that finally clicked.",
      },
    ],
  }),
  component: SavedRoute,
});

function SavedRoute() {
  const active = useActiveTab();
  return (
    <TabShell active={active}>
      <SavedScreen />
    </TabShell>
  );
}
