import { atom } from "nanostores";
import { specimen } from "@vivalence/typology";
import { paint, settle, surface } from "./world.js";
import { oracle, shape } from "../../../subsystems/drapes/tests/parts/oracle.js";

const DESIGN = `<div class="yield" style="padding:8px 12px 10px"><span style="padding-left:0px"><span class="k">turn</span> <span class="s">"w"</span></span><span style="padding-left:0px"><span class="k">ply</span> <span class="n">3</span></span></div>`;

specimen.describe("painters — a JSON buffer paints the design's yield rows", () => {
  specimen.it("JsonTree wraps the buffer's data in .yield, the design's cellBody for a json cell", async () => {
    const $data = atom({ turn: "w", ply: 3 });
    const rig = paint(() => surface.JsonTree({ buffer: { $data } }));
    await settle();
    specimen.expect(shape(rig.target)).toBe(oracle(DESIGN));
    $data.set({ turn: "b" });
    await settle();
    specimen.expect(rig.target.querySelectorAll(".yield > span").length).toBe(1);
    rig.close();
  });
});
