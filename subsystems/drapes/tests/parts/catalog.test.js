import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Catalog — dom.js:142: .pb of .prow (nat · args · val · chord), else the nothing-matches .krow", () => {
  specimen.it("the design's tree; the first row is selected; a click fills", () => {
    const filled = [];
    const rows = [{ nature: "/mode", parts: [{ t: "/", h: false }, ...parts.lit("mo", "mode")], args: "‹slug›", val: "seat a mode", chord: "ctrl-v m", cur: true }];
    const rig = screen(() => parts.Catalog({ rows, onFill: (row) => filled.push(row.nature) }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="pb"><button class="prow sel" data-fn="fill" data-arg="/mode "><span class="nat">/<span class="hl">mo</span>de <span class="pri">•</span></span><span class="args">‹slug›</span><span class="val">seat a mode</span><span class="chord">ctrl-v m</span></button></div>`));
    fire(rig.target.querySelector(".prow"), "click");
    specimen.expect(filled).toEqual(["/mode"]);
    rig.close();
  });

  specimen.it("nothing matching says so", () => {
    const rig = screen(() => parts.Catalog({ rows: [] }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="pb"><div class="krow"><span class="key">✕</span><span class="nm">nothing matches</span><span class="val">enter sends it anyway — the repl answers not found</span></div></div>`));
    rig.close();
  });

  specimen.it("lit splits the match out as the highlighted part", () => {
    specimen.expect(parts.lit("ode", "mode")).toEqual([{ t: "m", h: false }, { t: "ode", h: true }]);
    specimen.expect(parts.lit("", "mode")).toEqual([{ t: "mode", h: false }]);
    specimen.expect(parts.lit("zz", "mode")).toEqual([{ t: "mode", h: false }]);
  });
});
