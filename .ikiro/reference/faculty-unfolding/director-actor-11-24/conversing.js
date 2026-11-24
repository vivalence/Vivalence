import { Queue } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/prototypes/queue.js";
import * as soma from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/soma.js";

const worded = (turn) => turn.parts.some((part) => part.type === "text" && part.text.trim() !== "");

const spoken = (turn) => turn.role !== "director";

const replaced = (held, said) => said;
const appended = (held = "", said) => `${held}${said}\n`;

export const ACTOR = {
  identity: replaced,
  environment: replaced,
  language: replaced,
  goal: replaced,
  user: replaced,
  history: appended,
};

const composed = (record) =>
  record
    .filter((turn) => turn.role === "director")
    .flatMap((turn) => turn.parts)
    .filter((part) => part.type === "tool_use" && part.name.startsWith("actor_"))
    .reduce((system, part) => {
      const key = part.name.slice("actor_".length);
      return { ...system, [key]: ACTOR[key](system[key], part.input.text) };
    }, {});

export const acting = (primer, record, window) => ({
  system: { ...primer, ...composed(record) },
  turns: record.filter(spoken).slice(-window),
  settings: { effort: "none" },
});

export const directing = (record) =>
  record.map((turn) => (turn.role === "director" ? { ...turn, role: "assistant" } : turn));

async function* reply(act, mouth, settings, signal) {
  const words = new Queue();
  const kinds = [];
  let sealing = null;
  const thinking = (async function* () {
    try {
      for await (const packet of await act(signal)) {
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

export async function* conversing(ear, mouth, { act, direct, chain, source, settings }, signal) {
  const frames = new Queue();
  const packets = new Queue();
  let heard = null;
  let speaking = null;
  let working = null;
  let behind = false;
  let fault = null;

  const failed = (error) => {
    fault ??= error;
    packets.close();
  };

  const answer = () => {
    const controller = new AbortController();
    const cut = AbortSignal.any([signal, controller.signal]);
    const settled = (async () => {
      let said = null;
      for await (const packet of reply(act, mouth, settings, cut)) {
        said = soma.pour(said, packet);
        if (packet.event === "/turn/close" && worded(said)) await chain(said);
        packets.enqueue(packet);
      }
    })().catch(failed);
    return { abort: (reason) => (controller.abort(reason), settled) };
  };

  const wake = () => {
    if (working) return void (behind = true);
    working = (async () => {
      do {
        behind = false;
        for (const turn of await direct(signal)) packets.enqueue({ event: "/turn/full", turn });
      } while (behind);
      working = null;
    })().catch(failed);
  };

  const feeding = (async () => {
    for await (const packet of source) if (packet.event === "/audio/packet") frames.enqueue(packet);
    frames.close();
  })().catch(failed);

  const hearing = (async () => {
    try {
      for await (const packet of ear.via.stream({ source: frames.drain(signal), settings }, { signal })) {
        heard = soma.pour(heard, packet);
        if (packet.event === "/part/delta" && worded(heard) && speaking) {
          await speaking.abort("interrupted");
          speaking = null;
        }
        if (packet.event === "/turn/close" && worded(heard)) {
          await chain(heard);
          speaking = answer();
          wake();
        }
        packets.enqueue(packet);
      }
      if (speaking) await speaking.abort("closed");
      await working;
    } finally {
      packets.close();
    }
  })().catch(failed);

  yield* packets.drain(signal);
  if (fault) throw fault;
  await Promise.race([hearing, feeding]);
}
