import * as kit from "../index.js";
import { specimen } from "@vivalence/typology";
import { escape, holding } from "./world.js";

const asked = (initial) => holding(kit, "confirm", { label: "remove 3 stale view bundles?", initial });

specimen.describe("Confirm — a yes/no held until answered", () => {
  specimen.it("shows the label and both answers", async () => {
    const view = await asked(false);
    specimen.expect(view.frame()).toContain("remove 3 stale view bundles?  yes   no");
    view.setup.renderer.destroy();
  });

  specimen.it("enter answers the initial choice", async () => {
    const view = await asked(false);
    view.setup.mockInput.pressEnter();
    specimen.expect(await view.held.released).toBe(false);
    view.setup.renderer.destroy();
  });

  specimen.it("an arrow flips the choice, enter answers it", async () => {
    const view = await asked(false);
    view.setup.mockInput.pressArrow("left");
    await view.settle();
    view.setup.mockInput.pressEnter();
    specimen.expect(await view.held.released).toBe(true);
    view.setup.renderer.destroy();
  });

  specimen.it("y answers yes, n answers no, whatever is chosen", async () => {
    const yes = await asked(false);
    yes.setup.mockInput.pressKey("y");
    specimen.expect(await yes.held.released).toBe(true);
    yes.setup.renderer.destroy();
    const no = await asked(true);
    no.setup.mockInput.pressKey("n");
    specimen.expect(await no.held.released).toBe(false);
    no.setup.renderer.destroy();
  });

  specimen.it("esc answers no", async () => {
    const view = await asked(true);
    await escape(view.setup);
    specimen.expect(await view.held.released).toBe(false);
    view.setup.renderer.destroy();
  });

  specimen.it("the answered frame lands in scrollback", async () => {
    const view = await asked(true);
    view.setup.mockInput.pressEnter();
    await view.held.released;
    await view.settle();
    specimen.expect(view.setup.externalOutput.takeText()).toContain("remove 3 stale view bundles?");
    view.setup.renderer.destroy();
  });
});
