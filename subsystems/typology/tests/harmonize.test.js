import { specimen, verbatim } from "@vivalence/typology";

async function* script(events) {
  yield* events;
}

async function collect(stream) {
  const out = [];
  for await (const event of stream) out.push(event);
  return out;
}

const partial = (transcript) => ({ event: "/verbatim/partial", transcript });
const final = (transcript) => ({ event: "/verbatim/final", transcript });
const commits = (events) => events.filter((e) => e.event === "/verbatim/commit").map((e) => e.text);
const partials = (events) => events.filter((e) => e.event === "/verbatim/partial").map((e) => e.transcript);

specimen.describe("belt.verbatim.harmonize — LocalAgreement with tolerance", () => {
  specimen.it("commits the agreed prefix across the window, tail shrinks", async () => {
    const events = await collect(
      verbatim.harmonize(script([partial("the"), partial("the quick"), partial("the quick brown")]), { window: 2 }),
    );
    specimen.expect(commits(events)).toEqual(["the", "quick"]);
    specimen.expect(partials(events)).toEqual(["the", "quick", "brown"]);
  });

  specimen.it("never commits a flickering word", async () => {
    const events = await collect(
      verbatim.harmonize(script([partial("the quick brawn"), partial("the quick brown fox")]), { window: 2, tolerance: 1 }),
    );
    specimen.expect(commits(events)).toEqual(["the quick"]);
  });

  specimen.it("tolerates near-identical spellings", async () => {
    const events = await collect(
      verbatim.harmonize(script([partial("vivalance rocks"), partial("vivalence rocks hard")]), { window: 2, tolerance: 0.8 }),
    );
    specimen.expect(commits(events)[0]).toBe("vivalence rocks");
  });

  specimen.it("final flushes the remainder as one commit, passes through with a minted segment id", async () => {
    const events = await collect(
      verbatim.harmonize(script([partial("count to"), partial("count to three"), final("count to three now")]), { window: 2 }),
    );
    specimen.expect(commits(events)).toEqual(["count to", "three now"]);
    specimen.expect(events.at(-1)).toEqual({ event: "/verbatim/final", transcript: "count to three now", segment: 0 });
  });

  specimen.it("segment ids climb across finals; state resets across turns on one stream", async () => {
    const events = await collect(
      verbatim.harmonize(
        script([
          { event: "/turn/open", turn: { role: "user" } },
          partial("first utterance"),
          final("first utterance"),
          { event: "/turn/close" },
          { event: "/turn/open", turn: { role: "user" } },
          partial("second"),
          partial("second thought"),
          final("second thought"),
          { event: "/turn/close" },
        ]),
        { window: 2 },
      ),
    );
    specimen.expect(commits(events)).toEqual(["first utterance", "second", "thought"]);
    specimen.expect(events.filter((e) => e.event === "/verbatim/final").map((e) => e.segment)).toEqual([0, 1]);
    specimen.expect(events.filter((e) => e.event === "/turn/close").length).toBe(2);
  });

  specimen.it("caps the volatile tail", async () => {
    const long = "one two three four five six seven eight nine ten";
    const events = await collect(verbatim.harmonize(script([partial(long)]), { window: 2, tail: 3 }));
    specimen.expect(partials(events)[0]).toBe("eight nine ten");
  });

  specimen.it("passes eager, resume, and polish through untouched", async () => {
    const events = await collect(
      verbatim.harmonize(
        script([
          { event: "/verbatim/eager", transcript: "hello there" },
          { event: "/verbatim/resume" },
          { event: "/verbatim/polish", transcript: "Hello there.", segments: [0] },
        ]),
      ),
    );
    specimen.expect(events.map((e) => e.event)).toEqual(["/verbatim/eager", "/verbatim/resume", "/verbatim/polish"]);
  });

  specimen.it("commits plus final stay consistent", async () => {
    const hypotheses = ["so", "so the", "so the plan", "so the plan is", "so the plan is simple"];
    const events = await collect(
      verbatim.harmonize(script([...hypotheses.map(partial), final("so the plan is simple")]), { window: 2 }),
    );
    specimen.expect(commits(events).join(" ")).toBe("so the plan is simple");
  });
});

