import * as React from "react";
import { Bookmark, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CompletionOverlayProps {
  open: boolean;
  message?: string;
  onKeepSwiping: () => void;
  onSave?: () => void;
  onDismiss?: () => void;
  saved?: boolean;
}

/**
 * CompletionOverlay — lightweight floating card shown after a concept
 * sequence ends. Not a full page, doesn't block the feed.
 */
export function CompletionOverlay({
  open,
  message = "Another idea understood.",
  onKeepSwiping,
  onSave,
  onDismiss,
  saved,
}: CompletionOverlayProps) {
  if (!open) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto fixed inset-x-4 bottom-24 z-40 mx-auto max-w-[430px]",
        "glass-strong flex items-center gap-3 rounded-2xl border border-white/12 p-3 pl-4 shadow-glow",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-foreground">{message}</p>
      </div>
      {onSave ? (
        <button
          type="button"
          onClick={onSave}
          aria-pressed={!!saved}
          className={cn(
            "flex h-11 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-swift",
            saved
              ? "bg-mind-blown/20 text-mind-blown"
              : "bg-white/[0.06] text-foreground hover:bg-white/[0.12]",
          )}
        >
          <Bookmark className={cn("size-3.5", saved && "fill-current")} aria-hidden />
          {saved ? "Saved" : "Save"}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onKeepSwiping}
        className="h-11 rounded-full bg-foreground/90 px-3 text-[12px] font-semibold text-background transition-swift hover:bg-foreground"
      >
        Keep swiping
      </button>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid size-11 place-items-center rounded-full text-foreground/60 transition-swift hover:bg-white/10 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
