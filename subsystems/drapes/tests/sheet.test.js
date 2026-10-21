import { specimen } from "@vivalence/typology";
import { emit, THEMES } from "@vivalence/dapper";

const SHEET = Deno.readTextFileSync(new URL("../parts.css", import.meta.url));

const read = (css) => new Set([...css.matchAll(/var\((--[a-zA-Z0-9-]+)/g)].map(([, name]) => name));
const declared = (css) => new Set([...css.matchAll(/(?:^|[{;\s])(--[a-zA-Z0-9-]+)\s*:/g)].map(([, name]) => name));

const zones = (name) =>
  [...emit(name, THEMES[name]).matchAll(/^([^\n{}]+) \{\n([^}]*)\}/gm)].map(([, selector, body]) => ({ selector, emitted: declared(body) }));

const INLINE = {
  "--sb-w": "the sidebar's drag width, inline on .sidebar (dom.js:382), falls back to 272px",
  "--sq": "the board's square, inline on .board .grid (dom.js:147)",
  "--share": "the dock's share, inline on .dropzone while dragging (app.js:306), falls back to 42%",
  "--tty-bg": "ghost's face, set from zone 1's surface (tty.js:20)",
  "--tty-fg": "ghost's face, set from zone 1's text-ink (tty.js:21)",
  "--tty-caret": "ghost's face, set from zone 1's control-field-caret (tty.js:22)",
};

const HEXES = [];

specimen.describe("drapes sheet — every var the sheet reads, dapper emits", () => {
  const reads = read(SHEET);
  const sets = declared(SHEET);

  for (const name of Object.keys(THEMES)) {
    specimen.it(`${name}: every zone block emits every var the sheet reads, bar the sheet's own and the inline six`, () => {
      const blocks = zones(name);
      specimen.expect(blocks.map((block) => block.selector)).toEqual([
        `:root[data-theme="${name}"]`,
        ...["0", "1", "2", "3"].map((zone) => `:root[data-theme="${name}"] [data-zone="${zone}"]`),
      ]);
      for (const block of blocks) {
        const unresolved = [...reads].filter((variable) => !block.emitted.has(variable) && !sets.has(variable) && !Object.hasOwn(INLINE, variable));
        specimen.expect({ selector: block.selector, unresolved }).toEqual({ selector: block.selector, unresolved: [] });
      }
    });
  }

  specimen.it("the sheet sets exactly its layout four, each over a dapper var or a literal", () => {
    specimen.expect([...sets].sort()).toEqual(["--bar-h", "--cell", "--row-h", "--tab-h"]);
    specimen.expect(SHEET).toContain("--row-h: var(--size-row)");
  });

  specimen.it("the inline six are read by the sheet and emitted by no theme", () => {
    const emitted = new Set(Object.keys(THEMES).flatMap((name) => zones(name).flatMap((block) => [...block.emitted])));
    for (const variable of Object.keys(INLINE)) {
      specimen.expect(reads.has(variable)).toBe(true);
      specimen.expect(emitted.has(variable)).toBe(false);
    }
  });

  specimen.it("0 hex — the design's two body fallbacks dropped, dapper emits both vars", () => {
    const hexes = [...SHEET.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(([hex]) => hex);
    specimen.expect(hexes).toEqual(HEXES);
    specimen.expect(SHEET).toContain("body { margin: 0; background: var(--surface); color: var(--text-ink);");
  });

  specimen.it("no comment rides the sheet", () => {
    specimen.expect(SHEET.includes("/*")).toBe(false);
  });
});
