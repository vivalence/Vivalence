import { belt, specimen, v, Controller, Cortex, Span, shard, sse, Context, sleep } from "@vivalence/typology";
import { Audio, Packet } from "../schematics/primitives/hallucination.js";

const KINDS = [
  "text",
  "image",
  "audio",
  "video",
  "document",
  "object",
  "tool_use",
  "tool_result",
  "thinking",
].map((type) => ({ type }));
const ANY = { in: KINDS, out: KINDS };

const invalid = (schema, value) => [...v.errors(schema, value)].length > 0;
const conversed = (conversational = {}) =>
  belt.traits.cast({ id: "dictation", traits: ["CONVERSATIONAL"], trait: { CONVERSATIONAL: conversational } }, v.thread.traits).CONVERSATIONAL;

specimen.describe("a dictation speaks the one content grammar; audio its own family", () => {
  specimen.it("accepts every packet a dictation carries", () => {
    const packets = [
      { event: "/turn/open", turn: { role: "user", id: "0199f3a2-7c1e-7b40-9d2a-5e6f8a1b2c3d" } },
      { event: "/part/open", index: 0, part: { type: "text", text: "" } },
      { event: "/part/draft", index: 0, part: { text: "hello wor" } },
      { event: "/part/delta", index: 0, part: { text: "hello " } },
      { event: "/turn/eager" },
      { event: "/turn/resume" },
      { event: "/part/close", index: 0 },
      { event: "/turn/close", turn: { meta: { provider: { reason: "utterance" } } } },
      { event: "/part/full", index: 0, part: { type: "text", text: "Hello, world." }, turn: "0199f3a2-7c1e-7b40-9d2a-5e6f8a1b2c3d" },
    ];
    for (const packet of packets) specimen.expect(invalid(Packet.Response, packet)).toBe(false);
  });

  specimen.it("rejects the dead verbatim family and missing fields", () => {
    specimen.expect(invalid(Packet.Response, { event: "/verbatim/final", transcript: "x" })).toBe(true);
    specimen.expect(invalid(Packet.Response, { event: "/part/draft", index: 0 })).toBe(true);
    specimen.expect(invalid(Packet.Response, { event: "/part/full", index: 0, part: { text: "x" } })).toBe(true);
    specimen.expect(invalid(Packet.Response, { nature: "partial", transcript: "x" })).toBe(true);
  });

  specimen.it("audio packets demand a media type", () => {
    specimen.expect(invalid(Audio.Any, { event: "/audio/packet", audio: { data: "aGk=", mime: "audio/pcm;rate=24000;channels=1" } })).toBe(false);
    specimen.expect(invalid(Audio.Any, { event: "/audio/packet", audio: { data: "aGk=" } })).toBe(true);
    const unparsed = { event: "/audio/packet", audio: { data: "aGk=", mime: "pcm_16000" } };
    specimen.expect(invalid(Audio.Any, unparsed)).toBe(true);
    specimen.expect(invalid(Audio.Any, { event: "/audio/close", audio: {} })).toBe(false);
  });
});

