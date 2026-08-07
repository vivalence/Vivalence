import { specimen, shard } from "@vivalence/typology";
import { create } from "../scenarios/daemon.js";

specimen.describe("batch: daemon lifecycle", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
    scenario.daemon.aperture.open("/batch", shard.batch.route(scenario.daemon.aperture));
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("batch [/datamap, /cargo] returns both", async () => {
    const results = await scenario.conn.call("/batch", [
      { path: "/datamap" },
      { path: "/cargo" },
    ]);
    specimen.expect(results).toHaveLength(2);

    specimen.expect(results[0].status).toBe(200);
    specimen.expect(results[0].body.literal).toBeDefined();

    specimen.expect(results[1].status).toBe(200);
    specimen.expect(results[1].body.test).toBe(true);
  });

  specimen.it("batch [mode/find, intent/find] returns both", async () => {
    const results = await scenario.authedConn.call("/batch", [
      { path: "/entities/mode/find", body: { where: {} } },
      { path: "/userspace/entities/intent/find", body: { where: {} } },
    ]);
    specimen.expect(results).toHaveLength(2);
    specimen.expect(results[0].status).toBe(200);
    specimen.expect(results[0].body.length).toBeGreaterThan(0);
    specimen.expect(results[1].status).toBe(200);
  });

  specimen.it("mixed: batch across datamap + freight routes", async () => {
    const results = await scenario.conn.call("/batch", [
      { path: "/entities/literal/find", body: { where: {}, options: { limit: 2 } } },
      { path: "/cargo" },
      { path: "/entities/symbol/find", body: { where: {} } },
      { path: "/datamap" },
    ]);
    specimen.expect(results).toHaveLength(4);
    for (const r of results) {
      specimen.expect(r.status).toBe(200);
    }
    specimen.expect(results[0].body.length).toBeGreaterThan(0);
    specimen.expect(results[1].body.test).toBe(true);
    specimen.expect(results[2].body.length).toBeGreaterThan(0);
    specimen.expect(results[3].body.literal).toBeDefined();
  });

  specimen.it("authed: batch through userspace with auth context", async () => {
    const thread = await scenario.authedConn.call("/userspace/entities/thread/create", {
      data: { mode: scenario.fixtures.mode.id, intent: scenario.fixtures.intent.id },
    });

    const results = await scenario.authedConn.call("/batch", [
      { path: "/userspace/entities/thread/find", body: { where: {} } },
      { path: "/userspace/entities/buffer/find", body: { where: {} } },
    ]);
    specimen.expect(results).toHaveLength(2);
    specimen.expect(results[0].status).toBe(200);
    specimen.expect(results[0].body.length).toBeGreaterThan(0);
    specimen.expect(results[1].status).toBe(200);
  });
});
