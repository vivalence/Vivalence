import { createMemo, For, from, Show } from "solid-js";
import { computed } from "nanostores";
import * as parts from "@vivalence/drapes/parts";
import { belt, is, trace } from "@vivalence/typology";
import { belt as ghost } from "@vivalence/ghost";
import * as ambient from "../../ambient/index.js";
import { elapsed, lookup, named } from "../sidebar/sections.js";
import { Cell } from "../frame/view.jsx";

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

export const results = (turns) =>
  turns.flatMap((turn) => turn.parts.filter((part) => part.type === "tool_result").map((part) => ({ ...part, at: landed(turn) })));

export const carrier = (turn) => turn.parts.length > 0 && turn.parts.every((part) => part.type === "tool_result");

const resultOf = (yields, call) => yields.find((part) => part.id === call.id);

const settled = (result, waiting) => SETTLED.find(([test]) => test(result, waiting))[1];

const yielded = (result) => (result === undefined ? {} : { yield: result.product });

const RUNDOWN = [
  [(key) => key === "message", () => ""],
  [(key, held) => Array.isArray(held), (key, held) => `${key} ×${held.length}`],
  [
    (key, held) => key === "entities" && is.object(held),
    (key, held) =>
      Object.entries(held)
        .map(([type, entities]) => `${type} ×${entities.length}`)
        .join(" · "),
  ],
  [(key, held) => is.object(held), (key, held) => `${key} { ${Object.keys(held).join(" · ")} }`],
  [() => true, (key, held) => `${key} ${held}`],
];

export const rundown = (product) => {
  const said = Object.entries(product)
    .map(([key, held]) => RUNDOWN.find(([test]) => test(key, held))[1](key, held))
    .filter((bit) => bit !== "");
  if (said.length > 0) return said.join(" · ");
  return "message" in product ? String(product.message) : "";
};

export const took = (from, until) => {
  const seconds = (until - from) / 1000;
  if (!Number.isFinite(seconds)) return "";
  return seconds < 100 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
};

const ARGUED = [
  [(result) => result === undefined, (call) => JSON.stringify(call.input)],
  [() => true, (call, result) => rundown(result.product)],
];

const DURATIONS = [
  [(result) => result === undefined, () => ""],
  [() => true, (turn, result) => took(landed(turn), result.at)],
];

const called = (call, turn, waiting, yields) => ({
  name: belt.hallucinate.signalOf(call.name).pathname,
  arg: ARGUED.find(([test]) => test(resultOf(yields, call)))[1](call, resultOf(yields, call)),
  input: call.input,
  status: settled(resultOf(yields, call), waiting),
  dur: DURATIONS.find(([test]) => test(resultOf(yields, call)))[1](turn, resultOf(yields, call)),
  ...yielded(resultOf(yields, call)),
});

export const tools = (turn, waiting, yields) => turn.parts.filter((part) => part.type === "tool_use").map((call) => called(call, turn, waiting, yields));

const KINDS = [
  [(part) => part.type === "thinking", "think"],
  [(part) => part.type === "tool_use", "tools"],
  [() => true, "text"],
];

const kind = (part) => KINDS.find(([test]) => test(part))[1];

const SEGMENT = {
  think: (part, turn) => ({
    depth: 1,
    status: streamed(turn) && part === turn.parts.at(-1) ? "run" : "ok",
    label: part.text.split("\n")[0],
    text: part.text,
    dur: 0,
    tools: [],
  }),
  tools: (part, turn, waiting, yields) => called(part, turn, waiting, yields),
  text: (part) => (SPOKEN.includes(part.type) ? part.text : `[${part.type}]`),
};

const silent = (part) => part.type === "tool_result" || (part.type === "text" && part.text === "");

const merged = (segments, segment) => {
  const prior = segments.at(-1);
  if (prior === undefined || prior.type !== segment.type) return [...segments, segment];
  return [...segments.slice(0, -1), { type: prior.type, items: [...prior.items, ...segment.items] }];
};

export const segmented = (turn, waiting, yields) =>
  turn.parts
    .filter((part) => !silent(part))
    .map((part) => ({ type: kind(part), items: [SEGMENT[kind(part)](part, turn, waiting, yields)] }))
    .reduce(merged, []);

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

