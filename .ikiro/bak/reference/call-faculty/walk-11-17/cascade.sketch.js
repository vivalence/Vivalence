import { Queue } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/prototypes/queue.js";
import * as soma from "./soma.copy.js";

async function* reply(mind, mouth, { system, turns, tools, settings }, signal) {
  const words = new Queue();
  let sealing = null;
  const thinking = (async function* () {
    try {
      for await (const packet of mind.via.stream({ system, turns, tools, settings }, { signal })) {
        if (packet.event === "/turn/open") sealing = { event: "/turn/close", meta: {} };
        if (packet.event === "/part/delta" && packet.part.text) words.enqueue(packet.part.text);
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
  yield signal.aborted ? { ...sealing, meta: { ...sealing.meta, state: "interrupted" } } : sealing;
}

async function* session(ear, mind, mouth, { source, system, turns, tools, settings }, signal) {
  const frames = new Queue();
  const packets = new Queue();
  let history = turns;
  let heard = null;
  let results = [];
  let speaking = null;

  const answer = () => {
    const controller = new AbortController();
    const cut = AbortSignal.any([signal, controller.signal]);
    const settled = (async () => {
      let said = null;
      for await (const packet of reply(mind, mouth, { system, turns: history, tools, settings }, cut)) {
        said = soma.pour(said, packet);
        if (packet.event === "/turn/close") history = [...history, said];
        packets.enqueue(packet);
      }
    })();
    return { abort: (reason) => (controller.abort(reason), settled) };
  };

  const feeding = (async () => {
    for await (const packet of source)
      switch (packet.event) {
        case "/audio/packet":
          frames.enqueue(packet);
          break;
        case "/tool/yield":
          results = [...results, { type: "tool_result", id: packet.id, ...packet.result }];
          if (results.length < history.at(-1).parts.filter((part) => part.type === "tool_use").length) break;
          history = [...history, { role: "user", parts: results }];
          results = [];
          speaking = answer();
          break;
      }
  })();

  const hearing = (async () => {
    try {
      for await (const packet of ear.via.stream({ source: frames.drain(signal), settings }, { signal })) {
        heard = soma.pour(heard, packet);
        switch (packet.event) {
          case "/turn/open":
            await speaking?.abort("interrupted");
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
  })();

  yield* packets.drain(signal);
  await Promise.race([hearing, feeding]);
}

export const cascade = (ear, mind, mouth) => ({
  type: "call",
  id: [ear.id, mind.id, mouth.id].join("+"),
  tune: mind.tune,
  channels: { in: ear.channels.in, out: [...mind.channels.out, ...mouth.channels.out] },
  via: { stream: (request, { signal }) => session(ear, mind, mouth, request, signal) },
});
