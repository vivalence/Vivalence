//  generate
//
//
//

// import { specimen, Url, Connection } from "@vivalence/typology";
// import { shards } from "@vivalence/typology";
// import { Value } from "@sinclair/typebox/value";
// import { scalars, primitives, bodies, types } from "@vivalence/typology";

// const BASE = "http://localhost:1729/attached/process/lighthouse/multiplayer";
// const lighthouse = new Connection(new Url(BASE));

// let auth = {};

// specimen.describe("Hallucinator", () => {
//   specimen.describe("server", () => {
//     specimen.it("/manifest", async () => {
//       const result = await lighthouse.call("/manifest");
//       // console.log({ result });
//       // specimen.expect(Value.Check(primitives.Manifest, result)).toBe(true);
//       specimen.expect(result.type).toBe("lighthouse");
//       specimen.expect(result.slug).toBe("multiplayer");
//     });

//     specimen.it("/status", async () => {
//       const result = await lighthouse.call("/status", {});
//       // console.log({ result });
//       // specimen.expect(result.code).toBe(string)
//       // specimen.expect(Value.Check(types.Status, result)).toBe(true);
//     });
//   });
//   specimen.describe("auth", () => {
//     specimen.it("login", async () => {
//       const result = await lighthouse.call("/auth/login", {
//         username: "beef",
//         password: "biggusdickus",
//       });
//       specimen.expect(Value.Check(bodies.AuthResponse, result)).toBe(true);
//       specimen
//         .expect(Value.Check(scalars.JWTToken, result.authority?.access))
//         .toBe(true);
//       auth = result.authority;
//     });
//   });
// });
