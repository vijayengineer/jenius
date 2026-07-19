import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MindBlownCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

/**
 * MindBlownCard — the amber "aha" moment. Reserved highlight, used
 * sparingly. Amber is the one warm token in the palette so it stands out
 * against the calm blue/violet feed.
 */
export const MindBlownCard = React.forwardRef<HTMLDivElement, MindBlownCardProps>(
  ({ title = "Mind blown", children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-label={title}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-mind-blown/35 p-5",
          "bg-mind-blown/12",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="absolute -right-8 -top-8 size-32 rounded-full bg-mind-blown/25 blur-2xl"
        />
        <div className="relative flex items-center gap-2 text-mind-blown">
          <Sparkles className="size-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            {title}
          </span>
        </div>
        <div className="relative mt-3 font-display text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          {children}
        </div>
      </div>
    );
  },
);
MindBlownCard.displayName = "MindBlownCard";
