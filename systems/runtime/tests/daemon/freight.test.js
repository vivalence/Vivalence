import { specimen } from "@vivalence/typology";
import { create } from "../scenarios/daemon.js";

specimen.describe("daemon freight", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("returns cargo", async () => {
    const result = await scenario.conn.call("/cargo");
    specimen.expect(result.test).toBe(true);
    specimen.expect(result.version).toBe("0.0.1");
  });
});
