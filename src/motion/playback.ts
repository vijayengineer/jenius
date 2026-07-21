import type { MotionAsset, MotionRequest } from "./types";

export interface MotionLayerState {
  request: MotionRequest;
  visible: boolean;
}

export function reconcileMotionLayers(
  current: MotionLayerState[],
  request: MotionRequest | null,
): MotionLayerState[] {
  if (request && current.some((layer) => layer.request.requestId === request.requestId)) {
    return current.map((layer) =>
      layer.request.requestId === request.requestId ? { ...layer, request } : layer,
    );
  }
  const outgoing = current.slice(-1).map((layer) => ({ ...layer, visible: false }));
  return request ? [...outgoing, { request, visible: false }] : outgoing;
}

export function revealMotionLayer(current: MotionLayerState[], requestId: number) {
  return current.map((layer) => ({
    ...layer,
    visible: layer.request.requestId === requestId,
  }));
}

export function retainVisibleMotionLayers(current: MotionLayerState[]) {
  return current.filter((layer) => layer.visible);
}

export function getMotionStartTime(asset: MotionAsset, currentTime: number) {
  if (currentTime < asset.startTrim || currentTime >= asset.endTrim) {
    return asset.startTrim;
  }
  return currentTime;
}

export function hasReachedMotionEnd(asset: MotionAsset, currentTime: number) {
  return currentTime >= asset.endTrim;
}

export function hasReachedMotionLoop(asset: MotionAsset, currentTime: number) {
  return currentTime >= (asset.loopEnd ?? asset.endTrim);
}
