import { specimen } from "@vivalence/typology";
import colors from "../lib/colors.js";
import tokens from "../lib/tokens.js";
import nordic from "../themes/nordic.js";
import { generateCSS, generateZoneCSS, ZONE, ZONE_COUNT } from "../lib/flatten.js";

async function build() {
  const ds = { colors: {}, tokens: {}, themes: {} };
  await colors(ds);
  await tokens(ds);
  await nordic(ds);
  return ds;
}

async function emit() {
  const ds = await build();
  const result = generateCSS(ds);
  return result.output.css;
}

specimen.describe("zone enum", () => {
  specimen.it("has 6 zones (0–5)", () => {
    specimen.expect(ZONE_COUNT).toBe(6);
    specimen.expect(ZONE.Z0).toBe(0);
    specimen.expect(ZONE.Z5).toBe(5);
  });
});

specimen.describe("theme POJO — zones array", () => {
  specimen.it("nordic theme has 6 zones", async () => {
    const ds = await build();
    specimen.expect(ds.themes.nordic.zones.length).toBe(6);
  });

  specimen.it("each zone has surface/contrast/boundary", async () => {
    const ds = await build();
    for (let index = 0; index < 6; index++) {
      const zone = ds.themes.nordic.zones[index];
      specimen.expect(typeof zone.surface).toBe("string");
      specimen.expect(typeof zone.contrast).toBe("string");
      specimen.expect(typeof zone.boundary).toBe("string");
    }
  });

  specimen.it("each zone has 7 interactive roles with base/hover/active", async () => {
    const ds = await build();
    const roles = ["primary", "secondary", "accent", "info", "success", "warning", "danger"];
    for (let index = 0; index < 6; index++) {
      const zone = ds.themes.nordic.zones[index];
      for (const role of roles) {
        specimen.expect(typeof zone[role].base).toBe("string");
        specimen.expect(typeof zone[role].hover).toBe("string");
        specimen.expect(typeof zone[role].active).toBe("string");
      }
    }
  });

  specimen.it("each zone has error box triplet", async () => {
    const ds = await build();
    for (let index = 0; index < 6; index++) {
      const zone = ds.themes.nordic.zones[index];
      specimen.expect(typeof zone.error.surface).toBe("string");
      specimen.expect(typeof zone.error.contrast).toBe("string");
      specimen.expect(typeof zone.error.boundary).toBe("string");
    }
  });

  specimen.it("nordic theme has fonts object", async () => {
    const ds = await build();
    specimen.expect(ds.themes.nordic.fonts.heading).toBe("sans-heading");
    specimen.expect(ds.themes.nordic.fonts.body).toBe("sans-text");
    specimen.expect(ds.themes.nordic.fonts.code).toBe("code");
  });

  specimen.it("zone 0 uses deep[800] surface", async () => {
    const ds = await build();
    specimen.expect(ds.themes.nordic.zones[0].surface).toBe("#06101D");
  });

  specimen.it("zone 1 uses iron[850] surface", async () => {
    const ds = await build();
    specimen.expect(ds.themes.nordic.zones[1].surface).toBe("#0E1A25");
  });

  specimen.it("zone 5 (reserved) uses iron[950] surface", async () => {
    const ds = await build();
    specimen.expect(ds.themes.nordic.zones[5].surface).toBe("#030812");
  });
});

specimen.describe("zone CSS emission", () => {
  specimen.it("emits .zone-N scoped blocks for all 6 zones", async () => {
    const css = await emit();
    for (let index = 0; index < 6; index++) {
      specimen.expect(css.includes(`:root[data-theme="nordic"] .zone-${index}`)).toBe(true);
    }
  });

  specimen.it("zone blocks use --zone-* variable names", async () => {
    const css = await emit();
    specimen.expect(css.includes("--zone-surface:")).toBe(true);
    specimen.expect(css.includes("--zone-contrast:")).toBe(true);
    specimen.expect(css.includes("--zone-boundary:")).toBe(true);
    specimen.expect(css.includes("--zone-primary-base:")).toBe(true);
    specimen.expect(css.includes("--zone-primary-hover:")).toBe(true);
    specimen.expect(css.includes("--zone-primary-active:")).toBe(true);
    specimen.expect(css.includes("--zone-danger-base:")).toBe(true);
  });

  specimen.it("zone blocks contain error box variables", async () => {
    const css = await emit();
    specimen.expect(css.includes("--zone-error-surface:")).toBe(true);
    specimen.expect(css.includes("--zone-error-contrast:")).toBe(true);
    specimen.expect(css.includes("--zone-error-boundary:")).toBe(true);
  });

  specimen.it("emits font variables on :root[data-theme] (not per zone)", async () => {
    const css = await emit();
    specimen.expect(css.includes("--zone-font-heading: sans-heading;")).toBe(true);
    specimen.expect(css.includes("--zone-font-body: sans-text;")).toBe(true);
    specimen.expect(css.includes("--zone-font-code: code;")).toBe(true);
  });

  specimen.it("zone 0 block has correct surface hex", async () => {
    const css = await emit();
    const zone0Block = css.split(".zone-0")[1].split("}")[0];
    specimen.expect(zone0Block.includes("--zone-surface: #06101D;")).toBe(true);
  });

  specimen.it("legacy --colors-skeleton-N-* variables still emitted", async () => {
    const css = await emit();
    specimen.expect(css.includes("--colors-skeleton-0-surface:")).toBe(true);
    specimen.expect(css.includes("--colors-skeleton-1-primary-base:")).toBe(true);
  });

  specimen.it("does not emit zone-N blocks without --colors- prefix", async () => {
    const css = await emit();
    specimen.expect(css.includes("--zone-skeleton-")).toBe(false);
  });
});
