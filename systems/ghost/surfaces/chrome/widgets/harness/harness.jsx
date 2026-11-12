import { For, from } from "solid-js";
import * as belt from "../../../../gestalten/belt/index.js";
import * as ambient from "../../ambient/index.js";

const INKS = {
  eager: (palette) => palette.signalPositive,
  lazy: (palette) => palette.signalCaution,
  none: (palette) => palette.textMuted,
};

export const loaded = (entries) => entries.filter((entry) => entry.state !== "none");

function Heading(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, justifyContent: "space-between", paddingLeft: 1, paddingRight: 1, backgroundColor: props.palette.surface }}>
      <text fg={props.palette.textStrong}>
        <b>{props.label}</b>
      </text>
      <text fg={props.palette.textStrong}>
        <b>{props.count}</b>
      </text>
    </box>
  );
}

function Entry(props) {
  const terminal = ambient.terminal.consume();
  const unloadable = () => belt.harness.acts(props.entry).includes("unload");
  const unload = () => terminal.repl.dispatch(`/${props.verb}/unload ${props.entry.reference}`).catch((error) => terminal.controller.stdout.fault(error));
  return (
    <box style={{ flexDirection: "row", height: 1, paddingRight: 1 }}>
      <text fg={INKS[props.entry.state](props.palette)}>{` ${belt.harness.MARKS[props.entry.state]} `}</text>
      <text fg={props.palette.textInk} style={{ flexGrow: 1 }}>
        {props.entry.name}
      </text>
      <text
        cursor={unloadable() ? "pointer" : undefined}
        fg={props.palette.textMuted}
        onMouseUp={unloadable() ? unload : undefined}
      >
        {unloadable() ? " × " : ` ${props.entry.state} `}
      </text>
    </box>
  );
}

export function Harness(props) {
  const terminal = ambient.terminal.consume();
  const thread = from(terminal.$thread);
  const map = () => belt.harness.served(thread());
  return (
    <box style={{ flexDirection: "column", backgroundColor: props.palette.surfaceLift }}>
      <Heading palette={props.palette} label="tools" count={belt.harness.counted(map().TOOLED)} />
      <For each={loaded(map().TOOLED)}>{(entry) => <Entry palette={props.palette} entry={entry} verb="tool" />}</For>
      <Heading palette={props.palette} label="primer" count={belt.harness.counted(map().PRIMED)} />
      <For each={loaded(map().PRIMED)}>{(entry) => <Entry palette={props.palette} entry={entry} verb="primer" />}</For>
    </box>
  );
}
