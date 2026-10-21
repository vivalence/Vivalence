import { createResource, For, from, Show } from "solid-js";
import { Dynamic } from "@opentui/solid";
import { SyntaxStyle } from "@opentui/core";
import { is } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";
import * as widgets from "../../widgets/index.js";
import { cells, prose, streamed } from "../../../../gestalten/belt/journal.js";
import { Mounted } from "../frame/frame.jsx";

export const LENS = {
  chat: { turns: true, records: [] },
  repl: { turns: true, records: ["log", "fault"] },
  trace: { turns: false, records: ["log", "fault"] },
};

export const clock = (at) => new Date(at).toTimeString().slice(0, 8);

export const landed = (turn) => (streamed(turn) ? Infinity : Date.parse(turn.createdAt));

export const journaled = (lens, turns, records) =>
  [
    ...(LENS[lens].turns ? turns : []).map((turn) => ({ at: landed(turn), turn })),
    ...records.filter((record) => LENS[lens].records.includes(record.track)).map((record) => ({ at: record.at, record })),
  ].sort((first, second) => first.at - second.at);

export const SETTLED = [
  [(result, waiting) => result === undefined && waiting, "wait"],
  [(result) => result === undefined, "run"],
  [(result) => result.condition === "ERROR", "err"],
  [() => true, "ok"],
];

export const tools = (parts, waiting) =>
  parts
    .filter((part) => part.type === "tool_use")
    .map((call) => {
      const result = parts.find((part) => part.type === "tool_result" && part.id === call.id);
      return { name: call.name, arg: JSON.stringify(call.input), status: SETTLED.find(([test]) => test(result, waiting))[1] };
    });

export const GLYPHS = { run: "◐", ok: "✓", wait: "?", skip: "–", err: "✕" };

export const thoughts = (turn) => turn.parts.filter((part) => part.type === "thinking");

export const meta = (turn, buffers) =>
  [
    turn.role === "assistant" && streamed(turn) ? "…" : "",
    tools(turn.parts, false).length === 0 ? "" : `${tools(turn.parts, false).length} ${tools(turn.parts, false).length === 1 ? "call" : "calls"}`,
    buffers.length === 0 ? "" : `${buffers.length} artifact`,
  ]
    .filter((bit) => bit !== "")
    .join(" · ");

const named = (buffer) => buffer.trait.LABELED.name;

function Tool(props) {
  const inks = { run: props.palette.signalPrimaryInk, ok: props.palette.signalPositiveInk, wait: props.palette.signalCautionInk, skip: props.palette.textMuted, err: props.palette.signalNegativeInk };
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: props.indent }}>
      <text fg={props.palette.boundary} bg={props.palette.surfaceSunk} style={{ flexShrink: 0 }}>▏</text>
      <text fg={inks[props.tool.status]} bg={props.palette.surfaceSunk} style={{ flexShrink: 0 }}>{`${GLYPHS[props.tool.status]} `}</text>
      <text fg={props.palette.textStrong} bg={props.palette.surfaceSunk} style={{ flexShrink: 0 }}>{props.tool.name}</text>
      <text wrapMode="none" truncate fg={props.palette.textMuted} bg={props.palette.surfaceSunk} style={{ flexShrink: 1, minWidth: 0 }}>{` ${props.tool.arg}`}</text>
      <text fg={props.palette.textMuted} bg={props.palette.surfaceSunk} style={{ flexShrink: 0 }}>{` ${props.tool.status === "wait" ? "waiting" : props.tool.status === "run" ? "…" : ""}`}</text>
    </box>
  );
}

function Thought(props) {
  const live = () => streamed(props.turn);
  return (
    <Show when={thoughts(props.turn).length > 0}>
      <text fg={live() ? props.palette.signalPrimaryInk : props.palette.signalPositiveInk} style={{ flexShrink: 0 }}>{live() ? " ◐" : " ✓"}</text>
      <text fg={props.palette.textInk} style={{ flexShrink: 0 }}> thinking</text>
      <text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>{` · ${thoughts(props.turn).length} steps ▸`}</text>
    </Show>
  );
}

