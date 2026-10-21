import { from, Show } from "solid-js";
import { computed } from "nanostores";
import { Dynamic } from "solid-js/web";
import * as parts from "@vivalence/drapes/parts";
import { belt as typology, is, trace, v } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";
import { EFFORTS, GROUPS, harness, LENSES, lookup, named, reference, SHARE, TUNES, VIEWS } from "../sidebar/sections.js";

export const TRACKS = ["start", "stop", "fault", "log", "status", "entity", "request", "response"];
export const NET = ["request", "response"];
export const FILTERS = ["all", "activity", "repl", "net", "faults"];
export const LIMIT = 180;
export const SIGNALS = { SIGSTOP: "/pause", SIGCONT: "/resume", SIGTERM: "/stop", SIGKILL: "/abort" };
export const WINDOW = { x: 0, y: 48, width: 600, height: 420 };

const { MACHINE } = v.primitives.controller;

const settled = (code) => Object.hasOwn(MACHINE.states, code) && MACHINE.states[code].settled === true;

const MARKS = [
  [(record) => record.track === "start", (node, record) => Object.assign(node, { begun: record.at, code: "RUNNING" })],
  [(record) => record.track === "stop", (node, record) => Object.assign(node, { sealed: record.at, code: node.fault === null ? "DONE" : "FAILED" })],
  [(record) => record.track === "fault", (node, record) => Object.assign(node, { fault: { at: record.at, ...record.data }, code: "FAILED" })],
  [(record) => record.track === "status", (node, record) => Object.assign(node, { code: record.data.code })],
  [() => true, (node, record) => node.entries.push({ track: record.track, at: record.at, data: record.data })],
];

export const story = (records, prefix, clock) => {
  const nodes = new Map();
  const roots = [];
  for (const record of records) {
    const id = `${prefix}${trace.key(record.path)}`;
    if (!nodes.has(id)) {
      const node = { id, nature: record.path.at(-1), path: record.path, begun: null, sealed: null, fault: null, entries: [], tracks: [], children: [], clock, code: "IDLE" };
      nodes.set(id, node);
      const parent = nodes.get(`${prefix}${trace.key(record.path.slice(0, -1))}`);
      (parent === undefined ? roots : parent.children).push(node);
    }
    const node = nodes.get(id);
    MARKS.find(([test]) => test(record))[1](node, record);
    node.tracks.push(record.track);
  }
  return { nodes, roots };
};

const KINDS = [
  [(node) => node.kind === "activity", "activity"],
  [(node) => node.tracks.some((track) => NET.includes(track)), "net"],
  [() => true, "repl"],
];
export const kind = (node) => KINDS.find(([test]) => test(node))[1];

const faulted = (node) => node.fault !== null || node.children.some(faulted);
const live = (node) => node.begun !== null && node.sealed === null && node.fault === null && !settled(node.code);
const duration = (node) => (node.begun !== null && node.sealed !== null ? node.sealed - node.begun : live(node) ? node.clock - node.begun : null);
const ended = (node) => (node.sealed !== null ? node.sealed : node.fault !== null ? node.fault.at : node.clock);

export const enacted = (activity) => {
  const held = activity.steps;
  const clock = held.length ? held.at(-1).at : 0;
  const { nodes, roots } = story(held, `${activity.id}:`, clock);
  const node = {
    id: activity.id,
    kind: "activity",
    nature: activity.type.toLowerCase(),
    path: [`activity/${activity.id}`],
    begun: held.length ? held[0].at : null,
    sealed: settled(activity.status) && held.length ? clock : null,
    fault: activity.error ? { at: clock, ...activity.error } : null,
    entries: [],
    tracks: [],
    children: roots,
    clock,
    code: activity.status,
  };
  return { node, nodes };
};

