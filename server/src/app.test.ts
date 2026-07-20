import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { MemoryJeniusRepository } from "./repositories/memory.js";

const config = loadConfig({
  NODE_ENV: "test",
  FRONTEND_ORIGINS: "https://jns.fun",
  OPENAI_API_KEY: "test-key",
  OPENAI_MODEL: "test-model",
  USAGE_HASH_SALT: "test-salt",
});

describe("HTTP boundary", () => {
  it("returns a safe health response", async () => {
    const app = await buildApp({ config, repository: new MemoryJeniusRepository() });
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ready",
      service: "jenius-api",
      version: "0.1.0",
      configuration: { ready: true, openai: true, usageProtection: true },
      firestore: { ready: true },
    });
    expect(response.body).not.toContain("test-key");
    expect(response.body).not.toContain("test-salt");
    await app.close();
  });

  it("allows configured CORS origins and rejects other origins", async () => {
    const app = await buildApp({ config, repository: new MemoryJeniusRepository() });
    const allowed = await app.inject({
      method: "OPTIONS",
      url: "/health",
      headers: { origin: "https://jns.fun", "access-control-request-method": "GET" },
    });
    expect(allowed.headers["access-control-allow-origin"]).toBe("https://jns.fun");

    const rejected = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://example.com" },
    });
    expect(rejected.statusCode).toBe(403);
    expect(rejected.json().error).toMatchObject({ code: "bad_request", retryable: false });
    await app.close();
  });

  it("formats unknown routes without a stack trace", async () => {
    const app = await buildApp({ config, repository: new MemoryJeniusRepository() });
    const response = await app.inject({ method: "GET", url: "/missing" });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("not_found");
    expect(response.body).not.toContain("stack");
    await app.close();
  });

  it("rejects malformed requests and unknown concept IDs", async () => {
    const app = await buildApp({ config, repository: new MemoryJeniusRepository() });
    const malformed = await app.inject({
      method: "POST",
      url: "/api/generate",
      payload: { topic: "" },
    });
    expect(malformed.statusCode).toBe(400);
    expect(malformed.json().error.code).toBe("bad_request");

    const unknown = await app.inject({
      method: "POST",
      url: "/api/explain",
      payload: { conceptId: "not-bundled", explanationStyle: "simpler" },
    });
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json().error.code).toBe("not_found");
    await app.close();
  });
});
