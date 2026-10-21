import { specimen, object } from "@vivalence/typology";

specimen.describe("object.place", () => {
  specimen.it("multi-segment path folds the last segment into a value", () => {
    specimen.expect(object.place({}, "word.tense.present")).toEqual({ word: { tense: "present" } });
  });

  specimen.it("single-segment path writes a root flag", () => {
    specimen.expect(object.place({}, "conjugation")).toEqual({ conjugation: true });
  });

  specimen.it("explicit value lands on the full path", () => {
    specimen.expect(object.place({}, "game.write", "mode")).toEqual({ game: { write: "mode" } });
  });

  specimen.it("root flag survives beside sibling facets", () => {
    const result = {};
    object.place(result, "conjugation");
    object.place(result, "word.lemma.essere");
    object.place(result, "word.tense.present");
    specimen.expect(result).toEqual({
      conjugation: true,
      word: { lemma: "essere", tense: "present" },
    });
  });

  specimen.it("facet subtree replaces an earlier root flag on the same key", () => {
    const result = {};
    object.place(result, "word");
    object.place(result, "word.part-of-speech.adposition");
    specimen.expect(result).toEqual({ word: { "part-of-speech": "adposition" } });
  });
});

specimen.describe("object.filter", () => {
  specimen.it("keeps entries the predicate accepts, passing key and value", () => {
    specimen.expect(object.filter({ a: 1, b: 2, c: 3 }, (key, value) => key !== "b" && value < 3))
      .toEqual({ a: 1 });
  });

  specimen.it("always-true is identity, always-false is empty", () => {
    const source = { a: 1, b: 2 };
    specimen.expect(object.filter(source, () => true)).toEqual(source);
    specimen.expect(object.filter(source, () => false)).toEqual({});
  });

  specimen.it("does not mutate the source", () => {
    const source = { a: 1 };
    object.filter(source, () => false);
    specimen.expect(source).toEqual({ a: 1 });
  });
});

specimen.describe("object.merge", () => {
  specimen.it("an array is positional — a quaternion with repeated components survives whole; the later source replaces, never unions", () => {
    const trait = { PLACED: { rotation: [1, 0, 0, 0], scale: [-1, 1, 1] } };
    specimen.expect(object.merge({}, trait)).toEqual(trait);
    specimen.expect(object.merge({ a: [1, 2, 3] }, { a: [3] })).toEqual({ a: [3] });
    specimen.expect(trait.PLACED.rotation).toEqual([1, 0, 0, 0]);
  });
});
