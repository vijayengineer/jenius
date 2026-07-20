import type { GenerateRequest } from "../../shared/contracts.js";
import { ApiError } from "./errors.js";

const INJECTION_PATTERNS = [
  /ignore (all |any )?(previous|prior|system|developer) instructions?/i,
  /(show|reveal|repeat|print).{0,24}(system|developer|hidden) (prompt|instructions?)/i,
  /\b(jailbreak|developer mode|prompt injection)\b/i,
  /\bact as\b.{0,30}\b(system|developer)\b/i,
];

const UNSAFE_PATTERNS = [
  /\b(how to|steps? to|instructions? (for|to)).{0,30}\b(build|make|create)\b.{0,20}\b(bomb|explosive|weapon)\b/i,
  /\b(write|create|deploy).{0,25}\b(malware|ransomware|credential stealer)\b/i,
  /\b(suicide|self-harm).{0,25}\b(method|instructions?|best way)\b/i,
  /\bsexual.{0,15}\b(child|minor)\b/i,
];

export function assertSafeGenerateRequest(request: GenerateRequest): void {
  const combined = [
    request.topic,
    request.reasonForLearning ?? "",
    request.preferredStyle ?? "",
  ].join(" ");
  if (INJECTION_PATTERNS.some((pattern) => pattern.test(combined))) {
    throw new ApiError(
      400,
      "bad_request",
      "Please enter a learning topic, without instructions for the service.",
    );
  }
  if (UNSAFE_PATTERNS.some((pattern) => pattern.test(combined))) {
    throw new ApiError(
      400,
      "bad_request",
      "Jenius cannot create a lesson for that unsafe request.",
    );
  }
}
