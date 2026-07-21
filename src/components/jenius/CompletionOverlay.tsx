import * as React from "react";
import { Bookmark, Check, Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CompletionOverlayProps {
  open: boolean;
  conceptTitle: string;
  xpAwarded?: number;
  understandingLevel?: number;
  reopened?: boolean;
  onNextCuriosity: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onDismiss?: () => void;
  saved?: boolean;
}

/**
 * CompletionOverlay — focused completion card shown over the feed after a
 * concept sequence ends. It uses persisted outcome data and never awards XP.
 */
export function CompletionOverlay({
  open,
  conceptTitle,
  xpAwarded = 0,
  understandingLevel,
  reopened = false,
  onNextCuriosity,
  onSave,
  onShare,
  onDismiss,
  saved,
}: CompletionOverlayProps) {
  if (!open) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-live="polite">
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="completion-title"
        className={cn(
          "pointer-events-auto fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-40 mx-auto max-w-[430px]",
          "glass-strong rounded-3xl border border-white/12 p-5 shadow-glow-lg",
          "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        )}
      >
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-success/18 text-success ring-1 ring-success/30"
          >
            <Check className="size-5" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-success">
              {reopened ? "Concept complete" : "Complete"}
            </p>
            <h2
              id="completion-title"
              className="mt-1 font-display text-[24px] font-semibold leading-tight tracking-tight text-foreground"
            >
              You understand it.
            </h2>
          </div>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Return to Feed"
              className="grid size-11 shrink-0 place-items-center rounded-full text-foreground/65 transition-swift hover:bg-white/10 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <p className="mt-4 text-[15px] font-medium leading-snug text-foreground/90">
          {conceptTitle}
        </p>

        {xpAwarded > 0 || understandingLevel !== undefined ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {xpAwarded > 0 ? (
              <span className="rounded-full border border-brand-violet/30 bg-brand-violet/12 px-3 py-1.5 text-xs font-semibold text-foreground">
                +{xpAwarded} XP earned
              </span>
            ) : null}
            {understandingLevel !== undefined ? (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground/80">
                Understanding {understandingLevel}/5
              </span>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onNextCuriosity}
          aria-label="Next curiosity"
          className="gradient-brand mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl font-medium text-primary-foreground shadow-glow transition-swift active:scale-[0.99]"
        >
          Next curiosity
        </button>

        {onSave || onShare ? (
          <div className="mt-2 flex gap-2">
            {onSave ? (
              <button
                type="button"
                onClick={onSave}
                aria-pressed={!!saved}
                className={cn(
                  "flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-swift",
                  saved
                    ? "border-mind-blown/35 bg-mind-blown/15 text-mind-blown"
                    : "border-white/10 bg-white/[0.03] text-foreground/80 hover:bg-white/[0.07]",
                )}
              >
                <Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden />
                {saved ? "Saved" : "Save"}
              </button>
            ) : null}
            {onShare ? (
              <button
                type="button"
                onClick={onShare}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-medium text-foreground/80 transition-swift hover:bg-white/[0.07]"
              >
                <Share2 className="size-4" aria-hidden />
                Share
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
