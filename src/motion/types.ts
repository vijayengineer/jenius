export type MotionAssetId =
  | "curiosity"
  | "transition"
  | "misunderstanding"
  | "success"
  | "completion"
  | "concept-dna"
  | "concept-seasons"
  | "concept-volcano"
  | "concept-flight"
  | "concept-falling";

export type MotionConceptId = "dna" | "seasons" | "volcano" | "flight" | "falling";
export type MotionPreloadPriority = "critical" | "nearby" | "lazy";

export interface MotionAsset {
  id: MotionAssetId;
  kind: "transition" | "concept";
  conceptId?: MotionConceptId;
  filename: string;
  url: string;
  posterFilename?: string;
  posterUrl?: string;
  startTrim: number;
  endTrim: number;
  loopStart?: number;
  loopEnd?: number;
  fadeDuration: number;
  preloadPriority: MotionPreloadPriority;
  duration: number;
  bytes: number;
  sha256: string;
  excludedRanges?: Array<{
    label: string;
    start: number;
    end: number;
  }>;
}

export type MotionPlaybackResult = "completed" | "interrupted" | "skipped";

export interface MotionHandle {
  requestId: number;
  assetId: MotionAssetId;
  finished: Promise<MotionPlaybackResult>;
  cancel: () => void;
}

export interface MotionRequest {
  requestId: number;
  assetId: MotionAssetId;
  paused: boolean;
}

export interface MotionSnapshot {
  request: MotionRequest | null;
  reducedMotion: boolean;
  documentHidden: boolean;
}

export interface MotionEngine {
  playCuriosity: () => MotionHandle;
  playTransition: () => MotionHandle;
  playMisunderstanding: () => MotionHandle;
  playSuccess: () => MotionHandle;
  playCompletion: () => MotionHandle;
  playConcept: (conceptId: MotionConceptId) => MotionHandle;
  preloadConcepts: (conceptIds: MotionConceptId[]) => void;
  stop: () => void;
  reducedMotion: boolean;
  documentHidden: boolean;
}
