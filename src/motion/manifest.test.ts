import { describe, expect, it } from "vitest";
import { MOTION_ASSET_IDS, MOTION_MANIFEST, getConceptMotionAsset } from "./manifest";

describe("motion manifest", () => {
  it("keeps production trims and loop points in one validated manifest", () => {
    expect(MOTION_MANIFEST.curiosity).toMatchObject({
      startTrim: 0.15,
      endTrim: 0.95,
      preloadPriority: "critical",
    });
    expect(MOTION_MANIFEST.success).toMatchObject({ startTrim: 0.6, endTrim: 1.45 });
    expect(getConceptMotionAsset("volcano")).toMatchObject({
      loopStart: 0.7,
      loopEnd: 5.2,
    });
  });

  it.each(MOTION_ASSET_IDS)("keeps %s playback bounds within the source duration", (assetId) => {
    const asset = MOTION_MANIFEST[assetId];
    expect(asset.startTrim).toBeGreaterThanOrEqual(0);
    expect(asset.endTrim).toBeGreaterThan(asset.startTrim);
    expect(asset.endTrim).toBeLessThanOrEqual(asset.duration);
    expect(asset.fadeDuration * 2).toBeLessThan(asset.endTrim - asset.startTrim);
    if (asset.kind === "concept") {
      expect(asset.posterUrl).toBeTruthy();
      expect(asset.loopStart).toBeGreaterThanOrEqual(asset.startTrim);
      expect(asset.loopEnd).toBeLessThanOrEqual(asset.endTrim);
      expect(asset.loopEnd).toBeGreaterThan(asset.loopStart!);
    }
  });
});
