import { cascade } from "./cascade.copy.js";
import * as soma from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/soma.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const started = Date.now();
const at = () => String(Date.now() - started).padStart(4);

const ear = {
  id: "ear", channels: { in: [], out: [] },
  via: {
    stream: async function* ({ source }, { signal }) {
      for await (const frame of source) {
        if (signal.aborted) return;
        yield { event: "/turn/open", turn: { role: "user" } };
        yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
        yield { event: "/part/delta", index: 0, part: { text: atob(frame.audio.data) } };
        yield { event: "/part/close", index: 0 };
        yield { event: "/turn/close", turn: {} };
      }
    },
  },
};

const mind = {
  id: "actor", tune: [0.4, 1, 0.8], channels: { in: [], out: [] },
  via: {
    stream: async function* ({ system, turns }, { signal }) {
      console.log(`${at()}  actor   reads  "${system.directions}"  after "${turns.at(-1).parts[0].text}"`);
      yield { event: "/turn/open", turn: { role: "assistant" } };
      yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
      await sleep(20);
      if (signal.aborted) throw new DOMException("aborted", "AbortError");
      yield { event: "/part/delta", index: 0, part: { text: `[${system.directions}]` } };
      yield { event: "/part/close", index: 0 };
      yield { event: "/turn/close", turn: { meta: { state: "complete" } } };
    },
  },
};

const mouth = {
  id: "mouth", channels: { in: [], out: [] },
  via: {
    stream: async function* ({ source }, { signal }) {
      for await (const chunk of source) {
        await sleep(10);
        if (signal.aborted) return;
        yield { event: "/audio/packet", pts: 0, audio: { data: btoa(chunk), rate: 16000, codec: "pcm_16000" } };
      }
    },
  },
};

const PATIENCE = Number(Deno.env.get("PATIENCE") ?? 0);
const stage = { directions: "card 1 ronda · next card 2 playa", version: 0 };
let running = null;
let superseded = 0;

const direct = (learner, card) => {
  if (running && !running.signal.aborted && !running.written) (running.abort(), superseded++);
  const mine = (running = new AbortController());
  mine.settled = (async () => {
    console.log(`${at()}  director wakes on "${learner}"`);
    await sleep(120);
    if (mine.signal.aborted) return console.log(`${at()}  director superseded, "${learner}" never written`);
    stage.directions = `graded "${learner}" · card ${card} · next card ${card + 1}`;
    stage.version++;
    mine.written = true;
    console.log(`${at()}  director writes v${stage.version}`);
  })();
};

async function* directed(packets) {
  let folded = null;
  let card = 2;
  for await (const packet of packets) {
    folded = soma.transcript(folded, packet);
    if (packet.event === "/turn/close" && folded.turns.at(-1).role === "user")
      direct(folded.turns.at(-1).parts[0].text, card++);
    yield packet;
  }
}

const script = [[0, "la ronda"], [300, "la playa"], [330, "eh, el playa"], [700, "el mar"]];
const microphone = (async function* () {
  let clock = 0;
  for (const [when, words] of script) {
    await sleep(when - clock);
    clock = when;
    yield { event: "/audio/packet", audio: { data: btoa(words), rate: 16000 } };
  }
  await sleep(300);
})();

const controller = new AbortController();
const call = cascade(ear, mind, mouth);
const packets = call.via.stream(
  { source: microphone, system: async () => {
      const asked = Date.now();
      if (PATIENCE && running) await Promise.race([running.settled, sleep(PATIENCE)]);
      if (PATIENCE) console.log(`${at()}  actor   waited ${Date.now() - asked} ms`);
      return { identity: "francesca", directions: stage.directions };
    }, turns: [], tools: undefined, settings: {} },
  { signal: controller.signal },
);
let spoken = 0;
for await (const packet of directed(packets)) if (packet.event === "/audio/packet") spoken++;
console.log(`done · audio packets ${spoken} · director writes ${stage.version} · superseded ${superseded}`);
