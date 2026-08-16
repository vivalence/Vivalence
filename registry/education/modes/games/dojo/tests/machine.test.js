import { specimen, v } from "@vivalence/typology";

import { app } from "../dojo.viva.js";
import * as set from "../set/index.js";
import * as streak from "../buffer/streak.js";
import * as judge from "../buffer/judge.js";
import * as knowables from "../buffer/knowables.js";
import * as types from "../types.js";

const SET = ["a", "b", "c"];

specimen.describe("dojo streak fold", () => {
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

specimen.describe("dojo judge", () => {
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

specimen.describe("dojo buffer schema", () => {
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

  specimen.it("recall and gameplay accept the pool form", () => {
    const filled = app.fill({ data: { recall: ["KNOWN", "LEARNING"], gameplay: ["TYPE", "FLIP"] } });
    specimen.expect(filled.recall).toEqual(["KNOWN", "LEARNING"]);
    specimen.expect(filled.gameplay).toEqual(["TYPE", "FLIP"]);
  });
});

specimen.describe("dojo pools", () => {
  const draws = (draw, times = 40) => new Set(Array.from({ length: times }, draw));

  specimen.it("a scalar is fixed, a pool is drawn from, omission is the whole pool", () => {
    specimen.expect(draws(() => knowables.recallFor("KNOWN"))).toEqual(new Set(["KNOWN"]));
    specimen.expect(draws(() => knowables.gameplayFor("FLIP"))).toEqual(new Set(["FLIP"]));
    for (const drawn of draws(() => knowables.recallFor(["KNOWN", "LEARNING"])))
      specimen.expect(types.RECALLS).toContain(drawn);
    for (const drawn of draws(() => knowables.gameplayFor(["TYPE", "PICK"])))
      specimen.expect(["TYPE", "PICK"]).toContain(drawn);
    for (const drawn of draws(() => knowables.recallFor(undefined)))
      specimen.expect(types.RECALLS).toContain(drawn);
    for (const drawn of draws(() => knowables.gameplayFor(undefined)))
      specimen.expect(types.GAMEPLAYS).toContain(drawn);
  });

  specimen.it("every preset is a legal setup and there are at most eight", () => {
    const names = Object.keys(types.PRESETS);
    specimen.expect(names.length).toBeLessThanOrEqual(8);
    for (const [name, entry] of Object.entries(types.PRESETS)) {
      specimen.expect(typeof entry.note).toBe("string");
      const filled = app.fill({ data: entry.axes });
      for (const key of Object.keys(entry.axes)) specimen.expect(filled[key]).toEqual(entry.axes[key]);
      if (entry.count) specimen.expect(entry.count).toBeGreaterThanOrEqual(1);
    }
    specimen.expect(names).toContain("write");
    specimen.expect(names).toContain("listen");
    specimen.expect(names).toContain("shadow");
  });
});

specimen.describe("dojo set grammar", () => {
  const errors = (schema, value) => [...v.errors(schema, value)];

  specimen.it("a clause speaks the repository grammar and nothing implicit", () => {
    const clause = {
      pick: "all",
      where: {
        symbols: { $all: ["word.tense.present"], $in: ["word.lemma.essere", "word.lemma.fare"], $none: ["word.regularity.irregular"] },
        ontology: "conjugation",
        traits: { $contains: ["TRANSLATED"], $overlap: ["VOCALIZED", "ANNOTATED"], $none: ["CONJUGATED"] },
        search: "ess",
        rank: { $lte: 300 },
      },
      limit: 12,
    };
    specimen.expect(errors(types.clause, clause)).toEqual([]);
    specimen.expect(errors(types.clause, { pick: "byLastSignal", signals: ["MISTAKE"] })).toEqual([]);
    specimen.expect(errors(types.clause, { pick: "sample", status: ["KNOWN", "GRADUATED"] })).toEqual([]);
    specimen.expect(errors(types.clause, { pick: "weakest" }).length).toBeGreaterThan(0);
    specimen.expect(errors(types.clause, { pick: "everything" }).length).toBeGreaterThan(0);
    specimen.expect(errors(types.clause, { pick: "literals", literals: ["abc"] })).toEqual([]);
    specimen.expect(errors(types.clause, { pick: "authored", knowables: [{ ontology: "word", known: "a", learning: "b" }] })).toEqual([]);
  });

  specimen.it("compile passes the grammar through untouched under the ontology guard", () => {
    specimen.expect(set.compile({ symbols: ["a", "b"] })).toEqual({
      ontology: { $in: types.ONTOLOGY },
      $and: [{ symbols: { slug: "a" } }, { symbols: { slug: "b" } }],
    });
    specimen.expect(set.compile({ symbols: { $all: ["a"], $in: ["b", "c"], $none: ["d"] }, ontology: ["word", "sentence"] })).toEqual({
      ontology: { $in: ["word", "sentence"] },
      $and: [{ symbols: { slug: "a" } }, { symbols: { slug: { $in: ["b", "c"] } } }, { symbols: { $none: { slug: { $in: ["d"] } } } }],
    });
    specimen.expect(set.compile({ symbols: [], search: "", traits: [] })).toEqual({ ontology: { $in: types.ONTOLOGY } });
    specimen.expect(set.compile({ traits: { $overlap: [] }, rank: {} })).toEqual({ ontology: { $in: types.ONTOLOGY } });
    specimen.expect(set.compile({ traits: { $none: ["VOCALIZED"] } })).toEqual({ ontology: { $in: types.ONTOLOGY }, traits: { $none: ["VOCALIZED"] } });
    specimen.expect(set.projection([{ pick: "all", where: { symbols: { $all: ["a"], $none: ["b"] } } }, { pick: "feed", where: { symbols: ["c", "a"] } }])).toEqual(["a", "b", "c"]);
  });

  specimen.it("describe reads a clause back as one line", () => {
    specimen.expect(
      set.describe({ pick: "all", where: { symbols: { $all: ["word.tense.present"], $in: ["word.lemma.essere", "word.lemma.fare"] } } }),
    ).toBe("all · present · essere | fare");
    specimen.expect(set.describe({ pick: "due", limit: 10, where: { symbols: ["domain.food"], traits: ["VOCALIZED"] } })).toBe("due 10 · food · vocalized");
    specimen.expect(set.describe({ pick: "byLastSignal", where: { traits: { $none: ["CONJUGATED"] } } })).toBe("last signal mistake|failure · − conjugated");
    specimen.expect(set.describe({ pick: "sample", status: ["KNOWN"], limit: 6, where: { rank: { $gte: 10, $lte: 99 } } })).toBe("sample known 6 · rank ≥ 10 · rank ≤ 99");
    specimen.expect(set.describe({ pick: "literals", literals: ["x", "y"] })).toBe("picked · 2");
  });
});
