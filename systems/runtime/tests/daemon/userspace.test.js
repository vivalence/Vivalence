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
    const response = await scenario.conn.fetch("/userspace/entities/session/find", {});
    specimen.expect(response.status).toBe(401);
  });

  specimen.it("handshake returns user when authed", async () => {
    const result = await scenario.authedConn.call("/userspace/handshake");
    specimen.expect(result.success).toBe(true);
    specimen.expect(result.user).toBeTruthy();
  });

  specimen.it("session create with data body", async () => {
    const result = await scenario.authedConn.call("/userspace/entities/session/create", {
      data: { mode: scenario.fixtures.mode.id },
    });
    specimen.expect(result.id).toBeTruthy();
    specimen.expect(result.user).toBeTruthy();
    specimen.expect(result.mode).toBeTruthy();
  });

  specimen.it("session find scoped to user", async () => {
    const result = await scenario.authedConn.call("/userspace/entities/session/find", {
      where: {},
    });
    specimen.expect(Array.isArray(result)).toBe(true);
    specimen.expect(result.length).toBeGreaterThan(0);
  });

  specimen.it("session findOne scoped to user", async () => {
    const sessions = await scenario.authedConn.call("/userspace/entities/session/find", {
      where: {},
    });
    const result = await scenario.authedConn.call("/userspace/entities/session/findOne", {
      where: { id: sessions[0].id },
    });
    specimen.expect(result).toBeTruthy();
    specimen.expect(result.id).toBe(sessions[0].id);
  });
});
