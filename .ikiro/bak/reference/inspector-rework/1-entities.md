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
