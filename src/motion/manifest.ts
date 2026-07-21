import runtimeManifest from "../../assets/runtime/motion-manifest.json";
import completionUrl from "../../assets/runtime/completion.mp4?url";
import curiosityUrl from "../../assets/runtime/curiosity.mp4?url";
import dnaUrl from "../../assets/runtime/dna.mp4?url";
import fallingUrl from "../../assets/runtime/falling.mp4?url";
import flightUrl from "../../assets/runtime/flight.mp4?url";
import misunderstandingUrl from "../../assets/runtime/misunderstanding.mp4?url";
import seasonsUrl from "../../assets/runtime/seasons.mp4?url";
import successUrl from "../../assets/runtime/success.mp4?url";
import transitionUrl from "../../assets/runtime/transition.mp4?url";
import volcanoUrl from "../../assets/runtime/volcano.mp4?url";
import dnaPosterUrl from "../../assets/runtime/dna-poster.jpg?url";
import fallingPosterUrl from "../../assets/runtime/falling-poster.jpg?url";
import flightPosterUrl from "../../assets/runtime/flight-poster.jpg?url";
import seasonsPosterUrl from "../../assets/runtime/seasons-poster.jpg?url";
import volcanoPosterUrl from "../../assets/runtime/volcano-poster.jpg?url";
import type { MotionAsset, MotionAssetId, MotionConceptId } from "./types";

const assetUrls: Record<string, string> = {
  "completion.mp4": completionUrl,
  "curiosity.mp4": curiosityUrl,
  "dna.mp4": dnaUrl,
  "falling.mp4": fallingUrl,
  "flight.mp4": flightUrl,
  "misunderstanding.mp4": misunderstandingUrl,
  "seasons.mp4": seasonsUrl,
  "success.mp4": successUrl,
  "transition.mp4": transitionUrl,
  "volcano.mp4": volcanoUrl,
};

const posterUrls: Record<string, string> = {
  "dna-poster.jpg": dnaPosterUrl,
  "falling-poster.jpg": fallingPosterUrl,
  "flight-poster.jpg": flightPosterUrl,
  "seasons-poster.jpg": seasonsPosterUrl,
  "volcano-poster.jpg": volcanoPosterUrl,
};

function parseManifest(): Record<MotionAssetId, MotionAsset> {
  const parsed = {} as Record<MotionAssetId, MotionAsset>;
  for (const raw of runtimeManifest.assets) {
    const url = assetUrls[raw.filename];
    if (!url) throw new Error(`Motion runtime URL is missing for ${raw.filename}`);
    const id = raw.id as MotionAssetId;
    parsed[id] = {
      ...raw,
      id,
      kind: raw.kind as MotionAsset["kind"],
      conceptId: raw.conceptId as MotionConceptId | undefined,
      preloadPriority: raw.preloadPriority as MotionAsset["preloadPriority"],
      url,
      posterUrl: raw.posterFilename ? posterUrls[raw.posterFilename] : undefined,
    };
  }
  return parsed;
}

export const MOTION_MANIFEST = parseManifest();

export const MOTION_ASSET_IDS = Object.keys(MOTION_MANIFEST) as MotionAssetId[];

export function getMotionAsset(assetId: MotionAssetId) {
  return MOTION_MANIFEST[assetId];
}

export function getConceptMotionAsset(conceptId: MotionConceptId) {
  return MOTION_MANIFEST[`concept-${conceptId}`];
}

const lessonConceptMotion: Record<string, MotionConceptId | undefined> = {
  dna: "dna",
  seasons: "seasons",
  volcanoes: "volcano",
  planes: "flight",
  falling: "falling",
};

export function getMotionConceptForLesson(lessonConceptId: string | null | undefined) {
  return lessonConceptId ? (lessonConceptMotion[lessonConceptId] ?? null) : null;
}
