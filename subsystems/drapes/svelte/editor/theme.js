import { EditorView } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { marks } from "./org.js";

const ink = "var(--text-strong)";
const dim = (percent) => `color-mix(in srgb, ${ink} ${percent}%, transparent)`;
const FILL = { primary: "var(--signal-primary)", warning: "var(--signal-caution)" };
const INK = {
  primary: "var(--signal-primary-ink)", info: "var(--signal-primary-ink)",
  success: "var(--signal-positive-ink)",
  warning: "var(--signal-caution-ink)", accent: "var(--signal-caution-ink)",
  danger: "var(--signal-negative-ink)",
};
const fill = (role) => FILL[role];
const accent = (role) => INK[role];

export const theme = EditorView.theme({
  "&": { color: ink, backgroundColor: "transparent", height: "100%", fontSize: "inherit" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--font-family-code)", lineHeight: "1.7", overflow: "auto" },
  ".cm-content": { padding: "12px 0", caretColor: fill("primary") },
  ".cm-gutters": { backgroundColor: "transparent", color: dim(35), border: "none", paddingRight: "12px" },
  ".cm-activeLine": { backgroundColor: dim(4) },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: ink },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: `color-mix(in srgb, ${fill("primary")} 25%, transparent)` },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: fill("primary") },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": { backgroundColor: `color-mix(in srgb, ${fill("primary")} 18%, transparent)`, outline: "none" },
  ".cm-foldPlaceholder": { backgroundColor: "transparent", border: "none", color: dim(50) },
  ".cm-panels": { backgroundColor: "var(--surface-lift)", color: ink, border: "none" },
  ".cm-searchMatch": { backgroundColor: `color-mix(in srgb, ${fill("warning")} 30%, transparent)` },
  ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: `color-mix(in srgb, ${fill("primary")} 35%, transparent)` },
});

export const highlight = HighlightStyle.define([
  { tag: tags.heading1, color: ink, fontWeight: "600", fontSize: "1.15em" },
  { tag: tags.heading2, color: ink, fontWeight: "600" },
  { tag: [tags.heading3, tags.heading4, tags.heading5, tags.heading6], color: ink, fontWeight: "600", opacity: 0.85 },
  { tag: tags.meta, color: dim(50) },
  { tag: tags.lineComment, color: dim(45), fontStyle: "italic" },
  { tag: tags.keyword, color: accent("primary") },
  { tag: tags.link, color: accent("primary"), textDecoration: "underline" },
  { tag: tags.list, color: accent("primary") },
  { tag: tags.annotation, color: accent("info") },
  { tag: tags.contentSeparator, color: dim(35) },
  { tag: [tags.monospace, tags.string], color: accent("info") },
  { tag: tags.punctuation, color: dim(45) },
  { tag: tags.strong, color: ink, fontWeight: "600" },
  { tag: tags.emphasis, color: ink, fontStyle: "italic" },
  { tag: tags.strikethrough, color: dim(60), textDecoration: "line-through" },
  { tag: tags.macroName, color: accent("accent") },
  { tag: tags.character, color: accent("accent") },
  { tag: tags.propertyName, color: accent("primary") },
  { tag: tags.number, color: accent("accent") },
  { tag: [tags.bool, tags.null], color: accent("warning") },
  { tag: marks.todo, color: accent("warning"), fontWeight: "600" },
  { tag: marks.done, color: accent("success"), fontWeight: "600" },
  { tag: marks.priority, color: accent("danger"), fontWeight: "600" },
  { tag: marks.tag, color: accent("info") },
  { tag: marks.stamp, color: accent("accent") },
  { tag: marks.drawer, color: dim(45) },
  { tag: marks.property, color: accent("primary"), opacity: 0.8 },
  { tag: marks.checkbox, color: dim(55) },
  { tag: marks.checked, color: accent("success") },
  { tag: marks.table, color: dim(45) },
  { tag: marks.verbatim, color: accent("info") },
  { tag: marks.target, color: accent("accent") },
  { tag: marks.footnote, color: accent("info") },
]);
