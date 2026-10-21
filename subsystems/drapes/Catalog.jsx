import { For, mergeProps, Show } from "solid-js";

export const lit = (typed, text) => {
  const at = typed === "" ? -1 : text.indexOf(typed);
  if (at === -1) return [{ t: text, h: false }];
  return [
    { t: text.slice(0, at), h: false },
    { t: typed, h: true },
    { t: text.slice(at + typed.length), h: false },
  ].filter((part) => part.t !== "");
};

export const Catalog = (props) => {
  const held = mergeProps({ rows: [], selected: 0 }, props);
  return (
    <div class="pb">
      <Show
        when={held.rows.length > 0}
        fallback={
          <div class="krow">
            <span class="key">✕</span>
            <span class="nm">nothing matches</span>
            <span class="val">enter sends it anyway — the repl answers not found</span>
          </div>
        }>
        <For each={held.rows}>
          {(row, index) => (
            <button class={index() === held.selected ? "prow sel" : "prow"} onClick={() => held.onFill && held.onFill(row)}>
              <span class="nat">
                <For each={row.parts}>{(part) => (part.h ? <span class="hl">{part.t}</span> : part.t)}</For>
                <Show when={row.cur}>
                  {" "}
                  <span class="pri">•</span>
                </Show>
              </span>
              <span class="args">{row.args}</span>
              <span class="val">{row.val}</span>
              <span class="chord">{row.chord}</span>
            </button>
          )}
        </For>
      </Show>
    </div>
  );
};

export const chosen = (options, filter) => options.filter((option) => option.label.includes(filter)).map((option) => ({ ...option, parts: lit(filter, option.label) }));

export const Chooser = (props) => {
  const held = mergeProps({ items: [], selected: 0, filter: "" }, props);
  return (
    <div class="pb chooser">
      <div class="cf">
        <span class="q">{held.filter}</span>
        <span class="caret" />
        <span class="n">{held.items.length}</span>
      </div>
      <For each={held.items}>
        {(item, index) => (
          <button class={index() === held.selected ? "crow sel" : "crow"} onClick={() => held.onPick(item)}>
            <span class={item.cur ? "cur" : ""}>
              <For each={item.parts}>{(part) => (part.h ? <span class="hl">{part.t}</span> : part.t)}</For>
            </span>
            <Show when={item.cur}>
              <span class="pri">•</span>
            </Show>
            <span class="sub">{item.sub}</span>
          </button>
        )}
      </For>
    </div>
  );
};
