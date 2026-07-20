import { createFileRoute } from "@tanstack/react-router";
import { MeScreen } from "@/components/jenius/MeScreen";
import { TabShell, useActiveTab } from "@/components/jenius/TabShell";
import { useLearning } from "@/state/LearningProvider";
import { selectProgressStats } from "@/state/selectors";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "You — Jenius" },
      {
        name: "description",
        content: "Your quiet curiosity dashboard: discoveries, streaks and misconceptions fixed.",
      },
      { property: "og:title", content: "You — Jenius" },
      {
        property: "og:description",
        content: "Your quiet curiosity dashboard: discoveries, streaks and misconceptions fixed.",
      },
    ],
  }),
  component: MeRoute,
});

function MeRoute() {
  const active = useActiveTab();
  const { state } = useLearning();
  return (
    <TabShell active={active}>
      <MeScreen stats={selectProgressStats(state)} />
    </TabShell>
  );
}
