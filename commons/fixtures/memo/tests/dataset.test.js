import { specimen } from "@vivalence/typology";
import { entities } from "../dataset/entities/index.js";

const { describe, it, expect } = specimen;

const { symbol, literal } = entities;
const slugs = (rows) => rows.map((row) => row.slug);
const duplicates = (rows) => slugs(rows).filter((slug, index, all) => all.indexOf(slug) !== index);
const referenced = new Set(literal.flatMap((row) => row.symbols.map((reference) => reference.slug)));
const declared = new Set(slugs(symbol));

describe("the Latin core — the rows DATASET installs", () => {
  it("219 words, 50 sentences, 242 symbols", () => {
    expect(literal.filter((row) => row.slug.includes(".")).length).toBe(219);
    expect(literal.filter((row) => !row.slug.includes(".")).length).toBe(50);
    expect(symbol.length).toBe(242);
  });

  it("no slug twice", () => {
    expect([duplicates(literal), duplicates(symbol)]).toEqual([[], []]);
  });

  it("every referenced symbol is declared, every declared symbol is used", () => {
    expect([...referenced].filter((slug) => !declared.has(slug))).toEqual([]);
    expect([...declared].filter((slug) => !referenced.has(slug))).toEqual([]);
  });

  it("the roots are TOPOGRAPHICAL and every literal carries exactly one", () => {
    expect(slugs(symbol.filter((row) => row.traits.includes("TOPOGRAPHICAL"))).sort()).toEqual(["sentence", "word"]);
    expect(literal.filter((row) => row.symbols.filter((reference) => ["word", "sentence"].includes(reference.slug)).length !== 1)).toEqual([]);
  });

  it("grammatical facets are ONTOLOGICAL, groupings STRUCTURAL", () => {
    const grammatical = symbol.filter((row) => /^word\.(part-of-speech|gender|lemma)\./.test(row.slug));
    const groupings = symbol.filter((row) => /^(topic|level)\./.test(row.slug));
    expect(grammatical.filter((row) => !row.traits.includes("ONTOLOGICAL"))).toEqual([]);
    expect(groupings.filter((row) => !row.traits.includes("STRUCTURAL"))).toEqual([]);
  });

  it("ten sentences are VOCALIZED, ten nouns DEPICTED, every asset on disk under files/", async () => {
    const carried = literal.flatMap((row) => ["VOCALIZED", "DEPICTED"].filter((trait) => row.traits.includes(trait)).map((trait) => [trait, row.trait[trait].asset.path]));
    expect([carried.filter(([trait]) => trait === "VOCALIZED").length, carried.filter(([trait]) => trait === "DEPICTED").length]).toEqual([10, 10]);
    for (const [, path] of carried) expect([path, (await Deno.stat(new URL(`../dataset/files/${path}`, import.meta.url))).isFile]).toEqual([path, true]);
  });

  it("every literal is TRANSLATED and RANKED, ranks unique — the deck deals untouched cards by rank", () => {
    expect(literal.filter((row) => !row.traits.includes("TRANSLATED") || !row.traits.includes("RANKED"))).toEqual([]);
    expect(new Set(literal.map((row) => row.trait.RANKED.rank)).size).toBe(literal.length);
  });
});
