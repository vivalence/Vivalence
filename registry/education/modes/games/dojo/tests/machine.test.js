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

  specimen.it("anhieb credits extra runs only on a first-rep landing", () => {
    let state = streak.begin(SET.slice(0, 1), 3);
    state = streak.record(state, true, 1);
    specimen.expect(state.pending[0].runs).toBe(2);
    state = streak.record(state, true, 1);
    specimen.expect(streak.complete(state)).toBe(true);

    let late = streak.begin(SET.slice(0, 1), 3);
    late = streak.record(late, false, 1);
    late = streak.record(late, true, 1);
    specimen.expect(late.pending[0].runs).toBe(1);
  });

  specimen.it("focus moves the picked entry to the head and never mutates", () => {
    const before = streak.begin(SET, 2);
    const last = before.pending.at(-1).index;
    const focused = streak.focus(before, last);
    specimen.expect(streak.current(focused).index).toBe(last);
    specimen.expect(focused.pending.length).toBe(before.pending.length);
    specimen.expect(streak.current(before).index).not.toBe(last);
    specimen.expect(streak.focus(before, streak.current(before).index)).toBe(before);
    specimen.expect(streak.focus(before, 999)).toBe(before);
  });

  specimen.it("scramble reorders the pending tail without letting the last-recorded come straight back", () => {
    let state = streak.begin(SET, 2);
    state = streak.record(state, true);
    const recorded = state.pending.at(-1);
    for (let round = 0; round < 20; round++) {
      const mixed = streak.scramble(state);
      specimen.expect(mixed.pending.length).toBe(state.pending.length);
      specimen.expect(mixed.pending[0]).not.toBe(recorded);
      specimen.expect([...mixed.pending].sort((a, b) => a.index - b.index).map((e) => e.index)).toEqual([0, 1, 2]);
    }
    const lone = streak.begin(SET.slice(0, 1), 2);
    specimen.expect(streak.scramble(lone)).toBe(lone);
  });

  specimen.it("begin seeds one dress per entry when given a dresser; wear pushes onto the last-recorded; a miss carries its dress through record", () => {
    const dress = (index, worn) => ({ recall: "KNOWN", gameplay: "TYPE", prompt: `${index}:${worn.length}` });
    let state = streak.begin(SET, 2, dress);
    specimen.expect(state.pending.map((entry) => entry.worn)).toEqual([
      [{ recall: "KNOWN", gameplay: "TYPE", prompt: "0:0" }],
      [{ recall: "KNOWN", gameplay: "TYPE", prompt: "1:0" }],
      [{ recall: "KNOWN", gameplay: "TYPE", prompt: "2:0" }],
    ]);
    specimen.expect(streak.begin(SET).pending[0].worn).toBe(undefined);
    state = streak.record(state, true);
    state = streak.wear(state, dress);
    specimen.expect(state.pending.at(-1).index).toBe(0);
    specimen.expect(state.pending.at(-1).worn.map((entry) => entry.prompt)).toEqual(["0:0", "0:1"]);
    specimen.expect(streak.wearing(state.pending.at(-1)).prompt).toBe("0:1");
    state = streak.record(state, false);
    specimen.expect(state.pending.at(-1).index).toBe(1);
    specimen.expect(state.pending.at(-1).missed).toBe(true);
    specimen.expect(state.pending.at(-1).worn.map((entry) => entry.prompt)).toEqual(["1:0"]);
    const redressed = streak.redress(state, dress);
    specimen.expect(redressed.pending.map((entry) => [entry.index, entry.worn.length])).toEqual([[2, 2], [0, 3], [1, 2]]);
    specimen.expect(streak.wear(streak.begin([], 1, dress), dress).pending).toEqual([]);
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

specimen.describe("dojo randomness", () => {
  const POOL = ["KNOWN", "LEARNING"];

  specimen.it("neither level cycles every pool in its own order and keeps the queue as drawn", () => {
    specimen.expect(types.drawing([])).toBe(false);
    specimen.expect(types.shuffling([])).toBe(false);
    const cycled = [0, 1, 2, 3].map((index) => knowables.recallFor(POOL, index, false));
    specimen.expect(cycled).toEqual(["KNOWN", "LEARNING", "KNOWN", "LEARNING"]);
    const games = [0, 1, 2].map((index) => knowables.gameplayFor(["TYPE", "PICK"], { ontology: "word" }, index, false));
    specimen.expect(games).toEqual(["TYPE", "PICK", "TYPE"]);
    const list = [1, 2, 3, 4, 5];
    specimen.expect(knowables.order(list, [])).toEqual(list);
    specimen.expect(knowables.order(list, ["GAMEPLAY"])).toEqual(list);
  });

  specimen.it("ORDER alone shuffles the queue but leaves the pools cycling", () => {
    specimen.expect(types.drawing(["ORDER"])).toBe(false);
    specimen.expect(types.shuffling(["ORDER"])).toBe(true);
    const list = Array.from({ length: 40 }, (value, index) => index);
    specimen.expect(knowables.order([...list], ["ORDER"]).slice().sort((a, b) => a - b)).toEqual(list);
  });

  specimen.it("both entries draw and shuffle; the default draws only; a bare string still reads", () => {
    specimen.expect(types.drawing(["ORDER", "GAMEPLAY"])).toBe(true);
    specimen.expect(types.shuffling(["ORDER", "GAMEPLAY"])).toBe(true);
    specimen.expect(types.drawing(undefined)).toBe(true);
    specimen.expect(types.shuffling(undefined)).toBe(false);
    specimen.expect(types.drawing("GAMEPLAY")).toBe(true);
    specimen.expect(types.shuffling("ORDER")).toBe(true);
  });
});

specimen.describe("dojo preview windows", () => {
  const preview = { speed: { rate: "NORMAL" } };

  specimen.it("STATUS shows the preview only for the chosen retention statuses", () => {
    const when = { ...preview, when: "STATUS", status: ["UNKNOWN", "LEARNING"] };
    specimen.expect(knowables.previews(when, { status: "LEARNING" })).toBe(true);
    specimen.expect(knowables.previews(when, { status: "KNOWN" })).toBe(false);
    specimen.expect(knowables.previews(when, { first: true, status: "KNOWN" })).toBe(false);
    specimen.expect(knowables.previews({ ...preview, when: "STATUS" }, { status: null })).toBe(true);
    specimen.expect(knowables.previews({ ...preview, when: "STATUS" }, { status: "GRADUATED" })).toBe(false);
  });

  specimen.it("ONCE, ALWAYS and MISSED are untouched", () => {
    specimen.expect(knowables.previews(preview, { first: true })).toBe(true);
    specimen.expect(knowables.previews(preview, { first: false })).toBe(false);
    specimen.expect(knowables.previews({ ...preview, when: "ALWAYS" }, {})).toBe(true);
    specimen.expect(knowables.previews({ ...preview, when: "MISSED" }, { first: true, signal: "MISTAKE" })).toBe(true);
    specimen.expect(knowables.previews({ ...preview, when: "MISSED" }, { first: true, signal: "SUCCESS" })).toBe(false);
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

  specimen.it("language statics ride the judged side: suffix contractions on KNOWN, elision on LEARNING", () => {
    const english = { contractions: { "'m": ["am"], "'s": ["is", "has"] } };
    const italian = { elision: true, contractions: { "po'": ["poco"] } };
    const word = { ontology: "word", known: "I'm tired", learning: "sono stanco" };
    specimen.expect(judge.evaluate({ typed: "I am tired", knowable: word, recall: "KNOWN", language: english }).signal).toBe("SUCCESS");
    specimen.expect(judge.evaluate({ typed: "I am tired", knowable: word, recall: "KNOWN" }).signal).toBe("MISTAKE");
    const where = { ontology: "sentence", known: "Where is the book?", learning: "Dov'è il libro?" };
    specimen.expect(judge.evaluate({ typed: "dove è il libro", knowable: where, recall: "LEARNING", language: italian }).signal).toBe("SUCCESS");
    specimen.expect(judge.evaluate({ typed: "dove è il libro", knowable: where, recall: "LEARNING" }).signal).toBe("MISTAKE");
    const bit = { ontology: "word", known: "a bit", learning: "un po'" };
    specimen.expect(judge.evaluate({ typed: "un poco", knowable: bit, recall: "LEARNING", language: italian }).signal).toBe("SUCCESS");
    const annotated = {
      ontology: "sentence",
      known: "it's on the table",
      learning: "È sul tavolo.",
      tokens: [
        { form: "È", gloss: "it's" },
        { form: "sul", gloss: "on the" },
        { form: "tavolo", gloss: "table" },
      ],
    };
    const graded = judge.evaluate({ typed: "it is on the table", knowable: annotated, recall: "KNOWN", language: english });
    specimen.expect(graded.signal).toBe("SUCCESS");
    specimen.expect(graded.tokens.map((token) => token.signal)).toEqual(["SUCCESS", "SUCCESS", "SUCCESS"]);
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

specimen.describe("dojo wardrobe", () => {
  const terminal = { daemon: { getAsset: (reference) => (reference ? { url: reference } : null) } };
  const word = { ontology: "word", known: "a", learning: "b", asset: "a.mp3" };
  const key = (dress) => `${dress.recall}/${dress.gameplay}/${dress.prompt}`;

  specimen.it("the wardrobe is every feasible recall × gameplay × prompt; a table wears only CONJUGATE", () => {
    const axes = { recall: ["KNOWN", "LEARNING"], gameplay: ["TYPE", "PICK", "CONJUGATE"], prompt: ["TEXT", "AUDIO"] };
    specimen.expect(knowables.wardrobe(terminal, axes, word).map(key).sort()).toEqual(
      ["KNOWN/PICK/AUDIO", "KNOWN/PICK/TEXT", "KNOWN/TYPE/AUDIO", "KNOWN/TYPE/TEXT", "LEARNING/PICK/AUDIO", "LEARNING/PICK/TEXT", "LEARNING/TYPE/AUDIO", "LEARNING/TYPE/TEXT"],
    );
    specimen.expect(knowables.wardrobe(terminal, axes, { ...word, asset: undefined }).map(key).sort()).toEqual(
      ["KNOWN/PICK/TEXT", "KNOWN/TYPE/TEXT", "LEARNING/PICK/TEXT", "LEARNING/TYPE/TEXT"],
    );
    const table = { ontology: "conjugation", known: "essere", learning: "essere", tokens: [{ form: "sono", gloss: "I am" }] };
    specimen.expect(knowables.wardrobe(terminal, axes, table).map((dress) => dress.gameplay)).toEqual(["CONJUGATE", "CONJUGATE"]);
    specimen.expect(knowables.wardrobe(terminal, { ...axes, greedy: true }, word).map((dress) => dress.prompt)).toEqual(["AUDIO", "AUDIO", "AUDIO", "AUDIO"]);
  });

  specimen.it("dressFor wears the wardrobe out before repeating, then avoids only the current dress, and a one-dress wardrobe repeats", () => {
    const axes = { recall: ["KNOWN", "LEARNING"], gameplay: ["TYPE", "PICK"], prompt: "TEXT" };
    const worn = [];
    for (let round = 0; round < 4; round++) worn.push(knowables.dressFor(terminal, axes, word, { worn }));
    specimen.expect(new Set(worn.map(key)).size).toBe(4);
    for (let round = 0; round < 20; round++) {
      const next = knowables.dressFor(terminal, axes, word, { worn });
      specimen.expect(key(next)).not.toBe(key(worn.at(-1)));
      worn.push(next);
    }
    const fixed = { recall: "KNOWN", gameplay: "TYPE", prompt: "TEXT" };
    specimen.expect(knowables.dressFor(terminal, fixed, word, { worn: [fixed] })).toEqual(fixed);
    specimen.expect(knowables.dressFor(terminal, fixed, word, { worn: [fixed, fixed] })).toEqual(fixed);
  });

  specimen.it("dressFor without randomness cycles each pool by queue position and pins tables to CONJUGATE", () => {
    const axes = { recall: ["KNOWN", "LEARNING"], gameplay: ["TYPE", "PICK", "FLIP"], prompt: "TEXT" };
    const cycled = [0, 1, 2, 3].map((index) => key(knowables.dressFor(terminal, axes, word, { index, random: false })));
    specimen.expect(cycled).toEqual(["KNOWN/TYPE/TEXT", "LEARNING/PICK/TEXT", "KNOWN/FLIP/TEXT", "LEARNING/TYPE/TEXT"]);
    const table = { ontology: "conjugation", known: "essere", learning: "essere", tokens: [{ form: "sono", gloss: "I am" }] };
    specimen.expect(knowables.dressFor(terminal, axes, table, { index: 1, random: false }).gameplay).toBe("CONJUGATE");
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

  specimen.it("every preset is a legal setup and there are at most nine", () => {
    const names = Object.keys(types.PRESETS);
    specimen.expect(names.length).toBeLessThanOrEqual(9);
    for (const [name, entry] of Object.entries(types.PRESETS)) {
      specimen.expect(typeof entry.note).toBe("string");
      const filled = app.fill({ data: entry.axes });
      for (const key of Object.keys(entry.axes)) specimen.expect(filled[key]).toEqual(entry.axes[key]);
      if (entry.count) specimen.expect(entry.count).toBeGreaterThanOrEqual(1);
    }
    specimen.expect(names).toContain("write");
    specimen.expect(names).toContain("listen");
    specimen.expect(names).toContain("shadow");
    specimen.expect(names).toContain("conjugate");
    specimen.expect(types.PRESETS.conjugate.where).toEqual({ ontology: "conjugation" });
    specimen.expect(types.PRESETS.conjugate.axes.gameplay).toBe("CONJUGATE");
    specimen.expect(types.GAMEPLAYS).toContain("CONJUGATE");
  });

  specimen.it("CONJUGATE is drawn for conjugation rows only; a row drawn otherwise surfaces as its forms", () => {
    const table = {
      ontology: "conjugation",
      known: "to be",
      learning: "essere",
      context: { tense: "Present", mood: "Indicative", suffix: "-ere" },
      tokens: [
        { slot: "1sg", form: "sono", gloss: "I am", literal: "l1", person: "First Person", number: "Singular", asset: { path: "a.mp3" } },
        { slot: "2sg", form: "sei", gloss: "you are", literal: "l2", person: "Second Person", number: "Singular" },
      ],
    };
    specimen.expect(draws(() => knowables.gameplayFor(["CONJUGATE"], table))).toEqual(new Set(["CONJUGATE"]));
    specimen.expect(draws(() => knowables.gameplayFor(["CONJUGATE"], { ontology: "word" }))).toEqual(new Set(["TYPE"]));
    specimen.expect(draws(() => knowables.gameplayFor(["TYPE", "CONJUGATE"], table))).toEqual(new Set(["TYPE", "CONJUGATE"]));
    for (const drawn of draws(() => knowables.gameplayFor(undefined, { ontology: "sentence" })))
      specimen.expect(["TYPE", "PICK", "FLIP"]).toContain(drawn);
    for (const drawn of draws(() => knowables.gameplayFor(undefined, table)))
      specimen.expect(types.GAMEPLAYS).toContain(drawn);

    specimen.expect(knowables.surface(table, "CONJUGATE").length).toBe(1);
    const forms = knowables.surface(table, "TYPE");
    specimen.expect(forms.length).toBe(2);
    specimen.expect(forms[0]).toEqual({
      ontology: "word",
      known: "I am",
      learning: "sono",
      context: { infinitive: "essere", tense: "Present", mood: "Indicative", person: "First Person", number: "Singular" },
      literal: "l1",
      asset: { path: "a.mp3" },
    });
    specimen.expect(forms[1].asset).toBeUndefined();
  });

  specimen.it("preview.when: ONCE = first rep, ALWAYS = every rep, MISSED = while the last signal is a miss", () => {
    const once = { speed: { rate: "NORMAL" } };
    specimen.expect(knowables.previews(undefined, { first: true })).toBe(false);
    specimen.expect(knowables.previews(once, { first: true })).toBe(true);
    specimen.expect(knowables.previews(once, { first: false })).toBe(false);
    specimen.expect(knowables.previews({ ...once, when: "ALWAYS" }, { first: false, missed: false })).toBe(true);
    const missed = { ...once, when: "MISSED" };
    specimen.expect(knowables.previews(missed, { first: true, signal: "MISTAKE" })).toBe(true);
    specimen.expect(knowables.previews(missed, { first: true, signal: "SUCCESS" })).toBe(false);
    specimen.expect(knowables.previews(missed, { first: true, signal: null })).toBe(false);
    specimen.expect(knowables.previews(missed, { first: false, missed: true })).toBe(true);
    specimen.expect(knowables.previews(missed, { first: false, missed: false, signal: "FAILURE" })).toBe(false);
    let session = streak.begin([{ literal: "a" }, { literal: "b" }], 2);
    session = streak.record(session, false);
    specimen.expect(session.pending.at(-1).missed).toBe(true);
    session = streak.record(session, true);
    session = streak.record(session, true);
    specimen.expect(session.pending[0].missed).toBe(false);
    specimen.expect(knowables.surface({ ontology: "word", known: "a", learning: "b" }, "TYPE").length).toBe(1);
  });
});

specimen.describe("dojo table streak", () => {
  specimen.it("settle passes the head once, whatever happened inside", () => {
    let state = streak.begin(SET, 3);
    state = streak.settle(state);
    specimen.expect(state.pending.map((entry) => entry.index)).toEqual([1, 2]);
    specimen.expect(state.attempts).toBe(1);
  });

  specimen.it("defer moves the head to the end without a rep", () => {
    let state = streak.begin(SET, 2);
    state = streak.defer(state);
    specimen.expect(state.pending.map((entry) => entry.index)).toEqual([1, 2, 0]);
    specimen.expect(state.attempts).toBe(0);
    specimen.expect(streak.defer(streak.begin(SET.slice(0, 1))).pending.length).toBe(1);
  });

  specimen.it("cells run their own streak: a missed cell requeues, the table completes when every cell is satisfied", () => {
    let state = streak.begin(["1sg", "2sg"], 2);
    const walked = [];
    const script = [true, false, true, true, true];
    for (const success of script) {
      walked.push(streak.current(state).index);
      state = streak.record(state, success);
    }
    specimen.expect(walked).toEqual([0, 1, 0, 1, 1]);
    specimen.expect(streak.complete(state)).toBe(true);
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
