import config from "@vivalence/paladin";
import * as assert from "$std@std@std/assert";
import { cast } from "@vivalence/typology";

Deno.test("Lookup: parses string formats", async () => {
  const basic = cast.lookup("@vivalence/module/moduleA");
  assert.assertEquals(basic, {
    owner: "@vivalence",
    type: "module",
    slug: "moduleA",
    version: null,
  });

  const versioned = cast.lookup("@vivalence/module/moduleA@1.0.0");
  assert.assertEquals(versioned.version, "1.0.0");
  assert.assertEquals(versioned.slug, "moduleA");
});

// Deno.test("Lookup: normalizes object formats", async () => {
//   // Direct object format
//   const direct = lookup({
//     type: "module",
//     slug: "moduleB",
//     owner: "@vivalence",
//   });

//   // Nested formats (module string, module object, manifest object)
//   const nested1 = lookup({ module: "@vivalence/module/moduleC" });
//   const nested2 = lookup({
//     module: { type: "module", slug: "moduleD", owner: "@vivalence" },
//   });
//   const nested3 = lookup({
//     module: {
//       manifest: { type: "module", slug: "moduleE", owner: "@vivalence" },
//     },
//   });

//   // All should normalize to same structure
//   [direct, nested1, nested2, nested3].forEach((result) => {
//     assert.assertEquals(result.owner, "@vivalence");
//     assert.assertEquals(result.type, "module");
//     assert.assertEquals(typeof result.slug, "string");
//     assert.assertEquals(result.version, null);
//   });
// });
// import config from "@vivalence/paladin";
// import * as assert from "$std@std@std/assert";
// import { Lookup } from "../prototypes/index.js";

// // test lookup cases
// Deno.test("Lookup: ", async () => {
//   const queryA = "@vivalence/module/moduleA";
//   const queryB = { type: "module", slug: "moduleB", owner: "@vivalence" };
//   const queryC = { module: "@vivalence/module/moduleC" };
//   const queryD = {
//     module: { type: "module", slug: "moduleD", owner: "@vivalence" },
//   };

//   const queryE = {
//     module: {
//       manifest: { type: "module", slug: "moduleE", owner: "@vivalence" },
//     },
//   };
//   // ...
// });
