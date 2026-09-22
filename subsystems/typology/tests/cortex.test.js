import { specimen, belt, Controller, Cortex, Span, Vector, nearest, shard, v } from "@vivalence/typology";
import { metronome } from "./scenarios/metronome.js";

function mockFaculties() {
  const text = (tag) => ({
    role: "assistant",
    parts: [{ type: "text", text: tag }],
    meta: { stop: "end_turn" },
  });

  return [
    {
      type: "dialogue", tune: [0.9, 1.0, 0.3, 0.5],
      channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
      via: {
        render: async () => text("[opus]"),
        stream: async function* () { yield { event: "/turn/open", turn: { role: "assistant" } }; yield { event: "/turn/close", meta: {} }; },
      },
    },
    {
      type: "dialogue", tune: [0.4, 0.6, 0.6, 0.5],
      channels: { in: ["text"], out: ["text"] },
      via: {
        render: async () => text("[sonnet]"),
        stream: async function* () { yield { event: "/turn/open", turn: { role: "assistant" } }; yield { event: "/turn/close", meta: {} }; },
      },
    },
    {
      type: "dialogue", tune: [0.1, 0.3, 1.0, 0.5],
      channels: { in: ["text"], out: ["text"] },
      via: { render: async () => text("[haiku]") },
    },
    {
      type: "speech", tune: [0.3, 0.8, 0.7, 0.2],
      channels: { in: ["text"], out: ["audio"] },
      via: {
        render: async () => ({ role: "assistant", parts: [{ type: "audio", data: "abc", media: "audio/mp3" }], meta: {} }),
        stream: async function* () { yield { event: "/turn/open", turn: { role: "assistant" } }; yield { event: "/turn/close", meta: {} }; },
      },
    },
    {
      type: "object", tune: [0.3, 0.7, 0.8, 0.5],
      channels: { in: ["text"], out: ["object"] },
      via: { render: async () => ({ role: "assistant", parts: [{ type: "object", data: {} }], meta: {} }) },
    },
  ];
}

function populatedCortex() {
  return new Cortex().register(mockFaculties());
}

