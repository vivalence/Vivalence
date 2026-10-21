import { specimen } from "@vivalence/typology";
import { frame, palette, parts } from "./scenarios/index.js";

specimen.describe("Choice — inline options, one latched", () => {
  specimen.it("paints every option a space apart; the latched one reads inverse", async () => {
    const { Choice } = await parts;
    specimen.expect(await frame(() => Choice({ palette: palette(), options: ["frugal", "fast", "capable"], value: "capable" }), { width: 30, height: 1 })).toMatch(/^ frugal   fast   capable /);
  });
});
