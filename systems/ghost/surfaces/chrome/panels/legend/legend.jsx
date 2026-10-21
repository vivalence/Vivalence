import { For, from, Show } from "solid-js";
import { useTerminalDimensions } from "@opentui/solid";
import * as ambient from "../../ambient/index.js";

export const KCOL = 34;

export const NAMES = { "?": "help", q: "quit", ":": "repl", leader: "palette" };

export const chorded = (keys) => keys.map((key) => (key === "leader" ? "ctrl-v" : key)).join(" ");

export const VALENCES = [
  [(node) => node.effect !== undefined && node.effect.valence !== undefined, (node) => node.effect.valence],
  [(node) => node.meta !== undefined && node.meta.valence !== undefined, (node) => node.meta.valence],
  [() => true, () => ""],
];

export const valence = (node) => VALENCES.find(([test]) => test(node))[1](node);

export const LABELS = [
  [(key, valence) => valence.includes(" · "), (key, valence) => [valence.split(" · ")[0], valence.split(" · ").slice(1).join(" · ")]],
  [(key) => Object.hasOwn(NAMES, key), (key, valence) => [NAMES[key], valence]],
  [() => true, (key, valence) => [key, valence]],
];

export const labelled = (key, valence) => LABELS.find(([test]) => test(key, valence))[1](key, valence);

export const edges = (chord) =>
  Object.entries(chord.branches)
    .map(([key, node]) => ({ key, valence: valence(node) }));

export const REPL_LINE = /^\/\S/;

export const widest = (texts, cap) => Math.min(cap, texts.reduce((width, text) => Math.max(width, text.length), 0)) + 1;

export const entried = (edge) => (edge.valence.includes(" · ") ? labelled(edge.key, edge.valence) : [edge.valence, ""]);

export const columns = (width) => Math.max(1, Math.floor((width - 2) / KCOL));

export const rowed = (each, width) =>
  Array.from({ length: Math.ceil(each.length / width) }, (_, row) => each.slice(row * width, row * width + width));

function Head(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 2, paddingLeft: 1, paddingRight: 1 }}>
      <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>
        <b>{props.tag}</b>
      </text>
      <text wrapMode="none" truncate fg={props.palette.signalPrimaryInk} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        {props.crumb}
      </text>
      <text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>{props.hint}</text>
    </box>
  );
}

function Key(props) {
  const terminal = ambient.terminal.consume();
  const signal = () => REPL_LINE.test(props.edge.valence);
  const [label, description] = labelled(props.edge.key, props.edge.valence);
  return (
    <box
      cursor={signal() ? "pointer" : undefined}
      style={{ flexDirection: "row", width: props.width, height: 1 }}
      onMouseUp={signal() ? () => terminal.repl.dispatch(props.edge.valence).catch((error) => terminal.controller.stdout.fault(error)) : undefined}
    >
      <text fg={props.palette.signalPrimaryInk} style={{ flexShrink: 0 }}>
        <b>{chorded([props.edge.key]).padEnd(props.keyed)}</b>
      </text>
      <text fg={props.palette.textInk} style={{ flexShrink: 0 }}>{label.slice(0, props.labelled - 1).padEnd(props.labelled)}</text>
      <text wrapMode="none" truncate fg={props.palette.textMuted} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        {` ${description}`}
      </text>
    </box>
  );
}

function Entry(props) {
  const terminal = ambient.terminal.consume();
  const signal = () => REPL_LINE.test(props.edge.valence);
  const [label, value] = entried(props.edge);
  return (
    <box
      cursor={signal() ? "pointer" : undefined}
      style={{ flexDirection: "row", height: 1, paddingLeft: 1, paddingRight: 2 }}
      onMouseUp={signal() ? () => terminal.repl.dispatch(props.edge.valence).catch((error) => terminal.controller.stdout.fault(error)) : undefined}
    >
      <text fg={props.palette.signalPrimaryInk} style={{ flexShrink: 0 }}>
        <b>{chorded([props.edge.key]).padEnd(props.keyed)}</b>
      </text>
      <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>{label.slice(0, props.labelled - 1).padEnd(props.labelled)}</text>
      <text wrapMode="none" truncate fg={props.palette.textMuted} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        {value}
      </text>
    </box>
  );
}

export function Legend(props) {
  const terminal = ambient.terminal.consume();
  const chord = from(terminal.legend.$chord);
  const presses = from(terminal.legend.presses.$backlog);
  const dimensions = useTerminalDimensions();
  const keys = () => presses().map((signal) => signal.nature);
  const keyed = () => widest(edges(chord()).map((edge) => chorded([edge.key])), 8);
  return (
    <box style={{ flexDirection: "column", flexShrink: 0, backgroundColor: props.palette.surfaceLift }}>
      <Show
        when={keys().length > 1}
        fallback={
          <For each={rowed(edges(chord()), columns(dimensions().width))}>
            {(row) => (
              <box style={{ flexDirection: "row", height: 1, paddingLeft: 1 }}>
                <For each={row}>{(edge) => <Key palette={props.palette} edge={edge} keyed={keyed()} labelled={widest(edges(chord()).map((edge) => labelled(edge.key, edge.valence)[0]), 12)} width={Math.floor((dimensions().width - 2) / columns(dimensions().width))} />}</For>
              </box>
            )}
          </For>
        }
      >
        <Head palette={props.palette} tag={keys().at(-1)} crumb={chorded(keys())} hint="esc drops" />
        <For each={edges(chord()).slice(0, 10)}>{(edge) => <Entry palette={props.palette} edge={edge} keyed={keyed()} labelled={widest(edges(chord()).map((edge) => entried(edge)[0]), 24)} />}</For>
      </Show>
      <box style={{ height: 1 }} />
    </box>
  );
}
