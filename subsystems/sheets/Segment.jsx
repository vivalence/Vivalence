import { mergeProps, Show } from "solid-js";

export const LOOKS = [
  [(held) => held.off, (palette) => ({ fg: palette.textMuted, bg: palette.surface })],
  [(held) => held.open, (palette) => ({ fg: palette.textStrong, bg: palette.controlSelected })],
  [(held) => held.attention === "caution", (palette) => ({ fg: palette.signalCautionInk, bg: palette.signalCautionTint })],
  [(held) => held.attention === "negative", (palette) => ({ fg: palette.signalNegativeInk, bg: palette.signalNegativeTint })],
  [() => true, (palette) => ({ fg: palette.textStrong, bg: palette.surface })],
];

export const look = (held, palette) => LOOKS.find(([test]) => test(held))[1](palette);

export const Segment = (props) => {
  const held = mergeProps({ id: undefined, label: "", off: false, open: false, attention: null, onPress: () => {}, onPick: () => {} }, props);
  let segment;
  return (
    <box ref={segment} id={held.id} cursor="pointer" style={{ flexDirection: "row", height: 1, alignSelf: "flex-start", backgroundColor: look(held, held.palette).bg }} onMouseDown={() => held.onPress()} onMouseUp={() => held.onPick(segment.x)}>
      <Show when={held.label !== ""}>
        <text fg={look(held, held.palette).fg}>{held.label}</text>
      </Show>
      {held.children}
    </box>
  );
};
