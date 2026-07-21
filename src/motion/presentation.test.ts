import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConceptMotionPlayer, shouldShowConceptPoster } from "./ConceptMotionPlayer";
import { MotionProvider } from "./MotionProvider";
import { getMotionReveal, shouldRevealAfterMotion } from "./presentation";

describe("production motion presentation", () => {
  it("reveals success and misconception copy only after their principal motion cue settles", () => {
    expect(getMotionReveal("success", "teacher-feedback")).toBe("feedback-correct");
    expect(getMotionReveal("misunderstanding", "misconception")).toBe("feedback-incorrect");
    expect(getMotionReveal("success", "answering")).toBeNull();
    expect(getMotionReveal("misunderstanding", "answering")).toBeNull();
    expect(shouldRevealAfterMotion("completed")).toBe(true);
    expect(shouldRevealAfterMotion("skipped")).toBe(true);
    expect(shouldRevealAfterMotion("interrupted")).toBe(false);

    const timelineSource = readFileSync(
      new URL("./useLearningMotionTimeline.ts", import.meta.url),
      "utf8",
    );
    expect(timelineSource.indexOf("await handle.finished")).toBeLessThan(
      timelineSource.indexOf("settledRef.current?."),
    );
  });

  it("uses one viewport-safe top-level stage outside lesson scrolling", () => {
    const source = readFileSync(new URL("./MotionProvider.tsx", import.meta.url), "utf8");
    expect(source).toContain("data-motion-stage");
    expect(source).toContain("data-visible-players");
    expect(source).toContain("min-h-[100dvh]");
    expect(source).toContain("safe-area-inset-top");
    expect(source).toContain("safe-area-inset-bottom");
    expect(source).not.toContain("overflow-y-auto");
  });

  it("keeps concept cinematics full-bleed, contained, and free of nested player framing", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        MotionProvider,
        null,
        React.createElement(ConceptMotionPlayer, {
          conceptId: "volcano",
          active: false,
          visible: false,
          alt: "Volcano cross-section",
        }),
      ),
    );
    const canvas = markup.match(/<div[^>]*data-concept-motion-canvas[^>]*>/)?.[0] ?? "";
    expect(canvas).toContain("rounded-xl");
    expect(canvas).not.toContain("border");
    expect(canvas).not.toContain("shadow");
    expect(canvas).not.toContain("gradient");
    expect(canvas).toContain("h-[clamp(224px,35dvh,348px)]");
    expect(markup).toContain("object-contain");
    expect(markup).not.toContain("object-cover");

    const conceptCardSource = readFileSync(
      new URL("../components/jenius/ConceptCard.tsx", import.meta.url),
      "utf8",
    );
    expect(conceptCardSource).toContain('className="-mx-5 mb-3"');
    expect(conceptCardSource).toContain("min-h-[100dvh]");
    expect(conceptCardSource).not.toContain(
      "h-[100dvh] w-full snap-start snap-always flex-col overflow-hidden",
    );
  });

  it("resolves a poster instead of video playback under reduced motion", () => {
    expect(shouldShowConceptPoster(true, true, false)).toBe(true);
    expect(shouldShowConceptPoster(false, true, false)).toBe(false);
  });
});
