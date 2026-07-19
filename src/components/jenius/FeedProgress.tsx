import * as React from "react";
import { cn } from "@/lib/utils";

export interface FeedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  total: number;
  current: number;
  /** 0-100, progress of the active segment. */
  progress?: number;
}

/**
 * FeedProgress — TikTok/Stories-style segmented bar for the feed's top edge.
 * Distinct from the shared `SegmentedProgress` primitive: this variant is
 * feed-specific (thinner, tighter, and always uses the brand gradient fill).
 */
export const FeedProgress = React.forwardRef<HTMLDivElement, FeedProgressProps>(
  ({ total, current, progress = 0, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-label={`Card ${current + 1} of ${total}`}
        className={cn("flex w-full items-center gap-1", className)}
        {...props}
      >
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < current ? 100 : i === current ? progress : 0;
          return (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full gradient-brand transition-all duration-500 ease-out"
                style={{ width: `${filled}%` }}
              />
            </div>
          );
        })}
      </div>
    );
  },
);
FeedProgress.displayName = "FeedProgress";
