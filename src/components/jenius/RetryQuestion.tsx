import * as React from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnswerOption, type AnswerState } from "./AnswerOption";
import type { ChallengeOption, ResolvedOptionState, SubmissionState } from "@/lib/jenius/challenges";

export interface RetryQuestionProps {
  /** Supportive framing, e.g. "Let's test the same idea with a different example." */
  supportiveIntro: string;
  prompt: string;
  options: ChallengeOption[];
  selectedOptionId: string | null;
  submissionState: SubmissionState;
  /** Post-submit; injected by the caller — presenter never decides correctness. */
  resolvedOptionStates?: Record<string, ResolvedOptionState>;
  /** Line shown under the options after submission, regardless of correctness. */
  wrapUp?: string;
  onSelect: (optionId: string) => void;
  onSubmit: () => void;
  onContinue: () => void;
  className?: string;
}

const MARKERS = ["A", "B", "C", "D"];

/**
 * RetryQuestion — a second-chance question that stays inside the same sheet.
 * Visually softer than the initial challenge (no scoreboard energy). Uses
 * the same AnswerOption primitive so results render consistently.
 */
export function RetryQuestion({
  supportiveIntro,
  prompt,
  options,
  selectedOptionId,
  submissionState,
  resolvedOptionStates,
  wrapUp,
  onSelect,
  onSubmit,
  onContinue,
  className,
}: RetryQuestionProps) {
  const isSubmitted = submissionState === "submitted";
  const isSubmitting = submissionState === "submitting";
  const canSubmit = !!selectedOptionId && !isSubmitted && !isSubmitting;

  const optionState = (id: string): AnswerState => {
    if (isSubmitted && resolvedOptionStates) {
      const r = resolvedOptionStates[id];
      if (r === "correct") return "correct";
      if (r === "incorrect") return "incorrect";
      return "disabled";
    }
    if (selectedOptionId === id) return "selected";
    return "idle";
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2 text-brand-violet">
        <RotateCcw className="size-4" aria-hidden />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          Try another way
        </span>
      </div>

      <p className="text-[13px] leading-relaxed text-foreground/70">
        {supportiveIntro}
      </p>

      <h3
        id="retry-prompt"
        className="font-display text-[20px] font-semibold leading-snug tracking-tight text-foreground"
      >
        {prompt}
      </h3>

      <div
        role="radiogroup"
        aria-labelledby="retry-prompt"
        className="flex flex-col gap-2.5"
      >
        {options.map((opt, i) => {
          const isChecked = selectedOptionId === opt.id;
          const disabled = isSubmitted || isSubmitting;
          return (
            <AnswerOption
              key={opt.id}
              role="radio"
              aria-checked={isChecked}
              tabIndex={disabled ? -1 : isChecked || (!selectedOptionId && i === 0) ? 0 : -1}
              marker={MARKERS[i]}
              label={opt.label}
              state={optionState(opt.id)}
              disabled={disabled}
              onClick={() => !disabled && onSelect(opt.id)}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                  e.preventDefault();
                  onSelect(options[(i + 1) % options.length].id);
                } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  onSelect(options[(i - 1 + options.length) % options.length].id);
                }
              }}
            />
          );
        })}
      </div>

      {isSubmitted && wrapUp ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[14px] leading-relaxed text-foreground/85">
          {wrapUp}
        </p>
      ) : null}

      <button
        type="button"
        onClick={isSubmitted ? onContinue : onSubmit}
        disabled={!isSubmitted && !canSubmit}
        className={cn(
          "mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
          "gradient-brand font-medium text-primary-foreground shadow-glow transition-swift",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
          "active:scale-[0.99]",
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span>Checking…</span>
          </>
        ) : isSubmitted ? (
          <span>Continue</span>
        ) : (
          <span>Check answer</span>
        )}
      </button>
    </div>
  );
}
