import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");

describe("service worker offline boundary", () => {
  it("discovers and precaches the first-load hashed application assets", () => {
    expect(source).toContain("discoverShellAssets");
    expect(source).toContain('url.pathname.startsWith("/assets/")');
    expect(source).toContain("await shellResponse.text()");
    expect(source).toContain('await cache.put("/", shellResponse.clone())');
    expect(source).toContain("await cache.addAll(discoverShellAssets(html))");
    expect(source).not.toContain("Promise.allSettled");
  });

  it("never runtime-caches API or cross-origin responses", () => {
    expect(source).toContain("url.origin !== self.location.origin");
    expect(source).toContain('url.pathname.startsWith("/api/")');
    expect(source).toContain('if (request.method !== "GET") return');
  });
});
