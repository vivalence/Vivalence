import { specimen } from "@vivalence/typology";
import { frame, palette, parts, screen, settle } from "./scenarios/index.js";

specimen.describe("Consent — replaces the composer; y · n · e are bindings", () => {
  specimen.it("? approve, the call, the three keys", async () => {
    const { Consent } = await parts;
    specimen.expect(await frame(() => Consent({ palette: palette(), name: "match_move", argument: "e2e4", onApprove: () => {}, onSkip: () => {}, onEdit: () => {} }), { width: 60, height: 1 })).toMatch(/^ \? approve match_move e2e4  y approve  n skip  e edit/);
  });

  specimen.it("y approves, n skips, e edits — any other key passes", async () => {
    const { Consent } = await parts;
    const heard = [];
    const setup = await screen(() => Consent({ palette: palette(), name: "match_move", argument: "e2e4", onApprove: () => heard.push("approve"), onSkip: () => heard.push("skip"), onEdit: () => heard.push("edit") }), { width: 60, height: 1 });
    await settle(setup);
    for (const key of ["y", "x", "n", "e"]) setup.mockInput.pressKey(key);
    specimen.expect(heard).toEqual(["approve", "skip", "edit"]);
    setup.renderer.destroy();
  });
});
