import { mergeProps, Show } from "solid-js";

export const COLUMNS = { key: 5, label: 17 };

export const Row = (props) => {
  const held = mergeProps({ value: "", selected: false, off: false, onPick: () => {} }, props);
  const ink = (name) => (held.off ? held.palette.textMuted : held.palette[name]);
  return (
    <box
      style={{ flexDirection: "row", height: 1, paddingLeft: 2, backgroundColor: held.selected ? held.palette.controlSelected : "transparent" }}
      onMouseUp={() => held.onPick()}
    >
      <text fg={ink("signalPrimaryInk")}>
        <b>{held.key.padEnd(COLUMNS.key)}</b>
      </text>
      <text fg={ink("textStrong")}>{held.label.padEnd(COLUMNS.label)}</text>
      <Show when={held.children} fallback={<text fg={held.palette.textMuted}>{held.value}</text>}>
        {held.children}
      </Show>
    </box>
  );
};
