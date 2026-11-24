import { fromm, Pool, soma, v } from "@vivalence/typology";
import { Yield } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/prototypes/pool.js";

const ROOT = "/Users/finn/vivalence/code/vivalence/";
const recorded = JSON.parse(await Deno.readTextFile(ROOT + "subsystems/typology/tests/snapshots/hallucination-stream.snapshot.json"));
const row = (held) => JSON.stringify(held);

console.log("=== yield · pool, as the tree mints them");
const buffer = { id: "b1", mime: "text/plain" };
const minted = { nominal: Yield.NOMINAL([buffer], { cursor: 3 }), exhausted: Yield.EXHAUSTED(), error: Yield.ERROR(new Error("boom"), { cursor: 3 }), drained: await Pool.of(buffer).drain() };
for (const [name, held] of Object.entries(minted)) {
  const read = fromm.yield(held);
  console.log(name, row(held), "· schema", [...v.prototypes.Yield.errors(held)].length ? "INVALID" : "valid", "· fromm reads", row({ kind: read.kind, condition: read.condition, output: read.output }));
}

const NOUNS = {
  "/turn/open": (packet) => ({ event: packet.event, turn: packet.turn }),
  "/part/open": (packet) => ({ event: packet.event, index: packet.index, part: packet.part }),
  "/part/delta": (packet) => ({ event: packet.event, index: packet.index, part: packet.delta }),
  "/part/close": (packet) => packet,
  "/turn/close": (packet) => ({ event: packet.event, turn: { meta: packet.meta } }),
  "/tool/call": (packet) => ({ event: packet.event, tool: { id: packet.id, name: packet.name, input: packet.input } }),
  "/tool/yield": (packet) => ({ event: packet.event, tool: { id: packet.id, ...packet.result } }),
  "/turn/full": (packet) => packet,
  "/response/close": (packet) => ({ event: packet.event, response: { meta: packet.meta } }),
};
const LEAVES = {
  ...Object.fromEntries(Object.keys(NOUNS).map((event) => [event, (packet) => packet])),
  "/part/delta": NOUNS["/part/delta"],
  "/tool/yield": (packet) => ({ event: packet.event, id: packet.id, ...packet.result }),
};

const grown = (part, carried) => {
  for (const [key, value] of Object.entries(carried))
    part[key] = typeof value === "string" && typeof part[key] === "string" ? part[key] + value : value;
  return part;
};
const sealed = (part) => {
  if (part.type === "tool_use" && typeof part.input === "string") part.input = part.input ? JSON.parse(part.input) : {};
  return part;
};
const TURN = {
  open: (turn, carried) => ({ ...carried, parts: [] }),
  close: (turn, carried) => ({ ...turn, ...carried }),
  full: (turn, carried) => carried,
};
const PART = {
  open: (part, carried) => ({ ...carried }),
  delta: grown,
  close: sealed,
};
function pourNoun(turn, packet) {
  const [, noun, act] = packet.event.split("/");
  if (noun === "turn") return TURN[act](turn, packet.turn);
  turn.parts[packet.index] = PART[act](turn.parts[packet.index], packet.part);
  return turn;
}
function pourLeaf(turn, packet) {
  if (packet.event === "/part/delta") return soma.pour(turn, { ...packet, delta: packet.part });
  return soma.pour(turn, packet);
}

const CONTENT = ["turn", "part"];
const folded = (packets, pour) => {
  const turns = [];
  let open = null;
  for (const packet of packets) {
    if (!CONTENT.includes(packet.event.split("/")[1])) continue;
    open = pour(open, structuredClone(packet));
    if (["/turn/close", "/turn/full"].includes(packet.event)) { turns.push(open); open = null; }
  }
  return turns;
};
const is = folded(recorded, soma.pour);
for (const [name, table, pour] of [["A · every packet carries its noun", NOUNS, pourNoun], ["B · content nests, a signal is a flat leaf", LEAVES, pourLeaf]]) {
  const packets = recorded.map((packet) => table[packet.event](packet));
  console.log(`=== ${name}`);
  for (const packet of packets) console.log(row(packet));
  console.log("folds to the same turns as the tree:", row(folded(packets, pour)) === row(is), "· turns", is.length);
}
console.log("=== the turns, folded");
console.log(JSON.stringify(is, null, 2));

const { Part, Turn, State } = v.primitives.hallucination;
const bag = v.record(v.string(), v.unknown());
const A = {
  "/turn/close": v.object({
    event: v.const("/turn/close"),
    turn: v.object({ meta: bag.optional() }),
  }),
  "/tool/call": v.object({
    event: v.const("/tool/call"),
    tool: v.object({ id: v.string(), name: v.string(), input: bag }),
  }),
  "/tool/yield": v.object({
    event: v.const("/tool/yield"),
    tool: v.object({ id: v.string(), condition: v.string(), output: bag }),
  }),
  "/response/close": v.object({
    event: v.const("/response/close"),
    response: v.object({ meta: v.object({ state: State, rounds: v.integer() }, { additionalProperties: true }) }),
  }),
  "/audio/packet": v.object({
    event: v.const("/audio/packet"),
    pts: v.number().optional(),
    audio: v.object({ data: v.string(), rate: v.integer(), codec: v.string().optional() }),
  }),
};
const B = {
  "/tool/yield": v.object({
    event: v.const("/tool/yield"),
    id: v.string(),
    condition: v.string(),
    output: bag,
  }),
};
const spoken = { event: "/audio/packet", audio: "AAAAAAAAAAAAAAAAAAAAAA==", rate: 16000, codec: "pcm_16000", pts: 0.0005 };
const nounAudio = { event: spoken.event, pts: spoken.pts, audio: { data: spoken.audio, rate: spoken.rate, codec: spoken.codec } };
console.log("=== the changed schematics hold their packets");
for (const packet of [...recorded.map((held) => NOUNS[held.event](held)), nounAudio])
  if (A[packet.event]) console.log("A", row(packet), [...A[packet.event].errors(packet)].length ? "INVALID" : "valid");
for (const packet of recorded.map((held) => LEAVES[held.event](held)))
  if (B[packet.event]) console.log("B", row(packet), [...B[packet.event].errors(packet)].length ? "INVALID" : "valid");
console.log("B audio stands:", row(spoken), [...v.primitives.hallucination.Audio.Packet.errors(spoken)].length ? "INVALID" : "valid");
