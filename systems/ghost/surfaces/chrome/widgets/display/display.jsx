import { For, from } from "solid-js";
import * as ambient from "../../ambient/index.js";
import { LENSES, MARKDOWNS, SIDES, VIEWS } from "../../../../gestalten/belt/dock.js";

export const LABEL = 6;

export const STEP = 0.05;

export const FLOOR = 0.1;

export const CEILING = 0.9;

export const SAID = { docked: "split" };

export const said = (option) => (Object.hasOwn(SAID, option) ? SAID[option] : option);

export const stepped = (share, delta) => Math.min(CEILING, Math.max(FLOOR, Math.round((share + delta) * 100) / 100));

function Heading(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: 1, paddingRight: 1, backgroundColor: props.palette.surfaceSunk }}>
      <text fg={props.palette.textStrong}>
        <b>{props.label}</b>
      </text>
    </box>
  );
}

function Rule(props) {
  return <box style={{ height: 1, border: ["top"], borderColor: props.palette.divider }} />;
}

function Chip(props) {
  const terminal = ambient.terminal.consume();
  return (
    <text
      cursor="pointer"
      style={{ flexShrink: 0 }}
      fg={props.current ? props.palette.inverseOn : props.ink}
      bg={props.current ? props.palette.inverse : props.bg}
      onMouseUp={() => terminal.repl.dispatch(props.signal).catch((error) => terminal.controller.stdout.fault(error))}
    >
      {props.label}
    </text>
  );
}

function Choice(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 1, paddingRight: 1 }}>
      <text fg={props.palette.textInk} style={{ flexShrink: 0, flexGrow: 1 }}>{` ${props.label.padEnd(LABEL)}`}</text>
      <For each={props.options}>
        {(option) => <Chip palette={props.palette} label={said(option)} current={option === props.value} ink={props.palette.textMuted} signal={`${props.signal} ${option}`} />}
      </For>
    </box>
  );
}

function Split(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 1, paddingRight: 1 }}>
      <text fg={props.palette.textInk} style={{ flexShrink: 0, flexGrow: 1 }}>{` ${"split".padEnd(LABEL)}`}</text>
      <Chip palette={props.palette} label=" − " current={false} ink={props.palette.textStrong} bg={props.palette.surfaceSunk} signal={`/split ${stepped(props.share, -STEP)}`} />
      <text fg={props.palette.textStrong}>{`${Math.round(props.share * 100)} %`}</text>
      <Chip palette={props.palette} label=" + " current={false} ink={props.palette.textStrong} bg={props.palette.surfaceSunk} signal={`/split ${stepped(props.share, STEP)}`} />
    </box>
  );
}

export function Display(props) {
  const terminal = ambient.terminal.consume();
  const terminals = from(terminal.client.runtime.entities.terminal.$entities);
  const dock = () => {
    terminals();
    return terminal.dock;
  };
  return (
    <box style={{ flexDirection: "column", backgroundColor: props.palette.surfaceLift }}>
      <Heading palette={props.palette} label="display" />
      <Choice palette={props.palette} label="dock" options={VIEWS} value={dock().view} signal="/dock" />
      <Choice palette={props.palette} label="side" options={SIDES} value={dock().align} signal="/dock" />
      <Split palette={props.palette} share={dock().share} />
      <Choice palette={props.palette} label="lens" options={LENSES} value={dock().lens} signal="/dock/lens" />
      <Choice palette={props.palette} label="markdown" options={MARKDOWNS} value={dock().markdown} signal="/set terminal.dock.markdown" />
      <Rule palette={props.palette} />
    </box>
  );
}
