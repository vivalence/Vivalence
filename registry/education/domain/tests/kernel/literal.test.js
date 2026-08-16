import { specimen } from "@vivalence/typology";
import { seed } from "../../../../fixtures/data/seed.js";
import { rankOf, UNRANKED } from "../../entities/kernel/Literal.ts";

let scenario;
let em;
let literal;
let user;

const context = () => ({ daemon: { entities: scenario.entities }, user: { id: user.id }, mode: null, thread: null });

const word = (slug, trait = {}, extra = {}) =>
  em.create(scenario.entities.literal.getEntityName(), {
    slug,
    ontology: "word",
    traits: Object.keys(trait),
    trait: { TRANSLATED: { known: slug, learning: slug }, ...trait },
    symbol: {},
    ...extra,
  });

specimen.beforeAll(async () => {
  scenario = await seed();
  em = scenario.em;
  literal = scenario.entities.literal;
  user = scenario.fixtures.user;
});

specimen.afterAll(async () => await scenario.orm.close());

specimen.describe("rank — the column every pick orders by", () => {
  specimen.it("follows RANKED.rank when it is a real rank (≥ 1)", () => {
    specimen.expect(rankOf({ RANKED: { rank: 44, zipf: 6.1, fpm: 1250 } })).toBe(44);
    specimen.expect(rankOf({ RANKED: { rank: 1 } })).toBe(1);
  });

  specimen.it("treats rank 0 / negative / missing as NOT a rank — derives from zipf (10^(9−zipf)) or falls to UNRANKED", () => {
    specimen.expect(rankOf({ RANKED: { rank: 0, zipf: 5.6, fpm: 402 } })).toBe(Math.round(10 ** (9 - 5.6)));
    specimen.expect(rankOf({ RANKED: { rank: 0, zipf: 1.36, fpm: 0.0229 } })).toBe(Math.round(10 ** (9 - 1.36)));
    specimen.expect(rankOf({ RANKED: { rank: -3 } })).toBe(UNRANKED);
    specimen.expect(rankOf({ RANKED: {} })).toBe(UNRANKED);
    specimen.expect(rankOf({ TRANSLATED: { known: "x", learning: "y" } })).toBe(UNRANKED);
    specimen.expect(rankOf(undefined)).toBe(UNRANKED);
  });

  specimen.it("is stamped on create AND on every update from the trait, never from the caller", async () => {
    const entity = word("rank.create", { RANKED: { rank: 7, zipf: 7, fpm: 10000 } });
    await em.flush();
    specimen.expect(entity.rank).toBe(7);

    entity.trait = { ...entity.trait, RANKED: { rank: 3, zipf: 7.5, fpm: 30000 } };
    await em.flush();
    specimen.expect(entity.rank).toBe(3);

    entity.rank = 1;
    await em.flush();
    specimen.expect(entity.rank).toBe(3);

    entity.trait = { TRANSLATED: entity.trait.TRANSLATED };
    entity.traits = ["TRANSLATED"];
    await em.flush();
    specimen.expect(entity.rank).toBe(UNRANKED);
  });

  specimen.it("a stale rank 0 lands as its zipf-derived rank — a rare verb can no longer sort ahead of essere", async () => {
    const stale = word("rank.stale", { RANKED: { rank: 0, zipf: 1.36, fpm: 0.0229 } });
    const common = word("rank.common", { RANKED: { rank: 11, zipf: 7.1, fpm: 12600 } });
    await em.flush();
    specimen.expect(stale.rank).toBeGreaterThan(common.rank);
    specimen.expect(stale.rank).toBe(Math.round(10 ** (9 - 1.36)));
  });
});

