import { specimen, string } from "@vivalence/typology";

specimen.describe("string.matches", () => {
  specimen.it("single alt exact match", () => {
    specimen.expect(string.matches("hello", "hello")).toBe(true);
  });

  specimen.it("single alt mismatch", () => {
    specimen.expect(string.matches("hello", "world")).toBe(false);
  });

  specimen.it("forgiving strips diacritics", () => {
    specimen.expect(string.matches("voce", "você")).toBe(true);
  });

  specimen.it("forgiving strips punctuation", () => {
    specimen.expect(string.matches("hello", "Hello!")).toBe(true);
  });

  specimen.it("non-forgiving keeps diacritics", () => {
    specimen.expect(string.matches("voce", "você", { forgiving: false })).toBe(false);
    specimen.expect(string.matches("você", "você", { forgiving: false })).toBe(true);
  });

  specimen.it("alt list — any single alt accepted", () => {
    specimen.expect(string.matches("next", "next / nearby")).toBe(true);
    specimen.expect(string.matches("nearby", "next / nearby")).toBe(true);
  });

  specimen.it("alt list — strips parenthetical hints", () => {
    specimen.expect(string.matches("every", "all / every (fem.)")).toBe(true);
    specimen.expect(string.matches("all", "all / every (fem.)")).toBe(true);
  });

  specimen.it("alt list — combined word-set accepted", () => {
    specimen.expect(string.matches("all every", "all / every (fem.)")).toBe(true);
    specimen.expect(string.matches("every all", "all / every (fem.)")).toBe(true);
    specimen.expect(string.matches("next nearby", "next / nearby")).toBe(true);
  });

  specimen.it("alt list — partial subset rejected", () => {
    specimen.expect(string.matches("all every extra", "all / every")).toBe(false);
  });

  specimen.it("rejects unrelated input", () => {
    specimen.expect(string.matches("banana", "all / every")).toBe(false);
  });
});

specimen.describe("string.separate", () => {
  specimen.it("splits slash list", () => {
    specimen.expect(string.separate("a / b")).toEqual(["a", "b"]);
  });

  specimen.it("strips parenthetical", () => {
    specimen.expect(string.separate("all / every (fem.)")).toEqual(["all", "every"]);
  });

  specimen.it("expands shared prefix multiword", () => {
    specimen.expect(string.separate("good morning / evening")).toContain("good evening");
  });

  specimen.it("expands shared suffix multiword", () => {
    specimen.expect(string.separate("good / bad day")).toContain("good day");
  });
});

specimen.describe("string.fold", () => {
  specimen.it("lowercases", () => {
    specimen.expect(string.fold("Hello")).toBe("hello");
  });

  specimen.it("strips diacritics", () => {
    specimen.expect(string.fold("voção")).toBe("vocao");
  });

  specimen.it("strips punctuation", () => {
    specimen.expect(string.fold("Hello, world!")).toBe("hello world");
  });

  specimen.it("converts slash to space", () => {
    specimen.expect(string.fold("a/b")).toBe("a b");
  });

  specimen.it("collapses whitespace", () => {
    specimen.expect(string.fold("a   b")).toBe("a b");
  });
});
