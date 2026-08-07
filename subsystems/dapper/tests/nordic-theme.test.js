// Integration test: build the nordic theme end-to-end and assert the
// flat scoped skeleton shape, plus spot-check a few key hexes.

import { specimen } from "@vivalence/typology";
import colors from "../lib/colors.js";
import tokens from "../lib/tokens.js";
import nordic from "../themes/nordic.js";

async function buildNordic() {
  const ds = { colors: {}, tokens: {}, themes: {} };
  await colors(ds);
  await tokens(ds);
  await nordic(ds);
  return ds;
}

specimen.describe("nordic theme — flat scoped skeletons", () => {
  specimen.it("exposes ds.themes.nordic.colors.skeleton {0..4}", async () => {
    const ds = await buildNordic();
    const skeletons = ds.themes.nordic.colors.skeleton;
    specimen.expect(skeletons).toBeDefined();
    specimen.expect(skeletons[0]).toBeDefined();
    specimen.expect(skeletons[1]).toBeDefined();
    specimen.expect(skeletons[2]).toBeDefined();
    specimen.expect(skeletons[3]).toBeDefined();
    specimen.expect(skeletons[4]).toBeDefined();
  });

  specimen.it("provides theme/system aliases derived from skeleton 1", async () => {
    const ds = await buildNordic();
    specimen.expect(ds.themes.nordic.colors.theme).toBeDefined();
    specimen.expect(ds.themes.nordic.colors.theme.primary.surface).toBeDefined();
    specimen.expect(ds.themes.nordic.colors.system).toBeDefined();
    specimen.expect(ds.themes.nordic.colors.system.success.surface).toBeDefined();
    specimen.expect(ds.themes.nordic.colors.system.error.surface).toBeDefined();
    specimen.expect(ds.themes.nordic.colors.skeleton[0].primary).toBeDefined();
    specimen.expect(ds.themes.nordic.colors.skeleton[0].app).toBeUndefined();
  });

  specimen.it("each skeleton has the 11 expected role keys + font", async () => {
    const ds = await buildNordic();
    const expectedKeys = [
      "surface", "contrast", "boundary",
      "primary", "secondary", "accent",
      "info", "success", "warning", "danger",
      "error", "font",
    ];
    for (const level of [0, 1, 2, 3, 4]) {
      const sk = ds.themes.nordic.colors.skeleton[level];
      for (const key of expectedKeys) {
        specimen.expect(sk[key]).toBeDefined();
      }
    }
  });

  specimen.it("interactive roles are {base, hover, active} triplets", async () => {
    const ds = await buildNordic();
    const sk = ds.themes.nordic.colors.skeleton[1];
    const interactiveRoles = ["primary", "secondary", "accent", "info", "success", "warning", "danger"];
    for (const role of interactiveRoles) {
      specimen.expect(sk[role].base).toBeDefined();
      specimen.expect(sk[role].hover).toBeDefined();
      specimen.expect(sk[role].active).toBeDefined();
    }
  });

  specimen.it("error is a {surface, contrast, boundary} box (no states)", async () => {
    const ds = await buildNordic();
    const sk = ds.themes.nordic.colors.skeleton[1];
    specimen.expect(sk.error.surface).toBeDefined();
    specimen.expect(sk.error.contrast).toBeDefined();
    specimen.expect(sk.error.boundary).toBeDefined();
    specimen.expect(sk.error.base).toBeUndefined();
    specimen.expect(sk.error.hover).toBeUndefined();
  });

  specimen.it("no skeleton has a disabled role", async () => {
    const ds = await buildNordic();
    for (const level of [0, 1, 2, 3, 4]) {
      const sk = ds.themes.nordic.colors.skeleton[level];
      specimen.expect(sk.disabled).toBeUndefined();
    }
  });

  specimen.it("skeleton 0 uses DEEP[900] for surface and IRON[100] for contrast", async () => {
    const ds = await buildNordic();
    const sk = ds.themes.nordic.colors.skeleton[0];
    specimen.expect(sk.surface).toBe("#06101D");
    specimen.expect(sk.contrast).toBe("#E6EAEF");
  });

  specimen.it("skeleton 1 has primary.base = AQUA[300] = #1EBCB5 (the brand)", async () => {
    const ds = await buildNordic();
    const sk = ds.themes.nordic.colors.skeleton[1];
    specimen.expect(sk.primary.base).toBe("#1EBCB5");
  });

  specimen.it("skeleton 1 primary.hover walks one stop lighter to AQUA[200]", async () => {
    const ds = await buildNordic();
    const sk = ds.themes.nordic.colors.skeleton[1];
    specimen.expect(sk.primary.hover).toBe("#51D8D0");
  });

  specimen.it("skeleton 1 primary.active walks one stop darker to AQUA[400]", async () => {
    const ds = await buildNordic();
    const sk = ds.themes.nordic.colors.skeleton[1];
    specimen.expect(sk.primary.active).toBe("#089791");
  });

  specimen.it("font tokenspace is shared across all skeletons", async () => {
    const ds = await buildNordic();
    for (const level of [0, 1, 2, 3, 4]) {
      const sk = ds.themes.nordic.colors.skeleton[level];
      specimen.expect(sk.font.heading).toBe("sans-heading");
      specimen.expect(sk.font.body).toBe("sans-text");
      specimen.expect(sk.font.code).toBe("code");
    }
  });

  specimen.it("text ramp: primary iron[100], body iron[300], support iron[400]", async () => {
    const ds = await buildNordic();
    specimen.expect(ds.themes.nordic.text.primary).toBe("#E6EAEF");
    specimen.expect(ds.themes.nordic.text.body).toBe("#B4BFCB");
    specimen.expect(ds.themes.nordic.text.support).toBe("#8FA0B1");
  });

  specimen.it("theme-owned shadow, mix and filter primitives", async () => {
    const ds = await buildNordic();
    specimen.expect(ds.themes.nordic.shadow.soft).toBe("rgba(0, 0, 0, 0.45)");
    specimen.expect(ds.themes.nordic.shadow.strong).toBe("rgba(0, 0, 0, 0.7)");
    specimen.expect(ds.themes.nordic.mix.deep).toBe("#000000");
    specimen.expect(ds.themes.nordic.filter.brand).toBeDefined();
  });

  specimen.it("preserves the roots and palette under colors for escape hatches", async () => {
    const ds = await buildNordic();
    specimen.expect(ds.themes.nordic.colors.roots).toBeDefined();
    specimen.expect(ds.themes.nordic.colors.roots.iron[850]).toBe("#1A2A38");
    specimen.expect(ds.themes.nordic.colors.palette).toBeDefined();
  });
});
