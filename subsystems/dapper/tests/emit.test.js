import { specimen, v } from "@vivalence/typology";
import { theme } from "../lib/theme.js";
import { declarations, emit } from "../lib/emit.js";
import { design } from "../lib/system.js";
import { TOKENS, scales } from "../lib/tokens.js";
import { THEMES } from "../themes/index.js";
import * as northseaGradients from "../themes/northsea/gradients.js";
import * as parchmentGradients from "../themes/parchment/gradients.js";

const { STEPS, SIGNALS } = v.primitives.theme;

const FLOOR = { text: { ink: "#3D372A" }, signal: { primary: "#045554" }, zones: { 1: "#F0EDDE" } };
const GRADIENTS = [...new Set([...Object.keys(northseaGradients), ...Object.keys(parchmentGradients)])];

const blocks = (css) =>
  [...css.matchAll(/^([^\n{}]+) \{\n([^}]*)\}/gm)].map(([, selector, body]) => ({
    selector,
    declarations: body.trim().split("\n").map((line) => line.trim().replace(/;$/, "").split(/: (.*)/s).slice(0, 2)),
  }));
const named = (css, selector) => blocks(css).find((block) => block.selector === selector);
const value = (block, name) => block.declarations.find(([held]) => held === name)?.[1];

const ds = await design();

