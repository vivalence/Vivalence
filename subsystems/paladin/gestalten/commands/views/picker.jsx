import { createMemo, createSignal, For, onCleanup, onMount } from "solid-js";
import { _render, createComponent, RendererContext } from "@opentui/solid";

const matches = (row, keys, term) => keys.some((key) => String(row[key] ?? "").toLowerCase().includes(term));

const Picker = (props) => {
  const [query, setQuery] = createSignal(props.query ?? "");
  const [at, setAt] = createSignal(props.index ?? 0);
  const found = createMemo(() => {
    const terms = query().toLowerCase().split(/\s+/).filter(Boolean);
    return props.rows.filter((row) => terms.every((term) => matches(row, props.keys, term)));
  });
  const clamp = (index) => Math.max(0, Math.min(found().length - 1, index));

  const keys = (key) => {
    if (key.name === "escape") return props.answer({ aborted: true });
    if (key.name === "return") return found().length ? props.answer({ row: found()[clamp(at())] }) : undefined;
    if (key.name === "up") return setAt(clamp(at() - 1));
    if (key.name === "down") return setAt(clamp(at() + 1));
    if (key.name === "backspace") return (setQuery(query().slice(0, -1)), setAt(0));
    if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) (setQuery(query() + key.sequence), setAt(0));
  };
  onMount(() => props.renderer.keyInput.prependListener("keypress", keys));
  onCleanup(() => props.renderer.keyInput.off("keypress", keys));

  return (
    <box style={{ flexDirection: "column" }}>
      <text>{`${props.label} › ${query()}`}</text>
      <For each={found()}>
        {(row, index) => <text>{`${index() === clamp(at()) ? "›" : " "} ${props.columns.map((column) => row[column]).join("  ")}`}</text>}
      </For>
      <text>{`${found().length} of ${props.rows.length} · ↑↓ enter · esc`}</text>
    </box>
  );
};

export default (element, props) => {
  const dispose = _render(
    () =>
      createComponent(RendererContext.Provider, {
        value: props.renderer,
        get children() {
          return createComponent(Picker, props);
        },
      }),
    element,
  );
  return {
    destroy: () => {
      dispose();
      for (const child of element.getChildren()) child.destroyRecursively();
    },
  };
};
