import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

const base = {
  NODE_ENV: "test",
  FRONTEND_ORIGINS: "http://localhost:5173,https://jns.fun",
  OPENAI_API_KEY: "test-key",
  OPENAI_MODEL: "test-model",
  USAGE_HASH_SALT: "test-salt",
};

describe("server config", () => {
  it("parses safe defaults and a comma-separated origin allowlist", () => {
    const config = loadConfig(base);
    expect(config.host).toBe("127.0.0.1");
    expect(config.port).toBe(301);
    expect(config.frontendOrigins).toEqual(["http://localhost:5173", "https://jns.fun"]);
    expect(config.configurationReady).toBe(true);
  });

  it("reports optional integration configuration as not ready", () => {
    const config = loadConfig({ NODE_ENV: "test", FRONTEND_ORIGINS: "" });
    expect(config.configurationReady).toBe(false);
  });

  it("rejects wildcard production CORS", () => {
    expect(() => loadConfig({ ...base, NODE_ENV: "production", FRONTEND_ORIGINS: "*" })).toThrow(
      /wildcard/i,
    );
  });
});
