import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Meter — a fraction over a track; caution at 85 %", () => {
  specimen.it("fills the fraction of its width, the rest is track", async () => {
    const { Meter } = await parts;
    specimen.expect(await frame(() => Meter({ palette: palette(), value: 0.4, width: 20 }), { width: 22, height: 1 })).toMatch(/^████████░{12}/);
    specimen.expect(await frame(() => Meter({ palette: palette(), value: 0.34 }), { width: 8, height: 1 })).toMatch(/^██░░░░/);
  });

  specimen.it("clamps below 0 and above 1", async () => {
    const { filled } = await parts;
    specimen.expect(filled(-1, 6)).toBe(0);
    specimen.expect(filled(2, 6)).toBe(6);
  });
});
