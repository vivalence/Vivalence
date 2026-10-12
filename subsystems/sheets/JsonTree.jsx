import { For } from "solid-js";
import { tone, usePalette } from "./palette.js";

const branch = (value) => value !== null && typeof value === "object";

const LEAVES = [
  [(value) => value === null, () => ({ text: "null", tone: "muted" })],
  [(value) => value === undefined, () => ({ text: "undefined", tone: "muted" })],
  [(value) => typeof value === "string", (value) => ({ text: JSON.stringify(value), tone: "link" })],
  [(value) => typeof value === "number" || typeof value === "bigint", (value) => ({ text: String(value), tone: "caution" })],
  [(value) => typeof value === "boolean", (value) => ({ text: String(value), tone: "primary" })],
  [(value) => typeof value === "function", () => ({ text: "ƒ", tone: "muted" })],
  [() => true, (value) => ({ text: String(value), tone: "ink" })],
];

const leaf = (value) => LEAVES.find(([test]) => test(value))[1](value);

const summary = (value) => (Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`);

export const rows = (value, depth = 0, key = null, seen = new WeakSet()) => {
  if (!branch(value)) return [{ depth, key, ...leaf(value) }];
  if (seen.has(value)) return [{ depth, key, text: "[seen]", tone: "negative" }];
  seen.add(value);
  return [
    { depth, key, text: summary(value), tone: "muted" },
    ...Object.entries(value).flatMap(([child, held]) => rows(held, depth + 1, child, seen)),
  ];
};

export function JsonTree(props) {
  const palette = usePalette();
  return (
    <box style={{ flexDirection: "column" }}>
      <For each={rows(props.data)}>
        {(row) => (
          <text>
            {"  ".repeat(row.depth)}
            <span fg={palette.textInk}>{row.key === null ? "" : `${row.key}: `}</span>
            <span fg={tone(palette, row.tone)}>{row.text}</span>
          </text>
        )}
      </For>
    </box>
  );
}
