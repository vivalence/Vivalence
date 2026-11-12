<!-- writer: agent · reference, uncapped · written 2026-11-16 · the telemetry window's LOGGER and INSPECTOR as implemented: sources, folds, props, parts, DOM, CSS, interactions, gaps -->
# 3 · the inspector and the logger, as they ARE

Read on the live tree 2026-11-16 (change `stlnwvmt`, all of it uncommitted wip: `git status` shows `telemetry.jsx` · `trees.js` · drapes `Inspector.jsx` · `Logger.jsx` · `Tree.jsx` · `JsonTree.jsx` · `parts.css` · ghost `commands/surface/telemetry.js` · `commands/system/set.js` as `M` or `A`). Every claim cites `file:line`, repo-rooted. Code is quoted with its tokens verbatim, reflowed to ≤100 chars; `…` marks a cut. Probe outputs are TRUE FORM: printed by real code (scratch probes, not in the tree), never re-keyed.

The live anima at `:1794` was NOT looked at; nothing here is seen on a screen.

## 0 · the files

| role | path | rows of code |
|------|------|-------|
| window + both tabs, the folds | `systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx` | 382 |
| inspector trees (`modes` · `harness`) | `systems/anima/src/surfaces/chrome/panels/telemetry/trees.js` | 255 |
| window part | `subsystems/drapes/Tele.jsx` | 68 |
| logger part | `subsystems/drapes/Logger.jsx` | 155 |
| inspector part | `subsystems/drapes/Inspector.jsx` | 170 |
| drill-tree part | `subsystems/drapes/Tree.jsx` | 112 |
| json part | `subsystems/drapes/JsonTree.jsx` | 38 |
| sheet | `subsystems/drapes/parts.css:608-736` | `.tele …` |
| state | `systems/ghost/subjects/app/prototypes/telemetry.js` | 21 |
| boot seeding | `systems/anima/src/surfaces/chrome/mount.jsx:60-69` | 10 |
| commands | `systems/ghost/gestalten/commands/surface/telemetry.js` · `…/system/set.js` | 51 · 74 |
| helpers | `systems/anima/src/surfaces/chrome/panels/sidebar/sections.js` | `lookup` · `harness` · … |
| record producer | `subsystems/typology/prototypes/span.js` · `controller.js` | 59 · 83 |
| tty twin | `systems/ghost/surfaces/chrome/panels/telemetry/telemetry.jsx` | 15 (a swatch) |

The pipeline in one tree:

```text
client.controller.stdout  (Span)            subsystems/typology/prototypes/span.js:30  $history
 └ app.telemetry.$logger                    systems/ghost/subjects/app/prototypes/telemetry.js:18
    └ records = computed(filter TRACKS)     telemetry.jsx:243
       ├ LOGGER   view() → story() + enacted()   telemetry.jsx:82 · :31 · :61
       │   └ parts.Logger {filters, rows, detail}   subsystems/drapes/Logger.jsx:128
       └ INSPECTOR inspect() tables + trees.modes/harnesses → trees.tree()
           └ parts.Inspector {points, tables, trees}   subsystems/drapes/Inspector.jsx:131
              └ Tree → JsonTree                         subsystems/drapes/Tree.jsx:60
app.telemetry.$state  (persistentAtom "viva.telemetry.state")  ← every patch / command writes here
```

## 1 · the state — `viva.telemetry.state`

One persistent atom on the ghost `App`, shared by both chromes. Ghost's default carries six keys; anima's mount adds five more.

```js
// systems/ghost/subjects/app/prototypes/telemetry.js:3
export class Telemetry {
  $state = persistentAtom(
    "viva.telemetry.state",
    { open: false, view: "logger", filter: "all", selection: null, since: 0,
      window: { x: 0, y: 3, width: 77, height: 23 } },
    { encode: JSON.stringify, decode: JSON.parse },
  );
  …
  get $logger() {
    return this.app.client.controller.stdout.$history;
  }
}
```

```js
// systems/anima/src/surfaces/chrome/mount.jsx:60
  const seated = Object.hasOwn(appDie.telemetry.state, "point")
    ? {}
    : { window: WINDOW, point: "client", folds: {}, picked: {}, queries: {} };
  appDie.telemetry.$state.set({
    ...appDie.telemetry.state,
    ...seated,
    peeks: {},
    since: 0,
    selection: null,
  });
```

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:17
export const WINDOW = { x: 0, y: 48, width: 600, height: 420 };
```

| key | kind | read by | written by |
|-----|------|---------|------------|
| `open` | boolean | `telemetry.jsx:369` | `/telemetry` (`commands/surface/telemetry.js:28`) · `/inspector` (`:42`) |
| `view` | `logger` · `inspector` | `telemetry.jsx:373,378` | `onTab` `:375` · `/telemetry <view>` · `/inspector` |
| `window` | `{x,y,width,height}` px | `telemetry.jsx:371` | `onPlace` `:377` · mount `:62` |
| `filter` | `all` · `activity` · `repl` · `net` · `faults` | `view` `:88` | `onFilter` `:270` |
| `selection` | span id · null | `view` `:111,122` | `onSelect` `:271` · `/telemetry/clear` · mount |
| `folds` | `{[id]: boolean}` | `view` `:96` | `onFold` `:272` · mount |
| `since` | ms watermark | `view` `:83` · `shown` `:261` | `/telemetry/clear` (`:48`) · mount → 0 |
| `point` | 10 tab ids | `viewed` `:322` | `onPoint` `:352` · `/inspector <point>` |
| `picked` | `{[treeId]: nodeId}` | `trees.tree` `trees.js:242` | `onPick` `:353` |
| `queries` | `{[treeId]: string}` | `trees.tree` `trees.js:240` | `onPick` (reset) · `onQuery` `:359` |
| `peeks` | `{[nodeId]: text}` | `trees.headed` `trees.js:236` | `peeked` `:341` · mount → `{}` |

Every write is a whole-object `set` through one helper:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:259
  const patch = (delta) => app.telemetry.$state.set({ ...app.telemetry.state, ...delta });
  const sent = (signal) =>
    terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  const shown = () => parts.listing(records).filter((record) => record.at > telemetry().since);
```

`patch` writes local state (no repl, no span). `sent` dispatches a repl signal on the AMBIENT terminal (`telemetry.jsx:241`); each dispatch opens its own controller span (`systems/ghost/subjects/terminal/repl.js:80` `controller: this.terminal.controller.branch(signal.pathname)`), so every click that `sent`s lands back in the logger as records.

## 2 · the record producer — what the logger folds

A `Span` keeps every record it or any descendant sends; the client's span is the logger's source.

```js
// subsystems/typology/prototypes/span.js:10
const record = (schema) => (data, ctx) =>
  ctx.span.pipe.send({ at: performance.timeOrigin + performance.now(),
    path: ctx.span.absolute, track: ctx.track, data: schema.cast(data) });
// subsystems/typology/prototypes/span.js:24
export class Span extends Signature {
  static limit = 1000;
  constructor(signature = null, trace = null) {
    …
    this.$history = this.pipe.fold([], (held, record) => [...held, record]);
    if (this.trace) this.pipe.tap(this.trace.pipe);
    onSet(this.$history, ({ newValue }) => newValue.splice(0, newValue.length - Span.limit));
```

The eight tracks and their payloads:

```js
// subsystems/typology/schematics/primitives/track.js:3
export const Start = v.null()…
export const Stop = v.null()…
export const Request = v.object({ method: v.string().optional(), path: v.string().optional() })…
export const Response = v.object({ status: v.integer().optional() })…
export const Fault = v.object({ type: v.string(), message: v.string(),
  code: v.string().optional(), stack: v.string().optional() })…
export const Log = v.union([v.string(), v.object({}, { additionalProperties: true })])…
export const Entity = v.object({ schema: v.string(), id: v.string() })…
export const Status = v.object({ code: v.string() }, { additionalProperties: true })…
```

The controller MACHINE — four live, four settled — and its `status` records:

```js
// subsystems/typology/schematics/primitives/controller.js:3
export const machine = {
  states: {
    IDLE: {}, RUNNING: {}, PAUSED: {}, STOPPING: {},
    DONE: { settled: true }, STOPPED: { settled: true },
    FAILED: { settled: true }, ABORTED: { settled: true },
  },
};
export const SIGNALS = ["SIGTERM", "SIGSTOP", "SIGCONT", "SIGKILL"];
// subsystems/typology/prototypes/controller.js:19
      const unlisten = this.status.$transient.listen((reflection) => {
        …
        this.stdout.status({ ...reflection, error: reflection.error && faulted(reflection.error) });
```

Who writes into `client.controller.stdout` (`systems/ghost/subjects/client/factory.js:47` `shellDie.controller.branch("client")`): the client's own `log`s (`client/factory.js:42`, `client/lifecycle/index.js:35`), the lighthouse span (`client/factory.js:52`), every local mode's span (`client/lifecycle/index.js:12`), every terminal span `terminal/<id>` (`subjects/terminal/hydration.js:10`) and below it every repl dispatch (`subjects/terminal/repl.js:80`, opened by `shard.controller.open`, answered by `repl.js:7-11` `answered` → a `log`). The App's span is a SIBLING (`subjects/shell/commands/chrome.js:15` `shellDie.controller.branch("app")`): its records (`subjects/app/lifecycle.js:5`, audio driver) never reach the logger.

