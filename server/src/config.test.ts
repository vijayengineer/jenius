import { describe, expect, it } from "vitest";
import { formatConfigurationError, loadConfig } from "./config.js";

const base = {
  NODE_ENV: "test",
  FRONTEND_ORIGINS: "http://localhost:5173,https://jns.fun",
  OPENAI_API_KEY: "test-key",
  OPENAI_MODEL: "test-model",
  GOOGLE_CLOUD_PROJECT: "jenius-test",
  USAGE_HASH_SALT: "test-salt",
};

describe("server config", () => {
  it("parses safe defaults and a comma-separated origin allowlist", () => {
    const config = loadConfig(base);
    expect(config.host).toBe("127.0.0.1");
    expect(config.port).toBe(301);
    expect(config.frontendOrigins).toEqual(["http://localhost:5173", "https://jns.fun"]);
    expect(config.firestore).toEqual({
      projectId: "jenius-test",
      keyFilename: "",
      databaseId: "(default)",
    });
    expect(config.configurationReady).toBe(true);
  });

  it("reports optional integration configuration as not ready", () => {
    const config = loadConfig({ NODE_ENV: "test", FRONTEND_ORIGINS: "" });
    expect(config.configurationReady).toBe(false);
  });

  it("rejects wildcard production CORS", () => {
    expect(() =>
      loadConfig({
        ...base,
        NODE_ENV: "production",
        FRONTEND_ORIGINS: "*",
        USAGE_HASH_SALT: "a-production-only-salt-at-least-32-characters",
      }),
    ).toThrow(/wildcard/i);
  });

  it("fails clearly when production security configuration is missing", () => {
    expect(() => loadConfig({ NODE_ENV: "production" })).toThrow(
      /FRONTEND_ORIGINS, OPENAI_API_KEY, OPENAI_MODEL, GOOGLE_CLOUD_PROJECT, USAGE_HASH_SALT/,
    );
    expect(() =>
      loadConfig({
        ...base,
        NODE_ENV: "production",
        USAGE_HASH_SALT: "too-short",
      }),
    ).toThrow(/at least 32 characters/i);
  });

  it("accepts complete production configuration with direct Firestore ADC", () => {
    const config = loadConfig({
      ...base,
      NODE_ENV: "production",
      USAGE_HASH_SALT: "a-production-only-salt-at-least-32-characters",
    });
    expect(config.configurationReady).toBe(true);
    expect(config.firestore.projectId).toBe("jenius-test");
    expect(config.firestore.keyFilename).toBe("");
  });

  it("formats schema errors without echoing rejected values", () => {
    let caught: unknown;
    try {
      loadConfig({ NODE_ENV: "production", PORT: "secret-invalid-port" });
    } catch (error) {
      caught = error;
    }
    const message = formatConfigurationError(caught);
    expect(message).toContain("PORT");
    expect(message).not.toContain("secret-invalid-port");
  });
});
