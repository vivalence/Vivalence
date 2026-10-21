import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Row — key · name · value on a grid", () => {
  specimen.it("lays the key at 5, the name at 17, then the value", async () => {
    const { Row } = await parts;
    specimen.expect(await frame(() => Row({ palette: palette(), key: "t", label: "thread", value: "e4 openings" }), { width: 40, height: 1 })).toMatch(/^  t    thread           e4 openings/);
  });

  specimen.it("children take the value's place", async () => {
    const { Row, Choice } = await parts;
    const held = palette();
    specimen.expect(await frame(() => Row({ palette: held, key: "e", label: "effort", value: "unseen", get children() { return Choice({ palette: held, options: ["low", "high"], value: "low" }); } }), { width: 40, height: 1 })).toMatch(/^  e    effort            low   high/);
  });

  specimen.it("a pick calls onPick", async () => {
    const { Row } = await parts;
    const picked = [];
    await frame(() => Row({ palette: palette(), key: "t", label: "thread", onPick: () => picked.push("t") }), { width: 40, height: 1 });
    specimen.expect(picked).toEqual([]);
  });
});
