import * as React from "react";
import { Chip, type ChipProps } from "@/components/ui/chip";
import { SUBJECTS, type SubjectId } from "@/lib/jenius/types";
import { cn } from "@/lib/utils";

export interface SubjectChipProps extends Omit<ChipProps, "children"> {
  subject: SubjectId;
  /** Override the default subject label. */
  label?: string;
  /** Show the coloured subject dot. Defaults to true. */
  withDot?: boolean;
}

const dotClassBySubject: Record<SubjectId, string> = {
  math: "bg-subject-math",
  science: "bg-subject-science",
  history: "bg-subject-history",
  language: "bg-subject-language",
  tech: "bg-subject-tech",
  arts: "bg-subject-arts",
  mind: "bg-subject-mind",
  life: "bg-subject-life",
};

/**
 * SubjectChip — a Chip preset that shows a subject with its dedicated
 * accent colour. Selected state uses the shared brand gradient so the
 * feed remains visually calm.
 */
export const SubjectChip = React.forwardRef<HTMLButtonElement, SubjectChipProps>(
  ({ subject, label, withDot = true, className, active, ...props }, ref) => {
    const meta = SUBJECTS[subject];
    return (
      <Chip
        ref={ref}
        active={active}
        aria-pressed={active}
        aria-label={`Subject: ${meta.label}`}
        className={cn(className)}
        {...props}
      >
        {withDot ? (
          <span
            aria-hidden
            className={cn("size-2 rounded-full", active ? "bg-white" : dotClassBySubject[subject])}
          />
        ) : null}
        <span>{label ?? meta.label}</span>
      </Chip>
    );
  },
);
SubjectChip.displayName = "SubjectChip";
