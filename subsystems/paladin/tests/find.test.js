import { assertEquals } from "$std/assert";
import { Path, Env } from "@vivalence/typology";
import { Paladin as Config } from "@vivalence/paladin/prototype";

Deno.test("Config: find returns paths", async () => {
  const tmpDir = await Deno.makeTempDir();
  const env = new Env({ VIVA_TILDE_MOUNT: tmpDir });

  await Deno.writeTextFile(`${tmpDir}/test.viva.js`, "export default {};");

  const config = new Config();
  config.env = env;

  const files = await config.find.viva(new Path(tmpDir));
  assertEquals(files.length, 1);
  assertEquals(files[0].absolute.endsWith("test.viva.js"), true);

  await Deno.remove(tmpDir, { recursive: true });
});

Deno.test("Config: find finds any viva", async () => {
  const tmpDir = new Path(await Deno.makeTempDir());

  const hallucinate = ([destination, content]) =>
    Deno.writeTextFile(tmpDir.branch(destination).absolute, content);

  await Promise.all(
    [
      [`/default.viva.js`, "export default {};"],
      [`/function.viva.js`, "export default (f) => ({f});"],
      [
        `/manifested.viva.js`,
        `export {manifest:{type:"temporary",slug:"test"}};`,
      ],
      [`/test.viva.org`, "* imperative TODO"],
      [`/test.viva.svelte`, "<link>tiny.cc/419t001</link>"],
    ].map(hallucinate),
  );

  const config = new Config();
  config.env = new Env({ VIVA_VIP_MOUNT: tmpDir.segment });
  const files = await config.find.viva(tmpDir.segment);

  assertEquals(files.length, 5);
  assertEquals(
    files.every((f) => f instanceof Path),
    true,
  );
  assertEquals(
    files.every((f) => /\.viva\.(js|org|svelte)$/.test(f.absolute)),
    true,
  );

  await Deno.remove(tmpDir.segment, { recursive: true });
});
