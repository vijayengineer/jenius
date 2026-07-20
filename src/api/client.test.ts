import { describe, expect, it, vi } from "vitest";
import { createJeniusApiClient, JeniusApiError } from "./client";

const explanation = {
  conceptId: "seasons",
  style: "simpler",
  explanation: "Earth's tilt changes the angle of sunlight during its orbit.",
  memoryHook: "Tilt changes the light.",
  cached: false,
  generatedAt: "2026-07-20T12:00:00.000Z",
  requestId: "request-1",
};

describe("Jenius API client", () => {
  it("validates and returns a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(explanation), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const client = createJeniusApiClient({
      baseUrl: "https://api.jns.fun/",
      fetch: fetchMock,
      isOnline: () => true,
    });
    await expect(
      client.explain({ conceptId: "seasons", explanationStyle: "simpler" }),
    ).resolves.toEqual(explanation);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.jns.fun/api/explain",
      expect.objectContaining({ cache: "no-store", credentials: "omit" }),
    );
  });

  it("categorises an aborted request as a timeout", async () => {
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    const client = createJeniusApiClient({
      baseUrl: "https://api.jns.fun",
      timeoutMs: 5,
      fetch: fetchMock,
      isOnline: () => true,
    });
    await expect(
      client.explain({ conceptId: "seasons", explanationStyle: "simpler" }),
    ).rejects.toMatchObject({ category: "timeout" });
  });

  it("does not call fetch while offline", async () => {
    const fetchMock = vi.fn();
    const client = createJeniusApiClient({
      baseUrl: "https://api.jns.fun",
      fetch: fetchMock,
      isOnline: () => false,
    });
    await expect(
      client.explain({ conceptId: "seasons", explanationStyle: "simpler" }),
    ).rejects.toBeInstanceOf(JeniusApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
