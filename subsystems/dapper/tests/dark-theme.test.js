// Integration test: build the dark theme end-to-end and assert the
// flat scoped skeleton shape, plus spot-check a few key hexes.

import { specimen } from "@vivalence/typology";
import colors from "../primitives/colors.js";
import tokens from "../primitives/tokens.js";
import dark from "../themes/dark.js";

async function buildDark() {
  const ds = { colors: {}, tokens: {}, themes: {} };
  await colors(ds);
  await tokens(ds);
  await dark(ds);
  return ds;
}

specimen.describe("dark theme — flat scoped skeletons", () => {
  specimen.it("exposes ds.themes.dark.colors.skeleton {0..4}", async () => {
    const ds = await buildDark();
    const skeletons = ds.themes.dark.colors.skeleton;
    specimen.expect(skeletons).toBeDefined();
    specimen.expect(skeletons[0]).toBeDefined();
    specimen.expect(skeletons[1]).toBeDefined();
    specimen.expect(skeletons[2]).toBeDefined();
    specimen.expect(skeletons[3]).toBeDefined();
    specimen.expect(skeletons[4]).toBeDefined();
  });

  specimen.it("kills the old top-level theme/system groups", async () => {
    const ds = await buildDark();
    specimen.expect(ds.themes.dark.colors.theme).toBeUndefined();
    specimen.expect(ds.themes.dark.colors.system).toBeUndefined();
    // skeleton lives on, but as a flat scoped universe — not the old chrome layers shape
    specimen.expect(ds.themes.dark.colors.skeleton[0].primary).toBeDefined();
    specimen.expect(ds.themes.dark.colors.skeleton[0].app).toBeUndefined();
  });

  specimen.it("each skeleton has the 11 expected role keys + font", async () => {
    const ds = await buildDark();
    const expectedKeys = [
      "surface", "contrast", "boundary",
      "primary", "secondary", "accent",
      "info", "success", "warning", "danger",
      "error", "font",
    ];
    for (const level of [0, 1, 2, 3, 4]) {
      const sk = ds.themes.dark.colors.skeleton[level];
      for (const key of expectedKeys) {
        specimen.expect(sk[key]).toBeDefined();
      }
    }
  });

  specimen.it("interactive roles are {base, hover, active} triplets", async () => {
    const ds = await buildDark();
    const sk = ds.themes.dark.colors.skeleton[1];
    const interactiveRoles = ["primary", "secondary", "accent", "info", "success", "warning", "danger"];
    for (const role of interactiveRoles) {
      specimen.expect(sk[role].base).toBeDefined();
      specimen.expect(sk[role].hover).toBeDefined();
      specimen.expect(sk[role].active).toBeDefined();
    }
  });

  specimen.it("error is a {surface, contrast, boundary} box (no states)", async () => {
    const ds = await buildDark();
    const sk = ds.themes.dark.colors.skeleton[1];
    specimen.expect(sk.error.surface).toBeDefined();
    specimen.expect(sk.error.contrast).toBeDefined();
    specimen.expect(sk.error.boundary).toBeDefined();
    specimen.expect(sk.error.base).toBeUndefined();
    specimen.expect(sk.error.hover).toBeUndefined();
  });

  specimen.it("no skeleton has a disabled role", async () => {
    const ds = await buildDark();
    for (const level of [0, 1, 2, 3, 4]) {
      const sk = ds.themes.dark.colors.skeleton[level];
      specimen.expect(sk.disabled).toBeUndefined();
    }
  });

  specimen.it("skeleton 0 uses DEEP[800] for surface and GOLD[200] for contrast", async () => {
    const ds = await buildDark();
    const sk = ds.themes.dark.colors.skeleton[0];
    specimen.expect(sk.surface).toBe("#0F1C35");
    specimen.expect(sk.contrast).toBe("#D7CFAE");
  });

  specimen.it("skeleton 1 has primary.base = AQUA[300] = #1EBCB5 (the brand)", async () => {
    const ds = await buildDark();
    const sk = ds.themes.dark.colors.skeleton[1];
    specimen.expect(sk.primary.base).toBe("#1EBCB5");
  });

  specimen.it("skeleton 1 primary.hover walks one stop lighter to AQUA[200]", async () => {
    const ds = await buildDark();
    const sk = ds.themes.dark.colors.skeleton[1];
    specimen.expect(sk.primary.hover).toBe("#51D8D0");
  });

  specimen.it("skeleton 1 primary.active walks one stop darker to AQUA[400]", async () => {
    const ds = await buildDark();
    const sk = ds.themes.dark.colors.skeleton[1];
    specimen.expect(sk.primary.active).toBe("#089791");
  });

  specimen.it("font tokenspace is shared across all skeletons", async () => {
    const ds = await buildDark();
    for (const level of [0, 1, 2, 3, 4]) {
      const sk = ds.themes.dark.colors.skeleton[level];
      specimen.expect(sk.font.heading).toBe("sans-heading");
      specimen.expect(sk.font.body).toBe("sans-text");
      specimen.expect(sk.font.code).toBe("code");
    }
  });

  specimen.it("preserves the roots and palette under colors for escape hatches", async () => {
    const ds = await buildDark();
    specimen.expect(ds.themes.dark.colors.roots).toBeDefined();
    specimen.expect(ds.themes.dark.colors.roots.iron[850]).toBe("#1A2A38");
    specimen.expect(ds.themes.dark.colors.palette).toBeDefined();
  });
});
