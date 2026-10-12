import * as kit from "../index.js";
import { specimen } from "@vivalence/typology";
import { holding } from "./world.js";

specimen.describe("Pending — a spinner held over a promise, released with its settlement", () => {
  specimen.it("spins while the work runs, releases fulfilled with the value", async () => {
    const work = Promise.withResolvers();
    const view = await holding(kit, "pending", { label: "booting", work: work.promise });
    specimen.expect(view.frame()).toContain("booting");
    specimen.expect(kit.FRAMES.some((frame) => view.frame().includes(frame))).toBe(true);
    work.resolve({ processes: 2 });
    specimen.expect(await view.held.released).toEqual({ status: "fulfilled", value: { processes: 2 } });
    await view.settle();
    specimen.expect(view.setup.externalOutput.takeText()).toContain("✓ booting");
    view.setup.renderer.destroy();
  });

  specimen.it("a rejection releases rejected with the reason, never throws", async () => {
    const reason = new Error("port taken");
    const view = await holding(kit, "pending", { label: "booting", work: Promise.reject(reason) });
    specimen.expect(await view.held.released).toEqual({ status: "rejected", reason });
    await view.settle();
    specimen.expect(view.setup.externalOutput.takeText()).toContain("✕ booting");
    view.setup.renderer.destroy();
  });
});
