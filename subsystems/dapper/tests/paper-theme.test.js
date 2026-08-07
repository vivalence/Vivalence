// Integration test: build the paper theme end-to-end and assert the
// flat scoped skeleton shape, plus spot-check a few key hexes.

import { specimen } from "@vivalence/typology";
import colors from "../lib/colors.js";
import tokens from "../lib/tokens.js";
import paper from "../themes/paper.js";

async function buildPaper() {
  const ds = { colors: {}, tokens: {}, themes: {} };
  await colors(ds);
  await tokens(ds);
  await paper(ds);
  return ds;
}

specimen.describe("paper theme — flat scoped skeletons", () => {
  specimen.it("exposes ds.themes.paper.colors.skeleton {0..4}", async () => {
    const ds = await buildPaper();
    const skeletons = ds.themes.paper.colors.skeleton;
    specimen.expect(skeletons).toBeDefined();
    specimen.expect(skeletons[0]).toBeDefined();
    specimen.expect(skeletons[1]).toBeDefined();
    specimen.expect(skeletons[2]).toBeDefined();
    specimen.expect(skeletons[3]).toBeDefined();
    specimen.expect(skeletons[4]).toBeDefined();
  });

  specimen.it("each skeleton has the 11 expected role keys + font", async () => {
    const ds = await buildPaper();
    const expectedKeys = [
      "surface", "contrast", "boundary",
      "primary", "secondary", "accent",
      "info", "success", "warning", "danger",
      "error", "font",
    ];
    for (const level of [0, 1, 2, 3, 4]) {
      const sk = ds.themes.paper.colors.skeleton[level];
      for (const key of expectedKeys) {
        specimen.expect(sk[key]).toBeDefined();
      }
    }
  });

  specimen.it("skeleton 0 uses PAPER[100] for surface and INK[900] for contrast", async () => {
    const ds = await buildPaper();
    const sk = ds.themes.paper.colors.skeleton[0];
    specimen.expect(sk.surface).toBe("#F5F3E8");
    specimen.expect(sk.contrast).toBe("#0B0F2D");
  });

  specimen.it("skeleton 1 has primary.base = AQUA[600] = #045554", async () => {
    const ds = await buildPaper();
    const sk = ds.themes.paper.colors.skeleton[1];
    specimen.expect(sk.primary.base).toBe("#045554");
  });

  specimen.it("skeleton 1 primary.hover walks one stop lighter to AQUA[500]", async () => {
    const ds = await buildPaper();
    const sk = ds.themes.paper.colors.skeleton[1];
    specimen.expect(sk.primary.hover).toBe("#066F6D");
  });

  specimen.it("skeleton 1 primary.active walks one stop darker to AQUA[700]", async () => {
    const ds = await buildPaper();
    const sk = ds.themes.paper.colors.skeleton[1];
    specimen.expect(sk.primary.active).toBe("#034342");
  });

  specimen.it("secondary and info signal in INK[700] — kaweco royal, dried", async () => {
    const ds = await buildPaper();
    const sk = ds.themes.paper.colors.skeleton[1];
    specimen.expect(sk.secondary.base).toBe("#222C74");
    specimen.expect(sk.info.base).toBe("#222C74");
  });

  specimen.it("boundaries stay in the warm paper family", async () => {
    const ds = await buildPaper();
    const skeletons = ds.themes.paper.colors.skeleton;
    specimen.expect(skeletons[1].boundary).toBe("#A0967C");
    specimen.expect(skeletons[2].boundary).toBe("#C1B9A0");
    specimen.expect(skeletons[3].boundary).toBe("#C1B9A0");
    specimen.expect(skeletons[4].boundary).toBe("#7C725B");
  });

  specimen.it("text ramp: primary ink[900], body paper[800], support paper[700]", async () => {
    const ds = await buildPaper();
    specimen.expect(ds.themes.paper.text.primary).toBe("#0B0F2D");
    specimen.expect(ds.themes.paper.text.body).toBe("#3D372A");
    specimen.expect(ds.themes.paper.text.support).toBe("#5A5240");
  });

  specimen.it("theme-owned shadow, mix, filter and shadow-token overrides", async () => {
    const ds = await buildPaper();
    specimen.expect(ds.themes.paper.shadow.soft).toBe("rgba(61, 55, 42, 0.16)");
    specimen.expect(ds.themes.paper.shadow.strong).toBe("rgba(61, 55, 42, 0.28)");
    specimen.expect(ds.themes.paper.mix.deep).toBe("#5A5240");
    specimen.expect(ds.themes.paper.filter.brand).toBeDefined();
    specimen.expect(ds.themes.paper["box-shadow"].xl).toBe("0 8px 24px rgba(61, 55, 42, 0.24)");
  });

  specimen.it("paper ramp carries the non-uniform 150 stop", async () => {
    const ds = await buildPaper();
    specimen.expect(ds.themes.paper.colors.roots.paper[150]).toBe("#F0EDDE");
    specimen.expect(ds.themes.paper.colors.skeleton[1].surface).toBe("#F0EDDE");
  });

  specimen.it("error is a {surface, contrast, boundary} box (no states)", async () => {
    const ds = await buildPaper();
    const sk = ds.themes.paper.colors.skeleton[1];
    specimen.expect(sk.error.surface).toBe("#F8EEEA");
    specimen.expect(sk.error.contrast).toBe("#44200C");
    specimen.expect(sk.error.boundary).toBe("#BE7055");
    specimen.expect(sk.error.base).toBeUndefined();
  });

  specimen.it("font tokenspace is shared across all skeletons", async () => {
    const ds = await buildPaper();
    for (const level of [0, 1, 2, 3, 4]) {
      const sk = ds.themes.paper.colors.skeleton[level];
      specimen.expect(sk.font.heading).toBe("sans-heading");
      specimen.expect(sk.font.body).toBe("sans-text");
      specimen.expect(sk.font.code).toBe("code");
    }
  });
});