function Artifact(props) {
  const terminal = ambient.terminal.consume();
  const framed = from(terminal.$buffer);
  const trait = from(props.buffer.$trait);
  const [views] = createResource(() => props.buffer, (buffer) => widgets.buffer.cells(buffer, terminal.client.runtime.attach));
  const listed = () => (views.state === "ready" ? views() : []);
  const view = () => {
    trait();
    return widgets.buffer.cell(props.buffer, listed());
  };
  const current = () => framed() === props.buffer;
  const faulted = (error) => terminal.controller.stdout.fault(error);
  return (
    <box style={{ flexDirection: "column", paddingLeft: 2 }}>
      <box cursor="pointer" style={{ flexDirection: "row", height: 1, backgroundColor: props.palette.surfaceSunk }} onMouseUp={() => terminal.repl.dispatch(`/buffer/full ${named(props.buffer)}`).catch(faulted)}>
        <text fg={current() ? props.palette.signalPrimaryInk : props.palette.textLight} style={{ flexShrink: 0 }}>◆ </text>
        <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>
          <b>artifact </b>
        </text>
        <text wrapMode="none" truncate fg={props.palette.textMuted} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{named(props.buffer)}</text>
        <Show when={listed().length > 1}>
          <text
            cursor="pointer"
            fg={props.palette.textInk}
            style={{ flexShrink: 0 }}
            onMouseUp={(event) => {
              event.stopPropagation();
              terminal.repl.dispatch(`/cell/set ${widgets.buffer.following(view(), listed())} ${named(props.buffer)}`).catch(faulted);
            }}
          >
            {` ${view().slug} ▾ `}
          </text>
        </Show>
        <text style={{ flexShrink: 0 }} fg={current() ? props.palette.inverseOn : props.palette.signalPrimaryInk} bg={current() ? props.palette.inverse : props.palette.surfaceSunk}>
          {" ⤢ "}
        </text>
      </box>
      <Show when={view()} keyed>
        {(held) => <Mounted palette={props.palette} buffer={props.buffer} view={held} focused={() => false} />}
      </Show>
    </box>
  );
}

export const syntax = (palette) =>
  SyntaxStyle.fromStyles({
    "markup.heading": { fg: palette.textStrong, bold: true },
    "markup.strong": { bold: true },
    "markup.italic": { italic: true },
    "markup.raw": { fg: palette.textLink },
    "markup.link": { fg: palette.signalPrimaryInk },
  });

function Plain(props) {
  return <text fg={props.palette[props.body]}>{props.turn.role === "user" ? <b>{props.text}</b> : props.text}</text>;
}

function Pretty(props) {
  return <markdown content={prose(props.turn.parts)} syntaxStyle={syntax(props.palette)} conceal streaming={streamed(props.turn)} fg={props.palette[props.body]} />;
}

export const PROSE = [
  [(turn, markdown) => turn.role === "assistant" && markdown === "pretty", Pretty],
  [() => true, Plain],
];

const REGISTERS = {
  user: { register: "<<", ink: "textStrong", body: "textStrong", headed: true },
  assistant: { register: ">>", ink: "textMuted", body: "textInk", headed: true },
  system: { register: "·", ink: "textMuted", body: "textMuted", headed: false },
  tool: { register: "·", ink: "textMuted", body: "textMuted", headed: false },
};

