import { KeySignal, Vector, shape, specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Legend — where in the keymap we are", () => {
  specimen.it("the held keys, then one segment per branch of the held node, its valence as the label", async () => {
    const { Legend } = await parts;
    const keymap = new Vector().open({ nature: "/h", valence: "harness" }, () => {}).open({ nature: "/e", valence: "entity" }, () => {});
    const legend = { presses: { backlog: [new KeySignal("leader")] }, chord: shape.strip(keymap) };
    const lines = (await frame(() => Legend({ palette: palette(), legend }), { width: 40, height: 2 })).split("\n");
    specimen.expect(lines[0]).toMatch(/^leader/);
    specimen.expect(lines[1]).toMatch(/^ h harness   e entity /);
  });
});
