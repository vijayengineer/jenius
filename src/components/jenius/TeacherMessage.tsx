import * as React from "react";
import { cn } from "@/lib/utils";
import { JeniusMark } from "./JeniusMark";

export interface TeacherMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional short heading, e.g. "Teacher note". */
  eyebrow?: string;
  children: React.ReactNode;
}

/**
 * TeacherMessage — a calm, glassy chat-style bubble for short explanations
 * from the "teacher" voice. Not a chatbot UI; it's a single monologue slot
 * that appears inside cards or sheets.
 */
export const TeacherMessage = React.forwardRef<HTMLDivElement, TeacherMessageProps>(
  ({ eyebrow = "Teacher", children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="note"
        aria-label={eyebrow}
        className={cn("glass flex gap-3 rounded-2xl p-4", className)}
        {...props}
      >
        <div className="mt-0.5 shrink-0">
          <JeniusMark size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-blue">
            {eyebrow}
          </div>
          <div className="mt-1 text-[15px] leading-relaxed text-foreground/90">{children}</div>
        </div>
      </div>
    );
  },
);
TeacherMessage.displayName = "TeacherMessage";
