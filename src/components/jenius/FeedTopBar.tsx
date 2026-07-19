import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { JeniusMark } from "./JeniusMark";

export type FeedMode = "discover" | "for-you";

export interface FeedTopBarProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: FeedMode;
  onModeChange?: (mode: FeedMode) => void;
  muted?: boolean;
  onToggleMuted?: () => void;
}

/**
 * FeedTopBar — minimal glass strip pinned to the top of the Discover feed.
 * Holds the Jenius mark, a Discover / For You selector, and a sound
 * placeholder for future video. Kept intentionally light so the concept
 * card is never visually crowded.
 */
export const FeedTopBar = React.forwardRef<HTMLDivElement, FeedTopBarProps>(
  ({ mode, onModeChange, muted = true, onToggleMuted, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3",
          className,
        )}
        {...props}
      >
        <JeniusMark size={26} />

        <div
          role="tablist"
          aria-label="Feed mode"
          className="glass flex items-center gap-1 rounded-full p-1"
        >
          {(
            [
              { key: "discover", label: "Discover" },
              { key: "for-you", label: "For You" },
            ] as const
          ).map((tab) => {
            const active = tab.key === mode;
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => onModeChange?.(tab.key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-swift",
                  active
                    ? "bg-white/15 text-foreground"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onToggleMuted}
          aria-label={muted ? "Unmute (coming soon)" : "Mute"}
          aria-pressed={muted}
          className="glass grid size-10 place-items-center rounded-full text-foreground/80 transition-swift active:scale-95"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    );
  },
);
FeedTopBar.displayName = "FeedTopBar";
