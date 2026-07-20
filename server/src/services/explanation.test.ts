import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../config.js";
import { ApiError } from "../errors.js";
import { MemoryJeniusRepository } from "../repositories/memory.js";
import { ExplanationService } from "./explanation.js";

const config = loadConfig({
  NODE_ENV: "test",
  FRONTEND_ORIGINS: "https://jns.fun",
  OPENAI_API_KEY: "test-key",
  OPENAI_MODEL: "gpt-test",
  USAGE_HASH_SALT: "test-salt",
});
const request = { conceptId: "seasons", explanationStyle: "analogy" as const };

describe("ExplanationService", () => {
  it("rejects unknown concepts before calling the model", async () => {
    const complete = vi.fn();
    const service = new ExplanationService(config, new MemoryJeniusRepository(), { complete });
    await expect(
      service.explain({
        request: { ...request, conceptId: "unknown" },
        requestId: "request-1",
        requestFingerprint: "fingerprint",
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "not_found" });
    expect(complete).not.toHaveBeenCalled();
  });

  it("validates, saves, and returns a generated explanation", async () => {
    const repository = new MemoryJeniusRepository();
    const service = new ExplanationService(
      config,
      repository,
      {
        complete: vi.fn().mockResolvedValue({
          explanation: "Earth leans as it travels, changing the angle of sunlight.",
          memoryHook: "Tilt changes the light.",
          miniExample: "A tilted torch spreads the same beam over more space.",
        }),
      },
      () => new Date("2026-07-20T12:00:00.000Z"),
    );
    const response = await service.explain({
      request,
      requestId: "request-1",
      requestFingerprint: "fingerprint",
    });
    expect(response).toMatchObject({
      conceptId: "seasons",
      style: "analogy",
      cached: false,
      requestId: "request-1",
    });
    expect(repository.explanations.size).toBe(1);
  });

  it("uses a valid cache hit without calling the model", async () => {
    const repository = new MemoryJeniusRepository();
    const firstModel = {
      complete: vi.fn().mockResolvedValue({
        explanation: "Earth's tilt changes how directly sunlight lands.",
        memoryHook: "Tilt changes the light.",
      }),
    };
    const now = () => new Date("2026-07-20T12:00:00.000Z");
    await new ExplanationService(config, repository, firstModel, now).explain({
      request,
      requestId: "request-1",
      requestFingerprint: "fingerprint",
    });
    const secondModel = { complete: vi.fn() };
    const response = await new ExplanationService(config, repository, secondModel, now).explain({
      request,
      requestId: "request-2",
      requestFingerprint: "fingerprint",
    });
    expect(response.cached).toBe(true);
    expect(secondModel.complete).not.toHaveBeenCalled();
  });

  it("rejects malformed model output", async () => {
    const service = new ExplanationService(config, new MemoryJeniusRepository(), {
      complete: vi.fn().mockResolvedValue({ explanation: "", memoryHook: "" }),
    });
    await expect(
      service.explain({
        request,
        requestId: "request-1",
        requestFingerprint: "fingerprint",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
