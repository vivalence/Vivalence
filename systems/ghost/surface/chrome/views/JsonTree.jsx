import { For } from "solid-js";
import { tone, usePalette } from "../palette.js";

const LEAVES = [
  [(value) => value === null, () => ({ text: "null", tone: "muted" })],
  [(value) => typeof value === "string", (value) => ({ text: JSON.stringify(value), tone: "link" })],
  [(value) => typeof value === "number", (value) => ({ text: String(value), tone: "caution" })],
  [(value) => typeof value === "boolean", (value) => ({ text: String(value), tone: "primary" })],
];

const summary = (value) => (Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`);

const rows = (value, depth = 0, key = null) => {
  const leaf = LEAVES.find(([test]) => test(value));
  if (leaf !== undefined) return [{ depth, key, ...leaf[1](value) }];
  return [
    { depth, key, text: summary(value), tone: "muted" },
    ...Object.entries(value).flatMap(([child, held]) => rows(held, depth + 1, child)),
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