specimen.describe("belt.verbatim.fold — the client reduction over addressable segments", () => {
  const view = (state) => ({ committed: verbatim.transcript(state), tail: state.tail });

  specimen.it("folds commit, partial, final, polish", () => {
    let state = verbatim.fold(undefined, { event: "/turn/open", turn: { role: "user" } });
    state = verbatim.fold(state, { event: "/verbatim/commit", text: "hello" });
    state = verbatim.fold(state, { event: "/verbatim/partial", transcript: "wor" });
    specimen.expect(view(state)).toEqual({ committed: "hello", tail: "wor" });
    state = verbatim.fold(state, { event: "/verbatim/commit", text: "world" });
    specimen.expect(view(state)).toEqual({ committed: "hello world", tail: "" });
    state = verbatim.fold(state, { event: "/verbatim/final", transcript: "hello world", segment: 0 });
    specimen.expect(view(state)).toEqual({ committed: "hello world", tail: "" });
    state = verbatim.fold(state, { event: "/verbatim/polish", transcript: "Hello, world.", segments: [0] });
    specimen.expect(verbatim.transcript(state)).toBe("Hello, world.");
  });

  specimen.it("keeps every settled segment; a polish addresses its segments by id no matter when it lands", () => {
    let state = verbatim.fold(undefined, { event: "/verbatim/commit", text: "the quick" });
    state = verbatim.fold(state, { event: "/verbatim/final", transcript: "the quick fox", segment: 0 });
    state = verbatim.fold(state, { event: "/verbatim/commit", text: "jumps" });
    state = verbatim.fold(state, { event: "/verbatim/partial", transcript: "over the" });
    specimen.expect(view(state)).toEqual({ committed: "the quick fox jumps", tail: "over the" });
    state = verbatim.fold(state, { event: "/verbatim/final", transcript: "jumps over the dog", segment: 1 });
    state = verbatim.fold(state, { event: "/turn/close" });
    state = verbatim.fold(state, { event: "/turn/open", turn: { role: "user" } });
    state = verbatim.fold(state, { event: "/verbatim/partial", transcript: "and" });
    specimen.expect(view(state)).toEqual({ committed: "the quick fox jumps over the dog", tail: "and" });
    state = verbatim.fold(state, { event: "/verbatim/polish", transcript: "The quick fox jumps over the dog.", segments: [0, 1] });
    specimen.expect(view(state)).toEqual({ committed: "The quick fox jumps over the dog.", tail: "and" });
    state = verbatim.fold(state, { event: "/verbatim/final", transcript: "and then", segment: 2 });
    specimen.expect(verbatim.transcript(state)).toBe("The quick fox jumps over the dog. and then");
    state = verbatim.fold(state, { event: "/verbatim/polish", transcript: "And then.", segments: [2] });
    specimen.expect(verbatim.transcript(state)).toBe("The quick fox jumps over the dog. And then.");
  });

  specimen.it("a final carries its words into the settled entry; polish sheds them", () => {
    let state = verbatim.fold(undefined, {
      event: "/verbatim/final",
      transcript: "ciao",
      segment: 0,
      words: [{ word: "ciao", confidence: 0.97 }],
    });
    specimen.expect(state.settled[0].words).toEqual([{ word: "ciao", confidence: 0.97 }]);
    state = verbatim.fold(state, { event: "/verbatim/polish", transcript: "Ciao.", segments: [0] });
    specimen.expect(state.settled[0]).toEqual({ id: 0, text: "Ciao." });
  });

  specimen.it("ignores a polish for segments it never settled", () => {
    let state = verbatim.fold(undefined, { event: "/verbatim/final", transcript: "one", segment: 0 });
    state = verbatim.fold(state, { event: "/verbatim/polish", transcript: "Two.", segments: [7] });
    specimen.expect(verbatim.transcript(state)).toBe("one");
  });
});