specimen.describe("feed — due first, then novel by rank, unranked last", () => {
  specimen.beforeAll(async () => {
    word("feed.second", { RANKED: { rank: 200, zipf: 5.7, fpm: 500 } });
    word("feed.first", { RANKED: { rank: 20, zipf: 6.7, fpm: 5000 } });
    word("feed.zero", { RANKED: { rank: 0, zipf: 1.2, fpm: 0.02 } });
    await em.flush();
    em.clear();
  });

  specimen.it("puts the due literal ahead of every novel one, and orders novel by rank ascending", async () => {
    const rows = await literal.feed({}, { limit: 6 });
    const slugs = rows.map((row) => row.slug);
    specimen.expect(slugs[0]).toBe("goodbye");
    specimen.expect(slugs.indexOf("feed.first")).toBeLessThan(slugs.indexOf("feed.second"));
    const ranks = rows.slice(1).map((row) => row.rank);
    specimen.expect(ranks).toEqual([...ranks].sort((left, right) => left - right));
  });

  specimen.it("never surfaces a rank-0 row ahead of ranked ones", async () => {
    const rows = await literal.feed({}, { limit: 50 });
    const zero = rows.findIndex((row) => row.slug === "feed.zero");
    const ranked = rows.filter((row) => row.rank < UNRANKED && row.slug !== "feed.zero" && row.slug !== "goodbye");
    specimen.expect(zero).toBeGreaterThan(-1);
    for (const row of ranked) specimen.expect(rows.indexOf(row)).toBeLessThan(zero);
  });

  specimen.it("respects the limit and the blacklist", async () => {
    const two = await literal.feed({}, { limit: 2 });
    specimen.expect(two.length).toBe(2);
    const without = await literal.feed({}, { limit: 3, blacklist: { literals: [two[0].id] } });
    specimen.expect(without.map((row) => row.id)).not.toContain(two[0].id);
  });

  specimen.it("novel never returns a literal the user has a retention for; due only returns past-due ones", async () => {
    const novel = await literal.novel({}, { limit: 50 });
    specimen.expect(novel.map((row) => row.slug)).not.toContain("hello");
    specimen.expect(novel.map((row) => row.slug)).not.toContain("goodbye");
    const due = await literal.due({}, { limit: 50 });
    specimen.expect(due.map((row) => row.slug)).toEqual(["goodbye"]);
  });

  specimen.it("constrains by symbol slugs as an $and over the relation", async () => {
    const polite = await literal.feed({ symbols: ["greeting", "polite"] }, { limit: 10 });
    specimen.expect(polite.map((row) => row.slug).sort()).toEqual(["please", "thanks"]);
  });
});

specimen.describe("review — one retention per user·literal, one trace per review, lastSignal reads the newest trace", () => {
  let reviewed;

  specimen.it("creates the retention and writes a trace on first review", async () => {
    reviewed = word("review.fresh", { RANKED: { rank: 500, zipf: 5.3, fpm: 200 } });
    await em.flush();
    const retention = await reviewed.review("SUCCESS", context());
    specimen.expect(retention.id).toBeTruthy();
    specimen.expect(retention.status).not.toBe("UNTOUCHED");
    const traces = await scenario.entities.trace.find({ literal: reviewed.id });
    specimen.expect(traces.length).toBe(1);
    specimen.expect(traces[0].retention.id ?? traces[0].retention).toBe(retention.id);
    specimen.expect(traces[0].signal).toEqual({ enum: "SUCCESS" });
  });

  specimen.it("evolves the same retention on the second review and appends a second trace", async () => {
    const before = await scenario.entities.retention.count({ literal: reviewed.id });
    const retention = await reviewed.review("MISTAKE", context());
    const after = await scenario.entities.retention.count({ literal: reviewed.id });
    specimen.expect(after).toBe(before);
    specimen.expect(after).toBe(1);
    specimen.expect(retention.state).toBeTruthy();
    const traces = await scenario.entities.trace.find({ literal: reviewed.id });
    specimen.expect(traces.length).toBe(2);
  });

  specimen.it("lastSignal is the newest trace's signal, readable through the literal's retention", async () => {
    em.clear();
    const [row] = await literal.find({ slug: "review.fresh" }, { populate: ["retentions"] });
    specimen.expect(row.retention?.lastSignal).toBe("MISTAKE");
    const missed = await literal.byLastSignal(["MISTAKE"], {}, { limit: 50 });
    specimen.expect(missed.map((entry) => entry.slug)).toContain("review.fresh");
  });
});

