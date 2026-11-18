import { For, mergeProps } from "solid-js";
import { parts } from "@vivalence/dapper";

const rings = (count) => Array.from({ length: count }, (_, index) => index);

export const Meter = (props) => {
  const held = mergeProps({ rings: 6, label: "context", caution: true }, props);
  return (
    <span
      class={held.caution && held.pct / 100 >= parts.meter.CAUTION ? "meter cau" : "meter"}
      title={`${held.label} ${held.pct} %`}>
      <For each={rings(held.rings)}>{(index) => <i class={(index + 1) / held.rings <= held.pct / 100 + 0.001 ? "on" : ""} />}</For>
    </span>
  );
};
