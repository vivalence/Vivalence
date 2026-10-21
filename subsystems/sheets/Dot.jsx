import { lookup } from "./lookup.js";

export const DOTS = {
  positive: { glyph: "●", ink: "signalPositive" },
  primary: { glyph: "⠹", ink: "signalPrimaryInk" },
  caution: { glyph: "?", ink: "signalCautionInk" },
  negative: { glyph: "!", ink: "signalNegativeInk" },
  paused: { glyph: "‖", ink: "textMuted" },
  off: { glyph: "○", ink: "textMuted" },
};

export const dot = (signal) => lookup(DOTS, signal, "signal");

export const Dot = (props) => (
  <text fg={props.palette[dot(props.signal).ink]}>
    <b>{dot(props.signal).glyph}</b>
  </text>
);
