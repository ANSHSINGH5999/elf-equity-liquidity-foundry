import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression: the desktop composition places text in full-artboard coordinate boxes
 * (.title/.sub/.feats are `inset:0`). Left interactive, the last one (.feats) sat on top
 * of the logo, nav, pill and CTA and swallowed every click. These boxes must be
 * click-through, with only real links taking pointer events.
 */
const css = readFileSync(join(__dirname, "../../apps/web/src/app/neural-landing.css"), "utf8");
const desktop = css.slice(css.indexOf("ARCHITECTURE A"), css.indexOf("ARCHITECTURE B"));

describe("landing page click-through", () => {
  it("full-artboard boxes are click-through in the desktop composition", () => {
    expect(desktop).toMatch(/\.bar,\.hero,\.foot,\.title,\.sub,\.feats,\.rule\{pointer-events:none\}/);
  });

  it("real links opt back in", () => {
    expect(desktop).toMatch(/\.bar a,\.hero a\{pointer-events:auto\}/);
  });

  it("the only inset:0 boxes are the ones made click-through", () => {
    const insetRules = [...desktop.matchAll(/([^{}]+)\{[^}]*inset:0[^}]*\}/g)].map((m) => m[1]!.trim());
    for (const selector of insetRules) for (const part of selector.split(",")) expect(desktop).toContain(`${part.trim()}`);
    expect(insetRules.join(",")).toMatch(/\.title/);
    expect(desktop).toMatch(/\.title,\.sub,\.feats\{inset:0/);
  });

  it("the hero is one viewport tall and the page scrolls beneath it (no scroll lock)", () => {
    expect(css).toMatch(/\.nl-hero\{position:relative;z-index:1;height:100vh;overflow:hidden\}/);
    const globals = readFileSync(join(__dirname, "../../apps/web/src/app/globals.css"), "utf8");
    expect(globals).not.toMatch(/html:has\(\.nl\)[^{]*\{[^}]*overflow:\s*hidden/);
  });
});
