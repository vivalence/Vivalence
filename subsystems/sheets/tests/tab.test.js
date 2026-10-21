import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Tab — one terminal, the thread's label", () => {
  specimen.it("the current tab is cut into the strip; a live one carries the dot; a shared one ∥", async () => {
    const { Tab } = await parts;
    specimen.expect(await frame(() => Tab({ palette: palette(), index: 1, label: "e4 openings", current: true }), { width: 20, height: 1 })).toMatch(/^│ 1 e4 openings │/);
    specimen.expect(await frame(() => Tab({ palette: palette(), index: 2, label: "notes", signal: "caution", shared: true }), { width: 20, height: 1 })).toMatch(/^ 2 notes ∥ ●/);
  });

  specimen.it("a live signal outside primary · caution · negative throws", async () => {
    const { live } = await parts;
    specimen.expect(() => live("off")).toThrow(/not a live signal: "off" · primary · caution · negative/);
  });
});
