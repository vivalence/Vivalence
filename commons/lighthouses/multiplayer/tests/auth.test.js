// commons/lighthouses/multiplayer/tests/auth.test.js:1
import { specimen } from "@vivalence/typology";
import { lighthouse } from "@vivalence/runtime/scenarios";

specimen.describe("Lighthouse Auth", () => {
  let scenario;
  let tokens = {};
  let identity = {};

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    await scenario.conn.call("/auth/signup", { username: "finn", password: "biggusdickus" });
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.describe("password", () => {
    specimen.it("rewrites the credential under an operator token and revokes the tokens", async () => {
      await scenario.conn.call("/auth/signup", { username: "rotated", password: "before" });
      const { signer } = await import("../gestalten/identity.js");
      const operator = await signer({ mask: scenario.mask }).operator();
      const result = await scenario.conn.call("/auth/password", { operator, username: "rotated", password: "after" });
      specimen.expect(result.identity.slug).toBe("rotated");
      const stale = await scenario.conn.fetch("/auth/login", { username: "rotated", password: "before" });
      specimen.expect(stale.status).toBe(401);
      const fresh = await scenario.conn.call("/auth/login", { username: "rotated", password: "after" });
      specimen.expect(fresh.authority.access).toBeDefined();
    });

    specimen.it("rejects a user token as operator proof", async () => {
      const login = await scenario.conn.call("/auth/login", { username: "finn", password: "biggusdickus" });
      const response = await scenario.conn.fetch("/auth/password", { operator: login.authority.access, username: "finn", password: "pwned" });
      specimen.expect(response.status).toBe(401);
    });
  });

  specimen.describe("login", () => {
    specimen.it("authenticates valid credentials", async () => {
      const result = await scenario.conn.call("/auth/login", { username: "finn", password: "biggusdickus" });
      specimen.expect(result.authority.access).toBeDefined();
      specimen.expect(result.authority.refresh).toBeDefined();
      specimen.expect(result.identity.id).toBeDefined();
      tokens = result.authority;
      identity = result.identity;
    });

    specimen.it("rejects invalid credentials", async () => {
      const response = await scenario.conn.fetch("/auth/login", { username: "invalid", password: "wrongpassword" });
      specimen.expect(response.status).toBe(401);
      specimen.expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  specimen.describe("verify", () => {
    specimen.it("validates access token", async () => {
      const result = await scenario.conn.call("/auth/verify", { access: tokens.access });
      specimen.expect(result.status).toBe("SUCCESS");
      specimen.expect(result.identity.id).toBe(identity.id);
    });
  });

  specimen.describe("refresh", () => {
    specimen.it("returns new access token", async () => {
      const result = await scenario.conn.call("/auth/refresh", { refresh: tokens.refresh });
      specimen.expect(result.access).toBeDefined();
      const verified = await scenario.conn.call("/auth/verify", { access: result.access });
      specimen.expect(verified.identity.id).toBe(identity.id);
      tokens.access = result.access;
    });
  });

  specimen.describe("logout", () => {
    specimen.it("invalidates refresh token", async () => {
      const result = await scenario.conn.call("/auth/logout", { refresh: tokens.refresh });
      specimen.expect(result.status).toBe("SUCCESS");
      const revoked = await scenario.conn.fetch("/auth/refresh", { refresh: tokens.refresh });
      specimen.expect(revoked.status).toBe(401);
      specimen.expect(revoked.body.error.code).toBe("INVALID_TOKEN");
    });
  });
});
