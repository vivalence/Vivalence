import paladin from "@vivalence/paladin";
import * as assert from "@std/assert";
import { Path } from "@vivalence/typology";
import { Vip, Pensieve } from "@vivalence/paladin/typology";

Deno.test("Vip: mounts", async () => {
  const vip = new Vip(paladin);
  const path = new Path(await Deno.makeTempDir());

  await Deno.writeTextFile(
    `${path.segment}/test.viva.js`,
    ` export const manifest = { 
        owner: "@test", 
        type: "component", 
        slug: "test-module",
    };
  `,
  );

  await vip.mount(path.segment);
  assert.assertEquals(vip.pensieve.size > 0, true);

  const retrival = await vip.accio("@test/component/test-module");

  await Deno.remove(path.segment, { recursive: true });
});

Deno.test("Vip: accioMany pairs object queries with mask, leaves strings bare", async () => {
  const vip = new Vip(paladin);
  const tempDir = await Deno.makeTempDir();

  await Deno.writeTextFile(
    `${tempDir}/foo.viva.js`,
    `export const manifest = {
        owner: "@vivalence",
        type: "hallucinator",
        slug: "foo",
    };
    export const provider = (mask) => [{ type: "dialogue", config: mask.config }];`,
  );
  await Deno.writeTextFile(
    `${tempDir}/bar.viva.js`,
    `export const manifest = {
        owner: "@vivalence",
        type: "hallucinator",
        slug: "bar",
    };
    export const provider = (mask) => [{ type: "speech", config: mask.config }];`,
  );

  await vip.mount(tempDir);

  // object queries → wrapped { service, mask }
  const paired = await vip.accioMany([
    { module: "@vivalence/hallucinator/foo", config: 1 },
    { module: "@vivalence/hallucinator/bar", config: 2 },
  ]);
  assert.assertEquals(paired.length, 2);
  assert.assertEquals(paired[0].service.manifest.slug, "foo");
  assert.assertEquals(paired[0].mask.config, 1);
  assert.assertEquals(paired[1].service.manifest.slug, "bar");
  assert.assertEquals(paired[1].mask.config, 2);

  // string queries → bare module (backward compat)
  const bare = await vip.accioMany(["@vivalence/hallucinator/foo"]);
  assert.assertEquals(bare.length, 1);
  assert.assertEquals(bare[0].manifest.slug, "foo");
  assert.assertEquals(bare[0].mask, undefined);
  assert.assertEquals(bare[0].service, undefined);

  // accioMap routes arrays through accioMany
  const mapped = await vip.accioMap({
    hallucinators: [
      { module: "@vivalence/hallucinator/foo", config: 10 },
      { module: "@vivalence/hallucinator/bar", config: 20 },
    ],
  });
  assert.assertEquals(mapped.hallucinators.length, 2);
  assert.assertEquals(mapped.hallucinators[0].mask.config, 10);
  assert.assertEquals(mapped.hallucinators[1].service.manifest.slug, "bar");

  await Deno.remove(tempDir, { recursive: true });
});

Deno.test("Vip: complete lifecycle with multiple modules", async () => {
  const vip = new Vip(paladin);
  const tempDir = await Deno.makeTempDir();

  await Deno.writeTextFile(
    `${tempDir}/auth.viva.js`,
    `export const manifest = { 
        owner: "@vivalence", 
        type: "service", 
        slug: "auth",
        version: "1.2.0"
    };
    export default () => "auth service";`,
  );

  await Deno.writeTextFile(
    `${tempDir}/button.viva.js`,
    `export const manifest = { 
        owner: "@ui", 
        type: "component", 
        slug: "button",
        version: "2.1.0"
    };
    export default () => "button component";`,
  );

  await vip.mount(tempDir);

  // Test accioMany
  const modules = await vip.accioMany([
    "@vivalence/service/auth",
    "@ui/component/button",
  ]);
  assert.assertEquals(modules.length, 2);
  assert.assertEquals(modules[0].manifest.slug, "auth");

  // Test accioMap with nested structure
  const moduleMap = await vip.accioMap({
    auth: "@vivalence/service/auth",
    ui: {
      button: "@ui/component/button",
    },
  });

  assert.assertEquals(moduleMap.auth.manifest.owner, "@vivalence");
  assert.assertEquals(moduleMap.ui.button.manifest.type, "component");

  await Deno.remove(tempDir, { recursive: true });
});
