import { For, from, Show } from "solid-js";
import { useTerminalDimensions } from "@opentui/solid";
import * as ambient from "../../ambient/index.js";

export const TABS = [
  [(held) => held.thread === null, (held) => `${held.index} no thread`],
  [() => true, (held) => `${held.index} ${held.thread.word}`],
];

export const tabbed = (held) => TABS.find(([test]) => test(held))[1](held);

export const PLUS = " +";

export const ARROWS = "< ".length + " >".length;

export const widened = (held) => [...tabbed(held)].length + 4;

export const summed = (widths) => widths.reduce((width, each) => width + each, 0);

export const circled = (each, at) => each[(at + each.length) % each.length];

export const windowed = (widths, seated, room) => {
  const first = Math.min(seated, widths.findIndex((_, start) => summed(widths.slice(start, seated + 1)) <= room));
  const spilled = widths.slice(first).findIndex((_, count) => summed(widths.slice(first, first + count + 1)) > room);
  return { first, last: spilled === -1 ? widths.length : first + Math.max(1, spilled) };
};

function Arrow(props) {
  return (
    <text cursor="pointer" style={{ flexShrink: 0 }} fg={props.palette.textStrong} onMouseUp={() => props.onSeat(props.target)}>
      {props.glyph}
    </text>
  );
}

export function Headline(props) {
  const terminal = ambient.terminal.consume();
  const terminals = from(terminal.client.runtime.entities.terminal.$entities);
  const dimensions = useTerminalDimensions();
  const faulted = (error) => terminal.controller.stdout.fault(error);
  const seat = (held) => terminal.repl.dispatch(`/terminal ${held.index}`).catch(faulted);
  const seated = () => terminals().findIndex((held) => held.id === terminal.id);
  const widths = () => terminals().map(widened);
  const overflowing = () => summed(widths()) + PLUS.length > dimensions().width - 1;
  const shown = () => {
    if (!overflowing()) return terminals();
    const { first, last } = windowed(widths(), seated(), dimensions().width - 1 - ARROWS - PLUS.length);
    return terminals().slice(first, last);
  };
  return (
    <box style={{ flexDirection: "row", height: 1, flexShrink: 0, paddingLeft: 1, backgroundColor: props.palette.surfaceSunk }}>
      <Show when={overflowing()}>
        <Arrow palette={props.palette} glyph="< " target={circled(terminals(), seated() - 1)} onSeat={seat} />
      </Show>
      <For each={shown()}>
        {(held) => (
          <text
            cursor="pointer"
            wrapMode="none"
            style={{ flexShrink: 1, minWidth: 0 }}
            fg={held.id === terminal.id ? props.palette.textStrong : props.palette.textMuted}
            bg={held.id === terminal.id ? props.palette.surface : props.palette.surfaceSunk}
            onMouseUp={() => seat(held)}
          >
            {held.id === terminal.id ? <b>{`  ${tabbed(held)}  `}</b> : `  ${tabbed(held)}  `}
          </text>
        )}
      </For>
      <Show when={overflowing()}>
        <box style={{ flexGrow: 1 }} />
        <Arrow palette={props.palette} glyph=" >" target={circled(terminals(), seated() + 1)} onSeat={seat} />
      </Show>
      <text cursor="pointer" style={{ flexShrink: 0 }} fg={props.palette.textMuted} onMouseUp={() => terminal.repl.dispatch("/terminal/new").catch(faulted)}>
        {PLUS}
      </text>
    </box>
  );
}
