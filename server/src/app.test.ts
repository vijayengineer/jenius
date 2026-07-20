import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { formatSafeError } from "./errors.js";
import { MemoryJeniusRepository, UnavailableJeniusRepository } from "./repositories/memory.js";

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
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-request-id"]).toBeTruthy();
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

  it("formats parser and body-limit failures as typed safe client errors", async () => {
    const app = await buildApp({ config, repository: new MemoryJeniusRepository() });
    const malformedJson = await app.inject({
      method: "POST",
      url: "/api/generate",
      headers: { "content-type": "application/json" },
      payload: '{"topic":',
    });
    expect(malformedJson.statusCode).toBe(400);
    expect(malformedJson.json().error).toMatchObject({ code: "bad_request", retryable: false });
    expect(malformedJson.body).not.toContain("stack");

    const unsupported = await app.inject({
      method: "POST",
      url: "/api/generate",
      headers: { "content-type": "application/xml" },
      payload: "<topic>Rainbows</topic>",
    });
    expect(unsupported.statusCode).toBe(400);
    expect(unsupported.json().error.code).toBe("bad_request");

    const oversized = await app.inject({
      method: "POST",
      url: "/api/generate",
      payload: { topic: "x".repeat(17 * 1024) },
    });
    expect(oversized.statusCode).toBe(413);
    expect(oversized.json().error.code).toBe("bad_request");
    await app.close();
  });

  it("fails safely when Firestore is unavailable", async () => {
    const app = await buildApp({ config, repository: new UnavailableJeniusRepository() });
    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.json()).toMatchObject({
      status: "degraded",
      firestore: { ready: false },
    });
    const explain = await app.inject({
      method: "POST",
      url: "/api/explain",
      payload: { conceptId: "seasons", explanationStyle: "simpler" },
    });
    expect(explain.statusCode).toBe(503);
    expect(explain.json().error).toMatchObject({
      code: "upstream_unavailable",
      retryable: true,
    });
    expect(explain.body).not.toContain("Firestore unavailable");
    await app.close();
  });

  it("never exposes unexpected internal error details", () => {
    const formatted = formatSafeError(
      new Error("OPENAI_API_KEY=secret-value at /etc/jenius/private.json"),
      "request-safe",
    );
    expect(formatted.statusCode).toBe(500);
    expect(JSON.stringify(formatted.body)).not.toContain("secret-value");
    expect(JSON.stringify(formatted.body)).not.toContain("/etc/jenius");
  });
});
