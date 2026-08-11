import { specimen, object } from "@vivalence/typology";
import { topography } from "@vivalence/typology/scenarios";
import paladin from "@vivalence/paladin";

let corpus;

specimen.beforeAll(async () => (corpus = await topography.corpus()));

specimen.describe("reading a topography off disk", () => {
  specimen.it("walks the words tree, reaches the default export, and skips index.js", async () => {
    const rows = await paladin.find.data(`${corpus.dirname}/dataset/literals/words`);
    specimen.expect(rows.map((row) => row.slug).sort())
      .toEqual(["casa.noun", "del.contraction", "parlare.verb"]);
  });

  specimen.it("never descends a bak/ tree, which the first draft's walker did", async () => {
    await Deno.mkdir(`${corpus.dirname}/dataset/literals/words/bak`, { recursive: true });
    await Deno.writeTextFile(
      `${corpus.dirname}/dataset/literals/words/bak/old.js`,
      `export default [{ slug: "ghost" }];\n`,
    );
    const rows = await paladin.find.data(`${corpus.dirname}/dataset/literals/words`);
    specimen.expect(rows.map((row) => row.slug)).not.toContain("ghost");
  });

  specimen.it("reads an emitted json corpus through the same walk", async () => {
    await Deno.mkdir(`${corpus.dirname}/emitted`, { recursive: true });
    await Deno.writeTextFile(
      `${corpus.dirname}/emitted/nouns.json`,
      JSON.stringify(topography.nouns, null, 2),
    );
    const rows = await paladin.find.data(`${corpus.dirname}/emitted`);
    specimen.expect(rows.map((row) => row.slug)).toEqual(["casa.noun", "del.contraction"]);
  });
});

specimen.describe("writing files that are a pure function of the rows", () => {
  const canonical = (rows) =>
    JSON.stringify(object.ordered([...rows].sort((a, b) => (a.slug < b.slug ? -1 : 1))), null, 2) + "\n";

  specimen.it("emits the same bytes regardless of the order the rows arrived in", () => {
    specimen.expect(canonical(topography.nouns)).toBe(canonical([...topography.nouns].reverse()));
  });

  specimen.it("reaches a fixpoint — a second write of unchanged rows touches nothing", async () => {
    const target = `${corpus.dirname}/out/symbols.json`;
    const text = canonical(topography.structural);
    specimen.expect(await paladin.state.scribe(target, text)).toBe(true);
    specimen.expect(await paladin.state.scribe(target, text)).toBe(false);
    specimen.expect(await paladin.state.scribe(target, canonical([...topography.structural].reverse()))).toBe(false);
  });

  specimen.it("round-trips EVERY write codec back through find.data — no one-way doors", async () => {
    const { Datasink } = await import("@vivalence/typology");
    for (const [named, extension] of [["json", "json"], ["js", "js"], ["jsonl", "jsonl"]]) {
      const dirname = `${corpus.dirname}/codec-${named}`;
      await paladin.state.scribe(`${dirname}/rows.${extension}`, Datasink.canonical(topography.nouns, named));
      const reloaded = await paladin.find.data(dirname);
      specimen.expect(reloaded.map((row) => row.slug)).toEqual(["casa.noun", "del.contraction"]);
    }
  });

  specimen.it("round-trips through the reader it will be re-installed by", async () => {
    const target = `${corpus.dirname}/out/literals.json`;
    await paladin.state.scribe(target, canonical(topography.nouns));
    const reloaded = await paladin.read.json(target);
    specimen.expect(reloaded.map((row) => row.slug)).toEqual(["casa.noun", "del.contraction"]);
  });
});
