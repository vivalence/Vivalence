const KEYWORD_RE = /^#\+(\w+):\s*(.*)$/;
const HEADING_RE = /^(\*+)\s+(.+)$/;
const SRC_OPEN_RE = /^#\+begin_src\s*(\S*)\s*$/i;
const SRC_CLOSE_RE = /^#\+end_src\s*$/i;
const BLOCK_OPEN_RE = /^#\+begin_(quote|example)\s*$/i;
const BLOCK_CLOSE_RE = /^#\+end_(quote|example)\s*$/i;
const LIST_ITEM_RE = /^(\s*)([-+]|\d+[.)])\s+(.+)$/;
const TABLE_RE = /^\s*\|/;
const TABLE_RULE_RE = /^\s*\|[-+|]+\|?\s*$/;
const INLINE_RE = /(\[\[[^\]]+?\](?:\[[^\]]+?\])?\]|\*[^*\n]+?\*|\/[^/\n]+?\/|~[^~\n]+?~|=[^=\n]+?=|_[^_\n]+?_)/g;

export function parseBlocks(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const keyword = line.match(KEYWORD_RE);
    if (keyword) {
      if (keyword[1].toUpperCase() === "TITLE") blocks.push({ kind: "heading", level: 1, inline: parseInline(keyword[2]) });
      i += 1;
      continue;
    }

    const src = line.match(SRC_OPEN_RE);
    if (src) {
      const codeLines = [];
      i += 1;
      while (i < lines.length && !SRC_CLOSE_RE.test(lines[i])) codeLines.push(lines[i++]);
      i += 1;
      blocks.push({ kind: "code-block", lang: src[1] || "", text: codeLines.join("\n") });
      continue;
    }

    const block = line.match(BLOCK_OPEN_RE);
    if (block) {
      const inner = [];
      i += 1;
      while (i < lines.length && !BLOCK_CLOSE_RE.test(lines[i])) inner.push(lines[i++]);
      i += 1;
      blocks.push(
        block[1].toLowerCase() === "example"
          ? { kind: "code-block", lang: "", text: inner.join("\n") }
          : { kind: "blockquote", inline: parseInline(inner.join(" ")) },
      );
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      blocks.push({ kind: "heading", level: Math.min(heading[1].length + 1, 6), inline: parseInline(heading[2]) });
      i += 1;
      continue;
    }

    if (TABLE_RE.test(line)) {
      const rows = [];
      while (i < lines.length && TABLE_RE.test(lines[i])) {
        if (!TABLE_RULE_RE.test(lines[i])) rows.push(cells(lines[i]).map((cell) => parseInline(cell)));
        i += 1;
      }
      const [header, ...rest] = rows;
      blocks.push({ kind: "table", header: header ?? [], rows: rest });
      continue;
    }

    if (LIST_ITEM_RE.test(line)) {
      const items = [];
      const ordered = /\d/.test(line.match(LIST_ITEM_RE)[2]);
      while (i < lines.length && LIST_ITEM_RE.test(lines[i])) {
        items.push({ inline: parseInline(lines[i].match(LIST_ITEM_RE)[3]) });
        i += 1;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    const paragraph = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !KEYWORD_RE.test(lines[i]) &&
      !HEADING_RE.test(lines[i]) &&
      !SRC_OPEN_RE.test(lines[i]) &&
      !BLOCK_OPEN_RE.test(lines[i]) &&
      !LIST_ITEM_RE.test(lines[i]) &&
      !TABLE_RE.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push({ kind: "paragraph", inline: parseInline(paragraph.join("\n")) });
  }

  return blocks;
}

function cells(line) {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map((cell) => cell.trim());
}

export function parseInline(text) {
  if (!text) return [];
  const out = [];
  let last = 0;
  text.replace(INLINE_RE, (match, _g, offset) => {
    if (offset > last) out.push({ kind: "text", text: text.slice(last, offset) });
    if (match.startsWith("[[")) {
      const link = match.match(/^\[\[([^\]]+?)\](?:\[([^\]]+?)\])?\]$/);
      out.push({ kind: "link", href: link[1], text: link[2] ?? link[1] });
    } else if (match.startsWith("*")) out.push({ kind: "bold", text: match.slice(1, -1) });
    else if (match.startsWith("/")) out.push({ kind: "italic", text: match.slice(1, -1) });
    else if (match.startsWith("_")) out.push({ kind: "italic", text: match.slice(1, -1) });
    else out.push({ kind: "code", text: match.slice(1, -1) });
    last = offset + match.length;
    return match;
  });
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out.length ? out : [{ kind: "text", text }];
}
