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
