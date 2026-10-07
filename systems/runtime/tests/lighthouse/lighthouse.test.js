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
