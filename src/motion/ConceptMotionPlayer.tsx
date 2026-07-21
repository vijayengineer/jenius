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

  const loop = React.useCallback(() => {
    const video = videoRef.current;
    if (!video || loopTimerRef.current !== null) return;
    video.pause();
    setLoopVisible(false);
    loopTimerRef.current = window.setTimeout(() => {
      video.currentTime = asset.loopStart ?? asset.startTrim;
      loopTimerRef.current = null;
      if (shouldPlay) void video.play().catch(() => setFailed(true));
      window.requestAnimationFrame(() => setLoopVisible(true));
    }, asset.fadeDuration * 1000);
  }, [asset.fadeDuration, asset.loopStart, asset.startTrim, shouldPlay]);

  React.useEffect(() => {
    const video = videoRef.current;
    const loopEnd = asset.loopEnd ?? asset.endTrim;
    if (!video || !shouldPlay || !("requestVideoFrameCallback" in video)) return;
    let frameId = 0;
    const watchFrame: VideoFrameRequestCallback = (_now, metadata) => {
      if (metadata.mediaTime >= loopEnd - 1 / 60) {
        loop();
        frameId = video.requestVideoFrameCallback(watchFrame);
        return;
      }
      frameId = video.requestVideoFrameCallback(watchFrame);
    };
    frameId = video.requestVideoFrameCallback(watchFrame);
    return () => video.cancelVideoFrameCallback(frameId);
  }, [asset.endTrim, asset.loopEnd, loop, shouldPlay]);

  const showPoster = reducedMotion || !active || failed;

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div
        role="img"
        aria-label={alt}
        data-concept-motion-canvas
        className="relative h-[clamp(220px,34dvh,340px)] w-full overflow-hidden rounded-xl"
      >
        {showPoster && asset.posterUrl ? (
          <img
            src={asset.posterUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-contain"
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
            className="absolute inset-0 size-full object-contain"
            style={{
              opacity: loopVisible ? 1 : 0,
              transition: `opacity ${asset.fadeDuration}s ease`,
            }}
          />
        ) : null}
      </div>
      {caption ? (
        <figcaption className="px-5 text-xs text-foreground/70">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
