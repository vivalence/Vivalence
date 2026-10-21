import { mergeProps, Show } from "solid-js";

export const GLYPH = "◆";

export const Mark = (props) => {
  const held = mergeProps({ fault: false }, props);
  return (
    <text fg={held.palette.textInk}>
      <b>{GLYPH}</b>
      <Show when={held.fault}>
        <span style={{ fg: held.palette.signalNegative }}>!</span>
      </Show>
    </text>
  );
};
