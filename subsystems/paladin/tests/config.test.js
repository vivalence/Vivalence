import { assertEquals, assertExists, assertRejects } from "$std/assert";
import { Config } from "../prototype.js";
import * as populate from "../lifecycle/populate.js";
import * as integrate from "../lifecycle/integrate.js";
import { Env, Path } from "@vivalence/typology";

const config = new Config();

Deno.test("config:construct", async () => {
  assertExists(config.env);
  assertExists(config.secret);
  assertExists(config.join);
  assertExists(config.read);
  assertExists(config.find);
  assertExists(config.check);
  assertExists(config.state);
});

console.log(config);

// Deno.test("config:populate", async () => {
//   await populate.env(config);
//   await populate.environment(config);
//   await populate.repository(config);
//   await populate.modeselector(config);
//   await populate.statements(config);
//   await populate.questions(config);

//   // config will now how the variant and shit ready.
//   console.log(config);

//   // assertEquals(config.mode, "DEVELOPMENT");
//   // assertEquals(config.role, "TEST");
//   // assertEquals(config.is.dev, true);
//   // assertEquals(config.is.prod, false);
//   // assertExists(config.repository);
//   // assertEquals(config.repository.mount instanceof Path, true);
//   // assertExists(config.repository.importmap);
//   // assertEquals(config.env.get("TEST_VAR"), "test_value");
// });

// Deno.test("config:resolve", async () => {
//   const config = new Config();
//   const tmpDir = await Deno.makeTempDir();

//   // Setup test environment
//   config.env.assign({
//     VIVA_GAIA_SERVE: "http://localhost:3000",
//     VIVA_DAEMON_SERVE: "http://localhost:4000",
//   });

//   // Test integration functions
//   await integrate.publish(config);
//   await integrate.validate(config);
//   await integrate.secure(config);

//   // Assertions
//   assertEquals(
//     config.env.get("PUBLIC_VIVA_GAIA_SERVE"),
//     "http://localhost:3000",
//   );
//   assertEquals(
//     config.env.get("PUBLIC_VIVA_DAEMON_SERVE"),
//     "http://localhost:4000",
//   );
//   assertEquals(Deno.env.get("PUBLIC_VIVA_GAIA_SERVE"), "http://localhost:3000");
//   assertEquals(config.secret, undefined); // Should be deleted by secure()

//   await Deno.remove(tmpDir, { recursive: true });
// });

// import { assertEquals, assertExists, assertRejects } from "$std/assert";
// import { Config } from "../prototype.js";
// import * as populate from "../lifecycle/populate.js";
// import * as integrate from "../lifecycle/integrate.js";
// import { Env, Path } from "@vivalence/typology";

// // Deno.test("config:construct", async () => {
// //   const config = new Config();

// //   assertExists(config.env);
// //   assertExists(config.secret);
// //   assertExists(config.join);
// //   assertExists(config.read);
// //   assertExists(config.find);
// //   assertExists(config.check);
// //   assertExists(config.state);
// // });

// // Deno.test("config:populate", async () => {
// //   const config = new Config();
// //   await populate.env(config);
// //   await populate.environment(config);
// //   await populate.repository(config);
// //   await populate.registry(config);
// //   await populate.modeselector(config);
// //   await populate.statements(config);
// //   await populate.questions(config);

// //   // ... assert a bunch of stuff. maybe prime the config.
// // });

// // Deno.test("config:resolve", async () => {
// //   // ..
// // });
