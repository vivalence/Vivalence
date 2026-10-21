import { createEffect, For, from, Show } from "solid-js";
import { useTerminalDimensions } from "@opentui/solid";
import * as ambient from "../../ambient/index.js";
import { completions, filled } from "../../../../gestalten/belt/completions.js";

export const chorded = (chord) => chord.replaceAll("leader", "ctrl-v").replaceAll("/", " ");

export const argued = (row) => (row.options.length > 0 ? row.options.reduce((width, option) => width + option.length + 3, -1) : row.args ? 3 : 0);

export const widest = (widths) => widths.reduce((width, each) => Math.max(width, each), 0);

export const ENTERS = [
  [({ shown }) => shown.length === 0, ({ line }) => line.trimEnd()],
  [({ line, catalog }) => catalog.some((row) => row.nature === line.trim()), ({ line, catalog }) => filled(catalog.find((row) => row.nature === line.trim()))],
  [({ line }) => line.includes(" "), ({ line }) => line],
  [() => true, ({ shown, selected }) => filled(shown[selected].row)],
];

export const entered = (held) => ENTERS.find(([test]) => test(held))[1](held);

function Composer(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 2, paddingLeft: 1, paddingRight: 1 }}>
      <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>
        <b>repl</b>
      </text>
      <text fg={props.palette.signalPrimaryInk} style={{ flexShrink: 0 }}>{"<<"}</text>
      <input
        focused={props.focused}
        value={props.draft}
        textColor={props.palette.signalPrimaryInk}
        focusedTextColor={props.palette.signalPrimaryInk}
        backgroundColor={props.palette.surfaceLift}
        focusedBackgroundColor={props.palette.surfaceLift}
        style={{ flexGrow: 1 }}
        onInput={props.onDraft}
        onSubmit={props.onSubmit}
      />
    </box>
  );
}

function Option(props) {
  const terminal = ambient.terminal.consume();
  return (
    <text
      cursor="pointer"
      style={{ flexShrink: 0 }}
      fg={props.palette.textMuted}
      bg={props.palette.surfaceSunk}
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={() => terminal.repl.dispatch(`${props.nature} ${props.option}`).catch((error) => terminal.controller.stdout.fault(error))}
    >
      {` ${props.option} `}
    </text>
  );
}

function Completion(props) {
  return (
    <box
      cursor="pointer"
      style={{ flexDirection: "row", height: 1, paddingRight: 1, backgroundColor: props.selected ? props.palette.controlSelected : "transparent" }}
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={() => props.onFill(filled(props.completion.row))}
    >
      <text fg={props.palette.signalPrimaryInk} style={{ flexShrink: 0 }}>
        <b>{props.selected ? "> " : "  "}</b>
      </text>
      <box style={{ flexDirection: "row", width: props.natured + 1, flexShrink: 0 }}>
        <For each={props.completion.parts}>
          {(part) => (
            <text fg={part.hit ? props.palette.signalPrimaryInk : props.palette.textStrong} style={{ flexShrink: 0 }}>
              {part.hit || props.selected ? <b>{part.text}</b> : part.text}
            </text>
          )}
        </For>
      </box>
      <box style={{ flexDirection: "row", gap: 1, width: props.argued === 0 ? 0 : props.argued + 1, flexShrink: 0 }}>
        <Show when={props.completion.row.options.length > 0} fallback={<text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>{props.completion.row.args ? "‹…›" : ""}</text>}>
          <For each={props.completion.row.options}>{(option) => <Option palette={props.palette} nature={props.completion.row.nature} option={option} />}</For>
        </Show>
      </box>
      <text wrapMode="none" truncate fg={props.selected ? props.palette.textInk : props.palette.textMuted} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        {props.completion.row.valence}
      </text>
      <text fg={props.palette.textLight} style={{ flexShrink: 0 }}>{` ${chorded(props.completion.row.chord).padEnd(props.chorded)}`}</text>
    </box>
  );
}

export function Repl(props) {
  const terminal = ambient.terminal.consume();
  const catalog = from(terminal.repl.$catalog);
  const app = ambient.app.consume();
  const draft = from(app.bridge.$draft);
  const chosen = from(app.bridge.$selected);
  const focus = from(app.bridge.$focus);
  const dimensions = useTerminalDimensions();
  const shown = () => completions(catalog(), draft());
  const drafted = (typed) => {
    app.bridge.$draft.set(typed);
    app.bridge.$selected.set(0);
  };
  const faulted = (error) => terminal.controller.stdout.fault(error);
  const submitted = (line) => {
    drafted("");
    return terminal.repl.dispatch(line).then(() => terminal.repl.dispatch("/repl/close")).catch(faulted);
  };
  const fill = (line) => (line.endsWith(" ") ? drafted(line) : submitted(line));
  const height = () => Math.min(12, Math.floor(dimensions().height / 3));
  const selected = () => Math.max(0, Math.min(chosen(), shown().length - 1));
  let rows;
  createEffect(() => {
    const index = selected();
    if (rows === undefined) return;
    if (index < rows.scrollTop) rows.scrollTop = index;
    if (index >= rows.scrollTop + rows.viewport.height) rows.scrollTop = index - rows.viewport.height + 1;
  });
  return (
    <box style={{ flexDirection: "column", height: height(), flexShrink: 0, backgroundColor: props.palette.surfaceLift }}>
      <Composer palette={props.palette} draft={draft()} focused={focus() === "composer"} onDraft={drafted} onSubmit={(line) => fill(entered({ line, shown: shown(), catalog: catalog(), selected: selected() }))} />
      <Show when={shown().length > 0} fallback={<text fg={props.palette.textMuted}>{" ✕ nothing matches · enter sends it anyway"}</text>}>
        <scrollbox ref={rows} style={{ flexGrow: 1 }}>
          <For each={shown()}>{(completion, index) => <Completion
                selected={index() === selected()}
                palette={props.palette}
                completion={completion}
                onFill={fill}
                natured={widest(shown().map((each) => each.row.nature.length))}
                argued={widest(shown().map((each) => argued(each.row)))}
                chorded={widest(shown().map((each) => chorded(each.row.chord).length))}
              />}</For>
        </scrollbox>
      </Show>
    </box>
  );
}
