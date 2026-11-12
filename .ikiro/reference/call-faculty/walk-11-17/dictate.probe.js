import { atom } from "nanostores";
import { ReplSignal, steer } from "@vivalence/typology";
import { Microphone } from "./microphone.fixed.js";
import { dictate } from "./dictate.target.js";
import * as real from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/soma.js";

const tracks = [{ stop() {} }];
Object.defineProperty(globalThis, "navigator", { value: { mediaDevices: { getUserMedia: async () => ({ getAudioTracks: () => tracks, getTracks: () => tracks }) } }, configurable: true });
globalThis.AudioWorkletNode = class { port = {}; disconnect() {} };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
const context = {
  state: "running",
  sampleRate: 16000,
  audioWorklet: { addModule: async () => {} },
  createMediaStreamSource: () => ({ connect() {}, disconnect() {} }),
  createAnalyser: () => ({ fftSize: 0, frequencyBinCount: 4, getByteTimeDomainData() {} }),
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HEARD = [
  [{ event: "/turn/open", turn: { role: "user", id: "turn-1" } }, { event: "/part/open", index: 0, part: { type: "text", text: "" } }, { event: "/part/draft", index: 0, part: { text: "vado al" } }],
  [{ event: "/part/delta", index: 0, part: { text: "vado al " } }, { event: "/part/draft", index: 0, part: { text: "mercato" } }],
  [{ event: "/part/delta", index: 0, part: { text: "mercato " } }, { event: "/part/close", index: 0 }, { event: "/turn/close" }],
  [{ event: "/turn/open", turn: { role: "user", id: "turn-2" } }, { event: "/part/open", index: 0, part: { type: "text", text: "" } }, { event: "/part/draft", index: 0, part: { text: "poi torno" } }],
  [{ event: "/part/full", index: 0, part: { type: "text", text: "Vado al mercato." }, turn: "turn-1" }, { event: "/part/delta", index: 0, part: { text: "poi " } }, { event: "/part/draft", index: 0, part: { text: "torno a" } }],
];
const TAIL = [{ event: "/part/delta", index: 0, part: { text: "torno a casa " } }, { event: "/part/close", index: 0 }, { event: "/turn/close" }];

const world = (draft, faulty) => {
  const bridge = { $draft: atom(draft), $dictation: atom(null), get draft() { return this.$draft.get(); } };
  const requests = [];
  const sent = [];
  const microphone = new Microphone({ drivers: { audio: { context, acquire: () => context, $state: atom("running") } } });
  const stream = async function* (source, options) {
    requests.push(options);
    let heard = 0;
    for await (const frame of source) {
      if (faulty && heard === 3) throw new Error("socket 1006");
      yield* HEARD[heard++] ?? [];
    }
    if (heard) yield* TAIL;
  };
  const terminal = {
    thread: { id: "thread-1" },
    mode: { harness: { verbatim: { stream } } },
    repl: { dispatch: async (typed) => void sent.push(typed) },
  };
  const client = { app: { bridge, box: { device: { microphone } } } };
  const run = (typed) => steer.dispatch.execute(dictate, { signal: new ReplSignal(typed), client, terminal }, new ReplSignal(typed));
  return { bridge, requests, sent, microphone, run };
};
const speak = async (microphone, frames) => {
  for (let frame = 0; frame < frames; frame++) {
    if (!microphone.claimed) return;
    microphone.worklet.port.onmessage({ data: new Float32Array(8).fill(0.25) });
    await sleep(2);
  }
};

const dictation = async (label, draft, start, exit, frames = 5, faulty = false) => {
  const { bridge, requests, sent, microphone, run } = world(draft, faulty);
  const held = [];
  bridge.$dictation.listen((value) => held.push(structuredClone(value)));
  let fault = null;
  const dictating = run(start).catch((error) => void (fault = error.message));
  await sleep(2);
  await speak(microphone, frames);
  const before = held.at(-1);
  if (exit) await run(exit);
  await dictating;
  console.log(`--- ${label}`);
  console.log(JSON.stringify({ typed: start, exit, request: requests[0], draftBefore: draft, draftAfter: bridge.draft, sent, fault, dictation: bridge.$dictation.get(), claimed: microphone.claimed }));
  return before;
};

const held = await dictation("stop: the words join the draft", "ciao", "/dictate", "/dictate/stop");
console.log("bridge.$dictation while speaking, after five frames:");
console.log(JSON.stringify(held, null, 2));
await dictation("stop on an empty draft", "", "/dictate", "/dictate/stop");
await dictation("send: the words join, the draft is sent", "ciao", "/dictate", "/dictate/send");
await dictation("trash: nothing joins", "ciao", "/dictate", "/dictate/trash");
await dictation("stop before a word", "ciao", "/dictate", "/dictate/stop", 0);
await dictation("send before a word, on an empty draft", "", "/dictate", "/dictate/send", 0);

await dictation("the route faults mid-stream", "ciao", "/dictate", null, 5, true);

console.log("--- the tree's transcript fold on a polish naming a sealed turn");
try {
  let folded = null;
  for (const packet of [...HEARD.flat().map((packet) => (packet.event === "/part/delta" ? { ...packet, delta: packet.part } : packet))]) folded = real.transcript(folded, packet);
  console.log(JSON.stringify(folded.turns), JSON.stringify(folded.open));
} catch (error) {
  console.log(`THROWS ${error.name}: ${error.message}`);
}
