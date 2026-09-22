import { specimen } from "@vivalence/typology";
import provider from "../provider/index.js";
import { plan, prose, read, round, shape } from "../provider/script.js";

const said = (text) => ({ role: "user", parts: [{ type: "text", text }] });
const answered = (name) => ({ role: "user", parts: [{ type: "tool_result", id: "x", name }] });
const drain = async (packets) => {
  const held = [];
  for await (const packet of packets) held.push(packet);
  return held;
};

const STATICS = { scripts: { slow: "--pace 200ms --deltas 40", hung: "--timeout" } };

specimen.describe("stub · the script is a pure function of the request", () => {
  specimen.it("reads flags out of prose and leaves the prose alone", () => {
    const held = plan({ turns: [said("tell me about flamingos --deltas 6 --stall 3s")] });
    specimen.expect([held.deltas, held.stall, held.pace]).toEqual([6, 3000, 40]);
    specimen.expect(held.say).toBe("[stub] tell me about flamingos");
    specimen.expect(prose("a --deltas 6 b")).toBe("a b");
  });

  specimen.it("--run expands a declared script, and a written flag still beats it", () => {
    specimen.expect(read("--run slow", STATICS.scripts)).toMatchObject({ pace: 200, deltas: 40 });
    specimen.expect(read("--run slow --deltas 4", STATICS.scripts)).toMatchObject({ pace: 200, deltas: 4 });
  });

  specimen.it("settings.script beats the prompt, so a caller that never types can script the run", () => {
    const held = plan({ turns: [said("hello --deltas 2")], settings: { script: "--deltas 9" } }, STATICS);
    specimen.expect(held.deltas).toBe(9);
  });

  specimen.it("the round is READ off the turns — the same request twice is the same answer", () => {
    specimen.expect(round([said("x")])).toBe(0);
    specimen.expect(round([said("x"), answered("lookup")])).toBe(1);
  });

  specimen.it("an object with no --object is filled off the schema, every leaf deterministic", () => {
    const schema = { type: "object", properties: { answer: { type: "string" }, count: { type: "integer" }, tags: { type: "array", items: { type: "string" } } } };
    specimen.expect(shape(schema, "said")).toEqual({ answer: "said", count: 42, tags: ["said"] });
  });
});

specimen.describe("stub · the faculties", () => {
  specimen.it("registers dialogue at three tunes plus verbatim and speech", async () => {
    const faculties = await provider({ statics: {} });
    specimen.expect(faculties.filter((faculty) => faculty.type === "dialogue").length).toBe(3);
    specimen.expect(faculties.map((faculty) => faculty.type)).toContain("verbatim");
    specimen.expect(faculties.map((faculty) => faculty.type)).toContain("speech");
  });

  specimen.it("streams the scripted number of deltas, and takes the scripted time doing it", async () => {
    const [deep] = await provider({ statics: {} });
    const started = performance.now();
    const events = (await drain(deep.via.stream({ turns: [said("hi --deltas 4 --pace 30ms")] }))).map((packet) => packet.event);
    specimen.expect(events.filter((event) => event === "/part/delta").length).toBe(4);
    specimen.expect(events.at(-1)).toBe("/turn/close");
    specimen.expect(performance.now() - started >= 90).toBe(true);
  });

  specimen.it("calls the armed tool for --rounds, then answers — the round comes off the turns", async () => {
    const [deep] = await provider({ statics: {} });
    const tools = [{ name: "lookup" }];
    const first = await drain(deep.via.stream({ tools, turns: [said("go --tool lookup --rounds 2 --pace 1ms")] }));
    specimen.expect(first.at(-1).meta.state).toBe("tools");
    specimen.expect(first.find((packet) => packet.part?.type === "tool_use").part.name).toBe("lookup");
    const third = await drain(deep.via.stream({ tools, turns: [said("go --tool lookup --rounds 2 --pace 1ms"), answered("lookup"), answered("lookup")] }));
    specimen.expect(third.at(-1).meta.state).toBe("complete");
  });

  specimen.it("a stall is interruptible: the abort signal cuts it, it is not waited out", async () => {
    const [deep] = await provider({ statics: {} });
    const abort = new AbortController();
    setTimeout(() => abort.abort("SIGKILL"), 60);
    const started = performance.now();
    await drain(deep.via.stream({ turns: [said("wait --stall 30s --deltas 3")] }, { signal: abort.signal }));
    specimen.expect(performance.now() - started < 1000).toBe(true);
  });

  specimen.it("--timeout yields nothing until the signal ends it — the row that will not die", async () => {
    const [deep] = await provider({ statics: STATICS });
    const abort = new AbortController();
    setTimeout(() => abort.abort("SIGKILL"), 80);
    const events = await drain(deep.via.stream({ turns: [said("--run hung")] }, { signal: abort.signal }));
    specimen.expect(events).toEqual([]);
  });

  specimen.it("--fault retryable throws with the flag the belt's backoff reads", async () => {
    const [deep] = await provider({ statics: {} });
    const thrown = await deep.via.render({ turns: [said("x --fault retryable")] }).catch((error) => error);
    specimen.expect(thrown.retryable).toBe(true);
    const fatal = await deep.via.render({ turns: [said("x --fault")] }).catch((error) => error);
    specimen.expect(fatal.retryable).toBe(false);
  });

  specimen.it("--close length seals an assistant turn with NO parts and that state — what gpt-5.1 did on 09-23", async () => {
    const [deep] = await provider({ statics: {} });
    const events = await drain(deep.via.stream({ turns: [said("hi --close length")] }));
    specimen.expect(events.map((event) => event.event)).toEqual(["/turn/open", "/turn/close"]);
    specimen.expect(events.at(-1).meta).toEqual({ state: "length", usage: null, provider: { finish_reason: "length", model: "stub-deep" } });
    const turn = await deep.via.render({ turns: [said("hi --close filter")] });
    specimen.expect(turn.parts).toEqual([]);
    specimen.expect(turn.meta.state).toBe("filter");
  });

  specimen.it("render pours the same script into one turn, object included", async () => {
    const [deep] = await provider({ statics: {} });
    const turn = await deep.via.render({
      turns: [said("x --object '{\"answer\":\"42\"}'")],
      output: { schema: { type: "object", properties: { answer: { type: "string" } }, required: ["answer"] } },
    });
    specimen.expect(turn.object).toEqual({ answer: "42" });
    specimen.expect(turn.meta.state).toBe("complete");
  });

  specimen.it("verbatim transcribes the packets it was fed, speech answers audio", async () => {
    const faculties = await provider({ statics: {} });
    const verbatim = faculties.find((faculty) => faculty.type === "verbatim");
    const speech = faculties.find((faculty) => faculty.type === "speech");
    async function* frames() {
      yield { event: "/audio/packet", audio: "buon" };
      yield { event: "/audio/packet", audio: "giorno" };
    }
    const events = await drain(verbatim.via.stream(frames(), { script: "--pace 1ms" }));
    specimen.expect(events.at(-2)).toMatchObject({ event: "/verbatim/final", transcript: "buon giorno" });
    specimen.expect((await drain(speech.via.stream(["ciao"]))).at(0).event).toBe("/audio/packet");
  });
});
