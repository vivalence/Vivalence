import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Mark — dom.js:164: .mark › .viket (+ .fault)", () => {
  specimen.it("resolves the pictogram from the dapper asset export", () => {
    specimen.expect(parts.VIKET.endsWith("/subsystems/dapper/assets/viket/pic-vinca-viket_white.svg")).toBe(true);
  });

  specimen.it("the design's tree: aria-label · title · the viket sized inline; tap · double · hold", async () => {
    const sent = [];
    const rig = screen(() => parts.Mark({ size: 24, delay: 420, onPick: () => sent.push("tap"), onDouble: () => sent.push("double"), onHold: () => sent.push("hold") }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<button class="mark " data-fn="mark" aria-label="vivalence" title="once: keys · twice: repl · hold: sidebar"><span class="viket" style="width:24px;height:24px" aria-hidden="true"></span></button>`));
    const button = rig.target.querySelector("button.mark");
    specimen.expect([button.getAttribute("aria-label"), button.getAttribute("title")]).toEqual(["vivalence", "once: keys · twice: repl · hold: sidebar"]);
    specimen.expect(button.querySelector(".viket").getAttribute("style")).toBe("width:24px;height:24px");
    fire(button, "click");
    fire(button, "dblclick");
    fire(button, "pointerdown");
    await new Promise((resolve) => setTimeout(resolve, 450));
    specimen.expect(sent).toEqual(["tap", "double", "hold"]);
    rig.close();
  });

  specimen.it("open · live · fault are the design's classes", () => {
    const rig = screen(() => parts.Mark({ fault: true, live: true, open: true }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<button class="mark open"><span class="viket live"></span><span class="fault"></span></button>`));
    rig.close();
  });
});
