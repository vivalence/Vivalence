import { For, from, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { is } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";

export const CAP = 6;

export const MODED = [
  [(thread) => thread.mode === null, () => "—"],
  [(thread) => is.string(thread.mode), (thread) => thread.mode],
  [() => true, (thread) => `${thread.mode.type}/${thread.mode.slug}`],
];

export const moded = (thread) => MODED.find(([test]) => test(thread))[1](thread);

export const host = (mode) => mode.reference.absolute.split("/mode/")[0];

const named = (buffer) => buffer.trait.LABELED.name;

function Heading(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, justifyContent: "space-between", paddingLeft: 1, paddingRight: 1, backgroundColor: props.palette.surface }}>
      <text fg={props.palette.textStrong}>
        <b>{props.label}</b>
      </text>
      <text fg={props.palette.textStrong}>
        <b>{String(props.count)}</b>
      </text>
    </box>
  );
}

function Rule(props) {
  return <box style={{ height: 1, border: ["top"], borderColor: props.palette.divider }} />;
}

function Item(props) {
  const terminal = ambient.terminal.consume();
  return (
    <box
      cursor="pointer"
      style={{ flexDirection: "row", height: 1, gap: 1, paddingLeft: 1, paddingRight: 1, backgroundColor: props.current ? props.palette.controlSelected : "transparent" }}
      onMouseUp={() => terminal.repl.dispatch(props.signal).catch((error) => terminal.controller.stdout.fault(error))}
    >
      <text fg={props.current ? props.palette.signalPrimaryInk : props.palette.textMuted} style={{ flexShrink: 0 }}>{props.mark.padEnd(3)}</text>
      <text wrapMode="none" truncate fg={props.current ? props.palette.textStrong : props.palette.textInk} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        {props.current ? <b>{props.label}</b> : props.label}
      </text>
      <text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>{props.detail}</text>
    </box>
  );
}

function Keys(props) {
  const terminal = ambient.terminal.consume();
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: 1, gap: 1 }}>
      <For each={props.keys}>
        {(key) => (
          <text
            cursor={key.off ? undefined : "pointer"}
            fg={key.off ? props.palette.textMuted : props.palette.signalPrimaryInk}
            onMouseUp={key.off ? undefined : () => terminal.repl.dispatch(key.signal).catch((error) => terminal.controller.stdout.fault(error))}
          >
            {` ${key.label} `}
          </text>
        )}
      </For>
    </box>
  );
}

export const HOSTS = [
  [(mode) => mode === null, () => ""],
  [(mode) => is.string(mode), (mode) => mode.split("/mode/")[0]],
  [() => true, (mode) => host(mode)],
];

export const hosted = (mode) => HOSTS.find(([test]) => test(mode))[1](mode);

export const matched = (row, typed) => typed === "" || row.label.toLowerCase().includes(typed) || row.detail.toLowerCase().includes(typed);

export const kept = (rows, typed, hostsOff) => rows.filter((row) => !hostsOff.includes(row.host)).filter((row) => matched(row, typed));

export const counted = (kept, all, typed, hostsOff) => (typed === "" && hostsOff.length === 0 ? String(all.length) : `${kept.length} / ${all.length}`);

function Filter(props) {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const focus = from(app.bridge.$focus);
  const sections = from(app.bridge.$sections);
  const faulted = (error) => terminal.controller.stdout.fault(error);
  const searching = () => focus() === `filter/${props.kind}`;
  const query = () => (props.kind in sections().filter ? sections().filter[props.kind] : "");
  const typed = (query) => app.bridge.$sections.set({ ...app.bridge.sections, filter: { ...app.bridge.sections.filter, [props.kind]: query } });
  const picked = () => {
    const first = props.kept[0];
    typed("");
    app.bridge.$focus.set("composer");
    if (first !== undefined) terminal.repl.dispatch(first.signal).catch(faulted);
  };
  useKeyboard((event) => {
    if (searching() && event.name === "escape") terminal.repl.dispatch("/filter/close").catch(faulted);
  });
  return (
    <box cursor="text" style={{ flexDirection: "row", height: 1, backgroundColor: props.palette.controlField }} onMouseUp={() => terminal.repl.dispatch(`/filter ${props.kind}`).catch(faulted)}>
      <text fg={searching() ? props.palette.signalPrimaryInk : props.palette.textMuted} style={{ flexShrink: 0 }}>{" / "}</text>
      <Show
        when={searching()}
        fallback={
          <text wrapMode="none" fg={query() === "" ? props.palette.textMuted : props.palette.textStrong} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            {query() === "" ? `filter ${props.kind}s` : query()}
          </text>
        }
      >
        <input
          focused
          value={query()}
          cursorColor={props.palette.controlFieldCaret}
          textColor={props.palette.textStrong}
          focusedTextColor={props.palette.textStrong}
          backgroundColor={props.palette.controlField}
          focusedBackgroundColor={props.palette.controlField}
          style={{ flexGrow: 1 }}
          onInput={typed}
          onSubmit={picked}
        />
      </Show>
      <text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>{` ${props.count}`}</text>
      <text
        cursor="pointer"
        fg={props.picking ? props.palette.inverseOn : props.dim ? props.palette.signalPrimaryInk : props.palette.textMuted}
        bg={props.picking ? props.palette.inverse : props.palette.controlField}
        style={{ flexShrink: 0 }}
        onMouseUp={(event) => {
          event.stopPropagation();
          terminal.repl.dispatch(`/filter/pick ${props.kind}`).catch(faulted);
        }}
      >
        {" ◈ "}
      </text>
    </box>
  );
}

