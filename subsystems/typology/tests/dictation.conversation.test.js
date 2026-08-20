import { specimen, v, Cortex, shard, sse, Context, sleep } from "@vivalence/typology";
import { Verbatim, Audio } from "../schematics/primitives/hallucination.js";

const invalid = (schema, value) => [...v.errors(schema, value)].length > 0;

specimen.describe("Verbatim + Audio packet families", () => {
  specimen.it("accepts every verbatim event", () => {
    const events = [
      { event: "/turn/open", turn: { role: "user" } },
      { event: "/verbatim/commit", text: "hello" },
      { event: "/verbatim/partial", transcript: "wor" },
      { event: "/verbatim/eager", transcript: "hello world" },
      { event: "/verbatim/resume" },
      { event: "/verbatim/final", transcript: "hello world", segment: 0, words: [{ word: "hello", start: 0, end: 0.4, confidence: 0.98, language: "en" }] },
      { event: "/verbatim/polish", transcript: "Hello, world.", segments: [0] },
      { event: "/turn/close", meta: { reason: "utterance" } },
    ];
    for (const event of events) specimen.expect(invalid(Verbatim.Any, event)).toBe(false);
  });

  specimen.it("rejects unknown events and missing fields", () => {
    specimen.expect(invalid(Verbatim.Any, { event: "/verbatim/mystery" })).toBe(true);
    specimen.expect(invalid(Verbatim.Any, { event: "/verbatim/commit" })).toBe(true);
    specimen.expect(invalid(Verbatim.Any, { event: "/verbatim/polish", transcript: "x" })).toBe(true);
    specimen.expect(invalid(Verbatim.Any, { nature: "partial", transcript: "x" })).toBe(true);
  });

  specimen.it("audio packets demand a rate", () => {
    specimen.expect(invalid(Audio.Any, { event: "/audio/packet", audio: "aGk=", rate: 24000 })).toBe(false);
    specimen.expect(invalid(Audio.Any, { event: "/audio/packet", audio: "aGk=" })).toBe(true);
    specimen.expect(invalid(Audio.Any, { event: "/audio/close" })).toBe(false);
  });
});

function scriptedFaculty(hypotheses, final) {
  return {
    type: "verbatim",
    tune: [0.4, 0.6, 0.5, 0.1],
    context: 0,
    channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
    via: {
      stream: async function* (audioSource) {
        yield { event: "/turn/open", turn: { role: "user" } };
        let index = 0;
        for await (const _ of audioSource) {
          if (index < hypotheses.length) yield { event: "/verbatim/partial", transcript: hypotheses[index++] };
        }
        while (index < hypotheses.length) yield { event: "/verbatim/partial", transcript: hypotheses[index++] };
        yield { event: "/verbatim/final", transcript: final };
        yield { event: "/turn/close" };
      },
    },
  };
}

function fastDialogue(correct, delay = 0) {
  return {
    type: "dialogue",
    tune: [0.4, 0.3, 1.0, 0.8],
    context: 1000,
    channels: { in: ["text"], out: ["text"] },
    via: {
      render: async ({ turns }) => {
        if (delay) await sleep.ms(delay);
        return {
          role: "assistant",
          parts: [{ type: "text", text: correct(turns.at(-1).parts[0].text) }],
          meta: { state: "complete" },
        };
      },
    },
  };
}

const source = (chunks) =>
  sse.encode(
    (async function* () {
      for (const chunk of chunks) yield { event: "/audio/packet", audio: chunk, rate: 16000 };
    })(),
  );

const POLISH = "Punctuate and capitalize. Output only the corrected transcript.";

async function pipeline({ vocal = {}, hypotheses, final, correct, chunks = ["oi", "tudo", "bem"], polish = POLISH, delay }) {
  const cortex = new Cortex().register([
    scriptedFaculty(hypotheses, final),
    fastDialogue(correct ?? ((text) => text), delay),
  ]);
  const ctx = new Context({ request: { url: "http://socket/harness/verbatim/stream", body: {}, raw: { body: source(chunks) } } });
  ctx.daemon = { cortex };
  ctx.vocal = vocal;
  await shard.hal.verbatim({ polish })(ctx);
  const events = [];
  for await (const event of ctx.output) events.push(event);
  return events;
}

