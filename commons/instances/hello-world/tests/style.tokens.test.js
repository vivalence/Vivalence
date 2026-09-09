import { specimen } from "@vivalence/typology";
import { design } from "@vivalence/dapper";
import { RENDER } from "../page/style.js";

// the cheapest test in the quest and one of the most valuable: a token the house style teaches
// that dapper does not emit renders the drawn page unstyled, and nothing else would catch it —
// the component compiles, mounts and looks broken.
const ds = await design();
// per theme, not over the whole sheet: a token only nordic defines would leave a drawn page
// unstyled the moment the operator switches to paper, and vice versa.
const blocks = Object.fromEntries(
  Object.keys(ds.themes).map((name) => [
    name,
    ds.output.css.slice(ds.output.css.indexOf(`:root[data-theme="${name}"] {`))
      .split("}\n")[0],
  ]),
);

// the TOKENS block writes the scale as one shorthand line; expand it rather than leaving the
// nine suffixes untested.
const SCALE = ["2xs", "xs", "sm", "md", "base", "lg", "xl", "2xl", "3xl", "4xl"]
  .map((step) => `--font-size-${step}`);

const taught = [
  ...new Set([...RENDER.matchAll(/--[a-z0-9-]+/g)].map(([token]) => token)),
  ...SCALE,
].sort();

specimen.describe(
  "P-tokens: every token the house style teaches, dapper emits",
  () => {
    specimen.it("the style teaches a non-trivial vocabulary", () => {
      specimen.expect(taught.length > 20).toBe(true);
    });

    specimen.it(
      "dapper defines every one of them, in EVERY theme it ships",
      () => {
        specimen.expect(Object.keys(blocks).sort()).toEqual([
          "nordic",
          "paper",
        ]);
        for (const [name, block] of Object.entries(blocks)) {
          const missing = taught.filter((token) =>
            !block.includes(`${token}:`)
          );
          specimen.expect([name, missing]).toEqual([name, []]);
        }
      },
    );

    specimen.it(
      "no literal colour anywhere in the style — a hex would defeat the theme",
      () => {
        specimen.expect(RENDER.match(/#[0-9a-fA-F]{3,8}\b/g)).toBe(null);
        specimen.expect(RENDER.match(/\brgba?\(/g)).toBe(null);
      },
    );

    specimen.it(
      "the house dialect defines every class its patterns use — no utility classes",
      () => {
        const used = new Set(
          [...RENDER.matchAll(/class="([a-z0-9 -]+)"/g)]
            .flatMap(([, names]) => names.trim().split(/\s+/)),
        );
        const defined = new Set(
          [...RENDER.matchAll(/^\s*\.([a-z0-9-]+)[\s:,{]/gm)].map(([, name]) =>
            name
          ),
        );
        const orphans = [...used].filter((name) => !defined.has(name));
        specimen.expect(orphans).toEqual([]);
      },
    );

    specimen.it("teaches the frame the emitter's input schema demands", () => {
      specimen.expect(RENDER).toContain("let { buffer, terminal } = $props();");
      specimen.expect(RENDER).toContain('<article class="page">');
      specimen.expect(RENDER).toContain("Never a URL.");
    });
  },
);
