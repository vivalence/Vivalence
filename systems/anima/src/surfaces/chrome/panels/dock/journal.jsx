import { For, from, Show } from "solid-js";
import { computed } from "nanostores";
import * as parts from "@vivalence/drapes/parts";
import { is, trace } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";
import { lookup, named } from "../sidebar/sections.js";
import { Cell } from "../frame/view.jsx";

export const LENS = {
  chat: { turns: true, records: [] },
  repl: { turns: true, records: ["log", "fault"] },
  trace: { turns: false, records: ["log", "fault"] },
};

export const ROLES = { user: "you", assistant: "agent", system: "msg", tool: "msg" };

export const clock = (ms) => new Date(ms).toTimeString().slice(0, 5);

const SPOKEN = ["text"];
const UNSPOKEN = ["tool_use", "tool_result", "thinking"];

export const prose = (parts) =>
  parts.filter((part) => !UNSPOKEN.includes(part.type)).map((part) => (SPOKEN.includes(part.type) ? part.text : `[${part.type}]`)).join("\n");

const SETTLED = [
  [(result, waiting) => result === undefined && waiting, "wait"],
  [(result) => result === undefined, "run"],
  [(result) => result.condition === "ERROR", "err"],
  [() => true, "ok"],
];

const resultOf = (parts, call) => parts.find((part) => part.type === "tool_result" && part.id === call.id);

const settled = (result, waiting) => SETTLED.find(([test]) => test(result, waiting))[1];

const yielded = (result) => (result === undefined ? {} : { yield: result.output });

export const tools = (parts, waiting) =>
  parts
    .filter((part) => part.type === "tool_use")
    .map((call) => ({ name: call.name, arg: JSON.stringify(call.input), status: settled(resultOf(parts, call), waiting), dur: "", ...yielded(resultOf(parts, call)) }));

export const thought = (parts, live) => {
  const thoughts = parts.filter((part) => part.type === "thinking");
  if (thoughts.length === 0) return null;
  return thoughts.map((part, index) => ({
    depth: 1,
    status: live && index === thoughts.length - 1 ? "run" : "ok",
    label: part.text.split("\n")[0],
    text: part.text,
    dur: 0,
    tools: [],
  }));
};

export const cells = (turn, buffers) =>
  buffers.filter((buffer) => "turns" in buffer && buffer.turns.some((reference) => (is.string(reference) ? reference : reference.id) === turn.id));

const plural = (count, one) => (count === 0 ? "" : `${count} ${one}${count === 1 ? "" : "s"}`);

export const meta = (row) =>
  [row.ts, row.kind === "agent" && row.streaming ? "…" : "", plural(row.tools.length, "call"), row.cells === 0 ? "" : `${row.cells} artifact`].filter((bit) => bit !== "").join(" · ");

export const streamed = (turn) => turn.createdAt === undefined;

const landed = (turn) => (streamed(turn) ? Infinity : Date.parse(turn.createdAt));

const spoken = (turn, who, waiting, buffers) => {
  const row = {
    kind: lookup(ROLES, turn.role, "turn role"),
    who: turn.role === "user" ? who : "",
    ts: streamed(turn) ? "" : clock(landed(turn)),
    text: prose(turn.parts),
    tools: tools(turn.parts, waiting),
    think: thought(turn.parts, streamed(turn)),
    streaming: streamed(turn),
    cells: cells(turn, buffers).length,
    blocks: [],
  };
  return { ...row, meta: meta(row) };
};

const RECORDS = [
  [(record) => record.track === "fault", (record) => ({ kind: "fault", text: record.data.message, blocks: [] })],
  [
    (record) => is.string(record.data),
    (record) => ({ kind: "trace", ts: clock(record.at), path: trace.pathname(record.path), text: `${record.path.at(-1)} ${record.data}`, blocks: [] }),
  ],
  [
    () => true,
    (record) => ({ kind: "trace", ts: clock(record.at), path: trace.pathname(record.path), text: record.path.at(-1), blocks: [{ type: "json", value: record.data }] }),
  ],
];

const journaled = (record) => RECORDS.find(([test]) => test(record))[1](record);

export const entries = (turns, records, who, waiting, buffers) =>
  [
    ...turns.map((turn) => ({ at: landed(turn), turn, row: spoken(turn, who, waiting, buffers) })),
    ...records.map((record) => ({ at: record.at, record, row: journaled(record) })),
  ].sort((first, second) => first.at - second.at);

const Entry = (props) => (
  <parts.Turn
    {...props.entry.row}
    lens={props.lens}
    markdown={props.markdown}
    buffer={props.cells.length === 0 ? null : named(props.cells[0])}
    selected={props.selected}
    onPick={props.onPick}
    onLine={props.onLine}>
    <For each={props.entry.row.blocks}>{(block) => <parts.Block block={block} onLine={props.onLine} />}</For>
    <For each={props.cells}>{(buffer) => <Cell buffer={buffer} onLine={props.onLine} />}</For>
  </parts.Turn>
);

export const Journal = () => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const thread = from(terminal.$thread);
  const activities = from(app.client.runtime.entities.activity.$entities);
  const records = from(computed(terminal.controller.stdout.$history, (held) => held.filter((record) => record.track === "log" || record.track === "fault")));
  const user = from(app.client.runtime.lighthouse.$user);
  const focus = from(app.bridge.$focus);
  const selection = from(app.bridge.$selection);

  const lens = () => {
    terminals();
    return terminal.dock.lens;
  };
  const markdown = () => {
    terminals();
    return terminal.dock.markdown;
  };
  const shown = () => lookup(LENS, lens(), "lens");
  const waiting = () => parts.listing(activities).some((activity) => thread() !== null && activity.thread === thread() && activity.status === "PAUSED");
  const sent = (signal) => terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  const pick = (index) => () => {
    app.bridge.$selection.set(index);
    app.bridge.$focus.set("journal");
  };
  const listed = (turns, buffers) =>
    entries(shown().turns ? turns : [], parts.listing(records).filter((record) => shown().records.includes(record.track)), user().slug, waiting(), buffers);

  const Rows = (rows) => (
    <For each={rows.entries}>
      {(entry, index) => (
        <Entry
          entry={entry}
          lens={lens()}
          markdown={markdown()}
          cells={entry.turn === undefined ? [] : cells(entry.turn, rows.buffers)}
          selected={focus() === "journal" && selection() === index()}
          onPick={pick(index())}
          onLine={sent}
        />
      )}
    </For>
  );

  const Seated = (seated) => {
    const turns = from(seated.thread.$turns);
    const buffers = from(seated.thread.$buffers);
    return <Rows entries={listed(parts.listing(turns), parts.listing(buffers))} buffers={parts.listing(buffers)} />;
  };

  return (
    <Show when={thread()} keyed fallback={<Rows entries={listed([], [])} buffers={[]} />}>
      {(seated) => <Seated thread={seated} />}
    </Show>
  );
};
