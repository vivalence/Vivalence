import { assertEquals } from "$std/assert";
import { Path, Env } from "@vivalence/typology";
import { Paladin as Config } from "@vivalence/paladin/prototype";

Deno.test("Config: join creates Path instances", async () => {
  const env = new Env({ VIVA_TILDE_MOUNT: "/tmp/test" });
  const config = new Config();
  config.env = env;

  const variantPath = config.join.variant.env();
  assertEquals(variantPath instanceof Path, true);
  assertEquals(variantPath.absolute, "/tmp/test/variant/environment");
});

Deno.test("Config: read integrates with join", async () => {
  const tmpDir = await Deno.makeTempDir();
  const env = new Env({ VIVA_TILDE_MOUNT: tmpDir });
  await Deno.writeTextFile(`${tmpDir}/test.json`, '{"test": true}');
  const config = new Config();
  config.env = env;

  const content = await config.read.json(`${tmpDir}/test.json`);
  assertEquals(content.test, true);

  await Deno.remove(tmpDir, { recursive: true });
});
