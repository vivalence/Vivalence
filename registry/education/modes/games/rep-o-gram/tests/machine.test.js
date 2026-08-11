import { specimen } from "@vivalence/typology";

import { app } from "../rep-o-gram.viva.js";
import * as streak from "../buffer/streak.js";
import * as judge from "../buffer/judge.js";

const SET = ["a", "b", "c"];

specimen.describe("rep-o-gram streak fold", () => {
  specimen.it("single pass: every rep drops its entry, success or not", () => {
    let state = streak.begin(SET);
    const walked = [];
    while (!streak.complete(state)) {
      walked.push(streak.current(state).index);
      state = streak.record(state, walked.length % 2 === 0);
    }
    specimen.expect(walked).toEqual([0, 1, 2]);
    specimen.expect(state.attempts).toBe(3);
  });

  specimen.it("streak N requeues on failure with runs reset", () => {
    let state = streak.begin(SET.slice(0, 1), 2);
    state = streak.record(state, true);
    specimen.expect(state.pending[0].runs).toBe(1);
    state = streak.record(state, false);
    specimen.expect(state.pending[0].runs).toBe(0);
    state = streak.record(state, true);
    state = streak.record(state, true);
    specimen.expect(streak.complete(state)).toBe(true);
    specimen.expect(state.attempts).toBe(4);
  });

  specimen.it("record never mutates its source", () => {
    const before = streak.begin(SET, 2);
    const snapshot = JSON.stringify(before);
    streak.record(before, true);
    streak.record(before, false);
    specimen.expect(JSON.stringify(before)).toBe(snapshot);
  });

  specimen.it("first() marks only a knowable's first rep", () => {
    let state = streak.begin(SET.slice(0, 2), 2);
    specimen.expect(streak.first(state)).toBe(true);
    state = streak.record(state, false);
    specimen.expect(streak.first(state)).toBe(true);
    while (streak.current(state).index !== 0) state = streak.record(state, true);
    specimen.expect(streak.first(state)).toBe(false);
  });
});

specimen.describe("rep-o-gram judge", () => {
  const sentence = {
    ontology: "sentence",
    known: "the key is on the table",
    learning: "La chiave è sul tavolo.",
    tokens: [
      { form: "La", gloss: "the" },
      { form: "chiave", gloss: "key" },
      { form: "è", gloss: "is" },
      { form: "sul", gloss: "on the" },
      { form: "tavolo", gloss: "table" },
    ],
  };

  specimen.it("grades in three: all, some, none landed", () => {
    const grade = (typed) =>
      judge.evaluate({ typed, knowable: sentence, recall: "LEARNING", forgiving: true }).signal;
    specimen.expect(grade("la chiave e sul tavolo")).toBe("SUCCESS");
    specimen.expect(grade("La chiave sul")).toBe("MISTAKE");
    specimen.expect(grade("zzz")).toBe("FAILURE");
  });

  specimen.it("word path folds diacritics when forgiving", () => {
    const word = { ontology: "word", known: "hello", learning: "olá" };
    const forgiving = judge.evaluate({ typed: "ola", knowable: word, recall: "LEARNING", forgiving: true });
    specimen.expect(forgiving.signal).toBe("SUCCESS");
    const strict = judge.evaluate({ typed: "ola", knowable: word, recall: "LEARNING", forgiving: false });
    specimen.expect(strict.signal).toBe("MISTAKE");
  });

  specimen.it("method derives from the knowable and gameplay, never a caller prop", () => {
    specimen.expect(judge.method({}, "TYPE")).toBe("MATCH");
    specimen.expect(judge.method({}, "PICK")).toBe("identity");
    specimen.expect(judge.method({}, "FLIP")).toBe("self");
    specimen.expect(judge.method({ judge: "LLM" }, "TYPE")).toBe("LLM");
  });
});

specimen.describe("rep-o-gram buffer schema", () => {
  specimen.it("fill lands the three defaults and nothing else", () => {
    const filled = app.fill({ data: {} });
    specimen.expect(filled).toEqual({ gameplay: "TYPE", prompt: "TEXT", forgiving: true });
  });

  specimen.it("every axis round-trips through fill unchanged", () => {
    const axes = {
      recall: "LEARNING",
      gameplay: "FLIP",
      prompt: "AUDIO",
      preview: { speed: { rate: "SLOW" } },
      streak: 3,
      continuous: true,
      limit: { reps: 12, seconds: 600 },
      forgiving: false,
      knowables: [{ ontology: "word", known: "the house", learning: "la casa" }],
    };
    specimen.expect(app.fill({ data: axes })).toEqual(axes);
  });

  specimen.it("recall accepts the per-knowable array form", () => {
    const filled = app.fill({ data: { recall: ["KNOWN", "LEARNING"] } });
    specimen.expect(filled.recall).toEqual(["KNOWN", "LEARNING"]);
  });
});
