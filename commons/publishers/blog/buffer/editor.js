import { Compartment, EditorSelection, EditorState, RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  drawSelection,
  EditorView,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder,
  ViewPlugin,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  highlightSelectionMatches,
  openSearchPanel,
  search,
  searchKeymap,
} from "@codemirror/search";
import {
  defineLanguageFacet,
  HighlightStyle,
  Language,
  LanguageSupport,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { GFM, parser } from "@lezer/markdown";

const tint = (signal, percent) =>
  `color-mix(in srgb, var(--signal-${signal}) ${percent}%, transparent)`;

export const KEYS = { bold: "Mod-b", italic: "Mod-i", code: "Mod-e", link: "Mod-k" };

export const FONTS = {
  sans: "var(--font-family-sans-text)",
  serif: "var(--font-family-serif-text)",
  mono: "var(--font-family-code)",
};

const theme = EditorView.theme({
  "&": { height: "100%", color: "var(--text-ink)", backgroundColor: "transparent" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": {
    width: "100%",
    margin: "0 auto",
    padding: "var(--size-space-xl) var(--size-space-md) 45vh",
    caretColor: "var(--signal-primary)",
  },
  ".cm-line": { padding: "0", transition: "opacity 160ms ease" },
  ".cm-line.cm-dim": { opacity: "0.28" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--text-light)",
    fontFamily: "var(--font-family-code)",
    fontSize: "var(--size-type-2xs)",
  },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--text-strong)" },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--signal-primary)",
    borderLeftWidth: "2px",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: tint("primary", 25),
  },
  ".cm-placeholder": { color: "var(--text-muted)" },
  ".cm-panels": {
    backgroundColor: "var(--plane-lift)",
    color: "var(--text-ink)",
    fontFamily: "var(--font-family-code)",
    fontSize: "var(--size-type-xs)",
  },
  ".cm-panels-top": { borderBottom: "var(--size-ring) solid var(--boundary)" },
  ".cm-panel.cm-search": { padding: "var(--size-space-xs) var(--size-space-sm)" },
  ".cm-panel.cm-search input, .cm-panel.cm-search button": {
    font: "inherit",
    color: "inherit",
    background: "var(--control-field)",
    border: "none",
    boxShadow: "inset 0 0 0 var(--size-ring) var(--boundary)",
    borderRadius: "var(--shape-radius-key)",
    padding: "2px 6px",
  },
  ".cm-panel.cm-search label": { fontSize: "var(--size-type-2xs)" },
  ".cm-searchMatch": { backgroundColor: tint("caution", 30) },
  ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: tint("primary", 35) },
  ".cm-selectionMatch": { backgroundColor: tint("primary", 12) },
});

