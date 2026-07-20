import { describe, expect, it, vi } from "vitest";
import { shareOrCopy } from "./share";

const payload = {
  title: "Why is the sky blue? — Jenius",
  text: "Air scatters blue light.",
  url: "https://jns.fun/",
};

describe("mobile sharing", () => {
  it("uses the native share sheet when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeClipboard = vi.fn();
    await expect(shareOrCopy(payload, { share, writeClipboard })).resolves.toBe("shared");
    expect(writeClipboard).not.toHaveBeenCalled();
  });

  it("falls back to the clipboard when native sharing fails", async () => {
    const writeClipboard = vi.fn().mockResolvedValue(undefined);
    await expect(
      shareOrCopy(payload, {
        share: vi.fn().mockRejectedValue(new Error("unsupported payload")),
        writeClipboard,
      }),
    ).resolves.toBe("copied");
    expect(writeClipboard).toHaveBeenCalledWith("Air scatters blue light.\nhttps://jns.fun/");
  });

  it("does not copy when the learner cancels the native share sheet", async () => {
    const writeClipboard = vi.fn();
    await expect(
      shareOrCopy(payload, {
        share: vi.fn().mockRejectedValue({ name: "AbortError" }),
        writeClipboard,
      }),
    ).resolves.toBe("cancelled");
    expect(writeClipboard).not.toHaveBeenCalled();
  });
});
