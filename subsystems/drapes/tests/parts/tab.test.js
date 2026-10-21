import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Tab — dom.js:58: .tab · .n · label · .mirror · .dot", () => {
  specimen.it("the design's tree; sends the index on a click", () => {
    const picked = [];
    const rig = screen(() => parts.Tab({ index: 2, label: "q3 filings", signal: "/terminal 2", title: "q3 filings · office/sheets · /terminal 2", onPick: (index) => picked.push(index) }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<button class="tab " data-signal="/terminal 2" title="q3 filings · office/sheets · /terminal 2"><span class="n">2</span><span>q3 filings</span></button>`));
    specimen.expect(rig.target.querySelector(".tab").getAttribute("data-signal")).toBe("/terminal 2");
    fire(rig.target.querySelector(".tab"), "click");
    specimen.expect(picked).toEqual([2]);
    rig.close();
  });

  specimen.it("current · mirrored · a dot tag: .tab.cur · .mirror ∥ · .dot.pri.live", () => {
    const rig = screen(() => parts.Tab({ index: 1, label: "e4 openings", current: true, mirrored: true, dot: "primary" }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<button class="tab cur"><span class="n">1</span><span>e4 openings</span><span class="mirror">∥</span><span class="dot pri live"></span></button>`));
    rig.close();
  });

  specimen.it("the dot table is the design's", () => {
    specimen.expect(parts.TAB_DOTS).toEqual({ none: "", primary: "pri live", caution: "cau breathe", negative: "neg" });
  });
});
