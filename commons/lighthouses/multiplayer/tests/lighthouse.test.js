// commons/lighthouses/multiplayer/tests/lighthouse.test.js:1
import { specimen, v } from "@vivalence/typology";
import { lighthouse } from "@vivalence/runtime/scenarios";

specimen.describe("Lighthouse", () => {
  let scenario;
  let auth = {};

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    await scenario.conn.call("/auth/signup", { username: "finn", password: "biggusdickus" });
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.describe("server", () => {
    specimen.it("/manifest", async () => {
      const result = await scenario.conn.call("/manifest");
      specimen.expect(result.type).toBe("lighthouse");
      specimen.expect(result.slug).toBe("multiplayer");
    });

    specimen.it("/status", async () => {
      const result = await scenario.conn.call("/status", {});
      specimen.expect(result).toBe("RUNNING");
    });
  });

  specimen.describe("auth", () => {
    specimen.it("login", async () => {
      const result = await scenario.conn.call("/auth/login", { username: "finn", password: "biggusdickus" });
      specimen.expect(result).matches(v.primitives.auth.AuthResponse);
      specimen.expect(result.authority?.access).matches(v.scalars.JWTToken);
      auth = result.authority;
    });

    specimen.it("verify", async () => {
      const result = await scenario.conn.call("/auth/verify", { access: auth.access });
      specimen.expect(result.status).toBe("SUCCESS");
      specimen.expect(result.identity).matches(v.primitives.auth.IdentityReference);
    });

    specimen.it("refresh", async () => {
      const result = await scenario.conn.call("/auth/refresh", { refresh: auth.refresh });
      specimen.expect(result).matches(v.primitives.auth.RefreshResponse);
    });

    specimen.it("logout", async () => {
      const result = await scenario.conn.call("/auth/logout", { refresh: auth.refresh });
      specimen.expect(result.status).toBe("SUCCESS");
    });
  });

  specimen.describe("datamap", () => {
    specimen.it("daemon/find", async () => {
      const result = await scenario.connect(auth.access).call("/entities/daemon/find", { where: {} });
      specimen.expect(Array.isArray(result)).toBe(true);
    });
  });
});
