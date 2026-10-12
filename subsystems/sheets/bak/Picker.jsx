import { createSignal, For, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import * as search from "./state/search.js";
import { Input } from "./Input.jsx";
import { usePalette } from "./palette.js";

export const HEIGHT = 8;

const cell = (value) => String(value === null || value === undefined ? "" : value);

const measure = (rows, columns) =>
  columns.map((key) => ({ key, width: rows.reduce((widest, row) => Math.max(widest, cell(row[key]).length), key.length) }));

const line = (row, layout) => layout.map((column) => cell(row[column.key]).padEnd(column.width)).join("  ");

export function Picker(props) {
  const palette = usePalette();
  const [state, setState] = createSignal(
    search.init({ rows: props.rows, keys: props.keys, facets: props.facets, text: props.query, index: props.index }),
  );
  const layout = measure(props.rows, props.columns);
  const window = () => search.slice(state(), HEIGHT);
  const move = (delta) => setState((held) => search.move(held, delta));
  const pick = () => {
    const row = search.value(state());
    if (row !== null) props.release(row);
  };

  const KEYS = [
    [(key) => key.name === "escape", () => props.release({ aborted: true })],
    [(key) => key.name === "up" || (key.ctrl && key.name === "p"), () => move(-1)],
    [(key) => key.name === "down" || (key.ctrl && key.name === "n"), () => move(1)],
    [(key) => key.name === "pageup", () => move(-HEIGHT)],
    [(key) => key.name === "pagedown", () => move(HEIGHT)],
  ];

  useKeyboard((key) => {
    const hit = KEYS.find(([test]) => test(key));
    if (hit === undefined) return;
    key.stopPropagation();
    hit[1]();
  });

  const facets = props.facets.length ? `  ·  ${props.facets.map((facet) => `${facet}:`).join(" ")}` : "";

  return (
    <box style={{ flexDirection: "column" }}>
      <Input
        prompt={`${props.label} ›`}
        placeholder="type to narrow"
        value={state().text}
        onInput={(text) => setState((held) => search.seek(held, text))}
        onSubmit={pick}
        focused
      />
      <Show when={window().rows.length > 0} fallback={<text fg={palette.textMuted}>{"  no match"}</text>}>
        <For each={window().rows}>
          {(row, offset) => (
            <text fg={window().start + offset() === state().index ? palette.signalPrimary : palette.textInk}>
              {(window().start + offset() === state().index ? "› " : "  ") + line(row, layout)}
            </text>
          )}
        </For>
      </Show>
      <text fg={palette.textMuted}>{`${state().matches.length}/${state().rows.length}${facets}  ·  ↑↓ move  ⏎ pick  esc cancel`}</text>
    </box>
  );
}
