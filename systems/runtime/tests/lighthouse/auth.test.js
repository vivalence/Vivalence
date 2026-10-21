import { specimen } from "@vivalence/typology";
import { lighthouse } from "../scenarios/index.js";
import { signer } from "../../subjects/lighthouse/signer.js";

specimen.describe("Lighthouse Auth", () => {
  let scenario;
  let tokens = {};
  let user = {};

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    await scenario.conn.call("/lighthouse/signup", { username: "finn", password: "biggusdickus" });
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.describe("password", () => {
    specimen.it("rewrites the credential under an operator token and revokes the tokens", async () => {
      await scenario.conn.call("/lighthouse/signup", { username: "rotated", password: "before" });
      const operator = await signer(scenario.secret).operator();
      const result = await scenario.conn.call("/lighthouse/password", { operator, username: "rotated", password: "after" });
      specimen.expect(result.user.slug).toBe("rotated");
      const stale = await scenario.conn.fetch("/lighthouse/login", { username: "rotated", password: "before" });
      specimen.expect(stale.status).toBe(401);
      const fresh = await scenario.conn.call("/lighthouse/login", { username: "rotated", password: "after" });
      specimen.expect(fresh.authority.access).toBeDefined();
    });

    specimen.it("rejects a user token as operator proof", async () => {
      const login = await scenario.conn.call("/lighthouse/login", { username: "finn", password: "biggusdickus" });
      const response = await scenario.conn.fetch("/lighthouse/password", { operator: login.authority.access, username: "finn", password: "pwned" });
      specimen.expect(response.status).toBe(401);
    });
  });

  specimen.describe("login", () => {
    specimen.it("authenticates valid credentials", async () => {
      const result = await scenario.conn.call("/lighthouse/login", { username: "finn", password: "biggusdickus" });
      specimen.expect(result.authority.access).toBeDefined();
      specimen.expect(result.authority.refresh).toBeDefined();
      specimen.expect(result.user.id).toBeDefined();
      tokens = result.authority;
      user = result.user;
    });

    specimen.it("rejects invalid credentials", async () => {
      const response = await scenario.conn.fetch("/lighthouse/login", { username: "invalid", password: "wrongpassword" });
      specimen.expect(response.status).toBe(401);
      specimen.expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  specimen.describe("verify", () => {
    specimen.it("validates access token", async () => {
      const result = await scenario.conn.call("/lighthouse/verify", { access: tokens.access });
      specimen.expect(result.status).toBe("SUCCESS");
      specimen.expect(result.user.id).toBe(user.id);
    });
  });

  specimen.describe("refresh", () => {
    specimen.it("returns new access token", async () => {
      const result = await scenario.conn.call("/lighthouse/refresh", { refresh: tokens.refresh });
      specimen.expect(result.access).toBeDefined();
      const verified = await scenario.conn.call("/lighthouse/verify", { access: result.access });
      specimen.expect(verified.user.id).toBe(user.id);
      tokens.access = result.access;
    });
  });

  specimen.describe("logout", () => {
    specimen.it("invalidates refresh token", async () => {
      const result = await scenario.conn.call("/lighthouse/logout", { refresh: tokens.refresh });
      specimen.expect(result.status).toBe("SUCCESS");
      const revoked = await scenario.conn.fetch("/lighthouse/refresh", { refresh: tokens.refresh });
      specimen.expect(revoked.status).toBe(401);
      specimen.expect(revoked.body.error.code).toBe("INVALID_TOKEN");
    });
  });
});