specimen.describe("Cortex", () => {
  specimen.it("a cortex registers its faculties", () => {
    const populated = populatedCortex();
    specimen.expect(populated.find({ type: "dialogue" })).toHaveLength(3);
    specimen.expect(populated.find({ type: "speech" })).toHaveLength(1);
    specimen.expect(populated.find({ type: "object" })).toHaveLength(1);
    specimen.expect(populated.find({ type: "nonexistent" })).toHaveLength(0);
    specimen.expect(populated.find()).toHaveLength(5);
    specimen.expect(populated.find({ type: "dialogue", via: "stream" })).toHaveLength(2);

    const additive = new Cortex();
    specimen.expect(additive.register([mockFaculties()[0]])).toBe(additive);
    additive.register([mockFaculties()[1]]);
    specimen.expect(additive.find({ type: "dialogue" })).toHaveLength(2);

    specimen.expect(new Cortex().register(mockFaculties()[0]).find({ type: "dialogue" })).toHaveLength(1);

    const supplied = {
      type: "dialogue", tune: [0.2, 0.4, 0.8],
      channels: { in: ["text"], out: ["text"] },
      via: { render: async () => ({}) },
    };
    const padded = new Cortex().register([supplied]);
    specimen.expect(supplied.tune).toEqual([0.2, 0.4, 0.8]);
    specimen.expect(padded.find({ type: "dialogue" })[0].tune).toEqual([0.2, 0.4, 0.8, 0.5]);

    let error = null;
    try { new Cortex().register([{ type: "dialogue", tune: [0.5, 0.5, 0.5] }]); } catch (thrown) { error = thrown; }
    specimen.expect(error.message).toContain("invalid faculty");
  });

  specimen.it("a query tunes to the nearest faculty", () => {
    const cortex = populatedCortex();

    specimen.expect(cortex.findOne({ type: "dialogue", tune: "unleashed" }).tune).toEqual([0.9, 1.0, 0.3, 0.5]);
    specimen.expect(cortex.findOne({ type: "dialogue", tune: "frugal" }).tune).toEqual([0.1, 0.3, 1.0, 0.5]);
    specimen.expect(cortex.findOne({ type: "dialogue" }).tune).toEqual([0.4, 0.6, 0.6, 0.5]);

    const streamable = cortex.findOne({ type: "dialogue", tune: "frugal", via: "stream" });
    specimen.expect(streamable.via.stream).toBeDefined();
    specimen.expect(streamable.tune).not.toEqual([0.1, 0.3, 1.0, 0.5]);

    let error = null;
    try { cortex.findOne({ type: "dialogue", via: "teleport" }); } catch (thrown) { error = thrown; }
    specimen.expect(error.message).toContain("invalid query");

    const supplied = { type: "dialogue" };
    cortex.findOne(supplied);
    cortex.find(supplied);
    specimen.expect(supplied).toEqual({ type: "dialogue" });

    specimen.expect(cortex.findOne({ type: "verbatim" })).toBe(undefined);
    specimen.expect(cortex.findOne({ type: "nonexistent" })).toBe(undefined);

    const dialogues = mockFaculties().filter((faculty) => faculty.type === "dialogue");
    specimen.expect(nearest(dialogues, "unleashed").tune).toEqual([0.9, 1.0, 0.3, 0.5]);
    specimen.expect(nearest(dialogues, "frugal").tune).toEqual([0.1, 0.3, 1.0, 0.5]);
    specimen.expect(nearest(dialogues, "balanced").tune).toEqual([0.4, 0.6, 0.6, 0.5]);

    const spread = [
      { tune: [0.1, 0.1, 0.1, 0.1] },
      { tune: [0.5, 0.5, 0.5, 0.5] },
      { tune: [0.9, 0.9, 0.9, 0.9] },
    ];
    specimen.expect(nearest(spread, "nonexistent").tune).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  specimen.it("the object avenue derives from a dialogue donor; the provider owns structured output", async () => {
    const donorOnly = new Cortex().register([mockFaculties()[0]]);
    specimen.expect(donorOnly.find({ type: "object" })).toHaveLength(0);
    const derived = donorOnly.findOne({ type: "object" });
    specimen.expect(derived).toBeDefined();
    specimen.expect(derived.via.render).toBeDefined();
    specimen.expect(donorOnly.findOne({ type: "object", via: "stream" })).toBe(undefined);

    specimen.expect(populatedCortex().findOne({ type: "object" }).tune).toEqual([0.3, 0.7, 0.8, 0.5]);

    specimen.expect(new Cortex().register([mockFaculties()[3]]).findOne({ type: "object" })).toBe(undefined);
  });

  specimen.it("hallucinate: gate → fill → lowered Request; verbatim.render derives from the stream", async () => {
    const { Request } = v.primitives.hallucination;
    const clock = metronome([{ packets: [{ event: "/turn/full", turn: { role: "assistant", parts: [{ type: "text", text: "ok" }], meta: { state: "complete" } } }] }]);
    const spoken = metronome([{ packets: [{ event: "/verbatim/final", transcript: "buongiorno", segment: 0 }] }], "verbatim");
    const cortex = new Cortex().register([clock.faculty, spoken.faculty]);
    specimen.expect(cortex.hallucinator).toBe(undefined);
    specimen.expect(new Cortex().hallucinate).not.toBe(cortex.hallucinate);
    specimen.expect(cortex.hallucinate).toBe(cortex.hallucinate);

    await specimen.expect(cortex.hallucinate.dialogue.render({ turns: [] })).rejects.toThrow(/controller/);
    await specimen.expect(cortex.hallucinate.dialogue.render({ controller: {}, turns: [] })).rejects.toThrow(/requires a controller/);
    await specimen.expect(cortex.hallucinate.dialogue.render({ controller: new Controller(), turns: "no" })).rejects.toThrow(/invalid dialogue hallucination \/turns: /);
    specimen.expect(clock.seen.requests).toEqual([]);

    const root = new Controller({ stdout: new Span("hallucination") });
    clock.release(1);
    const folded = await cortex.hallucinate.dialogue.render({ controller: root, system: { a: "1", b: "2" }, turns: [], tools: new Vector(), policy: { cache: { marks: ["b"] } } });
    specimen.expect(folded.meta.state).toBe("complete");

    const [request] = clock.seen.requests;
    specimen.expect([...Request.errors(request)]).toEqual([]);
    specimen.expect(request).not.toHaveProperty("policy");
    specimen.expect(request).not.toHaveProperty("controller");
    specimen.expect(request.cache).toEqual({ marks: ["b"] });
    specimen.expect((await root.settled).code).toBe("DONE");

    spoken.release(1);
    const heard = new Controller({ stdout: new Span("hallucination") });
    const text = await cortex.hallucinate.verbatim.render({ controller: heard, source: (async function* () {})(), policy: { harmonize: { window: 1 } } });
    specimen.expect(text).toBe("buongiorno");
    specimen.expect((await heard.settled).code).toBe("DONE");
    specimen.expect(shard.hallucinate.routing([{ nature: "verbatim" }, { nature: "render" }])).toEqual({ avenue: "verbatim", via: "render" });
  });

  specimen.it("the choice avenue: several questions of one primer, tagged by shape, bounded by the faculty, a distribution per key in the question's own shape", async () => {
    const seen = [];
    const answered = (question) =>
      question.options
        ? Object.fromEntries(Object.keys(question.options).map((name, index) => [name, index === 0 ? 0.9 : 0.1 / (Object.keys(question.options).length - 1)]))
        : question.levels
        ? question.levels.map((_, index) => (index === 1 ? 0.9 : 0.1 / (question.levels.length - 1)))
        : 0.9;
    const chooser = {
      type: "choice", tune: [0.4, 0.3, 1.0, 0.9], context: 32000, options: 3, choices: 3,
      channels: { in: ["text", "object"], out: ["object"] },
      config: { model: "bench/chooser" },
      via: { render: async (round) => { seen.push(round); return Object.fromEntries(Object.entries(round.questions).map(([key, question]) => [key, answered(question)])); } },
    };
    const cortex = new Cortex().register([chooser]);
    specimen.expect(cortex.findOne({ type: "choice", via: "stream" })).toBe(undefined);
    const primer = { expected: "Vado al mercato.", answer: "Io vado al mercato domani." };
    await specimen.expect(cortex.hallucinate.choice.render({ controller: new Controller(), primer, questions: {} })).rejects.toThrow(/a choice asks at least one question/);
    await specimen.expect(cortex.hallucinate.choice.render({ controller: new Controller(), primer, questions: { one: { ask: "?", options: { only: null } } } })).rejects.toThrow(/"one" carries 1 option\(s\); a set is two or more/);
    await specimen.expect(cortex.hallucinate.choice.render({ controller: new Controller(), primer, questions: { one: { type: "score", ask: "?", options: { a: null, b: null } } } })).rejects.toThrow(/invalid choice hallucination \/questions\/one/);

    const heard = new Controller({ stdout: new Span("choice") });
    const verdict = await cortex.hallucinate.choice.render({
      controller: heard,
      primer,
      questions: {
        same: { type: "choice", ask: "Does `answer` mean `expected`?", options: { yes: null, partly: "extra or missing detail", no: null } },
        grade: { ask: "How close is `answer` to `expected`?", levels: ["wrong", "close", "exact"] },
        ok: { ask: "Is `answer` grammatical Italian?" },
      },
    });
    specimen.expect(Object.entries(seen[0].questions).map(([key, question]) => [key, question.type])).toEqual([["same", "choice"], ["grade", "score"], ["ok", "noul"]]);
    specimen.expect(seen[0].primer).toEqual(primer);
    specimen.expect(verdict.same).toEqual({ yes: 0.9, partly: 0.05, no: 0.05 });
    specimen.expect(verdict.grade).toEqual([0.05, 0.9, 0.05]);
    specimen.expect(verdict.ok).toBe(0.9);
    specimen.expect([...v.primitives.hallucination.Choice.Verdict.errors(verdict)]).toEqual([]);
    specimen.expect(heard.stdout.records.map((record) => record.verb)).toEqual(["open", "note", "note", "close"]);
    specimen.expect(heard.stdout.records[1].data).toEqual({ faculty: "choice", model: "bench/chooser", questions: { same: "choice", grade: "score", ok: "noul" } });
    specimen.expect(heard.stdout.records[2].data.verdict).toEqual(verdict);

    const four = { a: null, b: null, c: null, d: null };
    await specimen.expect(cortex.hallucinate.choice.render({ controller: new Controller(), primer, questions: { wide: { ask: "?", options: four } } })).rejects.toThrow(/'bench\/chooser' holds 3 options; "wide" carries 4/);
    await specimen.expect(cortex.hallucinate.choice.render({ controller: new Controller(), primer, questions: { a: { ask: "?" }, b: { ask: "?" }, c: { ask: "?" }, d: { ask: "?" } } })).rejects.toThrow(/'bench\/chooser' renders 3 question\(s\) at once; 4 asked/);

    await specimen.expect(new Cortex().hallucinate.choice.render({ controller: new Controller(), primer, questions: { ok: { ask: "?" } } })).rejects.toThrow(/no 'choice' faculty resolves a 'render' avenue/);
  });
});