specimen.describe("emit — the shape of one theme's sheet", () => {
  for (const [name, held] of Object.entries(THEMES)) {
    const css = emit(name, held);
    const root = `:root[data-theme="${name}"]`;

    specimen.it(`${name}: five blocks — the root and four zones, in order`, () => {
      specimen.expect(blocks(css).map((block) => block.selector)).toEqual([
        root, `${root} [data-zone="0"]`, `${root} [data-zone="1"]`, `${root} [data-zone="2"]`, `${root} [data-zone="3"]`,
      ]);
    });

    specimen.it(`${name}: every block holds 106 declarations, no name twice`, () => {
      for (const block of blocks(css)) {
        specimen.expect([block.selector, block.declarations.length]).toEqual([block.selector, 106]);
        specimen.expect([block.selector, new Set(block.declarations.map(([held]) => held)).size]).toEqual([block.selector, 106]);
      }
    });

    specimen.it(`${name}: every block declares the same 106 names in the same order`, () => {
      const [first, ...rest] = blocks(css).map((block) => block.declarations.map(([held]) => held));
      for (const names of rest) specimen.expect(names).toEqual(first);
    });

    specimen.it(`${name}: the root is zone 1, whole`, () => {
      specimen.expect(named(css, root).declarations).toEqual(named(css, `${root} [data-zone="1"]`).declarations);
    });

    specimen.it(`${name}: no declaration is empty, undefined or an object`, () => {
      for (const block of blocks(css)) {
        for (const [held, stated] of block.declarations) {
          specimen.expect([held, /undefined|null|NaN|\[object/.test(stated) || stated === ""]).toEqual([held, false]);
        }
      }
    });

    specimen.it(`${name}: no gradient name and no --colors- declaration`, () => {
      specimen.expect(css.includes("--colors-")).toBe(false);
      for (const gradient of GRADIENTS) {
        specimen.expect([gradient, new RegExp(`\\b${gradient}-\\d{2,3}\\b`).test(css)]).toEqual([gradient, false]);
        if (gradient !== "ink") specimen.expect([gradient, new RegExp(`\\b${gradient}\\b`).test(css)]).toEqual([gradient, false]);
      }
    });

    specimen.it(`${name}: every var() points at a name the same block declares`, () => {
      for (const block of blocks(css)) {
        const names = new Set(block.declarations.map(([held]) => held));
        for (const [held, stated] of block.declarations) {
          for (const [, target] of stated.matchAll(/var\((--[a-z0-9-]+)\)/g)) {
            specimen.expect([held, target, names.has(target)]).toEqual([held, target, true]);
          }
        }
      }
    });
  }
});

specimen.describe("emit — names", () => {
  const names = declarations(THEMES.northsea.zones[3]).map(([name]) => name);

  specimen.it("the twelve ground keys lead, bare, in kebab", () => {
    specimen.expect(names.slice(0, 12)).toEqual([
      "--surface", "--surface-sunk", "--surface-lift", "--boundary", "--boundary-strong", "--boundary-soft",
      "--divider", "--inverse", "--inverse-on", "--shadow", "--scrim", "--dim",
    ]);
  });

  specimen.it("the groups follow: shape 19 · size 29 · text 8 · control 13 · signal 16 · brand 3 · font 6", () => {
    const count = (prefix) => names.filter((name) => name.startsWith(prefix)).length;
    specimen.expect([count("--shape-"), count("--size-"), count("--text-"), count("--control-"), count("--signal-"), count("--brand-"), count("--font-")]).toEqual([19, 29, 8, 13, 16, 3, 6]);
    specimen.expect(names.slice(-6)).toEqual(["--font-family-sans-heading", "--font-family-sans-text", "--font-family-serif-heading", "--font-family-serif-text", "--font-family-brand", "--font-family-code"]);
  });

  specimen.it("camelCase leaves as kebab", () => {
    for (const name of ["--control-contrast-hover", "--control-contrast-pressed", "--control-on-muted", "--control-on-pressed", "--control-field-placeholder", "--control-field-caret"]) {
      specimen.expect([name, names.includes(name)]).toEqual([name, true]);
    }
    specimen.expect(names.some((name) => /[A-Z]/.test(name))).toBe(false);
  });

  specimen.it("a signal's fill is the bare signal name", () => {
    for (const signal of SIGNALS) {
      specimen.expect(names.filter((name) => name.startsWith(`--signal-${signal}`))).toEqual([
        `--signal-${signal}`, `--signal-${signal}-ink`, `--signal-${signal}-tint`, `--signal-${signal}-on`,
      ]);
    }
  });

  specimen.it("every name is one of today's seven prefixes or a ground key", () => {
    const stray = names.slice(12).filter((name) => !/^--(shape|size|text|control|signal|brand|font)-[a-z0-9-]+$/.test(name));
    specimen.expect(stray).toEqual([]);
  });

  specimen.it("a theme name outside a-z, digits and dashes is refused", () => {
    for (const name of ["", "North Sea", "northsea\"]", "9lives", "nord;ic", undefined]) {
      specimen.expect(() => emit(name, THEMES.northsea)).toThrow("not a theme name");
    }
  });
});

specimen.describe("emit — values", () => {
  const zone = Object.fromEntries(declarations(THEMES.northsea.zones[3]));

  specimen.it("colours leave as stated", () => {
    specimen.expect([zone["--surface"], zone["--boundary-soft"], zone["--text-ink"], zone["--control-selected"]])
      .toEqual(["#1A2A38", "rgba(56, 74, 94, 0.5)", "#B4BFCB", "rgba(30, 188, 181, 0.18)"]);
  });

  specimen.it("ratios drop the leading zero", () => {
    specimen.expect([zone["--dim"], zone["--text-disabled"]]).toEqual([".55", ".45"]);
    specimen.expect(Object.fromEntries(declarations(THEMES.northsea.zones[2]))["--dim"]).toBe(".5");
  });

  specimen.it("a space step is unit × its factor", () => {
    specimen.expect(STEPS.map((step) => zone[`--size-space-${step}`])).toEqual(
      [1, 2, 3, 4, 6, 8, 12, 16].map((factor) => `calc(var(--size-unit) * ${factor})`),
    );
    specimen.expect([zone["--size-row"], zone["--size-key"]]).toEqual(["calc(var(--size-unit) * 6.5)", "calc(var(--size-unit) * 7)"]);
  });

  specimen.it("a role points at its space step", () => {
    specimen.expect([zone["--size-gap"], zone["--size-pad-box"], zone["--size-pad-x"], zone["--size-pad-y"], zone["--size-icon"], zone["--size-field"]]).toEqual([
      "var(--size-space-xs)", "var(--size-space-sm)", "var(--size-space-sm)", "var(--size-space-2xs)", "var(--size-space-md)", "var(--size-space-xl)",
    ]);
  });

  specimen.it("type is absolute rem; ring, depth and every radius are px", () => {
    specimen.expect(STEPS.map((step) => zone[`--size-type-${step}`])).toEqual([".6875rem", ".75rem", ".875rem", "1rem", "1.125rem", "1.25rem", "1.5rem", "1.75rem"]);
    specimen.expect([zone["--size-ring"], zone["--size-depth"]]).toEqual(["1px", "2px"]);
    for (const step of [...STEPS, "full"]) specimen.expect([step, /^\d+px$/.test(zone[`--shape-radius-${step}`])]).toEqual([step, true]);
  });

  specimen.it("an entity points at its radius step", () => {
    specimen.expect(["key", "field", "card", "pill", "disc"].map((entity) => zone[`--shape-radius-${entity}`])).toEqual([
      "var(--shape-radius-2xs)", "var(--shape-radius-2xs)", "var(--shape-radius-xs)", "var(--shape-radius-2xs)", "var(--shape-radius-2xs)",
    ]);
  });

  specimen.it("a shadow leaves resolved: shape's geometry with the zone's tone", () => {
    specimen.expect([zone["--shape-lift"], zone["--shape-sunk"]]).toEqual(["0 12px 30px rgba(0, 0, 0, 0.45)", "inset 0 2px 3px rgba(0, 0, 0, 0.45)"]);
    const parchment = Object.fromEntries(declarations(THEMES.parchment.zones[0]));
    specimen.expect(parchment["--shape-lift"]).toBe("0 8px 24px rgba(61, 55, 42, 0.16)");
  });

  specimen.it("a zone's own shadow tone reaches its own shadows only", () => {
    const held = theme(FLOOR, { zones: { 2: { surface: "#FBFAF2", shadow: "rgba(1, 2, 3, 0.5)" } } });
    specimen.expect(Object.fromEntries(declarations(held.zones[2]))["--shape-lift"]).toBe("0 12px 30px rgba(1, 2, 3, 0.5)");
    specimen.expect(Object.fromEntries(declarations(held.zones[1]))["--shape-lift"]).toBe("0 12px 30px rgba(0, 0, 0, 0.45)");
  });

  specimen.it("label, leading and relief", () => {
    specimen.expect([zone["--shape-relief"], zone["--shape-label-case"], zone["--shape-label-track"], zone["--size-leading-tight"], zone["--size-leading-loose"]])
      .toEqual(["lift", "uppercase", ".14em", "1.1", "1.45"]);
  });
});

specimen.describe("emit — a zone's override", () => {
  const css = emit("northsea", THEMES.northsea);
  const root = ':root[data-theme="northsea"]';

  specimen.it("zone 3 carries rust 100 as the negative ink while the fill stays rust 300", () => {
    const bench = named(css, `${root} [data-zone="3"]`);
    specimen.expect([value(bench, "--signal-negative-ink"), value(bench, "--signal-negative")]).toEqual(["#EBCDC0", "#BE7055"]);
    for (const index of [0, 1, 2]) {
      specimen.expect(value(named(css, `${root} [data-zone="${index}"]`), "--signal-negative-ink")).toBe("#D9A18D");
    }
  });

  specimen.it("a zone overriding size.unit re-declares every length against it", () => {
    const held = emit("dense", theme(FLOOR, { zones: { 0: { surface: "#F5F3E8", size: { unit: ".2rem" } } } }));
    const chrome = named(held, ':root[data-theme="dense"] [data-zone="0"]');
    const body = named(held, ':root[data-theme="dense"] [data-zone="1"]');
    specimen.expect([value(chrome, "--size-unit"), value(body, "--size-unit")]).toEqual([".2rem", ".25rem"]);
    specimen.expect(value(chrome, "--size-row")).toBe("calc(var(--size-unit) * 6.5)");
    specimen.expect(chrome.declarations.filter(([, stated]) => stated.includes("var(--size-unit)"))).toHaveLength(10);
  });

  specimen.it("the four surfaces differ, block by block", () => {
    const surfaces = [0, 1, 2, 3].map((index) => value(named(css, `${root} [data-zone="${index}"]`), "--surface"));
    specimen.expect(surfaces).toEqual(["#0E1A25", "#06101D", "#060D14", "#1A2A38"]);
    specimen.expect(value(named(css, root), "--surface")).toBe("#06101D");
  });
});

specimen.describe("design() — one sheet: the scales, then every theme", () => {
  const SCALES = ["spacing", "font-size", "line-height", "box-shadow", "drop-shadow", "container", "border-radius", "animation"];
  const selectors = [...ds.output.css.matchAll(/^([^\n{}]+) \{$/gm)].map((match) => match[1]);

  specimen.it("the sheet is the scales, then each theme emitted, nothing else", () => {
    specimen.expect(ds.output.css).toBe([scales(), ...Object.entries(THEMES).map(([name, held]) => emit(name, held))].join("\n"));
    specimen.expect(Object.keys(ds.themes)).toEqual(["northsea", "parchment", "porcelain", "datasette"]);
  });

  specimen.it("twenty-one blocks: one :root, then five per theme", () => {
    specimen.expect(selectors).toHaveLength(21);
    specimen.expect(selectors[0]).toBe(":root");
    specimen.expect(selectors.slice(1).every((selector) => selector.startsWith(':root[data-theme="'))).toBe(true);
  });

  specimen.it("the scales sit under a bare :root, so a page with no theme still has its sizes", () => {
    const block = named(scales(), ":root");
    specimen.expect(block.declarations).toHaveLength(56);
    const families = [...new Set(block.declarations.map(([name]) => SCALES.find((family) => name.startsWith(`--${family}-`))))];
    specimen.expect(families).toEqual(SCALES);
  });

  specimen.it("every scale the old sheet emitted is still emitted, under the same name", () => {
    const names = named(scales(), ":root").declarations.map(([name]) => name);
    for (const name of ["--font-size-2xs", "--font-size-base", "--font-size-8xl", "--line-height-2xs",
      "--border-radius-none", "--border-radius-default", "--border-radius-full", "--spacing-0", "--spacing-8", "--container-padding-lg", "--animation-spin-slow",
      "--box-shadow-sm", "--box-shadow-xl", "--drop-shadow-none"]) {
      specimen.expect([name, names.includes(name)]).toEqual([name, true]);
    }
  });

  specimen.it("a family is the theme's: six names in every theme root and zone block, none under the bare :root", () => {
    const families = ["--font-family-sans-heading", "--font-family-sans-text", "--font-family-serif-heading", "--font-family-serif-text", "--font-family-brand", "--font-family-code"];
    specimen.expect(named(scales(), ":root").declarations.filter(([name]) => name.startsWith("--font-family-"))).toEqual([]);
    for (const block of blocks(ds.output.css).slice(1)) {
      specimen.expect([block.selector, block.declarations.map(([name]) => name).filter((name) => name.startsWith("--font-family-"))]).toEqual([block.selector, families]);
    }
    const held = (name, zone) => Object.fromEntries(declarations(THEMES[name].zones[zone]));
    specimen.expect(held("northsea", 1)["--font-family-sans-text"]).toBe("Inter, sans-serif");
    specimen.expect(held("porcelain", 0)["--font-family-code"]).toBe("IBM Plex Mono, monospace");
    specimen.expect(held("datasette", 3)["--font-family-sans-heading"]).toBe("VT323, Space Mono, monospace");
  });

  specimen.it("a scale shadow is geometry with the zone's tone, never a colour of its own", () => {
    const shadows = named(scales(), ":root").declarations.filter(([name]) => /^--(box|drop)-shadow-/.test(name) && name !== "--drop-shadow-none");
    specimen.expect(shadows).toHaveLength(10);
    for (const [name, value] of shadows) specimen.expect([name, /^\d+(px)? \d+px \d+px var\(--shadow\)$/.test(value)]).toEqual([name, true]);
  });

  specimen.it("the scales hold no colour and the themes hold no scale", () => {
    specimen.expect(/#[0-9A-Fa-f]{6}|rgba?\(/.test(scales())).toBe(false);
    specimen.expect(Object.keys(TOKENS)).toEqual(["spacing", "font", "line-height", "box-shadow", "drop-shadow", "container", "border", "animation"]);
    const zoned = ds.output.css.slice(scales().length);
    specimen.expect(/--(font-size|line-height|spacing|border-radius|box-shadow|drop-shadow)-/.test(zoned)).toBe(false);
  });

  specimen.it("nothing of the retired pipeline is emitted", () => {
    for (const retired of ["--colors-", "--zone-", "--text-primary", "--text-body", "--text-support", "--shadow-soft", "--shadow-strong", "--filter-", "--mix-", ".zone-"]) {
      specimen.expect([retired, ds.output.css.includes(retired)]).toEqual([retired, false]);
    }
  });

  specimen.it("no name is declared by both the scales and a theme", () => {
    const scale = new Set(named(scales(), ":root").declarations.map(([name]) => name));
    specimen.expect(declarations(THEMES.northsea.zones[1]).map(([name]) => name).filter((name) => scale.has(name))).toEqual([]);
  });

  specimen.it("the whole sheet parses: braces balance, every line inside a block is one declaration", () => {
    specimen.expect(ds.output.css.split("{").length).toBe(ds.output.css.split("}").length);
    const inside = ds.output.css.split("\n").filter((line) => line.startsWith("  "));
    specimen.expect(inside.filter((line) => !/^  --[a-z0-9-]+: [^;]+;$/.test(line))).toEqual([]);
    specimen.expect(inside).toHaveLength(56 + 4 * 5 * 106);
  });

  specimen.it("dapper's door exports the one pipe and nothing of the old", async () => {
    const door = await import("../mod.js");
    specimen.expect(Object.keys(door).sort()).toEqual(["THEMES", "TOKENS", "contrast", "declarations", "design", "emit", "postcssPlugin", "scales", "tailwindClasses", "theme"]);
  });

  specimen.it("dapper holds no file of the retired pipeline", () => {
    const retired = ["lib/colors.js", "lib/builders.js", "lib/flatten.js", "themes/northsea.js", "themes/parchment.js", "belt/index.js", "belt/lib.js", "belt/postcss-plugin.js",
      "primitives/colors.js", "primitives/tokens.js", "primitives/builders.js"];
    const found = retired.filter((path) => { try { Deno.statSync(new URL(`../${path}`, import.meta.url)); return true; } catch { return false; } });
    specimen.expect(found).toEqual([]);
  });
});

specimen.describe("gradients — each theme owns its own", () => {
  specimen.it("northsea holds six of twelve stops", () => {
    specimen.expect(Object.keys(northseaGradients).sort()).toEqual(["amber", "aqua", "deep", "iron", "moss", "rust"]);
    for (const [name, held] of Object.entries(northseaGradients)) specimen.expect([name, Object.keys(held)]).toEqual([name, ["50", "100", "200", "300", "400", "500", "600", "700", "800", "850", "900", "950"]]);
  });

  specimen.it("parchment holds six; paper alone carries the 150 stop", () => {
    specimen.expect(Object.keys(parchmentGradients).sort()).toEqual(["aqua", "ink", "moss", "paper", "rose", "tomato"]);
    for (const [name, held] of Object.entries(parchmentGradients)) {
      specimen.expect([name, Object.keys(held).includes("150")]).toEqual([name, name === "paper"]);
    }
  });

  specimen.it("every stop is a hex", () => {
    for (const gradients of [northseaGradients, parchmentGradients]) {
      for (const [name, held] of Object.entries(gradients)) {
        for (const [stop, color] of Object.entries(held)) specimen.expect([name, stop, /^#[0-9A-F]{6}$/.test(color)]).toEqual([name, stop, true]);
      }
    }
  });

  specimen.it("a theme file imports no gradient but its own", () => {
    for (const name of Object.keys(THEMES)) {
      const source = Deno.readTextFileSync(new URL(`../themes/${name}/theme.js`, import.meta.url));
      const imports = [...source.matchAll(/from "([^"]+)"/g)].map((match) => match[1]);
      const own = (() => { try { Deno.statSync(new URL(`../themes/${name}/gradients.js`, import.meta.url)); return ["./gradients.js"]; } catch { return []; } })();
      specimen.expect([name, imports]).toEqual([name, ["../../lib/theme.js", ...own]]);
    }
  });
});
