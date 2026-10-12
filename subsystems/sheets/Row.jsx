import { Pip } from "./Pip.jsx";
import { tone, usePalette } from "./palette.js";

export function Row(props) {
  const palette = usePalette();
  return (
    <box style={{ flexDirection: "row", gap: 1, height: 1 }}>
      <Pip state={props.state} />
      <text fg={tone(palette, props.tone)}>{props.label}</text>
      <text fg={palette.textMuted}>{props.value}</text>
    </box>
  );
}
