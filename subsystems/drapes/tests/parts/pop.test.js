import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";
import { DSET } from "./dset.js";

specimen.describe("Pop — dom.js:108 pop(w): .scrim + .pop[role=dialog] over dset (dom.js:92)", () => {
  specimen.it("the design's tree; placed above the pointer in the lower half, below it in the upper", () => {
    const acted = [];
    const closed = [];
    const rig = screen(() => parts.Pop({ dset: DSET, at: { x: 900, y: 780 }, viewport: { width: 1280, height: 800 }, onClose: () => closed.push(true), onAct: (entry) => acted.push(entry.signal) }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="scrim" data-fn="popclose"></div><div class="pop" data-zone="0" role="dialog" aria-label="display"><div class="dset"><div class="views"><button class="cur"><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button></div><div class="aligns"><button class="">←</button><button class="cur">→</button><button class="">↑</button><button class="">↓</button></div><div class="shrow"><button aria-label="less">−</button><span class="track slider"><span class="fill"></span><span class="sv">42 %</span></span><button aria-label="more">+</button></div></div></div>`));
    specimen.expect(rig.target.querySelector(".pop").getAttribute("style")).toBe("left:760px;top:612px");
    specimen.expect([...rig.target.querySelectorAll(".views button")].map((button) => [button.getAttribute("aria-label"), button.getAttribute("title")])).toEqual([["docked", "/dock docked"], ["full", "/dock full"], ["closed", "/dock closed"], ["messenger", "/dock messenger"]]);
    specimen.expect(rig.target.querySelector(".slider").getAttribute("aria-valuenow")).toBe("42");
    fire(rig.target.querySelector(".aligns button"), "click");
    fire(rig.target.querySelector(".shrow button"), "click");
    fire(rig.target.querySelector(".scrim"), "click");
    specimen.expect(acted).toEqual(["/dock left", "/split 0.37"]);
    specimen.expect(closed).toEqual([true]);
    rig.close();
    const high = screen(() => parts.Pop({ dset: DSET, at: { x: 40, y: 100 }, viewport: { width: 1280, height: 800 }, onClose: () => {}, onAct: () => {} }));
    specimen.expect(high.target.querySelector(".pop").getAttribute("style")).toBe("left:8px;top:114px");
    high.close();
  });

  specimen.it("the glyph per view is the design's dispGlyph (dom.js:45)", () => {
    const rects = (view, align, framed) => {
      const rig = screen(() => parts.Glyph({ view, align, framed }));
      const held = [...rig.target.querySelectorAll("rect")].map((rect) => ["x", "y", "width", "height"].map((name) => rect.getAttribute(name)).join(","));
      rig.close();
      return held;
    };
    specimen.expect(rects("docked", "left", true)).toEqual(["1.5,2.5,25,11", "1.5,2.5,12.5,11"]);
    specimen.expect(rects("docked", "right", false)).toEqual(["1.5,2.5,25,11", "1.5,2.5,25,11"]);
    specimen.expect(rects("closed", "right", true)).toEqual(["1.5,2.5,25,11"]);
    specimen.expect(rects("messenger", "left", true)).toEqual(["1.5,2.5,25,11", "4,6.5,9,4.5"]);
  });
});