const highlight = HighlightStyle.define([
  { tag: tags.heading1, color: "var(--text-strong)", fontWeight: "700", fontSize: "1.6em" },
  { tag: tags.heading2, color: "var(--text-strong)", fontWeight: "700", fontSize: "1.3em" },
  { tag: tags.heading3, color: "var(--text-strong)", fontWeight: "700", fontSize: "1.1em" },
  {
    tag: [tags.heading4, tags.heading5, tags.heading6],
    color: "var(--text-strong)",
    fontWeight: "700",
  },
  { tag: tags.strong, color: "var(--text-strong)", fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through", color: "var(--text-muted)" },
  { tag: [tags.link, tags.url], color: "var(--text-link)" },
  { tag: tags.quote, color: "var(--text-muted)", fontStyle: "italic" },
  {
    tag: tags.monospace,
    fontFamily: "var(--font-family-code)",
    fontSize: "0.9em",
    color: "var(--text-code)",
  },
  {
    tag: [tags.processingInstruction, tags.meta, tags.contentSeparator],
    color: "var(--text-light)",
  },
  { tag: tags.list, color: "var(--signal-primary-ink)" },
  { tag: tags.comment, color: "var(--text-muted)", fontStyle: "italic" },
]);

const markdown = new LanguageSupport(
  new Language(defineLanguageFacet(), parser.configure(GFM), [], "markdown"),
);

export const MARKUPS = [
  {
    suffix: /\.md$/,
    grammar: markdown,
    heading: /^(#{1,6})[ \t]+(.+)$/,
    fence: /^(```|~~~)/,
    figure: (path) => `![](/${path})`,
    marks: {
      bold: ["**", "**"],
      italic: ["_", "_"],
      code: ["`", "`"],
      link: ["[", "](https://)"],
      math: ["$", "$"],
      note: ["[^", "]"],
      strike: ["~~", "~~"],
    },
    lines: { heading: "## ", quote: "> ", list: "- ", numbered: "1. ", task: "- [ ] " },
  },
  {
    suffix: /\.org$/,
    grammar: [],
    heading: /^(\*+)[ \t]+(.+)$/,
    fence: /^#\+(begin|end)_src/i,
    figure: (path) => `[[/${path}]]`,
    marks: {
      bold: ["*", "*"],
      italic: ["/", "/"],
      code: ["~", "~"],
      link: ["[[https://][", "]]"],
      math: ["\\(", "\\)"],
      note: ["[fn:", "]"],
      strike: ["+", "+"],
    },
    lines: { heading: "** ", quote: ": ", list: "- ", numbered: "1. ", task: "- [ ] " },
  },
];

export const markup = (path) => MARKUPS.find((markup) => markup.suffix.test(path));

const paragraph = (state) => {
  const doc = state.doc;
  const here = doc.lineAt(state.selection.main.head).number;
  if (doc.line(here).text.trim() === "") return [here, here];
  let first = here;
  let last = here;
  while (first > 1 && doc.line(first - 1).text.trim() !== "") first--;
  while (last < doc.lines && doc.line(last + 1).text.trim() !== "") last++;
  return [first, last];
};

const faded = (view) => {
  const [first, last] = paragraph(view.state);
  const built = new RangeSetBuilder();
  for (const range of view.visibleRanges) {
    for (let at = range.from; at <= range.to; ) {
      const line = view.state.doc.lineAt(at);
      if (line.number < first || line.number > last)
        built.add(line.from, line.from, Decoration.line({ class: "cm-dim" }));
      at = line.to + 1;
    }
  }
  return built.finish();
};

const dimming = ViewPlugin.define(
  (view) => {
    const plugin = {
      decorations: faded(view),
      update: (update) => {
        if (update.docChanged || update.selectionSet || update.viewportChanged)
          plugin.decorations = faded(update.view);
      },
    };
    return plugin;
  },
  { decorations: (plugin) => plugin.decorations },
);

const centring = EditorState.transactionExtender.of((transaction) =>
  transaction.selection === undefined
    ? null
    : { effects: EditorView.scrollIntoView(transaction.selection.main.head, { y: "center" }) },
);

const look = new Compartment();
const gutter = new Compartment();
const spelling = new Compartment();
const focus = new Compartment();
const writer = new Compartment();

const looks = (settings) =>
  EditorView.theme({
    ".cm-scroller": {
      fontFamily: FONTS[settings.font],
      fontSize: `${settings.size}px`,
      lineHeight: String(settings.leading),
    },
    ".cm-content": { maxWidth: `${settings.measure}ch` },
  });

const parts = (settings) => [
  [look, looks(settings)],
  [gutter, settings.numbers ? [lineNumbers(), highlightActiveLineGutter()] : []],
  [
    spelling,
    EditorView.contentAttributes.of({
      spellcheck: String(settings.spellcheck),
      autocorrect: settings.spellcheck ? "on" : "off",
    }),
  ],
  [focus, settings.dim ? dimming : []],
  [writer, settings.typewriter ? centring : []],
];

export const tuned = (view, settings) =>
  view.dispatch({
    effects: parts(settings).map(([compartment, held]) => compartment.reconfigure(held)),
  });

export const wrapped = (view, [before, after]) => {
  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [
        { from: range.from, insert: before },
        { from: range.to, insert: after },
      ],
      range: EditorSelection.range(range.from + before.length, range.to + before.length),
    })),
  );
  view.focus();
  return true;
};

export const prefixed = (view, prefix) => {
  const starts = [
    ...new Set(
      view.state.selection.ranges.flatMap((range) => {
        const first = view.state.doc.lineAt(range.from).number;
        const last = view.state.doc.lineAt(range.to).number;
        return Array.from({ length: last - first + 1 }, (_, at) => first + at);
      }),
    ),
  ].map((number) => view.state.doc.line(number).from);
  view.dispatch({ changes: starts.map((from) => ({ from, insert: prefix })) });
  view.focus();
  return true;
};

export const figured = (view, text) => {
  const line = view.state.doc.lineAt(view.state.selection.main.head);
  const empty = line.text.trim() === "";
  const block = empty ? text : `\n\n${text}\n`;
  const at = empty ? line.from : line.to;
  view.dispatch({
    changes: { from: at, to: empty ? line.to : at, insert: block },
    selection: { anchor: at + block.length },
    scrollIntoView: true,
  });
  view.focus();
};

export const searched = (view) => openSearchPanel(view);

export const outline = (path, body) => {
  const held = markup(path);
  const lines = body.split("\n");
  const fenced = lines.map((line) => held.fence.test(line.trim()));
  return lines
    .map((line, at) => ({
      line: at + 1,
      inside: fenced.slice(0, at).filter(Boolean).length % 2 === 1,
      found: line.match(held.heading),
    }))
    .filter((entry) => !entry.inside && entry.found !== null)
    .map((entry) => ({ line: entry.line, depth: entry.found[1].length, title: entry.found[2] }));
};

export const reached = (view, number) => {
  const line = view.state.doc.line(Math.min(number, view.state.doc.lines));
  view.dispatch({
    selection: EditorSelection.cursor(line.from),
    effects: EditorView.scrollIntoView(line.from, { y: "start", yMargin: 48 }),
  });
  view.focus();
};

export const caret = (state) => {
  const head = state.selection.main;
  const line = state.doc.lineAt(head.head);
  return {
    line: line.number,
    column: head.head - line.from + 1,
    chosen: (state.sliceDoc(head.from, head.to).match(/\S+/g) ?? []).length,
  };
};

export const sheet = ({ path, body, settings, typed, moved, scrolled, dropped, pasted }) =>
  EditorState.create({
    doc: body,
    extensions: [
      keymap.of([
        ...Object.entries(KEYS).map(([name, key]) => ({
          key,
          run: (view) => wrapped(view, markup(path).marks[name]),
        })),
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        indentWithTab,
      ]),
      history(),
      drawSelection(),
      highlightSpecialChars(),
      highlightSelectionMatches(),
      search({ top: true }),
      syntaxHighlighting(highlight),
      theme,
      markup(path).grammar,
      placeholder("Write."),
      EditorView.lineWrapping,
      parts(settings).map(([compartment, held]) => compartment.of(held)),
      EditorView.domEventHandlers({ drop: dropped, paste: pasted, scroll: scrolled }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) typed(update.state.doc.toString());
        if (update.docChanged || update.selectionSet) moved(caret(update.state));
      }),
    ],
  });

export const mounted = (parent, root) => new EditorView({ parent, root });
