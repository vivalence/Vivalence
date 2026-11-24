import { belt, v } from "@vivalence/typology";

const rows = (path) => Deno.readTextFileSync(path).split("\n").filter(Boolean).map((row) => JSON.parse(row));
const tally = { Thread: { ok: 0, faults: {} }, Turn: { ok: 0, faults: {} } };
const fault = (table, message) => (tally[table].faults[message] = (tally[table].faults[message] ?? 0) + 1);

for (const entity of rows(Deno.args[0])) {
  try {
    Object.assign(entity, belt.traits.heal(entity, v.thread.traits));
    if (entity.traits.includes("CONVERSATIONAL")) {
      const { Conversational } = v.traits;
      const stored = Conversational.cast(entity.trait.CONVERSATIONAL);
      entity.trait.CONVERSATIONAL = Conversational.cast(Conversational.repair(stored));
    }
    entity.trait = belt.traits.cast(entity, v.thread.traits);
    tally.Thread.ok += 1;
    tally.Thread.healed ??= entity.traits.join(" · ");
    tally.Thread.tier ??= entity.trait.HARNESSED.tier;
  } catch (error) {
    fault("Thread", error.message.replace(/^\[traits\] \S+: /, ""));
  }
}

const { Parts, Meta, Turn } = v.primitives.hallucination;
for (const entity of rows(Deno.args[1])) {
  try {
    entity.parts = Parts.decode(entity.parts);
    if (entity.meta !== null && entity.meta !== undefined) entity.meta = Meta.decode(entity.meta);
    const faults = v.faults(Turn, { role: entity.role, parts: entity.parts, meta: entity.meta });
    if (faults.length) fault("Turn", faults.map((each) => `${each.at} ${each.reason}`).join(" · "));
    else tally.Turn.ok += 1;
  } catch (error) {
    fault("Turn", error.message);
  }
}
console.log(JSON.stringify(tally, null, 2));