function Hosts(props) {
  const terminal = ambient.terminal.consume();
  return (
    <box style={{ flexDirection: "row", flexWrap: "wrap", paddingLeft: 1, gap: 1 }}>
      <For each={props.hosts}>
        {(held) => (
          <text
            cursor="pointer"
            fg={props.hostsOff.includes(held) ? props.palette.textMuted : props.palette.inverseOn}
            bg={props.hostsOff.includes(held) ? "transparent" : props.palette.inverse}
            onMouseUp={() => terminal.repl.dispatch(`/filter/daemon ${props.kind} ${held}`).catch((error) => terminal.controller.stdout.fault(error))}
          >
            {` ${held} `}
          </text>
        )}
      </For>
    </box>
  );
}

function Listed(props) {
  const terminal = ambient.terminal.consume();
  const sections = from(ambient.app.consume().bridge.$sections);
  const typed = () => (props.kind in sections().filter ? sections().filter[props.kind].toLowerCase() : "");
  const rows = () => props.each.map(props.row);
  const hostsOff = () => sections().hostsOff[props.kind];
  const shown = () => kept(rows(), typed(), hostsOff());
  const big = () => props.each.length > CAP;
  const open = () => props.kind in sections().expand || !big() || typed() !== "";
  const cut = () => (open() ? shown() : shown().slice(0, CAP));
  const hosts = () => [...new Set(rows().map((row) => row.host).filter((held) => held !== ""))];
  return (
    <>
      <Show when={big()}>
        <Filter
          palette={props.palette}
          kind={props.kind}
          kept={shown()}
          count={counted(shown(), rows(), typed(), hostsOff())}
          picking={sections().pick === props.kind}
          dim={hostsOff().length > 0}
        />
      </Show>
      <Show when={big() && sections().pick === props.kind}>
        <Hosts palette={props.palette} kind={props.kind} hosts={hosts()} hostsOff={hostsOff()} />
      </Show>
      <For each={cut()}>{(row) => <Item palette={props.palette} mark={row.mark} label={row.label} detail={row.detail} current={row.current} signal={row.signal} />}</For>
      <Show when={shown().length === 0}>
        <text fg={props.palette.textMuted}>{"      no match"}</text>
      </Show>
      <Show when={big() && typed() === "" && shown().length > CAP}>
        <text cursor="pointer" fg={props.palette.textMuted} onMouseUp={() => terminal.repl.dispatch(`/filter/expand ${props.kind}`).catch((error) => terminal.controller.stdout.fault(error))}>
          {open() ? "      fewer" : `      ${shown().length - cut().length} more`}
        </text>
      </Show>
    </>
  );
}

export function Entity(props) {
  const terminal = ambient.terminal.consume();
  const entities = terminal.client.runtime.entities;
  const terminals = from(entities.terminal.$entities);
  const threads = from(entities.thread.$entities);
  const modes = from(entities.mode.$entities);
  const thread = from(terminal.$thread);
  const framed = from(terminal.$buffer);
  return (
    <box style={{ flexDirection: "column", backgroundColor: props.palette.surfaceLift }}>
      <Heading palette={props.palette} label="terminals" count={terminals().length} />
      <For each={terminals()}>
        {(held) => (
          <Item
            palette={props.palette}
            mark="[◇]"
            label={`${held.index}  ${held.thread === null ? "no thread" : held.thread.word}`}
            detail={held.thread === null ? "" : moded(held.thread)}
            current={held.id === terminal.id}
            signal={`/terminal ${held.index}`}
          />
        )}
      </For>
      <Keys palette={props.palette} keys={[{ label: "new terminal", signal: "/terminal/new" }, { label: "close", signal: "/terminal/close", off: terminals().length < 2 }]} />
      <Rule palette={props.palette} />

      <Heading palette={props.palette} label="threads" count={threads().length} />
      <Listed
        palette={props.palette}
        kind="thread"
        each={threads()}
        row={(held) => ({ mark: "─◇─", label: held.word, detail: moded(held), host: hosted(held.mode), current: thread() !== null && held.id === thread().id, signal: `/thread ${held.id}` })}
      />
      <Keys palette={props.palette} keys={[{ label: "new thread", signal: "/thread/new" }]} />
      <Rule palette={props.palette} />

      <Heading palette={props.palette} label="modes" count={modes().length} />
      <Listed
        palette={props.palette}
        kind="mode"
        each={modes()}
        row={(mode) => {
          const current = thread() !== null && thread().mode !== null && !is.string(thread().mode) && thread().mode.reference.absolute === mode.reference.absolute;
          return { mark: current ? "‹›" : "◇", label: `${mode.type}/${mode.slug}`, detail: host(mode), host: host(mode), current, signal: `/mode ${mode.reference.absolute}` };
        }}
      />
      <Rule palette={props.palette} />

      <Show when={thread()} keyed>
        {(seated) => {
          const buffers = from(seated.$buffers);
          return (
            <Show when={buffers().length > 0}>
              <Heading palette={props.palette} label="buffers" count={buffers().length} />
              <For each={buffers()}>
                {(buffer) => {
                  const current = () => framed() !== null && framed().id === buffer.id;
                  return <Item palette={props.palette} mark={current() ? "▣" : "□"} label={named(buffer)} detail={seated.word} current={current()} signal={current() ? "/buffer/close" : `/buffer "${named(buffer)}"`} />;
                }}
              </For>
              <Rule palette={props.palette} />
            </Show>
          );
        }}
      </Show>
    </box>
  );
}
