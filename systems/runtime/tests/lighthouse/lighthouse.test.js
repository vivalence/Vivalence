import { specimen, v } from "@vivalence/typology";
import { lighthouse } from "../scenarios/index.js";

specimen.describe("Lighthouse", () => {
  let scenario;
  let auth = {};

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    await scenario.conn.call("/lighthouse/signup", { username: "finn", password: "biggusdickus" });
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.describe("server", () => {
    specimen.it("/status", async () => {
      const result = await scenario.conn.call("/status", {});
      specimen.expect(result).toBe("RUNNING");
    });
  });

  specimen.describe("manifest", () => {
    specimen.it("/lighthouse/metadata is the lighthouse manifest", async () => {
      const result = await scenario.conn.call("/lighthouse/metadata", {});
      specimen.expect(result).toEqual({ type: "lighthouse", slug: "lighthouse", traits: ["JOINABLE"] });
    });

    specimen.it("a lighthouse without JOINABLE grafts no /signup", async () => {
      const closed = await lighthouse.create({ traits: [] });
      try {
        specimen.expect(await closed.conn.call("/lighthouse/metadata", {})).toEqual({ type: "lighthouse", slug: "lighthouse", traits: [] });
        await specimen.expect(closed.conn.call("/lighthouse/signup", { username: "stranger", password: "knock-knock" })).rejects.toThrow();
      } finally {
        await closed.close();
      }
    });

    specimen.it("AUTOLOGIN mints trait.AUTOLOGIN.username on boot and /autologin signs every visitor in as it", async () => {
      const open = await lighthouse.create({ traits: ["AUTOLOGIN"] });
      try {
        const entered = await open.conn.call("/lighthouse/autologin", {});
        specimen.expect(entered.status).toBe("SUCCESS");
        specimen.expect(entered.user.slug).toBe("localhost");
        const verified = await open.conn.call("/lighthouse/verify", { access: entered.authority.access });
        specimen.expect(verified.user.id).toBe(entered.user.id);
        const again = await open.conn.call("/lighthouse/autologin", {});
        specimen.expect(again.user.id).toBe(entered.user.id);
        await specimen.expect(open.conn.call("/lighthouse/signup", { username: "stranger", password: "knock-knock" })).rejects.toThrow();
      } finally {
        await open.close();
      }
    });
  });

  specimen.describe("auth", () => {
    specimen.it("login", async () => {
      const result = await scenario.conn.call("/lighthouse/login", { username: "finn", password: "biggusdickus" });
      auth = result.authority;
      specimen.expect(result.authority?.access).matches(v.scalars.JWTToken);
      specimen.expect(result).matches(v.primitives.auth.AuthResponse);
    });

    specimen.it("verify", async () => {
      const result = await scenario.conn.call("/lighthouse/verify", { access: auth.access });
      specimen.expect(result.status).toBe("SUCCESS");
      specimen.expect(result.user).matches(v.primitives.auth.UserReference);
    });

    specimen.it("refresh", async () => {
      const result = await scenario.conn.call("/lighthouse/refresh", { refresh: auth.refresh });
      specimen.expect(result).matches(v.primitives.auth.RefreshResponse);
    });

    specimen.it("logout", async () => {
      const result = await scenario.conn.call("/lighthouse/logout", { refresh: auth.refresh });
      specimen.expect(result.status).toBe("SUCCESS");
    });
  });

  specimen.describe("userspace", () => {
    specimen.it("thread/find under the token", async () => {
      const result = await scenario.connect(auth.access).call("/userspace/entities/thread/find", { where: {} });
      specimen.expect(Array.isArray(result)).toBe(true);
    });
  });
});
