import { describe, expect, it } from "vitest";
import { getConceptMotionAsset, getMotionAsset } from "./manifest";
import {
  getMotionStartTime,
  hasReachedMotionEnd,
  hasReachedMotionLoop,
  reconcileMotionLayers,
  retainVisibleMotionLayers,
  revealMotionLayer,
} from "./playback";

describe("motion playback boundaries", () => {
  it("starts trimmed clips at their configured beginning", () => {
    const curiosity = getMotionAsset("curiosity");
    expect(getMotionStartTime(curiosity, 0)).toBe(curiosity.startTrim);
    expect(getMotionStartTime(curiosity, 0.4)).toBe(0.4);
    expect(hasReachedMotionEnd(curiosity, 0.94)).toBe(false);
    expect(hasReachedMotionEnd(curiosity, curiosity.endTrim)).toBe(true);
  });

  it("crossfades with at most one visible transition player and cleans outgoing layers", () => {
    const first = { requestId: 1, assetId: "success" as const, paused: false };
    const second = { requestId: 2, assetId: "misunderstanding" as const, paused: false };
    let layers = revealMotionLayer(reconcileMotionLayers([], first), first.requestId);
    expect(layers.filter(({ visible }) => visible)).toHaveLength(1);

    layers = reconcileMotionLayers(layers, second);
    expect(layers).toHaveLength(2);
    expect(layers.filter(({ visible }) => visible)).toHaveLength(0);
    layers = revealMotionLayer(layers, second.requestId);
    expect(layers.filter(({ visible }) => visible).map(({ request }) => request.assetId)).toEqual([
      "misunderstanding",
    ]);
    expect(retainVisibleMotionLayers(layers)).toHaveLength(1);
    expect(retainVisibleMotionLayers(reconcileMotionLayers(layers, null))).toEqual([]);
  });

  it("returns concept cinematics to the configured loop start", () => {
    const volcano = getConceptMotionAsset("volcano");
    expect(hasReachedMotionLoop(volcano, volcano.loopEnd! - 0.01)).toBe(false);
    expect(hasReachedMotionLoop(volcano, volcano.loopEnd!)).toBe(true);
    expect(getMotionStartTime(volcano, volcano.endTrim)).toBe(volcano.startTrim);
  });
});
