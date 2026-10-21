import { specimen } from "@vivalence/typology";
import { parts, screen } from "../scenarios/index.js";

specimen.describe("Dot — `<span class=\"dot ${tone}\">` (dom.js:58)", () => {
  specimen.it("the tone and its motion are classes, verbatim the design's: pri live · cau breathe · neg · pos · mut", () => {
    const tones = [
      [{ tone: "pri", live: true }, "dot pri live"],
      [{ tone: "cau", breathe: true }, "dot cau breathe"],
      [{ tone: "neg" }, "dot neg"],
      [{ tone: "pos" }, "dot pos"],
      [{ tone: "mut" }, "dot mut"],
      [{}, "dot"],
    ];
    for (const [props, expected] of tones) {
      const rig = screen(() => parts.Dot(props));
      specimen.expect(rig.target.innerHTML).toBe(`<span class="${expected}"></span>`);
      rig.close();
      specimen.expect(rig.target.childNodes.length).toBe(0);
    }
  });

  specimen.it("dim is the design's idle dot (dom.js:168): style opacity .35", () => {
    const rig = screen(() => parts.Dot({ dim: true }));
    specimen.expect(rig.target.firstChild.getAttribute("style")).toBe("opacity:.35");
    rig.close();
  });

  specimen.it("knows the design's tones", () => {
    specimen.expect(parts.DOT_TONES).toEqual(["", "pos", "pri", "cau", "neg", "mut"]);
  });
});
