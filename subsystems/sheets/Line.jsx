import { For, mergeProps } from "solid-js";

export const Line = (props) => {
  const held = mergeProps({ ink: "textInk" }, props);
  return (
    <box style={{ flexDirection: "column" }}>
      <For each={held.text.split("\n")}>{(line) => <text fg={held.palette[held.ink]}>{line}</text>}</For>
    </box>
  );
};
