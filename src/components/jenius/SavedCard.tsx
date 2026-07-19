import * as React from "react";
import { Play, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubjectChip } from "./SubjectChip";
import type { SubjectId } from "@/lib/jenius/types";

export interface SavedCardProps {
  conceptId: string;
  subject: SubjectId;
  category: string;
  hook: string;
  takeaway: string;
  savedAtLabel: string;
  onReplay?: (conceptId: string) => void;
  onRemove?: (conceptId: string) => void;
  className?: string;
}

/**
 * SavedCard — compact card for the Saved screen. Not the full feed card.
 */
export function SavedCard({
  conceptId,
  subject,
  category,
  hook,
  takeaway,
  savedAtLabel,
  onReplay,
  onRemove,
  className,
}: SavedCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-3xl border border-white/8 bg-white/[0.04] p-4",
        "transition-swift hover:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <SubjectChip subject={subject} size="sm" label={category} />
        <span className="text-[11px] text-foreground/50">{savedAtLabel}</span>
      </div>

      <h3 className="font-display text-[17px] font-semibold leading-snug tracking-tight text-foreground">
        {hook}
      </h3>

      <p className="text-[13px] leading-relaxed text-foreground/70">
        <span className="text-foreground/50">Takeaway · </span>
        {takeaway}
      </p>

      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={() => onReplay?.(conceptId)}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/[0.06] text-[13px] font-medium text-foreground/90 transition-swift hover:bg-white/[0.12]"
        >
          <Play className="size-3.5" aria-hidden />
          Replay
        </button>
        <button
          type="button"
          onClick={() => onRemove?.(conceptId)}
          aria-label={`Remove ${hook} from saved`}
          className="flex h-9 w-11 items-center justify-center rounded-full bg-white/[0.04] text-foreground/60 transition-swift hover:bg-misconception/15 hover:text-misconception"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </article>
  );
}
