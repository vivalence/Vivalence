import { faulted, trace, v } from "@vivalence/typology";

export const TRACKS = ["start", "stop", "fault", "log", "status", "entity", "request", "response"];
export const NET = ["request", "response"];
export const FILTERS = ["all", "activity", "repl", "net", "faults"];
export const ONLY = ["all", "faults"];
export const LIMIT = 180;
export const SLOW = 500;
export const SIGNALS = { SIGSTOP: "/pause", SIGCONT: "/resume", SIGTERM: "/stop", SIGKILL: "/abort" };

const { MACHINE } = v.primitives.controller;

export const settled = (code) => Object.hasOwn(MACHINE.states, code) && MACHINE.states[code].settled === true;

const MARKS = [
  [(record) => record.track === "start", (span, record) => Object.assign(span, { begun: record.at, code: "RUNNING" })],
  [(record) => record.track === "stop", (span, record) => Object.assign(span, { sealed: record.at, code: span.fault === null ? "DONE" : "FAILED" })],
  [(record) => record.track === "fault", (span, record) => Object.assign(span, { fault: { at: record.at, ...record.data }, code: "FAILED" })],
  [(record) => record.track === "status", (span, record) => Object.assign(span, { code: record.data.code })],
  [() => true, (span) => span],
];

const ancestors = (prefix, path) => path.slice(0, -1).map((_, index) => `${prefix}${trace.key(path.slice(0, path.length - 1 - index))}`);

const KINDS = [
  [(span) => span.activity !== null, "activity"],
  [(span) => span.tracks.some((track) => NET.includes(track)), "net"],
  [() => true, "repl"],
];

export const story = (records, { prefix = "", keys = [], lineage = [], activity = null, clock }) => {
  const spans = new Map();
  for (const record of records) {
    const id = `${prefix}${trace.key(record.path)}`;
    if (!spans.has(id))
      spans.set(id, {
        id,
        lineage: [...ancestors(prefix, record.path), ...lineage],
        nature: record.path.at(-1),
        path: record.path,
        keys: new Set([...keys, ...record.path]),
        activity,
        begun: null,
        sealed: null,
        fault: null,
        code: "IDLE",
        entries: [],
        tracks: [],
        clock,
      });
    const span = spans.get(id);
    MARKS.find(([test]) => test(record))[1](span, record);
    span.entries.push({ track: record.track, at: record.at, data: record.data });
    span.tracks.push(record.track);
  }
  return [...spans.values()].map((span) => ({ ...span, kind: KINDS.find(([test]) => test(span))[1] }));
};

export const enacted = (activity) => {
  const held = activity.steps;
  const clock = held.length ? held.at(-1).at : 0;
  const id = `activity/${activity.id}`;
  const error = activity.error;
  const root = {
    id,
    lineage: [],
    nature: activity.type.toLowerCase(),
    path: [id],
    keys: new Set([id]),
    activity: activity.id,
    begun: held.length ? held[0].at : null,
    sealed: settled(activity.status) && held.length ? clock : null,
    fault: error === undefined ? null : { at: clock, ...faulted(error) },
    code: activity.status,
    entries: [],
    tracks: [],
    clock,
    kind: "activity",
  };
  const steps = story(held, { prefix: `${id}:`, keys: [id], lineage: [id], activity: activity.id, clock });
  const ended = settled(activity.status);
  return [root, ...steps.map((span) => (ended && span.sealed === null && span.fault === null ? { ...span, code: activity.status } : span))];
};

export const spans = ({ records, activities, since, now }) => [
  ...story(
    records.filter((record) => record.at > since),
    { clock: now },
  ),
  ...activities.flatMap(enacted),
];

export const live = (span) => span.begun !== null && span.sealed === null && span.fault === null && !settled(span.code);
export const duration = (span) =>
  span.begun !== null && span.sealed !== null ? span.sealed - span.begun : live(span) ? span.clock - span.begun : null;
const ended = (span) => (span.sealed !== null ? span.sealed : span.fault !== null ? span.fault.at : span.clock);
const started = (span) => (span.begun !== null ? span.begun : span.entries.length ? span.entries[0].at : span.clock);

