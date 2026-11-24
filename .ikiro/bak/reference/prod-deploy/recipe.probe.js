import paladin from "@vivalence/paladin";
import { Cortex, v } from "@vivalence/typology";
import { parse } from "@std/jsonc";

const recipe = parse(await Deno.readTextFile(Deno.args[0]));

const faults = v.faults(v.primitives.instance.InstanceMask, recipe);
console.log("InstanceMask faults:", faults.length ? faults : 0);

const cortex = new Cortex(recipe.tiers);
console.log("Cortex(tiers): ok", Object.keys(cortex.tiers).join(" · "));

await paladin.ledger.registry.supply();
for (const row of recipe.hallucinators) {
  const citizen = await paladin.ledger.registry.accio(row.module);
  const faculties = await citizen.provider({ ...citizen, ...row, secrets: { key: "probe" } });
  cortex.register(faculties.map((faculty) => ({ ...faculty, provider: citizen.manifest.slug })));
  console.log("provider", citizen.manifest.slug, faculties.map((faculty) => `${faculty.type}:${faculty.id}`).join(" "));
}
for (const [type, tier] of [...Object.keys(recipe.tiers).map((tier) => ["dialogue", tier]), ["speech", "fast"], ["verbatim", "fast"]]) {
  const picked = cortex.findOne({ type, tier });
  if (picked) console.log(type, tier, "→", picked.provider, picked.id);
}

const modules = [
  ...recipe.runtime.modes,
  ...recipe.daemons.flatMap((daemon) => [
    ...daemon.modes,
    ...Object.values(daemon.consume ?? {}).map((consumed) => consumed.module),
  ]),
];
const missing = [];
for (const module of modules) {
  try {
    const found = await paladin.ledger.registry.accio(module);
    if (!found) missing.push(module);
  } catch (error) {
    missing.push(`${module} — ${error.message.split("\n")[0]}`);
  }
}
console.log(`modules: ${modules.length - missing.length}/${modules.length} resolve`);
for (const entry of missing) console.log("  MISSING", entry);
Deno.exit(0);
