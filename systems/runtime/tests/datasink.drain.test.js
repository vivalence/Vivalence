import { specimen, sleep, Vector, shape, shard } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { topography } from "@vivalence/typology/scenarios";
import { LiteralEntity } from "@vivalence/runtime";
import paladin from "@vivalence/paladin";
import { DATASET, DATASINK, stagger } from "../daemon/traits/index.js";

let scenario, daemon, mode, arm, first;

const read = (target) => paladin.read.json(`${mode.module.mount.dirname}/${target}`);

specimen.beforeAll(async () => {
  scenario = await datamap.seed();
  daemon = {
    entities: scenario.repos,
    datamap: { introspect: () => scenario.orm.getMetadata() },
    twitch: new Vector(),
  };
  daemon.entities.em = scenario.em;
  daemon.twitch.branch("/after").use(shard.datamap.detached(scenario));

  const corpus = await topography.corpus();
  mode = {
    type: "topography",
    slug: "fixture",
    entity: { installed: false },
    module: { mount: corpus, dataset: topography.dataset(), datasink: topography.datasink() },
  };

  await DATASET(mode, daemon);
  arm = DATASINK(mode, daemon).finalize;
  first = await mode.datasink.drain({ all: true });
});

specimen.afterAll(async () => await scenario.orm.close());

specimen.describe("the drain — daemon rows back out to registry files", () => {
  specimen.it("writes one file per declared sink, and the split binds its capture", async () => {
    specimen.expect(first.drained.sort()).toEqual(["literal", "symbol"]);
    specimen.expect(first.written).toBeGreaterThan(0);

    specimen.expect((await read("dataset/symbols/structural.json")).map((row) => row.slug))
      .toEqual(["proficiency.cefr.a1", "proficiency.survival"]);
    specimen.expect((await read("dataset/symbols/ontological.json")).map((row) => row.slug))
      .toEqual(["word.suffix.are"]);
    specimen.expect((await read("dataset/literals/words/noun.json")).map((row) => row.slug))
      .toEqual(["casa.noun"]);
    specimen.expect((await read("dataset/literals/sentences.json")).map((row) => row.slug))
      .toEqual(["la-casa-e-grande"]);
  });

  specimen.it("writes a dual-capture row to BOTH files rather than picking one", async () => {
    specimen.expect((await read("dataset/literals/words/adposition.json")).map((row) => row.slug))
      .toEqual(["del.contraction"]);
    specimen.expect((await read("dataset/literals/words/determiner.json")).map((row) => row.slug))
      .toEqual(["del.contraction"]);
  });

  specimen.it("drains the minted lemma symbols that were declared in no file", async () => {
    const lemmas = await read("dataset/symbols/lemmas.json");
    specimen.expect(lemmas.map((row) => row.slug))
      .toEqual(["word.lemma.casa", "word.lemma.del", "word.lemma.parlare"]);
    specimen.expect(lemmas.find((row) => row.slug === "word.lemma.casa").literals)
      .toEqual([{ slug: "casa.noun" }, { slug: "la-casa-e-grande" }]);
  });

  specimen.it("emits the authored shape and nothing else — no derived columns, no ORM inverses", async () => {
    const allowed = new Set(["slug", "traits", "trait", "symbols", "literals", "uses", "in"]);
    for (const target of ["dataset/symbols/lemmas.json", "dataset/literals/words/noun.json"])
      for (const row of await read(target))
        for (const key of Object.keys(row)) specimen.expect(allowed.has(key)).toBe(true);

    const noun = (await read("dataset/literals/words/noun.json"))[0];
    specimen.expect(Object.keys(noun).sort()).toEqual(["slug", "symbols", "trait", "traits"]);
    specimen.expect((await read("dataset/symbols/lemmas.json"))[0].traits).toBe(undefined);
  });

  specimen.it("counts rows no sink claims as orphans instead of losing them silently", () => {
    specimen.expect(first.orphans.literal).toBe(2);
    specimen.expect(first.orphans.symbol).toBeGreaterThan(0);
  });

  specimen.it("reaches a fixpoint — a second drain over unchanged state writes nothing", async () => {
    const second = await mode.datasink.drain({ all: true });
    specimen.expect(second.written).toBe(0);
    specimen.expect(second.orphans).toEqual(first.orphans);
  });
});

specimen.describe("the twitch gate", () => {
  specimen.it("marks nothing dirty until the finalizer arms it, then goes incremental", async () => {
    scenario.em.getEventManager().registerSubscriber(shape.subscriber(daemon.twitch));

    scenario.em.create(LiteralEntity, { slug: "pre-arm", trait: {}, symbol: {} });
    await scenario.em.flush();
    await sleep.ms(5);

    const unarmed = await mode.datasink.drain({});
    specimen.expect(unarmed.drained.sort()).toEqual(["literal", "symbol"]);

    arm();

    scenario.em.create(LiteralEntity, { slug: "post-arm", trait: {}, symbol: {} });
    await scenario.em.flush();
    await sleep.ms(5);

    const incremental = await mode.datasink.drain({});
    specimen.expect(incremental.drained).toEqual(["literal"]);

    await sleep.ms(1600);
  });

  specimen.it("hands the daemon a terminator, so a pending settle cannot outlive the datamap", async () => {
    const collected = [];
    const staggered = {
      ...mode,
      slug: "terminable",
      traits: ["DATASINK"],
      terminators: collected,
      entity: { installed: false },
    };
    const finalizers = await stagger(staggered, daemon, { DATASINK });

    specimen.expect(finalizers.length).toBe(1);
    specimen.expect(staggered.terminators.length).toBe(1);

    let drained = 0;
    const guarded = staggered.datasink.drain;
    staggered.datasink.drain = (input) => (drained++, guarded(input));

    finalizers[0]();
    scenario.em.create(LiteralEntity, { slug: "terminated", trait: {}, symbol: {} });
    await scenario.em.flush();
    await sleep.ms(5);

    staggered.terminators[0]();
    await sleep.ms(1600);
    specimen.expect(drained).toBe(0);
  });
});
