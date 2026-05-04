// minimal block + inline markdown renderer
// returns ast: array of { kind, text|items|lang|level }
// kinds: paragraph, heading, code-block, list, blockquote, hr, divider
// inline kinds: text, bold, italic, code, link

const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const CODE_FENCE_RE = /^```(\w*)\s*$/;
const LIST_ITEM_RE = /^(\s*)([-*+]|\d+\.)\s+(.+)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;
const HR_RE = /^---+\s*$/;
const INLINE_RE = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|_[^_\n]+?_|`[^`\n]+?`|\[[^\]\n]+?\]\([^)\n]+?\))/g;

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

    const fenceMatch = line.match(CODE_FENCE_RE);
    if (fenceMatch) {
      const lang = fenceMatch[1] || "";
      const codeLines = [];
      i += 1;
      while (i < lines.length && !CODE_FENCE_RE.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ kind: "code-block", lang, text: codeLines.join("\n") });
      continue;
    }

    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      blocks.push({
        kind: "heading",
        level: headingMatch[1].length,
        inline: parseInline(headingMatch[2]),
      });
      i += 1;
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push({ kind: "hr" });
      i += 1;
      continue;
    }

    if (BLOCKQUOTE_RE.test(line)) {
      const quoteLines = [];
      while (i < lines.length && BLOCKQUOTE_RE.test(lines[i])) {
        quoteLines.push(lines[i].match(BLOCKQUOTE_RE)[1]);
        i += 1;
      }
      blocks.push({ kind: "blockquote", inline: parseInline(quoteLines.join(" ")) });
      continue;
    }

    if (LIST_ITEM_RE.test(line)) {
      const items = [];
      const firstMarker = line.match(LIST_ITEM_RE)[2];
      const ordered = /\d+\./.test(firstMarker);
      while (i < lines.length && LIST_ITEM_RE.test(lines[i])) {
        const m = lines[i].match(LIST_ITEM_RE);
        items.push({ inline: parseInline(m[3]) });
        i += 1;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    const paragraphLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !CODE_FENCE_RE.test(lines[i]) &&
      !HEADING_RE.test(lines[i]) &&
      !LIST_ITEM_RE.test(lines[i]) &&
      !BLOCKQUOTE_RE.test(lines[i]) &&
      !HR_RE.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i += 1;
    }
    blocks.push({ kind: "paragraph", inline: parseInline(paragraphLines.join("\n")) });
  }

  return blocks;
}

export function parseInline(text) {
  if (!text) return [];
  const out = [];
  let last = 0;
  text.replace(INLINE_RE, (match, _g, offset) => {
    if (offset > last) out.push({ kind: "text", text: text.slice(last, offset) });
    if (match.startsWith("**")) out.push({ kind: "bold", text: match.slice(2, -2) });
    else if (match.startsWith("*")) out.push({ kind: "italic", text: match.slice(1, -1) });
    else if (match.startsWith("_")) out.push({ kind: "italic", text: match.slice(1, -1) });
    else if (match.startsWith("`")) out.push({ kind: "code", text: match.slice(1, -1) });
    else if (match.startsWith("[")) {
      const linkMatch = match.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) out.push({ kind: "link", text: linkMatch[1], href: linkMatch[2] });
      else out.push({ kind: "text", text: match });
    }
    last = offset + match.length;
    return match;
  });
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out.length ? out : [{ kind: "text", text }];
}
