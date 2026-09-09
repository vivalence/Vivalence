import { specimen } from "@vivalence/typology";
import { EditorState } from "@codemirror/state";
import { foldable } from "@codemirror/language";
import { orgLanguage, org, TODO, DONE } from "../editor/org.js";

const marked = (text, language = orgLanguage) => {
  const found = [];
  language.parser.parse(text).iterate({
    enter: (node) => {
      if (node.name !== "Document") found.push([node.name, text.slice(node.from, node.to)]);
    },
  });
  return found;
};

const mark = (text, slice) => marked(text).find(([, held]) => held === slice)?.[0] ?? null;
const names = (text) => marked(text).map(([name]) => name);

const folds = (text) => {
  const state = EditorState.create({ doc: text, extensions: [org()] });
  return (number) => {
    const line = state.doc.line(number);
    const range = foldable(state, line.from, line.to);
    return range && state.doc.sliceString(range.from, range.to).replace(/^\n/, "");
  };
};

specimen.describe("org — headlines", () => {
  specimen.it("stars mint a level, and the level colours the whole line", () => {
    specimen.expect(marked("* one\n")).toEqual([["org-headline-1", "* one"]]);
    specimen.expect(mark("*** three\n", "*** three")).toBe("org-headline-3");
  });

  specimen.it("levels stop at six — org has no seventh face", () => {
    specimen.expect(mark("****** six\n", "****** six")).toBe("org-headline-6");
    specimen.expect(mark("******* seven\n", "******* seven")).toBe("org-headline-6");
  });

  specimen.it("stars without a space are not a headline", () => {
    specimen.expect(names("*bold* at the margin\n")).toEqual(["org-bold"]);
  });

  specimen.it("a keyword is only a keyword in the first slot", () => {
    specimen.expect(mark("* TODO file it\n", "TODO")).toBe("org-todo");
    specimen.expect(mark("* DONE file it\n", "DONE")).toBe("org-done");
    specimen.expect(names("* file the TODO later\n")).toEqual(["org-headline-1"]);
  });

  specimen.it("the keyword sets are the caller's", () => {
    const language = org({ todo: ["OPEN"], done: ["SHIPPED"] }).language;
    specimen.expect(marked("* OPEN a\n", language).find(([, held]) => held === "OPEN")[0]).toBe("org-todo");
    specimen.expect(marked("* SHIPPED a\n", language).find(([, held]) => held === "SHIPPED")[0]).toBe("org-done");
    specimen.expect(marked("* TODO a\n", language).some(([name]) => name === "org-todo")).toBe(false);
    specimen.expect(TODO.includes("TODO") && DONE.includes("DONE")).toBe(true);
  });

  specimen.it("priority and trailing tags are their own marks", () => {
    const line = "* TODO [#A] file it :money:urgent:\n";
    specimen.expect(mark(line, "[#A]")).toBe("org-priority");
    specimen.expect(mark(line, ":money:urgent:")).toBe("org-tag");
  });

  specimen.it("a link inside a headline stays a link", () => {
    specimen.expect(mark("* see [[22.04][the doc]]\n", "[[22.04][the doc]]")).toBe("org-link");
  });
});

