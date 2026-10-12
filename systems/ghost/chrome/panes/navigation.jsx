import { createMemo, createSignal, For, from, Match, on, Switch } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { belt } from "@vivalence/typology";
import { Pip, Strip, usePalette } from "@vivalence/sheets";
import { HOST, pip } from "./pips.js";

const groups = (host) =>
  [...host.modes.reduce((held, mode) => {
    const traits = mode.traits.join(" · ");
    return held.set(traits, [...(held.has(traits) ? held.get(traits) : []), mode]);
  }, new Map())];

export const spine = (runtime, threads) =>
  [runtime.daemon, ...runtime.daemons].flatMap((host) => [
    { kind: "host", host },
    ...groups(host).flatMap(([traits, held]) => [
      { kind: "group", traits },
      ...held.flatMap((mode) => [
        { kind: "mode", mode },
        ...threads.filter((thread) => thread.mode === mode).map((thread) => ({ kind: "thread", thread })),
      ]),
    ]),
  ]);

const LINES = {
  terminal: (row) => `/terminal/${row.terminal.id}`,
  mode: (row) => `/thread/new ${row.mode.reference.absolute}`,
  thread: (row) => `/thread/${row.thread.id}`,
};

const label = (thread) => (thread.label === "" ? `#${thread.id}` : thread.label.name);

const Status = (props) => {
  const status = from(props.host.$status);
  return <Pip state={pip(HOST, status().code)} />;
};

export function Navigation(props) {
  const palette = usePalette();
  const client = props.client;
  const active = from(client.terminals.$active);
  const thread = from(belt.atom.chain(client.terminals.$active, "$thread"));
  const terminals = from(client.terminals.$entities);
  const threads = from(client.runtime.entities.thread.$entities);
  const daemons = from(client.runtime.entities.daemon.$entities);
  const modes = from(client.runtime.entities.mode.$entities);
  const [cursor, setCursor] = createSignal(0);

  const rows = createMemo(on([daemons, threads, modes], () => spine(client.runtime, threads())));
  const picks = createMemo(() => [
    ...terminals().map((terminal) => ({ kind: "terminal", terminal })),
    ...rows().filter((row) => Object.hasOwn(LINES, row.kind)),
  ]);
  const at = () => Math.min(cursor(), picks().length - 1);
  const focused = (row) => picks()[at()] === row;
  const seated = (candidate) => thread() === candidate;
  const ink = (row) => (focused(row) ? palette.signalPrimary : palette.textInk);

  useKeyboard((key) => {
    if (picks().length === 0) return;
    if (key.name === "down") return setCursor((index) => (index + 1) % picks().length);
    if (key.name === "up") return setCursor((index) => (index - 1 + picks().length) % picks().length);
    if (["return", "linefeed", "enter"].includes(key.name)) {
      key.stopPropagation();
      const row = picks()[at()];
      client.dispatch(LINES[row.kind](row));
    }
  });

  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <Strip
        items={picks()
          .filter((row) => row.kind === "terminal")
          .map((row) => ({ label: `#${row.terminal.id}`, seated: active() === row.terminal, focused: focused(row) }))}
      />
      <For each={rows()}>
        {(row) => (
          <Switch>
            <Match when={row.kind === "host"}>
              <box style={{ flexDirection: "row", gap: 1, height: 1 }}>
                <Status host={row.host} />
                <text fg={palette.textStrong} wrapMode="none" truncate><b>{row.host.slug}</b></text>
              </box>
            </Match>
            <Match when={row.kind === "group"}>
              <text fg={palette.textMuted} wrapMode="none" truncate>{`  ${row.traits === "" ? "—" : row.traits}`}</text>
            </Match>
            <Match when={row.kind === "mode"}>
              <text fg={ink(row)} bg={focused(row) ? palette.surfaceLift : palette.surface} wrapMode="none" truncate>
                {`  › ${row.mode.slug}`}
              </text>
            </Match>
            <Match when={row.kind === "thread"}>
              <text
                fg={seated(row.thread) ? palette.textStrong : ink(row)}
                bg={focused(row) ? palette.surfaceLift : palette.surface}
                wrapMode="none"
                truncate
              >
                {`    ${seated(row.thread) ? "◆" : "·"} ${label(row.thread)}`}
              </text>
            </Match>
          </Switch>
        )}
      </For>
    </box>
  );
}