A probe on a real `Span` (scratch `probe.js`: `new Span("client")`, `.branch("terminal/7").branch("/lookup")`, start · log · fault · stop) prints the records the logger receives:

```json
[
 { "at": 1794845652197.2942, "path": ["client"], "track": "start", "data": null },
 { "at": 1794845652199.2942, "path": ["client", "terminal/7", "/lookup"],
   "track": "start", "data": null },
 { "at": 1794845652207.2942, "path": ["client", "terminal/7", "/lookup"],
   "track": "log", "data": { "hit": 0 } },
 { "at": 1794845652211.2942, "path": ["client", "terminal/7", "/lookup"],
   "track": "fault", "data": { "type": "Error", "message": "no such word" } },
 { "at": 1794845652217.2942, "path": ["client", "terminal/7", "/lookup"],
   "track": "stop", "data": null }
]
```

(`stack` dropped by the probe's printer; the fault record carries it.) A node's id is `trace.key(path)`:

```js
// subsystems/typology/gestalten/belt/trace.js:5
export const key = (path) => JSON.stringify(path);
export const pathname = (path) =>
  path.flatMap((nature) => nature.split("/")).filter((segment) => segment !== "").join("/");
```

## 3 · LOGGER

### 3.1 · reads

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:11
export const TRACKS = ["start", "stop", "fault", "log", "status", "entity", "request", "response"];
export const NET = ["request", "response"];
export const FILTERS = ["all", "activity", "repl", "net", "faults"];
export const LIMIT = 180;
export const SIGNALS =
  { SIGSTOP: "/pause", SIGCONT: "/resume", SIGTERM: "/stop", SIGKILL: "/abort" };
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:242
  const telemetry = from(app.telemetry.$state);
  const records = from(computed(app.telemetry.$logger,
    (held) => held.filter((record) => TRACKS.includes(record.track))));
  const activities = from(app.client.runtime.entities.activity.$entities);
```

| source | store | cite |
|--------|-------|------|
| span records | `app.telemetry.$logger` = `client.controller.stdout.$history` | `telemetry.jsx:243` |
| activities | `client.runtime.entities.activity.$entities` (ALL threads) | `telemetry.jsx:244` |
| state | `app.telemetry.$state` | `telemetry.jsx:242` |
| clock | `performance.timeOrigin + performance.now()` at call time | `telemetry.jsx:264` |

### 3.2 · the fold — `story`

A records → node-map fold; one node per distinct `path`, a mark table per track:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:23
const MARKS = [
  [(record) => record.track === "start",
    (node, record) => Object.assign(node, { begun: record.at, code: "RUNNING" })],
  [(record) => record.track === "stop",
    (node, record) => Object.assign(node,
      { sealed: record.at, code: node.fault === null ? "DONE" : "FAILED" })],
  [(record) => record.track === "fault",
    (node, record) => Object.assign(node,
      { fault: { at: record.at, ...record.data }, code: "FAILED" })],
  [(record) => record.track === "status",
    (node, record) => Object.assign(node, { code: record.data.code })],
  [() => true,
    (node, record) => node.entries.push({ track: record.track, at: record.at, data: record.data })],
];

export const story = (records, prefix, clock) => {
  const nodes = new Map();
  const roots = [];
  for (const record of records) {
    const id = `${prefix}${trace.key(record.path)}`;
    if (!nodes.has(id)) {
      const node = { id, nature: record.path.at(-1), path: record.path, begun: null, sealed: null,
        fault: null, entries: [], tracks: [], children: [], clock, code: "IDLE" };
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
```

A node is filed under its parent ONLY if the parent path already has a node; otherwise it is a root forever. `entries` keeps only `log · entity · request · response` (start · stop · fault · status are marks, not entries).

The story node, TRUE FORM (the probe above, `story(records, "", now)`; `children` printed as ids):

```json
{
 "id": "[\"client\",\"terminal/7\",\"/lookup\"]",
 "nature": "/lookup",
 "path": ["client", "terminal/7", "/lookup"],
 "begun": 1794845652199.2942,
 "sealed": 1794845652217.2942,
 "fault": { "at": 1794845652211.2942, "type": "Error", "message": "no such word" },
 "entries": [ { "track": "log", "at": 1794845652207.2942, "data": { "hit": 0 } } ],
 "tracks": ["start", "log", "fault", "stop"],
 "children": [],
 "clock": 1794845652227.2942,
 "code": "FAILED"
}
```

`STORY roots 2` — `/lookup` is a ROOT beside `client`: `terminal/7` never sent a record, so the parent lookup at `telemetry.jsx:39` missed.

### 3.3 · activities as roots — `enacted`

An activity entity becomes one synthetic root; its `steps` are folded by the same `story` under an `<id>:` prefix:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:61
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
```

The kind table and the derived predicates:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:49
const KINDS = [
  [(node) => node.kind === "activity", "activity"],
  [(node) => node.tracks.some((track) => NET.includes(track)), "net"],
  [() => true, "repl"],
];
export const kind = (node) => KINDS.find(([test]) => test(node))[1];

const faulted = (node) => node.fault !== null || node.children.some(faulted);
const live = (node) =>
  node.begun !== null && node.sealed === null && node.fault === null && !settled(node.code);
const duration = (node) => (node.begun !== null && node.sealed !== null
  ? node.sealed - node.begun : live(node) ? node.clock - node.begun : null);
const ended = (node) =>
  (node.sealed !== null ? node.sealed : node.fault !== null ? node.fault.at : node.clock);
```

### 3.4 · props — `view` and `detail`

`view` merges client roots + activity roots, filters, walks to a flat list of ≤ `LIMIT` painted entries with fold state, bar geometry and selection:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:82
export const view = ({ telemetry, records, activities, now }) => {
  const client = story(records.filter((record) => record.at > telemetry.since), "", now);
  const acted = activities.map(enacted);
  const nodes = new Map([...client.nodes,
    ...acted.flatMap((held) => [...held.nodes, [held.node.id, held.node]])]);
  const all = [...client.roots, ...acted.map((held) => held.node)];
  const KEEP = { all: () => true, faults: faulted, activity: (node) => kind(node) === "activity",
    repl: (node) => kind(node) === "repl", net: (node) => kind(node) === "net" };
  const keep = lookup(KEEP, telemetry.filter, "telemetry filter");
  const roots = all.filter(keep).reverse();
  const rows = [];
  const walk = (node, depth, root) => {
    if (rows.length >= LIMIT) return;
    const b0 = root.begun !== null ? root.begun : performance.timeOrigin;
    const span = Math.max(1, (root.sealed !== null ? root.sealed : root.clock) - b0);
    const begun = node.begun !== null ? node.begun : b0;
    const open = Object.hasOwn(telemetry.folds, node.id)
      ? telemetry.folds[node.id] : kind(root) === "activity" && depth === 0;
    rows.push({ id: node.id, depth, nature: node.nature, path: trace.pathname(node.path),
      code: node.code, dur: duration(node), live: live(node), fault: node.fault !== null,
      sub: faulted(node) && node.fault === null, kids: node.children.length, open,
      l: Math.max(0, ((begun - b0) / span) * 100),
      w: Math.max(1.5, ((ended(node) - begun) / span) * 100),
      sel: telemetry.selection === node.id });
    if (open) for (const child of node.children) walk(child, depth + 1, root);
  };
  for (const root of roots) walk(root, 0, root);
  const longest = Math.max(1, ...roots.map((root) => duration(root) ?? 0));
  for (const row of rows) if (row.depth === 0)
    Object.assign(row,
      { l: 0, w: Math.max(1.5, ((row.dur === null ? 0 : row.dur) / longest) * 100) });
  const counts = Object.fromEntries(FILTERS.map((filter) =>
    [filter, all.filter(lookup(KEEP, filter, "telemetry filter")).length]));
  return {
    filters: FILTERS.map((filter) =>
      ({ id: filter, n: counts[filter], cur: telemetry.filter === filter })),
    rows,
    detail: nodes.has(telemetry.selection) ? detail(nodes.get(telemetry.selection)) : null,
    total: records.length,
  };
};
```

Bar geometry: a child's `l`/`w` are percent of its ROOT's span; a root's `w` is its duration over the longest root's (`telemetry.jsx:116-117`). Order: activities first (they are appended after client roots, then `.reverse()`), then client roots newest first; never merged by time.

`detail` is the selected node, re-derived:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:127
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
    entries: node.entries.map((entry) => ({ track: entry.track, rel: entry.at - b0,
      data: entry.data === undefined ? "" : JSON.stringify(entry.data) })),
    kids: node.children.map((child) => { … return { id: child.id, nature: child.nature,
      code: child.code, dur: duration(child), l: …, w: … }; }),
    signals: node.kind === "activity"
      ? v.primitives.controller.SIGNALS.map((sig) =>
        ({ sig, signal: SIGNALS[sig], off: settled(node.code) }))
      : [],
  };
};
```

TRUE FORM of `view(…)` — the probe: the records above, one RUNNING activity (the fixture of `systems/anima/tests/tele.test.js:166-179`), `folds: { '["client"]': true }`, `selection` = the `/lookup` id:

```json
{
 "filters": [
  { "id": "all", "n": 3, "cur": true }, { "id": "activity", "n": 1, "cur": false },
  { "id": "repl", "n": 2, "cur": false }, { "id": "net", "n": 0, "cur": false },
  { "id": "faults", "n": 1, "cur": false }
 ],
 "rows": [
  { "id": "act-1", "depth": 0, "nature": "hallucination", "path": "activity/act-1",
    "code": "RUNNING", "dur": 40, "live": true, "fault": false, "sub": false, "kids": 1,
    "open": true, "l": 0, "w": 100, "sel": false },
  { "id": "act-1:[\"hallucination\"]", "depth": 1, "nature": "hallucination",
    "path": "hallucination", "code": "RUNNING", "dur": 40, "live": true, "fault": false,
    "sub": false, "kids": 1, "open": false, "l": 0, "w": 100, "sel": false },
  { "id": "[\"client\",\"terminal/7\",\"/lookup\"]", "depth": 0, "nature": "/lookup",
    "path": "client/terminal/7/lookup", "code": "FAILED", "dur": 18, "live": false,
    "fault": true, "sub": false, "kids": 0, "open": false, "l": 0, "w": 45, "sel": true },
  { "id": "[\"client\"]", "depth": 0, "nature": "client", "path": "client", "code": "RUNNING",
    "dur": 30, "live": true, "fault": false, "sub": false, "kids": 0, "open": true,
    "l": 0, "w": 75, "sel": false }
 ],
 "detail": {
  "id": "[\"client\",\"terminal/7\",\"/lookup\"]", "trace": "client/terminal/7",
  "nature": "/lookup", "path": "client/terminal/7/lookup", "code": "FAILED", "live": false,
  "dur": 18, "fault": { "at": 1794845652211.2942, "type": "Error", "message": "no such word" },
  "entries": [ { "track": "log", "rel": 8, "data": "{\"hit\":0}" } ],
  "kids": [], "signals": []
 },
 "total": 5
}
```

TRUE FORM of `detail(enacted(activity).node)` — the activity root, `signals` offered:

```json
{
 "id": "act-1", "trace": "", "nature": "hallucination", "path": "activity/act-1",
 "code": "RUNNING", "live": true, "dur": 40, "fault": null, "entries": [],
 "kids": [ { "id": "act-1:[\"hallucination\"]", "nature": "hallucination", "code": "RUNNING",
   "dur": 40, "l": 0, "w": 100 } ],
 "signals": [
  { "sig": "SIGTERM", "signal": "/stop", "off": false },
  { "sig": "SIGSTOP", "signal": "/pause", "off": false },
  { "sig": "SIGCONT", "signal": "/resume", "off": false },
  { "sig": "SIGKILL", "signal": "/abort", "off": false }
 ]
}
```

### 3.5 · the mount — anima → part

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:263
  const Logger = () => {
    const seen = () => view({ telemetry: telemetry(), records: parts.listing(records),
      activities: parts.listing(activities), now: performance.timeOrigin + performance.now() });
    return (
      <parts.Logger
        filters={seen().filters}
        rows={seen().rows}
        detail={seen().detail}
        onFilter={(filter) => patch({ filter })}
        onSelect={(id) =>
          patch({ selection: id === null || telemetry().selection === id ? null : id })}
        onFold={(id, open) => patch({ folds: { ...telemetry().folds, [id]: open } })}
        onLine={sent}
      />
    );
  };
```

`seen()` is a plain function, not a memo: three prop getters run the whole `view` fold three times per reactive pass, and it reads the WHOLE `telemetry()` — a window drag (`onPlace` → `patch`) re-runs it.

### 3.6 · the part — `parts.Logger` props contract

| prop | shape | source |
|------|-------|--------|
| `filters` | `[{id, n, cur}]` | `view` `:120` |
| `rows` | `[{id, depth, nature, path, code, dur, live, fault, sub, kids, open, l, w, sel}]` | `view` `:97-112` |
| `detail` | `{id, trace, nature, path, code, live, dur, fault, entries[], kids[], signals[]}` · null | `detail` `:130-148` |
| `onFilter(id)` | → `patch({filter})` | `telemetry.jsx:270` |
| `onSelect(id \| null)` | → toggles `selection` | `telemetry.jsx:271` |
| `onFold(id, open)` | → `folds[id] = open` | `telemetry.jsx:272` |
| `onLine(signal)` | → `sent` (repl) | `telemetry.jsx:273` |

Tone and duration tables:

```js
// subsystems/drapes/Logger.jsx:4
export const INDENT = 0.875;
export const SLOW = 500;
export const DEEPEST = 4;
export const TONES = { RUNNING: "pri", PAUSED: "cau", STOPPING: "cau", DONE: "pos",
  STOPPED: "mut", FAILED: "neg", ABORTED: "neg", IDLE: "mut" };
// subsystems/drapes/Logger.jsx:11
const SPANS = [
  [(value) => value === null, () => "—"],
  [(value) => value < 1, () => "<1ms"],
  [(value) => value < 1000, (value) => `${Math.round(value)}ms`],
  [(value) => value < 10000, (value) => `${(value / 1000).toFixed(2)}s`],
  [() => true, (value) => `${(value / 1000).toFixed(1)}s`],
];
```

DOM (from `subsystems/drapes/Logger.jsx:128-155`, `:28-59`, `:61-126`):

```text
.tfil                                    filter bar
  button.cur? .neg?(faults with n)  "{id}" span"{n}"      → onFilter(id)
  span.sp
  button.ghost "clear"                                    → onLine("/telemetry/clear")
.tsplit .has?                            list | detail, 2 columns; stacked < 35rem (container)
  .tl[role=tree]
    .tempty "no spans"                   when rows empty
    .trow .sel? .neg? .d0…d4 [role=treeitem][aria-selected][title=path]   → onSelect(id)
      span.tw {padding-left: depth × 0.875rem}
        button.tfold "▾|▸" (kids) | span.tfold (none)
                                         → onFold(id, !open), stops propagation
        span.tc .{tone} .live?           status dot, title = code
        span.tn "{nature}"
        span.tbad "!"                    sub (a descendant faulted)
        span.tk "{kids}"                 folded with kids
      span.tbar > i.{tone} {left: l%, width: min(100-l, w)%}
      span.tms .cau?(dur > 500) "{ms(dur)}"
  .td                                    detail (Show keyed)
    .tdh  span.tc · b"{nature}" · span.chip.{tone}"{code}" · span.sp · span.mut"{ms}" ·
          button.iconbtn(x)                              → onSelect(null)
    .tkv  path · span (id + " · trace {trace}") · fault (code · message)
    .tsig button.neg?(SIGKILL|SIGTERM) [disabled=off] "{sig}"   → onLine(signal)
    .tsec "records"  .tents > .tent  span.v track · span.t "+{ms(rel)}" · code[title] data
    .tsec "children · N"  .twf > .twr  span.tn · Bar · span.tms   → onSelect(kid.id)
```

CSS: `subsystems/drapes/parts.css:631-679` — `.tsplit` grid (`:631-634`, `container: tele / inline-size`), `.trow` a 3-column grid `minmax(0,1fr) minmax(3.75rem,34%) 3.25rem` at 1.375rem height (`:636`), status dot `.tc` (`:646-648`, `.live` = `breathe` animation), bar `.tbar i` (`:649-651`), `.td` detail (`:655`), entries grid `9ch 7ch 1fr` (`:670`), children `14ch 1fr 3.25rem` (`:676`).

### 3.7 · interactions — logger

| gesture | handler | effect |
|---------|---------|--------|
| click filter | `onFilter(id)` | `patch({filter})` |
| click `clear` | `onLine("/telemetry/clear")` | repl → `since = now`, `selection = null` |
| click a `.trow` | `onSelect(id)` | toggles `selection` |
| click `▾/▸` | `onFold(id, !open)` | `folds[id]` |
| click detail ✕ | `onSelect(null)` | `selection = null` |
| click a child `.twr` | `onSelect(kid.id)` | select child |
| click `SIG*` | `onLine("/stop" …)` | repl → `belt.activity.send(SIG, ctx.terminal.thread.activities, …)` (`systems/ghost/gestalten/commands/content/activity.js:11-23`) |
| keys | none | no `tabindex`, no key handler on `.trow` |

## 4 · INSPECTOR

### 4.1 · reads

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:244
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
  const modes = from(app.client.runtime.entities.mode.$entities);
  const daemons = from(app.client.runtime.entities.daemon.$entities);
```

Plus, read inline without a store: `app.client.mask.manifest` · `app.theme` · `app.client.runtime.reference` · `app.client.runtime.lighthouse.manifest.traits` (`:290`) · `terminal.dock` (`:189-195`) · `fromm.modes(app.client.modes).flat` (local modes, `:310`) · `shape.strip(terminal.repl.commands)` (`:317`) · `harness(app.client.runtime, thread())` (`sections.js:42`).

The ten points = eight tables + two trees. The ghost command hard-codes the same ten:

```js
// systems/ghost/gestalten/commands/surface/telemetry.js:8
const POINTS = ["client", "runtime", "lighthouse", "terminal", "thread", "buffers",
  "activities", "telemetry", "modes", "harness"];
```

### 4.2 · tables — `inspect`

A table is `{id, title, meta, rows}`; a table entry is one of six kinds, built by a `[[predicate, build]]` table from the VALUE and its options:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:151
export const SIDES = ["left", "right"];

const ro = (k, value) => ({ k, kind: "ro", v: String(value) });

export const ROWS = [
  [(value, opts) => Array.isArray(value) && opts !== undefined,
    (k, path, value, opts) => ({ k, kind: "set", path, opts, on: value })],
  [(value, opts) => Array.isArray(opts),
    (k, path, value, opts) => ({ k, kind: "enum", path, v: String(value), opts })],
  [(value) => is.boolean(value), (k, path, value) => ({ k, kind: "bool", path, v: value })],
  [(value) => is.number(value),
    (k, path, value, range) => ({ k, kind: "num", path, v: value, ...range })],
  [(value) => is.string(value), (k, path, value) => ({ k, kind: "text", path, v: value })],
];

export const writable = (k, path, value, opts) => {
  const found = ROWS.find(([test]) => test(value, opts));
  if (found === undefined)
    throw new Error(`[tele] no inspector row for ${path} = ${JSON.stringify(value)}`);
  return found[1](k, path, value, opts);
};
const act = (k, signal, off, tone) => ({ k, kind: "act", signal, off, tone });
const able = (activities) => activities.some((activity) => !settled(activity.status));
```

The eight tables (`telemetry.jsx:171-237`):

| table | entries | writes |
|-------|---------|--------|
| `client` | slug · type · theme · narrow (ro) · sidebar (bool) · hidden (set ⊂ `GROUPS`) | `/set bridge.sidebar` · `/set bridge.hidden` |
| `runtime` | reference · status (ro) | — |
| `lighthouse` | standing · user · traits (ro) · `sign in` (off) or `sign out` | `/lighthouse/logout` |
| `terminal` | "N of M" · view (enum `VIEWS`) · align (enum `SIDES`) · share (num `SHARE`) · lens (set `LENSES`) · new · close | `/set terminal.dock.*` · `/terminal/new` · `/terminal/close` |
| `thread` | label (text) · mode · turns (ro) · tier · effort (enum) · rounds (num `ROUNDS`) | `/set thread.*` |
| `buffers` | buffers · seated (ro) | — |
| `activities` | one ro per activity of the shown thread · SIGSTOP · SIGCONT · SIGTERM · SIGKILL | `/pause` `/resume` `/stop` `/abort` |
| `telemetry` | records · spans (ro) · clear | `/telemetry/clear` |

TRUE FORM of `inspect(…)` (scratch probe; stubbed app: slug `anima`, runtime `/runtime/localhost` HEALTHY, user `beef`, two terminals, no thread, one RUNNING activity, 5 records over 2 spans):

```json
[
 { "id": "client", "title": "client", "meta": "anima", "rows": [
   { "k": "slug", "kind": "ro", "v": "anima" }, { "k": "type", "kind": "ro", "v": "client" },
   { "k": "theme", "kind": "ro", "v": "northsea" }, { "k": "narrow", "kind": "ro", "v": "false" },
   { "k": "sidebar", "kind": "bool", "path": "bridge.sidebar", "v": true },
   { "k": "hidden", "kind": "set", "path": "bridge.hidden",
     "opts": ["terminals", "threads", "modes", "buffers", "activity", "harness", "display",
       "box", "system", "control"], "on": ["box"] } ] },
 { "id": "runtime", "title": "runtime", "meta": "healthy", "rows": [
   { "k": "reference", "kind": "ro", "v": "/runtime/localhost" },
   { "k": "status", "kind": "ro", "v": "healthy" } ] },
 { "id": "lighthouse", "title": "lighthouse", "meta": "authenticated", "rows": [
   { "k": "standing", "kind": "ro", "v": "authenticated" },
   { "k": "user", "kind": "ro", "v": "beef" },
   { "k": "traits", "kind": "ro", "v": "AUTOLOGIN" },
   { "k": "sign out", "kind": "act", "signal": "/lighthouse/logout", "off": false,
     "tone": "neg" } ] },
 { "id": "terminal", "title": "terminal", "meta": "docked", "rows": [
   { "k": "terminal", "kind": "ro", "v": "1 of 2" },
   { "k": "view", "kind": "enum", "path": "terminal.dock.view", "v": "docked",
     "opts": ["docked", "full", "closed", "messenger"] },
   { "k": "align", "kind": "enum", "path": "terminal.dock.align", "v": "right",
     "opts": ["left", "right"] },
   { "k": "share", "kind": "num", "path": "terminal.dock.share", "v": 0.38,
     "min": 0.2, "max": 0.8, "step": 0.05 },
   { "k": "lens", "kind": "set", "path": "terminal.dock.lens", "opts": ["turns", "harness", "repl"],
     "on": ["turns", "harness"] },
   { "k": "new terminal", "kind": "act", "signal": "/terminal/new", "off": false, "tone": "" },
   { "k": "close terminal", "kind": "act", "signal": "/terminal/close", "off": false,
     "tone": "neg" } ] },
 { "id": "thread", "title": "thread", "meta": "—",
   "rows": [ { "k": "thread", "kind": "ro", "v": "—" } ] },
 { "id": "buffers", "title": "buffers", "meta": "0", "rows": [
   { "k": "buffers", "kind": "ro", "v": "0" }, { "k": "seated", "kind": "ro", "v": "—" } ] },
 { "id": "activities", "title": "activities", "meta": "1", "rows": [
   { "k": "hallucination", "kind": "ro", "v": "running · 2 steps" },
   { "k": "SIGSTOP", "kind": "act", "signal": "/pause", "off": false, "tone": "" },
   { "k": "SIGCONT", "kind": "act", "signal": "/resume", "off": false, "tone": "" },
   { "k": "SIGTERM", "kind": "act", "signal": "/stop", "off": false, "tone": "neg" },
   { "k": "SIGKILL", "kind": "act", "signal": "/abort", "off": false, "tone": "neg" } ] },
 { "id": "telemetry", "title": "telemetry", "meta": "5 records", "rows": [
   { "k": "records", "kind": "ro", "v": "5" }, { "k": "spans", "kind": "ro", "v": "2" },
   { "k": "clear", "kind": "act", "signal": "/telemetry/clear", "off": false, "tone": "neg" } ] }
]
```

The options come from `sections.js`:

```js
// systems/anima/src/surfaces/chrome/panels/sidebar/sections.js:110
export const TIERS = ["frugal", "fast", "balanced", "capable", "unleashed", "eager"];
export const EFFORTS = ["none", "low", "medium", "high"];
export const VIEWS = ["docked", "full", "closed", "messenger"];
// systems/anima/src/surfaces/chrome/panels/sidebar/sections.js:121
export const GROUPS = ["terminals", "threads", "modes", "buffers", "activity", "harness",
  "display", "box", "system", "control"];
// systems/anima/src/surfaces/chrome/panels/sidebar/sections.js:127
export const SHARE = { floor: 0.2, ceiling: 0.8, step: 0.05 };
const BUDGET = v.thread.traits.properties.INTELLIGENT.properties.rounds;
export const ROUNDS = { min: BUDGET.minimum, max: BUDGET.maximum, step: 1 };
// systems/anima/src/surfaces/chrome/panels/sidebar/sections.js:4
export const lookup = (table, name, kind) => {
  if (!Object.hasOwn(table, name))
    throw new Error(
      `[anima] not a ${kind}: ${JSON.stringify(name)} · ${Object.keys(table).join(" · ")}`);
  return table[name];
};
export const reference = (mode) => (is.object(mode) ? `${mode.type}/${mode.slug}` : String(mode));
export const named = (buffer) => buffer.trait.LABELED.name;
```

`harness(runtime, thread)` (`sections.js:42-58`) resolves the thread's `INTELLIGENT` trait against the answering host's cortex: `tier` = the first of `[stored, ...TIERS]` whose `findOne` is the answering model, `—` when none; `UNMINDED` when no thread, no `INTELLIGENT`, or the host not `HEALTHY`.

### 4.3 · the write path — `/set`

Every editable table entry speaks ONE repl signal, `/set <path> <value>`:

```js
// subsystems/drapes/Inspector.jsx:18
export const setting = (row, value) => `/set ${row.path} ${value}`;
// systems/ghost/gestalten/commands/system/set.js:57
const writable = (ctx, path) => {
  const paths = ctx.client.app === null ? WRITABLE : [...WRITABLE, ...BRIDGE];
  const found = paths.find(([test]) => test(path));
  if (found === undefined)
    throw new Error(`[set] ${JSON.stringify(path)} is not a writable path — …`);
  return found[1];
};
// systems/ghost/gestalten/commands/system/set.js:66
export const set = new Vector().open(
  { nature: "/set", rank: "hidden",
    valence: "inspector: write one path of the client's state …" },
  (ctx) => {
    const entry = writable(ctx, String(ctx.signal.body[0]));
    const Setting = v.object({ path: v.string()…, value: entry.value });
    const { value } = belt.input.cast(Setting, lined(ctx.signal));
    return entry.write(ctx, value);
  },
);
```

| path | value schema (`set.js`) | inspector options (anima) |
|------|--------------------------|---------------------------|
| `terminal.dock.view` | `v.enum(belt.dock.VIEWS)` `:7` | `VIEWS` (same four) |
| `terminal.dock.align` | `v.enum(belt.dock.SIDES)` = left · right · top · bottom `:11` | `SIDES` = left · right |
| `terminal.dock.lens` | `v.enum(LENSES)`, toggles `:15` | `belt.dock.LENSES` |
| `terminal.dock.share` | `v.number({ minimum: 0.1, maximum: 0.9 })` `:20` | `SHARE` 0.2 – 0.8 |
| `terminal.dock.markdown` | `v.enum(MARKDOWNS)` `:24` | not offered |
| `thread.label` | `v.string()` → `LABELED.name` `:28` | `thread.word` |
| `thread.tier` | `Tier` → pins `provider: null, id: null` `:32` | `TIERS` |
| `thread.effort` | `v.enum(EFFORTS)` `:36` | `EFFORTS` |
| `thread.rounds` | `v.integer({ minimum: 1, maximum: 100 })` `:40` | `ROUNDS` from the trait schema |
| `bridge.sidebar` | `v.boolean()` `:47` | `sidebar().open` |
| `bridge.hidden` | `v.string()`, toggles `:51` | `GROUPS` |

### 4.4 · trees — `trees.js`

A tree node, the one shape both `modes` and `harness` build:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/trees.js:17
export const group = (id, label, children, note = "") => ({
  id, label, tag: String(count(children)), note, tone: "", unit: false, value: null, acts: [],
  children,
});
// systems/anima/src/surfaces/chrome/panels/telemetry/trees.js:15
export const count = (nodes) =>
  nodes.reduce((sum, node) => sum + Number(node.unit) + count(node.children), 0);
```

A strip (`shape.strip` output, `{branches, effect?|meta?}`) becomes nodes; the edge kind picks `tag`/`note`:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/trees.js:54
export const DESCRIBED = {
  tool: (edge) => ({ tag: taken(edge), note: valence(edge) }),
  primer: (edge, load) => ({ tag: load, note: valence(edge) }),
  route: (edge) => ({
    tag: [...("methods" in edge ? edge.methods : []),
      ...SHAPES.filter((key) => key in edge)].join(" "),
    note: valence(edge),
  }),
  command: (edge) => ({ tag: "rank" in edge ? edge.rank : taken(edge), note: valence(edge) }),
};

const copied = (text) => ({ kind: "copy", k: "copy path", text, off: false, hint: "" });

export const stripped = (prefix, node, kind, acted = none, steps = [], carried = "eager") =>
  Object.entries(node.branches).map(([nature, child]) => {
    const path = [...steps, nature];
    const edge = "effect" in child ? child.effect : "meta" in child ? child.meta : {};
    const load = "load" in edge ? edge.load : carried;
    return {
      id: `${prefix}/${path.join("/")}`,
      label: nature,
      tone: "",
      unit: "effect" in child,
      ...DESCRIBED[kind](edge, load),
      value: "effect" in child && Object.keys(child.effect).length ? child.effect : null,
      acts: "effect" in child ? [...acted(path), copied(`/${path.join("/")}`)] : [],
      children: stripped(prefix, child, kind, acted, path, load),
    };
  });
```

`modes` — one node per host (runtime, each daemon), its manifest · statics · aperture groups, its modes; plus the client's local modes (`trees.js:142-156`). A mode node (`moded`, `trees.js:87-116`) groups manifest · aperture · repl · keymap · harness (harness only as three counts). A remote mode carries `attach` (`/mode <reference>`, `:118`).

`harnesses` — one node per mode with `metadata.harness`, the seated mode first (`trees.js:169-195`): tools (+ this terminal's repl, armed, when the seated mode is `LOOPING`), primer (each leaf carries a `read` peek, enabled only on the seated mode), references.

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/trees.js:158
const read = (id, seated) => (path) => [
  {
    kind: "peek",
    k: "read",
    key: `${id}/primer/${path.join("/")}`,
    path: path.join("/"),
    off: !seated,
    hint: seated
      ? "as the seated thread's model reads it" : "seat a thread on this mode to read it",
  },
];
```

TRUE FORM — a host node and a mode node (scratch probe over the fixture of `systems/anima/tests/trees.test.js:4-49`, `children` printed as ids):

```json
{
 "id": "modes/runtime", "label": "runtime", "tag": "healthy", "note": "2 modes", "tone": "pos",
 "unit": false, "value": null,
 "acts": [ { "kind": "copy", "k": "copy path", "text": "/runtime/stub", "off": false,
   "hint": "" } ],
 "children": ["modes/runtime/manifest", "modes/runtime/aperture",
   "modes/runtime/stub/mode/chat/chat", "modes/runtime/stub/mode/chat/bare"]
}
{
 "id": "modes/runtime/stub/mode/chat/chat", "label": "chat/chat", "tag": "harnessed looping",
 "note": "seated · chat · 1.0.0", "tone": "pri", "unit": false, "value": null,
 "acts": [
  { "kind": "signal", "k": "attach", "signal": "/mode /runtime/stub/mode/chat/chat", "off": false,
    "hint": "" },
  { "kind": "copy", "k": "copy path", "text": "/runtime/stub/mode/chat/chat", "off": false,
    "hint": "" }
 ],
 "children": ["modes/runtime/stub/mode/chat/chat/manifest",
   "modes/runtime/stub/mode/chat/chat/repl",
   "modes/runtime/stub/mode/chat/chat/harness"]
}
```

A tool leaf, whole:

```json
{
 "id": "harness/runtime/stub/mode/chat/chat/tools/lookup", "label": "lookup", "tone": "",
 "unit": true, "tag": "query · hold?", "note": "Consult the index.",
 "value": { "valence": "Consult the index.", "input": { "type": "object", "required": ["query"],
   "properties": { "query": { "type": "string" }, "hold": { "type": "integer" } } } },
 "acts": [ { "kind": "copy", "k": "copy path", "text": "/lookup", "off": false, "hint": "" } ],
 "children": []
}
```

### 4.5 · a tree page — `tree`

The page projection: the trail to `picked`, a head for the picked node, its children split into plain entries and SPREAD sections (a child whose own children are all leaves, or any child with children at the root):

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/trees.js:197
const matched = (node, query) =>
  `${node.label} ${node.tag} ${node.note}`.toLowerCase().includes(query);
const drilled = (node) => node.children.length > 0 || node.value !== null || node.acts.length > 0;
const entry = (node, label) =>
  ({ id: node.id, label, tag: node.tag, note: node.note, tone: node.tone, drill: drilled(node) });
const section = (node) =>
  ({ ...entry(node, node.label), rows: node.children.map((child) => entry(child, child.label)) });
export const hits = (nodes, query, steps = []) =>
  nodes.flatMap((node) => [
    ...(matched(node, query) ? [entry(node, [...steps, node.label].join(" › "))] : []),
    ...hits(node.children, query, [...steps, node.label]),
  ]);
// systems/anima/src/surfaces/chrome/panels/telemetry/trees.js:226
export const trail = (nodes, id) =>
  nodes.reduce((held, node) =>
    (held !== null ? held : node.id === id ? [node] : under(node, id)), null);
// systems/anima/src/surfaces/chrome/panels/telemetry/trees.js:239
export const tree = (id, title, nodes, telemetry) => {
  const typed = Object.hasOwn(telemetry.queries, id) ? telemetry.queries[id] : "";
  const query = typed.trim().toLowerCase();
  const walked = Object.hasOwn(telemetry.picked, id) ? trail(nodes, telemetry.picked[id]) : null;
  const steps = walked === null ? [] : walked;
  const scope = steps.length ? steps.at(-1).children : nodes;
  const spread = (node) => node.children.length > 0
    && (steps.length === 0 || node.children.every((child) => child.children.length === 0));
  return {
    id,
    title,
    query: typed,
    crumbs: [{ id: null, label: title },
      ...steps.map((node) => ({ id: node.id, label: node.label }))],
    head: steps.length ? headed(steps.at(-1), telemetry.peeks) : null,
    rows: query === ""
      ? scope.filter((node) => !spread(node)).map((node) => entry(node, node.label))
      : hits(scope, query),
    sections: query === "" ? scope.filter(spread).map(section) : [],
  };
};
```

A `picked` id not in the tree (`trail` → null) falls back to the root silently (`systems/anima/tests/trees.test.js:105-107`).

TRUE FORM — the `modes` root page (seated `chat`):

```json
{
 "id": "modes", "title": "modes", "query": "",
 "crumbs": [ { "id": null, "label": "modes" } ],
 "head": null,
 "rows": [ { "id": "modes/client", "label": "client", "tag": "local", "note": "0 modes", "tone": "",
   "drill": false } ],
 "sections": [ { "id": "modes/runtime", "label": "runtime", "tag": "healthy", "note": "2 modes",
   "tone": "pos", "drill": true, "rows": [
   { "id": "modes/runtime/manifest", "label": "manifest", "tag": "2", "note": "", "tone": "",
     "drill": true },
   { "id": "modes/runtime/aperture", "label": "aperture", "tag": "1", "note": "", "tone": "",
     "drill": true },
   { "id": "modes/runtime/stub/mode/chat/chat", "label": "chat/chat", "tag": "harnessed looping",
     "note": "seated · chat · 1.0.0", "tone": "pri", "drill": true },
   { "id": "modes/runtime/stub/mode/chat/bare", "label": "chat/bare", "tag": "",
     "note": "bare · 1.0.0", "tone": "", "drill": true } ] } ]
}
```

TRUE FORM — the `harness` page drilled to `primer/identity`, its peek held:

```json
{
 "id": "harness", "title": "harness", "query": "",
 "crumbs": [ { "id": null, "label": "harness" },
  { "id": "harness/runtime/stub/mode/chat/chat", "label": "/runtime/stub/mode/chat/chat" },
  { "id": "harness/runtime/stub/mode/chat/chat/primer", "label": "primer" },
  { "id": "harness/runtime/stub/mode/chat/chat/primer/identity", "label": "identity" } ],
 "head": { "label": "identity", "tag": "eager", "note": "", "tone": "", "value": null,
  "acts": [
   { "kind": "peek", "k": "read", "key": "harness/runtime/stub/mode/chat/chat/primer/identity",
     "path": "identity", "off": false, "hint": "as the seated thread's model reads it" },
   { "kind": "copy", "k": "copy path", "text": "/identity", "off": false, "hint": "" } ],
  "text": "You are the oracle." },
 "rows": [], "sections": []
}
```

### 4.6 · the mount — anima → part

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:278
  const Inspector = () => {
    const tables = createMemo(() => inspect({ app, bridge: { narrow: viewport().narrow,
      sidebar: sidebar().open, hidden: hidden() }, terminal, terminals: parts.listing(terminals),
      thread: thread(), turns: parts.listing(turns), buffers: parts.listing(buffers),
      seated: seated(),
      activities: parts.listing(activities).filter((activity) =>
        thread() !== null && activity.thread === thread()),
      lighthouse: { status: standing(), user: user(),
        traits: app.client.runtime.lighthouse.manifest.traits },
      runtime: status(), records: shown().length,
      spans: new Set(shown().map((record) => trace.key(record.path))).size }));
    …
    const grown = createMemo(() => {
      status();
      return {
        modes: trees.modes({ runtime: app.client.runtime, daemons: parts.listing(daemons),
          modes: parts.listing(modes), locals: fromm.modes(app.client.modes).flat,
          seated: mode() }),
        harness: trees.harnesses({ modes: parts.listing(modes), seated: mode(),
          minded: mode() === null ? "" : minded(), looped: shape.strip(terminal.repl.commands) }),
      };
    });
    const viewed = createMemo(() => telemetry(), undefined, {
      equals: (held, next) => VIEWED.every((key) => held[key] === next[key]),
    });
    const points = createMemo(() => [
      ...tables().map((table) => ({ id: table.id, title: table.title, meta: table.meta })),
      { id: "modes", title: "modes",
        meta: String(parts.listing(modes).length + fromm.modes(app.client.modes).flat.length) },
      { id: "harness", title: "harness", meta: String(grown().harness.length) },
    ].map((point) => ({ ...point, cur: point.id === viewed().point })));
    const table = createMemo(() => tables().filter((held) => held.id === viewed().point));
    const tree = createMemo(() => Object.keys(grown())
      .filter((id) => id === viewed().point)
      .map((id) => trees.tree(id, id, grown()[id], viewed())));
```

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:13
export const VIEWED = ["point", "picked", "queries", "peeks"];
```

The acts and the part:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:337
    const peeked = (act) =>
      thread()
        .mode.connection.call(`/metadata/harness/primer/${act.path}`, { thread: thread().id })
        .catch((error) => error.message)
        .then((text) => patch({ peeks: { ...telemetry().peeks, [act.key]: text } }));
    const ACTS = {
      signal: (act) => sent(act.signal),
      copy: (act) => globalThis.navigator.clipboard.writeText(act.text),
      peek: peeked,
    };
    return (
      <parts.Inspector
        points={points()}
        tables={table()}
        trees={tree()}
        onPoint={(point) => patch({ point })}
        onPick={(id, node) => patch({ picked: { ...telemetry().picked, [id]: node },
          queries: { ...telemetry().queries, [id]: "" } })}
        onQuery={(id, query) => patch({ queries: { ...telemetry().queries, [id]: query } })}
        onAct={(act) => lookup(ACTS, act.kind, "inspector act")(act)}
        onLine={sent}
      />
    );
```

The peek's runtime side — the mode's aperture, mounted by the `HARNESSED` trait:

```js
// systems/runtime/subjects/mode/traits/harnessed.js:270
    mode.aperture.open(
      { nature: "/metadata/harness/primer/(.*)", input: v.object({ thread: v.string()… }) },
      async (input, ctx) => {
        const thread = await ctx.entities.thread.findOneOrFail({ id: input.thread });
        return shape.primer.read(priming({ ...ctx, input: {} }),
          fromm.params(ctx.params).path.absolute, { ...ctx, thread });
      });
```

`thread().mode.connection` is `daemon.aperture.branch("/mode/<type>/<slug>")` (`systems/ghost/entities/mode/hydration.js:7`). The trees' static strips come from `/metadata/harness` (`harnessed.js:266-269`) held on `mode.metadata.harness`.

### 4.7 · the part — `parts.Inspector` props contract

| prop | shape | source |
|------|-------|--------|
| `points` | `[{id, title, meta, cur}]` (10) | `telemetry.jsx:324-330` |
| `tables` | `[{id, title, meta, rows: [entry]}]`, 0 or 1 | `telemetry.jsx:331` |
| `trees` | `[{id, title, query, crumbs, head, rows, sections}]`, 0 or 1 | `telemetry.jsx:332-336` |
| `onPoint(id)` | → `patch({point})` | `:352` |
| `onPick(treeId, nodeId \| null)` | → `picked[treeId]`, query reset | `:353-358` |
| `onQuery(treeId, text)` | → `queries[treeId]` | `:359` |
| `onAct(act)` | → `ACTS[act.kind]` (`signal` · `copy` · `peek`) | `:360` |
| `onLine(signal)` | → `sent` | `:361` |

A table entry by `kind` paints through a lookup; consecutive `act` entries merge into one group:

```js
// subsystems/drapes/Inspector.jsx:6
export const grouped = (rows) =>
  rows.reduce((groups, row) => {
    const last = groups.at(-1);
    if (row.kind === "act" && last !== undefined && last.kind === "act") last.rows.push(row);
    else groups.push({ kind: row.kind, rows: [row] });
    return groups;
  }, []);
// subsystems/drapes/Inspector.jsx:126
const kind = (name) => {
  if (!Object.hasOwn(KINDS, name))
    throw new Error(`[drapes] not an inspector row kind: ${JSON.stringify(name)} · …`);
  return KINDS[name];
};
```

The `num` stepper — one step, ten with shift, clamped:

```js
// subsystems/drapes/Inspector.jsx:66
        <button aria-label="less" onClick={(event) => props.onLine(setting(props.group.rows[0],
          Math.max(props.group.rows[0].min, stepped(props.group.rows[0].v
            - props.group.rows[0].step * (event.shiftKey ? 10 : 1), props.group.rows[0].step))))}>
```

DOM (`subsystems/drapes/Inspector.jsx:131-170`, `KINDS` `:22-124`, `Tree.jsx:6-112`, `JsonTree.jsx:27-38`):

```text
.tfil.ipts                               ten point tabs
  button.cur? [aria-pressed] "{title}" span"{meta}"(cur only)   → onPoint(id)
.ti                                      scroll body
  .itab > .itb                           the pointed TABLE (For keyed by object)
    ro    .ir  span.ik"{k}" · span.iv.ro"{v}"
    enum  .ir  span.ik · span.iv > label.asel > select[data-linesel][aria-label] option*
                + Icon chev
                                       onChange → onLine(option value = /set …)
    bool  .ir  span.ik · span.iv > button.tog.on?[role=switch][aria-checked] > i
                                       → onLine(/set … !v)
    num   .ir  span.ik · span.iv.num > button"−" · input[data-setpath][inputmode=numeric]
                · button"+"
    text  .ir  span.ik · span.iv > input[data-setpath][spellcheck=false]   onChange → onLine
    set   .ir  span.ik · span.iv.chips > button.on?[aria-pressed]*
                                       → onLine(/set … option)
    act   .ir.act > button.{tone}[disabled=off]*          → onLine(signal)
  .itab > Tree                           the pointed TREE (For keyed by id)
    .tt
      .ttb  nav.ttc[aria-label] button*(crumbs, last disabled) "›"   → onPick(crumb.id)
            span.sp · input.ttq[placeholder=filter]                   onInput → onQuery
      .ttd  (head)  .tdh span.tc.{tone}? · b"{label}" · span.chip"{tag}"?
                    p.ttv"{note}"? · .tsig button[disabled][title=hint]*  → onAct(act)
                    pre.ttx"{peeked text}"? · .ttj JsonTree(value)?
      .ttw  .ttr.go?[role=button?][title=id]
              span.tw(tc · tn) · span.ttg · span.ttn · span.tgo"›"
                                                           → onPick(id) when drill
            .tts  button.ttsh[disabled=!drill] (tc · b · ttg · ttn)    → onPick(section.id)
                  .ttr*
            .tempty "nothing matches"   (query set, rows empty)
```

`JsonTree` flattens a value into keyed spans, every level open, no folding:

```js
// subsystems/drapes/JsonTree.jsx:19
export const rows = (value, key = null, depth = 0) =>
  value !== null && typeof value === "object"
    ? [
        ...(key === null ? [] : [{ key, depth, text: counted(value), tone: "m" }]),
        ...branches(value).flatMap(([name, child]) =>
          rows(child, name, key === null ? depth : depth + 1)),
      ]
    : [{ key, depth, text: leaf(value), tone: tone(value) }];
```

CSS: `subsystems/drapes/parts.css:625-630` (point tabs, `.cur` = 2px primary underline), `:680-710` (tables: `.ir` grid `minmax(10ch,34%) 1fr`, `.tog` switch, `.iv.num`, `.iv.chips`, `.ir.act`), `:711-736` (trees: `.ttr` grid `minmax(9rem,36%) minmax(0,24%) 1fr .75rem`, `.ttd` head on `surface-sunk`, `.ttx` peek ≤14rem, `.ttj` json ≤16rem, json tones `.k .s .n .b .m`). Select styling `.asel` `:584-590`.

### 4.8 · interactions — inspector

| gesture | handler | effect |
|---------|---------|--------|
| click a point tab | `onPoint(id)` | `point` |
| change a select | `onLine(value)` | `/set <path> <option>` |
| click a switch | `onLine` | `/set <path> <!v>` |
| click − / + (shift ×10) | `onLine` | `/set <path> <clamped stepped>` |
| change a number / text input | `onLine` | `/set <path> <raw string>` |
| click a chip | `onLine` | `/set <path> <option>` (toggles) |
| click an act | `onLine(signal)` | repl signal |
| click a drill entry · a section head · a crumb | `onPick(treeId, id \| null)` | `picked`, query cleared |
| type in filter | `onQuery(treeId, text)` | `queries` |
| click a head act | `onAct(act)` | `signal` → repl · `copy` → clipboard · `peek` → runtime call → `peeks` |
| keys | none | no key handler; crumbs · section heads · chips are buttons (tab-reachable), `.ttr` is a div |

## 5 · the window — `Tele`

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:366
  const TABS = { logger: Logger, inspector: Inspector };
  return (
    <Show when={telemetry().open}>
      <parts.Tele
        frame={{ x: telemetry().window.x, y: telemetry().window.y,
          w: telemetry().window.width, h: telemetry().window.height }}
        bounds={{ width: viewport().width, height: viewport().height }}
        tab={telemetry().view}
        count={shown().length}
        onTab={(tab) => patch({ view: tab })}
        onClose={() => sent("/telemetry off")}
        onPlace={(frame) => patch({ window:
          { x: frame.x, y: frame.y, width: frame.w, height: frame.h } })}>
        <Dynamic component={lookup(TABS, telemetry().view, "telemetry tab")} />
      </parts.Tele>
    </Show>
  );
```

```js
// subsystems/drapes/Tele.jsx:4
export const TABS = ["logger", "inspector"];
export const FLOOR = { w: 320, h: 200 };
export const GUTTER = 4;
export const placed = (frame, bounds) => {
  const w = Math.max(FLOOR.w, Math.min(frame.w, bounds.width - 2 * GUTTER));
  const h = Math.max(FLOOR.h, Math.min(frame.h, bounds.height - 2 * GUTTER));
  const x = Math.max(GUTTER, Math.min(frame.x, bounds.width - w - GUTTER));
  const y = Math.max(GUTTER, Math.min(frame.y, bounds.height - h - GUTTER));
  return { x, y, w, h };
};
```

DOM: `.tele[data-zone=3][role=dialog][aria-label=telemetry]{left,top,width,height}` › `.tth` (drag handle, `onPointerDown`, skips buttons) › `span.ttl"telemetry"` · `span.ttabs` button×2 · `span.sp` · `span.mut"{count}"` · `button.iconbtn` ✕ (`Tele.jsx:41-66`); `.tbody` (children); `span.tgrip` (resize, bottom-right). Drag and resize emit `onPlace` on every `pointermove` (`Tele.jsx:16-27`). Mounted in `systems/anima/src/surfaces/chrome/layout.jsx:125-127`; `data-zone="3"` is the telemetry zone (`systems/ghost/surfaces/chrome/mount.jsx:9` `ZONES`). CSS `parts.css:608-623`, `.phone .tele` full-width `:736`.

## 6 · commands

```js
// systems/ghost/gestalten/commands/surface/telemetry.js:17
const SHOWN = [
  [(view) => view === undefined, (held) => ({ ...held, open: !held.open })],
  [(view) => view === "off", (held) => ({ ...held, open: false })],
  [() => true, (held, view) => ({ ...held, open: true, view })],
];
export const telemetry = new Vector()
  .open({ nature: "/telemetry", rank: "hidden", valence: "…", input: Viewed,
    chord: "leader/s/t" },
    (ctx) => { … ctx.client.app.telemetry.$state.set(held);
      return held.open ? `telemetry ${held.view}` : "telemetry off"; })
  .open({ nature: "/inspector", valence: "…", input: Pointed },
    (ctx) => { … ctx.client.app.telemetry.$state.set({ ...ctx.client.app.telemetry.state,
      open: true, view: "inspector", ...pointed }); })
  .open({ nature: "/telemetry/clear", rank: "hidden",
    valence: "drop every record the logger holds; …" },
    (ctx) => { ctx.client.app.telemetry.$state.set({ ...ctx.client.app.telemetry.state,
      since: performance.timeOrigin + performance.now(), selection: null });
      return "telemetry cleared"; });
```

`/telemetry/clear` drops nothing: it moves the `since` watermark; the `$history` keeps up to 1000 records. Grafted at `systems/ghost/subjects/terminal/repl.js:49`. The tty `system` widget offers a `telemetry` key sending `/telemetry` (`systems/ghost/surfaces/chrome/widgets/system/system.jsx:150`).

## 7 · the tty side

No logger, no inspector. The ghost chrome mounts a coloured placeholder at the state's window:

```js
// systems/ghost/surfaces/chrome/panels/telemetry/telemetry.jsx:5
export function Telemetry(props) {
  const telemetry = from(ambient.app.consume().telemetry.$state);
  return (
    <widgets.swatch.Swatch
      name="telemetry"
      fill={props.palette.signalPrimaryInk}
      ink={props.palette.inverseOn}
      style={{ position: "absolute", left: telemetry().window.x, top: telemetry().window.y,
        width: telemetry().window.width, height: telemetry().window.height, zIndex: 10 }}
    />
  );
}
```

Mounted under `<Show when={telemetry().open}>` (`systems/ghost/surfaces/chrome/layout.jsx:142-143`). The ghost default `window` is in CELLS (`{x:0, y:3, width:77, height:23}`), anima's `WINDOW` in PIXELS; one key `viva.telemetry.state`, two storages (browser localStorage vs Deno).

## 8 · tests — run 2026-11-16, `HOME=<empty>`, one-shot

| suite | result | covers |
|-------|--------|--------|
| `systems/anima/tests/trees.test.js` | ok · 5 steps | `modes` · `harnesses` · `tree` · `hits` · `count` |
| `subsystems/drapes/tests/parts/tele.test.js` | ok · 8 steps | `Tele` · `Logger` · `Inspector` · `Tree` DOM + handlers, `placed` · `stepped` · `grouped` |
| `systems/anima/tests/tele.test.js` | FAILED, 0 tests | aborts at load |

```text
./systems/anima/tests/tele.test.js (uncaught error)
error: (in promise) Error: Build failed with 5 errors:
<stdin>:1:14: ERROR: Could not resolve "./panes/index.js"
```

`systems/anima/tests/world.js:10` bundles `../src/surface/` (gone). The file's body is also stale: `client.surface.$tele` · `surface.Tele` · `surface.teleView` · `sel` · `tables` folds · `.ith` table heads · `signal.line` (`tele.test.js:53,91,114,129,145,163,187`). Net: `story` · `view` · `detail` · `enacted` · `inspect` and the `Telemetry` mount have ZERO running tests; only the drapes parts and `trees.js` are tested.

## 9 · what is recorded

- `.ikiro/known-issues.org:93-100` `anima-rig-client-terminal-gone` — OPEN: /"`world.js:10` `SURFACE` is `src/surface/` (gone since m108 m2)"/; `tele.test.js` · `journal.test.js` red before any oracle.
- `.ikiro/known-issues.org:82-90` `anima-suite-aborts-on-two-files` — OPEN; /"The `$telemetry` alias half is gone with anima's legacy (m105 Q8)."/
- `.ikiro/known-issues.org:520` · `:1172` · `:1540` — svelte-era (`src/telemetry/logger.js`, `panels/h/Inspector.svelte`, `panels/g/g.svelte` `logger.$story`): those files are gone (`systems/anima/src/app` absent); the entries are stale.
- `.ikiro/quests/m108-anima-app.org:643` done 11-16 (inspector trees): /"rename this to references. go. blast."/ · /"give me command /inspector [:optional starting point in inspector]"/ — "Painted on a probe only."
- `.ikiro/quests/m108-anima-app.org:645` done 11-16 (inspector II): /"i dont want to have to provide an input. if none, just open default."/ → `point` a pattern string; /"rework the inspector to have many subtabs"/ → ten tabs; /"drag and drop is suuuuper slow"/ → memos (235 → 7 ms a move); /"perisssssssst"/ → `viva.telemetry.state` persistentAtom; /"these numbers are off"/ → `count` = effects; /"i want to drill into modes … not hybrid"/ → drill pages + trail.
- `.ikiro/quests/m108-anima-app.org:644,646` owed: `release.md:52` still says `.routes`; /"his Image #4 never arrived — other wrong numbers unnamed"/; /"first `/inspector` after a fresh load did nothing ×3 (unchased)"/; `persistentAtom` leaks into Deno storage from every suite but `commands.test.js`; /"anima `tele.test.js:114,145` still read `tables`"/; /"`.ith` rules zero readers"/.
- `.ikiro/quests/m108-anima-app.org:638` never: /"a shim or dual read of `client.surface` beside `client.app`; `?url=`; `$telemetry`"/.
- `.ikiro/codestyle.md:24` REJECTED 10-12: re-adding `$telemetry` → /"NO. fuck. ill kill you if you try this again."/
- `.ikiro/quests/done/m105-telemetry-client.org:25-27` rulings: Q0′ /"does it make sense to have telemetry, client and logger? Yeah, it does make sense to have the client on telemetry."/ · Q1 /"the terminal is just one dimension in the our inspector, because we really want to see, well, all of the entities, including all of the runtime stuff … the order of the inspector is orthogonal to terminal."/ · /"Another thing in the inspector is, for example, the all of the client state."/ · Q2 /"we wanted to build dedicated views per dimension. And the dimensions isn't a primitive on the telemetry. Don't over-engineer it."/
- `.ikiro/quests/done/m95-depincered-client.org:80` ruling 28: /"What we render in the dock is the terminal controller span, so we write everything into that. […] In order to access the client controller spans, we go through telemetry"/.
- `.ikiro/quests/m108-anima-app.org:635` direction 11-11 (Q2B): /"the direction is okay, but I don't need to implement this today"/ — a generic viewer (inspector · source editor · state view · movie) = a view of a RUNTIME mode joining the pool by mime.
- `.ikiro/quests/roadmap/m89-telemetry.org` DESIGNED 10-12, not landed: an `inspector` surface with `level` · `filters` and `caps.story` (`:423-431`), the inspector as one consumer of a controller's stdout beside `console` · `ledger` (`:380`).

## 10 · gaps — defects found on the tree

Each names the code and what breaks. Read on the tree; the first two proven by the probes above, the rest by reading only.

1. **orphan spans become roots** — `telemetry.jsx:39-40` files a node under its parent only when the parent path already has a node. A span whose ancestor never sent a record (probe: `terminal/7`) is a root forever: `/lookup` painted at depth 0 beside `client` (`STORY roots 2`, `client` `kids: 0`). Any terminal span that emits nothing before its repl dispatches loses its tree.
2. **activity faults never show** — `enacted` reads `activity.error` (`telemetry.jsx:72`), but `Activity` has only `set error` (`systems/ghost/entities/activity/prototype.js:19-21`), no getter. Probe: after `a.error = {message: "boom"}`, `a.error` is `undefined`, the message sits in `a.controller.status.reflection.error`. The activity root's `fault` is always `null`; detail shows no fault line.
3. **a per-activity SIG button acts on the whole seated thread** — `detail` offers `SIGTERM → "/stop"` on one activity (`telemetry.jsx:144-147`); `/stop` sends to `ctx.terminal.thread.activities` (`systems/ghost/gestalten/commands/content/activity.js:23`). The logger lists activities of ALL threads (`telemetry.jsx:244,264`), so a button on another thread's activity signals the seated thread's activities instead, or none.
4. **the logger re-folds three times on every state write** — `seen()` (`telemetry.jsx:264`) is not a memo, read by three props (`:267-269`), and reads the whole `telemetry()`; every `onPlace` pointermove during a drag re-runs `story` + `view` ×3. The inspector got the `viewed` memo (`:321-323`); the logger did not.
5. **inspector tables re-mount on every record** — `tables` depends on `shown()` (`telemetry.jsx:292-293`), so each new span record rebuilds every table object; `Inspector.jsx:144` `For each={props.tables}` keys by object, so the pointed table's DOM is recreated — a `text`/`num` input being typed into (`thread.label`) loses its draft and focus when any record lands.
6. **live durations freeze** — `now` is read once per fold (`telemetry.jsx:264`); nothing ticks. A RUNNING span's bar and `ms` stay at the value of the last record or state change.
7. **inspector options disagree with `/set`** — align offers `SIDES = ["left","right"]` (`telemetry.jsx:151`) while `belt.dock.SIDES` has four (`systems/ghost/gestalten/belt/dock.js:5`): a `top`/`bottom` dock shows no selected option; share clamps 0.2–0.8 (`sections.js:127`) vs `/set` 0.1–0.9 (`set.js:20`); `terminal.dock.markdown` is writable but not offered.
8. **two `act` shapes under one word** — a table act is `{k, kind: "act", signal, off, tone}` (`telemetry.jsx:168`) and paints via `onLine`; a tree act is `{kind: "signal"|"copy"|"peek", k, …, off, hint}` (`trees.js:64,118,158-167`) and paints via `onAct`. `kind` names the entry kind in tables and the act kind in trees.
9. **POINTS listed twice** — `systems/ghost/gestalten/commands/surface/telemetry.js:8` hard-codes ten ids; anima derives eight from `inspect` + two from `grown` (`telemetry.jsx:324-330`). A drift leaves `/inspector <point>` valid in ghost but painting an empty body in anima (no table, no tree matches `point`).
10. **`copy path` copies a relative path** — tree leaves copy `/${path.join("/")}` from the strip root (`trees.js:80`): a tool copies `/lookup`, a primer `/identity` (probe), not the mode-qualified address.
11. **`sign in` is a dead button** — `act("sign in", "/lighthouse/login", true, "")` (`telemetry.jsx:183`) is always `off: true`.
12. **dead props, dead CSS** — `view` returns `total` (`telemetry.jsx:123`), never passed to `parts.Logger`; table `title` · `meta` unused by the part; `.tele .ith` · `.ith b` · `.ith .tf` (`parts.css:682-685`) have zero readers; `.tele .ir.act` declares `display` three ways (`:687-688`, `:708`, `:710`); `.tele .ipts button.cur` twice (`:627`, `:629`); the `TRACKS` filter (`telemetry.jsx:243`) passes every standard track (all eight are listed; `span.js:13-21`), so it filters nothing.
13. **a sibling fold exists** — `subsystems/typology/gestalten/belt/trace.js:1-31` (`seed` · `chronicle` · `step` · its own `MARKS`) builds `{nodes, roots}` with `timing` · `fault` · `entries` · `children` from the same records; `story` re-implements it with a different node shape (`begun`/`sealed` flat, `code`, `tracks`, `clock`).
14. **the app span is outside the logger** — `client.controller` and `app.controller` are both branches of the shell (`client/factory.js:47`, `shell/commands/chrome.js:15`); the App's records (bundle, audio) never reach `client.controller.stdout.$history`.
15. **no keyboard, no reduced motion** — no key handler anywhere in `Logger.jsx` · `Inspector.jsx` · `Tree.jsx`; `.trow` and `.ttr` are divs without `tabindex`. `.tele .tc.live` animates `breathe` (`parts.css:648`) and is not in the reduced-motion list (`parts.css:399`).
16. **zero running tests on the anima half** — `systems/anima/tests/tele.test.js` aborts at load (§8); `story` · `view` · `detail` · `enacted` · `inspect` · the mount are untested.
17. **the tty has no logger or inspector** — `systems/ghost/surfaces/chrome/panels/telemetry/telemetry.jsx` paints a swatch; m105 Q0′ says "ghost's tty and anima paint them" (`.ikiro/quests/done/m105-telemetry-client.org:1`).
