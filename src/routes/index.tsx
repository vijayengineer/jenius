import { createFileRoute } from "@tanstack/react-router";
import { DiscoverFeed } from "@/components/jenius/DiscoverFeed";

export const Route = createFileRoute("/")({
  component: FeedIndex,
});

function FeedIndex() {
  return <DiscoverFeed />;
}
