import { Queue } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/prototypes/queue.js";
import * as soma from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/soma.js";

export { acting, directing } from "../director-actor-11-24/conversing.js";

const worded = (turn) => turn.parts.some((part) => part.type === "text" && part.text.trim() !== "");

const amending = (packet) => packet.event === "/part/full" && "turn" in packet;

export async function* voiced(packets) {
  let turn = null;
  let held = [];
  for await (const packet of packets) {
    if (amending(packet)) {
      yield packet;
      continue;
    }
    if (packet.event === "/turn/open") held = [];
    turn = soma.pour(turn, packet);
    if (held && !worded(turn)) {
      held.push(packet);
      continue;
    }
    if (held) yield* held;
    held = null;
    yield packet;
  }
}

async function* reply(act, mouth, turns, settings, signal) {
  const words = new Queue();
  const kinds = [];
  let sealing = null;
  const thinking = (async function* () {
    try {
      for await (const packet of await act(turns, signal)) {
        if (packet.event === "/part/open") kinds[packet.index] = packet.part.type;
        const said = packet.event === "/part/delta" && kinds[packet.index] === "text";
        if (said) words.enqueue(packet.part.text);
        if (packet.event === "/turn/close") sealing = packet;
        else yield packet;
      }
    } finally {
      words.close();
    }
  })();
  try {
    const speaking = mouth.via.stream({ source: words.drain(signal), settings }, { signal });
    yield* soma.merge(thinking, speaking);
  } catch (fault) {
    if (!signal.aborted) throw fault;
  }
  if (!sealing) return;
  if (!signal.aborted) return yield sealing;
  yield { ...sealing, turn: { ...sealing.turn, meta: { ...sealing.turn.meta, state: "interrupted" } } };
}

export const recorded = (history) =>
  history.reduce((record, turn) => soma.transcript(record, { event: "/turn/full", turn }), null);

export async function* conversing(ear, mouth, { act, direct, history, source, settings }, signal) {
  const frames = new Queue();
  const packets = new Queue();
  const sealed = new Queue();
  let record = recorded(history);
  let speaking = null;
  let fault = null;

  const failed = (error) => {
    fault ??= error;
    packets.close();
  };

  const emit = (packet) => {
    record = soma.transcript(record, packet);
    packets.enqueue(packet);
  };

  const answer = () => {
    const controller = new AbortController();
    const cut = AbortSignal.any([signal, controller.signal]);
    const settled = (async () => {
      for await (const packet of voiced(reply(act, mouth, record.turns, settings, cut))) emit(packet);
    })().catch(failed);
    return { abort: (reason) => (controller.abort(reason), settled) };
  };

  const directed = (async () => {
    for await (const heard of sealed.drain()) {
      sealed.flush();
      for (const turn of await direct(record.turns, heard)) emit({ event: "/turn/full", turn });
    }
  })().catch(failed);

  const feeding = (async () => {
    for await (const packet of source) if (packet.event === "/audio/packet") frames.enqueue(packet);
    frames.close();
  })().catch(failed);

  const hearing = (async () => {
    try {
      for await (const packet of voiced(ear.via.stream({ source: frames.drain(signal), settings }, { signal }))) {
        if (packet.event === "/turn/open" && speaking) await speaking.abort("interrupted");
        emit(packet);
        if (packet.event !== "/turn/close") continue;
        speaking = answer();
        sealed.enqueue(record.turns.at(-1));
      }
      if (speaking) await speaking.abort("closed");
      sealed.close();
      await directed;
    } finally {
      packets.close();
    }
  })().catch(failed);

  yield* packets.drain(signal);
  if (fault) throw fault;
  await Promise.race([hearing, feeding]);
}