specimen.describe("literal — the corpus word: search, card, reference, symbol facets, uses", () => {
  specimen.it("search matches slug and both translations", async () => {
    const byLearning = await literal.find({ search: "obrigado" });
    specimen.expect(byLearning.map((row) => row.slug)).toEqual(["thanks"]);
    const byKnown = await literal.find({ search: "goodbye" });
    specimen.expect(byKnown.map((row) => row.slug).sort()).toEqual(["goodbye", "ola-tchau"]);
    const bySlug = await literal.find({ search: "chamar." });
    specimen.expect(bySlug.map((row) => row.slug).sort()).toEqual(["chamar.presente.indicativo", "chamar.verb"]);
  });

  specimen.it("reference: an id or a slug, never guessed", () => {
    specimen.expect(literal.reference("hello")).toEqual({ slug: "hello" });
    specimen.expect(literal.reference(scenario.fixtures.hello.id)).toEqual({ id: scenario.fixtures.hello.id });
  });

  specimen.it("card projects slug · known · learning · ontology · status from a retention-populated row", async () => {
    const [row] = await literal.find({ slug: "hello" }, { populate: ["retentions"] });
    specimen.expect(literal.card.project(row)).toEqual({ slug: "hello", known: "hello", learning: "olá", ontology: "word", status: "KNOWN" });
    const [novel] = await literal.find({ slug: "please" }, { populate: ["retentions"] });
    specimen.expect(literal.card.project(novel).status).toBe("UNTOUCHED");
  });

  specimen.it("symbol json mirrors the symbols collection as nested facets — the dojo's context source", async () => {
    const [row] = await literal.find({ slug: "chamar.presente.indicativo" });
    specimen.expect(row.symbol.word.tense).toBe("presente");
    specimen.expect(row.symbol.word.mood).toBe("indicativo");
    const [form] = await literal.find({ slug: "chamo.verb" });
    specimen.expect(form.symbol.word.person).toBe("first");
    specimen.expect(form.symbol.word.number).toBe("singular");
  });

  specimen.it("uses is linked from ANNOTATED tokens and CONJUGATED paradigm+infinitive after flush", async () => {
    const [sentence] = await literal.find({ slug: "ola-tchau" }, { populate: ["uses"] });
    specimen.expect(sentence.uses.getItems().map((row) => row.slug).sort()).toEqual(["goodbye", "hello"]);
    const [paradigm] = await literal.find({ slug: "chamar.presente.indicativo" }, { populate: ["uses"] });
    specimen.expect(paradigm.uses.getItems().map((row) => row.slug).sort()).toEqual(["chamar.verb", "chamas.verb", "chamo.verb"]);
    const [form] = await literal.find({ slug: "chamo.verb" }, { populate: ["in"] });
    specimen.expect(form.in.getItems().map((row) => row.slug)).toEqual(["chamar.presente.indicativo"]);
  });
});

specimen.describe("schema — every foreign key targets a table that exists", () => {
  specimen.it("no dangling FK targets, no foreign_key_check rows", async () => {
    const connection = scenario.orm.em.getConnection();
    const tables = await connection.execute("select name, sql from sqlite_master where type = 'table'");
    const names = new Set(tables.map((row) => row.name));
    for (const table of tables) {
      for (const match of String(table.sql ?? "").matchAll(/references\s+[`"]?(\w+)[`"]?/gi)) {
        specimen.expect(names.has(match[1])).toBe(true);
      }
    }
    const violations = await connection.execute("pragma foreign_key_check");
    specimen.expect(violations.length).toBe(0);
  });
});
