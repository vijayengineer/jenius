import { readFile } from "node:fs/promises";
import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { ExplanationPayloadSchema, GeneratedConceptSchema } from "../../../shared/contracts.js";
import type { ServerConfig } from "../config.js";
import type { ExplanationCacheRecord, GeneratedConceptRecord, JeniusRepository } from "./types.js";

const COLLECTIONS = {
  explanationCache: "explanation_cache",
  generatedConcepts: "generated_concepts",
  usageLimits: "usage_limits",
} as const;

async function createFirebaseApp(config: ServerConfig): Promise<App> {
  const existing = getApps()[0];
  if (existing) return existing;
  if (config.firebase.serviceAccountFile) {
    const raw = await readFile(config.firebase.serviceAccountFile, "utf8");
    const credentials = JSON.parse(raw) as Parameters<typeof cert>[0];
    return initializeApp({ credential: cert(credentials) });
  }
  return initializeApp({ credential: applicationDefault() });
}

export async function createFirestoreRepository(
  config: ServerConfig,
): Promise<FirestoreRepository> {
  const app = await createFirebaseApp(config);
  return new FirestoreRepository(getFirestore(app, config.firebase.databaseId));
}

export class FirestoreRepository implements JeniusRepository {
  constructor(private readonly firestore: Firestore) {}

  async checkReadiness(): Promise<boolean> {
    try {
      await this.firestore.collection(COLLECTIONS.usageLimits).limit(1).get();
      return true;
    } catch {
      return false;
    }
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
