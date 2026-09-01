import { specimen } from "@vivalence/typology";
import { create } from "../scenarios/daemon.js";

specimen.describe("daemon userspace", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("unauthenticated requests return 401", async () => {
    const handshake = await scenario.conn.fetch("/userspace/handshake");
    specimen.expect(handshake.status).toBe(401);

    const entities = await scenario.conn.fetch("/userspace/entities/thread/find", {});
    specimen.expect(entities.status).toBe(401);
  });

  specimen.it("a fresh identity is refused the userspace until it handshakes", async () => {
    const threads = await scenario.freshConn.fetch("/userspace/entities/thread/find", { where: {} });
    specimen.expect(threads.status).toBe(401);
    specimen.expect(threads.body.error.code).toBe("USER_NOT_FOUND");
  });

  specimen.it("handshake enrolls a fresh identity and opens its userspace", async () => {
    const result = await scenario.freshConn.call("/userspace/handshake");
    specimen.expect(result.success).toBe(true);
    specimen.expect(result.user.id).toBe("fresh-identity");

    const found = await scenario.freshConn.call("/userspace/entities/thread/find", { where: {} });
    specimen.expect(Array.isArray(found)).toBe(true);
    specimen.expect(found.length).toBe(0);
  });

  specimen.it("handshake returns user when authed", async () => {
    const result = await scenario.authedConn.call("/userspace/handshake");
    specimen.expect(result.success).toBe(true);
    specimen.expect(result.user).toBeTruthy();
  });

  specimen.it("thread lifecycle scoped to user", async () => {
    const created = await scenario.authedConn.call("/userspace/entities/thread/create", {
      data: { mode: scenario.fixtures.mode.id },
    });
    specimen.expect(created.id).toBeTruthy();
    specimen.expect(created.user).toBeTruthy();
    specimen.expect(created.mode).toBeTruthy();

    const found = await scenario.authedConn.call("/userspace/entities/thread/find", {
      where: {},
    });
    specimen.expect(Array.isArray(found)).toBe(true);
    specimen.expect(found.length).toBeGreaterThan(0);

    const one = await scenario.authedConn.call("/userspace/entities/thread/findOne", {
      where: { id: found[0].id },
    });
    specimen.expect(one).toBeTruthy();
    specimen.expect(one.id).toBe(found[0].id);
  });
});
