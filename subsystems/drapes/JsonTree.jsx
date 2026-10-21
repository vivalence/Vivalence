import { For, Show } from "solid-js";

const TONES = [
  [(value) => value === null, "m"],
  [(value) => typeof value === "string", "s"],
  [(value) => typeof value === "number", "n"],
  [(value) => typeof value === "boolean", "b"],
  [() => true, ""],
];

const tone = (value) => TONES.find(([test]) => test(value))[1];

const branches = (value) => (Array.isArray(value) ? value.map((child, index) => [String(index), child]) : Object.entries(value));

const counted = (value) => (Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`);

const leaf = (value) => (typeof value === "string" ? JSON.stringify(value) : String(value));

export const rows = (value, key = null, depth = 0) =>
  value !== null && typeof value === "object"
    ? [
        ...(key === null ? [] : [{ key, depth, text: counted(value), tone: "m" }]),
        ...branches(value).flatMap(([name, child]) => rows(child, name, key === null ? depth : depth + 1)),
      ]
    : [{ key, depth, text: leaf(value), tone: tone(value) }];

export const JsonTree = (props) => (
  <For each={rows(props.value)}>
    {(row) => (
      <span style={{ "padding-left": `${row.depth * 14}px` }}>
        <Show when={row.key !== null}>
          <span class="k">{row.key}</span>{" "}
        </Show>
        <span class={row.tone}>{row.text}</span>
      </span>
    )}
  </For>
);
