import { For } from "solid-js";
import { usePalette } from "./palette.js";

const looks = (item, palette) =>
  item.seated
    ? { fg: palette.inverseOn, bg: palette.inverse }
    : item.focused
      ? { fg: palette.signalPrimary, bg: palette.surfaceLift }
      : { fg: palette.textMuted, bg: palette.surface };

export function Strip(props) {
  const palette = usePalette();
  return (
    <box style={{ flexDirection: "row", gap: 1, height: 1 }}>
      <For each={props.items}>
        {(item) => <text fg={looks(item, palette).fg} bg={looks(item, palette).bg}>{` ${item.label} `}</text>}
      </For>
    </box>
  );
}
