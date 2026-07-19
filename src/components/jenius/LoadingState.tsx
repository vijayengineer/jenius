import * as React from "react";
import { cn } from "@/lib/utils";
import { JeniusMark } from "./JeniusMark";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  /** "inline" fits inside a card, "screen" fills the viewport. */
  fill?: "inline" | "screen";
}

/**
 * LoadingState — Jenius mark with a soft pulsing halo. Doubles as the
 * app's loading symbol so the brand is visible during first paint.
 * Honours `prefers-reduced-motion` via the global CSS override.
 */
export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ label = "Loading", fill = "inline", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          "flex flex-col items-center justify-center gap-4 text-muted-foreground",
          fill === "screen" ? "min-h-dvh" : "py-16",
          className,
        )}
        {...props}
      >
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -m-4 rounded-full bg-brand-violet/25 blur-2xl animate-pulse"
          />
          <div className="relative animate-pulse">
            <JeniusMark size={48} />
          </div>
        </div>
        <span className="text-sm">{label}</span>
      </div>
    );
  },
);
LoadingState.displayName = "LoadingState";
