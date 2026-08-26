import { specimen, Url, Connection, v } from "@vivalence/typology";
import { shard } from "@vivalence/typology";

const BASE = "http://localhost:1729/attached/process/lighthouse/multiplayer";
const lighthouse = new Connection(new Url(BASE));

let auth = {};

specimen.describe("Lighthouse", () => {
  specimen.describe("server", () => {
    specimen.it("/manifest", async () => {
      const result = await lighthouse.call("/manifest");
      // console.log({ result });
      // specimen.expect(Value.Check(primitives.Manifest, result)).toBe(true);
      specimen.expect(result.type).toBe("lighthouse");
      specimen.expect(result.slug).toBe("multiplayer");
    });

    specimen.it("/status", async () => {
      const result = await lighthouse.call("/status", {});
      // console.log({ result });
      // specimen.expect(result.code).toBe(string)
      // specimen.expect(Value.Check(types.Status, result)).toBe(true);
    });
  });

  // specimen.describe("signup", () => {specimen.it("creates new user", async () => {const result = await lighthouse.call("/auth/signup", {username: "beef", password: "biggusdickus",}); console.log({ result }); specimen.expect(result.authority).toBeDefined(); specimen.expect(result.identity).toBeDefined(); tokens = result.authority; identity = result.identity;});});

  // return;

  specimen.describe("auth", () => {
    specimen.it("login", async () => {
      const result = await lighthouse.call("/auth/login", {
        username: "beef",
        password: "biggusdickus",
      });
      specimen.expect(result).matches(v.primitives.auth.AuthResponse);
      specimen.expect(result.authority?.access).matches(v.scalars.JWTToken);
      auth = result.authority;
    });

    specimen.it("verify", async () => {
      const result = await lighthouse.call("/auth/verify", {
        access: auth.access,
      });
      specimen.expect(result).matches(v.primitives.auth.VerifyResponse);
      specimen.expect(result.success).toBe(true);
    });

    specimen.it("refresh", async () => {
      const result = await lighthouse.call("/auth/refresh", {
        refresh: auth.refresh,
      });
      specimen.expect(result).matches(v.primitives.auth.RefreshResponse);
    });

    specimen.it("logout", async () => {
      const result = await lighthouse.call("/auth/logout", {
        refresh: auth.refresh,
      });
      specimen.expect(result).matches(v.primitives.auth.LogoutResponse);
      specimen.expect(result.success).toBe(true);
    });
  });

  specimen.describe("datamap", () => {
    specimen.it("identity/find", async () => {
      const result = await lighthouse.call("/entities/identity/find", {
        where: {},
      });
      console.log("identity", { result });
      specimen.expect(Array.isArray(result)).toBe(true);
    });

    specimen.it("daemon/find", async () => {
      const result = await lighthouse.call("/entities/daemon/find", {
        where: {},
      });

      console.log("daemons", { result });

      specimen.expect(Array.isArray(result)).toBe(true);
    });
  });
});
// import { specimen, Url, Connection } from "@vivalence/typology";
// import { shard } from "@vivalence/typology";
// import {
//   primitives,
//   types,
//   scalars,
//   bodies,
// } from "@vivalence/typology/gestalten";

// const BASE = "http://localhost:1729/attached/process/lighthouse/multiplayer";
// const lighthouse = new Connection(new Url(BASE), shards.transport.fetcher);

// let auth = {};

// specimen.describe("Lighthouse", () => {
//   specimen.describe("server", () => {
//     specimen.it("/manifest", async () => {
//       const result = await lighthouse.call("/manifest", {});
//       specimen.expect(result.type).toBe("lighthouse");
//       specimen.expect(result.slug).toBe("multiplayer");
//     });

//     specimen.it("/status", async () => {
//       const result = await lighthouse.call("/status", {});
//       specimen.expect(result.timestamp).toBeDefined();
//     });
//   });

//   specimen.describe("auth", () => {
//     // specimen.it("signup", async () => {
//     //   const result = await lighthouse.call("/auth/signup", {
//     //     username: "testuser_" + Date.now(),
//     //     password: "testpass123",
//     //   });
//     //   specimen.expect(result.authority?.access).toBeDefined();
//     //   specimen.expect(result.identity?.id).toBeDefined();
//     // });

//     specimen.it("login", async () => {
//       const result = await lighthouse.call("/auth/login", {
//         username: "beef",
//         password: "biggusdickus",
//       });
//       specimen.expect(result.authority?.access).toBeDefined();
//       auth = result.authority;
//     });

//     specimen.it("verify", async () => {
//       const result = await lighthouse.call("/auth/verify", {
//         access: auth.access,
//       });
//       specimen.expect(result.success).toBe(true);
//     });

//     specimen.it("refresh", async () => {
//       const result = await lighthouse.call("/auth/refresh", {
//         refresh: auth.refresh,
//       });
//       specimen.expect(result.access).toBeDefined();
//     });

//     specimen.it("logout", async () => {
//       const result = await lighthouse.call("/auth/logout", {
//         refresh: auth.refresh,
//       });
//       specimen.expect(result.success).toBe(true);
//     });
//   });

//   specimen.describe("datamap", () => {
//     specimen.it("identity/find", async () => {
//       const result = await lighthouse.call("/entities/identity/find", {
//         where: {},
//       });
//       // console.log("identity/find", result);
//       specimen.expect(Array.isArray(result)).toBe(true);
//     });

//     specimen.it("daemon/find", async () => {
//       const result = await lighthouse.call("/entities/daemon/find", {
//         where: {},
//       });
//       // console.log("daemon/find", result);
//       specimen.expect(Array.isArray(result)).toBe(true);
//     });
//   });
// });
