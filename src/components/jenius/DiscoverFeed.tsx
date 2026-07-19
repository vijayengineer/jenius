import * as React from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "./AppShell";
import { BottomNavigation, type BottomNavItem, type BottomNavKey } from "./BottomNavigation";
import { FeedTopBar, type FeedMode } from "./FeedTopBar";
import { OfflineBanner } from "./OfflineBanner";
import { ConceptCard } from "./ConceptCard";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ChallengeSheet } from "./ChallengeSheet";
import { MOCK_CONCEPTS, type Concept } from "@/lib/jenius/mockConcepts";
import {
  CHALLENGES,
  resolveChallenge,
  type ResolvedOptionState,
  type SubmissionState,
} from "@/lib/jenius/challenges";
import { Bookmark, Home, Plus, User } from "lucide-react";

const FEED_NAV_ITEMS: BottomNavItem[] = [
  { key: "feed", label: "Feed", icon: Home },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "explore", label: "Create", icon: Plus },
  { key: "profile", label: "Me", icon: User },
];

export interface DiscoverFeedProps {
  concepts?: Concept[];
  /** Simulate the offline pill. */
  offline?: boolean;
  /** Simulate a loading spinner at the tail of the feed. */
  loading?: boolean;
  /** Force the empty state instead of concept cards. */
  empty?: boolean;
  /** Pre-saved concept ids for the preview. */
  initialSaved?: string[];
  /** Currently active bottom-nav tab. Defaults to "feed". */
  activeTab?: BottomNavKey;
  onTabChange?: (key: BottomNavKey) => void;
}

/**
 * DiscoverFeed — mobile-first vertical snap feed.
 *
 * Behaviour notes:
 *  - One concept per viewport, CSS scroll snap on the Y axis.
 *  - Horizontal overflow is clipped to prevent accidental sideways scroll.
 *  - Top bar (Jenius mark, mode selector, sound placeholder, offline pill)
 *    floats over the feed as a light glass strip.
 *  - Bottom navigation floats above the safe area as a floating pill.
 *  - The last item is an "end of sample feed" card that offers to loop back
 *    to the start.
 */
export function DiscoverFeed({
  concepts = MOCK_CONCEPTS,
  offline = false,
  loading = false,
  empty = false,
  initialSaved,
  activeTab = "feed",
  onTabChange,
}: DiscoverFeedProps) {
  const [mode, setMode] = React.useState<FeedMode>("discover");
  const [muted, setMuted] = React.useState(true);
  const [saved, setSaved] = React.useState<Set<string>>(
    () => new Set(initialSaved ?? concepts.filter((c) => c.saved).map((c) => c.id)),
  );
  const [activeIndex, setActiveIndex] = React.useState(0);

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<Array<HTMLElement | null>>([]);

  // Track the active card via IntersectionObserver so the progress dots stay
  // in sync with the snapped card, without listening to noisy scroll events.
  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = cardRefs.current.findIndex((el) => el === visible.target);
        if (idx >= 0) setActiveIndex(idx);
      },
      { root: scroller, threshold: [0.55, 0.75] },
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [concepts.length, empty, loading]);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scrollToIndex = (idx: number) => {
    const el = cardRefs.current[idx];
    if (el && scrollerRef.current) {
      scrollerRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    }
  };

  const totalStops = empty ? 0 : concepts.length + 1; // +1 = end-of-feed card

  return (
    <AppShell
      contained
      header={
        <div className="relative">
          <FeedTopBar
            mode={mode}
            onModeChange={setMode}
            muted={muted}
            onToggleMuted={() => setMuted((m) => !m)}
          />
          {offline ? <OfflineBanner /> : null}
          {totalStops > 1 ? (
            <FeedDots total={totalStops} active={activeIndex} />
          ) : null}
        </div>
      }
      footer={
        <BottomNavigation
          items={FEED_NAV_ITEMS}
          active={activeTab}
          onSelect={onTabChange}
        />
      }
    >
      {empty ? (
        <div className="grid h-[100dvh] place-items-center px-6">
          <EmptyState
            title="No concepts yet"
            description="New ideas are being prepared for your feed. Check back soon."
          />
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className={cn(
            "h-[100dvh] w-full snap-y snap-mandatory overflow-y-auto overflow-x-hidden",
            "scroll-smooth no-scrollbar overscroll-y-contain",
            // The header/footer float over the feed via the sticky AppShell,
            // so the scroller itself owns the full viewport height.
            "-mt-[calc(env(safe-area-inset-top)+0px)]",
          )}
          style={{ scrollSnapType: "y mandatory" }}
        >
          {concepts.map((concept, i) => (
            <ConceptCard
              key={concept.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              concept={concept}
              saved={saved.has(concept.id)}
              onSave={() => toggleSave(concept.id)}
              showSwipeCue={i === 0}
            />
          ))}

          {loading ? (
            <section
              ref={(el) => {
                cardRefs.current[concepts.length] = el;
              }}
              className="grid h-[100dvh] snap-start place-items-center"
            >
              <LoadingState label="Loading next concept…" />
            </section>
          ) : (
            <EndOfFeedCard
              ref={(el) => {
                cardRefs.current[concepts.length] = el;
              }}
              onLoop={() => scrollToIndex(0)}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}

interface FeedDotsProps {
  total: number;
  active: number;
}

function FeedDots({ total, active }: FeedDotsProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-center gap-1.5"
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 rounded-full transition-swift",
            i === active ? "w-5 bg-foreground/85" : "w-1 bg-foreground/25",
          )}
        />
      ))}
    </div>
  );
}

interface EndOfFeedCardProps {
  onLoop: () => void;
}

const EndOfFeedCard = React.forwardRef<HTMLElement, EndOfFeedCardProps>(
  ({ onLoop }, ref) => {
    return (
      <section
        ref={ref}
        aria-label="End of sample feed"
        className={cn(
          "relative flex h-[100dvh] w-full snap-start snap-always flex-col items-center justify-center gap-4 px-8 text-center",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{ background: "var(--gradient-brand-soft)" }}
        />
        <span className="text-xs uppercase tracking-[0.22em] text-foreground/60">
          You're all caught up
        </span>
        <h2 className="gradient-text font-display text-[30px] font-semibold leading-tight">
          End of the sample feed
        </h2>
        <p className="max-w-[28ch] text-[15px] text-foreground/75">
          In the full app, new concepts arrive here forever. For now, loop back to
          the start.
        </p>
        <button
          type="button"
          onClick={onLoop}
          className="mt-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-foreground transition-swift hover:bg-white/15 active:scale-[0.98]"
        >
          Restart feed
        </button>
      </section>
    );
  },
);
EndOfFeedCard.displayName = "EndOfFeedCard";
