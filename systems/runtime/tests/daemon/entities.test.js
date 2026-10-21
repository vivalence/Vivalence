import { shape, specimen } from "@vivalence/typology";
import { create } from "../scenarios/daemon.js";

specimen.describe("daemon entities — the static set literal · symbol · note · mode rides /daemon/<slug>/entities on the wire", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("the aperture serves exactly the four kinds", () => {
    specimen.expect(Object.keys(shape.strip(scenario.daemon.aperture.branch("/entities")).branches).sort()).toEqual(["literal", "mode", "note", "symbol"]);
  });

  specimen.it("every kind answers /count with a number — note included", async () => {
    for (const kind of ["literal", "symbol", "note", "mode"]) {
      const count = await scenario.conn.call(`/entities/${kind}/count`, { where: {} });
      specimen.expect(typeof count).toBe("number");
    }
  });
});
