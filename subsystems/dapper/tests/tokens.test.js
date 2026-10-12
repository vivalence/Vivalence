import { specimen, v } from "@vivalence/typology";
import { tokens } from "../lib/tokens.js";
import { declarations } from "../lib/emit.js";
import { THEMES } from "../themes/index.js";

const { ZONES } = v.primitives.theme;

const KEYS = [
  "surface", "surfaceSunk", "surfaceLift", "boundary", "textStrong", "textInk", "textMuted", "textLink",
  "signalPrimary", "signalPositive", "signalCaution", "signalNegative", "inverse", "inverseOn",
];

const VARIABLES = {
  surface: "--surface", surfaceSunk: "--surface-sunk", surfaceLift: "--surface-lift", boundary: "--boundary",
  textStrong: "--text-strong", textInk: "--text-ink", textMuted: "--text-muted", textLink: "--text-link",
  signalPrimary: "--signal-primary", signalPositive: "--signal-positive", signalCaution: "--signal-caution",
  signalNegative: "--signal-negative", inverse: "--inverse", inverseOn: "--inverse-on",
};

specimen.describe("tokens(theme, zone) — the flat palette a tty reads", () => {
  for (const name of Object.keys(THEMES)) {
    for (const zone of ZONES) {
      specimen.it(`${name} zone ${zone}: fourteen hex values, each the CSS variable emit writes`, () => {
        const flat = tokens(name, zone);
        const emitted = Object.fromEntries(declarations(THEMES[name].zones[Number(zone)]));
        specimen.expect(Object.keys(flat)).toEqual(KEYS);
        for (const key of KEYS) {
          specimen.expect(flat[key]).toMatch(/^#[0-9A-F]{6}$/i);
          if (/^#[0-9A-F]{6}$/i.test(emitted[VARIABLES[key]])) specimen.expect(flat[key].toUpperCase()).toBe(emitted[VARIABLES[key]].toUpperCase());
        }
      });
    }
  }

  specimen.it("an unknown theme throws naming the four", () => {
    specimen.expect(() => tokens("dark", "1")).toThrow(/not a theme: "dark" · northsea · parchment · porcelain · datasette/);
  });

  specimen.it("an unknown zone throws", () => {
    specimen.expect(() => tokens("northsea", "7")).toThrow(/not a zone: "7"/);
  });
});
