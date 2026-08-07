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
