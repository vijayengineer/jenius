import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MemoryHook } from "./MemoryHook";

export interface CorrectFeedbackProps {
  /** Brief positive acknowledgement, e.g. "Exactly." */
  acknowledgement: string;
  /** Why the answer works. */
  explanation: string;
  /** Short memorable phrase. */
  memoryHook: string;
  /** Optional small progress gain, e.g. "+1 concept understood". */
  progressGain?: string;
  className?: string;
}

/**
 * CorrectFeedback — presentational only. Receives resolved data via props.
 * Deliberately calm: no confetti, no exclamation storm. One clean tick,
 * an explanation, a memory hook, and a small optional progress line.
 */
export function CorrectFeedback({
  acknowledgement,
  explanation,
  memoryHook,
  progressGain,
  className,
}: CorrectFeedbackProps) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-success/20 text-success ring-1 ring-success/30"
        >
          <Check className="size-5" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-success">
            Nice — you've got it
          </div>
          <p className="mt-1 font-display text-[20px] font-semibold leading-snug tracking-tight text-foreground">
            {acknowledgement}
          </p>
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-foreground/85">{explanation}</p>

      <MemoryHook>{memoryHook}</MemoryHook>

      {progressGain ? (
        <div className="flex items-center gap-2 text-[12px] font-medium text-foreground/70">
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-success" />
          {progressGain}
        </div>
      ) : null}
    </div>
  );
}
