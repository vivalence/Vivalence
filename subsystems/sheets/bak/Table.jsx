import { For, Show } from "solid-js";
import { indent, table } from "./plain.js";
import { usePalette } from "./palette.js";

export function Table(props) {
  const palette = usePalette();
  const laid = () => table(props.rows, props.width - indent(props.depth).length);
  return (
    <Show when={props.rows.length > 0}>
      <box style={{ flexDirection: "column" }}>
        <text fg={palette.textMuted}>{indent(props.depth) + laid().head}</text>
        <For each={laid().body}>{(line) => <text fg={palette.textInk}>{indent(props.depth) + line}</text>}</For>
      </box>
    </Show>
  );
}
