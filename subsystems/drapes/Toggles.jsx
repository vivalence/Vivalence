import { For, mergeProps, Show } from "solid-js";
import { Icon } from "./Icon.jsx";

export const Toggles = (props) => {
  const held = mergeProps({ label: "", options: [], on: [], icons: null, signal: (option) => option }, props);
  return (
    <span class="tg" classList={{ icons: held.icons !== null }} role="group" aria-label={held.label}>
      <For each={held.options}>
        {(option) => (
          <button
            type="button"
            classList={{ on: held.on.includes(option) }}
            aria-pressed={held.on.includes(option) ? "true" : "false"}
            data-signal={held.signal(option)}
            title={held.signal(option)}
            onClick={(event) => held.onPick && held.onPick(option, event)}>
            <Show
              when={held.icons !== null}
              fallback={
                <>
                  <i class="tk" />
                  {option}
                </>
              }>
              <Icon name={held.icons[option]} size={12} />
            </Show>
          </button>
        )}
      </For>
    </span>
  );
};
