import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Segment — one subject's state in the bar", () => {
  specimen.it("paints its label and its children on one row", async () => {
    const { Segment } = await parts;
    const held = palette();
    specimen.expect(await frame(() => Segment({ palette: held, label: "[e4 ‹board›]", get children() { return Segment({ palette: held, label: " {capable}" }); } }), { width: 30, height: 1 })).toMatch(/^\[e4 ‹board›\] \{capable\}/);
  });

  specimen.it("the look is one table: off · open · caution · negative · plain", async () => {
    const { look } = await parts;
    const held = palette();
    specimen.expect(look({ off: true, open: true }, held)).toEqual({ fg: held.textMuted, bg: held.surface });
    specimen.expect(look({ off: false, open: true, attention: "caution" }, held)).toEqual({ fg: held.textStrong, bg: held.controlSelected });
    specimen.expect(look({ off: false, open: false, attention: "caution" }, held)).toEqual({ fg: held.signalCautionInk, bg: held.signalCautionTint });
    specimen.expect(look({ off: false, open: false, attention: "negative" }, held)).toEqual({ fg: held.signalNegativeInk, bg: held.signalNegativeTint });
    specimen.expect(look({ off: false, open: false, attention: null }, held)).toEqual({ fg: held.textStrong, bg: held.surface });
  });
});
