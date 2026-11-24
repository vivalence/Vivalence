import { Controller, Cortex, Span, ToolCall, Vector } from "@vivalence/typology";
import anthropic from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/anthropic/provider/index.js";
import openrouter from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/openrouter/provider/index.js";
import elevenlabs from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/elevenlabs/provider/index.js";
import { Cortex as Patched } from "./cortex.copy.js";
import { cascade } from "./cascade.sketch.js";
import { converse, locked } from "./converse.sketch.js";
import * as soma from "./soma.copy.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const scribeFaculty = {
  type: "verbatim",
  id: "scribe_v3_live",
  tune: [0.8, 0.9, 0.7],
  channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
  via: { stream: async function* () {} },
};
const fill = async (cortex, ear) => {
  for (const [slug, provider] of [["anthropic", anthropic], ["openrouter", openrouter], ["elevenlabs", elevenlabs]])
    cortex.register((await provider({ secrets: { key: "probe" } })).map((faculty) => ({ ...faculty, provider: slug })));
  if (ear) cortex.register({ ...scribeFaculty, provider: "elevenlabs" });
  return cortex;
};
const pick = (cortex, query) => {
  try {
    const held = cortex.findOne(query);
    return held ? [held.provider, held.id].filter(Boolean).join("/") : String(held);
  } catch (error) {
    return "THROWS " + error.message;
  }
};

console.log("--- law 6, the locked hunk's three picks on the real cortex");
const real = await fill(new Cortex(), true);
for (const type of ["verbatim", "dialogue", "speech"]) console.log(JSON.stringify({ type, via: "stream" }), "→", pick(real, { type, via: "stream" }));

console.log("--- law 6, each organ picked by its own selector");
const patched = await fill(new Patched(), true);
for (const query of [
  { type: "call", via: "stream" },
  { type: "call", via: "stream", mind: { tier: "capable" }, speak: { tier: "fast" } },
  { type: "call", via: "stream", mind: { provider: "anthropic", tier: "fast" }, speak: { id: "21m00Tcm4TlvDq8ikWAM" } },
]) console.log(JSON.stringify(query), "→", pick(patched, query));
console.log("no ear held →", pick(await fill(new Patched(), false), { type: "call", via: "stream", mind: { tier: "capable" }, speak: { tier: "fast" } }));

const scribes = {
  locked: () => function* (data) {
    switch (data.message_type) {
      case "session_started":
        yield { event: "/turn/open", turn: { role: "user" } };
        yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
        return;
      case "partial_transcript":
        yield { event: "/part/draft", index: 0, part: { text: data.text } };
        return;
      case "committed_transcript":
        yield { event: "/part/delta", index: 0, part: { text: data.text } };
        return;
    }
  },
  turned: () => {
    let speaking = false;
    return function* (data) {
      switch (data.message_type) {
        case "partial_transcript":
          if (!speaking) {
            yield { event: "/turn/open", turn: { role: "user" } };
            yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
          }
          speaking = true;
          yield { event: "/part/draft", index: 0, part: { text: data.text } };
          return;
        case "committed_transcript":
          yield { event: "/part/delta", index: 0, part: { text: data.text } };
          yield { event: "/part/close", index: 0 };
          yield { event: "/turn/close" };
          speaking = false;
          return;
      }
    };
  },
};
const ear = (translator) => ({
  ...scribeFaculty,
  via: {
    stream: async function* ({ source }, { signal }) {
      const scribe = translator();
      yield* scribe({ message_type: "session_started" });
      for await (const frame of source) {
        if (signal.aborted) return;
        yield* scribe(JSON.parse(atob(frame.audio)));
      }
    },
  },
});
const text = (...chunks) => async function* (signal) {
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  for (const chunk of chunks) {
    await sleep(15);
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    yield { event: "/part/delta", index: 0, part: { text: chunk } };
  }
  yield { event: "/part/close", index: 0 };
  yield { event: "/turn/close", meta: { state: "complete" } };
};
const tool = async function* () {
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "tool_use", id: "call_1", name: "clock", input: "" } };
  yield { event: "/part/delta", index: 0, part: { input: "{}" } };
  yield { event: "/part/close", index: 0 };
  yield { event: "/turn/close", meta: { state: "tools" } };
};
const mind = {
  type: "dialogue",
  id: "fake-mind",
  tune: [0.6, 0.4, 0.4],
  channels: { in: [{ type: "text" }], out: [{ type: "event" }] },
  via: {
    stream: ({ turns }, { signal }) => {
      const last = turns.at(-1);
      if (last.parts[0].type === "tool_result") return text("Sono le ", "tre.")(signal);
      if (last.parts[0].text.includes("ore")) return tool();
      if (last.parts[0].text.includes("storia")) return text("C'era ", "una volta ", "un re ", "molto ", "stanco.")(signal);
      return text("Dimmi.")(signal);
    },
  },
};
const mouth = {
  type: "speech",
  id: "fake-mouth",
  tune: [0.5, 0.5, 0.1],
  channels: { in: [{ type: "text" }], out: [{ type: "audio", codec: "pcm_16000" }] },
  via: {
    stream: async function* ({ source }, { signal }) {
      let pts = 0;
      for await (const chunk of source) {
        await sleep(25);
        if (signal.aborted) return;
        yield { event: "/audio/packet", audio: btoa(chunk), rate: 16000, codec: "pcm_16000", pts: (pts += 0.4) };
      }
    },
  },
};
const frame = (data) => ({ event: "/audio/packet", audio: btoa(JSON.stringify(data)), rate: 16000 });
const said = (words) => [frame({ message_type: "partial_transcript", text: words.split(" ").slice(0, 2).join(" ") }), frame({ message_type: "committed_transcript", text: words })];
const run = async (label, loop, translator, script) => {
  console.log("--- " + label);
  const controller = new Controller({ stdout: new Span("call") }).start();
  const tools = new Vector().open({ nature: new ToolCall("clock").signal.pathname }, () => ({ condition: "NOMINAL", output: { message: "15:00" } }));
  const microphone = (async function* () {
    for (const [wait, words] of script) {
      await sleep(wait);
      yield* said(words);
    }
    setTimeout(() => controller.abort.abort("hangup"), 250);
  })();
  let folded = null;
  for await (const packet of loop(cascade(ear(translator), mind, mouth), { source: microphone, system: {}, turns: [], tools: [], settings: {} }, { controller, tools })) {
    console.log(JSON.stringify(packet));
    folded = soma.transcript(folded, packet);
  }
  console.log("stored turns:");
  for (const turn of folded.turns) console.log(JSON.stringify(turn));
  if (folded.open) console.log("open:", JSON.stringify(folded.open));
};

await run("Q6 on the locked scribe translator: one turn heard", converse, scribes.locked, [[0, "che ore sono"]]);
await run("Q0, the locked loop, a tool round", locked, scribes.turned, [[0, "che ore sono"]]);
await run("the call, fixed: a tool round", converse, scribes.turned, [[0, "che ore sono"]]);
await run("the call, fixed: spoken over", converse, scribes.turned, [[0, "raccontami una storia"], [70, "aspetta"]]);
