import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("the content renderers — Markdown · JsonTree · Line", () => {
  specimen.it("Markdown: a heading loses its hashes, an item its bullet, a quote wears a bar, a fence is kept verbatim", async () => {
    const { Markdown } = await parts;
    const lines = (await frame(() => Markdown({ palette: palette(), text: "# centre\n- e4\n> why\n```\ncode\n```" }), { width: 20, height: 4 })).split("\n");
    specimen.expect(lines.map((line) => line.trimEnd())).toEqual(["centre", "• e4", "│ why", "code"]);
  });

  specimen.it("JsonTree: a summary per branch, one row per leaf, indented by depth", async () => {
    const { JsonTree } = await parts;
    const lines = (await frame(() => JsonTree({ palette: palette(), data: { slug: "hello", port: 2501, live: true, none: null, tags: ["a"] } }), { width: 20, height: 7 })).split("\n");
    specimen.expect(lines.map((line) => line.trimEnd())).toEqual(["{5}", '  slug: "hello"', "  port: 2501", "  live: true", "  none: null", "  tags: [1]", '    0: "a"']);
  });

  specimen.it("Line: one row per line, in the ink named", async () => {
    const { Line } = await parts;
    specimen.expect((await frame(() => Line({ palette: palette(), text: "one\ntwo", ink: "textStrong" }), { width: 10, height: 2 })).split("\n").map((line) => line.trimEnd())).toEqual(["one", "two"]);
  });
});
