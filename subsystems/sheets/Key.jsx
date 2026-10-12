import { usePalette } from "./palette.js";

export function Key(props) {
  const palette = usePalette();
  return (
    <text flexShrink={0}>
      <span fg={palette.textStrong} bg={palette.surfaceLift}>{` ${props.name} `}</span>
      <span fg={palette.textMuted}>{` ${props.action}`}</span>
    </text>
  );
}
