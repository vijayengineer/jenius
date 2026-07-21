import type { MotionAsset } from "./types";

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
