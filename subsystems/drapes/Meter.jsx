import { For, mergeProps } from "solid-js";

export const CAUTION = 85;

const rings = (count) => Array.from({ length: count }, (_, index) => index);

export const Meter = (props) => {
  const held = mergeProps({ rings: 6 }, props);
  return (
    <span class={held.pct >= CAUTION ? "meter cau" : "meter"} title={`context ${held.pct} %`}>
      <For each={rings(held.rings)}>{(index) => <i class={(index + 1) / held.rings <= held.pct / 100 + 0.001 ? "on" : ""} />}</For>
    </span>
  );
};
