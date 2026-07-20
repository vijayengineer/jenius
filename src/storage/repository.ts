import {
  createInitialLearnerState,
  deserializeLearnerState,
  type LearnerState,
} from "./learner-state";

export interface LearningRepository {
  load(): Promise<LearnerState>;
  save(state: LearnerState): Promise<void>;
}

const DATABASE_NAME = "jenius-learning";
const STORE_NAME = "state";
const STATE_KEY = "learner";
const DATABASE_VERSION = 1;

export function createMemoryLearningRepository(
  initial = createInitialLearnerState(),
): LearningRepository {
  let current = deserializeLearnerState(initial);
  return {
    async load() {
      return structuredClone(current);
    },
    async save(state) {
      current = deserializeLearnerState(structuredClone(state));
    },
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB"));
  });
}

export function createIndexedDbLearningRepository(): LearningRepository {
  return {
    async load() {
      const database = await openDatabase();
      try {
        const value = await new Promise<unknown>((resolve, reject) => {
          const request = database
            .transaction(STORE_NAME, "readonly")
            .objectStore(STORE_NAME)
            .get(STATE_KEY);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        return deserializeLearnerState(value);
      } finally {
        database.close();
      }
    },
    async save(state) {
      const database = await openDatabase();
      try {
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(STORE_NAME, "readwrite");
          transaction.objectStore(STORE_NAME).put(state, STATE_KEY);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      } finally {
        database.close();
      }
    },
  };
}

export function createLearningRepository(): LearningRepository {
  return typeof indexedDB === "undefined"
    ? createMemoryLearningRepository()
    : createIndexedDbLearningRepository();
}
