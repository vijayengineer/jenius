import type { Firestore } from "@google-cloud/firestore";
import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../config.js";
import {
  createFirestoreSettings,
  FirestoreRepository,
  firestoreDiagnosticReason,
} from "./firestore.js";

const config = loadConfig({
  NODE_ENV: "test",
  GOOGLE_CLOUD_PROJECT: "jenius-test",
  FIRESTORE_SERVICE_ACCOUNT_FILE: "/secure/jenius-service-account.json",
  FIRESTORE_DATABASE_ID: "jenius-lessons",
});

describe("direct Firestore repository", () => {
  it("maps only the direct Google Cloud client settings", () => {
    expect(createFirestoreSettings(config)).toEqual({
      projectId: "jenius-test",
      keyFilename: "/secure/jenius-service-account.json",
      databaseId: "jenius-lessons",
    });
  });

  it("performs a real lightweight collection query for readiness", async () => {
    const get = vi.fn().mockResolvedValue({ empty: true });
    const limit = vi.fn().mockReturnValue({ get });
    const collection = vi.fn().mockReturnValue({ limit });
    const repository = new FirestoreRepository({ collection } as unknown as Firestore);

    await expect(repository.checkReadiness()).resolves.toBe(true);
    expect(collection).toHaveBeenCalledWith("usage_limits");
    expect(limit).toHaveBeenCalledWith(1);
    expect(get).toHaveBeenCalledOnce();
    expect(repository.getReadinessDiagnostic()).toBeUndefined();
  });

  it("classifies readiness errors without exposing upstream details", async () => {
    const get = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("private key at /secure/jenius-service-account.json"), { code: 7 }),
      );
    const firestore = {
      collection: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ get }) }),
    } as unknown as Firestore;
    const repository = new FirestoreRepository(firestore);

    await expect(repository.checkReadiness()).resolves.toBe(false);
    expect(repository.getReadinessDiagnostic()).toBe("permission-denied");
    expect(repository.getReadinessDiagnostic()).not.toContain("/secure");
  });

  it("maps known client failures to fixed diagnostic codes", () => {
    expect(firestoreDiagnosticReason({ code: "ENOENT" })).toBe("service-account-file-unavailable");
    expect(firestoreDiagnosticReason({ code: 16 })).toBe("authentication-failed");
    expect(firestoreDiagnosticReason({ code: 5 })).toBe("database-not-found");
    expect(firestoreDiagnosticReason(new Error("secret detail"))).toBe("database-unavailable");
  });
});
