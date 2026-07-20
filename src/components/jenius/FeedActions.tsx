import * as React from "react";
import { Bookmark, Heart, Share2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  liked?: boolean;
  saved?: boolean;
  mindBlown?: boolean;
  onLike?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onMindBlown?: () => void;
}

interface ActionButtonProps {
  label: string;
  active?: boolean;
  activeClass?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

function ActionButton({ label, active, activeClass, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "glass grid size-12 place-items-center rounded-full text-foreground/85",
        "transition-swift hover:bg-white/12 active:scale-[0.94]",
        active && activeClass,
      )}
    >
      {children}
    </button>
  );
}

/**
 * FeedActions — vertical rail of feed reactions (Like, Mind Blown, Save,
 * Share). Callbacks are placeholders; real handlers arrive later.
 */
export const FeedActions = React.forwardRef<HTMLDivElement, FeedActionsProps>(
  ({ liked, saved, mindBlown, onLike, onSave, onShare, onMindBlown, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col items-center gap-3", className)} {...props}>
        <ActionButton
          label={liked ? "Unlike" : "Like"}
          active={liked}
          activeClass="text-brand-blue"
          onClick={onLike}
        >
          <Heart className={cn("size-5", liked && "fill-current")} />
        </ActionButton>

        <ActionButton
          label={mindBlown ? "Remove Mind Blown" : "Mark Mind Blown"}
          active={mindBlown}
          activeClass="text-mind-blown"
          onClick={onMindBlown}
        >
          <Sparkles className={cn("size-5", mindBlown && "fill-current")} />
        </ActionButton>

        <ActionButton
          label={saved ? "Remove from saved" : "Save"}
          active={saved}
          activeClass="text-foreground"
          onClick={onSave}
        >
          <Bookmark className={cn("size-5", saved && "fill-current")} />
        </ActionButton>

        <ActionButton label="Share" onClick={onShare}>
          <Share2 className="size-5" />
        </ActionButton>
      </div>
    );
  },
);
FeedActions.displayName = "FeedActions";
