import { StreamLanguage, LanguageSupport, foldService } from "@codemirror/language";
import { Tag, tags } from "@lezer/highlight";

export const marks = {
  todo: Tag.define(),
  done: Tag.define(),
  priority: Tag.define(),
  tag: Tag.define(),
  stamp: Tag.define(),
  drawer: Tag.define(),
  property: Tag.define(),
  checkbox: Tag.define(),
  checked: Tag.define(),
  table: Tag.define(),
  verbatim: Tag.define(),
  target: Tag.define(),
  footnote: Tag.define(),
};

export const TODO = ["TODO", "NEXT", "STARTED", "WAITING", "HOLD"];
export const DONE = ["DONE", "CANCELLED", "CANCELED"];

const HEADLINE = /^(\*+)(?=[ \t])/;
const BLOCK_BEGIN = /^[ \t]*#\+begin_(\S+)/i;
const BLOCK_END = /^[ \t]*#\+end_(\S+)/i;
const DIRECTIVE = /^[ \t]*#\+[A-Za-z][\w-]*:/;
const COMMENT = /^[ \t]*#(?:[ \t]|$)/;
const DRAWER = /^[ \t]*:([A-Za-z][\w-]*):[ \t]*$/;
const DRAWER_END = /^[ \t]*:END:[ \t]*$/i;
const PROPERTY = /^[ \t]*:([A-Za-z][\w+-]*):/;
const RULE = /^[ \t]*-{5,}[ \t]*$/;
const PLANNING = /^[ \t]*(?:DEADLINE|SCHEDULED|CLOSED):/;
const BULLET = /^[ \t]*(?:[-+]|\d+[.)])(?=[ \t])/;
const TABLE = /^[ \t]*\|/;
const CHECKBOX = /^\[([ xX-])\]/;
const STAMP = /^[<[]\d{4}-\d{2}-\d{2}[^>\]\n]*[>\]](?:--[<[]\d{4}-\d{2}-\d{2}[^>\]\n]*[>\]])?/;
const LINK = /^\[\[[^\]]*\](?:\[[^\]]*\])?\]/;
const FOOTNOTE = /^\[fn:[^\]]*\]/;
const TARGET = /^<<<?[^<>\n]+>>>?/;
const MACRO = /^\{\{\{[^}\n]*\}\}\}/;
const LATEX = /^(?:\\\([^\n]*?\\\)|\\\[[^\n]*?\\\]|\$[^$\n]+\$)/;
const ENTITY = /^\\[A-Za-z][A-Za-z0-9]*(?:\{\})?/;
const TAGS = /^:(?:[\w@#%]+:)+[ \t]*$/;
const PRIORITY = /^\[#[A-Z]\]/;

const EMPHASIS = { "*": "org-bold", "/": "org-italic", _: "org-underline", "+": "org-strike", "=": "org-verbatim", "~": "org-code" };
const OPENS = /[\s({'"\-]/;
const CLOSES = /[\s.,;:!?')}"\]\[\-]/;

const level = (stars) => Math.min(stars.length, 6);

const emphasis = (stream) => {
  const marker = stream.peek();
  const style = EMPHASIS[marker];
  if (!style) return null;
  if (!OPENS.test(stream.pos === 0 ? "\n" : stream.string[stream.pos - 1])) return null;
  const body = stream.string.slice(stream.pos + 1);
  if (!body || /\s/.test(body[0])) return null;
  for (let index = body.indexOf(marker, 1); index > 0; index = body.indexOf(marker, index + 1)) {
    if (/\s/.test(body[index - 1])) continue;
    if (!CLOSES.test(body[index + 1] ?? "\n")) continue;
    stream.pos += index + 2;
    return style;
  }
  return null;
};

const inline = (stream) => {
  if (stream.match(LINK)) return "org-link";
  if (stream.match(FOOTNOTE)) return "org-footnote";
  if (stream.match(STAMP)) return "org-stamp";
  if (stream.match(TARGET)) return "org-target";
  if (stream.match(MACRO)) return "org-macro";
  if (stream.match(LATEX)) return "org-latex";
  if (stream.match(ENTITY)) return "org-entity";
  const emphasized = emphasis(stream);
  if (emphasized) return emphasized;
  stream.next();
  return null;
};

const headline = (stream, state) => {
  const title = `org-headline-${state.headline.level}`;
  if (stream.eatSpace()) return title;
  if (state.headline.todo) {
    state.headline.todo = false;
    const word = stream.match(/^[A-Z][A-Z0-9_]*(?=[ \t]|$)/);
    if (word) {
      if (state.todo.includes(word[0])) return "org-todo";
      if (state.done.includes(word[0])) return "org-done";
      stream.backUp(word[0].length);
    }
  }
  if (stream.match(PRIORITY)) return "org-priority";
  if (stream.match(TAGS)) return "org-tag";
  return inline(stream) ?? title;
};

const table = (stream) => {
  if (stream.eat("|")) return "org-table";
  if (stream.match(/^[-+]+(?=\||[ \t]*$)/)) return "org-table";
  if (stream.eatSpace()) return null;
  return inline(stream);
};

const drawer = (stream, state) => {
  if (stream.sol() && stream.match(DRAWER_END)) {
    state.drawer = false;
    return "org-drawer";
  }
  if (stream.sol() && stream.match(PROPERTY)) return "org-property";
  stream.skipToEnd();
  return "org-value";
};

const block = (stream, state) => {
  const closing = stream.string.match(BLOCK_END);
  if (stream.sol() && closing && closing[1].toLowerCase() === state.block) {
    state.block = null;
    stream.skipToEnd();
    return "org-block-mark";
  }
  stream.skipToEnd();
  return "org-block";
};

const start = (stream, state) => {
  if (stream.string.startsWith("*")) {
    const stars = stream.match(HEADLINE);
    if (stars) {
      state.headline = { todo: true, level: level(stars[1]) };
      return `org-headline-${state.headline.level}`;
    }
  }
  const opening = stream.match(BLOCK_BEGIN);
  if (opening) {
    state.block = opening[1].toLowerCase();
    stream.skipToEnd();
    return "org-block-mark";
  }
  if (stream.match(DRAWER)) {
    state.drawer = true;
    return "org-drawer";
  }
  if (stream.match(COMMENT)) {
    stream.skipToEnd();
    return "org-comment";
  }
  if (stream.match(DIRECTIVE)) return "org-directive";
  if (stream.match(RULE)) return "org-rule";
  if (stream.match(PLANNING)) return "org-planning";
  if (stream.match(BULLET)) return "org-bullet";
  return null;
};

const parser = ({ todo = TODO, done = DONE } = {}) => ({
  name: "org",
  languageData: { commentTokens: { line: "#" } },
  startState: () => ({ todo, done, block: null, drawer: false, headline: null }),
  copyState: (state) => ({ ...state, headline: state.headline && { ...state.headline } }),
  token: (stream, state) => {
    if (stream.sol() && !state.block) state.headline = null;
    if (state.block) return block(stream, state);
    if (state.drawer) return drawer(stream, state);
    if (stream.sol()) {
      const opened = start(stream, state);
      if (opened) return opened;
    }
    if (state.headline) return headline(stream, state);
    if (TABLE.test(stream.string)) return table(stream);
    if (stream.eatSpace()) return null;
    const checkbox = stream.match(CHECKBOX);
    if (checkbox) return checkbox[1] === " " ? "org-checkbox" : "org-checked";
    return inline(stream);
  },
  tokenTable: {
    "org-headline-1": tags.heading1,
    "org-headline-2": tags.heading2,
    "org-headline-3": tags.heading3,
    "org-headline-4": tags.heading4,
    "org-headline-5": tags.heading5,
    "org-headline-6": tags.heading6,
    "org-todo": marks.todo,
    "org-done": marks.done,
    "org-priority": marks.priority,
    "org-tag": marks.tag,
    "org-stamp": marks.stamp,
    "org-planning": tags.annotation,
    "org-drawer": marks.drawer,
    "org-property": marks.property,
    "org-value": tags.string,
    "org-block-mark": tags.keyword,
    "org-block": tags.content,
    "org-directive": tags.meta,
    "org-comment": tags.lineComment,
    "org-rule": tags.contentSeparator,
    "org-bullet": tags.list,
    "org-checkbox": marks.checkbox,
    "org-checked": marks.checked,
    "org-table": marks.table,
    "org-link": tags.link,
    "org-footnote": marks.footnote,
    "org-target": marks.target,
    "org-macro": tags.macroName,
    "org-latex": tags.special(tags.content),
    "org-entity": tags.character,
    "org-bold": tags.strong,
    "org-italic": tags.emphasis,
    "org-underline": tags.link,
    "org-strike": tags.strikethrough,
    "org-verbatim": marks.verbatim,
    "org-code": tags.monospace,
  },
});

export const orgLanguage = StreamLanguage.define(parser());

const stars = (text) => text.match(/^(\*+)[ \t]/)?.[1].length ?? 0;

export const folding = foldService.of((state, from, to) => {
  const text = state.doc.lineAt(from).text;
  const depth = stars(text);
  const opening = depth ? null : text.match(BLOCK_BEGIN);
  const opens = !opening && DRAWER.test(text);
  if (!depth && !opening && !opens) return null;
  const last = state.doc.lines;
  let line = state.doc.lineAt(from).number;
  while (++line <= last) {
    const next = state.doc.line(line);
    if (depth) {
      const found = stars(next.text);
      if (found && found <= depth) return { from: to, to: state.doc.line(line - 1).to };
    } else if (opening) {
      if (next.text.match(BLOCK_END)?.[1].toLowerCase() === opening[1].toLowerCase()) return { from: to, to: next.from - 1 };
    } else if (DRAWER_END.test(next.text)) return { from: to, to: next.from - 1 };
  }
  return depth ? { from: to, to: state.doc.line(last).to } : null;
});

export const org = (config) => new LanguageSupport(config ? StreamLanguage.define(parser(config)) : orgLanguage, [folding]);
