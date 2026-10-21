import { mergeProps, Show } from "solid-js";
import { lookup } from "./lookup.js";

export const LIVES = { primary: "signalPrimary", caution: "signalCaution", negative: "signalNegative" };

export const live = (signal) => lookup(LIVES, signal, "live signal");

export const Tab = (props) => {
  const held = mergeProps({ current: false, signal: null, shared: false, onPick: () => {} }, props);
  const ground = () => (held.current ? held.palette.surface : held.palette.surfaceSunk);
  return (
    <box
      style={{
        flexDirection: "row",
        height: 1,
        alignSelf: "flex-start",
        backgroundColor: ground(),
        border: held.current ? ["left", "right"] : [],
        borderColor: held.palette.boundary,
      }}
      onMouseUp={() => held.onPick()}
    >
      <Show when={held.current} fallback={<text fg={held.palette.textMuted}>{` ${held.index} ${held.label}`}</text>}>
        <text fg={held.palette.textStrong}>
          <b>{` ${held.index} ${held.label}`}</b>
        </text>
      </Show>
      <Show when={held.shared}>
        <text fg={held.palette.textMuted}> ∥</text>
      </Show>
      <Show when={held.signal !== null}>
        <text fg={held.palette[live(held.signal)]}> ●</text>
      </Show>
      <text> </text>
    </box>
  );
};
