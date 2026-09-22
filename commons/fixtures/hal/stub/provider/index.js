// The stub — a hallucinator that calls nothing. It reads a script off the request and plays
// it in REAL time, so a run is long enough to hold, stop and kill while you watch the row.
// Contract: provider(service) → Faculty[], the same one anthropic keeps.
import { v } from "@vivalence/typology";
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
    yield { event: "/turn/close", meta: { state: script.close, usage: null, provider: { finish_reason: script.close, model: model.slug } } };
    return;
  }

  // a tool round, while rounds remain and the mode actually armed the tool.
  const armed = (request.tools ?? []).find((tool) => tool.name === script.tool) ?? (request.tools ?? [])[0];
  if (script.tool && armed && script.round < script.rounds) {
    yield { event: "/turn/open", turn: { role: "assistant" } };
    await pause(script.pace, signal);
    yield { event: "/part/open", index: 0, part: { type: "tool_use", id: `stub-${script.round}`, name: armed.name, input: {} } };
    yield { event: "/part/delta", index: 0, delta: { id: `stub-${script.round}`, name: armed.name, input: JSON.stringify({ query: spoken(request.turns) }) } };
    await pause(script.stall || script.pace, signal);
    yield { event: "/part/close", index: 0 };
    yield { event: "/turn/close", meta: { state: "tools" } };
    return;
  }

  // the object avenue answers once, whole — there is nothing to stream into a schema.
  if (request.output?.schema) {
    await pause(script.stall, signal);
    const data = v.fill(request.output.schema, script.object ?? shape(request.output.schema, script.say));
    yield { event: "/turn/open", turn: { role: "assistant" } };
    yield { event: "/part/open", index: 0, part: { type: "object", data } };
    yield { event: "/part/close", index: 0 };
    yield { event: "/turn/close", meta: { state: "complete" } };
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
    yield { event: "/part/delta", index: 0, delta: { text: text.slice(at * slice, (at + 1) * slice) || "." } };
  }
  yield { event: "/part/close", index: 0 };
  yield { event: "/turn/close", meta: { usage: { input: 10, output: text.length }, state: "complete" } };
}

// render is the same script, poured into one turn — the belt's soma does the pouring for a
// stream, so here it is done by hand.
async function collect(packets) {
  const parts = [];
  let meta = { state: "complete" };
  for await (const packet of packets) {
    if (packet.event === "/part/open") parts.push({ ...packet.part });
    if (packet.event === "/part/delta") {
      const part = parts.at(-1);
      if (packet.delta.text) part.text = (part.text ?? "") + packet.delta.text;
      if (packet.delta.input) Object.assign(part, { ...packet.delta, input: JSON.parse(packet.delta.input) });
    }
    if (packet.event === "/turn/close") meta = { ...meta, ...packet.meta };
  }
  const object = parts.find((part) => part.type === "object")?.data;
  return { role: "assistant", parts, meta, ...(object && { object }) };
}

const MODELS = {
  deep: { slug: "stub-deep", tune: [0.95, 1.0, 0.15, 0.15], context: 1000000 },
  middle: { slug: "stub-middle", tune: [0.6, 0.65, 0.6, 0.5], context: 1000000 },
  quick: { slug: "stub-quick", tune: [0.25, 0.3, 0.95, 0.5], context: 200000 },
};

// async by contract — paladin awaits every provider, and the real ones open a client here.
// deno-lint-ignore require-await
export default async function provider(service) {
  const statics = service.statics ?? {};
  const faculties = [];

  for (const model of Object.values(MODELS)) {
    const seat = { ...model, statics };
    faculties.push({
      type: "dialogue",
      tune: model.tune,
      context: model.context,
      channels: { in: ["text", "image", "document", "tool_result"], out: ["text", "tool_use", "object"] },
      config: { model: model.slug },
      via: {
        stream: (request, { signal } = {}) => dialogue(seat, request, signal),
        render: (request, { signal } = {}) => collect(dialogue(seat, request, signal)),
      },
    });
  }

  faculties.push({
    type: "verbatim",
    tune: [0.4, 0.6, 0.8, 0.9],
    channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
    via: {
      stream: async function* (source, settings = {}) {
        const script = plan({ settings }, statics);
        const heard = [];
        yield { event: "/turn/open", turn: { role: "user" } };
        for await (const packet of source) {
          heard.push(typeof packet.audio === "string" ? packet.audio : "·");
          await pause(script.pace);
          yield { event: "/verbatim/partial", transcript: heard.join(" ") };
        }
        await pause(script.stall);
        yield { event: "/verbatim/final", transcript: heard.join(" "), segment: 0 };
        yield { event: "/turn/close" };
      },
    },
  });

  faculties.push({
    type: "speech",
    tune: [0.3, 0.5, 0.8, 0.9],
    channels: { in: [{ type: "text" }], out: [{ type: "audio", codec: "pcm_16000" }] },
    via: {
      stream: async function* (source) {
        const chunks = typeof source === "string" ? [source] : source;
        for await (const chunk of chunks) {
          await pause(40);
          yield { event: "/audio/packet", audio: `audio:${chunk}`, rate: 16000 };
        }
        yield { event: "/audio/close" };
      },
      render: (source) => Promise.resolve({ audio: `audio:${typeof source === "string" ? source : "stream"}`, rate: 16000 }),
    },
  });

  return faculties;
}
