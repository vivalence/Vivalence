import { specimen } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { LiteralEntity } from "@vivalence/runtime";

specimen.describe("symbols: m:n slug query", () => {
  let orm, em, repo;
  let hello, goodbye, orphan;
  let greetingSym, farewellSym;

  specimen.beforeAll(async () => {
    const scenario = await datamap.seed();
    orm = scenario.orm;
    em = scenario.em;
    const { mode } = scenario.fixtures;

    greetingSym = scenario.fixtures.symbol;
    farewellSym = scenario.repos.symbol.create({ slug: "farewell", mode, traits: [], trait: {} });
    await em.flush();

    hello = scenario.fixtures.hello;
    goodbye = scenario.fixtures.goodbye;
    const wordSym = scenario.repos.symbol.create({ slug: "word", mode, traits: ["TOPOGRAPHICAL"], trait: {} });
    hello.symbols.add(wordSym);
    goodbye.symbols.add(wordSym);
    hello.assign({ updatedAt: new Date() });
    goodbye.assign({ updatedAt: new Date() });
    orphan = scenario.repos.literal.create({
      slug: "orphan",
      mode,
      traits: ["TRANSLATED"],
      trait: { TRANSLATED: { known: "orphan", learning: "órfão" } },
      symbol: { word: true },
    });
    await em.flush();

    hello.symbols.add(farewellSym);
    await em.flush();

    repo = em.getRepository(LiteralEntity);
  });

  specimen.afterAll(async () => {
    await orm.close();
  });

  // bare array sugar → $all
  specimen.it("bare array sugar: symbols: ['greeting']", async () => {
    const results = await repo.find({ symbols: ["greeting"] });
    specimen.expect(results.length).toBe(2);
  });

  // direct slug on relation
  specimen.it("symbols: { slug }", async () => {
    const results = await repo.find({ symbols: { slug: "greeting" } });
    specimen.expect(results.length).toBe(2);
  });

  // $in
  specimen.it("symbols: { slug: { $in } }", async () => {
    const results = await repo.find({ symbols: { slug: { $in: ["greeting"] } } });
    specimen.expect(results.length).toBe(2);
  });

  // $all with multiple — must match ALL
  specimen.it("$all: multiple symbols", async () => {
    const results = await repo.find({ symbols: ["greeting", "farewell"] });
    specimen.expect(results.length).toBe(1);
    specimen.expect(results[0].slug).toBe("hello");
  });

  // $none — exclude
  specimen.it("$none excludes by symbol slug", async () => {
    const results = await repo.find({ symbols: { $none: ["greeting"] } });
    specimen.expect(results.length).toBe(1);
    specimen.expect(results[0].slug).toBe("orphan");
  });

  // combined: symbol + column filter
  specimen.it("symbol slug + column filter", async () => {
    const results = await repo.find({
      symbols: ["greeting"],
      slug: "hello",
    });
    specimen.expect(results.length).toBe(1);
    specimen.expect(results[0].slug).toBe("hello");
  });

  // raw ID passthrough
  specimen.it("symbols: id passthrough", async () => {
    const results = await repo.find({ symbols: greetingSym.id });
    specimen.expect(results.length).toBe(2);
  });

  // JSON column + symbol slug
  specimen.it("symbol slug + JSON column filter", async () => {
    const results = await repo.find({
      symbols: ["greeting"],
      symbol: { word: true },
    });
    specimen.expect(results.length).toBe(2);
  });
});
