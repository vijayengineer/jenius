import * as React from "react";
import type { MediaSlotData } from "@/lib/jenius/types";
import { cn } from "@/lib/utils";

export interface MediaSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  media?: MediaSlotData | null;
}

/**
 * MediaSlot — reusable optional media area for FeedCards.
 *
 * Modes:
 *  - video, diagram, image → rendered as coloured placeholder shapes
 *    (Stage 1 does not use remote media).
 *  - text → returns null so the caller collapses the media area entirely
 *    rather than leaving a large empty frame.
 *
 * Media modes preserve a stable aspect ratio via CSS `aspect-ratio`.
 */
export const MediaSlot = React.forwardRef<HTMLDivElement, MediaSlotProps>(
  ({ media, className, ...props }, ref) => {
    if (!media || media.mode === "text") return null;

    const ratio = media.aspectRatio ?? 4 / 5;

    return (
      <div
        ref={ref}
        role="img"
        aria-label={media.alt ?? `${media.mode} media`}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-white/8",
          "gradient-brand-soft",
          className,
        )}
        style={{ aspectRatio: ratio, background: "var(--gradient-brand-soft)" }}
        {...props}
      >
        {media.mode === "video" ? <VideoPlaceholder /> : null}
        {media.mode === "diagram" ? <DiagramPlaceholder /> : null}
        {media.mode === "image" ? <ImagePlaceholder /> : null}
      </div>
    );
  },
);
MediaSlot.displayName = "MediaSlot";

function VideoPlaceholder() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="glass-strong grid size-16 place-items-center rounded-full">
        <svg viewBox="0 0 24 24" className="size-6 translate-x-[1px] fill-white/90">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

function DiagramPlaceholder() {
  return (
    <svg viewBox="0 0 200 250" className="absolute inset-0 size-full">
      <g fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="1.5">
        <circle cx="100" cy="125" r="70" />
        <circle cx="100" cy="125" r="42" />
        <circle cx="100" cy="125" r="16" />
        <line x1="10" y1="125" x2="190" y2="125" />
        <line x1="100" y1="20" x2="100" y2="230" />
      </g>
      <circle cx="100" cy="125" r="4" fill="white" />
    </svg>
  );
}

function ImagePlaceholder() {
  return (
    <svg viewBox="0 0 200 250" className="absolute inset-0 size-full">
      <defs>
        <linearGradient id="ms-img" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.68 0.19 258)" stopOpacity="0.6" />
          <stop offset="1" stopColor="oklch(0.60 0.24 305)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="200" height="250" fill="url(#ms-img)" />
      <circle cx="150" cy="70" r="24" fill="white" fillOpacity="0.7" />
      <path d="M0 210 L60 150 L110 190 L160 140 L200 180 L200 250 L0 250 Z" fill="white" fillOpacity="0.35" />
    </svg>
  );
}
