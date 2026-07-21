import * as React from "react";
import { getConceptMotionAsset, getMotionAsset, MOTION_ASSET_IDS } from "./manifest";
import { MotionController } from "./controller";
import { MotionContext } from "./context";
import { getMotionStartTime, hasReachedMotionEnd } from "./playback";
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

interface MotionLayer {
  request: MotionRequest;
  visible: boolean;
}

function TransientMotionSurface({
  request,
  controller,
}: {
  request: MotionRequest | null;
  controller: MotionController;
}) {
  const [layers, setLayers] = React.useState<MotionLayer[]>([]);
  const timersRef = React.useRef<number[]>([]);
  const layersRef = React.useRef<MotionLayer[]>([]);
  layersRef.current = layers;

  React.useEffect(() => {
    const existing = request
      ? layersRef.current.find((layer) => layer.request.requestId === request.requestId)
      : undefined;
    if (existing) {
      setLayers((current) =>
        current.map((layer) =>
          layer.request.requestId === request?.requestId ? { ...layer, request } : layer,
        ),
      );
      return;
    }

    setLayers((current) => {
      const outgoing = current.slice(-1).map((layer) => ({ ...layer, visible: false }));
      return request ? [...outgoing, { request, visible: false }] : outgoing;
    });

    if (request) {
      const frame = window.requestAnimationFrame(() => {
        setLayers((current) =>
          current.map((layer) =>
            layer.request.requestId === request.requestId ? { ...layer, visible: true } : layer,
          ),
        );
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
      setLayers((current) => current.filter((layer) => layer.visible));
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
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      {layers.map((layer) => (
        <TransientMotionClip
          key={layer.request.requestId}
          layer={layer}
          onComplete={() => controller.complete(layer.request.requestId)}
        />
      ))}
    </div>
  );
}

function TransientMotionClip({
  layer,
  onComplete,
}: {
  layer: MotionLayer;
  onComplete: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const asset = getMotionAsset(layer.request.assetId);

  const start = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = getMotionStartTime(asset, video.currentTime);
    if (!layer.request.paused) void video.play().catch(onComplete);
  }, [asset, layer.request.paused, onComplete]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (layer.request.paused) video.pause();
    else start();
  }, [layer.request.paused, start]);

  return (
    <video
      ref={videoRef}
      src={asset.url}
      muted
      playsInline
      autoPlay={!layer.request.paused}
      preload={asset.preloadPriority === "critical" ? "auto" : "metadata"}
      tabIndex={-1}
      onLoadedMetadata={start}
      onTimeUpdate={(event) => {
        if (hasReachedMotionEnd(asset, event.currentTarget.currentTime)) onComplete();
      }}
      onEnded={onComplete}
      onError={onComplete}
      className="absolute inset-0 size-full object-cover mix-blend-screen"
      style={{
        opacity: layer.visible ? 0.38 : 0,
        transition: `opacity ${asset.fadeDuration}s ease`,
        maskImage: "radial-gradient(ellipse at center, black 20%, transparent 72%)",
      }}
    />
  );
}
