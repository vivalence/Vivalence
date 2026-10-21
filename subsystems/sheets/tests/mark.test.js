import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Mark — the viket as a glyph in ink", () => {
  specimen.it("◆, and the fault dot beside it when faulted", async () => {
    const { Mark } = await parts;
    specimen.expect(await frame(() => Mark({ palette: palette() }), { width: 4, height: 1 })).toMatch(/^◆ /);
    specimen.expect(await frame(() => Mark({ palette: palette(), fault: true }), { width: 4, height: 1 })).toMatch(/^◆!/);
  });
});
