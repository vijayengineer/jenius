import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnswerState = "idle" | "selected" | "correct" | "incorrect" | "disabled";

export interface AnswerOptionProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  label: string;
  /** Optional prefix marker, e.g. "A", "B". */
  marker?: string;
  state?: AnswerState;
}

const stateClass: Record<AnswerState, string> = {
  idle: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
  selected: "bg-white/10 border-brand-blue/60 shadow-glow",
  correct: "bg-success/15 border-success/50 text-foreground",
  incorrect: "bg-misconception/15 border-misconception/50 text-foreground",
  disabled: "bg-white/5 border-white/8 opacity-60",
};

/**
 * AnswerOption — pill-style option for multi-choice questions in the feed.
 * Uses shape + iconography (not just colour) to communicate state, per
 * accessibility rules.
 */
export const AnswerOption = React.forwardRef<HTMLButtonElement, AnswerOptionProps>(
  ({ label, marker, state = "idle", className, disabled, type = "button", ...props }, ref) => {
    const effectiveState: AnswerState = disabled ? "disabled" : state;
    const showCheck = effectiveState === "correct";
    const showCross = effectiveState === "incorrect";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || effectiveState === "disabled"}
        aria-label={label}
        data-state={effectiveState}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-2xl border",
          "px-4 py-4 text-left text-[15px] font-medium text-foreground",
          "min-h-[3.25rem] transition-swift active:scale-[0.99]",
          stateClass[effectiveState],
          className,
        )}
        {...props}
      >
        {marker ? (
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full bg-white/8 text-xs font-semibold text-foreground/80"
          >
            {marker}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">{label}</span>
        {showCheck ? (
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-full bg-success text-success-foreground"
          >
            <Check className="size-3.5" />
          </span>
        ) : null}
        {showCross ? (
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-full bg-misconception text-misconception-foreground"
          >
            <X className="size-3.5" />
          </span>
        ) : null}
      </button>
    );
  },
);
AnswerOption.displayName = "AnswerOption";
