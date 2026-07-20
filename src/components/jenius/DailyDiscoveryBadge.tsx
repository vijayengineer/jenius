import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DailyDiscoveryBadgeProps {
  progress: number;
  target: number;
  className?: string;
}

/**
 * DailyDiscoveryBadge — small, subtle indicator that can sit inside the
 * feed top bar. Communicates progress without pressure.
 */
export function DailyDiscoveryBadge({ progress, target, className }: DailyDiscoveryBadgeProps) {
  const pct = target ? Math.min(1, progress / target) : 0;
  const complete = pct >= 1;
  return (
    <div
      aria-label={`Today's curiosity: ${progress} of ${target} discoveries`}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1",
        "text-[11px] font-medium",
        complete ? "text-mind-blown" : "text-foreground/75",
        className,
      )}
    >
      <Flame
        className={cn("size-3", complete ? "text-mind-blown" : "text-brand-violet")}
        aria-hidden
      />
      <span className="tabular-nums">
        {progress}/{target}
      </span>
      <span className="hidden xs:inline text-foreground/50">today</span>
    </div>
  );
}
