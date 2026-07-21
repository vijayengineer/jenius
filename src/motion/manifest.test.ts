import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  MOTION_ASSET_IDS,
  MOTION_MANIFEST,
  getConceptMotionAsset,
  getMotionConceptForLesson,
} from "./manifest";
import type { MotionConceptId } from "./types";

const productionLessonIds = [
  "seasons",
  "volcanoes",
  "deserts",
  "planes",
  "falling",
  "sky-blue",
  "dna",
  "leaves",
  "vaccines",
  "yawning",
] as const;

const transitionDurationBounds = {
  curiosity: [0.45, 0.75],
  transition: [0.4, 0.65],
  misunderstanding: [0.55, 0.85],
  success: [0.5, 0.8],
  completion: [0.8, 1.2],
} as const;

describe("motion manifest", () => {
  it("keeps production trims and loop points in one validated manifest", () => {
    expect(MOTION_MANIFEST.curiosity).toMatchObject({
      startTrim: 0.35,
      endTrim: 0.95,
      preloadPriority: "critical",
    });
    expect(MOTION_MANIFEST.success).toMatchObject({ startTrim: 1.3, endTrim: 2 });
    expect(getConceptMotionAsset("volcano")).toMatchObject({
      loopStart: 0.7,
      loopEnd: 5.2,
    });
  });

  it.each(Object.entries(transitionDurationBounds))(
    "keeps %s inside its production duration target",
    (assetId, [minimum, maximum]) => {
      const asset = MOTION_MANIFEST[assetId as keyof typeof transitionDurationBounds];
      const duration = asset.endTrim - asset.startTrim;
      expect(duration).toBeGreaterThanOrEqual(minimum);
      expect(duration).toBeLessThanOrEqual(maximum);
    },
  );

  it("keeps misunderstanding playback outside the audited equation frames", () => {
    const asset = MOTION_MANIFEST.misunderstanding;
    const equation = asset.excludedRanges?.find(({ label }) => label === "2 + 2 = 5");
    expect(equation).toEqual({ label: "2 + 2 = 5", start: 0, end: 3.6 });
    expect(asset.startTrim).toBeGreaterThan(equation!.end);
    expect(asset.endTrim - asset.startTrim).toBeCloseTo(0.75);
  });

  it("keeps production trim numbers sourced from motion.config.json", () => {
    const config = JSON.parse(
      readFileSync(new URL("../../assets/motion.config.json", import.meta.url), "utf8"),
    ) as {
      assets: Array<{ id: keyof typeof MOTION_MANIFEST; startTrim: number; endTrim: number }>;
    };
    for (const configured of config.assets) {
      expect(MOTION_MANIFEST[configured.id]).toMatchObject({
        startTrim: configured.startTrim,
        endTrim: configured.endTrim,
      });
    }

    for (const filename of ["MotionProvider.tsx", "ConceptMotionPlayer.tsx", "timeline.ts"]) {
      const source = readFileSync(new URL(filename, import.meta.url), "utf8");
      expect(source).not.toMatch(/(?:startTrim|endTrim|loopStart|loopEnd)\s*[:=]\s*\d/);
    }
  });

  it.each(productionLessonIds)(
    "resolves production lesson %s to a concept cinematic",
    (lessonId) => {
      const conceptId = getMotionConceptForLesson(lessonId);
      expect(conceptId).not.toBeNull();
      expect(getConceptMotionAsset(conceptId!)).toMatchObject({
        kind: "concept",
        conceptId,
        posterUrl: expect.any(String),
      });
    },
  );

  it("keeps source, runtime, and poster files present for every concept cinematic", () => {
    const config = JSON.parse(
      readFileSync(new URL("../../assets/motion.config.json", import.meta.url), "utf8"),
    ) as {
      assets: Array<{
        id: string;
        kind: "transition" | "concept";
        conceptId?: MotionConceptId;
        sourceFilename: string;
        filename: string;
        posterFilename?: string;
      }>;
    };
    const concepts = config.assets.filter(({ kind }) => kind === "concept");
    expect(concepts).toHaveLength(10);
    for (const asset of concepts) {
      expect(
        existsSync(new URL(`../../assets/source/${asset.sourceFilename}`, import.meta.url)),
      ).toBe(true);
      expect(existsSync(new URL(`../../assets/runtime/${asset.filename}`, import.meta.url))).toBe(
        true,
      );
      expect(asset.posterFilename).toBeTruthy();
      expect(
        existsSync(new URL(`../../assets/runtime/${asset.posterFilename}`, import.meta.url)),
      ).toBe(true);
    }
  });

  it("has no duplicate manifest keys, runtime files, concept ids, or posters", () => {
    const assets = Object.values(MOTION_MANIFEST);
    const uniqueCount = (values: Array<string | undefined>) =>
      new Set(values.filter((value): value is string => Boolean(value))).size;
    const concepts = assets.filter(({ kind }) => kind === "concept");

    expect(new Set(MOTION_ASSET_IDS).size).toBe(MOTION_ASSET_IDS.length);
    expect(uniqueCount(assets.map(({ filename }) => filename))).toBe(assets.length);
    expect(uniqueCount(concepts.map(({ conceptId }) => conceptId))).toBe(concepts.length);
    expect(uniqueCount(concepts.map(({ posterFilename }) => posterFilename))).toBe(concepts.length);
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
