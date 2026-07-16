// ── temporary test ──────────────────────────────────────────
// verifies that resolveSymbols on LiteralRepository correctly
// rewrites symbol sugar into native MikroORM m:n queries.

import { specimen } from "@vivalence/typology";
import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import {
  LiteralEntity,
  SymbolEntity,
} from "@vivalence/typology/entities";
import { LiteralDomain, SymbolDomain } from "../scenarios/fixtures.js";

specimen.describe("symbols: m:n slug query", () => {
  let orm, em, repo;
  let hello, goodbye, orphan;
  let greetingSym, farewellSym;

  specimen.beforeAll(async () => {
    orm = await MikroORM.init({
      driver: SqliteDriver,
      dbName: ":memory:",
      entities: [LiteralDomain, SymbolDomain],
      allowGlobalContext: true,
    });
    await orm.schema.refreshDatabase();
    em = orm.em;

    greetingSym = em.create(SymbolEntity, { slug: "greeting", traits: [], trait: {} });
    farewellSym = em.create(SymbolEntity, { slug: "farewell", traits: [], trait: {} });
    await em.flush();

    hello = em.create(LiteralEntity, {
      slug: "hello",
      traits: ["TRANSLATED"],
      trait: { TRANSLATED: { known: "hello", learning: "olá" } },
      symbol: { word: true },
    });
    goodbye = em.create(LiteralEntity, {
      slug: "goodbye",
      traits: ["TRANSLATED"],
      trait: { TRANSLATED: { known: "goodbye", learning: "tchau" } },
      symbol: { word: true },
    });
    orphan = em.create(LiteralEntity, {
      slug: "orphan",
      traits: ["TRANSLATED"],
      trait: { TRANSLATED: { known: "orphan", learning: "órfão" } },
      symbol: { word: true },
    });
    await em.flush();

    hello.symbols.add(greetingSym);
    hello.symbols.add(farewellSym);
    goodbye.symbols.add(greetingSym);
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
