import { For, Show } from "solid-js";
import { measure } from "./plain.js";
import { usePalette } from "./palette.js";

export function Listing(props) {
  const palette = usePalette();
  const size = measure(props.groups);
  return (
    <box style={{ flexDirection: "column" }}>
      <text fg={palette.textStrong}><b>{props.title}</b></text>
      <For each={props.groups}>
        {(group) => (
          <box style={{ flexDirection: "column", marginTop: 1 }}>
            <text fg={palette.textStrong}><b>{group.title}</b></text>
            <For each={group.rows}>
              {(row) => (
                <text>
                  <span fg={palette.textLink}>{`  ${row.name.padEnd(size.name)}  `}</span>
                  <span fg={palette.signalPrimary}>{`${row.usage.padEnd(size.usage)}  `}</span>
                  <span fg={palette.textMuted}>{row.note}</span>
                </text>
              )}
            </For>
          </box>
        )}
      </For>
      <Show when={props.notes.length > 0}>
        <box style={{ flexDirection: "column", marginTop: 1 }}>
          <For each={props.notes}>{(note) => <text fg={palette.textMuted}>{note}</text>}</For>
        </box>
      </Show>
    </box>
  );
}
