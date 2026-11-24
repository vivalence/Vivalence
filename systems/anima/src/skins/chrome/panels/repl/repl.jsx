import { from, Show } from "solid-js";
import * as parts from "@vivalence/drapes/solid";
import { belt } from "@vivalence/ghost";
import * as ambient from "../../ambient/index.js";
import { chordText } from "../legend/legend.jsx";
import { previewing } from "../sidebar/sections.js";

export const LIMIT = 60;
export const PROMPT = "<< ";

export const rows = (catalog, typed) =>
  belt.catalog
    .completions(catalog, typed)
    .slice(0, LIMIT)
    .map(({ row: command, parts: marked }) => ({
      nature: command.nature,
      parts: marked.map((part) => ({ t: part.text, h: part.hit })),
      args: command.args ? "…" : "",
      val: "",
      chord: command.chord === "" ? "" : chordText(command.chord.split("/")),
      cur: false,
      fill: command.args || command.options.length > 0 ? `${command.nature} ` : command.nature,
    }));

export const pathed = (catalog, typed, thread) => {
  const held = belt.catalog.pathing(catalog, typed, (nature) => belt.harness.indexed(thread, nature));
  if (held === null) return null;
  const references = [...held.ticked, ...(held.filter === "" ? [] : [held.filter])];
  const changes = previewing(thread, held.nature, references, held.filter, held.options);
  return {
    nature: held.nature,
    tag: `${held.nature.slice(1)} · enter ${changes.count}`,
    filter: held.filter,
    changes,
    items: held.options.map((option) => ({ label: option, signal: `${held.head} ${option}`, sub: "", cur: false, parts: parts.lit(held.filter, option) })),
  };
};

export const choosing = (catalog, typed, thread) => {
  const path = pathed(catalog, typed, thread);
  if (path !== null) return path;
  const chooser = belt.catalog.choosing(catalog, typed);
  if (chooser === null) return null;
  return {
    nature: chooser.nature,
    tag: chooser.nature.slice(1),
    filter: chooser.filter,
    items: chooser.options.map((option) => ({ label: option, signal: `${chooser.nature} ${option}`, sub: "", cur: false, parts: parts.lit(chooser.filter, option) })),
  };
};

export const clamped = (selected, length) => Math.max(0, Math.min(selected, length - 1));

const pick = (app, terminal, signal) => {
  terminal.repl.submit(signal).catch((error) => terminal.controller.stdout.fault(error));
};

const fill = (app, terminal, signal) => {
  app.bridge.$draft.set(signal);
};

const ENTER = [
  [({ chosen }) => chosen !== null && chosen.items.some((item) => item.label === chosen.filter), (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ chosen }) => chosen !== null && chosen.items.length > 0, (app, terminal, { chosen, selected }) => pick(app, terminal, chosen.items[clamped(selected, chosen.items.length)].signal)],
  [({ chosen }) => chosen !== null, (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ listed }) => listed.length === 0, (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ typed }) => typed.trim().includes(" "), (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ listed, selected }) => listed[clamped(selected, listed.length)].fill.endsWith(" "), (app, terminal, { listed, selected }) => fill(app, terminal, listed[clamped(selected, listed.length)].fill)],
  [() => true, (app, terminal, { listed, selected }) => pick(app, terminal, listed[clamped(selected, listed.length)].nature)],
];

export const enter = (app, terminal, catalog, typed) => {
  const held = { typed, chosen: choosing(catalog, typed, terminal.thread), listed: rows(catalog, typed), selected: app.bridge.selected };
  return ENTER.find(([test]) => test(held))[1](app, terminal, held);
};

const Listed = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const typed = from(app.bridge.$draft);
  const selected = from(app.bridge.$selected);
  const focus = from(app.bridge.$focus);
  const drafted = (text) => {
    app.bridge.$draft.set(text);
    app.bridge.$selected.set(0);
  };
  const chooser = () => choosing(props.catalog, typed(), terminal.thread);
  const listed = () => rows(props.catalog, typed());
  return (
    <>
      <div class="ph">
        <span class="tag">{chooser() === null ? "repl" : chooser().tag}</span>
      </div>
      <parts.Field
        id="repl"
        data-focus="repl.input"
        kind="repl"
        focus={focus() === "repl.input"}
        value={typed()}
        lead={<span class="pc">{PROMPT}</span>}
        onInput={drafted}
        onSubmit={(text) => enter(app, terminal, props.catalog, text)}
      />
      <Show
        when={chooser() !== null}
        fallback={<parts.Catalog rows={listed()} selected={clamped(selected(), listed().length)} onFill={(row) => (row.fill.endsWith(" ") ? fill(app, terminal, row.fill) : pick(app, terminal, row.nature))} />}>
        <parts.Chooser filter={chooser().filter} items={chooser().items} changes={chooser().changes} selected={clamped(selected(), chooser().items.length)} onPick={(item) => pick(app, terminal, item.signal)} />
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
