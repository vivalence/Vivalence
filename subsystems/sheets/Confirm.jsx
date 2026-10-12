import { createSignal } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { usePalette } from "./palette.js";

const ENTERS = ["return", "linefeed", "enter"];

export const TOGGLES = ["left", "right", "tab", "space"];

export const choice = (palette, on, label) => (
  <text fg={on ? palette.inverseOn : palette.textMuted} bg={on ? palette.inverse : palette.surfaceLift}>{` ${label} `}</text>
);

export function Confirm(props) {
  const palette = usePalette();
  const [held, setHeld] = createSignal(props.initial);
  const KEYS = [
    [(key) => TOGGLES.includes(key.name), () => setHeld((current) => !current)],
    [(key) => key.name === "y", () => props.release(true)],
    [(key) => key.name === "n" || key.name === "escape", () => props.release(false)],
    [(key) => ENTERS.includes(key.name), () => props.release(held())],
  ];

  useKeyboard((key) => {
    const hit = KEYS.find(([test]) => test(key));
    if (hit !== undefined) hit[1]();
  });

  return (
    <box style={{ flexDirection: "row", gap: 1 }}>
      <text fg={palette.textStrong}>{props.label}</text>
      {choice(palette, held(), "yes")}
      {choice(palette, !held(), "no")}
    </box>
  );
}
