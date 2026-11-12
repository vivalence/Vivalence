import { soma, specimen, verbatim } from "@vivalence/typology";

async function* script(packets) {
  yield* packets;
}

async function collect(stream) {
  const out = [];
  for await (const packet of stream) out.push(packet);
  return out;
}

const draft = (text) => ({ event: "/part/draft", index: 0, part: { text } });
const commit = (text) => ({ event: "/part/delta", index: 0, part: { text } });
const deltas = (packets) => packets.filter((p) => p.event === "/part/delta").map((p) => p.part.text.trim());
const drafts = (packets) => packets.filter((p) => p.event === "/part/draft").map((p) => p.part.text);

specimen.describe("belt.verbatim.harmonize — LocalAgreement with tolerance, over drafts", () => {
  specimen.it("settles the agreed prefix across the window as deltas, the draft tail shrinks", async () => {
    const packets = await collect(
      verbatim.harmonize(script([draft("the"), draft("the quick"), draft("the quick brown")]), { window: 2 }),
    );
    specimen.expect(deltas(packets)).toEqual(["the", "quick"]);
    specimen.expect(drafts(packets)).toEqual(["the", "quick", "brown"]);
  });

  specimen.it("never settles a flickering word", async () => {
    const packets = await collect(
      verbatim.harmonize(script([draft("the quick brawn"), draft("the quick brown fox")]), { window: 2, tolerance: 1 }),
    );
    specimen.expect(deltas(packets)).toEqual(["the quick"]);
  });

  specimen.it("tolerates near-identical spellings", async () => {
    const packets = await collect(
      verbatim.harmonize(script([draft("vivalance rocks"), draft("vivalence rocks hard")]), { window: 2, tolerance: 0.8 }),
    );
    specimen.expect(deltas(packets)[0]).toBe("vivalence rocks");
  });

  specimen.it("an upstream commit passes only the words not yet settled", async () => {
    const packets = await collect(
      verbatim.harmonize(script([draft("count to"), draft("count to three"), commit("count to three now")]), { window: 2 }),
    );
    specimen.expect(deltas(packets)).toEqual(["count to", "three now"]);
    specimen.expect(packets.at(-1)).toEqual({ event: "/part/delta", index: 0, part: { text: "three now " } });
  });

  specimen.it("state resets across turns on one stream", async () => {
    const packets = await collect(
      verbatim.harmonize(
        script([
          { event: "/turn/open", turn: { role: "user" } },
          draft("first utterance"),
          commit("first utterance"),
          { event: "/turn/close", turn: {} },
          { event: "/turn/open", turn: { role: "user" } },
          draft("second"),
          draft("second thought"),
          commit("second thought"),
          { event: "/turn/close", turn: {} },
        ]),
        { window: 2 },
      ),
    );
    specimen.expect(deltas(packets)).toEqual(["first utterance", "second", "thought"]);
    specimen.expect(packets.filter((p) => p.event === "/turn/close").length).toBe(2);
  });

  specimen.it("caps the volatile tail", async () => {
    const long = "one two three four five six seven eight nine ten";
    const packets = await collect(verbatim.harmonize(script([draft(long)]), { window: 2, tail: 3 }));
    specimen.expect(drafts(packets)[0]).toBe("eight nine ten");
  });

  specimen.it("passes eager, resume, full and close through untouched", async () => {
    const through = [
      { event: "/turn/eager" },
      { event: "/turn/resume" },
      { event: "/part/full", index: 0, part: { type: "text", text: "Hello there." } },
      { event: "/part/close", index: 0 },
    ];
    specimen.expect(await collect(verbatim.harmonize(script(through)))).toEqual(through);
  });

  specimen.it("settled deltas plus the commit spell the utterance once", async () => {
    const hypotheses = ["so", "so the", "so the plan", "so the plan is", "so the plan is simple"];
    const packets = await collect(
      verbatim.harmonize(script([...hypotheses.map(draft), commit("so the plan is simple")]), { window: 2 }),
    );
    specimen.expect(deltas(packets).join(" ")).toBe("so the plan is simple");
  });
});

specimen.describe("soma.transcript — a dictation folds in the one grammar", () => {
  const spoken = (folded) =>
    [...folded.turns, ...(folded.open ? [folded.open] : [])]
      .flatMap((turn) => turn.parts)
      .map((part) => part.text.trim())
      .filter(Boolean)
      .join(" ");
  const tail = (folded) => (folded.open ? folded.open.parts.map((part) => part.draft?.text ?? "").join(" ") : "");
  const heard = (id) => [
    { event: "/turn/open", turn: { role: "user", id } },
    { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  ];
  const sealed = [{ event: "/part/close", index: 0 }, { event: "/turn/close", turn: {} }];

  specimen.it("settled words solid, the draft beside them, the draft gone at close", () => {
    let folded = [...heard("t1"), commit("hello "), draft("wor")].reduce(soma.transcript, null);
    specimen.expect({ spoken: spoken(folded), tail: tail(folded) }).toEqual({ spoken: "hello", tail: "wor" });
    folded = [commit("world "), ...sealed].reduce(soma.transcript, folded);
    specimen.expect({ spoken: spoken(folded), tail: tail(folded) }).toEqual({ spoken: "hello world", tail: "" });
    specimen.expect(folded.turns[0].parts[0]).toEqual({ type: "text", text: "hello world " });
  });

  specimen.it("a polish addresses its sealed turn by id, whenever it lands, the open turn untouched", () => {
    let folded = [...heard("t1"), commit("the quick fox "), ...sealed, ...heard("t2"), draft("and")].reduce(soma.transcript, null);
    folded = soma.transcript(folded, {
      event: "/part/full",
      index: 0,
      part: { type: "text", text: "The quick fox." },
      turn: "t1",
    });
    specimen.expect({ spoken: spoken(folded), tail: tail(folded) }).toEqual({ spoken: "The quick fox.", tail: "and" });
    specimen.expect(folded.open.parts[0]).toEqual({ type: "text", text: "", draft: { text: "and" } });
  });

  specimen.it("a polish for a turn it never sealed changes nothing", () => {
    const folded = [...heard("t1"), commit("one "), ...sealed].reduce(soma.transcript, null);
    const polished = soma.transcript(folded, { event: "/part/full", index: 0, part: { type: "text", text: "Two." }, turn: "t7" });
    specimen.expect(spoken(polished)).toBe("one");
  });
});
