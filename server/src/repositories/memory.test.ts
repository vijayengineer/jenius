import { describe, expect, it } from "vitest";
import { MemoryJeniusRepository } from "./memory.js";

describe("usage limits", () => {
  it("atomically allows up to the configured daily limit", async () => {
    const repository = new MemoryJeniusRepository();
    const input = {
      fingerprint: "fingerprint",
      kind: "generate" as const,
      day: "2026-07-20",
      limit: 2,
    };
    expect(await repository.consumeUsage(input)).toMatchObject({ allowed: true, count: 1 });
    expect(await repository.consumeUsage(input)).toMatchObject({ allowed: true, count: 2 });
    expect(await repository.consumeUsage(input)).toMatchObject({ allowed: false, count: 2 });
  });

  it("keeps explain and generate counters separate", async () => {
    const repository = new MemoryJeniusRepository();
    const base = { fingerprint: "fingerprint", day: "2026-07-20", limit: 1 };
    expect(await repository.consumeUsage({ ...base, kind: "explain" })).toMatchObject({
      allowed: true,
    });
    expect(await repository.consumeUsage({ ...base, kind: "generate" })).toMatchObject({
      allowed: true,
    });
  });
});
