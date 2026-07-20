/** Data contract and bundled offline fallbacks for the optional coaching experience. */

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

/** Deterministic packs bundled for two offline coaching examples. */
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