function Turn(props) {
  const runtime = ambient.terminal.consume().client.runtime;
  const user = from(runtime.lighthouse.$user);
  const register = () => REGISTERS[props.row.turn.role];
  const buffers = () => cells(props.row.turn, props.buffers);
  const text = () => prose(props.row.turn.parts) + (streamed(props.row.turn) ? "▍" : "");
  return (
    <box style={{ flexDirection: "column", paddingBottom: 1 }}>
      <Show
        when={register().headed}
        fallback={
          <box style={{ flexDirection: "row" }}>
            <text fg={props.palette[register().ink]} style={{ flexShrink: 0 }}>{`${register().register.padStart(2)} `}</text>
            <text fg={props.palette[register().body]} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{text()}</text>
          </box>
        }
      >
        <box style={{ flexDirection: "row", height: 1 }}>
          <text fg={props.palette[register().ink]} style={{ flexShrink: 0 }}>
            <b>{register().register}</b>
          </text>
          <Show when={props.row.turn.role === "user"}>
            <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>
              <b>{` ${widgets.system.named(user())}`}</b>
            </text>
          </Show>
          <Show when={props.row.turn.role === "assistant"}>
            <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>{` ${widgets.entity.moded(props.row.turn)}`}</text>
          </Show>
          <text wrapMode="none" fg={props.palette.textMuted} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{meta(props.row.turn, buffers()) === "" ? "" : ` · ${meta(props.row.turn, buffers())}`}</text>
          <Thought palette={props.palette} turn={props.row.turn} />
        </box>
        <Show when={prose(props.row.turn.parts) !== "" || props.row.turn.role === "user"}>
          <box style={{ paddingLeft: 1 }}>
            <Dynamic component={PROSE.find(([test]) => test(props.row.turn, props.markdown))[1]} palette={props.palette} turn={props.row.turn} body={register().body} text={text()} />
          </box>
        </Show>
      </Show>
      <For each={tools(props.row.turn.parts, props.waiting)}>{(tool) => <Tool palette={props.palette} tool={tool} indent={1} />}</For>
      <For each={buffers()}>{(buffer) => <Artifact palette={props.palette} buffer={buffer} />}</For>
    </box>
  );
}

export const TRACES = [
  [(record) => is.string(record.data), (record) => `${record.path.at(-1)} ${record.data}`],
  [() => true, (record) => `${record.path.at(-1)} ${JSON.stringify(record.data)}`],
];

export const traced = (record) => TRACES.find(([test]) => test(record))[1](record);

function Trace(props) {
  return (
    <box style={{ flexDirection: "row", paddingBottom: 1 }}>
      <text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>{" · "}</text>
      <text fg={props.palette.textMuted} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        {`${clock(props.row.record.at)}  ${traced(props.row.record)}${props.lens === "trace" ? `  ${props.row.record.path.join(" › ")}` : ""}`}
      </text>
    </box>
  );
}

function Fault(props) {
  return (
    <box style={{ flexDirection: "row", paddingBottom: 1 }}>
      <text fg={props.palette.signalNegativeInk} style={{ flexShrink: 0 }}>{" ! "}</text>
      <text fg={props.palette.signalNegativeInk} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{props.row.record.data.message}</text>
    </box>
  );
}

export const ROWS = [
  [(row) => "turn" in row, Turn],
  [(row) => row.record.track === "fault", Fault],
  [() => true, Trace],
];

export function Journal(props) {
  const terminal = ambient.terminal.consume();
  const turns = from(props.thread.$turns);
  const buffers = from(props.thread.$buffers);
  const activities = from(props.thread.$activities);
  const records = from(terminal.controller.stdout.$history);
  const waiting = () => activities().some((activity) => activity.status === "PAUSED");
  return (
    <scrollbox stickyScroll stickyStart="bottom" verticalScrollbarOptions={{ visible: false }} style={{ flexGrow: 1, paddingLeft: 1, paddingRight: 1 }} onMouseDown={(event) => event.preventDefault()}>
      <For each={journaled(props.lens, turns(), records())}>
        {(row) => <Dynamic component={ROWS.find(([test]) => test(row))[1]} palette={props.palette} row={row} lens={props.lens} markdown={props.markdown} buffers={buffers()} waiting={waiting()} />}
      </For>
    </scrollbox>
  );
}
