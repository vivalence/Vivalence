import { specimen } from "@vivalence/typology";
import { parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Panel — dom.js:217 + :129: Dom.panel's return, patched into section.panel: .ph tag · crumb · hint over the body", () => {
  specimen.it("the design's tree", () => {
    const rig = screen(() => parts.Panel({ tag: "harness", crumb: "ctrl-v h", hint: "what is it given", children: "rows" }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="ph"><span class="tag">harness</span><span class="crumb">ctrl-v h</span><span class="hint">what is it given</span></div>rows`));
    rig.close();
  });
});
