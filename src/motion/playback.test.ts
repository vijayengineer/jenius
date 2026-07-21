import { describe, expect, it } from "vitest";
import { getConceptMotionAsset, getMotionAsset } from "./manifest";
import { getMotionStartTime, hasReachedMotionEnd, hasReachedMotionLoop } from "./playback";

describe("motion playback boundaries", () => {
  it("starts trimmed clips at their configured beginning", () => {
    const curiosity = getMotionAsset("curiosity");
    expect(getMotionStartTime(curiosity, 0)).toBe(curiosity.startTrim);
    expect(getMotionStartTime(curiosity, 0.4)).toBe(0.4);
    expect(hasReachedMotionEnd(curiosity, 0.94)).toBe(false);
    expect(hasReachedMotionEnd(curiosity, curiosity.endTrim)).toBe(true);
  });

  it("returns concept cinematics to the configured loop start", () => {
    const volcano = getConceptMotionAsset("volcano");
    expect(hasReachedMotionLoop(volcano, volcano.loopEnd! - 0.01)).toBe(false);
    expect(hasReachedMotionLoop(volcano, volcano.loopEnd!)).toBe(true);
    expect(getMotionStartTime(volcano, volcano.endTrim)).toBe(volcano.startTrim);
  });
});
