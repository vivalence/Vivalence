import { For } from "solid-js";
import { Icon } from "/Users/finn/vivalence/code/vivalence/subsystems/drapes/Icon.jsx";

export const BARS = 8;

export const Dictline = (props) => (
  <div class="dictline">
    <span class="neg">◉</span>
    <span class="lvl">
      <For each={Array.from({ length: BARS }, (_, index) => index)}>{(index) => <i class={props.level * BARS > index ? "on" : ""} />}</For>
    </span>
    <span>{props.text}</span>
    <span class="muted">{props.text === "" && props.tail === "" ? "listening…" : props.tail}</span>
    <button class="iconbtn" title="stop · esc · /dictate/stop" onClick={() => props.onStop()}>
      <Icon name="stop" size={14} />
    </button>
    <button class="iconbtn" title="trash · /dictate/trash" onClick={() => props.onTrash()}>
      <Icon name="x" size={14} />
    </button>
  </div>
);
