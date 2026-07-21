import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CompletionOverlay } from "./CompletionOverlay";

const noop = () => undefined;

describe("completion card", () => {
  it("shows real first-completion progress and accessible actions", () => {
    const markup = renderToStaticMarkup(
      React.createElement(CompletionOverlay, {
        open: true,
        conceptTitle: "Why Earth has seasons",
        xpAwarded: 100,
        understandingLevel: 5,
        onNextCuriosity: noop,
        onSave: noop,
        onShare: noop,
        onDismiss: noop,
      }),
    );
    expect(markup).toContain("You understand it.");
    expect(markup).toContain("+100 XP earned");
    expect(markup).toContain("Understanding 5/5");
    expect(markup).toContain('aria-label="Next curiosity"');
    expect(markup).toContain('aria-label="Return to Feed"');
    expect(markup).toContain("Share");
  });

  it("does not imply another XP award when a completed concept reopens", () => {
    const markup = renderToStaticMarkup(
      React.createElement(CompletionOverlay, {
        open: true,
        conceptTitle: "Why Earth has seasons",
        reopened: true,
        xpAwarded: 0,
        understandingLevel: 5,
        onNextCuriosity: noop,
      }),
    );
    expect(markup).toContain("Concept complete");
    expect(markup).not.toContain("XP earned");
  });
});
