import * as React from "react";
import { Bookmark, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConceptActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  saved?: boolean;
  onSave?: () => void;
  onGotIt?: () => void;
  onExplainMore?: () => void;
  /** Disable Explain more (e.g. offline + no cached response). */
  explainDisabled?: boolean;
  /** Optional helper text to explain why an action is disabled. */
  explainHint?: string;
}

interface RailButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  ariaDescribedby?: string;
  children: React.ReactNode;
}

function RailButton({
  label,
  active,
  disabled,
  onClick,
  ariaDescribedby,
  children,
}: RailButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-describedby={ariaDescribedby}
      disabled={disabled}
      className={cn(
        "group flex flex-col items-center gap-1.5",
        "focus-visible:outline-none",
        disabled && "opacity-45 pointer-events-none",
      )}
    >
      <span
        className={cn(
          "glass grid size-11 place-items-center rounded-full transition-swift",
          "group-hover:bg-white/12 group-active:scale-95",
          "group-focus-visible:ring-2 group-focus-visible:ring-brand-blue",
          active && "bg-white/20 text-brand-blue",
        )}
      >
        {children}
      </span>
      <span className="text-[11px] font-medium leading-none text-foreground/80">
        {label}
      </span>
    </button>
  );
}

/**
 * ConceptActions — compact vertical rail. Explain more can be disabled
 * with a visible hint (never colour alone) when no cached response exists.
 */
export const ConceptActions = React.forwardRef<HTMLDivElement, ConceptActionsProps>(
  (
    {
      saved,
      onSave,
      onGotIt,
      onExplainMore,
      explainDisabled,
      explainHint,
      className,
      ...props
    },
    ref,
  ) => {
    const hintId = React.useId();
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center gap-4", className)}
        {...props}
      >
        <RailButton
          label={saved ? "Saved" : "Save"}
          active={saved}
          onClick={onSave}
        >
          <Bookmark className={cn("size-5", saved && "fill-current")} />
        </RailButton>

        <RailButton label="Got it?" onClick={onGotIt}>
          <HelpCircle className="size-5" />
        </RailButton>

        <RailButton
          label="Explain"
          onClick={onExplainMore}
          disabled={explainDisabled}
          ariaDescribedby={explainDisabled && explainHint ? hintId : undefined}
        >
          <Sparkles className="size-5" />
        </RailButton>
        {explainDisabled && explainHint ? (
          <span
            id={hintId}
            className="max-w-[9rem] text-center text-[10px] leading-tight text-foreground/60"
          >
            {explainHint}
          </span>
        ) : null}
      </div>
    );
  },
);
ConceptActions.displayName = "ConceptActions";
