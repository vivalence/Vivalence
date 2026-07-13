import { specimen } from "@vivalence/typology";
import { topography, DRY, missing, order, persist, stable, SYMBOL_SLUGS } from "./harness.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const WHERE = { slug: { $in: SYMBOL_SLUGS } };
const OPTIONS = {};

describe("topography snapshot · symbol · 8 across ontology", { sanitizeResources: false, sanitizeOps: false }, () => {
  let scenario;
  let canonical;
  let skip = false;

  beforeAll(async () => {
    skip = missing();
    if (skip) return void console.log("  SKIP: no brazilian topography DB");
    scenario = await topography();
  });

  afterAll(async () => {
    if (scenario) await scenario.close();
  });

  const probe = (name, run) => it(name, async () => { if (!skip) await run(); });

  probe("mode vantage · daemon.entities.symbol.find → entity-symbol.snapshot.json", async () => {
    const rows = await scenario.entities.symbol.find(WHERE, OPTIONS);
    canonical = order(rows.map((row) => stable(row.toJSON())), SYMBOL_SLUGS);
    const { path } = persist(canonical, "entity-symbol.snapshot.json");
    console.log(`[symbol/mode ${DRY ? "DRY" : "WRITE"}] ${canonical.length}/${SYMBOL_SLUGS.length} → ${path}`);
    expect(canonical.length).toBe(SYMBOL_SLUGS.length);
    expect(canonical.map((row) => row.slug).sort()).toEqual([...SYMBOL_SLUGS].sort());
  });

  probe("aperture vantage · /entities/symbol/find ≡ canonical", async () => {
    const rows = await scenario.conn.call("/entities/symbol/find", { where: WHERE, options: OPTIONS });
    expect(order(rows.map(stable), SYMBOL_SLUGS)).toEqual(canonical);
  });

  probe("remote vantage · client.symbol.find ≡ canonical (cast kind-instances)", async () => {
    const rows = await scenario.client.symbol.find(WHERE, OPTIONS);
    expect(rows.every((row) => row instanceof scenario.client.symbol.kind)).toBe(true);
    expect(order(rows.map((row) => stable(row.toJSON ? row.toJSON() : { ...row })), SYMBOL_SLUGS)).toEqual(canonical);
  });
});
