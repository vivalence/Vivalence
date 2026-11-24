import { is, soma } from "@vivalence/typology";

const ROOT = "/Users/finn/vivalence/code/vivalence/";
const recorded = JSON.parse(await Deno.readTextFile(ROOT + "subsystems/typology/tests/snapshots/hallucination-stream.snapshot.json"));
const TOOLS = ["/tool/call", "/tool/yield"];

const gathered = (output, yielded) => {
  const next = { ...output };
  for (const [key, value] of Object.entries(yielded)) {
    if (key === "message" || key === "object") {
      if (value != null) next[key] = value;
      continue;
    }
    next[key] = [...(next[key] ?? []), ...(Array.isArray(value) ? value : [value])];
  }
  return next;
};
function transcript(state, record) {
  if (record.event !== "/turn/full") return soma.transcript(state, record);
  const current = soma.transcript(state, record);
  const results = record.turn.parts.filter((part) => part.type === "tool_result");
  return { ...current, output: results.reduce((output, part) => gathered(output, part.output), current.output) };
}

const fold = (packets, step) => packets.reduce((state, packet) => step(state, structuredClone(packet)), null);
const today = fold(recorded, soma.transcript);
const without = recorded.filter((packet) => !TOOLS.includes(packet.event));
const after = fold(without, transcript);
console.log("packets today", recorded.length, "· without the tool packets", without.length);
console.log("the folded answer is the same:", JSON.stringify(today) === JSON.stringify(after));
console.log("--- the folded answer\n" + JSON.stringify(after, null, 2));

console.log("--- the client's reader: what it would merge");
for (const packet of without)
  if (packet.event === "/turn/full")
    for (const part of packet.turn.parts.filter((held) => held.type === "tool_result"))
      console.log("yieldish", is.yieldish(part), JSON.stringify(part));
console.log("--- the names a trace would show");
console.log(JSON.stringify(after.turns.flatMap((turn) => turn.parts).filter((part) => part.type === "tool_use").map((part) => part.name)));
console.log("--- the burst today: the three packets after the tools settle");
for (const packet of recorded.filter((held) => [...TOOLS, "/turn/full"].includes(held.event))) console.log(JSON.stringify(packet));
