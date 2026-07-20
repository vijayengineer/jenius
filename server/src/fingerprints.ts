import { createHash } from "node:crypto";
import type { ExplanationStyle } from "../../shared/contracts.js";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createRequestFingerprint(salt: string, ip: string, userAgent: string): string {
  if (!salt) throw new Error("A fingerprint salt is required");
  return sha256(`${salt}\u0000${ip}\u0000${userAgent}`);
}

export function createExplanationCacheKey(input: {
  conceptId: string;
  style: ExplanationStyle;
  contextFingerprint?: string;
  promptVersion: string;
  model: string;
}): string {
  return sha256(
    [
      input.conceptId,
      input.style,
      input.contextFingerprint ?? "none",
      input.promptVersion,
      input.model,
    ].join("\u0000"),
  );
}

export function createGenerationRequestFingerprint(
  salt: string,
  requestFingerprint: string,
  normalizedTopic: string,
): string {
  if (!salt) throw new Error("A fingerprint salt is required");
  return sha256(`${salt}\u0000${requestFingerprint}\u0000${normalizedTopic}`);
}

export function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}
