import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

const SECTION = { id: "box", title: "box", key: "x", head: true, rows: [{ type: "value", label: "mic", value: "off", dot: "" }] };

specimen.describe("Wid — dom.js:83 wid(w): .scrim + .wid[role=dialog] at the segment, the section inside", () => {
  specimen.it("the design's tree and geometry: width min(320, W−16), left clamped, max-height ≥ 180", () => {
    const closed = [];
    const rig = screen(() => parts.Wid({ section: SECTION, at: { id: "box", x: 1200, bottom: 44, room: 120 }, viewport: { width: 1280, height: 800 }, onClose: () => closed.push(true), onAct: () => {}, onFilter: () => {} }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="scrim" data-fn="widclose"></div><div class="wid" data-zone="0" role="dialog" aria-label="box"><div class="subj " data-sec="box"><div class="subjh" title="ctrl-v x"><span class="t">box</span></div><div class="subjb"><div class="srow value"><span class="lab">mic</span><span class="v">off</span></div></div></div></div>`));
    const wid = rig.target.querySelector(".wid");
    specimen.expect(wid.getAttribute("style")).toBe("left:952px;bottom:44px;width:320px;max-height:180px");
    specimen.expect([wid.getAttribute("data-zone"), wid.getAttribute("role"), wid.getAttribute("aria-label")]).toEqual(["0", "dialog", "box"]);
    fire(rig.target.querySelector(".scrim"), "click");
    specimen.expect(closed).toEqual([true]);
    rig.close();
  });

  specimen.it("a phone-narrow viewport shrinks the width to W−16", () => {
    const rig = screen(() => parts.Wid({ section: SECTION, at: { id: "box", x: 4, bottom: 60, room: 400 }, viewport: { width: 300, height: 600 }, onClose: () => {}, onAct: () => {}, onFilter: () => {} }));
    specimen.expect(rig.target.querySelector(".wid").getAttribute("style")).toBe("left:8px;bottom:60px;width:284px;max-height:400px");
    rig.close();
  });
});
