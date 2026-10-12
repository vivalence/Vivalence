const leaf = (value) => value === null || typeof value !== "object";

const cell = (value) => leaf(value) || (Array.isArray(value) && value.every(leaf));

const tabular = (value) =>
  Array.isArray(value) &&
  value.length > 1 &&
  value.every((row) => !leaf(row) && row.constructor === Object && Object.values(row).every(cell));

const entries = (value) =>
  Array.isArray(value) ? value.map((entry, index) => [String(index), entry]) : Object.entries(value);

const key = (name, depth) => ({ text: name, tone: "link", width: Math.max(2, 30 - depth * 2) });

const titled = (name, depth) => (depth === 0 ? { heading: name } : { spans: [{ text: name, tone: "link" }], depth });

const said = (name, text, depth) => ({ spans: [key(name, depth), { text, tone: "muted" }], depth });

const SHAPES = [
  [(entry) => leaf(entry), (name, entry, depth) => [said(name, String(entry), depth)]],
  [tabular, (name, entry, depth) => [titled(name, depth), { table: entry, depth: depth + 1 }]],
  [
    (entry) => Array.isArray(entry) && entry.every(leaf),
    (name, entry, depth) => [said(name, entry.length ? entry.join("  ") : "—", depth)],
  ],
  [() => true, (name, entry, depth) => [titled(name, depth), ...branch(entry, depth + 1)]],
];

const branch = (value, depth) => {
  const held = entries(value);
  if (!held.length) return [{ spans: [{ text: "—", tone: "muted" }], depth }];
  return held.flatMap(([name, entry]) => SHAPES.find(([test]) => test(entry))[1](name, entry, depth));
};

const ROOTS = [
  [leaf, (value) => [{ spans: [{ text: String(value), tone: "ink" }], depth: 0 }]],
  [tabular, (value) => [{ table: value, depth: 0 }]],
  [() => true, (value) => branch(value, 0)],
];

export const outline = (value) => ROOTS.find(([test]) => test(value))[1](value);
