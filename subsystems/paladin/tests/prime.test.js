import { assertEquals } from "@std/assert";
import { Path, shape } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

Deno.test("paladin prime — a directory is a Primer, the frontmatter sniffed per file", async (t) => {
  const root = await Deno.makeTempDir();
  await Deno.mkdir(`${root}/guides`);
  await Deno.mkdir(`${root}/skills/render`, { recursive: true });
  await Deno.writeTextFile(`${root}/format.md`, "The dock renders markdown.");
  await Deno.writeTextFile(`${root}/guides/draw.md`, "---\nvalence: How to draw a page\nload: lazy\n---\nHOUSE RULES");
  await Deno.writeTextFile(`${root}/skills/render/SKILL.md`, "---\nname: render\ndescription: >-\n  Render a page,\n  folded\nlicense: MIT\n---\nSKILL BODY");
  await Deno.writeTextFile(`${root}/notes.txt`, "not a primer file");

  const primer = await paladin.prime.directory(new Path(root));

  await t.step("no frontmatter is eager text; ours is the pattern; the standard's description is the valence, lazy", async () => {
    assertEquals(await shape.primer.load(primer), {
      format: "The dock renders markdown.",
      primer: "Read on demand with primer_read { nature }:\nguides/draw — How to draw a page\nskills/render/SKILL — Render a page, folded",
    });
  });

  await t.step("a body is read per call — an edit shows on the next read, no restart", async () => {
    assertEquals(await shape.primer.read(primer, "guides/draw"), "HOUSE RULES");
    await Deno.writeTextFile(`${root}/guides/draw.md`, "---\nvalence: How to draw a page\nload: lazy\n---\nHOUSE RULES, revised");
    assertEquals(await shape.primer.read(primer, "guides/draw"), "HOUSE RULES, revised");
    assertEquals(await shape.primer.read(primer, "skills/render/SKILL"), "SKILL BODY");
  });

  await t.step("read.frontmatter splits a file; a file without frontmatter is all body", async () => {
    assertEquals(await paladin.read.frontmatter(`${root}/format.md`), { attrs: {}, body: "The dock renders markdown." });
    assertEquals((await paladin.read.frontmatter(`${root}/skills/render/SKILL.md`)).attrs.name, "render");
  });

  await Deno.remove(root, { recursive: true });
});
