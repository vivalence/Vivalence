import { specimen } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { declarations, THEMES } from "@vivalence/dapper";
import { contrast } from "@vivalence/dapper/contrast";
import { audit, verdict } from "../../src/app/design/audit.js";
import { css, colour, read } from "../../src/app/design/sheet.js";

const held = (zone) => Object.fromEntries(declarations(zone));

specimen.describe("the design page — its audit is dapper's floors, computed in the client", () => {
  specimen.it("the contrast door resolves without the pipe", () => {
    specimen.expect(contrast("#000000", "#FFFFFF")).toBe(21);
  });

  specimen.it("a zone is audited on 59 pairs", () => {
    specimen.expect(audit(held(THEMES.northsea.zones[1]))).toHaveLength(3 * (6 + 1 + 4 + 4 + 1) + 4 + 7);
  });

  for (const [name, theme] of Object.entries(THEMES)) {
    specimen.it(`${name}: every pair of every zone holds its floor`, () => {
      theme.zones.forEach((zone, index) => {
        const { misses } = verdict(audit(held(zone)));
        specimen.expect([name, index, misses.map((row) => `${row.label} ${row.ratio.toFixed(2)}`)]).toEqual([name, index, []]);
      });
    });
  }

  specimen.it("a miss is reported with its pair and its ratio", () => {
    const broken = { ...held(THEMES.porcelain.zones[0]), "--control-on-muted": "#8B97A3" };
    const { misses } = verdict(audit(broken));
    specimen.expect(misses.map((row) => [row.label, row.ratio.toFixed(2)])).toEqual([["muted label on a key", "2.60"]]);
  });

  specimen.it("the sheet is read back from its rules: a theme's root and its four zones", () => {
    const rule = (selectorText, values) => ({ selectorText, style: Object.assign(Object.keys(values), { getPropertyValue: (name) => values[name] }) });
    const zone = (index) => `:root[data-theme="porcelain"] [data-${"zone"}="${index}"]`;
    const held = read([{ cssRules: [rule(":root", { "--spacing-0": "0" }), rule(':root[data-theme="porcelain"]', { "--surface": "#EDF0F4" }), rule(zone(0), { "--surface": "#0E1A25" }), rule(".key", { color: "red" })] }]);
    specimen.expect(Object.keys(held.porcelain).sort()).toEqual(["0", "root"]);
    specimen.expect(held.porcelain["0"].values).toEqual({ "--surface": "#0E1A25" });
  });

  specimen.it("the sheet prints a block the way emit writes it, and knows a colour", () => {
    specimen.expect(css({ selector: ':root[data-theme="porcelain"]', values: { "--surface": "#EDF0F4" } })).toBe(':root[data-theme="porcelain"] {\n  --surface: #EDF0F4;\n}');
    specimen.expect(["#0E1A25", "rgba(0, 0, 0, 0.45)", "0 12px 30px", "var(--shape-radius-md)"].map(colour)).toEqual([true, true, false, false]);
  });
});

specimen.describe("the design page — it compiles", () => {
  specimen.it("design/+page.svelte compiles as a runes component without warnings", () => {
    const out = compile(Deno.readTextFileSync(new URL("../../src/app/design/+page.svelte", import.meta.url)), { generate: "client", runes: true, filename: "+page.svelte" });
    specimen.expect(out.warnings.filter((warning) => warning.code !== "css_unused_selector").map((warning) => `${warning.code}: ${warning.message}`)).toEqual([]);
  });
});
