/**
 * Mock data + resolvers for the "Explain more" experience.
 *
 * The visual component (ExplainMoreSheet) never decides state; the demo
 * controller (DiscoverFeed) selects a status and passes an ExplainPack in.
 */

export type ExplainStatus =
  | "available"
  | "loading"
  | "success"
  | "cached"
  | "offline-unavailable"
  | "timeout"
  | "server-error"
  | "rate-limited";

export interface ExplainCheckQuestion {
  prompt: string;
  answerHint: string;
}

export interface ExplainPack {
  conceptId: string;
  /** Alternative explanation — different wording, same idea. */
  alternative: string;
  /** A concrete analogy learners can picture in bundled packs. */
  analogy?: string;
  /** One quick self-check question in bundled packs. */
  check?: ExplainCheckQuestion;
  /** Optional structured coach fields returned by the backend. */
  memoryHook?: string;
  miniExample?: string;
  /** True if the server reused an already validated response. */
  fromCache?: boolean;
}

/**
 * Cached explain-more packs. In production this map is Codex-managed and
 * warmed by the feed loader. Stage 1 ships a couple of packs so the offline
 * cached-response state is demonstrable.
 */
export const EXPLAIN_PACKS: Record<string, ExplainPack> = {
  seasons: {
    conceptId: "seasons",
    alternative:
      "Earth's axis leans by about 23.5°. That lean changes how directly sunlight strikes each hemisphere as we orbit the Sun.",
    analogy:
      "Imagine tilting a flashlight over a table. Straight down makes a bright, small spot — the same light spread at an angle covers more area but each patch is dimmer. That's summer versus winter.",
    check: {
      prompt: "When it's summer in Brazil, what's happening in Norway?",
      answerHint: "Winter — Norway is tilted away from the Sun.",
    },
    fromCache: true,
  },
  volcanoes: {
    conceptId: "volcanoes",
    alternative:
      "Deep in the crust, dissolved gases stay trapped in magma under huge pressure. When magma rises and pressure drops, those gases suddenly expand — like opening a shaken bottle.",
    analogy:
      "Think of a warm soda bottle. Sealed, it's calm. Twist the cap and the pressure release pushes foam out fast. Volcanoes do the same with gas, ash and lava.",
    check: {
      prompt: "Why do volcanoes near subduction zones erupt so explosively?",
      answerHint: "Extra water in the magma creates more trapped gas.",
    },
    fromCache: true,
  },
};

/** Build a deterministic local explanation when a cached pack is unavailable. */
export function createLocalExplainPack(conceptId: string, hook: string): ExplainPack {
  const cached = EXPLAIN_PACKS[conceptId];
  if (cached) return { ...cached, fromCache: false };
  return {
    conceptId,
    alternative: `Another way to say it: ${hook.replace(/\?$/, "")} comes down to a simple cause-and-effect chain you already know.`,
    analogy:
      "Picture a familiar everyday object doing exactly the same job. Same rules, smaller scale.",
    check: {
      prompt: "Say this idea back in one sentence, using your own words.",
      answerHint: "If it feels forced, ask for another angle.",
    },
    fromCache: false,
  };
}
