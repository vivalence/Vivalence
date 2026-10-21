import { from, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import { belt } from "@vivalence/ghost";
import * as ambient from "../../ambient/index.js";
import { chordText } from "../legend/legend.jsx";

export const LIMIT = 60;
export const PROMPT = "<< ";

const bare = (typed) => (typed.startsWith("/") ? typed.slice(1) : typed);

export const narrow = (catalog, typed) => catalog.filter((command) => command.nature.slice(1).includes(bare(typed)));

export const rows = (catalog, typed) =>
  narrow(catalog, typed)
    .slice(0, LIMIT)
    .map((command) => ({
      nature: command.nature,
      parts: [{ t: "/", h: false }, ...parts.lit(bare(typed), command.nature.slice(1))],
      args: command.args ? "…" : "",
      val: "",
      chord: command.chord === "" ? "" : chordText(command.chord.split("/")),
      cur: false,
      fill: command.args || command.options.length > 0 ? `${command.nature} ` : command.nature,
    }));

export const choosing = (catalog, typed) => {
  const chooser = belt.completions.choosing(catalog, typed);
  if (chooser === null) return null;
  return {
    nature: chooser.nature,
    filter: chooser.filter,
    items: chooser.options.map((option) => ({ label: option, signal: `${chooser.nature} ${option}`, sub: "", cur: false, parts: parts.lit(chooser.filter, option) })),
  };
};

export const clamped = (selected, length) => Math.max(0, Math.min(selected, length - 1));

const pick = (app, terminal, signal) => {
  terminal.repl.$catalog.set(null);
  app.bridge.$draft.set("");
  terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
};

const fill = (app, terminal, signal) => {
  app.bridge.$draft.set(signal);
  app.bridge.$focus.set("composer");
};

const ENTER = [
  [({ chosen }) => chosen !== null && chosen.items.some((item) => item.label === chosen.filter), (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ chosen }) => chosen !== null && chosen.items.length > 0, (app, terminal, { chosen, selected }) => pick(app, terminal, chosen.items[clamped(selected, chosen.items.length)].signal)],
  [({ chosen }) => chosen !== null, (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ listed }) => listed.length === 0, (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ listed, selected }) => listed[clamped(selected, listed.length)].fill.endsWith(" "), (app, terminal, { listed, selected }) => fill(app, terminal, listed[clamped(selected, listed.length)].fill)],
  [() => true, (app, terminal, { listed, selected }) => pick(app, terminal, listed[clamped(selected, listed.length)].nature)],
];

export const enter = (app, terminal, catalog, typed) => {
  const held = { typed, chosen: choosing(catalog, typed), listed: rows(catalog, typed), selected: app.bridge.selected };
  return ENTER.find(([test]) => test(held))[1](app, terminal, held);
};

const Listed = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const typed = from(app.bridge.$draft);
  const selected = from(app.bridge.$selected);
  const chooser = () => choosing(props.catalog, typed());
  const listed = () => rows(props.catalog, typed());
  return (
    <>
      <div class="ph">
        <span class="tag">{chooser() === null ? "repl" : chooser().nature.slice(1)}</span>
        <span class="crumb">{`${PROMPT}${typed()}`}</span>
      </div>
      <Show
        when={chooser() !== null}
        fallback={<parts.Catalog rows={listed()} selected={clamped(selected(), listed().length)} onFill={(row) => (row.fill.endsWith(" ") ? fill(app, terminal, row.fill) : pick(app, terminal, row.nature))} />}>
        <parts.Chooser filter={chooser().filter} items={chooser().items} selected={clamped(selected(), chooser().items.length)} onPick={(item) => pick(app, terminal, item.signal)} />
      </Show>
    </>
  );
};

export function Repl() {
  const terminal = ambient.terminal.consume();
  const catalog = from(terminal.repl.$catalog);
  return (
    <Show when={catalog()} keyed>
      {(held) => <Listed catalog={held} />}
    </Show>
  );
}
