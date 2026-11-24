// limit: 4400 chars
// probe, READ ONLY: the status quo of @droneaid's two topographies — what the dataset files hold per ontology,
// what each body folds to, what each guide sequences, and whether his instance database holds the same traits.
// run: deno run -A --no-check .ikiro/reference/assembly-droneaid/status.probe.js
const ROOT = "/Users/finn/.viva/registry/droneaid/topographies";
const DB = "/Users/finn/.viva/instances/localhost/mountpoint/localhost.viva.db";
const { resolve } = await import("/Users/finn/.viva/registry/assembly/domain/assembly/resolve.js");

const read = async (file) => (await import(`${ROOT}/${file}?at=${Date.now()}`)).default;
const parts = await read("models/dataset/literals/parts.js");
const placements = await read("models/dataset/literals/placements.js");
const guides = await read("guides/dataset/literals/guides.js");
const steps = await read("guides/dataset/literals/steps.js");

const tally = (list, key) => {
  const counts = {};
  for (const one of list) counts[key(one)] = (counts[key(one)] ?? 0) + 1;
  return counts;
};

console.log("files", { part: parts.length, placement: placements.length, guide: guides.length, step: steps.length });
console.log("placements by layer", tally(placements, (one) => one.trait.PLACED.layer));

const held = new Map([...parts, ...placements].map((one) => [one.slug, one]));
const placed = new Set(placements.map((one) => one.trait.PLACED.ref));
const layers = new Set(placements.map((one) => one.trait.PLACED.layer));
const bodies = parts.filter((one) => layers.has(one.slug) && !placed.has(one.slug)).map((one) => one.slug);
for (const body of bodies) {
  const fold = resolve(held, body);
  const drawn = tally(fold.placements, (one) => {
    const trait = fold.parts[one.ref];
    return trait.MODELED ? "GLB" : trait.PARAMETRIC ? "GEN" : "NONE";
  });
  console.log("body", body, {
    placements: fold.placements.length,
    parts: Object.keys(fold.parts).length,
    missing: fold.missing,
    drawn,
  });
}
console.log("parts no layer places", parts.filter((one) => !placed.has(one.slug) && !layers.has(one.slug)).map((one) => one.slug));

const installed = new Map();
for (const guide of guides) {
  const sections = guide.trait.SEQUENCED.sections;
  const own = sections.flatMap((section) => section.steps);
  const named = new Set();
  for (const slug of own) {
    const step = steps.find((one) => one.slug === slug);
    for (const placement of step.trait.ASSEMBLED.placements) named.add(placement);
  }
  installed.set(guide.slug, named);
  console.log("guide", guide.slug, {
    subject: guide.trait.SEQUENCED.subject,
    sections: sections.map((section) => `${section.name} ${section.steps.length}`),
    steps: own.length,
    "placements its steps install": named.size,
    notes: own.reduce((sum, slug) => sum + steps.find((one) => one.slug === slug).trait.ANNOTATED.notes.length, 0),
  });
}

const sorted = (value) =>
  Array.isArray(value)
    ? value.map(sorted)
    : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sorted(value[key])]))
      : value;

const query = "select slug, ontology, trait from Literal where daemon_slug = 'droneaid'";
const { stdout } = await new Deno.Command("sqlite3", { args: ["-readonly", "-json", DB, query] }).output();
const stored = new Map(JSON.parse(new TextDecoder().decode(stdout)).map((one) => [one.slug, one]));
console.log("database, daemon droneaid, by ontology", tally([...stored.values()], (one) => one.ontology));

const files = new Map([...parts, ...placements, ...guides, ...steps].map((one) => [one.slug, one]));
const absent = [...files.keys()].filter((slug) => !stored.has(slug));
const extra = [...stored.keys()].filter((slug) => !files.has(slug));
const differs = [...files.values()]
  .filter((one) => stored.has(one.slug))
  .filter((one) => JSON.stringify(sorted(JSON.parse(stored.get(one.slug).trait))) !== JSON.stringify(sorted(one.trait)))
  .map((one) => one.slug);
console.log("database against files", { files: files.size, database: stored.size, absent, extra, differs });
