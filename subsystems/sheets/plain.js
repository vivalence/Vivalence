import { is, trace } from "@vivalence/typology";
import { table } from "./table.js";

export { table } from "./table.js";
export { outline } from "./outline.js";

export const CAP = 28;

export const indent = (depth) => "  ".repeat(depth);

export const padded = (span) => (Object.hasOwn(span, "width") ? span.text.padEnd(span.width) : span.text);

export const BLOCKS = [
  [(block) => Object.hasOwn(block, "heading"), "heading"],
  [(block) => Object.hasOwn(block, "table"), "table"],
  [(block) => Object.hasOwn(block, "spans"), "spans"],
];

export const shape = (block) => {
  const found = BLOCKS.find(([test]) => test(block));
  if (found === undefined) throw new Error(`[tty] not a report block: ${JSON.stringify(block)} · heading · table · spans`);
  return found[1];
};

export const laid = (block, width) => table(block.table, width - indent(block.depth).length);

export const measure = (groups) => {
  const rows = groups.flatMap((group) => group.rows);
  const widest = (field) => Math.min(CAP, Math.max(0, ...rows.map((row) => row[field].length)));
  return { name: widest("name"), usage: widest("usage") };
};

const titled = (block) => (Object.hasOwn(block, "note") ? `${block.heading} ${block.note}` : block.heading);

const WRITERS = {
  heading: (block, width, index) => [...(index === 0 ? [] : [""]), titled(block)],
  table: (block, width) => {
    if (block.table.length === 0) return [];
    const held = laid(block, width);
    return [held.head, ...held.body].map((line) => indent(block.depth) + line);
  },
  spans: (block) => [indent(block.depth) + block.spans.map(padded).join(" ")],
};

export const wrap = (text, width) =>
  text.split(" ").reduce((lines, word) => {
    const last = lines[lines.length - 1];
    if (last.length === 0) lines[lines.length - 1] = word;
    else if (last.length + 1 + word.length <= width) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
    return lines;
  }, [""]);

export const BAR = 20;

export const GLYPHS = [
  [(node) => node.fault !== null, "✕"],
  [(node) => trace.duration(node) !== null, "✓"],
  [(node) => node.timing !== null, "◐"],
  [() => true, "○"],
];

const gauge = (entry) => is.object(entry.data) && is.number(entry.data.done) && is.number(entry.data.total);

const said = (data) => Object.entries(data).map(([key, value]) => `${key} ${value}`).join("  ");

const laidOut = (node, depth) => [{ node, depth }, ...node.children.flatMap((child) => laidOut(child, depth + 1))];

const measured = ({ node, depth }) => {
  const last = node.entries.findLast(gauge);
  const elapsed = trace.duration(node);
  return {
    depth,
    node,
    head: `${indent(depth)}${GLYPHS.find(([test]) => test(node))[1]} ${depth === 0 ? node.path : node.nature}`,
    count: last === undefined ? "" : `${last.data.done}/${last.data.total}`,
    bar: last === undefined ? "" : "━".repeat(Math.round((BAR * last.data.done) / last.data.total)).padEnd(BAR, "─"),
    elapsed: elapsed === null ? "" : `${Math.round(elapsed)}ms`,
  };
};

const COLUMNS = [
  ["head", "padEnd"],
  ["count", "padStart"],
  ["bar", "padEnd"],
  ["elapsed", "padStart"],
];

const hanging = (lead, note, width) => {
  const room = Math.max(width - lead.length, Math.floor(width / 2));
  const [first, ...rest] = wrap(note, room);
  return [lead + first, ...rest.map((line) => " ".repeat(lead.length) + line)];
};

export const plain = {
  report: ({ blocks, width }) => blocks.flatMap((block, index) => WRITERS[shape(block)](block, width, index)).join("\n"),
  listing: ({ title, groups, notes, width }) => {
    const size = measure(groups);
    return [
      title,
      ...groups.flatMap((group) => [
        "",
        group.title,
        ...group.rows.flatMap((row) => hanging(`  ${row.name.padEnd(size.name)}  ${row.usage.padEnd(size.usage)}  `, row.note, width)),
      ]),
      ...(notes.length ? ["", ...notes] : []),
    ].join("\n");
  },
  trace: ({ records }) => {
    const rows = trace.chronicle(records).roots.flatMap((root) => laidOut(root, 0)).map(measured);
    const nested = rows.filter((row) => row.depth > 0);
    const columns = COLUMNS.map(([field, pad]) => ({ field, pad, width: Math.max(0, ...nested.map((row) => row[field].length)) }))
      .filter((column) => column.width > 0);
    const titled = (row) => COLUMNS.map(([field]) => row[field]).filter((cell) => cell.length > 0).join("  ");
    const aligned = (row) => columns.map((column) => row[column.field][column.pad](column.width)).join("  ").trimEnd();
    return rows
      .flatMap((row) => [
        row.depth === 0 ? titled(row) : aligned(row),
        ...row.node.entries.filter((entry) => !gauge(entry) && is.object(entry.data)).map((entry) => `${indent(row.depth + 1)}· ${said(entry.data)}`),
        ...(row.node.fault === null ? [] : [`${indent(row.depth + 1)}✕ ${row.node.fault.message}`]),
      ])
      .join("\n");
  },
};
