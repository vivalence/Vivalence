import { specimen, string } from "@vivalence/typology";

specimen.describe("string", () => {
  specimen.it("a guess meets its answer forgivingly", () => {
    specimen.expect(string.matches("hello", "hello")).toBe(true);
    specimen.expect(string.matches("hello", "world")).toBe(false);
    specimen.expect(string.matches("voce", "você")).toBe(true);
    specimen.expect(string.matches("hello", "Hello!")).toBe(true);
    specimen.expect(string.matches("voce", "você", { forgiving: false })).toBe(false);
    specimen.expect(string.matches("você", "você", { forgiving: false })).toBe(true);
  });

  specimen.it("an alt list accepts any alternative and the combined set", () => {
    specimen.expect(string.matches("next", "next / nearby")).toBe(true);
    specimen.expect(string.matches("nearby", "next / nearby")).toBe(true);
    specimen.expect(string.matches("every", "all / every (fem.)")).toBe(true);
    specimen.expect(string.matches("all", "all / every (fem.)")).toBe(true);
    specimen.expect(string.matches("all every", "all / every (fem.)")).toBe(true);
    specimen.expect(string.matches("every all", "all / every (fem.)")).toBe(true);
    specimen.expect(string.matches("next nearby", "next / nearby")).toBe(true);
    specimen.expect(string.matches("all every extra", "all / every")).toBe(false);
    specimen.expect(string.matches("banana", "all / every")).toBe(false);
  });

  specimen.it("a phrase separates into its alternatives", () => {
    specimen.expect(string.separate("a / b")).toEqual(["a", "b"]);
    specimen.expect(string.separate("all / every (fem.)")).toEqual(["all", "every"]);
    specimen.expect(string.separate("good morning / evening")).toContain("good evening");
    specimen.expect(string.separate("good / bad day")).toContain("good day");
  });

  specimen.it("a chain of alternatives distributes the shared tail to every member", () => {
    specimen.expect(string.separate("he/she/it has")).toEqual(["he", "she", "it has", "he has", "she has"]);
    specimen.expect(string.matches("he has", "he/she/it has")).toBe(true);
    specimen.expect(string.matches("she is", "he/she/it is")).toBe(true);
    specimen.expect(string.matches("it is", "he/she/it is")).toBe(true);
    specimen.expect(string.matches("we go", "we go/went/gone")).toBe(true);
    specimen.expect(string.matches("we gone", "we go/went/gone")).toBe(true);
  });

  specimen.it("contract: suffix rules ride any host word, literal pairs win first, longest rule first", () => {
    const english = { "'m": ["am"], "'re": ["are"], "'s": ["is", "has"], "n't": ["not"], "won't": ["will not"], "can't": ["cannot", "can not"] };
    specimen.expect(string.contract("I am here", english)).toBe("im here");
    specimen.expect(string.contract("I'm here", english)).toBe("im here");
    specimen.expect(string.contract("the cats are black", english)).toBe("the catsre black");
    specimen.expect(string.contract("he has gone", english)).toBe("hes gone");
    specimen.expect(string.contract("he is gone", english)).toBe("hes gone");
    specimen.expect(string.contract("we do not", english)).toBe("we dont");
    specimen.expect(string.contract("we will not", english)).toBe("we wont");
    specimen.expect(string.contract("we can not", english)).toBe("we cant");
    specimen.expect(string.contract("am", english)).toBe("am");
    specimen.expect(string.contract("ham sandwich", english)).toBe("ham sandwich");
    specimen.expect(string.contract("I am", {})).toBe("i am");
  });

  specimen.it("matches treats a contraction and its expansion as one answer, both directions", () => {
    const english = { "'m": ["am"], "'s": ["is", "has"], "n't": ["not"] };
    specimen.expect(string.matches("I am tired", "I'm tired", { contractions: english })).toBe(true);
    specimen.expect(string.matches("I'm tired", "I am tired", { contractions: english })).toBe(true);
    specimen.expect(string.matches("he has eaten", "he's eaten", { contractions: english })).toBe(true);
    specimen.expect(string.matches("there are", "there're", { contractions: { "'re": ["are"] } })).toBe(true);
    specimen.expect(string.matches("do not go", "don't go / never go", { contractions: english })).toBe(true);
    specimen.expect(string.matches("I am tired", "I'm tired")).toBe(false);
    specimen.expect(string.matches("I am tired", "I'm tired", { forgiving: false, contractions: english })).toBe(true);
  });

  specimen.it("elision: an apostrophe in the answer is an optionally elided vowel; fusions stay rejected", () => {
    specimen.expect(string.matches("dove è il libro", "Dov'è il libro?", { elision: true })).toBe(true);
    specimen.expect(string.matches("questo anno", "quest'anno", { elision: true })).toBe(true);
    specimen.expect(string.matches("una amica", "un'amica", { elision: true })).toBe(true);
    specimen.expect(string.matches("c'è un'amica", "c'è un'amica", { elision: true })).toBe(true);
    specimen.expect(string.matches("ci è una amica", "c'è un'amica", { elision: true })).toBe(true);
    specimen.expect(string.matches("dove è il libro", "Dov'è il libro?")).toBe(false);
    specimen.expect(string.matches("di il mare", "del mare", { elision: true })).toBe(false);
    specimen.expect(string.matches("un poco", "un po'", { elision: true, contractions: { "po'": ["poco"] } })).toBe(true);
  });

  specimen.it("a string folds to bare words", () => {
    specimen.expect(string.fold("Hello")).toBe("hello");
    specimen.expect(string.fold("voção")).toBe("vocao");
    specimen.expect(string.fold("Hello, world!")).toBe("hello world");
    specimen.expect(string.fold("a/b")).toBe("a b");
    specimen.expect(string.fold("a   b")).toBe("a b");
  });
});
