import { Controller, Cortex, Queue, shape, soma, Span, ToolCall, Vector } from "@vivalence/typology";
import { cascade } from "./cascade.copy.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const started = Date.now();
const at = () => String(Date.now() - started).padStart(4);
const POINTS = {
  frugal: [0.1, 0.9, 1.0],
  fast: [0.4, 1.0, 0.8],
  balanced: [0.5, 0.5, 0.5],
  capable: [0.9, 0.2, 0.5],
  unleashed: [1.0, 0.9, 0.1],
};

const ear = {
  type: "verbatim", id: "ear", tune: [0.8, 0.9, 0.7],
  channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
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

const actor = {
  type: "dialogue", id: "actor-mind", tune: POINTS.fast,
  channels: { in: [{ type: "text" }], out: [{ type: "event" }] },
  via: {
    stream: async function* ({ system, turns, tools }, { signal }) {
      const heard = turns.at(-1).parts[0].text;
      console.log(`${at()}  actor    tools ${tools === undefined ? "none" : "SOME"} · reads "${system.directions}" after "${heard}"`);
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
  type: "speech", id: "mouth", tune: [0.5, 0.5, 0.1],
  channels: { in: [{ type: "text" }], out: [{ type: "audio", codec: "pcm_16000" }] },
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

let dealt = 1;
const director = {
  type: "dialogue", id: "director-mind", tune: POINTS.capable,
  channels: { in: [{ type: "text" }], out: [{ type: "event" }] },
  via: {
    render: async ({ turns }) => {
      await sleep(60);
      const last = turns.at(-1);
      if (last.parts[0].type === "tool_result")
        return { role: "assistant", parts: [{ type: "text", text: "directed" }], meta: { state: "complete" } };
      const said = last.parts[0].text;
      dealt += 1;
      return {
        role: "assistant",
        parts: [
          { type: "tool_use", id: `grade_${dealt}`, name: "grade", input: { said } },
          { type: "tool_use", id: `direct_${dealt}`, name: "direct", input: { now: dealt, next: dealt + 1 } },
        ],
        meta: { state: "tools" },
      };
    },
  },
};

const buffer = { tally: [], directions: "card 1 · next card 2" };

const tools = new Vector()
  .open({ nature: new ToolCall("grade").signal.pathname }, (ctx) => {
    buffer.tally = [...buffer.tally, ctx.input.said];
    return { condition: "NOMINAL", product: { message: `graded ${ctx.input.said}` } };
  })
  .open({ nature: new ToolCall("direct").signal.pathname }, (ctx) => {
    buffer.directions = `card ${ctx.input.now} · next card ${ctx.input.next} · graded ${buffer.tally.length}`;
    return { condition: "NOMINAL", product: {} };
  });

const primer = new Vector()
  .open("identity", "You are Francesca.")
  .open("directions", () => buffer.directions);

const cortex = new Cortex(POINTS).register([cascade(ear, actor, mouth), actor, director]);
const controller = new Controller({ stdout: new Span("call") });

async function* directed(packets, sealed) {
  let turn = null;
  try {
    for await (const packet of packets) {
      turn = soma.pour(turn, packet);
      if (packet.event === "/turn/close" && turn.role === "user") sealed.enqueue(turn);
      yield packet;
    }
  } finally {
    sealed.close();
  }
}

const direct = async (sealed, push) => {
  let history = [];
  for await (const heard of sealed.drain()) {
    history = [...history, heard];
    console.log(`${at()}  director wakes on "${heard.parts[0].text}"`);
    await cortex.hallucinate.dialogue.render({
      controller: controller.branch("director"),
      system: { identity: "You are the director." },
      turns: history,
      tools,
      policy: { id: "director-mind", rounds: 3 },
    });
    const system = await shape.primer.load(primer, {});
    console.log(`${at()}  director wrote "${system.directions}"`);
    push(system);
  }
};

const call = async (microphone) => {
  const sealed = new Queue();
  const directing = direct(sealed, () => {});

  const packets = await cortex.hallucinate.call.stream({
    controller: controller.branch("call"),
    source: microphone,
    system: () => shape.primer.load(primer, {}),
    turns: [],
  });
  return { packets: directed(packets, sealed), directing };
};

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

const { packets, directing } = await call(microphone);
let spoken = 0;
let folded = null;
for await (const packet of packets) {
  if (packet.event === "/audio/packet") spoken++;
  folded = soma.transcript(folded, packet);
}
console.log(`${at()}  call ended · audio ${spoken} · turns ${folded.turns.map((turn) => turn.role[0]).join("")}`);
await directing;
console.log(`${at()}  director done · tally ${JSON.stringify(buffer.tally)}`);

console.log("--- typed, the same director");
const sealed = new Queue();
const directing2 = direct(sealed, () => {});
let turns = [];
for (const [wait, text] of [[0, "el pan"], [250, "como pan"]]) {
  await sleep(wait);
  const typed = { role: "user", parts: [{ type: "text", text }] };
  turns = [...turns, typed];
  let reply = null;
  const answered = await cortex.hallucinate.dialogue.stream({
    controller: controller.branch("typed"),
    system: await shape.primer.load(primer, {}),
    turns,
    policy: { id: "actor-mind" },
  });
  for await (const packet of answered) reply = soma.transcript(reply, packet);
  turns = [...turns, reply.turns.at(-1)];
  sealed.enqueue(typed);
}
sealed.close();
await directing2;
console.log(`${at()}  tally ${JSON.stringify(buffer.tally)}`);