specimen.describe("org — the line grammars", () => {
  specimen.it("planning lines and both timestamp faces", () => {
    specimen.expect(mark("DEADLINE: <2026-09-30 Wed>\n", "DEADLINE:")).toBe("org-planning");
    specimen.expect(mark("DEADLINE: <2026-09-30 Wed>\n", "<2026-09-30 Wed>")).toBe("org-stamp");
    specimen.expect(mark("logged [2026-09-07 Mon]\n", "[2026-09-07 Mon]")).toBe("org-stamp");
    specimen.expect(mark("a <2026-09-07 Mon>--<2026-09-09 Wed> b\n", "<2026-09-07 Mon>--<2026-09-09 Wed>")).toBe("org-stamp");
  });

  specimen.it("a drawer holds properties until :END:", () => {
    const text = ":PROPERTIES:\n:ID: 22.04\n:END:\nplain\n";
    specimen.expect(mark(text, ":PROPERTIES:")).toBe("org-drawer");
    specimen.expect(mark(text, ":ID:")).toBe("org-property");
    specimen.expect(mark(text, ":END:")).toBe("org-drawer");
    specimen.expect(names(text).includes("org-value")).toBe(true);
    specimen.expect(marked(text).some(([, held]) => held === "plain")).toBe(false);
  });

  specimen.it("a block holds its body verbatim and only its own end closes it", () => {
    const text = "#+begin_src js\n* not a headline\n#+end_quote\n#+end_src\n* headline\n";
    specimen.expect(mark(text, "#+begin_src js")).toBe("org-block-mark");
    specimen.expect(mark(text, "* not a headline")).toBe("org-block");
    specimen.expect(mark(text, "#+end_quote")).toBe("org-block");
    specimen.expect(mark(text, "#+end_src")).toBe("org-block-mark");
    specimen.expect(mark(text, "* headline")).toBe("org-headline-1");
  });

  specimen.it("a directive is not a comment", () => {
    specimen.expect(mark("#+title: a\n", "#+title:")).toBe("org-directive");
    specimen.expect(mark("# a comment\n", "# a comment")).toBe("org-comment");
    specimen.expect(names("#not a comment\n")).toEqual([]);
  });

  specimen.it("bullets, checkboxes and the rule", () => {
    specimen.expect(mark("- [ ] open\n", "-")).toBe("org-bullet");
    specimen.expect(mark("- [ ] open\n", "[ ]")).toBe("org-checkbox");
    specimen.expect(mark("+ [X] closed\n", "[X]")).toBe("org-checked");
    specimen.expect(mark("1) numbered\n", "1)")).toBe("org-bullet");
    specimen.expect(mark("-----\n", "-----")).toBe("org-rule");
  });

  specimen.it("table pipes and separator rows", () => {
    const text = "| a | b |\n|---+---|\n";
    specimen.expect(names(text).every((name) => name === "org-table")).toBe(true);
    specimen.expect(mark(text, "|---+---|")).toBe("org-table");
  });
});

specimen.describe("org — inline", () => {
  specimen.it("all six emphasis markers", () => {
    specimen.expect(mark("a *bold* b\n", "*bold*")).toBe("org-bold");
    specimen.expect(mark("a /italic/ b\n", "/italic/")).toBe("org-italic");
    specimen.expect(mark("a _under_ b\n", "_under_")).toBe("org-underline");
    specimen.expect(mark("a +struck+ b\n", "+struck+")).toBe("org-strike");
    specimen.expect(mark("a =verbatim= b\n", "=verbatim=")).toBe("org-verbatim");
    specimen.expect(mark("a ~code~ b\n", "~code~")).toBe("org-code");
  });

  specimen.it("org's own open/close rule — a marker against whitespace is not emphasis", () => {
    specimen.expect(names("a * bold * b\n")).toEqual([]);
    specimen.expect(names("2*3*4\n")).toEqual([]);
    specimen.expect(names("a *bold *\n")).toEqual([]);
  });

  specimen.it("links, footnotes, targets, macros, latex, entities", () => {
    specimen.expect(mark("[[22.04][the doc]]\n", "[[22.04][the doc]]")).toBe("org-link");
    specimen.expect(mark("[[22.04]]\n", "[[22.04]]")).toBe("org-link");
    specimen.expect(mark("a [fn:1] b\n", "[fn:1]")).toBe("org-footnote");
    specimen.expect(mark("a <<anchor>> b\n", "<<anchor>>")).toBe("org-target");
    specimen.expect(mark("a {{{name(x)}}} b\n", "{{{name(x)}}}")).toBe("org-macro");
    specimen.expect(mark("a $e = m$ b\n", "$e = m$")).toBe("org-latex");
    specimen.expect(mark("a \\alpha b\n", "\\alpha")).toBe("org-entity");
  });
});

specimen.describe("org — folding", () => {
  const text = "* one\nbody\n** two\nmore\n* three\n#+begin_src js\nx\n#+end_src\n:PROPERTIES:\n:ID: 1\n:END:\n";

  specimen.it("a headline folds down to the next headline of its level or shallower", () => {
    specimen.expect(folds(text)(1)).toBe("body\n** two\nmore");
    specimen.expect(folds(text)(3)).toBe("more");
  });

  specimen.it("the last headline folds to the end of the document", () => {
    specimen.expect(folds("* one\na\nb\n")(1)).toBe("a\nb\n");
  });

  specimen.it("a block folds to its own end and a drawer to :END:", () => {
    specimen.expect(folds(text)(6)).toBe("x");
    specimen.expect(folds(text)(9)).toBe(":ID: 1");
  });

  specimen.it("plain lines do not fold", () => {
    specimen.expect(folds(text)(2)).toBe(null);
  });
});
