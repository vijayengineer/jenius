import * as React from "react";
import { getConceptMotionAsset, getMotionAsset, MOTION_ASSET_IDS } from "./manifest";
import { MotionController } from "./controller";
import { MotionContext } from "./context";
import {
  getMotionStartTime,
  hasReachedMotionEnd,
  reconcileMotionLayers,
  retainVisibleMotionLayers,
  revealMotionLayer,
  type MotionLayerState,
} from "./playback";
import type { MotionConceptId, MotionEngine, MotionRequest } from "./types";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const controllerRef = React.useRef<MotionController | null>(null);
  if (!controllerRef.current) controllerRef.current = new MotionController();
  const controller = controllerRef.current;
  const [snapshot, setSnapshot] = React.useState(controller.getSnapshot);
  const preloadLinksRef = React.useRef(new Map<string, HTMLLinkElement>());

  React.useEffect(() => controller.subscribe(setSnapshot), [controller]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => controller.setReducedMotion(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, [controller]);

  React.useEffect(() => {
    const sync = () => controller.setDocumentHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [controller]);

  const syncPreloadLinks = React.useCallback((conceptIds: MotionConceptId[]) => {
    const desired = new Map<
      string,
      { url: string; as: "video" | "image"; rel: "preload" | "prefetch" }
    >();
    for (const assetId of MOTION_ASSET_IDS) {
      const asset = getMotionAsset(assetId);
      if (asset.preloadPriority === "critical")
        desired.set(asset.url, { url: asset.url, as: "video", rel: "preload" });
    }
    for (const conceptId of conceptIds) {
      const asset = getConceptMotionAsset(conceptId);
      desired.set(asset.url, { url: asset.url, as: "video", rel: "prefetch" });
      if (asset.posterUrl)
        desired.set(asset.posterUrl, { url: asset.posterUrl, as: "image", rel: "prefetch" });
    }

    for (const [url, link] of preloadLinksRef.current) {
      if (!desired.has(url)) {
        link.remove();
        preloadLinksRef.current.delete(url);
      }
    }
    for (const { url, as, rel } of desired.values()) {
      if (preloadLinksRef.current.has(url)) continue;
      const link = document.createElement("link");
      link.rel = rel;
      link.as = as;
      link.href = url;
      document.head.append(link);
      preloadLinksRef.current.set(url, link);
    }
  }, []);

  React.useEffect(() => {
    const preloadLinks = preloadLinksRef.current;
    syncPreloadLinks([]);
    return () => {
      preloadLinks.forEach((link) => link.remove());
      preloadLinks.clear();
      controller.dispose();
    };
  }, [controller, syncPreloadLinks]);

  const engine = React.useMemo<MotionEngine>(
    () => ({
      playCuriosity: () => controller.play("curiosity"),
      playTransition: () => controller.play("transition"),
      playMisunderstanding: () => controller.play("misunderstanding"),
      playSuccess: () => controller.play("success"),
      playCompletion: () => controller.play("completion"),
      playConcept: (conceptId) => controller.play(`concept-${conceptId}`),
      preloadConcepts: syncPreloadLinks,
      stop: () => controller.stop(),
      reducedMotion: snapshot.reducedMotion,
      documentHidden: snapshot.documentHidden,
    }),
    [controller, snapshot.documentHidden, snapshot.reducedMotion, syncPreloadLinks],
  );

  const value = React.useMemo(
    () => ({ engine, controller, snapshot }),
    [controller, engine, snapshot],
  );

  return (
    <MotionContext.Provider value={value}>
      {children}
      <TransientMotionSurface request={snapshot.request} controller={controller} />
    </MotionContext.Provider>
  );
}

function TransientMotionSurface({
  request,
  controller,
}: {
  request: MotionRequest | null;
  controller: MotionController;
}) {
  const [layers, setLayers] = React.useState<MotionLayerState[]>([]);
  const timersRef = React.useRef<number[]>([]);
  const layersRef = React.useRef<MotionLayerState[]>([]);
  layersRef.current = layers;

  React.useEffect(() => {
    const existing = request?.requestId
      ? layersRef.current.some((layer) => layer.request.requestId === request.requestId)
      : false;
    if (existing) {
      setLayers((current) => reconcileMotionLayers(current, request));
      return;
    }

    setLayers((current) => reconcileMotionLayers(current, request));

    if (request) {
      const frame = window.requestAnimationFrame(() => {
        setLayers((current) => revealMotionLayer(current, request.requestId));
      });
      timersRef.current.push(frame);
    }

    const longestFade = Math.max(
      250,
      ...layersRef.current.map(({ request: layerRequest }) =>
        Math.round(getMotionAsset(layerRequest.assetId).fadeDuration * 1000),
      ),
    );
    const timer = window.setTimeout(() => {
      setLayers(retainVisibleMotionLayers);
    }, longestFade + 40);
    timersRef.current.push(timer);
  }, [request]);

  React.useEffect(
    () => () => {
      timersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
        window.cancelAnimationFrame(timer);
      });
    },
    [],
  );

  if (layers.length === 0) return null;
  const visiblePlayers = layers.filter((layer) => layer.visible).length;
  return (
    <div
      aria-hidden
      data-motion-stage
      data-visible-players={visiblePlayers}
      className="pointer-events-none fixed inset-0 z-[55] min-h-[100dvh] overflow-hidden"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      <div className="absolute inset-x-0 top-[env(safe-area-inset-top)] bottom-[env(safe-area-inset-bottom)] overflow-hidden">
        {layers.map((layer) => (
          <TransientMotionClip
            key={layer.request.requestId}
            layer={layer}
            onComplete={() => controller.complete(layer.request.requestId)}
          />
        ))}
      </div>
    </div>
  );
}

