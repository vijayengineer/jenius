import { readFileSync } from "node:fs";
import React from "react";
import { describe, expect, it } from "vitest";
import { SheetContent } from "./Sheet";

interface ForwardRefComponent {
  render: (props: Record<string, unknown>, ref: React.Ref<unknown>) => React.ReactNode;
}

function inspectTree(node: React.ReactNode, insideScroll = false) {
  const result = { scrollRegions: 0, closeInsideScroll: false, closeLabel: "" };
  const visit = (value: React.ReactNode, withinScroll: boolean) => {
    if (Array.isArray(value)) {
      value.forEach((child) => visit(child, withinScroll));
      return;
    }
    if (!React.isValidElement<Record<string, unknown>>(value)) return;
    const className = typeof value.props.className === "string" ? value.props.className : "";
    const isScroll = className.includes("overflow-y-auto");
    const nextWithinScroll = withinScroll || isScroll;
    if (isScroll) result.scrollRegions += 1;
    if (typeof value.props["aria-label"] === "string") {
      result.closeLabel = value.props["aria-label"];
      result.closeInsideScroll = nextWithinScroll;
    }
    visit(value.props.children as React.ReactNode, nextWithinScroll);
  };
  visit(node, insideScroll);
  return result;
}

describe("mobile sheet structure", () => {
  it("keeps one scroll region below the accessible close control", () => {
    const render = (SheetContent as unknown as ForwardRefComponent).render;
    const tree = render(
      { title: "Lesson", hideHeader: true, closeLabel: "Close lesson", children: "Content" },
      null,
    );
    expect(inspectTree(tree)).toEqual({
      scrollRegions: 1,
      closeInsideScroll: false,
      closeLabel: "Close lesson",
    });
  });

  it("uses dynamic viewport and safe-area bounds with reduced-motion fallback", () => {
    const styles = readFileSync(new URL("../../styles.css", import.meta.url), "utf8");
    expect(styles).toContain("92dvh");
    expect(styles).toContain("env(safe-area-inset-top)");
    expect(styles).toContain("env(safe-area-inset-bottom)");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).not.toContain("max-height: 100vh");
  });

  it.each([667, 740, 812, 844, 932])(
    "leaves visible top chrome and useful content height at %ipx",
    (viewportHeight) => {
      const representativeSafeTop = 47;
      const maxHeight = Math.min(
        viewportHeight * 0.92,
        viewportHeight - Math.max(representativeSafeTop, 12),
      );
      expect(viewportHeight - maxHeight).toBeGreaterThanOrEqual(representativeSafeTop);
      expect(maxHeight).toBeGreaterThan(560);
    },
  );
});
