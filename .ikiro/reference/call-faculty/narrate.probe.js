import { Controller, Span, soma, trace } from "@vivalence/typology";

const TOLD = [
  [(packet) => packet.event === "/turn/open", (packet) => ({ opened: packet.turn.role, turn: packet.turn.id })],
  [
    (packet) => packet.event === "/turn/close" || packet.event === "/turn/full",
    (packet, turn) => ({
      sealed: turn.role,
      turn: turn.id,
      state: turn.meta?.state,
      parts: turn.parts.map((part) => part.text ?? part.name ?? part.type),
    }),
  ],
  [(packet) => packet.event === "/audio/close", (packet, turn, audio) => ({ spoken: audio })],
];

async function* narrating(span, packets) {
  let turn = null;
  let audio = 0;
  for await (const packet of packets) {
    if (packet.event === "/audio/packet") audio += 1;
    else turn = soma.pour(turn, packet);
    const found = TOLD.find(([tells]) => tells(packet));
    if (found) span.log(found[1](packet, turn, audio));
    if (packet.event === "/audio/close") audio = 0;
    if (packet.event === "/turn/close" || packet.event === "/turn/full") turn = null;
    yield packet;
  }
}

const mode = new Span("runtime/runtime").branch("/daemon/spanish").branch("/mode/teacher/francesca");
const root = mode.trace.trace;
const seen = [];
root.pipe.tap((record) => seen.push(`${record.track} /${trace.pathname(record.path)} ${JSON.stringify(record.data ?? "")}`));
const controller = new Controller({ stdout: mode.branch("hallucination") });
controller.start();
const packets = (async function* () {
  yield { event: "/turn/open", turn: { role: "user", id: "u1" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  yield { event: "/part/delta", index: 0, part: { text: "Hola, Francesca." } };
  yield { event: "/part/close", index: 0 };
  yield { event: "/turn/close", turn: {} };
  yield { event: "/turn/open", turn: { role: "assistant", id: "a1" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  yield { event: "/part/delta", index: 0, part: { text: "Hola." } };
  yield { event: "/audio/packet", audio: {} };
  yield { event: "/audio/packet", audio: {} };
  yield { event: "/part/close", index: 0 };
  yield { event: "/audio/close", audio: { meta: { state: "complete" } } };
  yield { event: "/turn/close", turn: { meta: { state: "complete" } } };
})();
for await (const _ of narrating(controller.branch("call").stdout, packets));
console.log(seen.join("\n"));
