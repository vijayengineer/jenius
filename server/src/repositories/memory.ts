import type { ExplanationCacheRecord, GeneratedConceptRecord, JeniusRepository } from "./types.js";

export class MemoryJeniusRepository implements JeniusRepository {
  readonly explanations = new Map<string, ExplanationCacheRecord>();
  readonly generatedConcepts = new Map<string, GeneratedConceptRecord>();
  readonly usage = new Map<string, number>();

  constructor(private readonly ready = true) {}

  async checkReadiness(): Promise<boolean> {
    return this.ready;
  }

  async getExplanation(cacheKey: string): Promise<ExplanationCacheRecord | null> {
    const record = this.explanations.get(cacheKey);
    if (!record || new Date(record.expiresAt).getTime() <= Date.now()) return null;
    return structuredClone(record);
  }

  async saveExplanation(record: ExplanationCacheRecord): Promise<void> {
    this.explanations.set(record.cacheKey, structuredClone(record));
  }

  async saveGeneratedConcept(record: GeneratedConceptRecord): Promise<void> {
    this.generatedConcepts.set(record.generatedConceptId, structuredClone(record));
  }

  async consumeUsage(input: {
    fingerprint: string;
    kind: "explain" | "generate";
    day: string;
    limit: number;
  }) {
    const key = `${input.day}:${input.kind}:${input.fingerprint}`;
    const current = this.usage.get(key) ?? 0;
    if (current >= input.limit) {
      return { allowed: false, count: current, limit: input.limit };
    }
    const count = current + 1;
    this.usage.set(key, count);
    return { allowed: true, count, limit: input.limit };
  }
}

/** Fail-closed fallback that keeps /health available when Firestore cannot initialise. */
export class UnavailableJeniusRepository implements JeniusRepository {
  constructor(private readonly diagnostic = "database-unavailable") {}

  async checkReadiness(): Promise<boolean> {
    return false;
  }

  getReadinessDiagnostic(): string {
    return this.diagnostic;
  }

  async getExplanation(): Promise<null> {
    throw new Error("Firestore unavailable");
  }

  async saveExplanation(): Promise<void> {
    throw new Error("Firestore unavailable");
  }

  async saveGeneratedConcept(): Promise<void> {
    throw new Error("Firestore unavailable");
  }

  async consumeUsage(): Promise<never> {
    throw new Error("Firestore unavailable");
  }
}
