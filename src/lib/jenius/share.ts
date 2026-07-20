export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

interface ShareCapabilities {
  share?: (payload: SharePayload) => Promise<void>;
  writeClipboard?: (text: string) => Promise<void>;
}

export type ShareResult = "shared" | "copied" | "cancelled" | "unavailable";

function browserCapabilities(): ShareCapabilities {
  if (typeof navigator === "undefined") return {};
  return {
    share: navigator.share ? (payload) => navigator.share(payload) : undefined,
    writeClipboard: navigator.clipboard ? (text) => navigator.clipboard.writeText(text) : undefined,
  };
}

export async function shareOrCopy(
  payload: SharePayload,
  capabilities: ShareCapabilities = browserCapabilities(),
): Promise<ShareResult> {
  if (capabilities.share) {
    try {
      await capabilities.share(payload);
      return "shared";
    } catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  if (capabilities.writeClipboard) {
    try {
      await capabilities.writeClipboard(`${payload.text}\n${payload.url}`);
      return "copied";
    } catch {
      // Sharing is optional; callers keep the learning flow uninterrupted.
    }
  }
  return "unavailable";
}
