import { specimen, Url, Connection } from "@vivalence/typology";
import { shards } from "@vivalence/typology";

const lighthouse = new Connection(
  new Url("http://localhost:1729/attached/process/lighthouse/multiplayer"),
  shards.transport.fetcher,
);

let tokens = {};
let identity = {};

specimen.describe("Lighthouse Auth", () => {
  specimen.describe("login", () => {
    specimen.it("authenticates valid credentials", async () => {
      const result = await lighthouse.call("/auth/login", {
        username: "beef",
        password: "biggusdickus",
      });

      console.log({ result });
      // {
      //   result: {
      //     authority: {
      //       access: "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAxOWFjOGQ1LTkzOGEtNzU4Yy04ZmQ4LTA4NmRhNDU1NDgxMSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjQ4MTExODYsImV4cCI6MTc2NDg5NzU4Nn0.u_plM0diPi--nUFxT-yatjz_s1yWCfLU2-iiLfO65V8",
      //       refresh: "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAxOWFjOGQ1LTkzOGEtNzU4Yy04ZmQ4LTA4NmRhNDU1NDgxMSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzY0ODExMTg2LCJleHAiOjE3ODAzNjMxODZ9.Z2L7I153hgsasnwEra1JAkuZUgRLiyHXCkQdwJ5uJGg"
      //     },
      //     identity: {
      //       slug: "beef",
      //       authentication: null,
      //       id: "019ac8d5-938a-758c-8fd8-086da4554811"
      //     }
      //   }
      // }
      specimen.expect(result.authority.access).toBeDefined();
      specimen.expect(result.authority.refresh).toBeDefined();
      specimen.expect(result.identity.id).toBeDefined();

      tokens = result.authority;
      identity = result.identity;
    });

    specimen.it("rejects invalid credentials", async () => {
      const result = await lighthouse.call("/auth/login", {
        username: "invalid",
        password: "wrongpassword",
      });

      console.log({ result });
      specimen.expect(result.status || result.error).toBeDefined();
    });
  });
  return;
  specimen.describe("verify", () => {
    specimen.it("validates access token", async () => {
      const result = await lighthouse.call("/auth/verify", {
        access: tokens.access,
      });

      specimen.expect(result.valid).toBe(true);
    });
  });

  specimen.describe("refresh", () => {
    specimen.it("returns new access token", async () => {
      const result = await lighthouse.call("/auth/refresh", {
        refresh: tokens.refresh,
      });

      specimen.expect(result.access).toBeDefined();
      specimen.expect(result.access).not.toBe(tokens.access);

      tokens.access = result.access;
    });
  });

  specimen.describe("logout", () => {
    specimen.it("invalidates refresh token", async () => {
      const result = await lighthouse.call("/auth/logout", {
        refreshToken: tokens.refresh,
      });

      specimen.expect(result.success).toBe(true);
    });
  });
});
