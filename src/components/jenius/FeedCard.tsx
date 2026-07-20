import * as React from "react";
import { cn } from "@/lib/utils";
import type { MediaSlotData, SubjectId } from "@/lib/jenius/types";
import { MediaSlot } from "./MediaSlot";
import { SubjectChip } from "./SubjectChip";
import { JeniusMark } from "./JeniusMark";

export interface FeedCardProps extends React.HTMLAttributes<HTMLElement> {
  subject?: SubjectId;
  eyebrow?: string;
  title: string;
  body?: React.ReactNode;
  media?: MediaSlotData | null;
  /** Slot for FeedActions rail; positioned along the right edge. */
  actions?: React.ReactNode;
  /** Slot for FeedProgress; positioned at the top. */
  progress?: React.ReactNode;
  /** Footer slot for CTA row, e.g. Continue / Show me why. */
  footer?: React.ReactNode;
  /** Show the Jenius watermark on generated content. */
  watermark?: boolean;
}

/**
 * FeedCard — full-screen vertical card, the atomic unit of the Jenius feed.
 * Mobile-first: fills the viewport height minus safe areas. On desktop it
 * remains capped by the AppShell's centred column.
 */
export const FeedCard = React.forwardRef<HTMLElement, FeedCardProps>(
  (
    {
      subject,
      eyebrow,
      title,
      body,
      media,
      actions,
      progress,
      footer,
      watermark = true,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <article
        ref={ref}
        className={cn(
          "relative flex h-[100dvh] w-full flex-col overflow-hidden",
          "px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-[max(env(safe-area-inset-top),1rem)]",
          className,
        )}
        {...props}
      >
        {progress ? <div className="pb-3">{progress}</div> : null}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {subject ? <SubjectChip subject={subject} size="sm" /> : null}
            {eyebrow ? (
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
          </div>
        </div>

        {media ? (
          <div className="mt-5">
            <MediaSlot media={media} />
          </div>
        ) : null}

        <div className="mt-6 flex flex-1 flex-col justify-end">
          <h2 className="gradient-text font-display text-[34px] font-semibold leading-[1.05] tracking-tight">
            {title}
          </h2>
          {body ? (
            <div className="mt-4 text-[17px] leading-relaxed text-foreground/85">{body}</div>
          ) : null}

          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>

        {actions ? (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <div className="pointer-events-auto">{actions}</div>
          </div>
        ) : null}

        {watermark ? (
          <div className="pointer-events-none absolute right-4 top-3 opacity-40">
            <JeniusMark size={20} tone="mono" />
          </div>
        ) : null}
      </article>
    );
  },
);
FeedCard.displayName = "FeedCard";
