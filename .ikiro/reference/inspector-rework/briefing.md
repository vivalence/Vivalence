<!-- writer: agent · reference, uncapped · written 2026-11-16 · entry point of the inspector-rework briefing for a design agent -->
# inspector rework — a design briefing

Input for a design agent reworking the telemetry window: its INSPECTOR tab and the LOGGER beside it. Three census agents (opus, 11-16) each wrote one section against the live tree (`jj` change `stlnwvmt`). Every claim cites `file:line`; describes what IS, proposes nothing.

| § | file | chars | answers |
|---|---|---|---|
| 1 | `1-entities.md` | 102044 | every object the panel reads, captured LIVE in true form · relations · traits |
| 2 | `2-client.md` | 41893 | the client: boot · wire · subjects + stores · dispatch · surface · where telemetry sits |
| 3 | `3-inspector-logger.md` | 70281 | logger + inspector as implemented: sources · writes · folds · props · DOM · CSS · gaps |
| — | `entities.probe.js` · `form.probe.js` | — | the probe behind §1; boots a ghost test world on a FREE port |

Read order: §2 §0 (the tree) → §3 §1–2 (state · records) → §3 §3–4 (logger · inspector) → §1 per entity, on demand.

## the panel in one view

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:366
const TABS = { logger: Logger, inspector: Inspector };
```

```js
// systems/ghost/subjects/app/prototypes/telemetry.js:4
$state = persistentAtom(
  "viva.telemetry.state",
  { open: false, view: "logger", filter: "all", selection: null, since: 0, window: { … } },
```

```js
// systems/ghost/subjects/app/prototypes/telemetry.js:20
get $logger() {
  return this.app.client.controller.stdout.$history;
}
```

- logger = `story` fold over span records (`telemetry.jsx:31`) + activities (`telemetry.jsx:65`) → `parts.Logger` (`subsystems/drapes/Logger.jsx:128`).
- inspector = `inspect` hand-written tables (`telemetry.jsx:153`) + `trees.modes` · `trees.harnesses` (`trees.js`) → `parts.Inspector` (`subsystems/drapes/Inspector.jsx:131`).
- window = `parts.Tele` (`subsystems/drapes/Tele.jsx`); tty twin is a stub swatch.

## defects — verified by the orchestrator on the tree

| # | code | what breaks |
|---|---|---|
| 1 | `telemetry.jsx:39-40` | span whose parent sent no record → filed as a ROOT |
| 2 | `telemetry.jsx:72` × `systems/ghost/entities/activity/prototype.js:19` | `activity.error` setter-only → read `undefined` → logger never shows an activity fault |
| 3 | `systems/ghost/gestalten/commands/content/activity.js:23` | per-activity `/stop` acts on `ctx.terminal.thread.activities` → wrong thread's activities |
| 4 | `subsystems/typology/prototypes/connection.js:66` × `subsystems/typology/gestalten/shard/track.js:28` | ctx carries no `span` → no `request`/`response` record → logger `net` filter empty |

Further gaps (agent-reported, not re-verified): §3 §10 (17 entries) · §1 §17 · §2 tail. Notable: `seen()` unmemoized, the fold reruns ×3 per state write (`telemetry.jsx:264`); tables rebuilt per new record, a half-typed `thread.label` lost (`telemetry.jsx:292`); `/set` ranges vs inspector options disagree; `Mode.toJSON` circular; most gestures `patch` state directly instead of dispatching a repl signal (`telemetry.jsx:259`); `systems/anima/src/surfaces/chrome/send.js` zero importers.

## tests

| suite | state |
|---|---|
| `systems/anima/tests/trees.test.js` | green |
| `subsystems/drapes/tests/parts/tele.test.js` | green |
| `systems/anima/tests/tele.test.js` | aborts at load: `world.js:10` bundles the deleted `src/surface/` |

## codemap drift found (owed to `fold`)

- `world/codemap/design.md`: "a part reaches widgets via `ambient(key, schema)`" — `grep ambient subsystems/drapes/*.jsx` = 0; parts are props-only.
- `world/codemap/design.md`: cell view `panels/dock/journal.jsx:84` → `panels/frame/view.jsx:33`; `cover.jsx:54` → `:55`.
- `world/codemap/ghost.md`: `repl.js:23` `commands` → `:34`; persisted keys omit `viva.telemetry.state`.
- `client-design-briefing.md` (10-16): anima as SvelteKit — now Solid on vite 8.
<!-- writer: agent · reference, uncapped · written 2026-11-16 · every object the telemetry inspector + logger read, captured live in TRUE FORM -->

# inspector rework · 1 · entities

The telemetry panel's two tabs read ~16 objects. Each one below is printed as the panel receives it, from a live client against a booted test world.

## provenance — how every REAL snapshot was taken

One probe boots the ghost test world (`hello.DEMO`: runtime `house`, daemons `hello` + `memo`, stub hallucinator) on a FREE port, builds the client the way `systems/anima/src/client.js:38-46` does, then acts like the operator would.

```sh
# from the repo root · HOME empty · a fresh localStorage origin
# the world binds a free port and is killed at the end
H=$(mktemp -d); DENO_DIR=~/Library/Caches/deno HOME=$H \
  deno run -A --no-check --config deno.jsonc \
  --location "http://inspector-probe-$(date +%s).invalid/" \
  .ikiro/reference/inspector-rework/entities.probe.js
```

```js
// .ikiro/reference/inspector-rework/entities.probe.js — what the probe does before it prints
await terminal.repl.dispatch("/mode srs/memo");
await terminal.repl.dispatch("ciao");
await terminal.repl.dispatch("lookup please --tool srs/lookup --deltas 3");
await terminal.repl.dispatch("break --fault fatal");
await terminal.repl.dispatch("/modes");
await terminal.repl.dispatch("/nonsense");
const buffer = await clientDie.runtime.entities.buffer.create({
  mode: memo.id,
  thread: thread.id,
  data: {},
});
await terminal.setBuffer(buffer);
```

How to read a snapshot:

- `form` (`.ikiro/reference/inspector-rework/form.probe.js`) prints the object itself: every own key, its class name, every prototype getter as `get NAME → value`, a nanostores store as `atom(value)`, a cycle as `[Circular Class id]`. Below the depth asked it prints `Class {…N keys}` · `[…N]`.
- `JSON.stringify` is the object's own `toJSON` — what the wire and `localStorage` carry, NOT what the panel reads.
- A row over 100 chars is cut at 99 with `…`; the probe prints it whole. JWTs are elided. Nothing else is touched.
- Run 2026-11-16, four times; ids and `at` change per run, shapes did not. Every snapshot is from the last run.

Every snapshot here is REAL (the probe above) unless its label says CODE-DERIVED.

## 0 · what the panel reads, and from where

| inspector key | expression the panel runs | site |
|---|---|---|
| `app` | `ambient.app.consume()` | `systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:240` |
| `bridge` | `app.bridge.$viewport` · `$sidebar` · `$hidden` | `telemetry.jsx:253-255` |
| `terminal` | `ambient.terminal.consume()` | `telemetry.jsx:241` |
| `terminals` | `app.client.runtime.entities.terminal.$entities` | `telemetry.jsx:245` |
| `thread` | `terminal.$thread` | `telemetry.jsx:249` |
| `seated` | `terminal.$buffer` | `telemetry.jsx:250` |
| `turns` | `typology.atom.chain(terminal.$thread, "$turns")` | `telemetry.jsx:251` |
| `buffers` | `typology.atom.chain(terminal.$thread, "$buffers")` | `telemetry.jsx:252` |
| `activities` | `app.client.runtime.entities.activity.$entities` | `telemetry.jsx:244`, filtered `:289` |
| `lighthouse` | `runtime.lighthouse.$status` · `$user` · `.manifest.traits` | `telemetry.jsx:247-248`, `:290` |
| `runtime` | `app.client.runtime.$status` | `telemetry.jsx:246` |
| `records` | `app.telemetry.$logger` → `client.controller.stdout.$history` | `telemetry.jsx:243` |
| `daemons` | `app.client.runtime.entities.daemon.$entities` | `telemetry.jsx:257` |
| `modes` | `app.client.runtime.entities.mode.$entities` | `telemetry.jsx:256` |
| local modes | `fromm.modes(app.client.modes).flat` | `telemetry.jsx:310` |
| harness | `harness(app.client.runtime, thread())` · `mode.metadata.harness` | `telemetry.jsx:298`, `trees.js:169` |
| peek | `thread().mode.connection.call("/metadata/harness/primer/…")` | `telemetry.jsx:337-341` |
| repl | `shape.strip(terminal.repl.commands)` | `telemetry.jsx:317` |

Every entity store is one `RemoteRepository.$entities`, handed out by the entity manager (`subsystems/typology/prototypes/remote-repository.js:16-21`). The client wires all of them in one `Dataspace` (`systems/ghost/subjects/client/factory.js:37-41`). Every raw entity passes through its kind's `hydration` Vector (`subsystems/typology/prototypes/dataspace.js:19-25`).

```js
// systems/ghost/subjects/client/factory.js:37
runtime.entities = new Dataspace({
  runtime,
  entities: { daemon: daemonHost, mode, thread: threadProcess, buffer, turn, activity,
    terminal: terminalProcess, view, file, literal, symbol, note },
  seed: (boot) => boot
    .use(shard.context.bind("client", clientDie))
    .use(shard.context.bind("runtime", runtime)),
});
```

## 1 · relations — the graph the panel walks

On the client a relation is an OBJECT REFERENCE, not an id: `integrate` swaps ids for the hydrated instances. The panel compares by identity, `activity.thread === thread()` (`telemetry.jsx:289`).

```
App                                   systems/ghost/subjects/app/prototype.js:4
├─ bridge: Bridge                     …/app/prototypes/bridge.js:4
├─ telemetry: Telemetry ── $logger ─▶ client.controller.stdout.$history  (records)
└─ client: Client                     systems/ghost/subjects/client/prototype.js:19
   ├─ modes {type:{slug: Mode}}       local modes, daemon null, module set
   └─ runtime: Runtime                systems/ghost/entities/runtime/prototype.js:3
      ├─ lighthouse: Lighthouse ── $user (plain object, NOT an entity)
      └─ entities: Dataspace
         ├─ daemon[]  Daemon ──────── modes (getter: mode.daemon === this)
         ├─ mode[]    Mode ─ daemon ─▶ Daemon | null (null = the runtime's own)
         ├─ terminal[] Terminal ─ $thread ─▶ Thread · $buffer ─▶ Buffer · daemon ─▶ Daemon
         ├─ thread[]  Thread ─ mode ─▶ Mode | string (host not mounted) · user = plain object
         │             ├─ $turns      computed: turn.thread === thread, by createdAt
         │             ├─ $buffers    computed: buffer.thread === thread, by index
         │             └─ $activities computed: activity.thread === thread
         ├─ turn[]    Turn ─ thread ─▶ Thread · mode ─▶ Mode · parent ─▶ Turn · user = id string
         ├─ buffer[]  Buffer ─ thread ─▶ Thread · mode ─▶ Mode · user = id string
         └─ activity[] Activity ─ thread ─▶ Thread · mode ─▶ Mode · turn ─▶ Turn ·
                       buffer (undefined in every capture) · user = id string
```

| relation | client value | server (mikro) | site |
|---|---|---|---|
| `thread.mode` | `Mode` · `string` | `m:1` nullable | `subsystems/typology/entities/Thread.ts:101` |
| `thread.user` | `{id, slug, traits, trait, …}` | `m:1` | `Thread.ts:93` |
| `turn.thread` | `Thread` | `m:1` | `subsystems/typology/entities/Turn.ts:93` |
| `turn.parent` | `Turn` · `null` | `m:1` nullable | `Turn.ts:80` |
| `turn.mode` | `Mode` | `m:1` nullable | `Turn.ts:101` |
| `buffer.thread` | `Thread` | `m:1` | `subsystems/typology/entities/Buffer.ts:99` |
| `buffer.mode` | `Mode` | `m:1` nullable | `Buffer.ts:90` |
| `activity.thread` · `.mode` · `.turn` | `Thread` · `Mode` · `Turn` | `m:1` virtual | `subsystems/typology/entities/Activity.ts:147-151` |
| `activity.user` | id `string` | `m:1` virtual | `Activity.ts:147` |
| `terminal.thread` · `.buffer` | via `$thread` · `$buffer` atoms | `m:1` nullable | `subsystems/typology/entities/Terminal.ts:42-50` |
| `terminal.daemon` | `Daemon` | `m:1` nullable | `Terminal.ts:42` |
| `mode.daemon` | `Daemon` · `null` | `m:1` | `subsystems/typology/entities/Mode.ts:21` |

The thread's live collections are COMPUTED on the client, never the mikro collections (those arrive as `buffers: []` · `turns: []` · `children: []` and stay empty):

```js
// systems/ghost/entities/thread/hydration.js:4
export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.trait = belt.traits.cast(ctx.entity, v.thread.traits);
  ctx.entity.$buffers = computed(ctx.runtime.entities.buffer.$entities, (buffers) =>
    buffers
      .filter((buffer) => buffer.thread === ctx.entity)
      .sort((first, second) => first.index - second.index));
  ctx.entity.$phase = computed(ctx.runtime.entities.thread.$entities, () => ctx.entity.phase);
  ctx.entity.$turns = computed(ctx.runtime.entities.turn.$entities, (turns) =>
    turns
      .filter((turn) => turn.thread === ctx.entity)
      .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt)));
  ctx.entity.$activities = computed(ctx.runtime.entities.activity.$entities, (activities) =>
    activities.filter((activity) => activity.thread === ctx.entity));
});
```

## 2 · traits — what is CAST at hydration

`belt.traits.cast(entity, vocabulary)` fills every declared trait from its schema default and throws only on a trait the entity WEARS that fails (`subsystems/typology/gestalten/belt/traits.js:26-33`). So `trait` carries every key of the vocabulary, `traits` only the worn names.

| entity | vocabulary | cast at | trait schemas |
|---|---|---|---|
| Thread | `v.thread.traits` | `systems/ghost/entities/thread/hydration.js:6` | `LABELED` `INTELLIGENT` `VOCAL` `AIMED` `MASKED` `QUEUEING` |
| Buffer | `v.buffer.traits` | `systems/ghost/entities/buffer/hydration.js:5` | `LABELED` `RENDERED` |
| Terminal | `v.traits.terminal` | `systems/ghost/subjects/terminal/hydration.js:7` | `LABELED` `DOCKED` |
| User | `v.user.traits` | `systems/ghost/entities/lighthouse/prototype.js:39,70,91` | `HOME` `DOCKED` `THEMED` |
| Mode | none cast; `traits` dispatch mode trait functions | `systems/ghost/entities/mode/traits/index.js:1-5` | `EXPOSED` `HARNESSED` `KEYMAPPED` `LOOPING` `REPLING` (+ flags) |
| Lighthouse | `manifest.traits` names only | `systems/ghost/subjects/client/factory.js:29` | `JOINABLE` `INVITATIONAL` `AUTOLOGIN` |
| Daemon · Turn · Activity | none | — | — |

The vocabularies, verbatim:

```js
// subsystems/typology/schematics/traits/index.js:37
export const thread = v.object({
  LABELED: Label.default({}).optional()
    .desc("its name, read in the chrome"),
  INTELLIGENT: Intelligent.default({}).optional()
    .desc("which model answers its turns, with what budget"),
  VOCAL: Vocal.default({}).optional()
    .desc("audio: its turns are spoken — language, voice, harmonizing, polish"),
  AIMED: Aimed.default({}).optional()
    .desc("the emitter route it pulls buffers from"),
  MASKED: Masked.default({}).optional()
    .desc("fields merged into every pull"),
  QUEUEING: Queueing.default({}).optional()
    .desc("how many buffers it keeps queued ahead"),
});
// subsystems/typology/schematics/traits/index.js:45
export const buffer = v.object({
  LABELED: Label.default({}).optional()
    .desc("its name, read on its tab"),
  RENDERED: Rendered.default({}).optional()
    .desc("which views draw it: one in the frame, one as its cell"),
});
// subsystems/typology/schematics/traits/index.js:53
export const terminal = v.object({
  LABELED: Label.default({}).optional()
    .desc("its name, read in the chrome"),
  DOCKED: Docked.default({}).optional()
    .desc("how its dock sits: side, share, view, lens, markdown"),
});
// subsystems/typology/schematics/traits/index.js:57
export const user = v.object({
  HOME: Home.default({}).optional()
    .desc("the mode a terminal with no thread sits in"),
  DOCKED: Docked.default({}).optional()
    .desc("how the dock sits for this user"),
  THEMED: Themed.default("porcelain").optional()
    .desc("the dapper theme"),
});
// .example(…) on every row elided here
```

```js
// subsystems/typology/schematics/traits/intelligent.js:4
export const Intelligent = v.object({
  ...Selector,
  tier: Tier.default("capable").desc('The model tier. Example: "fast"'),
  effort: v.enum(["none", "low", "medium", "high"]).default("low")
    .desc('Reasoning effort. Example: "high"'),
  rounds: v.integer({ minimum: 1, maximum: 100 }).default(12).desc("The round budget. Example: 12"),
  thinking: v.boolean().optional(),
});
// subsystems/typology/schematics/traits/docked.js:3
export const Docked = v.object({
  align: v.enum(["left", "right", "top", "bottom"]).optional(),
  share: v.number({ minimum: 0.1, maximum: 0.9 }).optional(),
  view: v.enum(["docked", "full", "closed", "messenger"]).optional(),
  shown: v.enum(["docked", "full", "messenger"]).optional(),
  lens: v.array(v.enum(["turns", "harness", "repl"]), { uniqueItems: true }).optional(),
  markdown: v.enum(["pretty", "plain"]).optional(),
}, { additionalProperties: false });
// subsystems/typology/schematics/traits/queueing.js:3 · rendered.js:3 · primitives/label.js:3
export const Queueing = v.object({ depth: v.integer({ minimum: 1 }).default(1) });
export const Rendered = v.object({ frame: v.string().optional(), cell: v.string().optional() }, …);
export const Label = v.object(
  { name: v.string(), description: v.string().optional() },
  { $id: "Label" },
);
```

The full JSON Schema of the thread vocabulary is snapshotted at `subsystems/typology/tests/snapshots/trait-thread.snapshot.json` (6872 chars, schema, not an instance).

## 3 · app — `App`

Source: `systems/ghost/subjects/app/prototype.js:4-18`; built at `systems/anima/src/client.js:41`. `app.theme` is a getter: bridge theme, else the client mask's `THEMED`, else the user's `THEMED` (`prototype.js:16-18`).

```js
App {
  client: Client {
    controller: Controller {…8 keys},
    instance: Instance {…15 keys},
    mask: {…6 keys},
    register: {…4 keys},
    app: [Circular App],
    modes: {…1 keys},
    aperture: Aperture {…4 keys},
    looping: ƒ anonymous,
    runtime: Runtime {…13 keys},
    get user → {…4 keys},
    get json → {…2 keys}
  },
  surface: null,
  controller: Controller {
    children: Set {…0 keys},
    gate: {…2 keys},
    stdout: Span {…13 keys},
    stdin: Vector {…4 keys},
    abort: AbortController {…0 keys},
    parent: Controller {…8 keys},
    status: Status {…1 keys},
    settled: Promise
  },
  box: Box {
    drivers: {…1 keys},
    device: {…2 keys},
    app: [Circular App]
  },
  bridge: Bridge {
    "$terminal": atom(null),
    "$viewport": atom({…3 keys}),
    "$focus": atom("dock.input"),
    "$focusHistory": atom([…0]),
    "$sidebar": atom({…2 keys}),
    "$draft": atom(""),
    "$selected": atom(0),
    "$hidden": atom([…0]),
    "$theme": atom(null),
    "$font": atom("base"),
    "$popover": atom(null),
    "$phonePane": atom("dock"),
    "$widget": atom(null),
    "$float": atom({…0 keys}),
    "$selection": atom(null),
    "$signin": atom({…2 keys}),
    "$sections": atom({…6 keys}),
    get terminal → null,
    get viewport → {…3 keys},
    get focus → "dock.input",
    get focusHistory → […0],
    get sidebar → {…2 keys},
    get draft → "",
    get selected → 0,
    get hidden → […0],
    get theme → null,
    get font → "base",
    get popover → null,
    get phonePane → "dock",
    get widget → null,
    get float → {…0 keys},
    get selection → null,
    get signin → {…2 keys},
    get sections → {…6 keys}
  },
  telemetry: Telemetry {
    "$state": atom({…6 keys}),
    app: [Circular App],
    get state → {…6 keys},
    get $logger → atom([…45])
  },
  get theme → "porcelain"
}
```

### 3.1 · `app.bridge` — `Bridge`

Source: `systems/ghost/subjects/app/prototypes/bridge.js:4-21`. The panel reads `viewport().narrow`, `sidebar().open`, `hidden()` (`telemetry.jsx:282`). `$terminal` · `$theme` · `$font` are `persistentAtom` → `localStorage`: on a first run with a stale origin the probe saw `$terminal: "t1"` read from THIS MACHINE; the capture below uses a fresh origin.

```js
Bridge {
  "$terminal": atom(null),
  "$viewport": atom({
      width: null,
      height: null,
      narrow: false
    }),
  "$focus": atom("dock.input"),
  "$focusHistory": atom([]),
  "$sidebar": atom({
      open: false,
      width: 39
    }),
  "$draft": atom(""),
  "$selected": atom(0),
  "$hidden": atom([]),
  "$theme": atom(null),
  "$font": atom("base"),
  "$popover": atom(null),
  "$phonePane": atom("dock"),
  "$widget": atom(null),
  "$float": atom({}),
  "$selection": atom(null),
  "$signin": atom({
      user: "",
      pass: ""
    }),
  "$sections": atom({
      filter: {…0 keys},
      expand: {…0 keys},
      peeks: {…0 keys},
      pick: null,
      hostsOff: {…2 keys},
      traits: {…2 keys}
    }),
  get terminal → null,
  get viewport → {
    width: null,
    height: null,
    narrow: false
  },
  get focus → "dock.input",
  get focusHistory → [],
  get sidebar → {
    open: false,
    width: 39
  },
  get draft → "",
  get selected → 0,
  get hidden → [],
  get theme → null,
  get font → "base",
  get popover → null,
  get phonePane → "dock",
  get widget → null,
  get float → {},
  get selection → null,
  get signin → {
    user: "",
    pass: ""
  },
  get sections → {
    filter: {…0 keys},
    expand: {…0 keys},
    peeks: {…0 keys},
    pick: null,
    hostsOff: {…2 keys},
    traits: {…2 keys}
  }
}
```

### 3.2 · `app.telemetry` — `Telemetry`

Source: `systems/ghost/subjects/app/prototypes/telemetry.js:3-20`. `$state` is a `persistentAtom` under `viva.telemetry.state`. `$logger` IS `client.controller.stdout.$history` (`telemetry.js:18-20`).

```js
Telemetry {
  "$state": atom({
      open: false,
      view: "logger",
      filter: "all",
      selection: null,
      since: 0,
      window: {…4 keys}
    }),
  app: App {
    client: Client {…9 keys},
    surface: null,
    controller: Controller {…8 keys},
    box: Box {…3 keys},
    bridge: Bridge {…17 keys},
    telemetry: [Circular Telemetry],
    get theme → "porcelain"
  },
  get state → {
    open: false,
    view: "logger",
    filter: "all",
    selection: null,
    since: 0,
    window: {…4 keys}
  },
  get $logger → atom([
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      {…4 keys},
      …(+21)
    ])
}
```

The ghost default above lacks `point` · `folds` · `picked` · `queries` · `peeks`, which `telemetry.jsx:96` and `trees.js:240-242` read with `Object.hasOwn(…)`. Anima seeds them on mount — CODE-DERIVED from `systems/anima/src/surfaces/chrome/mount.jsx:60-69`:

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
// → as anima's panel sees it, first mount (WINDOW = telemetry.jsx:17)
{ open: false, view: "logger", filter: "all", selection: null, since: 0,
  window: { x: 0, y: 48, width: 600, height: 420 },
  point: "client", folds: {}, picked: {}, queries: {}, peeks: {} }
```

### 3.3 · `app.client` — `Client`

Source: `systems/ghost/subjects/client/prototype.js:19-52`; built by `ghost.client.factory` (`systems/ghost/subjects/client/factory.js:46-57`). The panel reads `client.mask.manifest.slug` · `.type` (`telemetry.jsx:173`). In this rig the mask is `ghost`; anima's is `anima` (`systems/anima/src/client.js:12`).

```js
Client {
  controller: Controller {
    children: Set {…0 keys},
    gate: {…2 keys},
    stdout: Span {…13 keys},
    stdin: Vector {…4 keys},
    abort: AbortController {…0 keys},
    parent: Controller {…8 keys},
    status: Status {…1 keys},
    settled: Promise
  },
  instance: Instance {
    manifest: {…4 keys},
    environment: {…4 keys},
    runtime: {…8 keys},
    lighthouse: {…3 keys},
    datamap: {…2 keys},
    hallucinators: […1],
    clients: […1],
    services: […0],
    daemons: […2],
    requirements: […4],
    faults: […0],
    dormant: […0],
    inherited: […0],
    paladin: Paladin {…26 keys},
    raw: {…9 keys},
    get processes → […2],
    get home → Path {…2 keys}
  },
  mask: {
    manifest: {…3 keys},
    trait: {…1 keys},
    modes: […1],
    reference: Path {…2 keys},
    statics: {…0 keys},
    terminators: […1]
  },
  register: {
    hallucinators: […0],
    consume: {…0 keys},
    modes: […1],
    domain: {…2 keys}
  },
  app: App {
    client: [Circular Client],
    surface: null,
    controller: Controller {…8 keys},
    box: Box {…3 keys},
    bridge: Bridge {…17 keys},
    telemetry: Telemetry {…2 keys},
    get theme → "porcelain"
  },
  modes: {
    home: {…1 keys}
  },
  aperture: Aperture {
    effect: null,
    trie: Map {…0 keys},
    carry: […0],
    signature: ƒ Pattern,
    get patterns → […1],
    get descendants → […1],
    get root → [Circular Aperture],
    get heir → Aperture {…5 keys}
  },
  looping: ƒ anonymous,
  runtime: Runtime {
    type: "runtime",
    manifest: {…1 keys},
    reference: Path {…2 keys},
    remote: Url {…4 keys},
    metadata: {…3 keys},
    multiplex: ƒ transport,
    connection: Connection {…6 keys},
    aperture: Connection {…6 keys},
    call: {…6 keys},
    cortex: Cortex {…2 keys},
    lighthouse: Lighthouse {…8 keys},
    entities: Dataspace {…15 keys},
    "$status": atom({…1 keys}),
    get status → {…1 keys},
    get modes → […1],
    get attach → Connection {…6 keys},
    get json → {…4 keys}
  },
  get user → {
    id: "01a1e526-9364-7030-9fec-6a891be3df69",
    slug: "localhost",
    traits: […0],
    trait: {…3 keys}
  },
  get json → {
    mask: {…6 keys},
    modes: […1]
  }
}
```

```js
{
  manifest: {
    type: "client",
    slug: "ghost",
    traits: [
      "HOME"
    ]
  },
  trait: {
    HOME: {
      reference: "/runtime/house/mode/home/probe"
    }
…(+166 rows, the probe prints them)
```

## 4 · terminal — `Terminal`

| | |
|---|---|
| prototype | `systems/ghost/subjects/terminal/prototype.js:8-67` |
| hydration | `systems/ghost/subjects/terminal/hydration.js:3-11` |
| repository | `systems/ghost/subjects/terminal/repository.js:4` → `/userspace/entities/terminal` |
| mikro | `subsystems/typology/entities/Terminal.ts:18` · schema `:28` |
| schematic | `subsystems/typology/schematics/entities/terminal.js:5` |

The panel reads `terminal.dock.view` · `.align` · `.share` · `.lens` (`telemetry.jsx:189-195`) and `terminals.indexOf(terminal)` (`:191`). `dock` is a getter merging four layers:

```js
// systems/ghost/subjects/terminal/prototype.js:43
get dock() {
  return { ...belt.dock.DEFAULT_DOCK, ...this.client.mask.trait.DOCKED,
    ...this.client.runtime.lighthouse.user.trait.DOCKED, ...this.trait.DOCKED };
}
```

```js
Terminal {
  id: "01a1e526-9378-72b8-bc44-efbeea92ce23",
  user: "01a1e526-9364-7030-9fec-6a891be3df69",
  daemon: Daemon {
    type: "daemon",
    id: "memo",
    slug: "memo",
    reference: Path {…2 keys},
    manifest: {…4 keys},
    metadata: {…3 keys},
    entities: {…4 keys},
    connection: Connection {…6 keys},
    aperture: Connection {…6 keys},
    call: {…13 keys},
    cortex: Cortex {…2 keys},
    "$status": atom({…1 keys}),
    mask: {…3 keys},
    traits: […0],
    trait: {…0 keys},
    createdAt: "2026-11-16T16:17:53.024Z",
    updatedAt: "2026-11-16T16:17:53.024Z",
    "$modes": atom([…3]),
    "$literals": atom([…0]),
    "$symbols": atom([…0]),
    "$notes": atom([…0]),
    get status → {…1 keys},
    get modes → […3]
  },
  index: 0,
  traits: [],
  trait: {},
  client: Client {
    controller: Controller {…8 keys},
    instance: Instance {…15 keys},
    mask: {…6 keys},
    register: {…4 keys},
    app: App {…6 keys},
    modes: {…1 keys},
    aperture: Aperture {…4 keys},
    looping: ƒ anonymous,
    runtime: Runtime {…13 keys},
    get user → {…4 keys},
    get json → {…2 keys}
  },
  repository: RemoteRepository {
    schema: {…0 keys},
    subscriptions: Set {…0 keys},
    kind: ƒ Terminal,
    connection: Connection {…6 keys},
    entityManager: RemoteEntityManager {…12 keys},
    managedName: "terminal",
    "$entities": atom([…1])
  },
  controller: Controller {
    children: Set {…0 keys},
    gate: {…2 keys},
    stdout: Span {…13 keys},
    stdin: Vector {…4 keys},
    abort: AbortController {…0 keys},
    parent: Controller {…8 keys},
    status: Status {…1 keys},
    settled: Promise
  },
  repl: Repl {
    "$catalog": atom(null),
    terminal: [Circular Terminal 01a1e526-9378-72b8-bc44-efbeea92ce23],
    get catalog → null,
    get commands → Vector {…4 keys}
  },
  legend: Legend {
    presses: Queue {…3 keys},
    "$chord": atom(null),
    terminal: [Circular Terminal 01a1e526-9378-72b8-bc44-efbeea92ce23],
    get chord → null,
    get translation → Vector {…4 keys},
    get keymap → Vector {…4 keys}
  },
  stall: Stall {
    refilling: Promise,
    terminal: [Circular Terminal 01a1e526-9378-72b8-bc44-efbeea92ce23],
    get $buffers → atom([…1]),
    get $buffer → atom(Buffer {…24 keys}),
    get $phase → atom("manual")
  },
  "$thread": atom(Thread {
      id: "01a1e526-970c-723d-81bd-f6d81c47d9ec",
      user: {…6 keys},
      mode: Mode {…29 keys},
      phase: "manual",
      traits: […2],
      trait: {…6 keys},
      createdAt: "2026-11-16T16:17:53.932Z",
      updatedAt: "2026-11-16T16:17:55.584Z",
      counter: 1,
      buffers: […0],
      turns: […0],
      children: […0],
      "$buffers": atom([…1]),
      "$turns": atom([…8]),
      "$children": atom([…0]),
      "$phase": atom("manual"),
      "$activities": atom([…0]),
      intent: null,
      parent: null,
      get word → "memo",
      get activities → […0]
    }),
  "$buffer": atom(Buffer {
      "$views": atom([…0]),
      "$files": atom([…0]),
      "$data": atom({…0 keys}),
      "$bundle": atom(null),
      "$traits": atom([…1]),
      "$trait": atom({…2 keys}),
      "$label": atom({…1 keys}),
      context: null,
      hooks: {…3 keys},
      on: {…3 keys},
      id: "01a1e526-9d80-73eb-adec-710370980cd6",
      createdAt: "2026-11-16T16:17:55.584Z",
      updatedAt: "2026-11-16T16:17:55.584Z",
      status: "PENDING",
      mime: "application/json",
      turns: […0],
      notes: […0],
      index: 0,
      mode: Mode {…29 keys},
      thread: Thread {…19 keys},
      literals: […0],
      symbols: […0],
      user: "01a1e526-9364-7030-9fec-6a891be3df69",
      "$notes": atom([…0]),
      get views → […0],
      get files → […0],
      get data → {…0 keys},
      get bundle → null,
      get traits → […1],
      get trait → {…2 keys},
      get label → {…1 keys}
    }),
  createdAt: "2026-11-16T16:17:53.016Z",
  updatedAt: "2026-11-16T16:17:55.594Z",
  get thread → Thread {
    id: "01a1e526-970c-723d-81bd-f6d81c47d9ec",
    user: {…6 keys},
    mode: Mode {…29 keys},
    phase: "manual",
    traits: […2],
    trait: {…6 keys},
    createdAt: "2026-11-16T16:17:53.932Z",
    updatedAt: "2026-11-16T16:17:55.584Z",
    counter: 1,
    buffers: […0],
    turns: […0],
    children: […0],
    "$buffers": atom([…1]),
    "$turns": atom([…8]),
    "$children": atom([…0]),
    "$phase": atom("manual"),
    "$activities": atom([…0]),
    intent: null,
    parent: null,
    get word → "memo",
    get activities → […0]
  },
  get word → "memo",
  get mode → Mode {
    type: "srs",
    slug: "memo",
    name: "Memo",
    description: "Spaced-repetition flashcards on SM-2: drill in the frame (tab reveals, 1 again · …
    version: "0.1.0",
    traits: […7],
    daemon: Daemon {…21 keys},
    reference: Path {…3 keys},
    module: null,
    status: Status {…1 keys},
    stdout: Span {…12 keys},
    repl: Vector {…4 keys},
    keymap: Vector {…4 keys},
    metadata: {…2 keys},
    connection: Connection {…6 keys},
    call: {…8 keys},
    harness: {…5 keys},
    id: "01a1e526-949d-758b-bc36-2b0483866569",
    createdAt: "2026-11-16T16:17:53.309Z",
    updatedAt: "2026-11-16T16:17:53.309Z",
    installed: "91a07b3c",
    "$buffers": atom([…1]),
    "$turns": atom([…8]),
    "$views": atom([…2]),
    "$literals": atom([…0]),
    "$symbols": atom([…0]),
    "$notes": atom([…0]),
    "$files": atom([…0]),
    entities: {…8 keys},
    get manifest → {…6 keys}
  },
  get buffer → Buffer {
    "$views": atom([…0]),
    "$files": atom([…0]),
    "$data": atom({…0 keys}),
    "$bundle": atom(null),
    "$traits": atom([…1]),
    "$trait": atom({…2 keys}),
    "$label": atom({…1 keys}),
    context: null,
    hooks: {…3 keys},
    on: {…3 keys},
    id: "01a1e526-9d80-73eb-adec-710370980cd6",
    createdAt: "2026-11-16T16:17:55.584Z",
    updatedAt: "2026-11-16T16:17:55.584Z",
    status: "PENDING",
    mime: "application/json",
    turns: […0],
    notes: […0],
    index: 0,
    mode: Mode {…29 keys},
    thread: Thread {…19 keys},
    literals: […0],
    symbols: […0],
    user: "01a1e526-9364-7030-9fec-6a891be3df69",
    "$notes": atom([…0]),
    get views → […0],
    get files → […0],
    get data → {…0 keys},
    get bundle → null,
    get traits → […1],
    get trait → {…2 keys},
    get label → {…1 keys}
  },
  get dock → {
    align: "right",
    share: 0.38,
    view: "full",
    shown: "full",
    lens: […2],
    markdown: "pretty"
  }
}
```

```json
{
  "id": "01a1e526-9378-72b8-bc44-efbeea92ce23",
  "user": "01a1e526-9364-7030-9fec-6a891be3df69",
  "index": 0,
  "traits": [],
  "trait": {},
  "createdAt": "2026-11-16T16:17:53.016Z",
  "updatedAt": "2026-11-16T16:17:55.594Z",
  "daemon": "memo",
  "thread": "01a1e526-970c-723d-81bd-f6d81c47d9ec",
  "buffer": "01a1e526-9d80-73eb-adec-710370980cd6"
}
```

`terminals` — the whole list, depth 0:

```js
[
  Terminal {…16 keys}
]
```

## 5 · thread — `Thread`

| | |
|---|---|
| prototype | `systems/ghost/entities/thread/prototype.js:10-31` |
| hydration | `systems/ghost/entities/thread/hydration.js:4-11` |
| repository | `systems/ghost/entities/thread/repository.js:4` → `/userspace/entities/thread` |
| mikro | `subsystems/typology/entities/Thread.ts:24` · schema `:50` |
| schematic | `subsystems/typology/schematics/entities/thread.js:5` |

The panel reads `thread.word` · `thread.mode` (via `reference(mode)`, `sections.js:9`) · `thread.traits` · `thread.trait.INTELLIGENT` (via `harness`, `sections.js:42-58`). `word` is a discriminator table:

```js
// systems/ghost/entities/thread/prototype.js:3
const WORD = [
  [(thread) => thread.traits.includes("LABELED"), (thread) => thread.trait.LABELED.name],
  [(thread) => thread.mode === null, () => "thread"],
  [(thread) => is.string(thread.mode), (thread) => thread.mode.split("/").at(-1)],
  [() => true, (thread) => thread.mode.slug],
];
```

The terminal's thread on HOME, before `/mode srs/memo` (depth 1):

```js
Thread {
  id: "01a1e526-970c-723d-81bd-f6d81c47d9ec",
  user: {
    id: "01a1e526-9364-7030-9fec-6a891be3df69",
    createdAt: "2026-11-16T16:17:52.996Z",
    updatedAt: "2026-11-16T16:17:53.856Z",
    slug: "localhost",
    traits: […0],
    trait: {…0 keys}
  },
  mode: Mode {
    type: "home",
    slug: "probe",
    name: null,
    description: null,
    version: "0.0.1",
    traits: […4],
    daemon: null,
    reference: Path {…3 keys},
    module: null,
    status: Status {…1 keys},
    stdout: Span {…12 keys},
    repl: Vector {…4 keys},
    keymap: Vector {…4 keys},
    metadata: {…1 keys},
    connection: Connection {…6 keys},
    call: {…3 keys},
    harness: null,
    id: "01a1e526-9372-727f-a531-4c6aba81dcf3",
    createdAt: "2026-11-16T16:17:53.010Z",
    updatedAt: "2026-11-16T16:17:53.010Z",
    installed: "91a07b3c",
    "$buffers": atom([…0]),
    "$turns": atom([…0]),
    "$views": atom([…0]),
    "$literals": atom([…0]),
    "$symbols": atom([…0]),
    "$notes": atom([…0]),
    "$files": atom([…0]),
    entities: {…8 keys},
    get manifest → {…6 keys}
  },
  phase: "manual",
  traits: [
    "INTELLIGENT",
    "VOCAL"
  ],
  trait: {
    LABELED: {…0 keys},
    INTELLIGENT: {…3 keys},
    VOCAL: {…0 keys},
    AIMED: {…0 keys},
    MASKED: {…0 keys},
    QUEUEING: {…1 keys}
  },
  createdAt: "2026-11-16T16:17:53.932Z",
  updatedAt: "2026-11-16T16:17:53.932Z",
  counter: 0,
  buffers: [],
  turns: [],
  children: [],
  "$buffers": atom([]),
  "$turns": atom([]),
  "$children": atom([]),
  "$phase": atom("manual"),
  "$activities": atom([]),
  get word → "probe",
  get activities → []
}
```

The same thread after `/mode srs/memo` — `/mode` MOVES the seated thread (same `id`) onto memo:

```js
Thread {
  id: "01a1e526-970c-723d-81bd-f6d81c47d9ec",
  user: {
    id: "01a1e526-9364-7030-9fec-6a891be3df69",
    createdAt: "2026-11-16T16:17:52.996Z",
    updatedAt: "2026-11-16T16:17:53.856Z",
    slug: "localhost",
    traits: […0],
    trait: {…0 keys}
  },
  mode: Mode {
    type: "srs",
    slug: "memo",
    name: "Memo",
    description: "Spaced-repetition flashcards on SM-2: drill in the frame (tab reveals, 1 again · …
    version: "0.1.0",
    traits: […7],
    daemon: Daemon {…21 keys},
    reference: Path {…3 keys},
    module: null,
    status: Status {…1 keys},
    stdout: Span {…12 keys},
    repl: Vector {…4 keys},
    keymap: Vector {…4 keys},
    metadata: {…2 keys},
    connection: Connection {…6 keys},
    call: {…8 keys},
    harness: {…5 keys},
    id: "01a1e526-949d-758b-bc36-2b0483866569",
    createdAt: "2026-11-16T16:17:53.309Z",
    updatedAt: "2026-11-16T16:17:53.309Z",
    installed: "91a07b3c",
    "$buffers": atom([…1]),
    "$turns": atom([…8]),
    "$views": atom([…2]),
    "$literals": atom([…0]),
    "$symbols": atom([…0]),
    "$notes": atom([…0]),
    "$files": atom([…0]),
    entities: {…8 keys},
    get manifest → {…6 keys}
  },
  phase: "manual",
  traits: [
    "INTELLIGENT",
    "VOCAL"
  ],
  trait: {
    LABELED: {…0 keys},
    INTELLIGENT: {…3 keys},
    VOCAL: {…0 keys},
    AIMED: {…0 keys},
    MASKED: {…0 keys},
    QUEUEING: {…1 keys}
  },
  createdAt: "2026-11-16T16:17:53.932Z",
  updatedAt: "2026-11-16T16:17:55.584Z",
  counter: 1,
  buffers: [],
  turns: [],
  children: [],
  "$buffers": atom([
      Buffer {…24 keys}
    ]),
  "$turns": atom([
      Turn {…15 keys},
      Turn {…13 keys},
      Turn {…15 keys},
      Turn {…13 keys},
      Turn {…15 keys},
      Turn {…13 keys},
      Turn {…15 keys},
      Turn {…15 keys}
    ]),
  "$children": atom([]),
  "$phase": atom("manual"),
  "$activities": atom([]),
  intent: null,
  parent: null,
  get word → "memo",
  get activities → []
}
```

```json
{
  "id": "01a1e526-970c-723d-81bd-f6d81c47d9ec",
  "user": {
    "id": "01a1e526-9364-7030-9fec-6a891be3df69",
    "createdAt": "2026-11-16T16:17:52.996Z",
    "updatedAt": "2026-11-16T16:17:53.856Z",
    "slug": "localhost",
    "traits": [],
    "trait": {}
  },
  "phase": "manual",
  "traits": [
    "INTELLIGENT",
    "VOCAL"
  ],
  "trait": {
    "LABELED": {},
    "INTELLIGENT": {
      "tier": "capable",
      "effort": "low",
      "rounds": 12
    },
    "VOCAL": {},
    "AIMED": {},
    "MASKED": {},
    "QUEUEING": {
      "depth": 1
    }
  },
  "createdAt": "2026-11-16T16:17:53.932Z",
  "updatedAt": "2026-11-16T16:17:55.584Z",
  "counter": 1,
  "buffers": [],
  "turns": [],
  "children": [],
  "intent": null,
  "parent": null,
  "mode": "01a1e526-949d-758b-bc36-2b0483866569"
}
```

`thread.trait` — cast, the whole vocabulary filled though `traits` wears two:

```js
{
  LABELED: {},
  INTELLIGENT: {
    tier: "capable",
    effort: "low",
    rounds: 12
  },
  VOCAL: {},
  AIMED: {},
  MASKED: {},
  QUEUEING: {
    depth: 1
  }
}
```

## 6 · turns — `Turn[]`

| | |
|---|---|
| prototype | `systems/ghost/entities/turn/prototype.js:3-10` |
| hydration | `systems/ghost/entities/turn/hydration.js:3` (empty Vector) |
| repository | `systems/ghost/entities/turn/repository.js:4` → `/userspace/entities/turn` |
| mikro | `subsystems/typology/entities/Turn.ts:46` · schema `:62` · `history`/`chain` `:14-23` |
| schematic | `subsystems/typology/schematics/entities/turn.js:4` |

The inspector reads only `turns.length` (`telemetry.jsx:210`). Eight turns landed: `ciao` · a tool round · a fatal fault. Each turn at depth 0, then its `parts` · `meta` · `parent` in full:

```js
Turn {
  role: "user",
  parts: […1],
  meta: null,
  thread: Thread {…19 keys},
  mode: Mode {…29 keys},
  parent: null,
  id: "5a9c21b0-4e75-4bc8-aba9-7a9e39766434",
  createdAt: "2026-11-16T16:17:53.969Z",
  updatedAt: "2026-11-16T16:17:53.969Z",
  children: […0],
  buffers: […0],
  notes: […0],
  user: "01a1e526-9364-7030-9fec-6a891be3df69",
  "$children": atom([…1]),
  "$notes": atom([…0])
}
```

```js
Turn {
  role: "assistant",
  parts: […1],
  meta: {…2 keys},
  thread: Thread {…19 keys},
  mode: Mode {…29 keys},
  parent: Turn {…15 keys},
  id: "01a1e526-973d-76af-8b27-0c9b45a568c4",
  "$children": atom([…1]),
  "$notes": atom([…0]),
  createdAt: "2026-11-16T16:17:53.981Z",
  updatedAt: "2026-11-16T16:17:53.981Z",
  buffers: […0],
  user: "01a1e526-9364-7030-9fec-6a891be3df69"
}
```

```js
{
  parts: [
    {
      type: "text",
      text: "ciao"
    }
  ],
  meta: null,
  parent: null
}
```

```js
{
  parts: [
    {
      type: "text",
      text: "[stub] ciao."
    }
  ],
  meta: {
    usage: {
      input: 10,
      output: 11
    },
    state: "complete"
  },
  parent: "5a9c21b0-4e75-4bc8-aba9-7a9e39766434"
}
```

```js
{
  parts: [
    {
      type: "text",
      text: "lookup please --tool srs/lookup --deltas 3"
    }
  ],
  meta: null,
  parent: "01a1e526-973d-76af-8b27-0c9b45a568c4"
}
```

```js
{
  parts: [
    {
      type: "tool_use",
      id: "stub-0",
      name: "srs_lookup",
      input: {
        query: "lookup please --tool srs/lookup --deltas 3"
      }
    }
  ],
  meta: {
    state: "tools"
  },
  parent: "3827d984-859f-44e8-b77d-c28f5439b118"
}
```

```js
{
  parts: [
    {
      type: "tool_result",
      id: "stub-0",
      condition: "ERROR",
      output: {
        message: "Validation failed: must have required properties search"
      }
    }
  ],
  meta: null,
  parent: "01a1e526-9951-72ed-9847-9e3aea4f637f"
}
```

```js
{
  parts: [
    {
      type: "text",
      text: "[stub] lookup please"
    }
  ],
  meta: {
    usage: {
      input: 10,
      output: 20
    },
    state: "complete"
  },
  parent: "01a1e526-99a9-7163-a926-d9c61034e722"
}
```

```js
{
  parts: [
    {
      type: "text",
      text: "break --fault fatal"
    }
  ],
  meta: null,
  parent: "01a1e526-99ab-75fa-af8c-13a0fef467fe"
}
```

```js
{
  parts: [],
  meta: {
    state: "error",
    rounds: 1,
    fault: {
      kind: "unknown",
      message: "[stub] scripted fatal fault"
    }
  },
  parent: "4a02485b-d687-4fad-81e8-2b4d987844f8"
}
```

A user turn's id is a UUID v4 (`turns[0]` above); an assistant turn's a UUID v7 (`01a1…`). `Turn` has no `toJSON`, so `Entity.toJSON` (`subsystems/typology/prototypes/entity.js:2-23`) keeps the `$children` atom and its value — the whole chain nests under the first turn:

```json
{
  "role": "user",
  "parts": [
    {
      "type": "text",
      "text": "ciao"
    }
  ],
  "meta": null,
  "parent": null,
  "id": "5a9c21b0-4e75-4bc8-aba9-7a9e39766434",
  "createdAt": "2026-11-16T16:17:53.969Z",
  "updatedAt": "2026-11-16T16:17:53.969Z",
  "children": [],
  "buffers": [],
  "notes": [],
  "user": "01a1e526-9364-7030-9fec-6a891be3df69",
  "$children": {
    "lc": 0,
    "value": [
      {
        "role": "assistant",
        "parts": [
          {
            "type": "text",
            "text": "[stub] ciao."
          }
        ],
        "meta": {
          "usage": {
            "input": 10,
            "output": 11
          },
          "state": "complete"
        },
        "id": "01a1e526-973d-76af-8b27-0c9b45a568c4",
        "$children": {
          "lc": 0,
          "value": [
            {
…(+330 rows, the probe prints them)
```

## 7 · buffers · seated — `Buffer`

| | |
|---|---|
| prototype | `systems/ghost/entities/buffer/prototype.js:4-96` |
| hydration | `systems/ghost/entities/buffer/hydration.js:3-7` |
| repository | `systems/ghost/entities/buffer/repository.js:4-7` → `/userspace/entities/buffer` |
| mikro | `subsystems/typology/entities/Buffer.ts:40` · schema `:60` · `LABELED` twitch `:127-132` |
| schematic | `subsystems/typology/schematics/entities/buffer.js:6` |

The panel reads `buffers.length` and `named(seated)` = `buffer.trait.LABELED.name` (`sections.js:11`, `telemetry.jsx:220`). Every field is a store with a getter (`prototype.js:5-56`); the label is minted server-side as `<mode slug> #<index>` (`Buffer.ts:131`).

```js
[
  Buffer {
    "$views": atom([…0]),
    "$files": atom([…0]),
    "$data": atom({…0 keys}),
    "$bundle": atom(null),
    "$traits": atom([…1]),
    "$trait": atom({…2 keys}),
    "$label": atom({…1 keys}),
    context: null,
    hooks: {…3 keys},
    on: {…3 keys},
    id: "01a1e526-9d80-73eb-adec-710370980cd6",
    createdAt: "2026-11-16T16:17:55.584Z",
    updatedAt: "2026-11-16T16:17:55.584Z",
    status: "PENDING",
    mime: "application/json",
    turns: […0],
    notes: […0],
    index: 0,
    mode: Mode {…29 keys},
    thread: Thread {…19 keys},
    literals: […0],
    symbols: […0],
    user: "01a1e526-9364-7030-9fec-6a891be3df69",
    "$notes": atom([…0]),
    get views → […0],
    get files → […0],
    get data → {…0 keys},
    get bundle → null,
    get traits → […1],
    get trait → {…2 keys},
    get label → {…1 keys}
  }
]
```

```json
[
  {
    "$label": {
      "lc": 0,
      "value": {
        "name": "memo #0"
      },
      "events": {
        "5": [
          null
        ],
        "6": [
          null
        ]
      },
      "active": true
    },
    "context": null,
    "hooks": {
      "attach": [],
      "detach": [],
      "release": [
        null
      ]
    },
    "on": {},
    "id": "01a1e526-9d80-73eb-adec-710370980cd6",
    "createdAt": "2026-11-16T16:17:55.584Z",
    "updatedAt": "2026-11-16T16:17:55.584Z",
    "status": "PENDING",
    "mime": "application/json",
    "turns": [],
    "notes": [],
    "index": 0,
    "literals": [],
    "symbols": [],
    "user": "01a1e526-9364-7030-9fec-6a891be3df69",
    "$notes": {
      "lc": 0,
      "value": [],
      "events": {
        "5": [
          null
        ],
        "6": [
          null
        ]
      },
      "active": true
    },
    "views": [],
    "files": [],
    "data": {},
    "bundle": null,
    "traits": [
      "LABELED"
    ],
    "trait": {
      "LABELED": {
        "name": "memo #0"
      },
      "RENDERED": {}
    }
  }
]
```

`seated` (`terminal.$buffer`) is the same instance; its getters and label:

```js
Buffer {
  "$views": atom([]),
  "$files": atom([]),
  "$data": atom({}),
  "$bundle": atom(null),
  "$traits": atom([
      "LABELED"
    ]),
  "$trait": atom({
      LABELED: {…1 keys},
      RENDERED: {…0 keys}
    }),
  "$label": atom({
      name: "memo #0"
    }),
  context: null,
  hooks: {
    attach: […0],
    detach: […0],
    release: […1]
  },
  on: {
    attach: ƒ attach,
    detach: ƒ detach,
    release: ƒ release
  },
  id: "01a1e526-9d80-73eb-adec-710370980cd6",
  createdAt: "2026-11-16T16:17:55.584Z",
  updatedAt: "2026-11-16T16:17:55.584Z",
  status: "PENDING",
…(+78 rows, the probe prints them)
```

```js
{
  trait: {
    LABELED: {
      name: "memo #0"
    },
    RENDERED: {}
  },
  label: {
    name: "memo #0"
  },
  named: "memo #0"
}
```

## 8 · modes — `Mode`

| | |
|---|---|
| prototype | `systems/ghost/entities/mode/prototype.js:3-39` |
| hydration | `systems/ghost/entities/mode/hydration.js:3-9` (`reference` · `connection` · `entities`) |
| traits | `systems/ghost/entities/mode/traits/exposed.js:3-6` · `harnessed.js:4-37` · `repling.js:3-7` |
| repository | `systems/ghost/entities/mode/repository.js:4` → `<runtime>/entities/mode` |
| mikro | `subsystems/typology/entities/Mode.ts:20` · schema `:41` |
| schematic | `subsystems/typology/schematics/entities/mode.js:5` |

`trees.js` reads `mode.reference.absolute` · `.type` · `.slug` · `.traits` · `.name` · `.version` · `.manifest` · `.metadata.aperture` · `.metadata.harness` · `shape.strip(mode.repl)` · `shape.strip(mode.keymap)` · `mode.daemon` (`trees.js:87-116`, `:142-144`). `metadata.aperture` lands only with `EXPOSED`, `metadata.harness` only with `HARNESSED`.

The seated mode, `thread.mode` (depth 1):

```js
Mode {
  type: "srs",
  slug: "memo",
  name: "Memo",
  description: "Spaced-repetition flashcards on SM-2: drill in the frame (tab reveals, 1 again · 2 …
  version: "0.1.0",
  traits: [
    "VIEWABLE",
    "EMITTER",
    "EXPOSED",
    "HARNESSED",
    "CONVERSATIONAL",
    "TOOLING",
    "PRIMER"
  ],
  daemon: Daemon {
    type: "daemon",
    id: "memo",
    slug: "memo",
    reference: Path {…2 keys},
    manifest: {…4 keys},
    metadata: {…3 keys},
    entities: {…4 keys},
    connection: Connection {…6 keys},
    aperture: Connection {…6 keys},
    call: {…13 keys},
    cortex: Cortex {…2 keys},
    "$status": atom({…1 keys}),
    mask: {…3 keys},
    traits: […0],
    trait: {…0 keys},
    createdAt: "2026-11-16T16:17:53.024Z",
    updatedAt: "2026-11-16T16:17:53.024Z",
    "$modes": atom([…3]),
    "$literals": atom([…0]),
    "$symbols": atom([…0]),
    "$notes": atom([…0]),
    get status → {…1 keys},
    get modes → […3]
  },
  reference: Path {
    gauges: […0],
    nature: "/mode/srs/memo",
    trace: Path {…2 keys},
    get json → {…7 keys},
    get absolute → "/daemon/memo/mode/srs/memo",
    get filename → null,
    get dirname → "/daemon/memo/mode/srs",
    get segment → "/mode/srs/memo",
    get hash → "e80f3f43",
    get array → […2],
    get heir → undefined,
    get fin → null,
    get root → Path {…2 keys},
    get depth → 0,
    get length → 2,
    get index → 1,
    get lua → [Circular Path],
    get ghost → false
  },
  module: null,
  status: Status {
    "$transient": atom({…3 keys}),
    get reflection → {…3 keys}
  },
  stdout: Span {
    gauges: […0],
    nature: "mode",
    pipe: Pipe {…1 keys},
    "$history": atom([…0]),
    tracked: Vector {…4 keys},
    start: ƒ anonymous,
    stop: ƒ anonymous,
    request: ƒ anonymous,
    response: ƒ anonymous,
    log: ƒ anonymous,
    entity: ƒ anonymous,
    status: ƒ anonymous,
    get history → […0],
    get absolute → […1],
    get json → {…2 keys},
    get hash → "9c3c4952",
    get array → […1],
    get heir → undefined,
    get fin → null,
    get root → [Circular Span],
    get depth → 0,
    get length → 1,
    get index → 0,
    get lua → [Circular Span],
    get ghost → false
  },
  repl: Vector {
    effect: null,
    trie: Map {…0 keys},
    carry: […0],
    signature: ƒ Pattern,
    get patterns → […1],
    get descendants → […1],
    get root → [Circular Vector],
    get heir → Vector {…5 keys}
  },
  keymap: Vector {
    effect: null,
    trie: Map {…0 keys},
    carry: […0],
    signature: ƒ Pattern,
    get patterns → […0],
    get descendants → […0],
    get root → [Circular Vector],
    get heir → undefined
  },
  metadata: {
    aperture: {…1 keys},
    harness: {…3 keys}
  },
  connection: Connection {
    "$state": atom("IDLE"),
    "$error": atom(null),
    carry: […0],
    children: Map {…0 keys},
    url: Url {…4 keys},
    transport: ƒ anonymous,
    get $isConnected → atom(false),
    get $isError → atom(false)
  },
  call: {
    metadata: {…5 keys},
    deck: ƒ anonymous,
    grade: ƒ anonymous,
    stats: ƒ anonymous,
    chat: ƒ anonymous,
    entities: {…9 keys},
    emit: {…1 keys},
    harness: {…5 keys}
  },
  harness: {
    verbatim: {…1 keys},
    dialogue: {…2 keys},
    object: {…2 keys},
    choice: {…1 keys},
    picture: {…1 keys}
  },
  id: "01a1e526-949d-758b-bc36-2b0483866569",
  createdAt: "2026-11-16T16:17:53.309Z",
  updatedAt: "2026-11-16T16:17:53.309Z",
  installed: "91a07b3c",
  "$buffers": atom([
      Buffer {…24 keys}
    ]),
  "$turns": atom([
      Turn {…15 keys},
      Turn {…13 keys},
      Turn {…15 keys},
      Turn {…13 keys},
      Turn {…15 keys},
      Turn {…13 keys},
      Turn {…15 keys},
      Turn {…15 keys}
    ]),
  "$views": atom([
      View {…12 keys},
      View {…12 keys}
    ]),
  "$literals": atom([]),
  "$symbols": atom([]),
  "$notes": atom([]),
  "$files": atom([]),
  entities: {
    literal: RemoteRepository {…7 keys},
    symbol: RemoteRepository {…7 keys},
    view: RemoteRepository {…7 keys},
    file: RemoteRepository {…7 keys},
    note: RemoteRepository {…7 keys},
    thread: RemoteRepository {…7 keys},
    turn: RemoteRepository {…7 keys},
    buffer: RemoteRepository {…7 keys}
  },
  get manifest → {
    type: "srs",
    slug: "memo",
    name: "Memo",
    description: "Spaced-repetition flashcards on SM-2: drill in the frame (tab reveals, 1 again · …
    version: "0.1.0",
    traits: […7]
  }
}
```

Its `metadata.aperture` (depth 4) — the routes tree `trees.js:100` strips:

```js
{
  branches: {
    metadata: {
      branches: {
        status: {
          branches: {…0 keys},
          effect: {…0 keys}
        },
        manifest: {
          branches: {…0 keys},
          effect: {…0 keys}
        },
        emitter: {
          branches: {…0 keys},
          effect: {…0 keys}
        },
        aperture: {
          branches: {…0 keys},
          effect: {…0 keys}
        },
        harness: {
          branches: {…1 keys},
          effect: {…0 keys}
        }
      }
    },
    deck: {
      branches: {},
      effect: {
        input: {
          type: "object",
          required: […1],
          properties: {…2 keys}
        },
        valence: "the cards to review now — due first, then untouched by rank; suspended ones never…
      }
    },
    grade: {
      branches: {},
      effect: {
        input: {
          type: "object",
          required: […2],
          properties: {…3 keys}
        },
        valence: "grade the card just answered; its SM-2 schedule evolves and the grade is traced. …
      }
    },
    stats: {
      branches: {},
      effect: {
        input: {
          type: "object",
          properties: {…0 keys}
        },
        valence: "the learner report. Example: {}"
      }
    },
    chat: {
      branches: {},
      effect: {
        input: {
          type: "object",
          required: […2],
          properties: {…2 keys}
        },
        output: {
          type: "object",
          required: […1],
          properties: {…1 keys}
        },
        valence: "one answer from the Magister on the caller's thread. Example: { prompt: 'what is …
      }
    },
    entities: {
      branches: {
        literal: {
          branches: {…12 keys}
        },
        symbol: {
          branches: {…12 keys}
        },
        view: {
          branches: {…12 keys}
        },
        intent: {
          branches: {…12 keys}
        },
        file: {
          branches: {…12 keys}
        },
        note: {
          branches: {…12 keys}
        },
        thread: {
          branches: {…12 keys}
        },
        turn: {
          branches: {…12 keys}
        },
        buffer: {
          branches: {…12 keys}
        }
      }
    },
    emit: {
      branches: {
        session: {
          branches: {…0 keys},
          effect: {…2 keys}
        }
      }
    },
    harness: {
      branches: {
        verbatim: {
          branches: {…1 keys}
        },
        dialogue: {
          branches: {…2 keys}
        },
        object: {
          branches: {…2 keys}
        },
        choice: {
          branches: {…1 keys}
        },
        picture: {
          branches: {…1 keys}
        }
      }
    }
  }
}
```

```js
Converting circular structure to JSON
```

All five hosted modes — reference, host, `manifest` getter, which `metadata` keys landed:

```js
[
  {
    reference: "/runtime/house/mode/home/probe",
    daemon: null,
    manifest: {
      type: "home",
      slug: "probe",
      name: null,
      description: null,
      version: "0.0.1",
      traits: [
        "RUNTIME",
        "EXPOSED",
        "TOOLING",
        "DATASET"
      ]
    },
    metadata: [
      "aperture"
    ]
  },
  {
    reference: "/daemon/memo/mode/domain/srs",
    daemon: "memo",
    manifest: {
      type: "domain",
      slug: "srs",
      name: "Spaced Repetition",
      description: "Anki's SM-2 over the daemon's literals: a card's retention and its traced grade…
      version: "0.1.0",
      traits: [
        "EXPOSED",
        "TOOLING"
      ]
    },
    metadata: [
      "aperture"
    ]
  },
  {
    reference: "/daemon/hello/mode/demo/hello-world",
    daemon: "hello",
    manifest: {
      type: "demo",
      slug: "hello-world",
      name: null,
      description: null,
      version: null,
      traits: [
        "HARNESSED",
        "CONVERSATIONAL",
        "GENERATIVE",
        "TOOLING",
        "PRIMER",
        "EMITTER",
        "VIEWABLE",
        "EXPOSED"
      ]
    },
    metadata: [
      "harness",
      "aperture"
    ]
  },
  {
    reference: "/daemon/memo/mode/topography/latin",
    daemon: "memo",
    manifest: {
      type: "topography",
      slug: "latin",
      name: "Latin",
      description: "219 words and 50 sentences, English to Latin — classical and ecclesiastical, te…
      version: "0.1.0",
      traits: [
        "DATASET",
        "FILESET"
      ]
    },
    metadata: []
  },
  {
    reference: "/daemon/memo/mode/srs/memo",
    daemon: "memo",
    manifest: {
      type: "srs",
      slug: "memo",
      name: "Memo",
      description: "Spaced-repetition flashcards on SM-2: drill in the frame (tab reveals, 1 again …
      version: "0.1.0",
      traits: [
        "VIEWABLE",
        "EMITTER",
        "EXPOSED",
        "HARNESSED",
        "CONVERSATIONAL",
        "TOOLING",
        "PRIMER"
      ]
    },
    metadata: [
      "aperture",
      "harness"
    ]
  }
]
```

Local modes, `fromm.modes(app.client.modes).flat` — built from the register, never hydrated, `daemon: null`, `connection: null` (`systems/ghost/subjects/client/lifecycle/index.js:10-12`):

```js
[
  Mode {
    type: "home",
    slug: "console",
    name: "Console",
    description: "A mode the client hosts. Its verbs join the repl beside the client's own — proof …
    version: "0.0.1",
    traits: […3],
    daemon: null,
    reference: Path {…3 keys},
    module: {…12 keys},
    status: Status {…1 keys},
    stdout: Span {…13 keys},
    repl: Vector {…4 keys},
    keymap: Vector {…4 keys},
    metadata: {…0 keys},
    connection: null,
    call: null,
    harness: null,
    owner: "@commons",
    get manifest → {…6 keys}
  }
]
```

## 9 · daemons — `Daemon`

| | |
|---|---|
| prototype | `systems/ghost/entities/daemon/prototype.js:4-28` |
| hydration | `systems/ghost/entities/daemon/hydration.js:3-8` |
| repository | `systems/ghost/entities/daemon/repository.js:4` → `<runtime>/entities/daemon` |
| mikro | `subsystems/typology/entities/Daemon.ts:17` (`id` IS `slug`, `:19-21`) · schema `:35` |
| schematic | `subsystems/typology/schematics/entities/daemon.js:4` |

`trees.js:120-140` reads `host.status.code` · `host.reference` · `host.metadata.manifest` · `.statics` · `.aperture`, the same shape on `Runtime` and `Daemon`.

```js
[
  Daemon {
    type: "daemon",
    id: "hello",
    slug: "hello",
    reference: Path {…2 keys},
    manifest: {…4 keys},
    metadata: {…3 keys},
    entities: {…4 keys},
    connection: Connection {…6 keys},
    aperture: Connection {…6 keys},
    call: {…7 keys},
    cortex: Cortex {…2 keys},
    "$status": atom({…1 keys}),
    mask: {…3 keys},
    traits: […0],
    trait: {…0 keys},
    createdAt: "2026-11-16T16:17:53.022Z",
    updatedAt: "2026-11-16T16:17:53.022Z",
    "$modes": atom([…1]),
    "$literals": atom([…0]),
    "$symbols": atom([…0]),
    "$notes": atom([…0]),
    get status → {…1 keys},
    get modes → […1]
  },
  Daemon {
    type: "daemon",
    id: "memo",
    slug: "memo",
    reference: Path {…2 keys},
    manifest: {…4 keys},
    metadata: {…3 keys},
    entities: {…4 keys},
    connection: Connection {…6 keys},
    aperture: Connection {…6 keys},
    call: {…13 keys},
    cortex: Cortex {…2 keys},
    "$status": atom({…1 keys}),
    mask: {…3 keys},
    traits: […0],
    trait: {…0 keys},
    createdAt: "2026-11-16T16:17:53.024Z",
    updatedAt: "2026-11-16T16:17:53.024Z",
    "$modes": atom([…3]),
    "$literals": atom([…0]),
    "$symbols": atom([…0]),
    "$notes": atom([…0]),
    get status → {…1 keys},
    get modes → […3]
  }
]
```

```js
{
  metadata: {
    manifest: {
      type: "daemon",
      slug: "memo",
      version: "0.1.0",
      traits: []
    },
    statics: {
      language: {
        known: "English",
        learning: "Latin"
      }
    },
    aperture: {
      branches: {
        pick: {
          branches: {…1 keys}
        },
        review: {
          branches: {…1 keys}
        },
        preview: {
          branches: {…1 keys}
        },
        history: {
          branches: {…1 keys}
        },
        suspend: {
          branches: {…1 keys}
        },
        resume: {
          branches: {…1 keys}
        },
        mode: {
          branches: {…3 keys}
        },
        datamap: {
          branches: {…0 keys},
          effect: {…0 keys}
        },
        entities: {
          branches: {…4 keys}
        },
        metadata: {
          branches: {…6 keys}
        },
        cortex: {
          branches: {…6 keys}
        },
        status: {
          branches: {…1 keys},
          effect: {…0 keys}
        },
        batch: {
          branches: {…0 keys},
          effect: {…0 keys}
        }
      }
    }
  },
  mask: {
    manifest: {
      type: "daemon",
      slug: "memo",
      version: "0.1.0"
    },
    statics: {
      language: {
        known: "English",
        learning: "Latin"
      }
    },
    modes: [
      "@memo/domain/srs",
      "@memo/topography/latin",
      "@memo/srs/memo"
    ]
  }
}
```

```json
[
  {
    "id": "hello",
    "slug": "hello",
    "reference": "/daemon/hello",
    "manifest": {
      "type": "daemon",
      "slug": "hello",
      "version": "0.0.1",
      "traits": []
    },
    "status": {
      "code": "HEALTHY"
    }
  },
  {
    "id": "memo",
    "slug": "memo",
    "reference": "/daemon/memo",
    "manifest": {
      "type": "daemon",
      "slug": "memo",
      "version": "0.1.0",
      "traits": []
    },
    "status": {
      "code": "HEALTHY"
    }
  }
]
```

## 10 · runtime — `Runtime`

Source: `systems/ghost/entities/runtime/prototype.js:3-35`; filled by `connected` (`systems/ghost/subjects/client/factory.js:19-44`). Not an entity: no repository, one per client. The panel reads `runtime.$status` (`telemetry.jsx:246`), `runtime.reference.absolute` (`:174`), and via `harness` its `cortex` (`sections.js:44-56`).

```js
Runtime {
  type: "runtime",
  manifest: {
    slug: "house"
  },
  reference: Path {
    gauges: […1],
    nature: "/runtime/house",
    get json → {…7 keys},
    get absolute → "/runtime/house",
    get filename → null,
    get dirname → "/runtime",
    get segment → "/runtime/house",
    get hash → "15de2a31",
    get array → […2],
    get heir → Path {…3 keys},
    get fin → Path {…3 keys},
    get root → [Circular Path],
    get depth → 1,
    get length → 2,
    get index → 0,
    get lua → undefined,
    get ghost → false
  },
  remote: Url {
    gauges: […0],
    nature: "/",
    origin: "http://localhost:63750",
    query: {…0 keys},
    get protocol → "http",
    get secure → false,
    get search → "",
    get searchParams → URLSearchParams {…0 keys},
    get absolute → "http://localhost:63750/",
    get json → {…6 keys},
    get href → "http://localhost:63750/",
    get pathname → "/",
    get port → "63750",
    get hostname → "localhost",
    get hash → "64091dde",
    get array → […1],
    get heir → undefined,
    get fin → null,
    get root → [Circular Url],
    get depth → 0,
    get length → 1,
    get index → 0,
    get lua → [Circular Url],
    get ghost → false
  },
  metadata: {
    manifest: {…1 keys},
    statics: {…2 keys},
    aperture: {…1 keys}
  },
  multiplex: ƒ transport,
  connection: Connection {
    "$state": atom("IDLE"),
    "$error": atom(null),
    carry: […4],
    children: Map {…0 keys},
    url: Url {…4 keys},
    transport: ƒ wrapped,
    get $isConnected → atom(false),
    get $isError → atom(false)
  },
  aperture: Connection {
    "$state": atom("IDLE"),
    "$error": atom(null),
    carry: […0],
    children: Map {…0 keys},
    url: Url {…4 keys},
    transport: ƒ anonymous,
    get $isConnected → atom(false),
    get $isError → atom(false)
  },
  call: {
    mode: {…1 keys},
    entities: {…2 keys},
    metadata: {…6 keys},
    cortex: {…6 keys},
    status: ƒ anonymous,
    batch: ƒ anonymous
  },
  cortex: Cortex {
    faculties: Map {…0 keys},
    hallucinate: {…6 keys}
  },
  lighthouse: Lighthouse {
    "$authority": atom({…2 keys}),
    "$user": atom({…4 keys}),
    "$status": atom({…1 keys}),
    "$isAuthorized": atom(true),
    "$isIdentified": atom(true),
    manifest: {…3 keys},
    connection: Connection {…6 keys},
    stdout: Span {…13 keys},
    get authority → {…2 keys},
    get user → {…4 keys},
    get status → {…1 keys},
    get isAuthorized → true,
    get isIdentified → true,
    get json → {…5 keys}
  },
  entities: Dataspace {
    runtime: [Circular Runtime],
    em: RemoteEntityManager {…12 keys},
    daemon: RemoteRepository {…7 keys},
    mode: RemoteRepository {…7 keys},
    thread: RemoteRepository {…7 keys},
    buffer: RemoteRepository {…7 keys},
    turn: RemoteRepository {…7 keys},
    activity: RemoteRepository {…7 keys},
    terminal: RemoteRepository {…7 keys},
    view: RemoteRepository {…7 keys},
    file: RemoteRepository {…7 keys},
    literal: RemoteRepository {…6 keys},
    symbol: RemoteRepository {…6 keys},
    note: RemoteRepository {…6 keys},
    datamap: {…15 keys}
  },
  "$status": atom({
      code: "HEALTHY"
    }),
  get status → {
    code: "HEALTHY"
  },
  get modes → [
    Mode {…29 keys}
  ],
  get attach → Connection {
    "$state": atom("IDLE"),
    "$error": atom(null),
    carry: […0],
    children: Map {…0 keys},
    url: Url {…4 keys},
    transport: ƒ anonymous,
    get $isConnected → atom(false),
    get $isError → atom(false)
  },
  get json → {
    manifest: {…1 keys},
    reference: "/runtime/house",
    remote: Url {…4 keys},
    status: {…1 keys}
  }
}
```

```js
{
  manifest: {
    slug: "house"
  },
  statics: {
    serve: {
      url: "http://localhost:63750/",
      origin: "http://localhost:63750",
      scheme: "http",
      path: "/",
      query: {},
      parts: []
    },
    remote: {
      url: "http://localhost:63750/",
      origin: "http://localhost:63750",
      scheme: "http",
      path: "/",
      query: {},
      parts: []
    }
  },
  aperture: {
    branches: {
      mode: {
        branches: {
          home: {…1 keys}
        }
      },
      entities: {
        branches: {
          mode: {…1 keys},
          daemon: {…1 keys}
        }
      },
      metadata: {
        branches: {
          manifest: {…2 keys},
          statics: {…2 keys},
          datamap: {…2 keys},
          aperture: {…2 keys},
          cortex: {…2 keys},
          modes: {…2 keys}
        }
      },
      cortex: {
        branches: {
          dialogue: {…1 keys},
          object: {…1 keys},
          choice: {…1 keys},
          verbatim: {…1 keys},
          speech: {…1 keys},
          picture: {…1 keys}
        }
      },
      status: {
        branches: {
          subscribe: {…2 keys}
        },
        effect: {}
      },
      batch: {
        branches: {},
        effect: {}
      }
    }
  }
}
```

## 11 · lighthouse — `Lighthouse` · user

Source: `systems/ghost/entities/lighthouse/prototype.js:4-141`; status codes `systems/ghost/entities/lighthouse/standings.js:1`. The user is a PLAIN object on `$user`, its `trait` cast with `v.user.traits` (`prototype.js:39`, `:70`, `:91`); the mikro entity is `subsystems/typology/entities/User.ts:32`, schematic `subsystems/typology/schematics/entities/user.js:5`.

The panel reads `$status` raw (`telemetry.jsx:248`), `user.slug`, `manifest.traits` (`:290`, `:180-183`).

```js
Lighthouse {
  "$authority": atom({
      access: "eyJhbGciOiJIUzI1NiJ9.‹JWT elided›",
      refresh: "eyJhbGciOiJIUzI1NiJ9.‹JWT elided›"
    }),
  "$user": atom({
      id: "01a1e526-9364-7030-9fec-6a891be3df69",
      slug: "localhost",
      traits: [],
      trait: {
        HOME: {…0 keys},
        DOCKED: {…0 keys},
        THEMED: "porcelain"
      }
    }),
  "$status": atom({
      code: "AUTHENTICATED"
    }),
  "$isAuthorized": atom(true),
  "$isIdentified": atom(true),
  manifest: {
    type: "lighthouse",
    slug: "lighthouse",
    traits: [
      "JOINABLE",
      "AUTOLOGIN"
    ]
  },
  connection: Connection {
    "$state": atom("IDLE"),
    "$error": atom(null),
    carry: [
      ƒ anonymous,
      ƒ anonymous,
      ƒ anonymous,
      ƒ anonymous
    ],
    children: Map(4) ["runtime", "userspace", "daemon", "attached"],
    url: Url {
      gauges: […0],
      nature: "/",
      origin: "http://localhost:63750",
      query: {…0 keys},
      get protocol → "http",
      get secure → false,
      get search → "",
      get searchParams → URLSearchParams {…0 keys},
      get absolute → "http://localhost:63750/",
      get json → {…6 keys},
      get href → "http://localhost:63750/",
      get pathname → "/",
      get port → "63750",
      get hostname → "localhost",
      get hash → "64091dde",
      get array → […1],
      get heir → undefined,
      get fin → null,
      get root → [Circular Url],
      get depth → 0,
      get length → 1,
      get index → 0,
      get lua → [Circular Url],
      get ghost → false
    },
    transport: ƒ wrapped,
    get $isConnected → atom(false),
    get $isError → atom(false)
  },
  stdout: Span {
    gauges: [],
    nature: "lighthouse",
    trace: Span {
      gauges: […0],
      nature: "client",
      trace: Span {…12 keys},
      pipe: Pipe {…1 keys},
      "$history": atom([…45]),
      tracked: Vector {…4 keys},
      start: ƒ anonymous,
      stop: ƒ anonymous,
      request: ƒ anonymous,
      response: ƒ anonymous,
      log: ƒ anonymous,
      entity: ƒ anonymous,
      status: ƒ anonymous,
      get history → […45],
      get absolute → […2],
      get json → {…3 keys},
      get hash → "aa0a17e6",
      get array → […2],
      get heir → undefined,
      get fin → null,
      get root → Span {…12 keys},
      get depth → 0,
      get length → 2,
      get index → 1,
      get lua → [Circular Span],
      get ghost → false
    },
    pipe: Pipe {
      listeners: Set {…0 keys}
    },
    "$history": atom([
        {…4 keys},
        {…4 keys}
      ]),
    tracked: Vector {
      effect: null,
      trie: Map {…0 keys},
      carry: […0],
      signature: ƒ Pattern,
      get patterns → […8],
      get descendants → […8],
      get root → [Circular Vector],
      get heir → Vector {…5 keys}
    },
    start: ƒ anonymous,
    stop: ƒ anonymous,
    request: ƒ anonymous,
    response: ƒ anonymous,
    log: ƒ anonymous,
    entity: ƒ anonymous,
    status: ƒ anonymous,
    get history → [
      {…4 keys},
      {…4 keys}
    ],
    get absolute → [
      "anima",
      "client",
      "lighthouse"
    ],
    get json → {
      nature: "lighthouse",
      absolute: […3],
      trace: {…3 keys}
    },
    get hash → "fc8cf361",
    get array → [
      Span {…12 keys},
      Span {…13 keys},
      [Circular Span]
    ],
    get heir → undefined,
    get fin → null,
    get root → Span {
      gauges: […0],
      nature: "anima",
      pipe: Pipe {…1 keys},
      "$history": atom([…45]),
      tracked: Vector {…4 keys},
      start: ƒ anonymous,
      stop: ƒ anonymous,
      request: ƒ anonymous,
      response: ƒ anonymous,
      log: ƒ anonymous,
      entity: ƒ anonymous,
      status: ƒ anonymous,
      get history → […45],
      get absolute → […1],
      get json → {…2 keys},
      get hash → "19e760ad",
      get array → […1],
      get heir → undefined,
      get fin → null,
      get root → [Circular Span],
      get depth → 0,
      get length → 1,
      get index → 0,
      get lua → [Circular Span],
      get ghost → false
    },
    get depth → 0,
    get length → 3,
    get index → 2,
    get lua → [Circular Span],
    get ghost → false
  },
  get authority → {
    access: "eyJhbGciOiJIUzI1NiJ9.‹JWT elided›",
    refresh: "eyJhbGciOiJIUzI1NiJ9.‹JWT elided›"
  },
  get user → {
    id: "01a1e526-9364-7030-9fec-6a891be3df69",
    slug: "localhost",
    traits: [],
    trait: {
      HOME: {…0 keys},
      DOCKED: {…0 keys},
      THEMED: "porcelain"
    }
  },
  get status → {
    code: "AUTHENTICATED"
  },
  get isAuthorized → true,
  get isIdentified → true,
  get json → {
    status: {
      code: "AUTHENTICATED"
    },
    isIdentified: true,
    isAuthorized: true,
    user: {
      id: "01a1e526-9364-7030-9fec-6a891be3df69",
      slug: "localhost",
      traits: […0],
      trait: {…3 keys}
    },
    authority: {
      access: "eyJhbGciOiJIUzI1NiJ9.‹JWT elided›",
      refresh: "eyJhbGciOiJIUzI1NiJ9.‹JWT elided›"
    }
  }
}
```

## 12 · activities — `Activity`

| | |
|---|---|
| prototype | `systems/ghost/entities/activity/prototype.js:3-27` |
| hydration | `systems/ghost/entities/activity/hydration.js:3-7` (stdin signals → remote) |
| repository | `systems/ghost/entities/activity/repository.js:4` → `/userspace/entities/activity` |
| mikro | VIRTUAL — `subsystems/typology/entities/Activity.ts:93` · `control` `:54-80` · schema `:143` |
| schematic | `subsystems/typology/schematics/entities/activity.js:4` |

An activity lives only while it runs: the server removes it once its controller settles (`Activity.ts:78`), so the client store holds it for ~0.2–0.5 s. The probe captured every emission of `activity.$entities` (three turns → three activities):

```js
[
  "IDLE:0",
  "IDLE:0",
  "RUNNING:1",
  "RUNNING:2",
  "RUNNING:3",
  "RUNNING:4",
  "RUNNING:5",
  "DONE:6",
  "IDLE:0",
  "IDLE:0",
  "RUNNING:1",
  "RUNNING:2",
  "RUNNING:3",
  "RUNNING:4",
  "RUNNING:5",
  "RUNNING:6",
  "RUNNING:7",
  "RUNNING:8",
  "RUNNING:9",
  "RUNNING:10",
  "RUNNING:11",
  "DONE:12",
  "IDLE:0",
  "IDLE:0",
  …(+6)
]
```

`steps` is a ring of the last 12 trace records (`Activity.ts:16`, `:68-75`); `status` is a getter over the client controller (`prototype.js:13-18`). The panel reads `type` · `status` · `steps` · `thread` · `error` (`telemetry.jsx:61-80`, `:227`).

One RUNNING activity, depth 1:

```js
Activity {
  user: "01a1e526-9364-7030-9fec-6a891be3df69",
  mode: Mode {
    type: "srs",
    slug: "memo",
    name: "Memo",
    description: "Spaced-repetition flashcards on SM-2: drill in the frame (tab reveals, 1 again · …
    version: "0.1.0",
    traits: […7],
    daemon: Daemon {…21 keys},
    reference: Path {…3 keys},
    module: null,
    status: Status {…1 keys},
    stdout: Span {…12 keys},
    repl: Vector {…4 keys},
    keymap: Vector {…4 keys},
    metadata: {…2 keys},
    connection: Connection {…6 keys},
    call: {…8 keys},
    harness: {…5 keys},
    id: "01a1e526-949d-758b-bc36-2b0483866569",
    createdAt: "2026-11-16T16:17:53.309Z",
    updatedAt: "2026-11-16T16:17:53.309Z",
    installed: "91a07b3c",
    "$buffers": atom([…0]),
    "$turns": atom([…1]),
    "$views": atom([…2]),
    "$literals": atom([…0]),
    "$symbols": atom([…0]),
    "$notes": atom([…0]),
    "$files": atom([…0]),
    entities: {…8 keys},
    get manifest → {…6 keys}
  },
  thread: Thread {
    id: "01a1e526-970c-723d-81bd-f6d81c47d9ec",
    user: {…6 keys},
    mode: Mode {…29 keys},
    phase: "manual",
    traits: […2],
    trait: {…6 keys},
    createdAt: "2026-11-16T16:17:53.932Z",
    updatedAt: "2026-11-16T16:17:53.956Z",
    counter: 0,
    buffers: […0],
    turns: […0],
    children: […0],
    "$buffers": atom([…0]),
    "$turns": atom([…1]),
    "$children": atom([…0]),
    "$phase": atom("manual"),
    "$activities": atom([…1]),
    intent: null,
    parent: null,
    get word → "memo",
    get activities → […1]
  },
  buffer: undefined,
  turn: Turn {
    role: "user",
    parts: […1],
    meta: null,
    thread: Thread {…19 keys},
    mode: Mode {…29 keys},
    parent: null,
    id: "5a9c21b0-4e75-4bc8-aba9-7a9e39766434",
    createdAt: "2026-11-16T16:17:53.969Z",
    updatedAt: "2026-11-16T16:17:53.969Z",
    children: […0],
    buffers: […0],
    notes: […0],
    user: "01a1e526-9364-7030-9fec-6a891be3df69",
    "$children": atom([…0]),
    "$notes": atom([…0])
  },
  type: "HALLUCINATION",
  steps: [
    {…4 keys}
  ],
  controller: Controller {
    children: Set {…0 keys},
    gate: {…2 keys},
    stdout: Span {…12 keys},
    stdin: Vector {…4 keys},
    abort: AbortController {…0 keys},
    parent: null,
    status: Status {…1 keys},
    settled: Promise
  },
  id: "01a1e526-972e-728d-be3f-dc8edea9582e",
  createdAt: "2026-11-16T16:17:53.966Z",
  updatedAt: "2026-11-16T16:17:53.981Z",
  get status → "RUNNING"
}
```

The tool round, DONE, 12 steps — a tool span nests under `hallucination` by its `path`:

```json
{
  "user": "01a1e526-9364-7030-9fec-6a891be3df69",
  "type": "HALLUCINATION",
  "steps": [
    {
      "at": 1794845874512.0369,
      "path": [
        "hallucination"
      ],
      "track": "status",
      "data": {
        "timestamp": "2026-11-16T16:17:54.511Z",
        "code": "RUNNING"
      }
    },
    {
      "at": 1794845874512.2239,
      "path": [
        "hallucination"
      ],
      "track": "start",
      "data": null
    },
    {
      "at": 1794845874512.4668,
      "path": [
        "hallucination"
      ],
      "track": "log",
      "data": {
        "streamOrRender": "stream",
        "faculty": "dialogue"
      }
    },
    {
      "at": 1794845874599.687,
      "path": [
        "hallucination"
      ],
      "track": "log",
      "data": {
        "round": 1,
        "state": "tools"
      }
    },
    {
      "at": 1794845874600.131,
      "path": [
        "hallucination",
        "srs_lookup/stub-0"
      ],
      "track": "status",
      "data": {
        "timestamp": "2026-11-16T16:17:54.600Z",
        "code": "RUNNING"
      }
    },
    {
      "at": 1794845874600.1958,
      "path": [
        "hallucination",
        "srs_lookup/stub-0"
      ],
      "track": "start",
      "data": null
    },
    {
      "at": 1794845874600.221,
      "path": [
        "hallucination",
        "srs_lookup/stub-0"
      ],
      "track": "log",
      "data": {
        "input": {
          "query": "lookup please --tool srs/lookup --deltas 3"
        }
      }
    },
    {
      "at": 1794845874601.2412,
      "path": [
        "hallucination",
        "srs_lookup/stub-0"
      ],
      "track": "status",
      "data": {
        "timestamp": "2026-11-16T16:17:54.600Z",
        "code": "FAILED",
        "error": {
          "type": "Error",
          "message": "Validation failed: must have required properties search",
          "code": "VALIDATION",
          "stack": "Error: Validation failed: must have required properties search\n    at file:///…
        }
      }
    },
    {
      "at": 1794845874601.3953,
      "path": [
        "hallucination",
        "srs_lookup/stub-0"
      ],
      "track": "fault",
      "data": {
        "type": "Error",
        "message": "Validation failed: must have required properties search",
        "code": "VALIDATION",
        "stack": "Error: Validation failed: must have required properties search\n    at file:///Us…
      }
    },
    {
      "at": 1794845874733.2544,
      "path": [
        "hallucination"
      ],
      "track": "log",
      "data": {
        "round": 2,
        "state": "complete",
        "usage": {
          "input": 10,
          "output": 20
        }
      }
    },
    {
      "at": 1794845874733.507,
      "path": [
        "hallucination"
      ],
      "track": "stop",
      "data": null
    },
    {
      "at": 1794845874733.5542,
      "path": [
        "hallucination"
      ],
      "track": "status",
      "data": {
        "timestamp": "2026-11-16T16:17:54.733Z",
        "code": "DONE"
      }
    }
  ],
  "id": "01a1e526-9942-7541-855f-fce4821f57ad",
  "createdAt": "2026-11-16T16:17:54.498Z",
  "updatedAt": "2026-11-16T16:17:54.734Z",
  "status": "DONE"
}
```

The fatal fault, FAILED, last emission:

```json
{
  "user": "01a1e526-9364-7030-9fec-6a891be3df69",
  "type": "HALLUCINATION",
  "steps": [
    {
      "at": 1794845874750.0684,
      "path": [
        "hallucination"
      ],
      "track": "status",
      "data": {
        "timestamp": "2026-11-16T16:17:54.750Z",
        "code": "RUNNING"
      }
    },
    {
      "at": 1794845874750.1553,
      "path": [
        "hallucination"
      ],
      "track": "start",
      "data": null
    },
    {
      "at": 1794845874750.1792,
      "path": [
        "hallucination"
      ],
      "track": "log",
      "data": {
        "streamOrRender": "stream",
        "faculty": "dialogue"
      }
    },
    {
      "at": 1794845874750.645,
      "path": [
        "hallucination"
      ],
      "track": "status",
      "data": {
        "timestamp": "2026-11-16T16:17:54.750Z",
        "code": "FAILED",
        "error": {
          "type": "Error",
          "message": "[stub] scripted fatal fault",
          "stack": "Error: [stub] scripted fatal fault\n    at fault (file:///Users/finn/vivalence/…
        }
      }
    },
    {
      "at": 1794845874750.717,
      "path": [
        "hallucination"
      ],
      "track": "fault",
      "data": {
        "type": "Error",
        "message": "[stub] scripted fatal fault",
        "stack": "Error: [stub] scripted fatal fault\n    at fault (file:///Users/finn/vivalence/co…
      }
    },
    {
      "at": 1794845874750.8093,
      "path": [
        "hallucination"
      ],
      "track": "stop",
      "data": null
    }
  ],
  "id": "01a1e526-9a34-7773-b5be-0a8ce093efe2",
  "createdAt": "2026-11-16T16:17:54.740Z",
  "updatedAt": "2026-11-16T16:17:54.753Z",
  "status": "FAILED"
}
```

`activity.controller.status.reflection.error` of that FAILED activity:

```js
{
  type: "Error",
  message: "[stub] scripted fatal fault",
  stack: "Error: [stub] scripted fatal fault\n    at fault (file:///Users/finn/vivalence/code/vival…
}
```

## 13 · records — the trace

A record is minted by `Span.track` (`subsystems/typology/prototypes/span.js:10-11`), its `data` cast by the track's schema (`subsystems/typology/schematics/primitives/track.js:3-10`). `path` is the span's `absolute`, an ARRAY of natures; a span's id is `trace.key(path)` (`telemetry.jsx:35`).

```js
// subsystems/typology/prototypes/span.js:10
const record = (schema) => (data, ctx) =>
  ctx.span.pipe.send({
    at: performance.timeOrigin + performance.now(),
    path: ctx.span.absolute,
    track: ctx.track,
    data: schema.cast(data),
  });
// subsystems/typology/schematics/primitives/track.js:3
export const Start = v.null();
export const Stop = v.null();
export const Request = v.object({ method: v.string().optional(), path: v.string().optional() });
export const Response = v.object({ status: v.integer().optional() });
export const Fault = v.object({
  type: v.string(),
  message: v.string(),
  code: v.string().optional(),
  stack: v.string().optional(),
});
export const Log = v.union([v.string(), v.object({}, { additionalProperties: true })]);
export const Entity = v.object({ schema: v.string(), id: v.string() });
export const Status = v.object({ code: v.string() }, { additionalProperties: true });
```

The client history held 45 records; count by track:

```js
{
  log: 9,
  status: 18,
  start: 11,
  stop: 6,
  fault: 1
}
```

`request` · `response` · `entity` never reached the client's history: `shard.track.request()` writes only when `ctx.span` is set (`subsystems/typology/gestalten/shard/track.js:28-33`), and no client call carries one. The span-tracked runtime snapshot shows an `entity` record's shape (`systems/runtime/tests/snapshots/span-tracked.snapshot.json`): `{ "track": "entity", "data": { "schema": "dialogue", "id": "turn-1" } }`.

All 45, in order (path ids elided to `‹id›`):

| # | +ms | track | path |
|---|---|---|---|
| 0 | 0.0 | `log` | `anima › client` |
| 1 | 0.3 | `status` | `anima › client` |
| 2 | 0.4 | `start` | `anima › client` |
| 3 | 1.6 | `start` | `anima › client › /mode/home/console` |
| 4 | 2.1 | `status` | `anima › client › lighthouse` |
| 5 | 12.1 | `status` | `anima › client › lighthouse` |
| 6 | 12.3 | `log` | `anima › client` |
| 7 | 15.5 | `log` | `anima › client` |
| 8 | 40.8 | `status` | `anima › client › /runtime/house` |
| 9 | 40.9 | `start` | `anima › client › /runtime/house` |
| 10 | 41.1 | `status` | `anima › client › /daemon/hello` |
| 11 | 41.1 | `start` | `anima › client › /daemon/hello` |
| 12 | 41.2 | `status` | `anima › client › /daemon/memo` |
| 13 | 41.2 | `start` | `anima › client › /daemon/memo` |
| 14 | 81.7 | `log` | `anima › client › /runtime/house` |
| 15 | 92.2 | `log` | `anima › client › /daemon/hello` |
| 16 | 95.3 | `log` | `anima › client › terminal/‹id›` |
| 17 | 97.6 | `log` | `anima › client › /daemon/memo` |
| 18 | 104.4 | `status` | `anima › client › terminal/‹id› › /mode` |
| 19 | 104.5 | `start` | `anima › client › terminal/‹id› › /mode` |
| 20 | 113.5 | `log` | `anima › client › terminal/‹id› › /mode` |
| 21 | 113.6 | `stop` | `anima › client › terminal/‹id› › /mode` |
| 22 | 113.7 | `status` | `anima › client › terminal/‹id› › /mode` |
| 23 | 113.9 | `status` | `anima › client › terminal/‹id› › /*` |
| 24 | 113.9 | `start` | `anima › client › terminal/‹id› › /*` |
| 25 | 645.1 | `stop` | `anima › client › terminal/‹id› › /*` |
| 26 | 645.2 | `status` | `anima › client › terminal/‹id› › /*` |
| 27 | 645.4 | `status` | `anima › client › terminal/‹id› › /*` |
| 28 | 645.4 | `start` | `anima › client › terminal/‹id› › /*` |
| 29 | 887.9 | `stop` | `anima › client › terminal/‹id› › /*` |
| 30 | 887.9 | `status` | `anima › client › terminal/‹id› › /*` |
| 31 | 888.1 | `status` | `anima › client › terminal/‹id› › /*` |
| 32 | 888.1 | `start` | `anima › client › terminal/‹id› › /*` |
| 33 | 907.2 | `stop` | `anima › client › terminal/‹id› › /*` |
| 34 | 907.2 | `status` | `anima › client › terminal/‹id› › /*` |
| 35 | 1710.0 | `status` | `anima › client › terminal/‹id› › /modes` |
| 36 | 1710.4 | `start` | `anima › client › terminal/‹id› › /modes` |
| 37 | 1711.7 | `log` | `anima › client › terminal/‹id› › /modes` |
| 38 | 1712.3 | `stop` | `anima › client › terminal/‹id› › /modes` |
| 39 | 1712.3 | `status` | `anima › client › terminal/‹id› › /modes` |
| 40 | 1712.4 | `status` | `anima › client › terminal/‹id› › /nonsense` |
| 41 | 1712.5 | `start` | `anima › client › terminal/‹id› › /nonsense` |
| 42 | 1728.7 | `status` | `anima › client › terminal/‹id› › /nonsense` |
| 43 | 1729.1 | `fault` | `anima › client › terminal/‹id› › /nonsense` |
| 44 | 1731.3 | `stop` | `anima › client › terminal/‹id› › /nonsense` |

The records verbatim — one per track and shape (#0 · 1 · 2 · 4 · 16 · 20 · 21 · 22 · 37 · 42 · 43):

```json
[
  {
    "at": 1794845873848.4438,
    "path": [
      "anima",
      "client"
    ],
    "track": "log",
    "data": {
      "lighthouse": "http://localhost:63750/",
      "traits": [
        "JOINABLE",
        "AUTOLOGIN"
      ]
    }
  },
  {
    "at": 1794845873848.749,
    "path": [
      "anima",
      "client"
    ],
    "track": "status",
    "data": {
      "timestamp": "2026-11-16T16:17:53.848Z",
      "code": "RUNNING"
    }
  },
  {
    "at": 1794845873848.852,
    "path": [
      "anima",
      "client"
    ],
    "track": "start",
    "data": null
  },
  {
    "at": 1794845873850.5603,
    "path": [
      "anima",
      "client",
      "lighthouse"
    ],
    "track": "status",
    "data": {
      "code": "AUTHENTICATING"
    }
  },
  {
    "at": 1794845873943.7856,
    "path": [
      "anima",
      "client",
      "terminal/01a1e526-9378-72b8-bc44-efbeea92ce23"
    ],
    "track": "log",
    "data": {
      "home": "/runtime/house/mode/home/probe",
      "thread": "01a1e526-970c-723d-81bd-f6d81c47d9ec"
    }
  },
  {
    "at": 1794845873961.986,
    "path": [
      "anima",
      "client",
      "terminal/01a1e526-9378-72b8-bc44-efbeea92ce23",
      "/mode"
    ],
    "track": "log",
    "data": "/daemon/memo/mode/srs/memo · thread #01a1e526-970c-723d-81bd-f6d81c47d9ec"
  },
  {
    "at": 1794845873962.0657,
    "path": [
      "anima",
      "client",
      "terminal/01a1e526-9378-72b8-bc44-efbeea92ce23",
      "/mode"
    ],
    "track": "stop",
    "data": null
  },
  {
    "at": 1794845873962.1003,
    "path": [
      "anima",
      "client",
      "terminal/01a1e526-9378-72b8-bc44-efbeea92ce23",
      "/mode"
    ],
    "track": "status",
    "data": {
      "timestamp": "2026-11-16T16:17:53.962Z",
      "code": "DONE"
    }
  },
  {
    "at": 1794845875560.0967,
    "path": [
      "anima",
      "client",
      "terminal/01a1e526-9378-72b8-bc44-efbeea92ce23",
      "/modes"
    ],
    "track": "log",
    "data": "/runtime/house\n/home/probe\n\n/daemon/memo\n/domain/srs\n/topography/latin\n/srs/memo…
  },
  {
    "at": 1794845875577.1707,
    "path": [
      "anima",
      "client",
      "terminal/01a1e526-9378-72b8-bc44-efbeea92ce23",
      "/nonsense"
    ],
    "track": "status",
    "data": {
      "timestamp": "2026-11-16T16:17:55.568Z",
      "code": "FAILED",
      "error": {
        "type": "Error",
        "message": "Not found",
        "code": "NOT_FOUND",
        "stack": "Error: Not found\n    at /Users/finn/vivalence/code/vivalence/systems/ghost/gesta…
      }
    }
  },
  {
    "at": 1794845875577.5205,
    "path": [
      "anima",
      "client",
      "terminal/01a1e526-9378-72b8-bc44-efbeea92ce23",
      "/nonsense"
    ],
    "track": "fault",
    "data": {
      "type": "Error",
      "message": "Not found",
      "code": "NOT_FOUND",
      "stack": "Error: Not found\n    at /Users/finn/vivalence/code/vivalence/systems/ghost/gestalt…
    }
  }
]
```

A status record carries `timestamp` when the owner is a `Controller` and none when it is the lighthouse (#4 vs #1). The bare line `break --fault fatal` (#31-34) closed `DONE` on the client while its server activity went `FAILED` — the fault lives only in the activity's steps and the assistant turn's `meta.fault`.

## 14 · harness

`harness(runtime, thread)` (`systems/anima/src/surfaces/chrome/panels/sidebar/sections.js:42-58`) resolves the seated thread's model against the host's cortex:

```js
{
  tier: "capable",
  effort: "low",
  rounds: 12,
  context: 0,
  model: {
    type: "dialogue",
    id: "stub-middle",
    tune: [
      0.6,
      0.6,
      0.5
    ],
    context: 1000000,
    channels: {
      in: [
        "text",
        "image",
        "document",
        "tool_result"
      ],
      out: [
        "text",
        "tool_use",
        "object"
      ]
    },
    provider: "stub",
    via: {
      render: ƒ anonymous,
      stream: ƒ anonymous
    }
  },
  models: [
    {
      type: "dialogue",
      id: "stub-deep",
      tune: [
        0.95,
        0.15,
        0.15
      ],
      context: 1000000,
      channels: {
        in: […4],
        out: […3]
      },
      provider: "stub",
      via: {
        render: ƒ anonymous,
        stream: ƒ anonymous
      }
    },
    {
      type: "dialogue",
      id: "stub-middle",
      tune: [
        0.6,
        0.6,
        0.5
      ],
      context: 1000000,
      channels: {
        in: […4],
        out: […3]
      },
      provider: "stub",
      via: {
        render: ƒ anonymous,
        stream: ƒ anonymous
      }
    },
    {
      type: "dialogue",
      id: "stub-quick",
      tune: [
        0.25,
        0.95,
        0.5
      ],
      context: 200000,
      channels: {
        in: […4],
        out: […3]
      },
      provider: "stub",
      via: {
        render: ƒ anonymous,
        stream: ƒ anonymous
      }
    }
  ]
}
```

`mode.metadata.harness` lands with `HARNESSED` (`systems/ghost/entities/mode/traits/harnessed.js:30`); it is three tries — `references` · `primer` · `tools` — each in the `{ branches, effect? }` shape `shape.strip` prints. Memo's, top level:

```js
{
  references: [
    "verbatim",
    "dialogue",
    "object",
    "choice",
    "picture"
  ],
  primer: [
    "magister"
  ],
  tools: [
    "srs",
    "review",
    "grade",
    "progress",
    "add",
    "explain",
    "session"
  ]
}
```

```json
{
  "branches": {
    "magister": {
      "branches": {},
      "effect": {}
    }
  }
}
```

```json
{
  "branches": {},
  "effect": {
    "input": {
      "type": "object",
      "required": [
        "card",
        "signal"
      ],
      "properties": {
        "card": {
          "type": "string",
          "description": "The card's slug, as /review or /session dealt it. Example: amor.noun"
        },
        "signal": {
          "anyOf": [
            {
              "type": "string",
              "const": "AGAIN"
            },
            {
              "type": "string",
              "const": "HARD"
            },
            {
              "type": "string",
              "const": "GOOD"
            },
            {
              "type": "string",
              "const": "EASY"
            }
          ],
          "description": "AGAIN · HARD · GOOD · EASY. Example: GOOD"
        }
      }
    },
    "valence": "Grade the card the learner just answered — AGAIN wrong or blank, HARD right with st…
  }
}
```

```json
{
  "branches": {},
  "effect": {
    "input": {
      "type": "object",
      "required": [
        "search"
      ],
      "properties": {
        "search": {
          "type": "string",
          "description": "The text to find. Example: love"
        },
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 20,
          "description": "How many cards, five when left out. Example: 5",
          "default": 5
        }
      }
    },
    "valence": "Find cards by any text — the slug, the learning side or its meaning. Use it before …
  }
}
```

```json
{
  "branches": {
    "render": {
      "branches": {},
      "effect": {}
    }
  }
}
```

The whole tree is 129336 chars of JSON for memo (3441 rows); the runtime's equivalent is snapshotted at `systems/runtime/tests/snapshots/harness-metadata.snapshot.json` (118698 chars).

A peek — `telemetry.jsx:339` — returns the primer prose as a string:

```js
"You are Magister, a Roman schoolmaster of spaced repetition, living inside a vivalence daemon.\n\n…
```

## 15 · repl — `shape.strip(terminal.repl.commands)`

`terminal.repl.commands` is a getter grafting the client's commands, every local mode's `repl`, and the content commands, then sieving (`systems/ghost/subjects/terminal/repl.js:34-60`). Stripped, it is the same `{ branches, effect }` tree; the 44 top natures:

```js
[
  "anima",
  "doctor",
  "help",
  "lighthouse",
  "runtime",
  "filter",
  "focus",
  "font",
  "popover",
  "repl",
  "sidebar",
  "telemetry",
  "inspector",
  "terminal",
  "theme",
  "widget",
  "widgets",
  "hello",
  "whoami",
  "activity",
  "abort",
  "pause",
  "resume",
  "stop",
  …(+20)
]
```

```json
{
  "branches": {
    "clear": {
      "branches": {},
      "effect": {
        "valence": "drop every record the logger holds; live activities stay. Example: /telemetry/c…
        "rank": "hidden"
      }
    }
  },
  "effect": {
    "input": {
      "type": "object",
      "properties": {
        "view": {
          "anyOf": [
            {
              "type": "string",
              "const": "logger"
            },
            {
              "type": "string",
              "const": "inspector"
            },
            {
              "type": "string",
              "const": "off"
            }
          ],
          "description": "Which tab the telemetry window shows, or off; absent toggles. Example: \"…
        }
      }
    },
    "valence": "the telemetry window: a logger over spans and activities, an inspector over the cli…
    "rank": "hidden"
  }
}
```

```json
{
  "branches": {},
  "effect": {
    "input": {
      "type": "object",
      "required": [
        "tier"
      ],
      "properties": {
        "tier": {
          "anyOf": [
            {
              "type": "string",
              "const": "frugal"
            },
            {
              "type": "string",
              "const": "fast"
            },
            {
              "type": "string",
              "const": "balanced"
            },
            {
              "type": "string",
              "const": "capable"
            },
            {
              "type": "string",
              "const": "unleashed"
            },
            {
              "type": "string",
              "const": "eager"
            }
          ],
          "description": "A tier. Example: \"fast\""
        }
      }
    },
    "valence": "the seated thread's model tier — INTELLIGENT.tier. Example: /tier fast"
  }
}
```

```json
{
  "branches": {},
  "effect": {
    "valence": "a bare line — a turn to the active terminal's mode, streamed onto the thread's span…
    "rank": "hidden"
  }
}
```

## 16 · what the panel builds from these

`inspect(…)` (`telemetry.jsx:171-237`) maps the objects above to eight tables of rows; `trees.modes` · `trees.harnesses` (`trees.js:142-195`) map hosts and modes to nodes. A tree node, REAL — `trees.modes(…)` run by the probe on the live objects, first host cut to its first child:

```json
{
  "id": "modes/runtime",
  "label": "runtime",
  "tag": "healthy",
  "note": "1 modes",
  "tone": "pos",
  "unit": false,
  "value": null,
  "acts": [
    {
      "kind": "copy",
      "k": "copy path",
      "text": "/runtime/house",
      "off": false,
      "hint": ""
    }
  ],
  "children": [
    {
      "id": "modes/runtime/manifest",
      "label": "manifest",
      "tag": "1",
      "note": "",
      "tone": "",
      "unit": false,
      "value": null,
      "acts": [],
      "children": [
        {
          "id": "modes/runtime/manifest/slug",
          "label": "slug",
          "tag": "",
          "note": "house",
          "tone": "",
          "unit": true,
          "value": null,
          "acts": [],
          "children": []
        }
      ]
    }
  ]
}
```

```js
[
  [
    "harness/daemon/memo/mode/srs/memo",
    [
      "tools:13",
      "primer:1",
      "references:7"
    ]
  ],
  [
    "harness/daemon/hello/mode/demo/hello-world",
    [
      "tools:18",
      "primer:5",
      "references:7"
    ]
  ]
]
```

An inspector table row, CODE-DERIVED from `telemetry.jsx:153-168` (the panel module needs `solid-js/web`, which the root import map lacks — see the failed probe below):

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:153
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
// telemetry.jsx:168
const act = (k, signal, off, tone) => ({ k, kind: "act", signal, off, tone });
```

A logger story node, CODE-DERIVED from `telemetry.jsx:37` and `:65-78` (rows broken to width):

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:37 — one per record.path
const node = { id, nature: record.path.at(-1), path: record.path, begun: null, sealed: null,
  fault: null, entries: [], tracks: [], children: [], clock, code: "IDLE" };
// telemetry.jsx:65 — one per activity
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
```

## 17 · what the captures show that the code does not say

Each a probe output, not a ruling.

- `JSON.stringify(mode)` THROWS `Converting circular structure to JSON` — `Mode.toJSON` (`systems/ghost/entities/mode/prototype.js:35-38`) strips `module` · `metadata` but keeps `entities`, set at `systems/ghost/entities/mode/hydration.js:8`. Same for the `modes` list (§8).
- `Turn` has no `toJSON`: its `$children` · `$notes` atoms serialize, nesting the whole chain under turn 0 (§6). `Buffer.toJSON` (`systems/ghost/entities/buffer/prototype.js:58-69`) strips six stores but keeps `$label` · `$notes` · `hooks` · `on` (§7).
- `activity.error` reads `undefined` always: `Activity` declares only `set error` (`systems/ghost/entities/activity/prototype.js:19-21`), no getter; the RUNNING form shows no `error` key or getter, the FAILED JSON none either. `telemetry.jsx:72` reads `activity.error`; the fault sits in `activity.controller.status.reflection.error` (§12).
- `activity.buffer` is `undefined` in every capture; `activity.user` is an id string while `thread.user` is the whole user object.
- `terminal.trait` is `{}` and `terminal.traits` `[]` after hydration casts `DOCKED` (`systems/ghost/subjects/terminal/hydration.js:5-7`); `dock` still answers from the client · user layers and `DEFAULT_DOCK`.
- The lighthouse table shows `$status` raw — `AUTHENTICATED` here — while the sidebar shows `standing(lighthouse)` = `VERIFIED` when authorized (`sections.js:108`); one standing, two readings.
- `bridge.$terminal` · `$theme` · `$font` · `telemetry.$state` persist in `localStorage`: a probe run on a reused origin read `$terminal: "t1"` off this machine.

## 18 · probes

| file | what | result |
|---|---|---|
| `.ikiro/reference/inspector-rework/entities.probe.js` | boots the world, drives the client, prints every object above | rc 0, three runs |
| `.ikiro/reference/inspector-rework/form.probe.js` | the true-form printer the probe uses | — |
| `import(".../telemetry/telemetry.jsx")` from Deno | run `inspect` · `view` on the live objects | FAILED, below |

```
error: Uncaught (in promise) TypeError: Import "solid-js/web" not a dependency
  and not in import map from "file:///Users/finn/vivalence/code/vivalence/
  systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx"
  hint: If you want to use the npm package, try running `deno add npm:solid-js/web`
# one error, broken at 100 chars
```

Existing snapshot JSONs read for this census: `subsystems/typology/tests/snapshots/trait-thread.snapshot.json` · `mode-entity.snapshot.json` · `view-entity.snapshot.json` · `trace.snapshot.json` (schemas and a `trace` tree, none an instance the panel holds) and `systems/runtime/tests/snapshots/span-tracked.snapshot.json` · `harness-metadata.snapshot.json` (runtime side).
<!-- writer: agent · reference, uncapped · written 2026-11-16 · the client architecture (ghost die + anima/tty chromes) around the telemetry inspector, for a design agent -->
# 2 · the client — architecture census for the inspector rework

Read on the live tree, 2026-11-16. Every claim cites `file:line`, repo-rooted. Code is quoted, trimmed to 100 chars; `…` marks a cut.

The ONE fact to hold: **ghost owns the client** (`systems/ghost/`), anima (`systems/anima/src/`) and the tty chrome (`systems/ghost/surfaces/chrome/`) are two SURFACES over the same `App`.

## 0 · the shape in one tree

```text
App                                   systems/ghost/subjects/app/prototype.js:4
├── client: Client                    systems/ghost/subjects/client/prototype.js:19
│   ├── controller (Span "client")    ← the logger reads its $history
│   ├── mask · instance · register    ← paladin, set by the page/shell die
│   ├── modes {type:{slug:Mode}}      ← LOCAL modes (registry), client/lifecycle/index.js:10
│   ├── aperture: Aperture            ← served BACK over the multiplex, client/prototype.js:3
│   └── runtime: Runtime              systems/ghost/entities/runtime/prototype.js:3
│       ├── $status                   IDLE · MOUNTING · HEALTHY · UNAVAILABLE · ERROR · RELEASED
│       ├── multiplex · connection    ← ONE WebSocket, client/factory.js:21
│       ├── lighthouse: Lighthouse    systems/ghost/entities/lighthouse/prototype.js:4
│       │   └── $authority · $user · $status · $isAuthorized · $isIdentified
│       └── entities: Dataspace       subsystems/typology/prototypes/dataspace.js:15
│           ├── daemon  .$entities    → Daemon { $status, entities (branch), modes }
│           ├── mode    .$entities    → Mode { repl, keymap, call, harness, metadata }
│           ├── thread  .$entities    → Thread { $buffers, $phase, $turns, $activities }
│           ├── terminal.$entities    → Terminal (a SUBJECT, see below)
│           ├── buffer  .$entities    → Buffer { $views $files $data $bundle $traits $trait $label }
│           ├── turn · activity · view · file · literal · symbol · note
├── surface: chrome                   anima: src/surfaces/index.js:4 · tty: ghost surfaces/
├── controller (Span "app")
├── box: Box                          ← drivers.audio · device.microphone · device.speaker
├── bridge: Bridge                    ← 17 screen stores, 3 persisted
└── telemetry: Telemetry              ← $state (persisted) · $logger (getter)

Terminal                              systems/ghost/subjects/terminal/prototype.js:8
├── $thread · $buffer                 ← the seated thread, the framed buffer
├── repl: Repl                        ← $catalog · commands (getter) · dispatch(typed)
├── legend: Legend                    ← $chord · presses (Queue) · keymap (getter)
├── stall: Stall                      ← refills buffers by thread.phase
├── client · repository · controller  ← set at hydration, terminal/hydration.js:8
└── dock (getter)                     ← DEFAULT_DOCK ⊕ mask ⊕ user ⊕ terminal DOCKED
```

The one store graph the panels read is this tree; there is no second state container.

# 1 · boot — page load to a mounted chrome

## 1.1 · the page die (anima)

`systems/anima/src/client.js` is the whole entry: paladin seats the instance, ghost mints the client, the App runs ghost's lifecycle.

```js
// systems/anima/src/client.js:6
const instance = await factories.instance(paladin.instance); // @beef still dont like this.
await paladin.ledger.registry.supply();
const die = {
  controller: new Controller({ stdout: new Span("anima") }),
  instance,
  mask: instance.mask("anima"),
};
die.register = await paladin.ledger.registry.wire(die.mask);
```

```js
// systems/anima/src/client.js:39
  const client = await ghost.client.factory(die);
  client.app = new ghost.app.App({
    client,
    surface: chrome,
    controller: die.controller.branch("app"),
  });
  await steer.dispatch.execute(
    new Vector()
      .graft(ghost.app.lifecycle.execution) //
      .use(logging),
    client.app,
  );
```

- `pagehide` kills the page controller with SIGTERM: `systems/anima/src/client.js:16`.
- `logging` replays the client span's history, then taps it into `console`: `systems/anima/src/client.js:18-36` (only tracks `log` · `fault`, `:20`).
- the tty twin of this die is `systems/ghost/subjects/shell/commands/chrome.js:9-19` (beats `seat` · `ledger` · `runtime`, then the same factory + App).

## 1.2 · the client factory — a kleisli, returns at RUNNING

```js
// systems/ghost/subjects/client/factory.js:46
export const factory = monad.kleisli([
  (shellDie) => new Client({ controller: shellDie.controller.branch("client"), … }),
  (clientDie) =>
    Object.assign(clientDie, {
      runtime: new Runtime({
        remote: new Url(clientDie.instance.runtime.statics.remote),
        lighthouse: Object.assign(new Lighthouse(), { stdout: … }),
      }),
    }),
  connected,
  ...shape.monad.ready(execution),
]);
```

- `ready` = `[idle, dispatch(execution), controlled]`: `subsystems/typology/gestalten/shape/monad.js:24`.
- `controlled` resolves when the client controller goes `RUNNING`: `subsystems/typology/gestalten/belt/control.js:4`.
- So the factory returns after `connected` and the FIRST beat; the rest of the client lifecycle runs while the App mounts. Nobody awaits sign-in; the chrome's cover gates on it (§4.2).

`connected` is the one place the wire is built:

```js
// systems/ghost/subjects/client/factory.js:19
export const connected = async (clientDie) => {
  const runtime = clientDie.runtime;
  runtime.multiplex = shard.transmitter.multiplex({
    authority: runtime.lighthouse.$authority, vector: clientDie.aperture });
  runtime.connection = new Connection(runtime.remote, shard.transmitter.retry(runtime.multiplex, …))
    .use(shard.track.request())
    .use(shard.track.fault())
    .use(shard.connection.authorize(runtime.lighthouse.$authority))
    .use(shard.connection.timeout(8000));
  …
    runtime.lighthouse.manifest = await runtime.connection.call("/lighthouse/metadata");
    runtime.manifest = await runtime.connection.call("/beacon/manifest");
  …
  runtime.reference = new Path(`/runtime/${runtime.manifest.slug}`);
  runtime.aperture = runtime.connection.branch(runtime.reference.absolute);
  runtime.entities = new Dataspace({ runtime, entities: { daemon, mode, thread, … }, seed });
```

## 1.3 · the client lifecycle — nine beats

```js
// systems/ghost/subjects/client/lifecycle/index.js:91
export const execution = new Vector()
  .use(shard.controller.open)
  .use(modes)
  .use(connection)
  .use(authorized)
  .use(dataspace)
  .use(subscribed)
  .use(hosts)
  .use(terminals)
  .use(staggered)
  .do(shard.controller.hold);
```

| beat | file:line | wire |
|---|---|---|
| `modes` | `systems/ghost/subjects/client/lifecycle/index.js:10` | none (registry `register.modes`) |
| `connection` | `systems/ghost/subjects/client/lifecycle/index.js:22` | `multiplex.close()` in `finally` |
| `authorized` | `systems/ghost/subjects/client/lifecycle/index.js:30` | `/lighthouse/verify` · `/refresh` · … |
| `dataspace` | `systems/ghost/subjects/client/lifecycle/index.js:33` | `/runtime/<slug>/metadata/datamap` |
| `subscribed` | `systems/ghost/subjects/client/lifecycle/index.js:39` | `/find` + `/subscribe` per repository |
| `hosts` | `systems/ghost/subjects/client/lifecycle/index.js:58` | `/status` · `/metadata/*` per host |
| `terminals` | `systems/ghost/subjects/client/lifecycle/index.js:63` | none (`stall.watch()` per terminal) |
| `staggered` | `systems/ghost/subjects/client/lifecycle/index.js:82` | mask traits, e.g. `HOME` |
| `hold` | `systems/ghost/subjects/client/lifecycle/index.js:101` | — |

`authorized` composes the lighthouse lifecycle: restore from the vault, verify, run its traits, then WAIT for `$isAuthorized`:

```js
// systems/ghost/entities/lighthouse/lifecycle/index.js:25
export const authorized = async (lighthouseDie, next) => {
  await Promise.race([
    belt.atom.until(lighthouseDie.client.runtime.lighthouse.$isAuthorized, Boolean, …),
    control.hold(lighthouseDie.controller)]);
```

- `credentials` (vault restore · `verify` · persist on `$authority` change): `systems/ghost/entities/lighthouse/lifecycle/index.js:5-18`.
- lighthouse traits `AUTOLOGIN` · `INVITATIONAL` · `JOINABLE`: `systems/ghost/entities/lighthouse/traits/*.js`; only `AUTOLOGIN` acts (`autologin.js:1`).
- the standings enum: `systems/ghost/entities/lighthouse/standings.js:1`.
- another user's sign-in drops every cached entity and re-subscribes: `systems/ghost/subjects/client/lifecycle/index.js:42-48`.

`hosts` boots the runtime and every daemon as their own kleislis over one host shard:

```js
// systems/ghost/entities/runtime/lifecycle/index.js:4
export const execution = new Vector().use(shard.controller.open).use(host.status("runtime"))
  .use(host.metadata("runtime")).use(host.cortex("runtime")).use(host.mounted("runtime"))
  .do(shard.controller.hold);
```

- `status` sets `MOUNTING`, reads `/status`, subscribes `/status/subscribe`: `systems/ghost/gestalten/shard/host.js:8-29`.
- `metadata` reads `/metadata/manifest` · `/metadata/statics` · `/metadata/aperture`, wires `call`: `systems/ghost/gestalten/shard/host.js:31-37`.
- `cortex` reads `/metadata/cortex`: `systems/ghost/gestalten/shard/host.js:39-42`.
- `mounted` staggers each mode's `REPLING · KEYMAPPED · EXPOSED · HARNESSED`, sets `HEALTHY`: `systems/ghost/gestalten/shard/host.js:44-58`.
- the daemon twin adds an `entities` beat (`literal symbol note mode` branched): `systems/ghost/entities/daemon/lifecycle/index.js:4-9`.

## 1.4 · the App lifecycle — mount is a beat

```js
// systems/ghost/subjects/app/lifecycle.js:30
export const execution = new Vector()
  .use(shard.controller.open)
  .use(client)
  .use(bundle)
  .use(mount)
  .do(shard.controller.hold);
```

- `client` ties App abort to the client's settle: `systems/ghost/subjects/app/lifecycle.js:9-19`.
- `bundle` calls `surface.bundle()`; anima's is a no-op `bytes: 0`: `systems/anima/src/surfaces/index.js:5`.
- `mount` calls `surface.mount(appDie)`, unmounts in `finally`: `systems/ghost/subjects/app/lifecycle.js:21-28`.

## 1.5 · anima's mount — what it seeds before the first paint

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

- viewport → `bridge.$viewport` on resize and the `(max-width: 767px)` query: `mount.jsx:40-49`.
- DOM focus → `bridge.$focus` from the nearest `[data-focus]`: `mount.jsx:50-58`.
- sidebar width seeded from `SIDEBAR.width`: `mount.jsx:59`.
- `LOGGED_OUT` clears the sign-in password: `mount.jsx:70-73`.
- dapper tokens emitted into one `<style data-dapper=tokens>`: `mount.jsx:10-19`.
- Solid `render` of `<Cover/>` under the `app` ambient: `mount.jsx:21-37`.

## 1.6 · the wire — what talks to what

ONE WebSocket per origin carries every request; SSE-shaped streams ride its frames.

```js
// subsystems/typology/gestalten/shard/transmitter.js:15
export function multiplex({ authority, mount = "/multiplex", vector, connect } = {}) {
  const open = connect ?? ((address) => new WebSocket(address));
```

```js
// subsystems/typology/gestalten/shard/transmitter.js:106
      if (request.headers.get("accept") === "text/event-stream") {
        response.status = 200;
        response.body = follow(socket, frame, request, abort);
        return;
      }
```

- the token rides the socket URL as `?token=` and each frame: `transmitter.js:32-34` · `:97`.
- `Connection.subscribe` = a reconnecting `stream` with `accept: text/event-stream`: `subsystems/typology/prototypes/connection.js:118` · `:152`.
- `Connection.branch(path)` returns a child connection, middleware inherited: `subsystems/typology/prototypes/connection.js:48-52`.
- the multiplex is BIDIRECTIONAL: `vector: clientDie.aperture` (`factory.js:21`) lets the runtime call the client. The client serves `/terminal/:terminal/repl` + `/metadata/repl` (`systems/ghost/subjects/client/prototype.js:3-17`), armed once by a `LOOPING` mode (`systems/ghost/entities/mode/traits/looping.js:1`).

Endpoints the client calls, by owner:

| endpoint | file:line |
|---|---|
| `/lighthouse/metadata` | `systems/ghost/subjects/client/factory.js:29` |
| `/beacon/manifest` | `systems/ghost/subjects/client/factory.js:30` |
| `/lighthouse/{login,signup,autologin}` | `systems/ghost/entities/lighthouse/prototype.js:50-60` |
| `/lighthouse/{verify,refresh,logout}` | `systems/ghost/entities/lighthouse/prototype.js:80` · `:101` · `:131` |
| `/runtime/<slug>/metadata/datamap` | `subsystems/typology/prototypes/dataspace.js:30` |
| `/userspace/entities/{terminal,thread,buffer}` | `systems/ghost/subjects/terminal/repository.js:4` · `entities/thread/repository.js:4` · `entities/buffer/repository.js:6` |
| `/runtime/<slug>/entities/{mode,daemon}` | `systems/ghost/entities/mode/repository.js:4` · `entities/daemon/repository.js:4` |
| `/daemon/<slug>/…` | `systems/ghost/entities/daemon/hydration.js:5-7` |
| `<host>/mode/<type>/<slug>/metadata/{aperture,harness,repl}` | `entities/mode/traits/exposed.js:4` · `harnessed.js:30` · `repling.js:5` |
| `<mode>/harness/dialogue/stream` | `systems/ghost/gestalten/belt/harness.js:5` |
| `/userspace/entities/activity/<id>/stdin/<SIG>` | `systems/ghost/entities/activity/hydration.js:5-6` |
| `<mode>/metadata/harness/primer/<path>` | `systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:339` |

## 1.7 · entities — RemoteRepository, one store per kind

```js
// subsystems/typology/prototypes/dataspace.js:19
    for (const [name, entity] of Object.entries(entities)) {
      const repository = entity.repository(this);
      const boot = new Vector().use(context.bind("repository", repository))
        .use(context.bind("dataspace", this));
      seed(boot);
      boot.graft(entity.hydration).do(async () => {});
      this.em.register(name, repository, shape.selbstbestimmt(boot, strategy));
      this[name] = repository;
```

- `runtime.entities.<kind>` IS the repository; `.$entities` is its nanostores atom (`entity-manager.js:52`).
- repository verbs: `find` · `findOne` · `create` · `upsert` · `ensure` · `updateOne` · `update` · `removeOne` · `merge` · `subscribe`: `subsystems/typology/prototypes/remote-repository.js:69-184`.
- a subscription event `op: "delete"` drops, else merges: `remote-repository.js:159-169`.
- `dataspace.branch(connection, kinds)` mints repositories scoped to a host or mode, SHARING the em's stores: `dataspace.js:43-45`; used at `entities/mode/hydration.js:8` · `entities/daemon/lifecycle/index.js:5`.
- every hydration gets `client` and `runtime` bound: `systems/ghost/subjects/client/factory.js:40`.

# 2 · the subject model — who owns what

## 2.1 · App — the screen's owner

```js
// systems/ghost/subjects/app/prototype.js:4
export class App {
  client = null;
  surface = null;
  controller = null;
  box = new Box(this);
  bridge = new Bridge();
  telemetry = new Telemetry(this);
```

- theme = bridge › mask `THEMED` › user `THEMED` › `"porcelain"`: `systems/ghost/subjects/app/prototype.js:16-18`.
- `box.device.microphone` · `.speaker` · `drivers.audio`: `systems/ghost/subjects/app/prototypes/box/index.js:5-14`.

## 2.2 · Bridge — the screen's state, one `$atom` each

```js
// systems/ghost/subjects/app/prototypes/bridge.js:5
  $terminal = persistentAtom("viva.bridge.terminal", null, { encode: …, decode: … });
  $viewport = atom({ width: null, height: null, narrow: false });
  $focus = atom("dock.input");
  $focusHistory = atom([]);
  $sidebar = atom({ open: false, width: 39 });
  $draft = atom("");
  $selected = atom(0);
  $hidden = atom([]);
  $theme = persistentAtom("viva.bridge.theme", null, …);
  $font = persistentAtom("viva.bridge.font", "base", …);
  $popover = atom(null);
  $phonePane = atom("dock");
  $widget = atom(null);
  $float = atom({});
  $selection = atom(null);
  $signin = atom({ user: "", pass: "" });
  $sections = atom({ filter: {}, expand: {}, peeks: {}, pick: null, hostsOff: …, traits: … });
```

- each store ships a plain getter: `bridge.js:27-93`.
- focus history keeps the last 6: `bridge.js:24`.

## 2.3 · Telemetry — the inspector's own subject

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
```

- `$logger` is the CLIENT span's history; every child span (`terminal/<id>`, a repl signal's pathname, a mode's reference, `lighthouse`) taps into it: `subsystems/typology/prototypes/span.js:30-33`.
- the history caps at `Span.limit = 1000` records: `subsystems/typology/prototypes/span.js:24` · `:32`.
- record tracks: `start stop request response fault log entity status`: `subsystems/typology/prototypes/span.js:13-21`.
- `$state` fields written anywhere: `open view filter selection since window` (here) + `point folds picked queries peeks` (`systems/anima/src/surfaces/chrome/mount.jsx:62-68`).

## 2.4 · Client — the die everything hangs off

- fields: `controller instance mask register app modes aperture looping runtime`: `systems/ghost/subjects/client/prototype.js:19-32`.
- `user` getter falls to `{}` before sign-in: `systems/ghost/subjects/client/prototype.js:38-44`.
- `client.modes` are LOCAL (registry) modes; host modes live on `runtime.entities.mode`: `systems/ghost/subjects/client/lifecycle/index.js:11-12` vs `systems/ghost/entities/runtime/prototype.js:25-27`.
- client trait `HOME` seats a fresh thread on every terminal with `thread === null`: `systems/ghost/subjects/client/traits/home.js:4-30`.

## 2.5 · Terminal — an entity that RUNS

```js
// systems/ghost/subjects/terminal/prototype.js:16
  client = null;
  repository = null;
  controller = null;
  repl = new Repl(this);
  legend = new Legend(this);
  stall = new Stall(this);
  $thread = atom(null);
  $buffer = atom(null);
```

```js
// systems/ghost/subjects/terminal/prototype.js:43
  get dock() {
    return { ...belt.dock.DEFAULT_DOCK, ...this.client.mask.trait.DOCKED,
      ...this.client.runtime.lighthouse.user.trait.DOCKED, ...this.trait.DOCKED };
  }
```

- persisted on the runtime (`/userspace/entities/terminal`); the shown one is `bridge.$terminal`: `systems/ghost/subjects/terminal/repository.js:4`.
- writes go through the repository: `setThread` · `setBuffer`: `systems/ghost/subjects/terminal/prototype.js:56-66`.
- hydration casts `DOCKED`, binds `client` · `repository` · `controller` (`terminal/<id>` span): `systems/ghost/subjects/terminal/hydration.js:3-11`.
- `DEFAULT_DOCK` `{align: right, share: 0.38, view: full, shown: full, lens: [turns, harness], markdown: pretty}`: `systems/ghost/gestalten/belt/dock.js:3`.
- the stall's one live phase `/manual`: `systems/ghost/subjects/terminal/stall.js:11-26` (`/inert` · `/continuous` commented out, `:5` · `:28`).

## 2.6 · Thread · Mode · Buffer — derived stores at hydration

```js
// systems/ghost/entities/thread/hydration.js:6
  ctx.entity.trait = belt.traits.cast(ctx.entity, v.thread.traits);
  ctx.entity.$buffers = computed(ctx.runtime.entities.buffer.$entities, (buffers) => …);
  ctx.entity.$phase = computed(ctx.runtime.entities.thread.$entities, () => ctx.entity.phase);
  ctx.entity.$turns = computed(ctx.runtime.entities.turn.$entities, (turns) => …);
  ctx.entity.$activities = computed(ctx.runtime.entities.activity.$entities, …);
```

- `thread.word` = `LABELED.name` › `"thread"` › mode slug, a `[[predicate, tag]]` table: `systems/ghost/entities/thread/prototype.js:3-8`.
- mode hydration gives `reference` · `connection` · `entities` (8 kinds branched): `systems/ghost/entities/mode/hydration.js:3-9`.
- mode fields `repl keymap metadata connection call harness status stdout`: `systems/ghost/entities/mode/prototype.js:3-20`.
- buffer stores `$views $files $data $bundle $traits $trait $label`: `systems/ghost/entities/buffer/prototype.js:4-56`.
- activity status = its controller's code; signals go to `/stdin/<SIG>`: `systems/ghost/entities/activity/prototype.js:13-21` · `hydration.js:6`.
- daemon · runtime carry `$status` and `metadata {manifest, statics, aperture}`: `systems/ghost/entities/daemon/prototype.js:10-16` · `systems/ghost/entities/runtime/prototype.js:8-16`.
- lighthouse stores `$authority $user $status $isAuthorized $isIdentified`: `systems/ghost/entities/lighthouse/prototype.js:5-9`.

# 3 · the dispatch shape

## 3.1 · one repl per terminal; `commands` is a GETTER

```js
// systems/ghost/subjects/terminal/repl.js:34
  get commands() {
    return steer.trie.sieve(new Vector().graft(
      commands.system.anima,
      …
      ...(this.terminal.client.app === null ? [] : [
        commands.surface.filter,
        …
        commands.surface.telemetry,
        …
      ]),
      ...fromm.modes(this.terminal.client.modes).flat.map((mode) => mode.repl),
      commands.content.activity,
      …
      ...(is.object(this.terminal.mode) ? [this.terminal.mode.repl] : []),
    ), (pattern) => pattern.rank !== "void");
  }
```

- the order IS the precedence: system → surface (only with an App) → local modes → content → the seated mode; later wins: `systems/ghost/subjects/terminal/repl.js:35-70`.
- `/quit` only on a tty: `repl.js:40`.

```js
// systems/ghost/subjects/terminal/repl.js:73
  dispatch(typed) {
    const signal = new ReplSignal(typed);
    const replDie = {
      signal,
      client: this.terminal.client,
      runtime: this.terminal.client.runtime,
      terminal: this.terminal,
      controller: this.terminal.controller.branch(signal.pathname),
      repl: this,
      output: undefined,
    };
    return steer.dispatch.execute(execution, replDie).then(() => replDie.output);
  }
```

- every signal gets its own span `terminal/<id>/<pathname>`; `answered` logs a non-undefined output as an outline: `repl.js:7-11`.
- a bare line (no `/`) becomes nature `*`: `subsystems/typology/prototypes/replsignal.js:6`; `*` is the turn command → `belt.harness.stream`: `systems/ghost/gestalten/commands/content/turn.js:4-11`.
- the palette: `narrow` · `submit`, both reset `bridge.$draft` · `$selected`: `repl.js:87-105`.
- `/repl` fills `$catalog` from `shard.keymap.catalog(commands)`: `systems/ghost/gestalten/commands/system/repl.js:9-15`.
- a `rank: "hidden"` command stays out of the catalog: `systems/ghost/gestalten/shard/keymap.js:34`.

## 3.2 · commands — files are OBJECTS, three folders

```text
systems/ghost/gestalten/commands/
├── system/   anima doctor help leader lighthouse quit repl runtime set
├── surface/  cell dock filter focus font frame popover sidebar telemetry theme widget
└── content/  activity buffer detach dictate harness mode terminal thread turn
```

A command is a Vector leaf: `nature` · `valence` · `input` · `chord` · `rank`, body `(ctx)`.

```js
// systems/ghost/gestalten/commands/surface/sidebar.js:22
  .open(
    { nature: "/sidebar/toggle", rank: "hidden", valence: "the sidebar flipped — …",
      chord: "leader/d/b" },
    (ctx) => shown(ctx, !ctx.client.app.bridge.sidebar.open),
  )
```

## 3.3 · keys — the legend walks presses over a keymap GETTER

```js
// systems/ghost/subjects/terminal/legend.js:38
  get keymap() {
    return new Vector().graft(
      keymap.fromRepl(this.terminal.repl.commands),
      ...(this.terminal.client.app === null ? [] : [app.keymap]),
      ...fromm.modes(this.terminal.client.modes).flat.map((mode) => mode.keymap),
      ...(is.object(this.terminal.mode) ? [this.terminal.mode.keymap] : []),
      ...(this.terminal.repl.catalog === null ? [] : [app.closing, app.selecting]),
    );
  }
```

- `fromRepl` turns every command's `chord` into a key leaf whose effect is the command's signal: `systems/ghost/gestalten/shard/keymap.js:7-10`.
- `dispatch(event)` only enqueues; the leader is `ctrl-v` (`meta-v` in a non-apple browser): `legend.js:26-36` · `:48-50`.
- `traverse`: effect → flush + run · dead end → flush · prefix → `$chord` = the stripped node: `legend.js:52-59`.
- a string effect becomes `ctx.output` and is re-dispatched as a repl signal: `legend.js:61-66` + `subsystems/typology/gestalten/steer/strategy.js:13-17`.
- the leader's six groups `e a h d s w`: `systems/ghost/subjects/app/keymap.js:4-10`.
- anima binds `keydown` inside the shown terminal's keyed `Show`: `systems/anima/src/surfaces/chrome/layout.jsx:138-142`; tty: `useKeyboard`, `systems/ghost/surfaces/chrome/layout.jsx:106`.

## 3.4 · how a panel sends a signal — `sent`

Each panel inlines the same one-liner; a fault lands on the terminal's span (so in the logger):

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:260
  const sent = (signal) => terminal.repl.dispatch(signal)
    .catch((error) => terminal.controller.stdout.fault(error));
```

- the same line: `panels/dock/textarea.jsx:59` · `panels/dock/journal.jsx:240`; inline at `panels/headline/headline.jsx:20` · `panels/sidebar/sidebar.jsx:49` · `layout.jsx:33-37`.
- `systems/anima/src/surfaces/chrome/send.js:1` exports the same as `send(terminal, signal)`; grep shows ZERO importers.
- a part never dispatches: it calls `onLine(signal)` and the panel passes `sent` (e.g. `telemetry.jsx:273` · `:361`).
- a palette key goes through the legend, never the repl: `terminal.legend.dispatch("leader")` at `panels/modeline/modeline.jsx:22-23` · `panels/sidebar/sidebar.jsx:28-29`.

# 4 · the surface

## 4.1 · ambient — two slots, ghost-owned

```js
// systems/ghost/gestalten/ambient.js:3
export const ambient = (key, schema) => {
  const slot = createContext();
  const consume = () => {
    const value = useContext(slot);
    if (value === undefined) throw new Error(`[ambient] ${key}: consumed outside its Provider`);
    return value;
  };
  return { key, schema, Provider: slot.Provider, consume, Consumer: … };
};
```

- anima declares `app` and `terminal`: `systems/anima/src/surfaces/chrome/ambient/index.js:4-5`; tty, the same two: `systems/ghost/surfaces/chrome/ambient/index.js:4-5`.
- `app` is provided at mount (`mount.jsx:27`), `terminal` inside the keyed `Show` (`layout.jsx:144`).

## 4.2 · the cover — a `[[predicate, Pane]]` table

```js
// systems/anima/src/surfaces/chrome/panels/cover/cover.jsx:14
export const COVERS = [
  [(app) => !app.client.runtime.lighthouse.isAuthorized && settled(app.client.runtime.lighthouse),
    Signin],
  [(app) => !app.client.runtime.lighthouse.isAuthorized ||
      app.client.runtime.entities.terminal.$entities.get().length === 0,
    Booting],
  [() => true, Layout],
];
```

- `Cover` sets `data-theme` on `<html>` and the root font size from `FONTS[bridge.font]`: `cover.jsx:48-56`.
- the tty twin, same table: `systems/ghost/surfaces/chrome/mount.jsx:23-29`.

## 4.3 · the layout — `<Show>` IS the lifecycle

```js
// systems/anima/src/surfaces/chrome/layout.jsx:132
export function Layout() {
  const app = ambient.app.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const id = from(app.bridge.$terminal);
  const shown = () => terminals().find((terminal) => terminal.id === id()) ?? terminals()[0];
  return (
    <Show when={shown()} keyed fallback={<Booting />}>
```

`Seated` stacks the regions; the telemetry window is the last one:

```text
Seated                              systems/anima/src/surfaces/chrome/layout.jsx:88
├── Headline                        (not narrow)               :103-105
├── .body
│   ├── Sidebar + Sbseam            (sidebar.open | pane)      :107-112
│   └── Split                       :27-51
│       ├── Frame                   (dock.view ≠ full)
│       ├── Seam                    (docked)
│       └── Dock                    (dock.view ≠ closed)
├── Panel = Legend + Repl           (hidden unless $chord | $catalog) :76-86
├── Modeline                        :118
├── [data-r=widget]   Widget        :119-121
├── [data-r=popover]  Popover       :122-124
└── [data-r=telemetry] Telemetry    :125-127
```

- `layout({dock})` maps `dock.view` to `floating · frame · dock · both`: `layout.jsx:18-23`.
- the dock divider dispatches `/split <share>`: `layout.jsx:33-37`.
- the sidebar seam writes `bridge.$sidebar` directly during the drag: `layout.jsx:55-74`.

## 4.4 · panels — the barrel

```js
// systems/anima/src/surfaces/chrome/panels/index.js:1
export * as authentication from "./authentication/signin.jsx";
export * as booting from "./booting/booting.jsx";
export * as cover from "./cover/cover.jsx";
export * as dock from "./dock/dock.jsx";
…
export * as telemetry from "./telemetry/telemetry.jsx";
export * as trees from "./telemetry/trees.js";
```

16 entries, `systems/anima/src/surfaces/chrome/panels/index.js:1-16`. The layout imports panels by path, not via this barrel (`layout.jsx:5-14`).

## 4.5 · drapes parts — props in, `on*` out

```js
// subsystems/drapes/parts.js:39
export { Tele, TABS as TELE_TABS, placed } from "./Tele.jsx";
export { Logger, TONES as LOGGER_TONES, ms, tone } from "./Logger.jsx";
export { Inspector, KINDS as INSPECTOR_KINDS, grouped, setting, stepped } from "./Inspector.jsx";
export { Tree } from "./Tree.jsx";
```

- `@vivalence/drapes/parts` → `parts.js`, 43 export rows: `subsystems/drapes/deno.jsonc:6` · `subsystems/drapes/parts.js:1-43`.
- `grep -lw client subsystems/drapes/*.jsx` → 0; `grep ambient subsystems/drapes/*.jsx` → 0. A part takes plain data and callbacks; ambient is consumed by the CLIENT's panels only.
- `listing(store)` reads a Solid accessor to an array, `[]` when absent: `subsystems/drapes/hold.js:48`.
- a part writes a signal string and hands it up, never dispatches:

```js
// subsystems/drapes/Inspector.jsx:18
export const setting = (row, value) => `/set ${row.path} ${value}`;
```

- the inspector's row kinds `ro enum bool num text set act`: `subsystems/drapes/Inspector.jsx:22-123`; unknown kind THROWS: `:125-128`.
- `Tele` clamps its frame to the viewport (`FLOOR 320×200`, `GUTTER 4`): `subsystems/drapes/Tele.jsx:4-14`; it sits in zone `3`: `Tele.jsx:43`.
- CSS lives in `@vivalence/drapes/parts.css`, imported once at `systems/anima/src/surfaces/chrome/mount.jsx:4`.

## 4.6 · persistence — `persistentAtom("viva.<subject>.<field>")`

| key | file:line |
|---|---|
| `viva.bridge.terminal` | `systems/ghost/subjects/app/prototypes/bridge.js:5` |
| `viva.bridge.theme` | `systems/ghost/subjects/app/prototypes/bridge.js:13` |
| `viva.bridge.font` | `systems/ghost/subjects/app/prototypes/bridge.js:14` |
| `viva.telemetry.state` | `systems/ghost/subjects/app/prototypes/telemetry.js:4-8` |
| `viva.mode.<slug>` | `subsystems/drapes/context/preferences.js:4` |

Everything else on the Bridge is session-only (`atom`). Terminal dock and thread settings persist on the RUNTIME through repository writes (§5.4), not in local storage.

# 5 · the telemetry panel in all this

## 5.1 · where it sits

- mounted inside `Seated`, so only with a shown terminal and past sign-in: `systems/anima/src/surfaces/chrome/layout.jsx:125-127`.
- opens on `telemetry.state.open`: `systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:369`.
- a floating window, `x y width height` in px, default `WINDOW = {x: 0, y: 48, width: 600, height: 420}`: `telemetry.jsx:17`.
- two tabs `logger` · `inspector`: `subsystems/drapes/Tele.jsx:4`; the panel maps them via `TABS`: `telemetry.jsx:366`.

## 5.2 · the commands that drive it

```js
// systems/ghost/gestalten/commands/surface/telemetry.js:17
const SHOWN = [
  [(view) => view === undefined, (held) => ({ ...held, open: !held.open })],
  [(view) => view === "off", (held) => ({ ...held, open: false })],
  [() => true, (held, view) => ({ ...held, open: true, view })],
];
```

| signal | input | chord | file:line |
|---|---|---|---|
| `/telemetry` | `logger · inspector · off · ∅` | `leader/s/t` | `commands/surface/telemetry.js:24-32` |
| `/inspector` | `client · runtime · lighthouse · terminal · thread · buffers · activities · telemetry · modes · harness` | — | `commands/surface/telemetry.js:33-44` |
| `/telemetry/clear` | — | — | `commands/surface/telemetry.js:45-50` |
| `/set <path> <value>` | 11 paths | — | `commands/system/set.js:66-74` |
| `/pause · /resume · /stop · /abort` | — | `leader/a/{p,c,s,k}` | `commands/content/activity.js:10-22` |

- `/telemetry/clear` only moves `since`; records stay in the span: `commands/surface/telemetry.js:47-48`.
- `/set` paths: `terminal.dock.{view,align,lens,share,markdown}` · `thread.{label,tier,effort,rounds}` → repository `updateOne` with `traits.patch`: `commands/system/set.js:6-44`.
- `/set` adds `bridge.sidebar` · `bridge.hidden` only with an App: `commands/system/set.js:46-62`.
- an unknown path THROWS, listing the writable ones: `commands/system/set.js:60`.

## 5.3 · the logger — a fold over span records + activities

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:31
export const story = (records, prefix, clock) => {
  const nodes = new Map();
  const roots = [];
  for (const record of records) {
    const id = `${prefix}${trace.key(record.path)}`;
    …
    MARKS.find(([test]) => test(record))[1](node, record);
```

- input: `app.telemetry.$logger` filtered to `TRACKS`: `telemetry.jsx:11` · `:243`.
- activities become nodes from their `steps`: `enacted`, `telemetry.jsx:61-80`.
- filters `all activity repl net faults`: `telemetry.jsx:14` · `:87`; at most `LIMIT = 180` rows: `:15` · `:92`.
- detail of a selected activity carries its four signal buttons → `/pause` … `/abort`: `telemetry.jsx:144-147`.

## 5.4 · the inspector — tables by hand, trees by fold

`inspect(...)` returns 8 hand-written tables, one per `point`:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:186
    {
      id: "terminal",
      title: "terminal",
      meta: terminal.dock.view,
      rows: [
        ro("terminal", `${terminals.indexOf(terminal) + 1} of ${terminals.length}`),
        writable("view", "terminal.dock.view", terminal.dock.view, VIEWS),
        writable("align", "terminal.dock.align", terminal.dock.align, SIDES),
        …
        act("new terminal", "/terminal/new", false, ""),
        act("close terminal", "/terminal/close", terminals.length < 2, "neg"),
      ],
    },
```

- the 8 table ids: `client runtime lighthouse terminal thread buffers activities telemetry`: `telemetry.jsx:171-237`.
- a writable cell's kind is chosen by a `[[predicate, row]]` table over the value: `telemetry.jsx:155-167`.
- two TREES, `modes` and `harness`, built in `trees.js`: `telemetry.jsx:303-320`.
- `trees.modes` = runtime + each daemon + the client's local modes, each with `manifest · aperture · repl · keymap · harness`: `panels/telemetry/trees.js` (`moded`, `hosted`, `modes`).
- `trees.harnesses` = per HARNESSED mode: `tools · primer · references`, plus the terminal's repl as tools when LOOPING: `panels/telemetry/trees.js` (`harnesses`).
- tree acts `signal · copy · peek`; `peek` reads `/metadata/harness/primer/<path>` for the seated thread: `telemetry.jsx:337-346`.

The panel reads 15 stores (`telemetry.jsx:242-257`):

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:242
  const telemetry = from(app.telemetry.$state);
  const records = from(computed(app.telemetry.$logger, (held) => …));
  const activities = from(app.client.runtime.entities.activity.$entities);
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const status = from(app.client.runtime.$status);
  const user = from(app.client.runtime.lighthouse.$user);
  const standing = from(app.client.runtime.lighthouse.$status);
  const thread = from(terminal.$thread);
  const seated = from(terminal.$buffer);
  const turns = from(typology.atom.chain(terminal.$thread, "$turns"));
  const buffers = from(typology.atom.chain(terminal.$thread, "$buffers"));
  …
```

## 5.5 · how the panel writes — two paths

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:259
  const patch = (delta) => app.telemetry.$state.set({ ...app.telemetry.state, ...delta });
  const sent = (signal) => terminal.repl.dispatch(signal)
    .catch((error) => terminal.controller.stdout.fault(error));
```

| gesture | path | file:line |
|---|---|---|
| tab | `patch` | `telemetry.jsx:375` |
| close | `sent("/telemetry off")` | `telemetry.jsx:376` |
| move · resize | `patch` | `telemetry.jsx:377` |
| filter · select · fold | `patch` | `telemetry.jsx:270-272` |
| point · pick · query | `patch` | `telemetry.jsx:352-359` |
| a writable cell | `sent("/set …")` | `telemetry.jsx:361` |
| an act | `sent(signal)` | `telemetry.jsx:343` |

# 6 · ghost tty vs anima — what is twinned

Shared CODE (ghost): App · Bridge · Telemetry · Box · Client · Terminal · Repl · Legend · Stall · entities · commands · keymap · ambient. Shared FOLDER NAMES, separate code: `surfaces/chrome/{mount,layout,ambient,panels,widgets}`.

| chrome piece | anima | tty |
|---|---|---|
| entry | `systems/anima/src/client.js:39-53` | `systems/ghost/subjects/shell/commands/chrome.js:13-19` |
| `surface.bundle` | `bytes: 0` (`src/surfaces/index.js:5`) | esbuild → `bundle/app.mjs` (`surfaces/chrome/bundle.js:37`) |
| `mount` | Solid `render` (`mount.jsx:39`) | opentui `_render` (`surfaces/chrome/mount.jsx:77`) |
| cover table | `cover.jsx:14` | `surfaces/chrome/mount.jsx:23` |
| key binding | `keydown` (`layout.jsx:140`) | `useKeyboard` (`surfaces/chrome/layout.jsx:106`) |
| zones | dapper CSS `[data-zone]` | `ZONES` → `tokens.camel` (`surfaces/chrome/mount.jsx:9-16`) |
| telemetry panel | 382 rows (`panels/telemetry/telemetry.jsx`) | 15 rows, a swatch (`panels/telemetry/telemetry.jsx:5-14`) |

The tty telemetry panel paints only a labeled box at `telemetry.window`:

```js
// systems/ghost/surfaces/chrome/panels/telemetry/telemetry.jsx:5
export function Telemetry(props) {
  const telemetry = from(ambient.app.consume().telemetry.$state);
  return (
    <widgets.swatch.Swatch
      name="telemetry"
      …
      style={{ position: "absolute", left: telemetry().window.x, top: telemetry().window.y, … }}
    />
  );
}
```

- tty panel set: `authentication booting dock frame headline legend modeline repl sidebar telemetry` (10): `systems/ghost/surfaces/chrome/panels/index.js:1-10`; anima adds `cover` and splits `journal · textarea · view · sections · trees` (16).
- tty wraps every panel in an `ErrorBoundary` that faults to the terminal span: `systems/ghost/surfaces/chrome/layout.jsx:27-44`; anima has none.
- the legend/repl twin: tty shows ONE of legend or repl (`surfaces/chrome/layout.jsx:138-140`); anima shows both inside `Panel`, hidden together (`layout.jsx:76-86`).
- `/telemetry`, `/inspector`, `/set` are the same commands on both (`repl.js:42-54`); only anima paints the inspector.

# 7 · what an inspector rework touches

- STATE: `viva.telemetry.state` (`systems/ghost/subjects/app/prototypes/telemetry.js:4`) + anima's seed (`mount.jsx:60-69`).
- COMMANDS: `systems/ghost/gestalten/commands/surface/telemetry.js` · `systems/ghost/gestalten/commands/system/set.js`.
- PANEL: `systems/anima/src/surfaces/chrome/panels/telemetry/{telemetry.jsx,trees.js}`.
- PARTS: `subsystems/drapes/{Tele,Logger,Inspector,Tree}.jsx` + `parts.css`.
- TTY TWIN: `systems/ghost/surfaces/chrome/panels/telemetry/telemetry.jsx` (a stub today).
- SOURCES: span history (`span.js:30`), the Dataspace stores (§1.7), host `metadata` (`host.js:31-37`), mode `metadata.harness` (`harnessed.js:30`).

# 8 · facts the tree shows that a designer should not miss

- **the window's units differ per surface.** The ghost default is columns (`{x:0, y:3, width:77, height:23}`, `telemetry.js:6`); anima seeds px `WINDOW` ONLY when `point` is absent (`mount.jsx:60-62`). Both persist under the one key `viva.telemetry.state`.
- **`since` · `selection` · `peeks` reset on every anima mount** (`mount.jsx:66-68`); the span history is in memory, so a reload starts the logger empty anyway.
- **most inspector gestures bypass the repl**: tab, move, filter, select, fold, point, pick, query write `$state` directly (§5.5). Only close, `/set` cells and acts dispatch.
- **the `net` filter has no visible source on the client wire.** `shard.track.request()` records only when `ctx.span` exists (`subsystems/typology/gestalten/shard/track.js:28-33`); `Connection.request` builds `ctx = {request, response, state}` with no span (`subsystems/typology/prototypes/connection.js:66-70`). By read, not probed live.
- **`/inspector` has no chord**; `/telemetry` is `leader/s/t` (`commands/surface/telemetry.js:25` · `:33-37`).
- **`/telemetry` and `/telemetry/clear` are `rank: "hidden"`** → absent from the repl catalog (`shard/keymap.js:34`); `/inspector` is listed.
- **`send.js` is dead**: `systems/anima/src/surfaces/chrome/send.js:1`, zero importers; every panel inlines `sent`.
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