const opened = () => [
  { event: "/turn/open", turn: { role: "user" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
];
const draft = (text) => ({ event: "/part/draft", index: 0, part: { text } });
const sealed = (text) => [
  { event: "/part/delta", index: 0, part: { text } },
  { event: "/part/close", index: 0 },
  { event: "/turn/close", turn: {} },
];
const spoken = (packets) =>
  packets
    .filter((packet) => packet.event === "/part/delta")
    .map((packet) => packet.part.text.trim())
    .join(" ");

function scriptedFaculty(hypotheses, final) {
  return {
    type: "verbatim",
    id: "verbatim-1",
    tune: [0.4, 0.5, 0.1],
    context: 0,
    channels: {
      stream: {
        in: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
        out: [{ type: "text" }],
        via: async function* ({ source }) {
          yield* opened();
          let index = 0;
          for await (const _ of source) {
            if (index < hypotheses.length) yield draft(hypotheses[index++]);
          }
          while (index < hypotheses.length) yield draft(hypotheses[index++]);
          yield* sealed(final);
        },
      },
    },
  };
}

function fastDialogue(correct, delay = 0, id = "dialogue-2") {
  return {
    type: "dialogue",
    id,
    tune: [0.4, 1.0, 0.8],
    context: 1000,
    channels: {
      render: {
        in: [{ type: "text" }],
        out: [{ type: "text" }],
        via: async ({ turns }) => {
          if (delay) await sleep.ms(delay);
          return {
            role: "assistant",
            parts: [{ type: "text", text: correct(turns.at(-1).parts[0].text) }],
            meta: { state: "complete" },
          };
        },
      },
    },
  };
}

const source = (chunks) =>
  sse.encode(
    (async function* () {
      for (const chunk of chunks) yield { event: "/audio/packet", audio: { data: chunk, mime: "audio/pcm" } };
    })(),
  );

const POLISH = "Punctuate and capitalize. Output only the corrected transcript.";

async function pipeline({ conversational = {}, hypotheses, final, correct, chunks = ["oi", "tudo", "bem"], polish = POLISH, delay, minds }) {
  const cortex = new Cortex().register([
    scriptedFaculty(hypotheses, final),
    ...(minds ?? [fastDialogue(correct ?? ((text) => text), delay)]),
  ]);
  const ctx = new Context({ request: { url: "http://socket/harness/verbatim/stream", body: {}, raw: { body: source(chunks) } } });
  ctx.cortex = cortex;
  ctx.controller = new Controller({ stdout: new Span("hallucination") });
  ctx.conversational = conversed(conversational);
  await shard.hal.verbatim({ polish })(ctx);
  const events = [];
  for await (const event of ctx.output) events.push(event);
  return events;
}

specimen.describe("dictation flow — hal.verbatim over the cortex", () => {
  specimen.it("a turn opens with its id, settles, closes; the polish lands after, a /part/full addressed to it", async () => {
    const packets = await pipeline({
      hypotheses: ["hello", "hello wor", "hello world how"],
      final: "hello world how are you",
      correct: (text) => text[0].toUpperCase() + text.slice(1) + "?",
    });
    const kinds = packets.map((packet) => packet.event);
    specimen.expect(kinds[0]).toBe("/turn/open");
    const id = packets[0].turn.id;
    specimen.expect(typeof id).toBe("string");
    specimen.expect(kinds.indexOf("/turn/close")).toBeLessThan(kinds.indexOf("/part/full"));
    const polish = packets.find((packet) => packet.event === "/part/full");
    specimen.expect(polish).toEqual({
      event: "/part/full",
      index: 0,
      part: { type: "text", text: "Hello world how are you?" },
      turn: id,
    });
    for (const packet of packets) specimen.expect([...v.errors(Packet.Response, packet)]).toEqual([]);
  });

  specimen.it("settled deltas spell the utterance once; polish.engaged false yields no repair", async () => {
    const packets = await pipeline({
      hypotheses: ["so the", "so the plan", "so the plan is"],
      final: "so the plan is simple",
      correct: (text) => text.toUpperCase(),
      conversational: { polish: { id: "dialogue-2", engaged: false } },
    });
    specimen.expect(spoken(packets)).toBe("so the plan is simple");
    specimen.expect(packets.some((packet) => packet.event === "/part/full")).toBe(false);
  });

  specimen.it("polish.id picks the model that repairs; the repair asks for no reasoning", async () => {
    const asked = [];
    const efforts = [];
    const mind = (id) => ({
      ...fastDialogue((text) => `${id}: ${text}`, 0, id),
      channels: {
        render: {
          ...ANY,
          via: async ({ turns, settings }) => {
            asked.push(id);
            efforts.push(settings.effort);
            return { role: "assistant", parts: [{ type: "text", text: `${id}: ${turns.at(-1).parts[0].text}` }], meta: { state: "complete" } };
          },
        },
      },
    });
    const packets = await pipeline({
      hypotheses: ["ciao"],
      final: "ciao",
      conversational: { polish: { id: "lite" } },
      minds: [mind("dialogue-2"), mind("lite")],
    });
    specimen.expect(asked).toEqual(["lite"]);
    specimen.expect(efforts).toEqual(["none"]);
    specimen.expect(packets.find((packet) => packet.event === "/part/full").part.text).toBe("lite: ciao");
  });

  specimen.it("polish failure degrades silently, the words intact, the stream closes", async () => {
    const cortex = new Cortex().register([
      scriptedFaculty(["hi"], "hi there"),
      { ...fastDialogue((text) => text), channels: { render: { ...ANY, via: async () => { throw new Error("provider down"); } } } },
    ]);
    const ctx = new Context({ request: { url: "http://socket/harness/verbatim/stream", body: {}, raw: { body: source(["hi"]) } } });
    ctx.cortex = cortex;
    ctx.controller = new Controller({ stdout: new Span("hallucination") });
    ctx.conversational = conversed();
    await shard.hal.verbatim({ polish: POLISH })(ctx);
    const packets = [];
    for await (const packet of ctx.output) packets.push(packet);
    specimen.expect(spoken(packets)).toBe("hi there");
    specimen.expect(packets.some((packet) => packet.event === "/part/full")).toBe(false);
    specimen.expect(packets.at(-1).event).toBe("/turn/close");
  });

  specimen.it("polish is concurrent — a slow repair never holds the next turn's packets", async () => {
    const turns = async function* () {
      for (const utterance of [["one", "one two"], ["three"]]) {
        yield* opened();
        for (const hypothesis of utterance) yield draft(hypothesis);
        yield* sealed(utterance.at(-1));
        await sleep.ms(5);
      }
    };
    const faculty = { ...scriptedFaculty([], ""), channels: { stream: { ...ANY, via: () => turns() } } };
    const cortex = new Cortex().register([faculty, fastDialogue((text) => text.toUpperCase(), 60)]);
    const ctx = new Context({ request: { url: "http://socket/harness/verbatim/stream", body: {}, raw: { body: source(["x"]) } } });
    ctx.cortex = cortex;
    ctx.controller = new Controller({ stdout: new Span("hallucination") });
    ctx.conversational = conversed();
    await shard.hal.verbatim({ polish: POLISH })(ctx);
    const opens = [];
    const order = [];
    for await (const packet of ctx.output) {
      if (packet.event === "/turn/open") opens.push(packet.turn.id);
      order.push(packet.event === "/part/full" ? `polish:${opens.indexOf(packet.turn)}` : packet.event);
    }
    const secondOpen = order.indexOf("/turn/open", 1);
    specimen.expect(order.indexOf("polish:0")).toBeGreaterThan(secondOpen);
    specimen.expect(order.filter((entry) => entry.startsWith("polish:"))).toEqual(["polish:0", "polish:1"]);
  });

  specimen.it("CONVERSATIONAL harmonize options reach the harmonizer", async () => {
    const loose = await pipeline({
      hypotheses: ["one two three four five", "one two three four five six"],
      final: "one two three four five six",
      conversational: { polish: { engaged: false }, harmonize: { tail: 2 } },
    });
    for (const packet of loose.filter((packet) => packet.event === "/part/draft")) {
      specimen.expect(packet.part.text.split(" ").length <= 2).toBe(true);
    }
  });
});
