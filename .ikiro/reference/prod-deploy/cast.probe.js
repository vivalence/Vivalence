import { belt, v } from "@vivalence/typology";
const rows = Deno.readTextFileSync(Deno.args[0]).split("\n").filter(Boolean).map((row) => JSON.parse(row));
const vocab = { Terminal: v.traits.terminal, Note: v.traits.note, Symbol: v.traits.symbol, Literal: v.traits.literal, User: v.user.traits, Buffer: v.buffer.traits, Thread: v.thread.traits };
const tally = {};
for (const row of rows) {
  const vocabulary = vocab[row.table];
  if (!vocabulary) continue;
  const weight = row.n ?? 1;
  tally[row.table] ??= { ok: 0, bad: 0, faults: {} };
  try {
    belt.traits.cast({ id: row.id ?? "x", traits: row.traits ?? [], trait: row.trait ?? {} }, vocabulary);
    tally[row.table].ok += weight;
  } catch (error) {
    tally[row.table].bad += weight;
    const message = error.message.replace(/^\[traits\] \S+: /, "");
    tally[row.table].faults[message] = (tally[row.table].faults[message] ?? 0) + weight;
  }
}
console.log(JSON.stringify(tally, null, 2));
