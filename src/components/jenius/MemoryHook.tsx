import * as React from "react";
import { Anchor } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MemoryHookProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

/**
 * MemoryHook — highlights a mnemonic, analogy, or "remember it like this"
 * line so learners can lock the idea in. Deliberately compact and warm.
 */
export const MemoryHook = React.forwardRef<HTMLDivElement, MemoryHookProps>(
  ({ title = "Remember it like this", children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-label={title}
        className={cn(
          "flex gap-3 rounded-2xl border border-brand-violet/25 bg-brand-violet/10 p-4",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-violet/25 text-brand-violet"
        >
          <Anchor className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-violet">
            {title}
          </div>
          <div className="mt-1 text-[15px] leading-relaxed text-foreground/90">
            {children}
          </div>
        </div>
      </div>
    );
  },
);
MemoryHook.displayName = "MemoryHook";
