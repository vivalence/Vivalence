import { specimen, v } from "@vivalence/typology";
import { PALETTE, fold, scales, tokens } from "../lib/tokens.js";
import { declarations } from "../lib/emit.js";
import { contrast, flatten } from "../lib/contrast.js";
import { THEMES } from "../themes/index.js";

const { ZONES } = v.primitives.theme;

const KEBAB = [
  "surface", "surface-sunk", "surface-lift", "boundary", "boundary-strong", "divider",
  "text-strong", "text-ink", "text-light", "text-muted", "text-link",
  "signal-primary", "signal-primary-ink", "signal-positive", "signal-positive-ink", "signal-caution", "signal-caution-ink", "signal-negative", "signal-negative-ink",
  "control-selected", "control-field", "control-field-caret", "inverse", "inverse-on",
  "signal-caution-tint", "signal-negative-tint", "signal-primary-tint",
];
const CAMEL = [
  "surface", "surfaceSunk", "surfaceLift", "boundary", "boundaryStrong", "divider",
  "textStrong", "textInk", "textLight", "textMuted", "textLink",
  "signalPrimary", "signalPrimaryInk", "signalPositive", "signalPositiveInk", "signalCaution", "signalCautionInk", "signalNegative", "signalNegativeInk",
  "controlSelected", "controlField", "controlFieldCaret", "inverse", "inverseOn",
  "signalCautionTint", "signalNegativeTint", "signalPrimaryTint",
];
const TODAY = [
  "surface", "surfaceSunk", "surfaceLift", "boundary", "textStrong", "textInk", "textMuted", "textLink",
  "signalPrimary", "signalPositive", "signalCaution", "signalNegative", "inverse", "inverseOn",
];
const PAIRS = [
  ["text-ink", "surface", 4.5], ["text-muted", "surface", 3], ["signal-primary-ink", "surface", 4.5], ["signal-caution-ink", "surface", 4.5],
  ["signal-negative-ink", "surface", 4.5], ["signal-primary-ink", "surface-lift", 4.5],
];
const HEX = /^#[0-9A-F]{6}$/;

specimen.describe("tokens — the flat palette a face reads, in two spellings", () => {
  for (const name of Object.keys(THEMES)) {
    for (const zone of ZONES) {
      const kebab = tokens.kebab(name, zone);
      const camel = tokens.camel(name, zone);
      const emitted = Object.fromEntries(declarations(THEMES[name].zones[Number(zone)]));

      specimen.it(`${name} zone ${zone}: twenty-seven kebab names, the tty.js KEYS`, () => {
        specimen.expect(Object.keys(kebab).sort()).toEqual([...KEBAB].sort());
      });

      specimen.it(`${name} zone ${zone}: twenty-seven camel names, today's fourteen among them`, () => {
        specimen.expect(Object.keys(camel).sort()).toEqual([...CAMEL].sort());
        for (const key of TODAY) specimen.expect([key, Object.hasOwn(camel, key)]).toEqual([key, true]);
      });

      specimen.it(`${name} zone ${zone}: the two spellings are one walk — the same values in the same order`, () => {
        specimen.expect(Object.values(camel)).toEqual(Object.values(kebab));
        specimen.expect(Object.keys(camel).map((key) => CAMEL.indexOf(key))).toEqual(Object.keys(kebab).map((key) => KEBAB.indexOf(key)));
      });

      specimen.it(`${name} zone ${zone}: every value is opaque hex — a tint is folded over the surface`, () => {
        for (const [key, value] of Object.entries(kebab)) specimen.expect([key, HEX.test(value)]).toEqual([key, true]);
        specimen.expect(kebab["signal-primary-tint"]).toBe(flatten(emitted["--signal-primary-tint"], emitted["--surface"]));
        specimen.expect(kebab["signal-primary-tint"]).not.toBe(kebab["signal-primary"]);
      });

      specimen.it(`${name} zone ${zone}: each kebab name is the CSS variable emit declares, flattened`, () => {
        for (const key of KEBAB) {
          specimen.expect([key, kebab[key]]).toEqual([key, flatten(emitted[`--${key}`], emitted["--surface"])]);
        }
      });

      specimen.it(`${name} zone ${zone}: the a11y pairs hold`, () => {
        for (const [ink, ground, minimum] of PAIRS) {
          specimen.expect([ink, ground, contrast(kebab[ink], kebab[ground]) >= minimum]).toEqual([ink, ground, true]);
        }
        const on = contrast(flatten(emitted["--control-on"], emitted["--surface"]), flatten(emitted["--control-contrast"], emitted["--surface"]));
        specimen.expect(["control-on", "control-contrast", on >= 4.5]).toEqual(["control-on", "control-contrast", true]);
      });
    }
  }

  specimen.it("the palette shape holds twenty-seven leaves", () => {
    specimen.expect(fold(PALETTE, (prefix, key) => `${prefix}/${key}`)).toHaveLength(27);
  });

  specimen.it("an unknown theme throws naming the four, in both spellings", () => {
    specimen.expect(() => tokens.camel("dark", "1")).toThrow(/not a theme: "dark" · northsea · parchment · porcelain · datasette/);
    specimen.expect(() => tokens.kebab("dark", "1")).toThrow(/not a theme: "dark"/);
  });

  specimen.it("an unknown zone throws", () => {
    specimen.expect(() => tokens.camel("northsea", "7")).toThrow(/not a zone: "7"/);
    specimen.expect(() => tokens.kebab("northsea", "7")).toThrow(/not a zone: "7"/);
  });
});

specimen.describe("fold — one walk, the join is the spelling", () => {
  const held = { surface: "#000000", text: { strong: "#111111" }, signal: { primary: { fill: "#222222", ink: "#333333" } }, control: { fieldCaret: "#444444" }, box: { DEFAULT: "1px" }, list: ["a", "b"] };

  specimen.it("kebab: a camel key splits on its humps, an upper word lowers, a fill is the bare name", () => {
    specimen.expect(fold(held, (prefix, key) => `${prefix === "" ? "" : `${prefix}-`}${key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`)).toEqual([
      ["surface", "#000000"], ["text-strong", "#111111"], ["signal-primary", "#222222"], ["signal-primary-ink", "#333333"], ["control-field-caret", "#444444"], ["box-default", "1px"], ["list", "a, b"],
    ]);
  });

  specimen.it("camel: the spellings of tokens.camel", () => {
    specimen.expect(Object.keys(tokens.camel("northsea", "1")).sort()).toEqual([...CAMEL].sort());
  });

  specimen.it("scales() is the same walk over TOKENS under a dashed prefix: every scale name, kebab", () => {
    const names = [...scales().matchAll(/^  (--[a-z0-9-]+): /gm)].map(([, name]) => name);
    specimen.expect(names).toHaveLength(56);
    for (const name of ["--spacing-0", "--font-size-2xs", "--line-height-base", "--box-shadow-default", "--drop-shadow-none", "--container-padding-default", "--border-radius-full", "--animation-spin-slow"]) {
      specimen.expect([name, names.includes(name)]).toEqual([name, true]);
    }
    specimen.expect(names.some((name) => /[A-Z]/.test(name))).toBe(false);
  });
});
