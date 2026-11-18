import { mergeProps } from "solid-js";
import { parts } from "@vivalence/dapper";

export const FILL = "█";

export const TRACK = "░";

export const filled = (value, width) => Math.round(Math.max(0, Math.min(1, value)) * width);

export const Meter = (props) => {
  const held = mergeProps({ width: 6 }, props);
  return (
    <text>
      <span style={{ fg: held.value >= parts.meter.CAUTION ? held.palette.signalCaution : held.palette.textInk }}>{FILL.repeat(filled(held.value, held.width))}</span>
      <span style={{ fg: held.palette.divider }}>{TRACK.repeat(held.width - filled(held.value, held.width))}</span>
    </text>
  );
};
