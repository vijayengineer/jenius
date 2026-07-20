import type {
  ExplanationPayload,
  ExplanationStyle,
  GeneratedConcept,
} from "../../../shared/contracts.js";

export type UsageKind = "explain" | "generate";

export interface ExplanationCacheRecord {
  cacheKey: string;
  conceptId: string;
  style: ExplanationStyle;
  payload: ExplanationPayload;
  promptVersion: string;
  model: string;
  createdAt: string;
  expiresAt: string;
  cachePolicy: "reusable-30-days";
}

export interface GeneratedConceptRecord {
  generatedConceptId: string;
  normalizedTopic: string;
  payload: GeneratedConcept;
  promptVersion: string;
  model: string;
  createdAt: string;
  requestFingerprint: string;
}

export interface UsageResult {
  allowed: boolean;
  count: number;
  limit: number;
}

export interface JeniusRepository {
  checkReadiness(): Promise<boolean>;
  getExplanation(cacheKey: string): Promise<ExplanationCacheRecord | null>;
  saveExplanation(record: ExplanationCacheRecord): Promise<void>;
  saveGeneratedConcept(record: GeneratedConceptRecord): Promise<void>;
  consumeUsage(input: {
    fingerprint: string;
    kind: UsageKind;
    day: string;
    limit: number;
  }): Promise<UsageResult>;
}
