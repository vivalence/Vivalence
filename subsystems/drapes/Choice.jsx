import { For, mergeProps } from "solid-js";

export const Choice = (props) => {
  const held = mergeProps({ options: [], value: null, signal: (option) => option }, props);
  return (
    <span class="cc">
      <For each={held.options}>
        {(option) => (
          <button class={option === held.value ? "cur" : ""} data-signal={held.signal(option)} title={held.signal(option)} onClick={(event) => held.onPick && held.onPick(option, event)}>
            {option}
          </button>
        )}
      </For>
    </span>
  );
};
