import * as React from "react";
import type { LearningPhase } from "@/learning/engine";
import { getLessonProgress } from "@/learning/progress";
import { cn } from "@/lib/utils";

export interface LessonProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  phase: LearningPhase;
  retryRequired?: boolean;
}

/** A compact lesson orientation cue, intentionally quieter than lesson content. */
export function LessonProgress({
  phase,
  retryRequired = false,
  className,
  ...props
}: LessonProgressProps) {
  const progress = getLessonProgress(phase, { retryRequired });

  return (
    <div
      role="progressbar"
      aria-label="Lesson progress"
      aria-valuemin={1}
      aria-valuemax={progress.steps.length}
      aria-valuenow={progress.currentIndex + 1}
      aria-valuetext={progress.accessibleText}
      className={cn("space-y-2", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/60">
        <span>{progress.current.label}</span>
        <span aria-hidden>
          {progress.currentIndex + 1}/{progress.steps.length}
        </span>
      </div>
      <div aria-hidden className="flex gap-1.5">
        {progress.steps.map((step, index) => (
          <span
            key={step.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-swift",
              index <= progress.currentIndex ? "gradient-brand" : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}
