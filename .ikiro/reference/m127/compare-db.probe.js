// limit: 2500 chars
// probe, READ ONLY: every guide · step literal of the droneaid guides dataset against the same slug in his
// instance database — is the trait equal? `--migrated` compares against the migrated shape and counts leftover pairs.
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/compare-db.probe.js [--migrated]
import { migrated } from "./migrate-notes.probe.js";

const DB = "/Users/finn/.viva/instances/localhost/mountpoint/localhost.viva.db";
const DATASET = "/Users/finn/.viva/registry/droneaid/topographies/guides/dataset/literals";
const fresh = `?at=${Date.now()}`;
const steps = (await import(`${DATASET}/steps.js${fresh}`)).default;
const guides = (await import(`${DATASET}/guides.js${fresh}`)).default;

const sorted = (value) =>
  Array.isArray(value)
    ? value.map(sorted)
    : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sorted(value[key])]))
      : value;

const { stdout } = await new Deno.Command("sqlite3", { args: ["-readonly", "-json", DB, "select slug, trait from Literal"] }).output();
const stored = new Map(JSON.parse(new TextDecoder().decode(stdout)).map((one) => [one.slug, JSON.parse(one.trait)]));

const want = Deno.args.includes("--migrated") ? (literal) => migrated(literal) : (literal) => literal;
const differs = [];
const absent = [];
for (const literal of [...steps, ...guides]) {
  if (!stored.has(literal.slug)) absent.push(literal.slug);
  else if (JSON.stringify(sorted(stored.get(literal.slug))) !== JSON.stringify(sorted(want(literal).trait))) differs.push(literal.slug);
}
const pairs = [...stored.values()].filter((trait) => (trait?.ANNOTATED?.notes ?? []).some((note) => "symbols" in note)).length;
console.log(JSON.stringify({ dataset: steps.length + guides.length, absent, differs, "database literals still holding a pair": pairs }, null, 2));
