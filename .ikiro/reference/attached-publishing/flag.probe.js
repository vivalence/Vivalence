import { traits, v } from "@vivalence/typology";

const opaque = v.object({}, { additionalProperties: true });
const forms = {
  "flag (today)": opaque.default({}).optional().desc("m").example({}),
  "v.object({})": v.object({}).default({}).optional().desc("m").example({}),
};

const bags = { absent: {}, empty: { WORN: {} }, keyed: { WORN: { since: "2026-11-21" } } };

for (const [name, schematic] of Object.entries(forms)) {
  const vocabulary = v.object({ WORN: schematic });
  console.log(`\n=== ${name}`);
  console.log("schema ", JSON.stringify(schematic));
  for (const [label, trait] of Object.entries(bags)) {
    const filled = vocabulary.fill(structuredClone(trait));
    const errors = [...vocabulary.errors(filled)].map((error) => `${error.instancePath} ${error.message}`);
    let cast;
    try {
      cast = JSON.stringify(traits.cast({ id: "probe", traits: Object.keys(trait), trait: structuredClone(trait) }, vocabulary));
    } catch (error) {
      cast = `THROWS ${error.message}`;
    }
    console.log(label.padEnd(7), "fill", JSON.stringify(filled).padEnd(34), "errors", JSON.stringify(errors), "cast", cast);
  }
}
