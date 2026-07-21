import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";
import { FeedTopBar } from "./FeedTopBar";

describe("production app chrome", () => {
  it("overlays feed chrome without introducing a document scroll surface", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          overlayChrome: true,
          header: React.createElement("span", null, "Header"),
          footer: React.createElement("span", null, "Footer"),
        },
        React.createElement("span", null, "Feed"),
      ),
    );

    expect(markup).toContain("h-dvh min-h-0 overflow-hidden");
    expect(markup).toContain("absolute inset-x-0 top-0");
    expect(markup).toContain("absolute inset-x-0 bottom-0");
    expect(markup).toContain("h-dvh min-h-0 flex-none");
  });

  it("keeps standard screens in the document flow", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement("span", null, "Header"),
          footer: React.createElement("span", null, "Footer"),
        },
        React.createElement("span", null, "Screen"),
      ),
    );

    expect(markup).toContain("sticky top-0");
    expect(markup).toContain("sticky bottom-0");
    expect(markup).not.toContain("h-dvh min-h-0 overflow-hidden");
  });

  it("uses the top-bar status slot without an unfinished sound control", () => {
    const markup = renderToStaticMarkup(
      React.createElement(FeedTopBar, {
        mode: "discover",
        status: React.createElement("span", null, "0/5"),
      }),
    );

    expect(markup).toContain("0/5");
    expect(markup).not.toContain("coming soon");
    expect(markup).not.toContain("Unmute");
  });
});
