import { assertEquals, assert } from "@std/assert";
import { entities } from "../dataset/entities/index.js";

const { symbol, literal } = entities;
const slugs = (rows) => rows.map((row) => row.slug);
const duplicates = (rows) => slugs(rows).filter((slug, index, all) => all.indexOf(slug) !== index);
const referenced = new Set(literal.flatMap((row) => row.symbols.map((ref) => ref.slug)));
const declared = new Set(slugs(symbol));

Deno.test("219 words, 50 sentences, 242 symbols", () => {
  assertEquals(literal.filter((row) => row.slug.includes(".")).length, 219);
  assertEquals(literal.filter((row) => !row.slug.includes(".")).length, 50);
  assertEquals(symbol.length, 242);
});

Deno.test("no duplicate slugs", () => {
  assertEquals(duplicates(literal), []);
  assertEquals(duplicates(symbol), []);
});

Deno.test("every referenced symbol is declared, every declared symbol is used", () => {
  assertEquals([...referenced].filter((slug) => !declared.has(slug)), []);
  assertEquals([...declared].filter((slug) => !referenced.has(slug)), []);
});

Deno.test("roots are TOPOGRAPHICAL and every literal carries exactly one", () => {
  const roots = symbol.filter((row) => row.traits.includes("TOPOGRAPHICAL"));
  assertEquals(slugs(roots).sort(), ["sentence", "word"]);
  for (const row of literal) {
    const carried = row.symbols.filter((ref) => ref.slug === "word" || ref.slug === "sentence");
    assertEquals(carried.length, 1, row.slug);
  }
});

Deno.test("grammatical facets are ONTOLOGICAL, groupings STRUCTURAL", () => {
  for (const row of symbol) {
    if (/^word\.(part-of-speech|gender|lemma)\./.test(row.slug))
      assert(row.traits.includes("ONTOLOGICAL"), row.slug);
    if (/^(topic|level)\./.test(row.slug)) assert(row.traits.includes("STRUCTURAL"), row.slug);
  }
});

Deno.test("freight assets exist for every VOCALIZED and DEPICTED literal", async () => {
  const carried = literal.flatMap((row) =>
    ["VOCALIZED", "DEPICTED"].filter((trait) => row.traits.includes(trait)).map((trait) => row.trait[trait].asset.path)
  );
  assertEquals(carried.length, 20);
  for (const path of carried) {
    const file = new URL(`../dataset/freight/${path}`, import.meta.url);
    assert((await Deno.stat(file)).isFile, path);
  }
});
