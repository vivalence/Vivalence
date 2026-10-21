import { For, from, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../../ambient/index.js";

export const chordText = (crumbs) => crumbs.map((crumb) => (crumb === "leader" ? "ctrl-v" : crumb)).join(" ");

const HIDDEN = ["leader", ":"];

const VALENCES = [
  [(node) => node.effect !== undefined && node.effect.valence !== undefined, (node) => node.effect.valence],
  [(node) => node.meta !== undefined && node.meta.valence !== undefined, (node) => node.meta.valence],
  [() => true, () => ""],
];

export const valenceOf = (node) => VALENCES.find(([test]) => test(node))[1](node);

const LABELS = [
  [(key, valence) => valence.includes(" · "), (key, valence) => [valence.split(" · ")[0], valence.split(" · ").slice(1).join(" · ")]],
  [() => true, (key, valence) => [valence, ""]],
];

export const keys = (node) =>
  Object.entries(node.branches).map(([key, child]) => {
    const [label, desc] = LABELS.find(([test]) => test(key, valenceOf(child)))[1](key, valenceOf(child));
    return { key, label, desc };
  });

export const walked = (node) => Object.entries(node.branches).map(([key, child]) => ({ key, label: valenceOf(child), desc: "" }));

const press = (terminal) => (key) => terminal.legend.dispatch(key);

const crumbs = (terminal) => terminal.legend.presses.backlog.map((signal) => signal.nature);

const Leader = (props) => {
  const terminal = ambient.terminal.consume();
  return (
    <parts.Panel tag="ctrl-v" crumb="once = keys · twice = the palette" hint="esc drops">
      <parts.Legend edges={keys(props.node).filter((edge) => !HIDDEN.includes(edge.key))} onPress={press(terminal)} />
    </parts.Panel>
  );
};

const Walked = (props) => {
  const terminal = ambient.terminal.consume();
  const label = () => LABELS.find(([test]) => test(crumbs(terminal).at(-1), valenceOf(props.node)))[1](crumbs(terminal).at(-1), valenceOf(props.node));
  return (
    <parts.Panel tag={label()[0] === "" ? crumbs(terminal).at(-1) : label()[0]} crumb={chordText(crumbs(terminal))} hint={label()[1]}>
      <div class="pb">
        <For each={walked(props.node)}>{(edge) => <parts.Row key={edge.key} name={edge.label} value={edge.desc} onPick={() => press(terminal)(edge.key)} />}</For>
      </div>
    </parts.Panel>
  );
};

export function Legend() {
  const terminal = ambient.terminal.consume();
  const chord = from(terminal.legend.$chord);
  return (
    <Show when={chord()} keyed>
      {(node) => (
        <Show when={crumbs(terminal).length === 1} fallback={<Walked node={node} />}>
          <Leader node={node} />
        </Show>
      )}
    </Show>
  );
}
