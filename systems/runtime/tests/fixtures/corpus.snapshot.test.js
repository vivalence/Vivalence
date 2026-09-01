import { specimen } from "@vivalence/typology";
import { join } from "@std/path";
import { seed } from "../scenarios/fixtures.js";

const { describe, it, expect } = specimen;

const SNAPSHOTS = new URL(".", import.meta.url).pathname;
const FILE = "corpus.snapshot.json";
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

const bySlug = (rows) => [...rows].sort((a, b) => a.slug.localeCompare(b.slug));

async function project(entities) {
  const literals = await entities.literal.find({}, { populate: ["symbols"] });
  const symbols = await entities.symbol.findAll();
  const retentions = await entities.retention.find({}, { populate: ["literal"] });
  const traces = await entities.trace.find({}, { populate: ["literal"] });
  const modes = await entities.mode.findAll();
  const intents = await entities.intent.findAll();
  const threads = await entities.thread.findAll();

  return {
    literals: bySlug(literals).map((literal) => ({
      slug: literal.slug,
      traits: literal.traits,
      trait: literal.trait,
      symbol: literal.symbol,
      ontology: literal.ontology,
      symbols: literal.symbols.getItems().map((symbol) => symbol.slug).sort(),
    })),
    symbols: bySlug(symbols).map((symbol) => ({
      slug: symbol.slug,
      traits: symbol.traits,
      trait: symbol.trait,
    })),
    retentions: [...retentions]
      .sort((a, b) => a.status.localeCompare(b.status))
      .map((retention) => ({ status: retention.status, literal: retention.literal.slug })),
    traces: [...traces]
      .sort((a, b) => a.status.localeCompare(b.status))
      .map((trace) => ({ status: trace.status, signal: trace.signal, literal: trace.literal.slug })),
    modes: bySlug(modes).map((mode) => ({ slug: mode.slug, type: mode.type, traits: mode.traits })),
    intents: bySlug(intents).map((intent) => ({ slug: intent.slug, traits: intent.traits, trait: intent.trait })),
    threads: threads.map((thread) => ({ cursor: thread.cursor, counter: thread.counter })),
  };
}

describe("@testing corpus is deterministic", () => {
  it("re-seed matches the frozen snapshot", async () => {
    const { entities, orm } = await seed();
    const pojo = await project(entities);

    if (HOT) specimen.snapshot(pojo, { base: SNAPSHOTS, locate: FILE, parse: (value) => value });

    const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, FILE)));
    expect(pojo).toEqual(frozen);

    await orm.close();
  });
});
