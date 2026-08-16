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

  specimen.it("a string folds to bare words", () => {
    specimen.expect(string.fold("Hello")).toBe("hello");
    specimen.expect(string.fold("voção")).toBe("vocao");
    specimen.expect(string.fold("Hello, world!")).toBe("hello world");
    specimen.expect(string.fold("a/b")).toBe("a b");
    specimen.expect(string.fold("a   b")).toBe("a b");
  });
});
