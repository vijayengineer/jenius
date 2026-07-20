import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MisconceptionCard } from "./MisconceptionCard";
import { CorrectiveExplanation } from "./CorrectiveExplanation";
import { MemoryHook } from "./MemoryHook";

export interface IncorrectFeedbackProps {
  /** Stage 1 — gentle acknowledgement line ("Interesting choice." etc). */
  acknowledgement: string;
  /** Stage 2 — named misconception, e.g. "Distance causes the seasons". */
  misconceptionLabel: string;
  /** The learner's picked option, verbatim. */
  selectedLabel: string;
  /** Stage 3 — corrective explanation copy. */
  whyUnderstandable: string;
  whyIncorrect: string;
  correctStatement: string;
  /** Stage 4 — short memorable phrase. */
  memoryHook: string;
  /** Stage 5 — retry action. */
  onRetry: () => void;
  /** Optional secondary "skip retry" action. */
  onSkipRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * IncorrectFeedback — presentational only. Composes the five stages of the
 * teacher-like sequence into a single scrollable view. Never uses shaming
 * language; never re-decides correctness. All copy arrives through props.
 */
export function IncorrectFeedback({
  acknowledgement,
  misconceptionLabel,
  selectedLabel,
  whyUnderstandable,
  whyIncorrect,
  correctStatement,
  memoryHook,
  onRetry,
  onSkipRetry,
  retryLabel = "Try the idea another way",
  className,
}: IncorrectFeedbackProps) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col gap-5", className)}>
      {/* Stage 1 — Acknowledge */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-blue">
          Let's look at this together
        </div>
        <p className="mt-1 font-display text-[20px] font-semibold leading-snug tracking-tight text-foreground">
          {acknowledgement}
        </p>
      </div>

      {/* Stage 2 — Named misconception */}
      <MisconceptionCard
        title="Common misconception"
        misconception={misconceptionLabel}
        correction={correctStatement}
      />

      {/* Stage 3 — Corrective explanation */}
      <CorrectiveExplanation
        selectedLabel={selectedLabel}
        whyUnderstandable={whyUnderstandable}
        whyIncorrect={whyIncorrect}
        correctStatement={correctStatement}
      />

      {/* Stage 4 — Memory hook */}
      <MemoryHook>{memoryHook}</MemoryHook>

      {/* Stage 5 — Retry */}
      <div className="mt-1 flex flex-col gap-2">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
            "gradient-brand text-primary-foreground shadow-glow",
            "font-medium transition-swift active:scale-[0.99]",
          )}
        >
          <span>{retryLabel}</span>
          <ArrowRight className="size-4" aria-hidden />
        </button>
        {onSkipRetry ? (
          <button
            type="button"
            onClick={onSkipRetry}
            className="h-11 rounded-2xl text-sm font-medium text-foreground/70 transition-swift hover:text-foreground"
          >
            Skip retry, keep going
          </button>
        ) : null}
      </div>
    </div>
  );
}
