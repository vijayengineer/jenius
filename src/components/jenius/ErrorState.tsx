import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecondaryButton } from "./SecondaryButton";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: React.ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
}

/**
 * ErrorState — calm, non-alarming error surface. Icon + text (never colour
 * alone). Retry callback is optional; when absent the button is hidden.
 */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title = "Something went sideways",
      description = "We couldn't load this card. Give it another try.",
      retryLabel = "Try again",
      onRetry,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "glass mx-auto flex max-w-sm flex-col items-center gap-4 rounded-3xl p-8 text-center",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="grid size-14 place-items-center rounded-2xl bg-misconception/20 text-misconception"
        >
          <AlertTriangle className="size-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {onRetry ? (
          <SecondaryButton onClick={onRetry} size="md">
            {retryLabel}
          </SecondaryButton>
        ) : null}
      </div>
    );
  },
);
ErrorState.displayName = "ErrorState";
