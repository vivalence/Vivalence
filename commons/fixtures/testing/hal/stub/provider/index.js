// The stub — a hallucinator that calls nothing. It reads a script off the request and plays
// it in REAL time, so a run is long enough to hold, stop and kill while you watch the row.
// Contract: provider(service) → Faculty[], the same one anthropic keeps.
import { soma, v } from "@vivalence/typology";
import { plan, shape, spoken } from "./script.js";

// every gap is interruptible: the belt hands the controller's abort signal down, and a killed
// controller must not wait out a @stall.
function pause(ms, signal) {
  if (!ms || signal?.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal?.addEventListener("abort", done, { once: true });
  });
}

const fault = (script) =>
  Object.assign(new Error(`[stub] scripted ${script.fault} fault`), { retryable: script.fault === "retryable" });

async function* dialogue(model, request, signal) {
  const script = plan(request, model.statics);
  if (script.fault) throw fault(script);
  if (script.timeout) {
    while (!signal?.aborted) await pause(200, signal);
    return;
  }

  // a close with nothing in it — the provider's own verdict, no part opened.
  if (script.close) {
    yield { event: "/turn/open", turn: { role: "assistant" } };
    await pause(script.pace, signal);
    yield {
      event: "/turn/close",
      turn: {
        meta: { state: script.close, provider: { finish_reason: script.close, model: model.id } },
      },
    };
    return;
  }

  // a tool round, while rounds remain and the mode actually armed the tool.
  const armed = (request.tools ?? []).find((tool) => tool.name === script.tool) ?? (request.tools ?? [])[0];
  if (script.tool && armed && script.round < script.rounds) {
    yield { event: "/turn/open", turn: { role: "assistant" } };
    await pause(script.pace, signal);
    yield {
      event: "/part/open",
      index: 0,
      part: { type: "tool_use", id: `stub-${script.round}`, name: armed.name, input: {} },
    };
    yield { event: "/part/delta", index: 0, part: { input: { query: spoken(request.turns) } } };
    await pause(script.stall || script.pace, signal);
    yield { event: "/part/close", index: 0 };
    yield { event: "/turn/close", turn: { meta: { state: "tools" } } };
    return;
  }

  // the object avenue answers once, whole — there is nothing to stream into a schema.
  if (request.output?.schema) {
    await pause(script.stall, signal);
    const data = v.fill(request.output.schema, script.object ?? shape(request.output.schema, script.say));
    yield { event: "/turn/open", turn: { role: "assistant" } };
    yield { event: "/part/open", index: 0, part: { type: "object", data } };
    yield { event: "/part/close", index: 0 };
    yield { event: "/turn/close", turn: { meta: { state: "complete" } } };
    return;
  }

  const text = script.say;
  const grains = Math.max(1, script.deltas);
  const slice = Math.ceil(text.length / grains);
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  for (let at = 0; at < grains; at += 1) {
    await pause(at === 1 ? script.stall || script.pace : script.pace, signal);
    if (signal?.aborted) return;
    const part = { text: text.slice(at * slice, (at + 1) * slice) || "." };
    yield { event: "/part/delta", index: 0, part };
  }
  yield { event: "/part/close", index: 0 };
  yield {
    event: "/turn/close",
    turn: { meta: { usage: [
          { name: "input", unit: "tokens", amount: 10 },
          { name: "output", unit: "tokens", amount: text.length },
        ], state: "complete" } },
  };
}


const { Tune } = v.primitives.hallucination;

const Faculties = v.array(
  v.union([
    v.object({ type: v.const("dialogue"), id: v.string(), tune: Tune, context: v.integer() }),
    v.object({ type: v.const("verbatim"), id: v.string(), tune: Tune }),
    v.object({ type: v.const("speech"), id: v.string(), tune: Tune }),
  ]),
);

// async by contract — paladin awaits every provider, and the real ones open a client here.
// deno-lint-ignore require-await
export default async function provider(service) {
  const [violation] = v.faults(Faculties, service.faculties);
  if (violation) throw new Error(`[stub] faculties${violation.at} ${violation.reason}`);
  const statics = service.statics ?? {};

  const dialogueFaculty = (entry) => {
    const seat = { ...entry, statics };
    return {
      ...entry,
      type: "dialogue",
      id: entry.id,
      tune: entry.tune,
      context: entry.context,
      channels: {
        stream: {
          in: [
            { type: "text" },
            { type: "image" },
            { type: "document" },
            { type: "tool_result" },
            { type: "tool_use" },
          ],
          out: [{ type: "text" }, { type: "tool_use" }, { type: "object" }],
          via: (request, { signal } = {}) => dialogue(seat, request, signal),
        },
        render: {
          in: [
            { type: "text" },
            { type: "image" },
            { type: "document" },
            { type: "tool_result" },
            { type: "tool_use" },
          ],
          out: [{ type: "text" }, { type: "tool_use" }, { type: "object" }],
          via: (request, { signal } = {}) => soma.bridge(dialogue(seat, request, signal)),
        },
      },
    };
  };

  const verbatimFaculty = (entry) => ({
    ...entry,
    type: "verbatim",
    id: entry.id,
    tune: entry.tune,
    channels: {
      stream: {
        in: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
        out: [{ type: "text" }],
        via: async function* ({ source, settings = {} }, { signal } = {}) {
          const script = plan({ settings }, statics);
          const heard = [];
          yield { event: "/turn/open", turn: { role: "user" } };
          yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
          for await (const packet of source) {
            heard.push(packet.audio.data);
            await pause(script.pace, signal);
            yield { event: "/part/draft", index: 0, part: { text: heard.join(" ") } };
          }
          await pause(script.stall, signal);
          yield { event: "/part/delta", index: 0, part: { text: heard.join(" ") } };
          yield { event: "/part/close", index: 0 };
          yield { event: "/turn/close", turn: {} };
        },
      },
    },
  });

  const speechFaculty = (entry) => ({
    ...entry,
    type: "speech",
    id: entry.id,
    tune: entry.tune,
    channels: {
      stream: {
        in: [{ type: "text" }],
        out: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
        via: async function* ({ source }, { signal } = {}) {
          const chunks = typeof source === "string" ? [source] : source;
          for await (const chunk of chunks) {
            await pause(40, signal);
            yield { event: "/audio/packet", audio: { data: `audio:${chunk}`, mime: "audio/pcm" } };
          }
          yield { event: "/audio/close", audio: { meta: { state: "complete" } } };
        },
      },
      render: {
        in: [{ type: "text" }],
        out: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
        via: ({ source }) =>
          Promise.resolve({
            audio: `audio:${typeof source === "string" ? source : "stream"}`,
            rate: 16000,
          }),
      },
    },
  });

  const TYPES = { dialogue: dialogueFaculty, verbatim: verbatimFaculty, speech: speechFaculty };

  return service.faculties.map((entry) => TYPES[entry.type](entry));
}