export const view = ({ telemetry, records, activities, now }) => {
  const client = story(records.filter((record) => record.at > telemetry.since), "", now);
  const acted = activities.map(enacted);
  const nodes = new Map([...client.nodes, ...acted.flatMap((held) => [...held.nodes, [held.node.id, held.node]])]);
  const all = [...client.roots, ...acted.map((held) => held.node)];
  const KEEP = { all: () => true, faults: faulted, activity: (node) => kind(node) === "activity", repl: (node) => kind(node) === "repl", net: (node) => kind(node) === "net" };
  const keep = lookup(KEEP, telemetry.filter, "telemetry filter");
  const roots = all.filter(keep).reverse();
  const rows = [];
  const walk = (node, depth, root) => {
    if (rows.length >= LIMIT) return;
    const b0 = root.begun !== null ? root.begun : performance.timeOrigin;
    const span = Math.max(1, (root.sealed !== null ? root.sealed : root.clock) - b0);
    const begun = node.begun !== null ? node.begun : b0;
    const open = Object.hasOwn(telemetry.folds, node.id) ? telemetry.folds[node.id] : kind(root) === "activity" && depth === 0;
    rows.push({
      id: node.id,
      depth,
      nature: node.nature,
      path: trace.pathname(node.path),
      code: node.code,
      dur: duration(node),
      live: live(node),
      fault: node.fault !== null,
      sub: faulted(node) && node.fault === null,
      kids: node.children.length,
      open,
      l: Math.max(0, ((begun - b0) / span) * 100),
      w: Math.max(1.5, ((ended(node) - begun) / span) * 100),
      sel: telemetry.selection === node.id,
    });
    if (open) for (const child of node.children) walk(child, depth + 1, root);
  };
  for (const root of roots) walk(root, 0, root);
  const longest = Math.max(1, ...roots.map((root) => duration(root) ?? 0));
  for (const row of rows) if (row.depth === 0) Object.assign(row, { l: 0, w: Math.max(1.5, ((row.dur === null ? 0 : row.dur) / longest) * 100) });
  const counts = Object.fromEntries(FILTERS.map((filter) => [filter, all.filter(lookup(KEEP, filter, "telemetry filter")).length]));
  return {
    filters: FILTERS.map((filter) => ({ id: filter, n: counts[filter], cur: telemetry.filter === filter })),
    rows,
    detail: nodes.has(telemetry.selection) ? detail(nodes.get(telemetry.selection)) : null,
    total: records.length,
  };
};

export const detail = (node) => {
  const b0 = node.begun !== null ? node.begun : performance.timeOrigin;
  const span = Math.max(1, (node.sealed !== null ? node.sealed : node.clock) - b0);
  return {
    id: node.id,
    trace: trace.pathname(node.path.slice(0, -1)),
    nature: node.nature,
    path: trace.pathname(node.path),
    code: node.code,
    live: live(node),
    dur: duration(node),
    fault: node.fault,
    entries: node.entries.map((entry) => ({ track: entry.track, rel: entry.at - b0, data: entry.data === undefined ? "" : JSON.stringify(entry.data) })),
    kids: node.children.map((child) => {
      const begun = child.begun !== null ? child.begun : b0;
      return { id: child.id, nature: child.nature, code: child.code, dur: duration(child), l: Math.max(0, ((begun - b0) / span) * 100), w: Math.max(1.5, ((ended(child) - begun) / span) * 100) };
    }),
    signals:
      node.kind === "activity"
        ? v.primitives.controller.SIGNALS.map((sig) => ({ sig, signal: SIGNALS[sig], off: settled(node.code) }))
        : [],
  };
};

export const SIDES = ["left", "right"];
export const ROUNDS = { min: 1, max: 50, step: 1 };

const ro = (k, value) => ({ k, kind: "ro", v: String(value) });

