import { Firestore } from "@google-cloud/firestore";
import { ExplanationPayloadSchema, GeneratedConceptSchema } from "../../../shared/contracts.js";
import type { ServerConfig } from "../config.js";
import type { ExplanationCacheRecord, GeneratedConceptRecord, JeniusRepository } from "./types.js";

const COLLECTIONS = {
  explanationCache: "explanation_cache",
  generatedConcepts: "generated_concepts",
  usageLimits: "usage_limits",
} as const;

export function firestoreDiagnosticReason(error: unknown): string {
  if (!error || typeof error !== "object") return "database-unavailable";
  const candidate = error as { code?: unknown; name?: unknown };
  const code = typeof candidate.code === "number" ? candidate.code : String(candidate.code ?? "");
  if (code === "ENOENT") return "service-account-file-unavailable";
  if (code === 4 || code === "4" || code === "DEADLINE_EXCEEDED") return "request-timeout";
  if (code === 5 || code === "5" || code === "NOT_FOUND") return "database-not-found";
  if (code === 7 || code === "7" || code === "PERMISSION_DENIED") return "permission-denied";
  if (code === 16 || code === "16" || code === "UNAUTHENTICATED") {
    return "authentication-failed";
  }
  if (candidate.name === "SyntaxError") return "service-account-file-invalid";
  return "database-unavailable";
}

export function createFirestoreSettings(
  config: ServerConfig,
): NonNullable<ConstructorParameters<typeof Firestore>[0]> {
  return {
    projectId: config.firestore.projectId || undefined,
    keyFilename: config.firestore.keyFilename || undefined,
    databaseId: config.firestore.databaseId,
  };
}

export function createFirestoreClient(config: ServerConfig): Firestore {
  return new Firestore(createFirestoreSettings(config));
}

export async function createFirestoreRepository(
  config: ServerConfig,
): Promise<FirestoreRepository> {
  return new FirestoreRepository(createFirestoreClient(config));
}

export class FirestoreRepository implements JeniusRepository {
  private readinessDiagnostic: string | undefined;

  constructor(private readonly firestore: Firestore) {}

  async checkReadiness(): Promise<boolean> {
    try {
      await this.firestore.collection(COLLECTIONS.usageLimits).limit(1).get();
      this.readinessDiagnostic = undefined;
      return true;
    } catch (error) {
      this.readinessDiagnostic = firestoreDiagnosticReason(error);
      return false;
    }
  }

  getReadinessDiagnostic(): string | undefined {
    return this.readinessDiagnostic;
  }

  async close(): Promise<void> {
    await this.firestore.terminate();
  }

  async getExplanation(cacheKey: string): Promise<ExplanationCacheRecord | null> {
    const snapshot = await this.firestore
      .collection(COLLECTIONS.explanationCache)
      .doc(cacheKey)
      .get();
    if (!snapshot.exists) return null;
    const raw = snapshot.data() as Partial<ExplanationCacheRecord> | undefined;
    const payload = ExplanationPayloadSchema.safeParse(raw?.payload);
    if (
      !raw ||
      !payload.success ||
      typeof raw.expiresAt !== "string" ||
      new Date(raw.expiresAt).getTime() <= Date.now()
    ) {
      return null;
    }
    return { ...(raw as ExplanationCacheRecord), payload: payload.data };
  }

  async saveExplanation(record: ExplanationCacheRecord): Promise<void> {
    await this.firestore.collection(COLLECTIONS.explanationCache).doc(record.cacheKey).set(record);
  }

  async saveGeneratedConcept(record: GeneratedConceptRecord): Promise<void> {
    const payload = GeneratedConceptSchema.parse(record.payload);
    await this.firestore
      .collection(COLLECTIONS.generatedConcepts)
      .doc(record.generatedConceptId)
      .set({ ...record, payload });
  }

  async consumeUsage(input: {
    fingerprint: string;
    kind: "explain" | "generate";
    day: string;
    limit: number;
  }) {
    const id = `${input.day}-${input.kind}-${input.fingerprint}`;
    const reference = this.firestore.collection(COLLECTIONS.usageLimits).doc(id);
    return this.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      const current = snapshot.exists ? Number(snapshot.data()?.count ?? 0) : 0;
      if (current >= input.limit) {
        return { allowed: false, count: current, limit: input.limit };
      }
      const count = current + 1;
      transaction.set(
        reference,
        {
          fingerprint: input.fingerprint,
          kind: input.kind,
          day: input.day,
          count,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      return { allowed: true, count, limit: input.limit };
    });
  }
}
