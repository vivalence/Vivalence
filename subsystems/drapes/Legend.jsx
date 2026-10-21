import { For, mergeProps } from "solid-js";

export const titled = (edge) => `${edge.key} · ${edge.label}${edge.desc ? ` · ${edge.desc}` : ""}`;

export const Legend = (props) => {
  const held = mergeProps({ edges: [], selected: -1 }, props);
  const press = (key) => held.onPress && held.onPress(key);
  return (
    <div class="keys kcols">
      <For each={held.edges}>
        {(edge, index) => (
          <button class={held.selected === index() ? "sel" : ""} title={titled(edge)} onClick={() => press(edge.key)}>
            <b>{edge.key}</b>
            <span class="kl">{edge.label}</span>
            <i>{edge.desc}</i>
          </button>
        )}
      </For>
      <button onClick={() => press("leader")}>
        <b>ctrl-v</b>
        <span class="kl">palette</span>
        <i />
      </button>
    </div>
  );
};
