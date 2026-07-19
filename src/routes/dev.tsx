import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { DiscoverFeed } from "@/components/jenius/DiscoverFeed";
import { CreateScreen } from "@/components/jenius/CreateScreen";
import { SavedScreen } from "@/components/jenius/SavedScreen";
import { MeScreen } from "@/components/jenius/MeScreen";
import { MediaSlot } from "@/components/jenius/MediaSlot";
import { ExplainMoreSheet } from "@/components/jenius/ExplainMoreSheet";
import { ErrorState } from "@/components/jenius/ErrorState";
import { EmptyState } from "@/components/jenius/EmptyState";
import { OfflineBanner } from "@/components/jenius/OfflineBanner";
import { LoadingState } from "@/components/jenius/LoadingState";
import { MOCK_CONCEPTS } from "@/lib/jenius/mockConcepts";
import { EXPLAIN_PACKS } from "@/lib/jenius/explainMore";
import { MOCK_PROGRESS_ACTIVE, MOCK_PROGRESS_NEW } from "@/lib/jenius/progress";
import { MOCK_SAVED_ITEMS } from "@/lib/jenius/savedCollections";
import { SAMPLE_BLACK_HOLES_PACK } from "@/lib/jenius/generatedPack";

import { useOffline } from "@/lib/jenius/offline";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dev")({
  head: () => ({
    meta: [
      { title: "Jenius — State preview" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DevPreview,
});

interface StateEntry {
  id: string;
  group: string;
  label: string;
  render: () => React.ReactNode;
}

function DevPreview() {
  const [activeId, setActiveId] = React.useState<string>("feed-text");
  const ctx = useOffline();

  const STATES: StateEntry[] = [
    {
      id: "feed-text",
      group: "Feed",
      label: "Text-only concept",
      render: () => (
        <DiscoverFeed concepts={MOCK_CONCEPTS.filter((c) => !c.media)} />
      ),
    },
    {
      id: "feed-media",
      group: "Feed",
      label: "Media (video-ready) concept",
      render: () => (
        <DiscoverFeed concepts={MOCK_CONCEPTS.filter((c) => c.media)} />
      ),
    },
    {
      id: "feed-loading",
      group: "Feed",
      label: "Loading next",
      render: () => <DiscoverFeed loading />,
    },
    {
      id: "feed-empty",
      group: "Feed",
      label: "Empty feed",
      render: () => <DiscoverFeed empty />,
    },
    {
      id: "feed-offline",
      group: "Feed",
      label: "Offline banner",
      render: () => <DiscoverFeed offline />,
    },

    {
      id: "challenge-selected",
      group: "Challenge",
      label: "Selected + ready",
      render: () => (
        <DiscoverFeed
          stageOverride="question"
          challengeStateOverride="idle"
          previewConceptId="seasons"
        />
      ),
    },
    {
      id: "challenge-loading",
      group: "Challenge",
      label: "Submitting",
      render: () => (
        <DiscoverFeed
          stageOverride="question"
          challengeStateOverride="submitting"
          previewConceptId="seasons"
        />
      ),
    },
    {
      id: "feedback-correct",
      group: "Feedback",
      label: "Correct",
      render: () => (
        <DiscoverFeed stageOverride="feedback-correct" previewConceptId="seasons" />
      ),
    },
    {
      id: "feedback-incorrect-seasons",
      group: "Feedback",
      label: "Incorrect — Seasons (distance misconception)",
      render: () => (
        <DiscoverFeed stageOverride="feedback-incorrect" previewConceptId="seasons" />
      ),
    },
    {
      id: "feedback-incorrect-planes",
      group: "Feedback",
      label: "Incorrect — Planes",
      render: () => (
        <DiscoverFeed stageOverride="feedback-incorrect" previewConceptId="planes" />
      ),
    },
    {
      id: "feedback-incorrect-dna",
      group: "Feedback",
      label: "Incorrect — DNA",
      render: () => (
        <DiscoverFeed stageOverride="feedback-incorrect" previewConceptId="dna" />
      ),
    },
    {
      id: "retry",
      group: "Feedback",
      label: "Retry",
      render: () => (
        <DiscoverFeed stageOverride="retry" previewConceptId="seasons" />
      ),
    },
    {
      id: "mind-blown",
      group: "Feedback",
      label: "Mind Blown",
      render: () => (
        <DiscoverFeed stageOverride="mind-blown" previewConceptId="seasons" />
      ),
    },

    {
      id: "saved-empty",
      group: "Saved",
      label: "Empty",
      render: () => <SavedScreen items={[]} />,
    },
    {
      id: "saved-populated",
      group: "Saved",
      label: "Populated",
      render: () => <SavedScreen items={MOCK_SAVED_ITEMS} />,
    },

    {
      id: "me-new",
      group: "Me",
      label: "New user",
      render: () => <MeScreen stats={MOCK_PROGRESS_NEW} />,
    },
    {
      id: "me-active",
      group: "Me",
      label: "Active learner",
      render: () => <MeScreen stats={MOCK_PROGRESS_ACTIVE} />,
    },

    {
      id: "create-idle",
      group: "Create",
      label: "Idle",
      render: () => <CreateScreen generationStatus="disabled" />,
    },
    {
      id: "create-generating",
      group: "Create",
      label: "Generating",
      render: () => <CreateScreen generationStatus="generating" />,
    },
    {
      id: "create-success",
      group: "Create",
      label: "Generated Black Holes",
      render: () => (
        <CreateScreen
          generationStatus="success"
          generatedPack={SAMPLE_BLACK_HOLES_PACK}
        />
      ),
    },

    {
      id: "explain-success",
      group: "Explain more",
      label: "Success",
      render: () => (
        <ExplainStandalone status="success" pack={EXPLAIN_PACKS.seasons} />
      ),
    },
    {
      id: "explain-cached",
      group: "Explain more",
      label: "Cached",
      render: () => (
        <ExplainStandalone status="cached" pack={EXPLAIN_PACKS.seasons} />
      ),
    },
    {
      id: "explain-loading",
      group: "Explain more",
      label: "Loading",
      render: () => <ExplainStandalone status="loading" />,
    },
    {
      id: "explain-offline",
      group: "Explain more",
      label: "Offline unavailable",
      render: () => <ExplainStandalone status="offline-unavailable" />,
    },
    {
      id: "explain-timeout",
      group: "Explain more",
      label: "Timeout",
      render: () => <ExplainStandalone status="timeout" />,
    },
    {
      id: "explain-server",
      group: "Explain more",
      label: "Server error",
      render: () => <ExplainStandalone status="server-error" />,
    },

    {
      id: "media-video",
      group: "Media states",
      label: "Video poster",
      render: () => (
        <MediaFrame>
          <MediaSlot media={MOCK_CONCEPTS.find((c) => c.id === "seasons")!.media} />
        </MediaFrame>
      ),
    },
    {
      id: "media-playing",
      group: "Media states",
      label: "Video playing",
      render: () => (
        <MediaFrame>
          <MediaSlot
            media={MOCK_CONCEPTS.find((c) => c.id === "seasons")!.media}
            playbackState="playing"
            muted={false}
            captionsOn
          />
        </MediaFrame>
      ),
    },
    {
      id: "media-loading",
      group: "Media states",
      label: "Video loading",
      render: () => (
        <MediaFrame>
          <MediaSlot
            media={MOCK_CONCEPTS.find((c) => c.id === "seasons")!.media}
            playbackState="loading"
          />
        </MediaFrame>
      ),
    },
    {
      id: "media-failed",
      group: "Media states",
      label: "Media unavailable",
      render: () => (
        <MediaFrame>
          <MediaSlot
            media={MOCK_CONCEPTS.find((c) => c.id === "seasons")!.media}
            failed
          />
        </MediaFrame>
      ),
    },
    {
      id: "media-reduced",
      group: "Media states",
      label: "Reduced motion",
      render: () => (
        <MediaFrame>
          <MediaSlot
            media={MOCK_CONCEPTS.find((c) => c.id === "seasons")!.media}
            reducedMotion
          />
        </MediaFrame>
      ),
    },

    {
      id: "state-offline",
      group: "System",
      label: "Offline banner (standalone)",
      render: () => (
        <div className="grid min-h-[100dvh] place-items-center bg-background p-6">
          <div className="w-full max-w-sm">
            <OfflineBanner />
          </div>
        </div>
      ),
    },
    {
      id: "state-loading",
      group: "System",
      label: "Loading state",
      render: () => (
        <div className="grid min-h-[100dvh] place-items-center bg-background">
          <LoadingState label="Loading concept…" />
        </div>
      ),
    },
    {
      id: "state-empty",
      group: "System",
      label: "Empty state",
      render: () => (
        <div className="grid min-h-[100dvh] place-items-center bg-background p-6">
          <EmptyState
            title="Nothing here yet"
            description="Local content unavailable. New concepts arrive as soon as you're back online."
          />
        </div>
      ),
    },
    {
      id: "state-error",
      group: "System",
      label: "Generic error",
      render: () => (
        <div className="grid min-h-[100dvh] place-items-center bg-background p-6">
          <ErrorState
            title="Feed didn't load"
            description="We couldn't reach the Jenius feed. Retry, or head offline to browse saved concepts."
            onRetry={() => {}}
          />
        </div>
      ),
    },
  ];

  const groups = Array.from(new Set(STATES.map((s) => s.group)));
  const active = STATES.find((s) => s.id === activeId) ?? STATES[0];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background lg:flex-row">
      <aside className="border-b border-white/10 bg-background/80 p-4 lg:sticky lg:top-0 lg:h-[100dvh] lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-lg font-semibold">State preview</h1>
          <Link to="/" className="text-xs text-brand-blue hover:underline">
            ← Back to feed
          </Link>
        </div>

        <label className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={!ctx.online}
            onChange={(e) => ctx.setOnline(!e.target.checked)}
            className="size-4 accent-brand-blue"
          />
          <span>Simulate offline</span>
        </label>

        <nav className="space-y-4">
          {groups.map((group) => (
            <div key={group}>
              <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-foreground/55">
                {group}
              </div>
              <ul className="space-y-1">
                {STATES.filter((s) => s.group === group).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(s.id)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2 text-left text-sm transition-swift",
                        activeId === s.id
                          ? "bg-white/12 text-foreground"
                          : "text-foreground/75 hover:bg-white/6",
                      )}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="min-h-[100dvh] flex-1 overflow-hidden">
        <div className="mx-auto h-[100dvh] max-w-[460px] border-x border-white/5">
          {active.render()}
        </div>
      </main>
    </div>
  );
}

function MediaFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background p-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

function ExplainStandalone(props: {
  status: React.ComponentProps<typeof ExplainMoreSheet>["status"];
  pack?: React.ComponentProps<typeof ExplainMoreSheet>["pack"];
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="relative min-h-[100dvh] bg-background">
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-white/10 px-4 py-2 text-sm"
        >
          Reopen sheet
        </button>
      </div>
      <ExplainMoreSheet
        open={open}
        onOpenChange={setOpen}
        subject="science"
        conceptHook="Why do seasons exist?"
        status={props.status}
        pack={props.pack}
        onRetry={() => {}}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
