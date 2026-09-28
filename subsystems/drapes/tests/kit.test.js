import { specimen } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { declarations, THEMES } from "@vivalence/dapper";
import { fit } from "../display/strip.js";
import { place } from "../panels/float.js";

const KIT = {
  controls: ["Key", "Input", "Field", "Segmented", "Stepper"],
  display: ["Row", "Reading", "Well", "ToolRow", "Pressed", "Strip", "Meter", "Spinner", "Status", "Section", "Pip", "Chip", "Tag", "Empty"],
  panels: ["Card", "Float"],
};
const PARTS = Object.entries(KIT).flatMap(([folder, names]) => names.map((name) => `${folder}/${name}`));

const source = (part) => Deno.readTextFileSync(new URL(`../${part}.svelte`, import.meta.url));
const barrel = (folder) => Deno.readTextFileSync(new URL(`../${folder}/index.js`, import.meta.url));
const exported = (text, name) => new RegExp(`export \\{[^}]*\\b${name}\\b`).test(text);
const slots = new Set(declarations(THEMES.northsea.zones[1]).map(([name]) => name));
const locals = (text) => new Set([...text.matchAll(/(?:^|[\s;{"':])(--[a-z0-9-]+)\s*[:=]/g)].map((match) => match[1]));
const reads = (text) => [...new Set([...text.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((match) => match[1]))];
const six = (width) => Array.from({ length: 6 }, () => width);

specimen.describe("the kit — every part compiles, and the barrels hold it", () => {
  for (const part of PARTS) {
    specimen.it(`${part}.svelte compiles as a runes component without warnings`, () => {
      const out = compile(source(part), { generate: "client", runes: true, filename: `${part}.svelte` });
      specimen.expect(out.js.code.length > 0).toBe(true);
      specimen.expect(out.warnings.map((warning) => `${warning.code}: ${warning.message}`)).toEqual([]);
    });
  }

  specimen.it("the barrels export each part", () => {
    for (const [folder, names] of Object.entries(KIT)) {
      const text = barrel(folder);
      for (const name of names) specimen.expect([folder, name, exported(text, name)]).toEqual([folder, name, true]);
    }
  });
});

specimen.describe("the kit — it reads the sheet by name and paints nothing of its own", () => {
  for (const part of PARTS) {
    specimen.it(`${part}.svelte reads declared slots alone: no hex, no color-mix, no 50% radius`, () => {
      const text = source(part);
      const own = locals(text);
      specimen.expect(reads(text).filter((name) => !slots.has(name) && !own.has(name))).toEqual([]);
      specimen.expect([/#[0-9a-fA-F]{6}\b/.test(text), /color-mix/.test(text), /border-radius: 50%/.test(text)]).toEqual([false, false, false]);
    });
  }

  specimen.it("the key holds its recipe: contrast at rest; pressed, sunk and down by the depth when latched", () => {
    const text = source("controls/Key");
    for (const read of ["--control-contrast)", "--control-contrast-hover)", "--control-contrast-pressed)", "--control-on-pressed)", "--size-depth)", "--shape-sunk)", "--size-ring)", "--signal-primary)"]) {
      specimen.expect([read, text.includes(`var(${read}`)]).toEqual([read, true]);
    }
    specimen.expect([/signal-[a-z]+-ink/.test(text.replace(/\.key\.ghost[^}]*\}/g, ""))]).toEqual([false]);
    specimen.expect(/@media \(pointer: coarse\) \{\s*\.key \{\s*min-height: 44px;/.test(text)).toBe(true);
  });

  specimen.it("a bone key is 31px across its bone: that tall on a lying bone, that wide on a standing one, its face stacked there", () => {
    const text = source("controls/Key");
    specimen.expect(/\.key\.bone \{[^}]*height: 31px;[^}]*padding: 0 8px;/.test(text)).toBe(true);
    specimen.expect(/\.key\.bone\.stack \{[^}]*width: 31px;[^}]*height: auto;[^}]*padding: 7px 0;/.test(text)).toBe(true);
    specimen.expect(/\.key\.bone\.stack \.face \{\s*flex-direction: column;/.test(text)).toBe(true);
    specimen.expect(/class:stack\b/.test(text)).toBe(true);
  });

  specimen.it("a field is never disabled and never readonly", () => {
    const text = source("controls/Input");
    specimen.expect([/\bdisabled\b/.test(text), /\breadonly\b/.test(text)]).toEqual([false, false]);
  });
});

specimen.describe("fit() — a strip fits itself in six steps", () => {
  const full = [80, 96, 70, 64, 72, 88];

  specimen.it("whole labels while they fit", () => {
    specimen.expect(fit({ width: 700, full, short: six(44), fold: 70 })).toEqual({ mode: "row", labels: "full", zoom: 1 });
  });

  specimen.it("then three letters, then the row zoomed down to .8", () => {
    specimen.expect(fit({ width: 340, full, short: six(44), fold: 70 })).toEqual({ mode: "row", labels: "short", zoom: 1 });
    specimen.expect(fit({ width: 300, full, short: six(43), fold: 70 })).toEqual({ mode: "row", labels: "short", zoom: 0.9 });
  });

  specimen.it("then a rail in the stack fold, pages where three keys fit, one key where nothing does", () => {
    specimen.expect(fit({ width: 220, full: six(90), short: six(44), fold: 70, stacked: true })).toEqual({ mode: "rail", labels: "short", zoom: 1 });
    specimen.expect(fit({ width: 312, full: six(90), short: six(54), fold: 70, active: 4 })).toEqual({ mode: "pages", labels: "short", zoom: 1, pages: [[0, 3], [3, 6]], page: 1 });
    specimen.expect(fit({ width: 220, full: six(90), short: six(44), fold: 70 })).toEqual({ mode: "merged", labels: "full", zoom: 1 });
  });

  specimen.it("four keys never page; an empty strip is a row", () => {
    specimen.expect(fit({ width: 150, full: [70, 60, 50, 60], short: [44, 44, 44, 44], fold: 60 }).mode).toBe("merged");
    specimen.expect(fit({ width: 200, full: [], short: [], fold: 0 })).toEqual({ mode: "row", labels: "full", zoom: 1 });
  });
});

specimen.describe("place() — a float sits 8px off its key and 6px inside the viewport", () => {
  const anchor = { left: 700, top: 20, right: 740, bottom: 48 };
  const size = { width: 330, height: 200 };
  const viewport = { width: 800, height: 600 };

  specimen.it("below, clamped at the right edge", () => {
    specimen.expect(place(anchor, size, viewport)).toEqual({ left: 464, top: 56 });
  });

  specimen.it("after a key on a column bone, turning to its other side at the edge", () => {
    specimen.expect(place({ left: 0, top: 300, right: 45, bottom: 331 }, size, viewport, "after")).toEqual({ left: 53, top: 300 });
    specimen.expect(place(anchor, size, viewport, "after")).toEqual({ left: 362, top: 20 });
  });

  specimen.it("above, clamped at the top", () => {
    specimen.expect(place({ left: 10, top: 100, right: 60, bottom: 126 }, size, viewport, "above")).toEqual({ left: 10, top: 6 });
  });
});
