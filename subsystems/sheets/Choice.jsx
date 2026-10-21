import { For, mergeProps } from "solid-js";

export const Choice = (props) => {
  const held = mergeProps({ onPick: () => {} }, props);
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 1, alignSelf: "flex-start" }}>
      <For each={held.options}>
        {(option) => (
          <text
            fg={option === held.value ? held.palette.inverseOn : held.palette.textMuted}
            bg={option === held.value ? held.palette.inverse : held.palette.surfaceLift}
            onMouseUp={() => held.onPick(option)}
          >
            {` ${option} `}
          </text>
        )}
      </For>
    </box>
  );
};