function TransientMotionClip({
  layer,
  onComplete,
}: {
  layer: MotionLayerState;
  onComplete: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const preparedRef = React.useRef(false);
  const asset = getMotionAsset(layer.request.assetId);

  const prepare = React.useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA) return;
    video.currentTime = getMotionStartTime(asset, video.currentTime);
    preparedRef.current = true;
  }, [asset]);

  const playWhenReady = React.useCallback(() => {
    const video = videoRef.current;
    if (!video || layer.request.paused) return;
    if (!preparedRef.current) prepare();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      void video.play().catch(onComplete);
    }
  }, [layer.request.paused, onComplete, prepare]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (layer.request.paused) video.pause();
    else playWhenReady();
  }, [layer.request.paused, playWhenReady]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !("requestVideoFrameCallback" in video)) return;
    let frameId = 0;
    const watchFrame: VideoFrameRequestCallback = (_now, metadata) => {
      if (metadata.mediaTime >= asset.endTrim - 1 / 60) {
        video.pause();
        onComplete();
        return;
      }
      frameId = video.requestVideoFrameCallback(watchFrame);
    };
    frameId = video.requestVideoFrameCallback(watchFrame);
    return () => video.cancelVideoFrameCallback(frameId);
  }, [asset.endTrim, onComplete]);

  return (
    <video
      ref={videoRef}
      src={asset.url}
      muted
      playsInline
      preload={asset.preloadPriority === "critical" ? "auto" : "metadata"}
      tabIndex={-1}
      data-motion-player
      data-motion-asset={asset.id}
      data-motion-visible={layer.visible}
      onLoadedMetadata={prepare}
      onCanPlay={playWhenReady}
      onTimeUpdate={(event) => {
        if (hasReachedMotionEnd(asset, event.currentTarget.currentTime)) onComplete();
      }}
      onEnded={onComplete}
      onError={onComplete}
      className="absolute left-1/2 top-1/2 h-[min(68dvh,640px)] w-[min(100vw,520px)] -translate-x-1/2 -translate-y-1/2 object-cover"
      style={{
        opacity: layer.visible ? 0.92 : 0,
        transition: `opacity ${asset.fadeDuration}s ease`,
        maskImage:
          asset.id === "success"
            ? "linear-gradient(to bottom, transparent 3%, black 18%, black 54%, transparent 70%)"
            : "radial-gradient(ellipse at 50% 46%, black 18%, transparent 70%)",
      }}
    />
  );
}
