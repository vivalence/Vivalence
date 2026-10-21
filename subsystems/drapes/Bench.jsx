import { For } from "solid-js";

export const Bench = (props) => (
  <div class="block bench" data-zone="3">
    <div class="bh">
      <span>{props.head}</span>
      <span>{props.meta}</span>
    </div>
    <For each={props.items}>
      {(item) => (
        <button class="item" classList={{ off: item.off }} onClick={() => props.onLine(item.signal)}>
          <span class="mark">{item.off ? "○" : "●"}</span>
          <span class="nm">{item.name}</span>
          <span class="meta">{item.meta}</span>
        </button>
      )}
    </For>
    <div class="bf">{props.foot}</div>
  </div>
);
