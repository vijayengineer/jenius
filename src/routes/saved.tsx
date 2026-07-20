import { createFileRoute } from "@tanstack/react-router";
import { SavedScreen } from "@/components/jenius/SavedScreen";
import { TabShell, useActiveTab } from "@/components/jenius/TabShell";
import { useOffline } from "@/lib/jenius/offline";
import { useLearning } from "@/state/LearningProvider";
import { selectSavedItems } from "@/state/selectors";

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
  const { state, toggleSaved } = useLearning();
  const { online } = useOffline();
  return (
    <TabShell active={active}>
      <SavedScreen
        items={selectSavedItems(state)}
        offline={!online}
        onRemove={(conceptId) => toggleSaved(conceptId)}
      />
    </TabShell>
  );
}