const plural = (count, one) => (count === 0 ? "" : `${count} ${one}${count === 1 ? "" : "s"}`);

export const meta = (row) =>
  [row.ts, row.kind === "agent" && row.streaming ? "…" : "", row.cells === 0 ? "" : `${row.cells} artifact`].filter((bit) => bit !== "").join(" · ");

export const streamed = (turn) => turn.createdAt === undefined;

export const PACE = 2.5;

const WORD = /(?<=\s)(?=\S)/;

export const drafted = (turn) =>
  turn.parts.filter((part) => "draft" in part).map((part) => part.draft.text).join(" ");

const spaced = (text, tail) => (text === "" || tail === "" ? tail : ` ${tail}`);

export const interrupted = (turn) => is.object(turn.meta) && turn.meta.state === "interrupted";

export const faulted = (turn) => is.object(turn.meta) && is.object(turn.meta.fault);

const failure = (turn) => ({
  at: landed(turn),
  turn,
  turns: [],
  row: {
    kind: "fault",
    text: `reply failed · ${turn.meta.fault.kind}`,
    detail: is.string(turn.meta.fault.message) ? turn.meta.fault.message : "",
    segments: null,
    blocks: [],
  },
});

const HEARD = [
  [(turn) => !interrupted(turn), () => ""],
  [(turn, heard) => !Object.hasOwn(heard, turn.id), () => "interrupted"],
  [() => true, (turn, heard) => `interrupted · heard ${elapsed(heard[turn.id])}`],
];

export const told = (turn, heard) => HEARD.find(([test]) => test(turn, heard))[1](turn, heard);

const said = (held, segment) => {
  if (segment.type !== "text") return { ...held, segments: [...held.segments, segment] };
  const words = segment.items.join("\n\n").split(WORD);
  return {
    reach: Math.max(0, held.reach - words.length),
    segments: [
      ...held.segments,
      {
        ...segment,
        items: [words.slice(0, held.reach).join("")],
        tail: words.slice(held.reach).join(""),
      },
    ],
  };
};

export const hushed = (segments, reach) => segments.reduce(said, { reach, segments: [] }).segments;

const HUSHED = [
  [
    (turn, heard) => interrupted(turn) && Object.hasOwn(heard, turn.id),
    (segments, turn, heard) => hushed(segments, Math.round(heard[turn.id] * PACE)),
  ],
  [() => true, (segments) => segments],
];

const muted = (segments, turn, heard) =>
  HUSHED.find(([test]) => test(turn, heard))[1](segments, turn, heard);

const landed = (turn) => (streamed(turn) ? Infinity : Date.parse(turn.createdAt));

const spoken = (turn, who, waiting, buffers, yields, heard) => {
  const row = {
    kind: lookup(ROLES, turn.role, "turn role"),
    who: turn.role === "user" ? who : "",
    ts: streamed(turn) ? "" : clock(landed(turn)),
    text: prose(turn.parts),
    tail: spaced(prose(turn.parts), drafted(turn)),
    heard: told(turn, heard),
    tools: tools(turn, waiting, yields),
    think: thought(turn.parts, streamed(turn)),
    segments:
      turn.role === "assistant" ? muted(segmented(turn, waiting, yields), turn, heard) : null,
    streaming: streamed(turn),
    cells: ghost.journal.cells(turn, buffers, yields).length,
    blocks: [],
  };
  return { ...row, meta: meta(row) };
};

const RECORDS = [
  [(record) => record.track === "fault", (record) => ({ kind: "fault", text: record.data.message, segments: null, blocks: [] })],
  [
    (record) => is.string(record.data),
    (record) => ({ kind: "trace", ts: clock(record.at), path: trace.pathname(record.path), text: `${record.path.at(-1)} ${record.data}`, segments: null, blocks: [] }),
  ],
  [
    () => true,
    (record) => ({ kind: "trace", ts: clock(record.at), path: trace.pathname(record.path), text: record.path.at(-1), segments: null, blocks: [{ type: "json", value: record.data }] }),
  ],
];

const journaled = (record) => RECORDS.find(([test]) => test(record))[1](record);

