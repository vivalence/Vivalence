import { For, mergeProps } from "solid-js";

export const Toggles = (props) => {
  const held = mergeProps({ label: "", options: [], on: [], signal: (option) => option }, props);
  return (
    <span class="tg" role="group" aria-label={held.label}>
      <For each={held.options}>
        {(option) => (
          <button
            type="button"
            classList={{ on: held.on.includes(option) }}
            aria-pressed={held.on.includes(option) ? "true" : "false"}
            data-signal={held.signal(option)}
            title={held.signal(option)}
            onClick={(event) => held.onPick && held.onPick(option, event)}>
            <i class="tk" />
            {option}
          </button>
        )}
      </For>
    </span>
  );
};
