import { specimen } from "@vivalence/typology";
import { spliceAt } from "../src/app/panels/a/widgets/dictate.js";

specimen.describe("dictate.spliceAt", () => {
  specimen.it("appends to an empty draft without padding", () => {
    specimen.expect(spliceAt("", 0, "hello world")).toEqual({ draft: "hello world", caret: 11 });
  });

  specimen.it("inserts mid-draft with joining spaces on both sides", () => {
    const { draft, caret } = spliceAt("fix the bug", 7, "obvious");
    specimen.expect(draft).toBe("fix the obvious bug");
    specimen.expect(draft.slice(0, caret)).toBe("fix the obvious");
  });

  specimen.it("respects existing whitespace, adds none twice", () => {
    specimen.expect(spliceAt("before  after", 7, "mid").draft).toBe("before mid after");
  });

  specimen.it("appends at the end with a single leading space", () => {
    const { draft, caret } = spliceAt("first thought", 13, "second thought");
    specimen.expect(draft).toBe("first thought second thought");
    specimen.expect(caret).toBe(draft.length);
  });

  specimen.it("clamps out-of-range anchors", () => {
    specimen.expect(spliceAt("short", 99, "tail").draft).toBe("short tail");
    specimen.expect(spliceAt("short", -3, "head").draft).toBe("head short");
  });

  specimen.it("empty text is a no-op", () => {
    specimen.expect(spliceAt("draft", 2, "")).toEqual({ draft: "draft", caret: 2 });
  });
});
