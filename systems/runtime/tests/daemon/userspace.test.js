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

  specimen.it("handshake requires auth", async () => {
    const response = await scenario.conn.fetch("/userspace/handshake");
    specimen.expect(response.status).toBe(401);
  });

  specimen.it("entities require auth", async () => {
    const response = await scenario.conn.fetch("/userspace/entities/thread/find", {});
    specimen.expect(response.status).toBe(401);
  });

  specimen.it("handshake returns user when authed", async () => {
    const result = await scenario.authedConn.call("/userspace/handshake");
    specimen.expect(result.success).toBe(true);
    specimen.expect(result.user).toBeTruthy();
  });

  specimen.it("thread create with data body", async () => {
    const result = await scenario.authedConn.call("/userspace/entities/thread/create", {
      data: { mode: scenario.fixtures.mode.id },
    });
    specimen.expect(result.id).toBeTruthy();
    specimen.expect(result.user).toBeTruthy();
    specimen.expect(result.mode).toBeTruthy();
  });

  specimen.it("thread find scoped to user", async () => {
    const result = await scenario.authedConn.call("/userspace/entities/thread/find", {
      where: {},
    });
    specimen.expect(Array.isArray(result)).toBe(true);
    specimen.expect(result.length).toBeGreaterThan(0);
  });

  specimen.it("thread findOne scoped to user", async () => {
    const threads = await scenario.authedConn.call("/userspace/entities/thread/find", {
      where: {},
    });
    const result = await scenario.authedConn.call("/userspace/entities/thread/findOne", {
      where: { id: threads[0].id },
    });
    specimen.expect(result).toBeTruthy();
    specimen.expect(result.id).toBe(threads[0].id);
  });
});
