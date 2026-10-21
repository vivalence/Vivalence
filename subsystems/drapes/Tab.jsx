import { mergeProps, Show } from "solid-js";

export const DOTS = {
  none: "",
  primary: "pri live",
  caution: "cau breathe",
  negative: "neg",
};

export const Tab = (props) => {
  const held = mergeProps({ current: false, mirrored: false, dot: "none", title: "" }, props);
  return (
    <button class={held.current ? "tab cur" : "tab"} data-signal={held.signal} title={held.title} onClick={(event) => held.onPick && held.onPick(held.index, event)}>
      <span class="n">{held.index}</span>
      <span>{held.label}</span>
      <Show when={held.mirrored}>
        <span class="mirror">∥</span>
      </Show>
      <Show when={DOTS[held.dot] !== ""}>
        <span class={`dot ${DOTS[held.dot]}`} />
      </Show>
    </button>
  );
};
