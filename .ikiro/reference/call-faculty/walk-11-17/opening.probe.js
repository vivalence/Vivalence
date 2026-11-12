import { soma, v } from "@vivalence/typology";

const ROOT = "/Users/finn/vivalence/code/vivalence/";
const { Packet, Part } = v.primitives.hallucination;
const wire = JSON.parse(await Deno.readTextFile(ROOT + "commons/hallucinators/anthropic/tests/snapshots/translate-stream-events.snapshot.json")).filter(Boolean);

function whole(packets) {
  const held = new Map();
  const out = [];
  for (const packet of packets) {
    if (packet.event === "/part/open" && packet.part.type === "tool_use") {
      held.set(packet.index, "");
      out.push({ ...packet, part: { ...packet.part, input: {} } });
      continue;
    }
    if (packet.event === "/part/delta" && held.has(packet.index) && "input" in packet.delta) {
      held.set(packet.index, held.get(packet.index) + packet.delta.input);
      continue;
    }
    if (packet.event === "/part/close" && held.has(packet.index)) {
      const text = held.get(packet.index);
      held.delete(packet.index);
      out.push({ event: "/part/delta", index: packet.index, delta: { input: text ? JSON.parse(text) : {} } });
    }
    out.push(packet);
  }
  return out;
}

const Opening = v.union([Part.Any, v.object({ ...Part.ToolUse.properties, input: v.string() })]);
const ARGUED = (call) => JSON.stringify(call.input);

for (const [name, packets] of [["A · the fold parses (today)", wire], ["B · the translator parses", whole(wire)]]) {
  console.log(`=== ${name}`);
  let turn = null;
  for (const packet of packets) {
    turn = soma.pour(turn, structuredClone(packet));
    const verdict = packet.event === "/part/open" && name.startsWith("A")
      ? ([...Opening.errors(packet.part)].length ? "INVALID" : "valid under Opening")
      : ([...Packet.Response.errors(packet)].length ? "INVALID" : "valid");
    const call = turn?.parts?.find((part) => part?.type === "tool_use");
    console.log(JSON.stringify(packet), "·", verdict, call ? `· the dock paints ${ARGUED(call)}` : "");
  }
  console.log("--- sealed\n" + JSON.stringify(turn, null, 2));
}
