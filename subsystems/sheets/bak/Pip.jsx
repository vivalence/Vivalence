import { tone, usePalette } from "./palette.js";

export const PIPS = {
  on: { glyph: "●", tone: "positive" },
  pending: { glyph: "◐", tone: "caution" },
  off: { glyph: "○", tone: "muted" },
  fault: { glyph: "✕", tone: "negative" },
  unknown: { glyph: "?", tone: "caution" },
};

export function Pip(props) {
  const palette = usePalette();
  const pip = () => PIPS[props.state];
  return <text fg={tone(palette, pip().tone)}>{pip().glyph}</text>;
}
