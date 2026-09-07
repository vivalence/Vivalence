import { specimen } from "@vivalence/typology";
import { compile } from "svelte/compiler";

const PARTS = ["controls/Key", "display/Tile", "display/Plate", "display/Entry", "display/Empty", "display/Pip"];
const source = (part) => Deno.readTextFile(new URL(`../${part}.svelte`, import.meta.url));
const barrel = (folder) => Deno.readTextFile(new URL(`../${folder}/index.js`, import.meta.url));
const exported = (text, name) => new RegExp(`export \\{[^}]*\\b${name}\\b`).test(text);

specimen.describe("parts — the office parts compile as runes components", () => {
  for (const part of PARTS) {
    specimen.it(`${part}.svelte compiles without warnings`, async () => {
      const out = compile(await source(part), { generate: "client", runes: true, filename: `${part}.svelte` });
      specimen.expect(out.js.code.length > 0).toBe(true);
      specimen.expect(out.warnings.map((warning) => `${warning.code}: ${warning.message}`)).toEqual([]);
    });
  }

  specimen.it("the barrels export them", async () => {
    specimen.expect(exported(await barrel("controls"), "Key")).toBe(true);
    const display = await barrel("display");
    for (const name of ["Tile", "Plate", "Entry", "Empty", "Pip"]) specimen.expect(exported(display, name)).toBe(true);
  });
});