export const arrange = (list) => {
  const ids = new Set(list.map((span) => span.id));
  const parent = (span) => {
    const found = span.lineage.find((id) => ids.has(id));
    return found === undefined ? null : found;
  };
  const kids = Map.groupBy(list, parent);
  const ordered = (id) => (kids.has(id) ? kids.get(id).toSorted((a, b) => started(a) - started(b)) : []);
  const walk = (span, depth, up) => [{ span, depth, up }, ...ordered(span.id).flatMap((kid) => walk(kid, depth + 1, span.id))];
  return ordered(null).flatMap((span) => walk(span, 0, null));
};

export const faulty = (arranged) => {
  const up = new Map(arranged.map((held) => [held.span.id, held.up]));
  const marked = new Set();
  for (const held of arranged) {
    if (held.span.fault === null) continue;
    for (let id = held.span.id; id !== null; id = up.get(id)) marked.add(id);
  }
  return marked;
};

const TONES = [
  [(span) => span.fault !== null, "fault"],
  [(span) => live(span), "live"],
  [(span) => span.code === "IDLE", "idle"],
  [() => true, "done"],
];
export const tone = (span) => TONES.find(([test]) => test(span))[1];

export const waterfall = (arranged, marked, held) => {
  const shown = arranged.slice(-LIMIT);
  if (shown.length === 0) return [];
  const low = Math.min(...shown.map((row) => started(row.span)));
  const high = Math.max(...shown.map((row) => ended(row.span)));
  const width = Math.max(1, high - low);
  return shown.map(({ span, depth }) => ({
    id: span.id,
    depth,
    name: span.nature,
    quiet: span.activity !== null && depth === 0 ? span.activity.slice(-4) : "",
    tone: tone(span),
    bang: marked.has(span.id) && span.fault === null,
    l: ((started(span) - low) / width) * 100,
    w: Math.max(1.5, ((ended(span) - started(span)) / width) * 100),
    dur: duration(span),
    live: live(span),
    slow: duration(span) !== null && !live(span) && duration(span) > SLOW,
    cur: span.id === held,
  }));
};

const SAID = [
  [(entry) => entry.data === undefined || entry.data === null, () => ""],
  [(entry) => typeof entry.data === "string", (entry) => entry.data],
  [(entry) => entry.track === "status", (entry) => entry.data.code],
  [(entry) => entry.track === "fault", (entry) => [entry.data.message, entry.data.code].filter((part) => part !== undefined).join(" · ")],
  [() => true, (entry) => JSON.stringify(entry.data)],
];
const said = (entry) => SAID.find(([test]) => test(entry))[1](entry);

export const detail = (span) => {
  const b0 = span.entries.length ? span.entries[0].at : started(span);
  return {
    id: span.id,
    path: trace.pathname(span.path),
    nature: span.nature,
    code: span.code,
    live: live(span),
    dur: duration(span),
    fault: span.fault,
    entries: span.entries.map((entry) => ({ track: entry.track, rel: entry.at - b0, data: said(entry) })),
    signals:
      span.kind === "activity" && span.lineage.length === 0
        ? v.primitives.controller.SIGNALS.map((sig) => ({ sig, signal: SIGNALS[sig], off: settled(span.code) }))
        : [],
  };
};

const KEEP = {
  all: () => true,
  activity: (span) => span.kind === "activity",
  repl: (span) => span.kind === "repl",
  net: (span) => span.kind === "net",
  faults: (span, marked) => marked.has(span.id),
};

export const logger = ({ list, filter, selection }) => {
  const marked = faulty(arrange(list));
  const kept = list.filter((span) => KEEP[filter](span, marked));
  const found = kept.find((span) => span.id === selection);
  return {
    filters: FILTERS.map((id) => ({ id, n: list.filter((span) => KEEP[id](span, marked)).length, cur: filter === id })),
    rows: waterfall(arrange(kept), marked, selection),
    detail: found === undefined ? null : detail(found),
    faults: list.filter((span) => span.fault !== null).length,
  };
};

export const touching = (node) => (span) => node.all || [...span.keys].some((key) => node.reach.has(key));

export const traced = ({ list, node, only, selection }) => {
  const marked = faulty(arrange(list));
  const touched = list.filter(touching(node));
  const kept = only === "faults" ? touched.filter((span) => marked.has(span.id)) : touched;
  const found = kept.find((span) => span.id === selection);
  return {
    only,
    all: touched.length,
    faults: touched.filter((span) => span.fault !== null).length,
    rows: waterfall(arrange(kept), marked, selection),
    detail: found === undefined ? null : detail(found),
  };
};
