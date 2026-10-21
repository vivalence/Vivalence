import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Dot — one signal, no words", () => {
  specimen.it("paints the glyph of each signal", async () => {
    const { Dot, DOTS } = await parts;
    for (const [signal, { glyph }] of Object.entries(DOTS)) {
      specimen.expect(await frame(() => Dot({ palette: palette(), signal }), { width: 4, height: 1 })).toMatch(new RegExp(`^\\${glyph}`));
    }
  });

  specimen.it("a signal outside the six throws, naming them", async () => {
    const { dot } = await parts;
    specimen.expect(() => dot("maybe")).toThrow(/not a signal: "maybe" · positive · primary · caution · negative · paused · off/);
  });
});
