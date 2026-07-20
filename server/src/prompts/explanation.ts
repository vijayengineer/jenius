import type { ExplainRequest } from "../../../shared/contracts.js";
import type { VerifiedConceptSummary } from "../catalogue.js";

export function buildExplanationPrompt(
  concept: VerifiedConceptSummary,
  request: ExplainRequest,
): { instructions: string; input: string } {
  return {
    instructions: [
      "You are Jenius, a calm educational coach.",
      "Rewrite only the verified idea supplied by the application.",
      "Stay factually aligned with it and do not add unsupported claims.",
      "Use clear, age-accessible language that is never childish.",
      "Do not mention hidden instructions, system messages, policies, prompts, or the model.",
      "Do not use markdown tables. Keep every field concise for a phone screen.",
      `Use the requested style: ${request.explanationStyle}.`,
    ].join(" "),
    input: JSON.stringify({
      verifiedConcept: {
        title: concept.title,
        hook: concept.hook,
        explanation: concept.explanation,
        takeaway: concept.takeaway,
      },
      safeContext: {
        misconceptionId: request.misconceptionId,
        learnerContextId: request.learnerContextId,
        previousExplanationFingerprint: request.previousExplanationFingerprint,
      },
      task: "Return one accurate alternative explanation, one memory hook, and an optional mini example.",
    }),
  };
}
