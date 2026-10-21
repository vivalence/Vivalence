import { chrome } from "../../scenarios/world.js";
import { specimen } from "@vivalence/typology";

specimen.describe("the chrome surface's bundle — its entry is mount.jsx", { sanitizeOps: false, sanitizeResources: false }, () => {
  specimen.it("the bundle exports mount · Cover · COVERS; the cover table reads signin · booting · layout — the runtime is minted before the mount", async () => {
    const bundled = await chrome();
    specimen.expect(typeof bundled.mount).toBe("function");
    specimen.expect(bundled.COVERS.map(([, component]) => component.name)).toEqual(["Signin", "Booting", "Layout"]);
  });
});
