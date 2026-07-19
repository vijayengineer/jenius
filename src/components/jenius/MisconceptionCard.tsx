import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MisconceptionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  /** The common wrong belief, phrased neutrally. */
  misconception: React.ReactNode;
  /** The gentle correction / clarification. */
  correction: React.ReactNode;
}

/**
 * MisconceptionCard — visual pattern for surfacing a common wrong belief
 * and its correction. Uses the misconception coral token, but never colour
 * alone: iconography + labels also convey the meaning.
 */
export const MisconceptionCard = React.forwardRef<HTMLDivElement, MisconceptionCardProps>(
  ({ title = "Common misconception", misconception, correction, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-label={title}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-misconception/25",
          "bg-misconception/8 p-5",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2 text-misconception">
          <AlertCircle className="size-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            {title}
          </span>
        </div>

        <p className="mt-3 text-[17px] font-medium leading-snug text-foreground line-through decoration-misconception/60 decoration-2">
          {misconception}
        </p>

        <div className="mt-4 rounded-2xl bg-white/6 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-success">
            Actually
          </div>
          <p className="mt-1 text-[15px] leading-relaxed text-foreground/90">
            {correction}
          </p>
        </div>
      </div>
    );
  },
);
MisconceptionCard.displayName = "MisconceptionCard";