export const ROWS = [
  [(value, opts) => Array.isArray(value) && opts !== undefined, (k, path, value, opts) => ({ k, kind: "set", path, opts, on: value })],
  [(value, opts) => Array.isArray(opts), (k, path, value, opts) => ({ k, kind: "enum", path, v: String(value), opts })],
  [(value) => is.boolean(value), (k, path, value) => ({ k, kind: "bool", path, v: value })],
  [(value) => is.number(value), (k, path, value, range) => ({ k, kind: "num", path, v: value, ...range })],
  [(value) => is.string(value), (k, path, value) => ({ k, kind: "text", path, v: value })],
];

export const writable = (k, path, value, opts) => {
  const found = ROWS.find(([test]) => test(value, opts));
  if (found === undefined) throw new Error(`[tele] no inspector row for ${path} = ${JSON.stringify(value)}`);
  return found[1](k, path, value, opts);
};
const act = (k, signal, off, tone) => ({ k, kind: "act", signal, off, tone });
const able = (activities) => activities.some((activity) => !settled(activity.status));

export const inspect = ({ app, bridge, terminal, terminals, thread, turns, buffers, seated, activities, lighthouse, runtime, telemetry, records, spans }) => {
  const tables = [
    { id: "client", title: "client", meta: app.client.mask.manifest.slug, rows: [ro("slug", app.client.mask.manifest.slug), ro("type", app.client.mask.manifest.type), ro("theme", app.theme), ro("narrow", bridge.narrow), writable("sidebar", "bridge.sidebar", bridge.sidebar), writable("hidden", "bridge.hidden", bridge.hidden, GROUPS)] },
    { id: "runtime", title: "runtime", meta: runtime.code.toLowerCase(), rows: [ro("reference", app.client.runtime.reference.absolute), ro("status", runtime.code.toLowerCase())] },
    {
      id: "lighthouse",
      title: "lighthouse",
      meta: lighthouse.status.code.toLowerCase(),
      rows: [
        ro("standing", lighthouse.status.code.toLowerCase()),
        ro("user", lighthouse.user === null ? "—" : lighthouse.user.slug),
        ro("traits", lighthouse.traits.join(" · ") || "—"),
        lighthouse.user === null ? act("sign in", "/lighthouse/login", true, "") : act("sign out", "/lighthouse/logout", false, "neg"),
      ],
    },
    {
      id: "terminal",
      title: "terminal",
      meta: terminal.dock.view,
      rows: [
        ro("terminal", `${terminals.indexOf(terminal) + 1} of ${terminals.length}`),
        writable("view", "terminal.dock.view", terminal.dock.view, VIEWS),
        writable("align", "terminal.dock.align", terminal.dock.align, SIDES),
        writable("share", "terminal.dock.share", terminal.dock.share, { min: SHARE.floor, max: SHARE.ceiling, step: SHARE.step }),
        writable("lens", "terminal.dock.lens", terminal.dock.lens, Object.keys(LENSES)),
        act("new terminal", "/terminal/new", false, ""),
        act("close terminal", "/terminal/close", terminals.length < 2, "neg"),
      ],
    },
    {
      id: "thread",
      title: "thread",
      meta: thread === null ? "—" : reference(thread.mode),
      rows:
        thread === null
          ? [ro("thread", "—")]
          : [
              writable("label", "thread.label", thread.word),
              ro("mode", reference(thread.mode)),
              ro("turns", turns.length),
              writable("tune", "thread.tune", harness(thread).tune, TUNES),
              writable("effort", "thread.effort", harness(thread).effort, EFFORTS),
              writable("rounds", "thread.rounds", harness(thread).rounds, ROUNDS),
            ],
    },
    {
      id: "buffers",
      title: "buffers",
      meta: String(buffers.length),
      rows: [ro("buffers", buffers.length), ro("seated", seated === null ? "—" : named(seated))],
    },
    {
      id: "activities",
      title: "activities",
      meta: String(activities.length),
      rows: [
        ...activities.map((activity) => ro(activity.type.toLowerCase(), `${activity.status.toLowerCase()} · ${activity.steps.length} steps`)),
        act("SIGSTOP", SIGNALS.SIGSTOP, !able(activities), ""),
        act("SIGCONT", SIGNALS.SIGCONT, !able(activities), ""),
        act("SIGTERM", SIGNALS.SIGTERM, !able(activities), "neg"),
        act("SIGKILL", SIGNALS.SIGKILL, !able(activities), "neg"),
      ],
    },
    { id: "telemetry", title: "telemetry", meta: `${records} records`, rows: [ro("records", records), ro("spans", spans), act("clear", "/telemetry/clear", false, "neg")] },
  ];
  return tables.map((table) => ({ ...table, open: Object.hasOwn(telemetry.tables, table.id) ? telemetry.tables[table.id] : true }));
};

