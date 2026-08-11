import { specimen, Vector, Dataset } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { topography } from "@vivalence/typology/scenarios";
import { DATASET } from "../daemon/traits/index.js";

let scenario, daemon, mode;

specimen.beforeAll(async () => {
  scenario = await datamap.seed();
  daemon = {
    entities: scenario.repos,
    datamap: { introspect: () => scenario.orm.getMetadata() },
    twitch: new Vector(),
  };
  daemon.entities.em = scenario.em;

  const corpus = await topography.corpus();
  mode = {
    type: "topography",
    slug: "fixture",
    entity: { installed: false },
    module: { mount: corpus, dataset: topography.dataset() },
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

  specimen.it("does not persist relation props as scalar columns", async () => {
    const casa = await scenario.repos.literal.findOne({ slug: "casa.noun" });
    specimen.expect(casa.toJSON().symbols).not.toEqual([{ slug: "word" }]);
  });

  specimen.it("skips the aggregating index.js, so the words tree is not double-counted", async () => {
    const words = await scenario.repos.literal.find({ slug: { $in: ["casa.noun", "parlare.verb"] } });
    specimen.expect(words.length).toBe(2);
  });
});

specimen.describe("what install refuses", () => {
  specimen.it("is inert on an already-installed mode", async () => {
    const before = await scenario.repos.symbol.count({});
    await DATASET({ ...mode, entity: { installed: true } }, daemon);
    specimen.expect(await scenario.repos.symbol.count({})).toBe(before);
  });

  specimen.it("throws rather than installing anything outside the dataspace", async () => {
    const userspace = {
      ...mode,
      entity: { installed: false },
      module: {
        ...mode.module,
        dataset: new Dataset({ schema: {}, thread: [[{ slug: "leak" }]] }),
      },
    };
    await specimen.expect(DATASET(userspace, daemon)).rejects.toThrow(/non-dataspace/);
    specimen.expect(await scenario.repos.thread.count({})).toBe(0);
  });
});
