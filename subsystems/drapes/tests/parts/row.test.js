import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Row — dom.js:135: .krow · .key · .nm · .val", () => {
  specimen.it("the design's tree; a click picks", () => {
    const picked = [];
    const rig = screen(() => parts.Row({ key: "r", name: "rounds", value: "10", selected: true, onPick: () => picked.push("r") }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<button class="krow  sel" data-fn="entry"><span class="key">r</span><span class="nm">rounds</span><span class="val">10</span></button>`));
    fire(rig.target.querySelector(".krow"), "click");
    specimen.expect(picked).toEqual(["r"]);
    rig.close();
  });

  specimen.it("off is a class; children take the value cell", () => {
    const rig = screen(() =>
      parts.Row({
        key: "x",
        name: "close frame",
        off: true,
        get children() {
          return parts.Choice({ options: ["low", "high"], value: "low" });
        },
      }),
    );
    specimen.expect(rig.target.querySelector(".krow").className).toBe("krow off");
    specimen.expect(rig.target.querySelector(".krow .val .cc")).not.toBe(null);
    rig.close();
  });
});
