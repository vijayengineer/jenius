import * as React from "react";
import { ChevronUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Concept } from "@/lib/jenius/mockConcepts";
import type { MediaPlaybackState } from "@/lib/jenius/types";
import { SubjectChip } from "./SubjectChip";
import { ConceptActions } from "./ConceptActions";
import { MediaSlot } from "./MediaSlot";

export interface ConceptCardProps extends React.HTMLAttributes<HTMLElement> {
  concept: Concept;
  saved?: boolean;
  onSave?: () => void;
  onGotIt?: () => void;
  onExplainMore?: () => void;
  /** Disable the Explain action (offline + no cache). */
  explainDisabled?: boolean;
  /** Hint text explaining why Explain is disabled. */
  explainHint?: string;
  /** Playback state for the concept's video media, if any. */
  playbackState?: MediaPlaybackState;
  /** True when the OS reduced-motion setting should force the text fallback. */
  reducedMotion?: boolean;
  /** True when the muted-sound indicator is on. */
  muted?: boolean;
  /** Show the "Swipe to discover" cue at the bottom. */
  showSwipeCue?: boolean;
}

/**
 * ConceptCard — one concept, one viewport. Used as a snap child inside the
 * Discover feed. Layout:
 *
 *  - Media slot (optional) — Jenius animation placeholder when the concept is
 *    animation-ready.
 *  - Meta row: subject chip, category eyebrow, reading time.
 *  - Hook (max ~two lines) as the visual anchor.
 *  - Explanation (~40–70 words).
 *  - Takeaway pill.
 *  - Vertical action rail (Save / Got it? / Explain).
 *  - Optional swipe cue.
 */
export const ConceptCard = React.forwardRef<HTMLElement, ConceptCardProps>(
  (
    {
      concept,
      saved,
      onSave,
      onGotIt,
      onExplainMore,
      explainDisabled,
      explainHint,
      playbackState = "poster",
      reducedMotion = false,
      muted = true,
      showSwipeCue,
      className,
      ...props
    },
    ref,
  ) => {
    const readingLabel = `${Math.max(1, Math.round(concept.readingSeconds / 5) * 5)}s read`;

    return (
      <article
        ref={ref}
        aria-roledescription="concept card"
        aria-label={concept.hook}
        className={cn(
          "relative flex h-[100dvh] w-full snap-start snap-always flex-col overflow-hidden",
          "px-5",
          "pt-[calc(env(safe-area-inset-top)+64px)]",
          "pb-[calc(env(safe-area-inset-bottom)+96px)]",
          className,
        )}
        {...props}
      >
        {/* Ambient brand wash so cards feel distinct from the shell */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "var(--gradient-brand-soft)" }}
        />

        {concept.media ? (
          <div className="mb-5">
            <MediaSlot
              media={concept.media}
              playbackState={playbackState}
              reducedMotion={reducedMotion}
              muted={muted}
            />
          </div>
        ) : concept.animationReady ? (
          <div className="mb-5">
            <AnimationSlot />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <SubjectChip subject={concept.subject} size="sm" />
          <span className="text-xs uppercase tracking-wider text-foreground/60">
            {concept.category}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-foreground/60">
            <Clock className="size-3.5" aria-hidden />
            {readingLabel}
          </span>
        </div>

        <div className="mt-5 flex flex-1 flex-col justify-center pr-16">
          <h2 className="gradient-text font-display text-[34px] font-semibold leading-[1.05] tracking-tight sm:text-[38px]">
            {concept.hook}
          </h2>

          <p className="mt-5 text-[17px] leading-relaxed text-foreground/85">
            {concept.explanation}
          </p>

          <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[13px] text-foreground/90 backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand-blue" aria-hidden />
            <span className="font-medium">Takeaway</span>
            <span className="text-foreground/70">·</span>
            <span>{concept.takeaway}</span>
          </div>
        </div>

        {/* Right-edge action rail */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <div className="pointer-events-auto">
            <ConceptActions
              saved={saved}
              onSave={onSave}
              onGotIt={onGotIt}
              onExplainMore={onExplainMore}
              explainDisabled={explainDisabled}
              explainHint={explainHint}
            />
          </div>
        </div>

        {showSwipeCue ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+104px)] flex flex-col items-center gap-1 text-foreground/55"
          >
            <ChevronUp className="size-4 animate-bounce" />
            <span className="text-[11px] uppercase tracking-[0.18em]">Swipe to discover</span>
          </div>
        ) : null}
      </article>
    );
  },
);
ConceptCard.displayName = "ConceptCard";

function AnimationSlot() {
  return (
    <div
      role="img"
      aria-label="Jenius animation slot — placeholder for a future short animation"
      className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10"
      style={{ background: "var(--gradient-brand)" }}
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{ background: "radial-gradient(120% 80% at 20% 20%, white, transparent 60%)" }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
        <div className="glass-strong grid size-12 place-items-center rounded-full">
          <svg viewBox="0 0 24 24" className="size-5 translate-x-[1px] fill-white/95">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/85">
          Jenius animation slot
        </span>
      </div>
    </div>
  );
}
