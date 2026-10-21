import { from, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
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

export const HINTS = { palette: "tab completes · enter runs · esc drops", chooser: "type to filter · enter picks · esc back" };

const NAMED = /^(\/\S+) (.*)$/;

export const choosing = (catalog, typed) => {
  const named = NAMED.exec(typed);
  if (named === null) return null;
  const command = catalog.find((entry) => entry.nature === named[1]);
  if (command === undefined || command.options.length === 0) return null;
  return {
    nature: command.nature,
    filter: named[2],
    items: parts.chosen(
      command.options.map((option) => ({ label: String(option), signal: `${command.nature} ${option}`, sub: "", cur: false })),
      named[2],
    ),
  };
};

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
  [({ chosen }) => chosen !== null && chosen.items.length > 0, (app, terminal, { chosen }) => pick(app, terminal, chosen.items[0].signal)],
  [({ chosen }) => chosen !== null, (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ listed }) => listed.length === 0, (app, terminal, { typed }) => pick(app, terminal, typed)],
  [({ listed }) => listed[0].fill.endsWith(" "), (app, terminal, { listed }) => fill(app, terminal, listed[0].fill)],
  [() => true, (app, terminal, { listed }) => pick(app, terminal, listed[0].nature)],
];

export const enter = (app, terminal, catalog, typed) => {
  const held = { typed, chosen: choosing(catalog, typed), listed: rows(catalog, typed) };
  return ENTER.find(([test]) => test(held))[1](app, terminal, held);
};

const Listed = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const typed = from(app.bridge.$draft);
  const chooser = () => choosing(props.catalog, typed());
  return (
    <>
      <div class="ph">
        <span class="tag">{chooser() === null ? "repl" : chooser().nature.slice(1)}</span>
        <span class="crumb">{`${PROMPT}${typed()}`}</span>
        <span class="hint">{chooser() === null ? HINTS.palette : HINTS.chooser}</span>
      </div>
      <Show
        when={chooser() !== null}
        fallback={<parts.Catalog rows={rows(props.catalog, typed())} onFill={(row) => (row.fill.endsWith(" ") ? fill(app, terminal, row.fill) : pick(app, terminal, row.nature))} />}>
        <parts.Chooser filter={chooser().filter} items={chooser().items} onPick={(item) => pick(app, terminal, item.signal)} />
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
