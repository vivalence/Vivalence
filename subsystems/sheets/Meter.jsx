import { mergeProps } from "solid-js";

export const CAUTION = 0.85;

export const FILL = "█";

export const TRACK = "░";

export const filled = (value, width) => Math.round(Math.max(0, Math.min(1, value)) * width);

export const Meter = (props) => {
  const held = mergeProps({ width: 6 }, props);
  return (
    <text>
      <span style={{ fg: held.value >= CAUTION ? held.palette.signalCaution : held.palette.textInk }}>{FILL.repeat(filled(held.value, held.width))}</span>
      <span style={{ fg: held.palette.divider }}>{TRACK.repeat(held.width - filled(held.value, held.width))}</span>
    </text>
  );
};
