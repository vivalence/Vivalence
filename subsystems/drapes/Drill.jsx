import { createSignal, For, Show } from "solid-js";
import { Caret } from "./Caret.jsx";

const TONES = [
  [(value) => value === null, "m"],
  [(value) => typeof value === "string", "s"],
  [(value) => typeof value === "number", "n"],
  [(value) => typeof value === "boolean", "b"],
  [() => true, ""],
];

const tone = (value) => TONES.find(([test]) => test(value))[1];

const branched = (value) => value !== null && typeof value === "object";

const branches = (value) => (Array.isArray(value) ? value.map((child, index) => [String(index), child]) : Object.entries(value));

const counted = (value) => (Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`);

const leaf = (value) => (typeof value === "string" ? value : String(value));

const Branch = (props) => {
  const [open, setOpen] = createSignal(props.depth < props.unfolded);
  return (
    <div class="dn" classList={{ open: open() }}>
      <button type="button" class="dh" aria-expanded={open() ? "true" : "false"} onClick={() => setOpen(!open())}>
        <Caret open={open()} />
        <span class="k">{props.name}</span>
        <span class="m">{counted(props.value)}</span>
      </button>
      <Show when={open()}>
        <div class="db">
          <Nodes value={props.value} depth={props.depth + 1} unfolded={props.unfolded} />
        </div>
      </Show>
    </div>
  );
};

const Leaf = (props) => (
  <div class="dl">
    <span class="k">{props.name}</span>
    <span class={`v ${tone(props.value)}`}>{leaf(props.value)}</span>
  </div>
);

const Nodes = (props) => (
  <For each={branches(props.value)}>
    {([name, child]) => (
      <Show when={branched(child)} fallback={<Leaf name={name} value={child} />}>
        <Branch name={name} value={child} depth={props.depth} unfolded={props.unfolded} />
      </Show>
    )}
  </For>
);

export const Drill = (props) => (
  <div class="drill">
    <Show when={branched(props.value)} fallback={<span class={`v ${tone(props.value)}`}>{leaf(props.value)}</span>}>
      <Nodes value={props.value} depth={0} unfolded={props.unfolded} />
    </Show>
  </div>
);
