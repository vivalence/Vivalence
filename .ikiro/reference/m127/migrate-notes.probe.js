// limit: 3000 chars
// probe, DRY: his stored callouts mapped from a symbols pair to one `kind` (Q15B · Q15C). Writes nothing.
// prints the tally, every note the mapping cannot place, one step before · after, and what the boot's own
// object.patch leaves of an entity already in the database when the dataset hands it the migrated one.
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/migrate-notes.probe.js
import { object } from "@vivalence/typology";
import { CALLOUTS, NOTE } from "/Users/finn/.viva/registry/assembly/domain/assembly/schematics.js";
import steps from "/Users/finn/.viva/registry/droneaid/topographies/guides/dataset/literals/steps.js";
import guides from "/Users/finn/.viva/registry/droneaid/topographies/guides/dataset/literals/guides.js";

export const kinded = ({ symbols = [], ...note }) => {
  const family = symbols.find((one) => one.startsWith("warn."));
  const kind = family ? family.slice(5).toUpperCase() : symbols.includes("note.warning") ? "WARNING" : symbols.includes("note.tip") ? "TIP" : null;
  return kind ? { ...note, kind } : note;
};

export const migrated = (literal) => {
  if (!literal.trait.ANNOTATED) return literal;
  const notes = literal.trait.ANNOTATED.notes.map(kinded);
  return { ...literal, trait: { ...literal.trait, ANNOTATED: { ...literal.trait.ANNOTATED, notes } } };
};

if (import.meta.main) {
  const held = [...steps, ...guides];
  const notes = held.flatMap((one) => one.trait.ANNOTATED?.notes ?? []);
  const tally = {};
  const stray = [];
  for (const note of notes) {
    const next = kinded(note);
    tally[next.kind ?? "(plain)"] = (tally[next.kind ?? "(plain)"] ?? 0) + 1;
    const known = (note.symbols ?? []).every((one) => one === "note.warning" || one === "note.tip" || CALLOUTS.includes(one.slice(5).toUpperCase()));
    if (!known || [...NOTE.errors(next)].length || "symbols" in next) stray.push(note);
  }
  const touched = held.filter((one) => (one.trait.ANNOTATED?.notes ?? []).some((note) => "symbols" in note));
  console.log(JSON.stringify({ literals: held.length, "literals touched": touched.length, notes: notes.length, tally, stray }, null, 2));

  const step = steps.find((one) => one.slug === "mari.16");
  console.log(JSON.stringify({ before: step.trait.ANNOTATED, after: migrated(step).trait.ANNOTATED }, null, 2));

  const inDatabase = structuredClone(step);
  const patched = object.patch(inDatabase, { trait: migrated(step).trait });
  console.log(JSON.stringify({ "what the boot's patch leaves": patched.trait.ANNOTATED }, null, 2));
}
