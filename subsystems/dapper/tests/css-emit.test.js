// CSS variable emission smoke test (M2).
// Builds the dark theme through the belt's generateCSS, then asserts that
// the explicit --colors-skeleton-N-role[-state] variables exist with
// correct hexes. This validates the full pipeline:
//   colors → tokens → themes → generateCSS → CSS string

import { specimen } from "@vivalence/typology";
import colors from "../lib/colors.js";
import tokens from "../lib/tokens.js";
import dark from "../themes/dark.js";
import { generateCSS } from "../lib/flatten.js";

async function emit() {
  const ds = { colors: {}, tokens: {}, themes: {} };
  await colors(ds);
  await tokens(ds);
  await dark(ds);
  const result = generateCSS(ds);
  return result.output.css;
}

specimen.describe("css emit — flat scoped skeletons", () => {
  specimen.it("declares :root[data-theme='dark']", async () => {
    const css = await emit();
    specimen.expect(css.includes(`:root[data-theme="dark"]`)).toBe(true);
  });

  specimen.it("emits structural skeleton vars (singular `skeleton`)", async () => {
    const css = await emit();
    specimen.expect(css.includes("--colors-skeleton-0-surface: #0F1C35;")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-0-contrast: #D7CFAE;")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-1-surface: #1A2A38;")).toBe(true);
  });

  specimen.it("emits explicit interactive states for primary", async () => {
    const css = await emit();
    specimen.expect(css.includes("--colors-skeleton-1-primary-base: #1EBCB5;")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-1-primary-hover: #51D8D0;")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-1-primary-active: #089791;")).toBe(true);
  });

  specimen.it("emits explicit interactive states for danger", async () => {
    const css = await emit();
    specimen.expect(css.includes("--colors-skeleton-1-danger-base:")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-1-danger-hover:")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-1-danger-active:")).toBe(true);
  });

  specimen.it("emits the error box triplet (no states)", async () => {
    const css = await emit();
    specimen.expect(css.includes("--colors-skeleton-1-error-surface:")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-1-error-contrast:")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-1-error-boundary:")).toBe(true);
    // and definitely no error-base
    specimen.expect(css.includes("--colors-skeleton-1-error-base:")).toBe(false);
  });

  specimen.it("emits all 5 skeletons", async () => {
    const css = await emit();
    for (const level of [0, 1, 2, 3, 4]) {
      specimen.expect(css.includes(`--colors-skeleton-${level}-surface:`)).toBe(true);
      specimen.expect(css.includes(`--colors-skeleton-${level}-primary-base:`)).toBe(true);
    }
  });

  specimen.it("emits --colors-theme-* and --colors-system-* compatibility aliases", async () => {
    const css = await emit();
    specimen.expect(css.includes("--colors-theme-primary-surface:")).toBe(true);
    specimen.expect(css.includes("--colors-system-success-surface:")).toBe(true);
    specimen.expect(css.includes("--colors-system-error-surface:")).toBe(true);
  });

  specimen.it("does NOT emit any --colors-skeleton-N-disabled vars", async () => {
    const css = await emit();
    for (const level of [0, 1, 2, 3, 4]) {
      specimen.expect(css.includes(`--colors-skeleton-${level}-disabled`)).toBe(false);
    }
  });
});
