import { specimen, Span, trace, Twitch, Dataset } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { topography } from "@vivalence/typology/scenarios";
import { traits } from "@vivalence/runtime";
const { DATASET } = traits.mode;

let scenario, daemon, mode;

specimen.beforeAll(async () => {
  scenario = await datamap.seed();
  daemon = {
    entities: scenario.repos,
    datamap: { getMetadata: () => scenario.orm.getMetadata() },
    twitch: new Twitch(),
  };
  daemon.entities.em = scenario.em;

  const corpus = await topography.corpus();
  mode = {
    manifest: { type: "topography", slug: "fixture", traits: [] },
    id: scenario.fixtures.mode.id,
    stdout: new Span("mode/topography/fixture"),
    entity: { installed: "" },
    module: { source: corpus, dataset: topography.dataset() },
  };

  await DATASET(mode, daemon);
});

specimen.afterAll(async () => await scenario.orm.close());

specimen.describe("what install put in the database", () => {
  specimen.it("upserts every declared row of every declared type", async () => {
    const symbols = await scenario.repos.symbol.find({ slug: { $like: "proficiency.%" } });
    specimen.expect(symbols.map((row) => row.slug).sort())
      .toEqual(["proficiency.cefr.a1", "proficiency.survival"]);

    const literals = await scenario.repos.literal.find({ slug: { $like: "%.noun" } });
    specimen.expect(literals.map((row) => row.slug)).toEqual(["casa.noun"]);
  });

  specimen.it("mints symbols that were referenced but never declared — the lemma path", async () => {
    const lemmas = await scenario.repos.symbol.find({ slug: { $like: "word.lemma.%" } });
    specimen.expect(lemmas.map((row) => row.slug).sort())
      .toEqual(["word.lemma.casa", "word.lemma.del", "word.lemma.parlare"]);
  });

  specimen.it("links both directions of the relation, not just the declared side", async () => {
    const casa = await scenario.repos.literal.findOne({ slug: "casa.noun" }, { populate: ["symbols"] });
    specimen.expect(casa.symbols.getItems().map((ref) => ref.slug).sort())
      .toEqual(["proficiency.cefr.a1", "word", "word.lemma.casa", "word.part-of-speech.noun"]);

    const lemma = await scenario.repos.symbol.findOne({ slug: "word.lemma.casa" }, { populate: ["literals"] });
    specimen.expect(lemma.literals.getItems().map((ref) => ref.slug).sort())
      .toEqual(["casa.noun", "la-casa-e-grande"]);
  });

  specimen.it("derives the symbol tree on the literal from the symbols it got linked to", async () => {
    const casa = await scenario.repos.literal.findOne({ slug: "casa.noun" });
    specimen.expect(casa.symbol).toEqual({
      word: { "part-of-speech": "noun", lemma: "casa" },
      proficiency: { cefr: "a1" },
    });
  });

  specimen.it("does not persist relation props as scalar columns", async () => {
    const casa = await scenario.repos.literal.findOne({ slug: "casa.noun" });
    specimen.expect(casa.toJSON().symbols).not.toEqual([{ slug: "word" }]);
  });

  specimen.it("skips the aggregating index.js, so the words tree is not double-counted", async () => {
    const words = await scenario.repos.literal.find({ slug: { $in: ["casa.noun", "parlare.verb"] } });
    specimen.expect(words.length).toBe(2);
  });
});

specimen.describe("what install wrote on the mode's stdout", () => {
  specimen.it("one sealed install span, one sealed child per phase, each phase's last note its { done, total }", () => {
    const [install] = trace.chronicle(mode.stdout.records).roots;
    specimen.expect(install.path).toBe("/mode/topography/fixture/install");
    specimen.expect(trace.duration(install)).not.toBe(null);
    specimen.expect(install.children.map((phase) => phase.nature)).toEqual(["symbol", "literal", "literal.symbols"]);
    specimen.expect(install.children.every((phase) => trace.duration(phase) !== null)).toBe(true);
    specimen.expect(install.children.every((phase) => phase.entries.at(-1).data.done === phase.entries.at(-1).data.total)).toBe(true);
  });
});

specimen.describe("what install refuses", () => {
  specimen.it("is inert on an already-installed mode", async () => {
    const before = await scenario.repos.symbol.count({});
    await DATASET({ ...mode, entity: { installed: "installed" } }, daemon);
    specimen.expect(await scenario.repos.symbol.count({})).toBe(before);
  });

  specimen.it("throws rather than installing anything outside the dataspace", async () => {
    const userspace = {
      ...mode,
      entity: { installed: "" },
      module: {
        ...mode.module,
        dataset: new Dataset({ schema: {}, thread: [[{ slug: "leak" }]] }),
      },
    };
    await specimen.expect(DATASET(userspace, daemon)).rejects.toThrow(/non-dataspace/);
    specimen.expect(await scenario.repos.thread.count({})).toBe(0);
    specimen.expect(trace.chronicle(userspace.stdout.records).roots.at(-1).fault.message).toMatch(/non-dataspace/);
  });
});

specimen.describe("what install does with a loader", () => {
  specimen.it("pulls rows from load(mode), links them, and stamp() folds the loader's stamp", async () => {
    const { gestalten, lifecycle } = await import("@vivalence/runtime");
    const { DATASET } = traits.mode;
    const { stamp } = traits.mode;
    let mark = "one";
    const loaded = {
      ...mode,
      slug: "loaded",
      entity: { installed: "" },
      module: {
        mount: mode.module.source,
        dataset: new Dataset({
          symbol: { load: async () => [{ slug: "jd.id.22.04", traits: ["STRUCTURAL"], trait: {} }], stamp: async () => mark },
          literal: { load: async () => [{ slug: "22.04.re.pdf", ontology: "jd", traits: [], trait: {}, symbols: [{ slug: "jd.id.22.04" }] }] },
        }),
      },
    };
    await DATASET(loaded, daemon);
    const row = await scenario.repos.literal.findOne({ slug: "22.04.re.pdf" }, { populate: ["symbols"] });
    specimen.expect(row.symbols.getItems().map((ref) => ref.slug)).toEqual(["jd.id.22.04"]);
    specimen.expect(row.symbol).toEqual({ jd: { id: { "22": "04" } } });
    const before = await stamp(loaded);
    mark = "two";
    specimen.expect(await stamp(loaded)).not.toBe(before);
  });
});
