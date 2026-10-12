import { createSignal, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import * as text from "./state/text.js";
import { usePalette } from "./palette.js";

const SUBMITS = ["return", "linefeed", "enter"];

const EDITS = [
  [(key) => key.name === "left", (state) => text.move(state, -1)],
  [(key) => key.name === "right", (state) => text.move(state, 1)],
  [(key) => key.name === "backspace" || key.name === "delete", (state) => text.backspace(state)],
  [(key) => !key.ctrl && !key.meta && /^[^\p{C}]+$/u.test(key.sequence), (state, key) => text.insert(state, key.sequence)],
];

export function Input(props) {
  const palette = usePalette();
  const [cursor, setCursor] = createSignal(props.value.length);
  const state = () => ({ value: props.value, cursor: Math.min(cursor(), props.value.length) });
  const shown = () => (props.mask ? "•".repeat(props.value.length) : props.value);

  useKeyboard((key) => {
    if (!props.focused) return;
    if (SUBMITS.includes(key.name)) {
      key.stopPropagation();
      return props.onSubmit(props.value);
    }
    const edit = EDITS.find(([test]) => test(key));
    if (edit === undefined) return;
    key.stopPropagation();
    const next = edit[1](state(), key);
    setCursor(next.cursor);
    if (next.value !== props.value) props.onInput(next.value);
  });

  return (
    <box style={{ flexDirection: "row", height: 1, flexShrink: 0 }}>
      <text fg={props.focused ? palette.signalPrimary : palette.textMuted}>{`${props.prompt} `}</text>
      <Show
        when={props.value.length > 0 || props.focused}
        fallback={<text fg={palette.textMuted}>{props.placeholder}</text>}
      >
        <text fg={palette.textStrong}>
          {shown().slice(0, state().cursor)}
          <span fg={palette.signalPrimary}>{props.focused ? "▌" : ""}</span>
          {shown().slice(state().cursor)}
        </text>
      </Show>
    </box>
  );
}
