import * as React from "react";
import { cn } from "@/lib/utils";

export interface CorrectiveExplanationProps {
  /** The option the learner picked, quoted back to them. */
  selectedLabel: string;
  /** Why the reasoning is understandable. Empathetic, never patronising. */
  whyUnderstandable: string;
  /** Why the reasoning doesn't hold up. Clear, calm. */
  whyIncorrect: string;
  /** The correct concept, stated plainly. */
  correctStatement: string;
  className?: string;
}

/**
 * CorrectiveExplanation — presentational. Displays the four beats of a
 * teacher-style walk-through: what you picked → why that's an understandable
 * intuition → why it doesn't hold → what's actually going on.
 */
export function CorrectiveExplanation({
  selectedLabel,
  whyUnderstandable,
  whyIncorrect,
  correctStatement,
  className,
}: CorrectiveExplanationProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5",
        className,
      )}
    >
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
          You picked
        </div>
        <p className="mt-1 text-[15px] font-medium leading-snug text-foreground/90">
          “{selectedLabel}”
        </p>
      </div>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-blue">
          Why that makes sense
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-foreground/85">
          {whyUnderstandable}
        </p>
      </div>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-misconception">
          Where it breaks
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-foreground/85">
          {whyIncorrect}
        </p>
      </div>

      <div className="rounded-2xl bg-success/12 p-4 ring-1 ring-success/25">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-success">
          What's actually going on
        </div>
        <p className="mt-1 text-[15px] font-medium leading-relaxed text-foreground">
          {correctStatement}
        </p>
      </div>
    </div>
  );
}