const joined = (prior, entry) => {
  const row = {
    ...prior.row,
    text: [prior.row.text, entry.row.text].filter((text) => text !== "").join("\n\n"),
    tools: [...prior.row.tools, ...entry.row.tools],
    think: prior.row.think === null ? entry.row.think : [...prior.row.think, ...(entry.row.think === null ? [] : entry.row.think)],
    segments: entry.row.segments.reduce(merged, prior.row.segments),
    streaming: entry.row.streaming,
    heard: entry.row.heard,
    cells: prior.row.cells + entry.row.cells,
  };
  return { ...prior, turns: [...prior.turns, ...entry.turns], row: { ...row, meta: meta(row) } };
};

const continued = (prior, entry) => prior !== undefined && prior.row.kind === "agent" && entry.row.kind === "agent";

export const exchanged = (turns, who, waiting, buffers, heard) =>
  turns
    .filter((turn) => !carrier(turn))
    .flatMap((turn) => [
      ...(turn.parts.length === 0 && faulted(turn)
        ? []
        : [{ at: landed(turn), turn, turns: [turn], row: spoken(turn, who, waiting, buffers, results(turns), heard) }]),
      ...(faulted(turn) ? [failure(turn)] : []),
    ])
    .reduce((held, entry) => (continued(held.at(-1), entry) ? [...held.slice(0, -1), joined(held.at(-1), entry)] : [...held, entry]), []);

export const entries = (turns, records, who, waiting, buffers, heard) =>
  [
    ...exchanged(turns, who, waiting, buffers, heard),
    ...records.map((record) => ({ at: record.at, record, row: journaled(record) })),
  ].sort((first, second) => first.at - second.at);

const lensed = (segments, lens) =>
  segments === null || lens.includes("harness") ? segments : segments.filter((segment) => segment.type === "text");

const Entry = (props) => (
  <parts.Turn
    {...props.entry.row}
    segments={lensed(props.entry.row.segments, props.lens)}
    lens={props.lens}
    markdown={props.markdown}
    buffer={props.cells.length === 0 ? null : named(props.cells[0])}
    selected={props.selected}
    onPick={props.onPick}
    onLine={props.onLine}>
    <For each={props.entry.row.blocks}>{(block) => <parts.Block block={block} onLine={props.onLine} />}</For>
    <Show when={props.cells.length > 0}>
      <div class="cells">
        <For each={props.cells}>{(buffer) => <Cell buffer={buffer} onLine={props.onLine} />}</For>
      </div>
    </Show>
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
  const selection = from(app.bridge.$selection);
  const call = from(app.bridge.$call);

  const lens = () => {
    terminals();
    return terminal.dock.lens;
  };
  const markdown = () => {
    terminals();
    return terminal.dock.markdown;
  };
  const waiting = () => parts.listing(activities).some((activity) => thread() !== null && activity.thread === thread() && activity.status === "PAUSED");
  const sent = (signal) => terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  const pick = (index) => () => app.bridge.$selection.set(index);
  const heard = () => (call() === null ? {} : call().heard);
  const listed = (prior, turns, buffers) =>
    ghost.journal.retain(
      prior,
      entries(
        lens().includes("turns") ? turns : [],
        lens().includes("repl") ? parts.listing(records) : [],
        user().slug,
        waiting(),
        buffers,
        heard(),
      ),
    );

  const Rows = (rows) => (
    <For each={rows.entries}>
      {(entry, index) => (
        <Entry
          entry={entry}
          lens={lens()}
          markdown={markdown()}
          cells={entry.turns === undefined ? [] : rows.buffers.filter((buffer) => entry.turns.some((turn) => ghost.journal.cells(turn, [buffer], rows.yields).length > 0))}
          selected={selection() === index()}
          onPick={pick(index())}
          onLine={sent}
        />
      )}
    </For>
  );

  const Seated = (seated) => {
    const turns = from(seated.thread.$turns);
    const buffers = from(seated.thread.$buffers);
    const held = createMemo((prior) => listed(prior, parts.listing(turns), parts.listing(buffers)), []);
    return (
      <Rows
        entries={held()}
        buffers={parts.listing(buffers)}
        yields={results(parts.listing(turns))}
      />
    );
  };

  const Unseated = () => {
    const held = createMemo((prior) => listed(prior, [], []), []);
    return <Rows entries={held()} buffers={[]} yields={[]} />;
  };

  return (
    <Show when={thread()} keyed fallback={<Unseated />}>
      {(seated) => <Seated thread={seated} />}
    </Show>
  );
};
