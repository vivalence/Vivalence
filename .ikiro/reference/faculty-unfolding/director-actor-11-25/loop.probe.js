import { conversing, acting, directing } from "./conversing.js";
import * as soma from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/soma.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const started = Date.now();
const at = () => String(Date.now() - started).padStart(4);
const FAULT = Deno.env.get("FAULT") === "1";

const ear = {
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

const mouth = {
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

const SCRIPT = Deno.env.get("SCRIPT");
const primer = { identity: "Francesca, a Spanish tutor.\n" };
const requests = [];

const act = async function* (record, signal) {
  const request = acting(primer, record, 4);
  requests.push(request);
  const last = request.turns.at(-1).parts[0].text;
  console.log(`${at()}  actor    reads "${request.system.goal}" after "${last}"`);
  if (FAULT && requests.length === 2) throw new Error("mind 400");
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "thinking", text: "" } };
  yield { event: "/part/delta", index: 0, part: { text: "SECRET THOUGHT" } };
  yield { event: "/part/close", index: 0 };
  yield { event: "/part/open", index: 1, part: { type: "text", text: "" } };
  await sleep(20);
  if (signal.aborted) throw new DOMException("aborted", "AbortError");
  yield { event: "/part/delta", index: 1, part: { text: `re: ${last}` } };
  await sleep(60);
  if (signal.aborted) throw new DOMException("aborted", "AbortError");
  yield { event: "/part/close", index: 1 };
  yield { event: "/turn/close", turn: { meta: { state: "complete" } } };
};

let rounds = 0;
const SLOW = Number(Deno.env.get("SLOW") ?? 150);
const direct = async (record) => {
  const seen = directing(record);
  const learner = seen.findLast((turn) => turn.role === "user").parts[0].text;
  const round = ++rounds;
  console.log(`${at()}  director round ${round} wakes, sees ${seen.length} turns, last learner "${learner}"`);
  await sleep(SLOW);
  const said = [
    ["grade", { heard: learner }],
    ["actor_goal", { text: `card ${round + 1}: ask for it, one short sentence` }],
    ["actor_history", { text: `rep ${round}: "${learner}" graded SUCCESS` }],
    ...(round === 1 ? [["actor_language", { text: "Spanish, A1, slow" }]] : []),
  ];
  const turn = {
    role: "director",
    parts: [
      ...said.map(([name, input], index) => ({ type: "tool_use", id: `${name}_${round}_${index}`, name, input })),
      ...said.map(([name], index) => ({ type: "tool_result", id: `${name}_${round}_${index}`, product: {} })),
    ],
    meta: { state: "complete" },
  };
  console.log(`${at()}  director round ${round} stored`);
  return [turn];
};

const script = SCRIPT ? JSON.parse(SCRIPT) : [[0, "la ronda"], [300, "la playa"], [330, "eh, el playa"], [360, " "], [700, "el mar"]];
const microphone = (async function* () {
  let clock = 0;
  for (const [when, words] of script) {
    await sleep(when - clock);
    clock = when;
    yield { event: "/audio/packet", audio: { data: btoa(words), rate: 16000 } };
  }
  await sleep(Number(Deno.env.get("HANGUP") ?? 400));
})();

const controller = new AbortController();
const spoken = [];
let ended = "clean";
let stored = null;
try {
  const call = conversing(ear, mouth, { act, direct, history: [], source: microphone, settings: {} }, controller.signal);
  for await (const packet of call) {
    stored = soma.transcript(stored, packet);
    if (packet.event === "/audio/packet") spoken.push(atob(packet.audio.data));
  }
} catch (fault) {
  ended = `${at()} threw "${fault.message}" while the microphone still fed`;
}

const brief = (turn) =>
  `${turn.role.padEnd(9)} ${turn.parts.map((part) => part.text ?? part.name ?? part.type).join(" · ")}` +
  (turn.meta?.state === "interrupted" ? "  (interrupted)" : "");
console.log("\nended:", ended);
console.log("spoken:", JSON.stringify(spoken));
const record = stored.turns;
console.log("\nthe record, folded from the emitted packets alone\n" + record.map(brief).join("\n"));
console.log("director rounds:", rounds);
