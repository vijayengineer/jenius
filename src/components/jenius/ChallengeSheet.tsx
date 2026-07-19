import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "./Sheet";
import { SubjectChip } from "./SubjectChip";
import { AnswerOption, type AnswerState } from "./AnswerOption";
import type { SubjectId } from "@/lib/jenius/types";
import type {
  Challenge,
  ResolvedOptionState,
  SubmissionState,
} from "@/lib/jenius/challenges";

export interface ChallengeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectId;
  /** Short reminder of the concept the challenge belongs to. */
  conceptReminder?: string;
  question: Challenge;
  selectedOptionId: string | null;
  submissionState: SubmissionState;
  /** Populated post-submit by the caller (or a real backend). */
  resolvedOptionStates?: Record<string, ResolvedOptionState>;
  onSelect: (optionId: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  onRetry?: () => void;
}

const MARKERS = ["A", "B", "C", "D"];

/**
 * ChallengeSheet — bottom sheet that opens over a dimmed concept card.
 *
 * The learner stays visually connected to the concept: the underlying
 * FeedCard remains on screen behind the overlay. The sheet is a pure
 * presenter — it does not decide correctness, only renders whatever
 * `resolvedOptionStates` the caller supplies.
 */
export function ChallengeSheet({
  open,
  onOpenChange,
  subject,
  conceptReminder,
  question,
  selectedOptionId,
  submissionState,
  resolvedOptionStates,
  onSelect,
  onSubmit,
  onClose,
  onRetry,
}: ChallengeSheetProps) {
  const isSubmitted = submissionState === "submitted";
  const isSubmitting = submissionState === "submitting";
  const isError = submissionState === "error";
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) onClose();
      }}
    >
      <SheetContent title="Quick check" hideHeader>
        <div className="flex items-center gap-2">
          <SubjectChip subject={subject} size="sm" />
          <span className="text-xs uppercase tracking-[0.18em] text-foreground/60">
            Quick check
          </span>
        </div>

        {conceptReminder ? (
          <p className="mt-3 text-[13px] text-foreground/65">
            About: <span className="text-foreground/85">{conceptReminder}</span>
          </p>
        ) : null}

        <h3
          id="challenge-question"
          className="mt-4 font-display text-[22px] font-semibold leading-snug tracking-tight text-foreground"
        >
          {question.prompt}
        </h3>

        <div
          role="radiogroup"
          aria-labelledby="challenge-question"
          className="mt-5 flex flex-col gap-2.5"
        >
          {question.options.map((opt, i) => {
            const state = optionState(opt.id);
            const isChecked = selectedOptionId === opt.id;
            const resolved = resolvedOptionStates?.[opt.id];
            const disabled = isSubmitted || isSubmitting;
            return (
              <div key={opt.id} className="relative">
                <AnswerOption
                  role="radio"
                  aria-checked={isChecked}
                  aria-describedby={
                    isSubmitted ? `challenge-result-${opt.id}` : undefined
                  }
                  tabIndex={disabled ? -1 : isChecked || (!selectedOptionId && i === 0) ? 0 : -1}
                  marker={MARKERS[i]}
                  label={opt.label}
                  state={state}
                  disabled={disabled}
                  onClick={() => !disabled && onSelect(opt.id)}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault();
                      const next = question.options[(i + 1) % question.options.length];
                      onSelect(next.id);
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const prev =
                        question.options[(i - 1 + question.options.length) % question.options.length];
                      onSelect(prev.id);
                    }
                  }}
                />
                {isSubmitted && resolved && resolved !== "locked" ? (
                  <span
                    id={`challenge-result-${opt.id}`}
                    className={cn(
                      "mt-1 ml-1 block text-[12px] font-medium",
                      resolved === "correct"
                        ? "text-success"
                        : "text-misconception",
                    )}
                  >
                    {resolved === "correct" ? "Correct answer" : "Not quite"}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {isError ? (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-2xl border border-misconception/40 bg-misconception/10 px-3.5 py-3 text-[13px] text-foreground/90"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-misconception" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Couldn't check your answer</p>
              <p className="text-foreground/70">
                You may be offline. Try again in a moment.
              </p>
            </div>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-foreground hover:bg-white/15"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            aria-live="polite"
            className={cn(
              "relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
              "font-medium text-primary-foreground transition-swift",
              "gradient-brand shadow-glow",
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
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onClose();
            }}
            className="h-11 rounded-2xl text-sm font-medium text-foreground/70 transition-swift hover:text-foreground"
          >
            Close
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
