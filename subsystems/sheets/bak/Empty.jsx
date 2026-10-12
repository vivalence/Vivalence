import { usePalette } from "./palette.js";

export function Empty(props) {
  const palette = usePalette();
  return <text fg={palette.textMuted}>{props.children}</text>;
}
