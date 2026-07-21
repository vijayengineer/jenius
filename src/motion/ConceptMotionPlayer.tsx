import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionEnvironment } from "./context";
import { getConceptMotionAsset } from "./manifest";
import { getMotionStartTime, hasReachedMotionLoop } from "./playback";
import type { MotionConceptId } from "./types";

export interface ConceptMotionPlayerProps {
  conceptId: MotionConceptId;
  active: boolean;
  visible: boolean;
  alt: string;
  caption?: string;
  className?: string;
}

/** Engine-owned concept player. Feed presenters never access its video element. */
export function ConceptMotionPlayer({
  conceptId,
  active,
  visible,
  alt,
  caption,
  className,
}: ConceptMotionPlayerProps) {
  const { reducedMotion, documentHidden } = useMotionEnvironment();
  const asset = getConceptMotionAsset(conceptId);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const loopTimerRef = React.useRef<number | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [loopVisible, setLoopVisible] = React.useState(true);
  const shouldPlay = active && visible && !documentHidden && !reducedMotion && !failed;

  const start = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = getMotionStartTime(asset, video.currentTime);
    if (shouldPlay) void video.play().catch(() => setFailed(true));
  }, [asset, shouldPlay]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) start();
    else video.pause();
  }, [shouldPlay, start]);

  React.useEffect(
    () => () => {
      if (loopTimerRef.current !== null) window.clearTimeout(loopTimerRef.current);
    },
    [],
  );

  const loop = () => {
    const video = videoRef.current;
    if (!video || loopTimerRef.current !== null) return;
    setLoopVisible(false);
    loopTimerRef.current = window.setTimeout(() => {
      video.currentTime = asset.loopStart ?? asset.startTrim;
      loopTimerRef.current = null;
      if (shouldPlay) void video.play().catch(() => setFailed(true));
      window.requestAnimationFrame(() => setLoopVisible(true));
    }, asset.fadeDuration * 1000);
  };

  const showPoster = reducedMotion || !active || failed;

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div
        role="img"
        aria-label={alt}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 gradient-brand-soft"
      >
        {showPoster && asset.posterUrl ? (
          <img
            src={asset.posterUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
        ) : null}
        {active && !reducedMotion && !failed ? (
          <video
            ref={videoRef}
            src={asset.url}
            poster={asset.posterUrl}
            muted
            playsInline
            autoPlay={shouldPlay}
            preload="metadata"
            tabIndex={-1}
            aria-hidden
            onLoadedMetadata={start}
            onTimeUpdate={(event) => {
              if (hasReachedMotionLoop(asset, event.currentTarget.currentTime)) loop();
            }}
            onEnded={loop}
            onError={() => setFailed(true)}
            className="absolute inset-0 size-full object-cover"
            style={{
              opacity: loopVisible ? 1 : 0,
              transition: `opacity ${asset.fadeDuration}s ease`,
            }}
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
        />
      </div>
      {caption ? <figcaption className="text-xs text-foreground/70">{caption}</figcaption> : null}
    </figure>
  );
}
