import { specimen } from "@vivalence/typology";
import { topography, DRY, LITERAL_SLUGS, missing, order, persist, stable } from "./harness.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const WHERE = { slug: { $in: LITERAL_SLUGS } };
const OPTIONS = { fields: ["slug", "traits", "trait", "symbol", "ontology", "rank"] };

describe("topography snapshot · literal · 10 across ontology", { sanitizeResources: false, sanitizeOps: false }, () => {
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

  probe("mode vantage · daemon.entities.literal.find → entity-literal.snapshot.json", async () => {
    const rows = await scenario.entities.literal.find(WHERE, OPTIONS);
    canonical = order(rows.map((row) => stable(row.toJSON())), LITERAL_SLUGS);
    const { path } = persist(canonical, "entity-literal.snapshot.json");
    console.log(`[literal/mode ${DRY ? "DRY" : "WRITE"}] ${canonical.length}/${LITERAL_SLUGS.length} → ${path}`);
    expect(canonical.length).toBe(LITERAL_SLUGS.length);
    expect(canonical.map((row) => row.slug).sort()).toEqual([...LITERAL_SLUGS].sort());
  });

  probe("aperture vantage · /entities/literal/find ≡ canonical", async () => {
    const rows = await scenario.conn.call("/entities/literal/find", { where: WHERE, options: OPTIONS });
    expect(order(rows.map(stable), LITERAL_SLUGS)).toEqual(canonical);
  });

  probe("remote vantage · client.literal.find ≡ canonical (cast kind-instances)", async () => {
    const rows = await scenario.client.literal.find(WHERE, OPTIONS);
    expect(rows.every((row) => row instanceof scenario.client.literal.kind)).toBe(true);
    expect(order(rows.map((row) => stable(row.toJSON ? row.toJSON() : { ...row })), LITERAL_SLUGS)).toEqual(canonical);
  });
});
