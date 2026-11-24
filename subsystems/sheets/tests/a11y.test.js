import { specimen } from "@vivalence/typology";
import { contrast } from "@vivalence/dapper/contrast";
import { THEMES, ZONES, design, frame, palette } from "./scenarios/index.js";

export const PAIRS = [
  ["textInk", "plane", 4.5],
  ["textStrong", "plane", 4.5],
  ["textMuted", "plane", 3],
  ["textLight", "plane", 3],
  ["textLink", "plane", 4.5],
  ["signalPrimaryInk", "plane", 4.5],
  ["signalPositiveInk", "plane", 4.5],
  ["signalCautionInk", "plane", 4.5],
  ["signalNegativeInk", "plane", 4.5],
  ["signalPrimaryInk", "planeLift", 4.5],
  ["signalCautionInk", "signalCautionTint", 4.5],
  ["signalNegativeInk", "signalNegativeTint", 4.5],
  ["textStrong", "controlField", 4.5],
  ["textStrong", "controlSelected", 4.5],
  ["textInk", "planeSunk", 4.5],
  ["inverseOn", "inverse", 4.5],
];

specimen.describe("a11y — every part over every theme and zone; the pairs measured, not asserted", () => {
  for (const theme of THEMES) {
    for (const zone of ZONES) {
      specimen.it(`${theme} · zone ${zone}: every token a part reads exists; every pair clears its ratio`, async () => {
        const { Page, WORLDS } = await design;
        const held = palette(theme, zone);
        const text = await frame(() => Page({ palette: held, worlds: WORLDS }), { width: 100, height: 140 });
        specimen.expect(text).toContain("approve match_move");
        const failing = PAIRS.filter(([ink, ground, least]) => contrast(held[ink], held[ground]) < least).map(([ink, ground, least]) => `${ink}/${ground} ${contrast(held[ink], held[ground]).toFixed(1)} < ${least}`);
        specimen.expect(failing).toEqual([]);
      });
    }
  }
});
