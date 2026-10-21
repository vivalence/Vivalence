import postcss from "postcss";
import { specimen } from "@vivalence/typology";
import plugin, { plugin as named } from "../lifecycle/index.js";
import { design } from "../lib/system.js";
import { THEMES } from "../themes/index.js";

const blocks = (css) =>
  [...css.matchAll(/^([^\n{}]+) \{\n([^}]*)\}/gm)].map(([, selector, body]) => ({
    selector,
    names: body.trim().split("\n").map((line) => line.trim().split(":")[0]),
  }));

specimen.describe("lifecycle — the postcss plugin weaves the design system's sheet ahead of the author's css", () => {
  specimen.it("the plugin is one postcss plugin, default and named, flagged postcss", () => {
    specimen.expect(named).toBe(plugin);
    specimen.expect(plugin.postcss).toBe(true);
    specimen.expect(plugin().postcssPlugin).toBe("vivalence-design-system-weaving");
  });

  specimen.it("processed into a temp output, the sheet opens with the design's css; every theme's five blocks hold 106 declarations; the author's rule stays last", async () => {
    const directory = await Deno.makeTempDir({ prefix: "dapper-lifecycle-" });
    const from = `${directory}/app.css`;
    const to = `${directory}/out/app.css`;
    const authored = ".app { color: var(--text-ink); }\n";
    await Deno.writeTextFile(from, authored);
    const result = await postcss([plugin()]).process(await Deno.readTextFile(from), { from, to });
    await Deno.mkdir(`${directory}/out`);
    await Deno.writeTextFile(to, result.css);
    const sheet = await Deno.readTextFile(to);
    const { output } = await design();
    specimen.expect(sheet.startsWith(output.css)).toBe(true);
    specimen.expect(sheet.trimEnd().endsWith(authored.trimEnd())).toBe(true);
    const themed = blocks(sheet).filter((block) => block.selector.startsWith(":root[data-theme="));
    specimen.expect(themed.length).toBe(Object.keys(THEMES).length * 5);
    for (const block of themed) specimen.expect([block.selector, block.names.length, new Set(block.names).size]).toEqual([block.selector, 106, 106]);
    specimen.expect(await Deno.readTextFile(from)).toBe(authored);
    await Deno.remove(directory, { recursive: true });
  });
});
