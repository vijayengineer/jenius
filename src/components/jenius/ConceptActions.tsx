import * as React from "react";
import { Bookmark, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConceptActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  saved?: boolean;
  onSave?: () => void;
  onGotIt?: () => void;
  onExplainMore?: () => void;
}

interface RailButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

function RailButton({ label, active, onClick, children }: RailButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group flex flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          "glass grid size-11 place-items-center rounded-full transition-swift",
          "group-hover:bg-white/12 group-active:scale-95",
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
 * ConceptActions — compact vertical rail used inside a Discover FeedCard.
 * Three actions: Save, Got it?, Explain more.
 *
 * - "Got it?" is a placeholder trigger for the future challenge experience.
 * - "Explain more" is a placeholder for the online explain feature.
 *
 * Every action ships an icon + label so meaning never depends on shape alone.
 */
export const ConceptActions = React.forwardRef<HTMLDivElement, ConceptActionsProps>(
  ({ saved, onSave, onGotIt, onExplainMore, className, ...props }, ref) => {
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

        <RailButton label="Explain" onClick={onExplainMore}>
          <Sparkles className="size-5" />
        </RailButton>
      </div>
    );
  },
);
ConceptActions.displayName = "ConceptActions";
