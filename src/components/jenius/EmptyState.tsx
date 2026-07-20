import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * EmptyState — reusable "nothing here yet" surface. Deliberately calm:
 * a soft glass panel with a single accent icon and one CTA slot.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass mx-auto flex max-w-sm flex-col items-center gap-4 rounded-3xl p-8 text-center",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="grid size-14 place-items-center rounded-2xl bg-brand-violet/20 text-brand-violet"
        >
          {icon ?? <Sparkles className="size-6" />}
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="w-full">{action}</div> : null}
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";
