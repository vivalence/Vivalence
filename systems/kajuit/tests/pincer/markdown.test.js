import { specimen } from "@vivalence/typology";
import { parseBlocks, parseInline } from "../../src/app/panels/a/markdown.js";

specimen.describe("markdown — parser", () => {
  specimen.it("inline: bold, italic, code, link", () => {
    const out = parseInline("a **b** c *d* e `f` g [h](http://i)");
    specimen.expect(out.find((s) => s.kind === "bold")?.text).toBe("b");
    specimen.expect(out.find((s) => s.kind === "italic")?.text).toBe("d");
    specimen.expect(out.find((s) => s.kind === "code")?.text).toBe("f");
    const link = out.find((s) => s.kind === "link");
    specimen.expect(link?.text).toBe("h");
    specimen.expect(link?.href).toBe("http://i");
  });

  specimen.it("inline: plain text fallback when no markup", () => {
    const out = parseInline("hello world");
    specimen.expect(out.length).toBe(1);
    specimen.expect(out[0].kind).toBe("text");
    specimen.expect(out[0].text).toBe("hello world");
  });

  specimen.it("blocks: paragraphs preserve internal newlines", () => {
    const out = parseBlocks("line one\nline two\nline three");
    specimen.expect(out.length).toBe(1);
    specimen.expect(out[0].kind).toBe("paragraph");
    specimen.expect(out[0].inline[0].text).toBe("line one\nline two\nline three");
  });

  specimen.it("blocks: heading levels 1..6", () => {
    const out = parseBlocks("# h1\n## h2\n### h3");
    specimen.expect(out.length).toBe(3);
    specimen.expect(out[0].kind).toBe("heading");
    specimen.expect(out[0].level).toBe(1);
    specimen.expect(out[1].level).toBe(2);
    specimen.expect(out[2].level).toBe(3);
  });

  specimen.it("blocks: fenced code block keeps lang and body verbatim", () => {
    const text = "```js\nconst x = 1;\nconsole.log(x);\n```";
    const out = parseBlocks(text);
    specimen.expect(out.length).toBe(1);
    specimen.expect(out[0].kind).toBe("code-block");
    specimen.expect(out[0].lang).toBe("js");
    specimen.expect(out[0].text).toBe("const x = 1;\nconsole.log(x);");
  });

  specimen.it("blocks: bullet list", () => {
    const out = parseBlocks("- one\n- two\n- three");
    specimen.expect(out.length).toBe(1);
    specimen.expect(out[0].kind).toBe("list");
    specimen.expect(out[0].ordered).toBe(false);
    specimen.expect(out[0].items.length).toBe(3);
  });

  specimen.it("blocks: ordered list", () => {
    const out = parseBlocks("1. one\n2. two");
    specimen.expect(out.length).toBe(1);
    specimen.expect(out[0].ordered).toBe(true);
    specimen.expect(out[0].items.length).toBe(2);
  });

  specimen.it("blocks: blockquote merges consecutive lines", () => {
    const out = parseBlocks("> line a\n> line b");
    specimen.expect(out.length).toBe(1);
    specimen.expect(out[0].kind).toBe("blockquote");
  });

  specimen.it("blocks: horizontal rule", () => {
    const out = parseBlocks("---");
    specimen.expect(out.length).toBe(1);
    specimen.expect(out[0].kind).toBe("hr");
  });

  specimen.it("blocks: empty input yields empty array", () => {
    specimen.expect(parseBlocks("").length).toBe(0);
    specimen.expect(parseBlocks(null).length).toBe(0);
  });

  specimen.it("blocks: mixed content keeps order", () => {
    const text = "para one\n\n# heading\n\n- a\n- b\n\n> quote";
    const out = parseBlocks(text);
    specimen.expect(out.length).toBe(4);
    specimen.expect(out[0].kind).toBe("paragraph");
    specimen.expect(out[1].kind).toBe("heading");
    specimen.expect(out[2].kind).toBe("list");
    specimen.expect(out[3].kind).toBe("blockquote");
  });
});