export function Telemetry() {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const telemetry = from(app.telemetry.$state);
  const records = from(computed(app.telemetry.$logger, (held) => held.filter((record) => TRACKS.includes(record.track))));
  const activities = from(app.client.runtime.entities.activity.$entities);
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const status = from(app.client.runtime.$status);
  const user = from(app.client.runtime.lighthouse.$user);
  const standing = from(app.client.runtime.lighthouse.$status);
  const thread = from(terminal.$thread);
  const seated = from(terminal.$buffer);
  const turns = from(typology.atom.chain(terminal.$thread, "$turns"));
  const buffers = from(typology.atom.chain(terminal.$thread, "$buffers"));
  const viewport = from(app.bridge.$viewport);
  const sidebar = from(app.bridge.$sidebar);
  const hidden = from(app.bridge.$hidden);

  const patch = (delta) => app.telemetry.$state.set({ ...app.telemetry.state, ...delta });
  const sent = (signal) => terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  const shown = () => parts.listing(records).filter((record) => record.at > telemetry().since);

  const Logger = () => {
    const seen = () => view({ telemetry: telemetry(), records: parts.listing(records), activities: parts.listing(activities), now: performance.timeOrigin + performance.now() });
    return (
      <parts.Logger
        filters={seen().filters}
        rows={seen().rows}
        detail={seen().detail}
        onFilter={(filter) => patch({ filter })}
        onSelect={(id) => patch({ selection: id === null || telemetry().selection === id ? null : id })}
        onFold={(id, open) => patch({ folds: { ...telemetry().folds, [id]: open } })}
        onLine={sent}
      />
    );
  };

  const Inspector = () => {
    const tables = () =>
      inspect({
        app,
        bridge: { narrow: viewport().narrow, sidebar: sidebar().open, hidden: hidden() },
        terminal,
        terminals: parts.listing(terminals),
        thread: thread(),
        turns: parts.listing(turns),
        buffers: parts.listing(buffers),
        seated: seated(),
        activities: parts.listing(activities).filter((activity) => thread() !== null && activity.thread === thread()),
        lighthouse: { status: standing(), user: user(), traits: app.client.runtime.lighthouse.manifest.traits },
        runtime: status(),
        telemetry: telemetry(),
        records: shown().length,
        spans: new Set(shown().map((record) => trace.key(record.path))).size,
      });
    return <parts.Inspector tables={tables()} onTable={(id, open) => patch({ tables: { ...telemetry().tables, [id]: open } })} onLine={sent} />;
  };

  const TABS = { logger: Logger, inspector: Inspector };

  return (
    <Show when={telemetry().open}>
      <parts.Tele
        frame={{ x: telemetry().window.x, y: telemetry().window.y, w: telemetry().window.width, h: telemetry().window.height }}
        bounds={{ width: viewport().width, height: viewport().height }}
        tab={telemetry().view}
        count={shown().length}
        onTab={(tab) => patch({ view: tab })}
        onClose={() => sent("/telemetry off")}
        onPlace={(frame) => patch({ window: { x: frame.x, y: frame.y, width: frame.w, height: frame.h } })}>
        <Dynamic component={lookup(TABS, telemetry().view, "telemetry tab")} />
      </parts.Tele>
    </Show>
  );
}
