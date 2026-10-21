import { createSignal, mergeProps, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { lookup } from "./lookup.js";
import * as text from "./text.js";

export const PROMPTS = {
  turn: { glyph: "›", ink: "textMuted" },
  line: { glyph: "<<", ink: "signalPrimaryInk" },
};

export const prompt = (kind) => lookup(PROMPTS, kind, "prompt");

const SUBMITS = ["return", "linefeed", "enter"];

const PRINTABLE = /^[^\p{C}]+$/u;

export const EDITS = [
  [(key) => key.name === "left", (state) => text.move(state, -1)],
  [(key) => key.name === "right", (state) => text.move(state, 1)],
  [(key) => key.name === "backspace" || key.name === "delete", (state) => text.backspace(state)],
  [(key) => !key.ctrl && !key.meta && PRINTABLE.test(key.sequence), (state, key) => text.insert(state, key.sequence)],
];

export const Field = (props) => {
  const held = mergeProps({ prompt: "turn", placeholder: "", keys: "", focused: true, onInput: () => {}, onSubmit: () => {} }, props);
  const [cursor, setCursor] = createSignal(held.value.length);
  const state = () => ({ value: held.value, cursor: Math.min(cursor(), held.value.length) });

  useKeyboard((key) => {
    if (!held.focused || key.defaultPrevented) return;
    if (SUBMITS.includes(key.name)) {
      key.stopPropagation();
      return held.onSubmit(held.value);
    }
    const edit = EDITS.find(([test]) => test(key));
    if (edit === undefined) return;
    key.stopPropagation();
    const next = edit[1](state(), key);
    setCursor(next.cursor);
    if (next.value !== held.value) held.onInput(next.value);
  });

  return (
    <box
      style={{ flexDirection: "row", height: 1, justifyContent: "space-between", paddingLeft: 1, paddingRight: 1, backgroundColor: held.palette.controlField }}
    >
      <text>
        <span style={{ fg: held.palette[prompt(held.prompt).ink] }}>{`${prompt(held.prompt).glyph} `}</span>
        <span style={{ fg: held.palette.textStrong }}>{held.value.slice(0, state().cursor)}</span>
        <Show when={held.focused}>
          <span style={{ fg: held.palette.controlFieldCaret }}>▌</span>
        </Show>
        <span style={{ fg: held.palette.textStrong }}>{held.value.slice(state().cursor)}</span>
        <Show when={held.value === ""}>
          <span style={{ fg: held.palette.textMuted }}>{held.placeholder}</span>
        </Show>
      </text>
      <text fg={held.palette.textLight}>{held.keys}</text>
    </box>
  );
};
