import { For } from "solid-js";

export const LEAVES = [
  [(value) => value === null, () => ({ text: "null", ink: "textMuted" })],
  [(value) => typeof value === "string", (value) => ({ text: JSON.stringify(value), ink: "textLink" })],
  [(value) => typeof value === "number", (value) => ({ text: String(value), ink: "signalCautionInk" })],
  [(value) => typeof value === "boolean", (value) => ({ text: String(value), ink: "signalPrimaryInk" })],
];

const summary = (value) => (Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`);

export const rows = (value, depth = 0, key = null) => {
  const leaf = LEAVES.find(([test]) => test(value));
  if (leaf !== undefined) return [{ depth, key, ...leaf[1](value) }];
  return [
    { depth, key, text: summary(value), ink: "textMuted" },
    ...Object.entries(value).flatMap(([child, held]) => rows(held, depth + 1, child)),
  ];
};

export const JsonTree = (props) => (
  <box style={{ flexDirection: "column" }}>
    <For each={rows(props.data)}>
      {(row) => (
        <text>
          {"  ".repeat(row.depth)}
          <span style={{ fg: props.palette.textInk }}>{row.key === null ? "" : `${row.key}: `}</span>
          <span style={{ fg: props.palette[row.ink] }}>{row.text}</span>
        </text>
      )}
    </For>
  </box>
);
