import { For } from "solid-js";
import { Icon } from "./Icon.jsx";

export const BARS = 8;

export const Dictline = (props) => (
  <div class="dictline">
    <span class="neg">◉</span>
    <span class="lvl">
      <For each={Array.from({ length: BARS }, (_, index) => index)}>{(index) => <i class={props.level * BARS > index ? "on" : ""} />}</For>
    </span>
    <span class="muted">{props.tail === "" ? "listening…" : props.tail}</span>
    <button class="iconbtn" title="stop · /dictate" onClick={() => props.onStop()}>
      <Icon name="stop" size={14} />
    </button>
  </div>
);
