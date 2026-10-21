import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Panel — the held node of the keymap, painted", () => {
  specimen.it("a ring above, the tag and the crumbs left, the hint right, the rows below", async () => {
    const { Panel, Row } = await parts;
    const held = palette();
    const text = await frame(() => Panel({ palette: held, tag: "harness", crumbs: "ctrl-v h", hint: "esc drops", get children() { return Row({ palette: held, key: "t", label: "tune", value: "capable" }); } }), { width: 40, height: 3 });
    const lines = text.split("\n");
    specimen.expect(lines[0]).toMatch(/^─{40}$/);
    specimen.expect(lines[1]).toMatch(/^ harness  ctrl-v h\s+esc drops $/);
    specimen.expect(lines[2]).toMatch(/^  t    tune             capable/);
  });
});
