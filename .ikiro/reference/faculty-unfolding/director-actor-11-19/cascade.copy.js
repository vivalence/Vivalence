import { Queue } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/prototypes/queue.js";
import * as soma from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/soma.js";

const SEALED = { event: "/turn/close", turn: { meta: {} } };

async function* reply(mind, mouth, { system, turns, tools, settings }, signal) {
  const words = new Queue();
  let sealing = null;
  const thinking = (async function* () {
    try {
      for await (const packet of await mind.via.stream({ system, turns, tools, settings }, { signal })) {
        if (packet.event === "/turn/open") sealing = SEALED;
        if (packet.event === "/part/delta" && typeof packet.part.text === "string") words.enqueue(packet.part.text);
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

async function* session(ear, mind, mouth, { source, system, turns, tools, settings }, signal) {
  const frames = new Queue();
  const packets = new Queue();
  let history = turns;
  let heard = null;
  let speaking = null;
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
      for await (const packet of reply(mind, mouth, { system: await system(), turns: history, tools, settings }, cut)) {
        said = soma.pour(said, packet);
        if (packet.event === "/turn/close") history = [...history, said];
        packets.enqueue(packet);
      }
    })().catch(failed);
    return { abort: (reason) => (controller.abort(reason), settled) };
  };

  const feeding = (async () => {
    for await (const packet of source)
      switch (packet.event) {
        case "/audio/packet":
          frames.enqueue(packet);
          break;
        case "/turn/full":
          history = [...history, packet.turn];
          speaking = answer();
          break;
      }
    frames.close();
  })().catch(failed);

  const hearing = (async () => {
    try {
      for await (const packet of ear.via.stream({ source: frames.drain(signal), settings }, { signal })) {
        heard = soma.pour(heard, packet);
        switch (packet.event) {
          case "/turn/open":
            if (speaking) await speaking.abort("interrupted");
            break;
          case "/turn/close":
            history = [...history, heard];
            speaking = answer();
            break;
        }
        packets.enqueue(packet);
      }
    } finally {
      packets.close();
    }
  })().catch(failed);

  yield* packets.drain(signal);
  if (speaking) await speaking.abort("closed");
  await Promise.race([hearing, feeding]);
  if (fault) throw fault;
}

export const cascade = (ear, mind, mouth) => ({
  type: "call",
  id: [ear.id, mind.id, mouth.id].join("+"),
  tune: mind.tune,
  channels: { in: ear.channels.in, out: [...mind.channels.out, ...mouth.channels.out] },
  via: { stream: (request, { signal }) => session(ear, mind, mouth, request, signal) },
});
