import * as React from "react";
import {
  AlertTriangle,
  Captions,
  ImageOff,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaPlaybackState, MediaSlotData } from "@/lib/jenius/types";

export interface MediaSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  media?: MediaSlotData | null;
  /** Playback state for `video` media. Ignored for other modes. */
  playbackState?: MediaPlaybackState;
  /** True when captions are enabled. Purely presentational in Stage 1. */
  captionsOn?: boolean;
  /** True when audio is muted. */
  muted?: boolean;
  /** Honour the OS reduced-motion setting — show text/poster fallback. */
  reducedMotion?: boolean;
  /** Show a coloured "media unavailable" fallback and hide play controls. */
  failed?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onReplay?: () => void;
  onToggleCaptions?: () => void;
  onToggleMuted?: () => void;
}

/**
 * MediaSlot — production-ready presentation for future clips + diagrams.
 *
 * Modes:
 *  - video          → poster/play/pause/replay UI with mute + captions
 *                     indicators. Stage 1 never plays a remote file; the
 *                     component only advertises intent via `playbackState`.
 *  - svg / diagram  → inline vector diagram placeholder.
 *  - image          → placeholder still.
 *  - text / none    → collapses (returns null).
 *
 * The component is a pure presenter — the host decides state.
 */
export const MediaSlot = React.forwardRef<HTMLDivElement, MediaSlotProps>(
  (
    {
      media,
      playbackState = "poster",
      captionsOn = false,
      muted = true,
      reducedMotion = false,
      failed = false,
      onPlay,
      onPause,
      onReplay,
      onToggleCaptions,
      onToggleMuted,
      className,
      ...props
    },
    ref,
  ) => {
    if (!media || media.mode === "text" || media.mode === "none") return null;

    const ratio = media.aspectRatio ?? 4 / 5;
    const showTextFallback =
      failed || (reducedMotion && media.mode === "video" && !!media.textFallback);

    return (
      <figure className={cn("flex flex-col gap-2", className)}>
        <div
          ref={ref}
          role="group"
          aria-label={media.alt ?? `${media.mode} media`}
          className={cn(
            "relative w-full overflow-hidden rounded-2xl border border-white/10",
            "gradient-brand-soft",
          )}
          style={{ aspectRatio: ratio, background: "var(--gradient-brand-soft)" }}
          {...props}
        >
          {/* Future poster path is advisory only in Stage 1 — we render the
              placeholder shape instead of loading the file. */}
          {media.mode === "video" ? (
            <VideoShape />
          ) : media.mode === "svg" || media.mode === "diagram" ? (
            <DiagramShape />
          ) : media.mode === "image" ? (
            <ImageShape />
          ) : null}

          {/* Video controls + state overlay. */}
          {media.mode === "video" && !showTextFallback ? (
            <VideoControls
              state={playbackState}
              muted={muted}
              captionsOn={captionsOn}
              hasCaptions={media.hasCaptions}
              onPlay={onPlay}
              onPause={onPause}
              onReplay={onReplay}
              onToggleCaptions={onToggleCaptions}
              onToggleMuted={onToggleMuted}
            />
          ) : null}

          {/* Failed / reduced-motion overlay */}
          {showTextFallback ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 px-5 text-center backdrop-blur-sm">
              <div
                aria-hidden
                className="grid size-11 place-items-center rounded-full bg-misconception/15 text-misconception"
              >
                {failed ? <ImageOff className="size-5" /> : <AlertTriangle className="size-5" />}
              </div>
              <p className="max-w-[28ch] text-[13px] leading-snug text-foreground/85">
                {failed
                  ? "Media unavailable. Here's the idea in words:"
                  : "Motion reduced. Here's the idea in words:"}
              </p>
              <p className="max-w-[32ch] text-sm font-medium text-foreground">
                {media.textFallback ?? media.alt ?? ""}
              </p>
            </div>
          ) : null}

          {/* Future-path label — makes the intent obvious to reviewers. */}
          {media.src ? (
            <span
              className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/85"
              aria-hidden
            >
              {media.mode} · {media.src.replace(/^\//, "")}
            </span>
          ) : null}
        </div>

        {media.caption ? (
          <figcaption className="text-xs text-foreground/70">{media.caption}</figcaption>
        ) : null}
      </figure>
    );
  },
);
MediaSlot.displayName = "MediaSlot";

/* -------------------------------------------------------------------------- */
/* Video controls                                                             */
/* -------------------------------------------------------------------------- */

interface VideoControlsProps {
  state: MediaPlaybackState;
  muted: boolean;
  captionsOn: boolean;
  hasCaptions?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onReplay?: () => void;
  onToggleCaptions?: () => void;
  onToggleMuted?: () => void;
}

function VideoControls({
  state,
  muted,
  captionsOn,
  hasCaptions,
  onPlay,
  onPause,
  onReplay,
  onToggleCaptions,
  onToggleMuted,
}: VideoControlsProps) {
  const isLoading = state === "loading";
  const isPlaying = state === "playing";

  return (
    <>
      {/* Centre play/pause/replay button */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <button
          type="button"
          onClick={
            isPlaying
              ? onPause
              : state === "paused"
                ? onPlay
                : state === "poster"
                  ? onPlay
                  : onReplay
          }
          aria-label={
            isPlaying
              ? "Pause video"
              : state === "paused"
                ? "Resume video"
                : state === "poster"
                  ? "Play video"
                  : "Replay video"
          }
          className={cn(
            "pointer-events-auto grid size-16 place-items-center rounded-full transition-swift",
            "glass-strong hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            "active:scale-95",
            isLoading && "opacity-70",
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-6 animate-spin text-white/95" aria-hidden />
          ) : isPlaying ? (
            <Pause className="size-6 fill-white/95 text-white/95" aria-hidden />
          ) : state === "paused" || state === "poster" ? (
            <Play className="size-6 translate-x-[1px] fill-white/95 text-white/95" aria-hidden />
          ) : (
            <RotateCcw className="size-6 text-white/95" aria-hidden />
          )}
        </button>
      </div>

      {/* Bottom-right indicator cluster */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        {hasCaptions ? (
          <button
            type="button"
            onClick={onToggleCaptions}
            aria-label={captionsOn ? "Hide captions" : "Show captions"}
            aria-pressed={captionsOn}
            className={cn(
              "glass grid size-11 place-items-center rounded-full transition-swift",
              "hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-blue",
              captionsOn && "bg-white/25 text-brand-blue",
            )}
          >
            <Captions className="size-4" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleMuted}
          aria-label={muted ? "Unmute video" : "Mute video"}
          aria-pressed={!muted}
          className="glass grid size-11 place-items-center rounded-full transition-swift hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          {muted ? (
            <VolumeX className="size-4" aria-hidden />
          ) : (
            <Volume2 className="size-4" aria-hidden />
          )}
        </button>
      </div>

      {/* Loading text under the button for AT (screen readers) */}
      {isLoading ? (
        <span className="sr-only" role="status">
          Loading video…
        </span>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Static placeholder shapes                                                  */
/* -------------------------------------------------------------------------- */

function VideoShape() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(140% 90% at 30% 20%, rgba(255,255,255,0.28), transparent 60%), var(--gradient-brand)",
      }}
    />
  );
}

function DiagramShape() {
  return (
    <svg viewBox="0 0 200 250" className="absolute inset-0 size-full" aria-hidden>
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

function ImageShape() {
  return (
    <svg viewBox="0 0 200 250" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id="ms-img" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.68 0.19 258)" stopOpacity="0.6" />
          <stop offset="1" stopColor="oklch(0.60 0.24 305)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="200" height="250" fill="url(#ms-img)" />
      <circle cx="150" cy="70" r="24" fill="white" fillOpacity="0.7" />
      <path
        d="M0 210 L60 150 L110 190 L160 140 L200 180 L200 250 L0 250 Z"
        fill="white"
        fillOpacity="0.35"
      />
    </svg>
  );
}
