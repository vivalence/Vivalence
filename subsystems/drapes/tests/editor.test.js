import { specimen } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { EditorState, EditorSelection } from "@codemirror/state";
import { indentOnInput } from "@codemirror/language";
import { language, formats } from "../editor/languages.js";
import { diff, NONE, External, originated } from "../editor/sync.js";

const read = (name) => Deno.readTextFile(new URL(`../editor/${name}`, import.meta.url));

specimen.describe("editor — the CodeMirror wrapper", () => {
  specimen.it("Editor.svelte compiles without warnings", async () => {
    const out = compile(await read("Editor.svelte"), { generate: "client", runes: true, filename: "Editor.svelte" });
    specimen.expect(out.js.code.length > 0).toBe(true);
    specimen.expect(out.warnings.map((warning) => `${warning.code}: ${warning.message}`)).toEqual([]);
  });

  specimen.it("the entry is a .js barrel — a .svelte subpath cannot be bundled", async () => {
    specimen.expect((await read("index.js")).includes('from "./Editor.svelte"')).toBe(true);
  });

  specimen.it("vim is not in the base graph", async () => {
    for (const name of ["index.js", "Editor.svelte", "languages.js", "theme.js", "sync.js"])
      specimen.expect((await read(name)).includes("codemirror-vim")).toBe(false);
  });

  specimen.it("the grammar list is the editor's own, and every name in it resolves", () => {
    specimen.expect(formats).toEqual(["md", "mdx", "markdown", "org", "json", "jsonc"]);
    for (const format of formats) specimen.expect(language(format).language.parser).not.toBe(undefined);
  });

  specimen.it("every grammar survives a typed character — the whole extension stack, not just the parser", () => {
    for (const format of [...formats, "txt"]) {
      const state = EditorState.create({ doc: "# a\n", extensions: [language(format), indentOnInput()] });
      const typed = state.update({ changes: { from: 4, insert: "x" }, userEvent: "input.type" });
      specimen.expect(typed.state.doc.toString()).toBe("# a\nx");
    }
  });

  specimen.it("a grammar built on a non-LR parser allows nesting instead of asking an LR parser for wrappers", () => {
    specimen.expect(language("md").language.allowsNesting).toBe(true);
    specimen.expect(language("org").language.allowsNesting).toBe(false);
  });

  specimen.it("an unknown format is a plain editor, never a guess", () => {
    specimen.expect(language("txt")).toEqual([]);
    specimen.expect(language("pdf")).toEqual([]);
  });

  specimen.it("org marks its own line grammars apart — the names are ours, not lezer's", () => {
    const text = "#+title: a\n* head\n- item\n[[22.04][doc]]\nsee =verbatim=\n#+begin_src js\nx\n#+end_src\n";
    const found = new Set();
    language("org").language.parser.parse(text).iterate({ enter: (node) => found.add(node.name) });
    for (const name of ["org-directive", "org-headline-1", "org-bullet", "org-link", "org-verbatim", "org-block-mark", "org-block"])
      specimen.expect(found.has(name)).toBe(true);
  });

  specimen.it("theme and highlight name no literal colours", async () => {
    const text = await read("theme.js");
    specimen.expect(/#[0-9a-f]{3,8}\b/i.test(text)).toBe(false);
    specimen.expect(/\brgba?\(/.test(text)).toBe(false);
  });
});

specimen.describe("editor — the sync law: an outside text never moves the caret", () => {
  const pushed = (doc, head, next) => {
    const state = EditorState.create({ doc, selection: EditorSelection.cursor(head) });
    return state.update({
      changes: diff(state.doc.toString(), next),
      selection: EditorSelection.cursor(Math.min(head, next.length)),
      annotations: External.of(true),
    }).state;
  };

  specimen.it("a whole-document replace is what moved it — the diff is the fix", () => {
    const state = EditorState.create({ doc: "Hamburg, xwith a", selection: EditorSelection.cursor(10) });
    const replaced = state.update({ changes: { from: 0, to: state.doc.length, insert: state.doc.toString() } }).state;
    specimen.expect(replaced.selection.main.head).toBe(0);
    specimen.expect(pushed("Hamburg, xwith a", 10, "Hamburg, xwith a").selection.main.head).toBe(10);
  });

  specimen.it("the race — a stale text arriving late keeps the caret", () => {
    const held = pushed("Hamburg, xwith a", 10, "Hamburg, with a");
    specimen.expect(held.selection.main.head).toBe(10);
    specimen.expect(held.doc.toString()).toBe("Hamburg, with a");
  });

  specimen.it("an edit far from the caret leaves the caret alone", () => {
    specimen.expect(pushed("Hamburg, xwith a", 10, "HAMBURG, xwith a").selection.main.head).toBe(10);
  });

  specimen.it("the caret clamps when the text shrinks past it", () => {
    specimen.expect(pushed("a long line", 11, "short").selection.main.head).toBe(5);
  });

  specimen.it("the diff is minimal — one keystroke is one character, never the document", () => {
    specimen.expect(diff("abc", "abc")).toEqual({ from: 3, to: 3, insert: "" });
    specimen.expect(diff("abc", "abxc")).toEqual({ from: 2, to: 2, insert: "x" });
    specimen.expect(diff("abxc", "abc")).toEqual({ from: 2, to: 3, insert: "" });
    specimen.expect(diff("", "abc")).toEqual({ from: 0, to: 0, insert: "abc" });
    specimen.expect(diff("abc", "")).toEqual({ from: 0, to: 3, insert: "" });
  });

  specimen.it("the wrapper's own push is not echoed back out", () => {
    const state = EditorState.create({ doc: "a" });
    const ours = state.update({ changes: { from: 1, insert: "b" }, annotations: External.of(true) });
    const theirs = state.update({ changes: { from: 1, insert: "b" } });
    specimen.expect(originated({ transactions: [ours] })).toBe(true);
    specimen.expect(originated({ transactions: [theirs] })).toBe(false);
  });

  specimen.it("the empty keymap is one identity, so a compartment never churns", () => {
    specimen.expect(NONE).toEqual([]);
    specimen.expect(NONE === NONE).toBe(true);
  });
});
