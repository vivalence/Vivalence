import * as assert from "@std/assert";
import { Pensieve } from "@vivalence/paladin/typology";

Deno.test("Pensieve: registers and looks up modules", async () => {
  const pensieve = new Pensieve();

  const testModule = {
    manifest: {
      owner: "@test",
      type: "component",
      slug: "test-module",
      version: "1.0.0",
    },
    default: () => "test component",
  };

  pensieve.register(testModule);

  const found = await pensieve.lookup({
    owner: "@test",
    type: "component",
    slug: "test-module",
  });

  assert.assertEquals(found, testModule);
});

Deno.test("Pensieve: handles version resolution", async () => {
  const pensieve = new Pensieve();

  const v1 = {
    manifest: { owner: "@test", type: "lib", slug: "utils", version: "1.0.0" },
  };

  const v2 = {
    manifest: { owner: "@test", type: "lib", slug: "utils", version: "2.0.0" },
  };

  pensieve.register(v1);
  pensieve.register(v2);

  const latest = await pensieve.lookup({
    owner: "@test",
    type: "lib",
    slug: "utils",
  });

  assert.assertEquals(latest, v2);
});
