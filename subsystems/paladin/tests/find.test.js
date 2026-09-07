import { assert, assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";

Deno.test("paladin find — describe · index · the ignore list", async (t) => {
  const root = await Deno.makeTempDir();
  await Deno.mkdir(`${root}/20-29_a/22_b`, { recursive: true });
  await Deno.mkdir(`${root}/bak`);
  await Deno.mkdir(`${root}/old.bak`);
  await Deno.mkdir(`${root}/template`);
  await Deno.writeTextFile(`${root}/20-29_a/22_b/x.md`, "x");
  await Deno.writeTextFile(`${root}/readme.org`, "r");
  await Deno.writeTextFile(`${root}/bak/stale.md`, "s");
  await Deno.writeTextFile(`${root}/old.bak/stale.md`, "s");
  await Deno.writeTextFile(`${root}/template/t.md`, "t");
  await Deno.writeTextFile(`${root}/.DS_Store`, "");

  await t.step("describe stats one file, null for what is not a file", async () => {
    const file = await paladin.find.describe(root, "20-29_a/22_b/x.md");
    assertEquals(Object.keys(file), ["path", "format", "bytes", "mtime"]);
    assertEquals(file.path, "20-29_a/22_b/x.md");
    assertEquals(file.format, "md");
    assertEquals(file.bytes, 1);
    assert(file.mtime);
    assertEquals(await paladin.find.describe(root, "20-29_a"), null);
    assertEquals(await paladin.find.describe(root, "missing.md"), null);
  });

  await t.step("index walks the root sorted under the house list", async () => {
    const files = await paladin.find.index(root);
    assertEquals(files.map((file) => file.path), ["20-29_a/22_b/x.md", "readme.org", "template/t.md"]);
  });

  await t.step("a caller's list is the whole list — nothing is unioned in", async () => {
    assertEquals(
      (await paladin.find.index(root, ["template", "bak", "*.bak", ".DS_Store"])).map((file) => file.path),
      ["20-29_a/22_b/x.md", "readme.org"],
    );
    assertEquals(
      (await paladin.find.index(root, ["template"])).map((file) => file.path),
      [".DS_Store", "20-29_a/22_b/x.md", "bak/stale.md", "old.bak/stale.md", "readme.org"],
    );
  });

  await t.step("skip compiles the list once and answers names", () => {
    const skipped = paladin.find.skip(["*.bak", "tmp"]);
    assertEquals([skipped("x.bak"), skipped("tmp"), skipped("bak"), skipped(".bak.md")], [true, true, false, false]);
  });

  await Deno.remove(root, { recursive: true });
});