specimen.describe("dictation flow — hal.verbatim over the cortex", () => {
  specimen.it("yields turn/open, commits, partials, final, polish, turn/close — every one a Verbatim event", async () => {
    const events = await pipeline({
      hypotheses: ["hello", "hello wor", "hello world how"],
      final: "hello world how are you",
      correct: (text) => text[0].toUpperCase() + text.slice(1) + "?",
    });
    const kinds = events.map((event) => event.event);
    specimen.expect(kinds[0]).toBe("/turn/open");
    specimen.expect(kinds.indexOf("/verbatim/final")).toBeLessThan(kinds.indexOf("/verbatim/polish"));
    specimen.expect(kinds.indexOf("/turn/close")).toBeLessThan(kinds.indexOf("/verbatim/polish"));
    const polish = events.find((event) => event.event === "/verbatim/polish");
    specimen.expect(polish).toEqual({ event: "/verbatim/polish", transcript: "Hello world how are you?", segments: [0] });
    for (const event of events) specimen.expect([...v.errors(Verbatim.Any, event)].length).toBe(0);
  });

  specimen.it("commits are append-only and consistent with final; polish:false yields none", async () => {
    const events = await pipeline({
      hypotheses: ["so the", "so the plan", "so the plan is"],
      final: "so the plan is simple",
      vocal: { polish: false },
    });
    const committed = events.filter((event) => event.event === "/verbatim/commit").map((event) => event.text).join(" ");
    specimen.expect(committed).toBe("so the plan is simple");
    specimen.expect(events.some((event) => event.event === "/verbatim/polish")).toBe(false);
  });

  specimen.it("polish failure degrades silently, final intact, stream closes", async () => {
    const cortex = new Cortex().register([
      scriptedFaculty(["hi"], "hi there"),
      { ...fastDialogue((text) => text), via: { render: async () => { throw new Error("provider down"); } } },
    ]);
    const ctx = new Context({ request: { url: "http://socket/harness/verbatim/stream", body: {}, raw: { body: source(["hi"]) } } });
    ctx.daemon = { cortex };
    ctx.vocal = {};
    await shard.hal.verbatim({ polish: POLISH })(ctx);
    const events = [];
    for await (const event of ctx.output) events.push(event);
    specimen.expect(events.find((event) => event.event === "/verbatim/final").transcript).toBe("hi there");
    specimen.expect(events.some((event) => event.event === "/verbatim/polish")).toBe(false);
    specimen.expect(events.at(-1).event).toBe("/turn/close");
  });

  specimen.it("polish is concurrent — a slow repair never holds the next turn's events", async () => {
    const turns = async function* () {
      for (const utterance of [["one", "one two"], ["three"]]) {
        yield { event: "/turn/open", turn: { role: "user" } };
        for (const hypothesis of utterance) yield { event: "/verbatim/partial", transcript: hypothesis };
        yield { event: "/verbatim/final", transcript: utterance.at(-1) };
        yield { event: "/turn/close" };
        await sleep.ms(5);
      }
    };
    const faculty = { ...scriptedFaculty([], ""), via: { stream: () => turns() } };
    const cortex = new Cortex().register([faculty, fastDialogue((text) => text.toUpperCase(), 60)]);
    const ctx = new Context({ request: { url: "http://socket/harness/verbatim/stream", body: {}, raw: { body: source(["x"]) } } });
    ctx.daemon = { cortex };
    ctx.vocal = {};
    await shard.hal.verbatim({ polish: POLISH })(ctx);
    const order = [];
    for await (const event of ctx.output) order.push(event.event === "/verbatim/polish" ? `polish:${event.segments}` : event.event);
    const secondOpen = order.indexOf("/turn/open", 1);
    specimen.expect(order.indexOf("polish:0")).toBeGreaterThan(secondOpen);
    specimen.expect(order.filter((entry) => entry.startsWith("polish:"))).toEqual(["polish:0", "polish:1"]);
  });

  specimen.it("VOCAL harmonize options reach the harmonizer", async () => {
    const loose = await pipeline({
      hypotheses: ["one two three four five", "one two three four five six"],
      final: "one two three four five six",
      vocal: { polish: false, harmonize: { tail: 2 } },
    });
    for (const event of loose.filter((event) => event.event === "/verbatim/partial")) {
      specimen.expect(event.transcript.split(" ").length <= 2).toBe(true);
    }
  });
});
