// limit: 1400 chars
// probe: his two guides dataset files against the drain's own form of the same entities — equal text, or equal
// entities in another key order, or a real difference.
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/soldering/canonical.probe.js
import { Datasink } from "@vivalence/typology";

const DATASET = "/Users/finn/.viva/registry/droneaid/topographies/guides/dataset/literals";
const ordered = (value) =>
  Array.isArray(value)
    ? value.map(ordered)
    : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, ordered(value[key])]))
      : value;

for (const file of ["guides.js", "steps.js"]) {
  const held = (await import(`${DATASET}/${file}`)).default;
  const text = await Deno.readTextFile(`${DATASET}/${file}`);
  const canonical = Datasink.canonical(held, "js");
  const scratch = await Deno.makeTempFile({ suffix: ".js" });
  await Deno.writeTextFile(scratch, canonical);
  const again = (await import(scratch)).default;
  const bySlug = (rows) => JSON.stringify(ordered([...rows].sort((a, b) => (a.slug < b.slug ? -1 : 1))));
  console.log(JSON.stringify({ file, entities: held.length, sameText: canonical === text, sameEntities: bySlug(held) === bySlug(again) }));
}
