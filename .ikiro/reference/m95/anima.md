> Research record 10-19 for m95, written BEFORE the drill. Killed since: "face" → the buffer's component (m95 lock 6); a shared row model across clients (REJECTED, lock 1); "the keymap is a view of the repl" (REJECTED). The quest's rulings win over anything below.

# anima — research notes (agent "anima", 2026-10-19, read-only)

All paths are repo-rooted (`/Users/finn/vivalence/code/vivalence/…`). Nothing was edited or run except grep/sed/cat.
Warning: `.ikiro/reference/anima.md` is dated 09-24 and cites the pre-m91 `src/typology/...` paths. The tree has since gone
subject-first (`src/entities/...`, `src/bridge/...`), and the panels d/e/f were folded into `panels/c/cards`. The
reference's MODEL is still accurate. Its line numbers are not.

---

## 1 · the tree

```
systems/anima/
  deno.jsonc            tasks run|watch|start = vite@6 dev · bundle = vite build · test (--watch) · interactive/activity · test/scenario|dataspace|stall
  svelte.config.js      adapter-static fallback 200.html · appTemplate src/client.html · routes: src/app
  vite.config.mjs       sveltekit() + @deno/vite-plugin + beacon(Status running) · paladin-derived server (:1794) · jj stamp → __VIVA_BUILD__
  client.viva.js        manifest {slug: anima, type: client} + a broken `control` Vector (Process/cast undefined) — dead
  postcss.config.js     dapper postcssPlugin (injects design().output.css)
  tailwind.config.js    legacy
  Dockerfile · README.org · static/ (fonts ×~100, favicon) · bak/ · build/ · .svelte-kit/ · .vite/
  src/
    client.html  (36)   theme pre-paint from localStorage "vivalence:bridge" · importmap svelte@5.39.6 + carbon-icons-svelte@13 from esm.sh
    client.js           LIGHTHOUSE · BRIDGE · TERMINALS · BOX symbols + build stamp
    client.css
    typology.js         the @vivalence/anima barrel (stores · traits · entities · gestalten · prototypes)
    lighthouse.js       Lighthouse class · hydrate · boot · populate · STANDINGS
    telemetry/   147    logger ($story chronicle, channel Pipe, Span "client") · inspector
    entities/   1182    daemon/ mode/ thread/ terminal/ + activity buffer intent literal symbol turn
    bridge/     1330    prototype(Bridge store) · geometry(T-bone rects) · gesture(pincer) · panes(layoutPanes) · dock · start
    box/         393    Box · device/{microphone,speaker}+worklets · drivers/audio
    prototypes/  435    Entity · Dataspace · Cargo · conversation · dictation · todo/bell
    gestalten/   146    belt/{chain, narrow, runner(applyTraits)}
    app/       10070    the SvelteKit routes = the chrome
      +layout.js (ssr=false) · +layout.svelte (148, boot + gate) · +page.svelte (135, T-bone composition)
      gate.js · focus.js
      bones/      2334  pincer(608) spine(644)+activity.js shoulder(42) crown(42) flow.js Widgets.svelte widgets/{Dock,Harness,Phase,Terminals}.svelte + 2 *.bak.svelte
      panels/     6206  a/ (stage + dock: Dock 434 · Turn 321 · turns.js 353 · Composer 236 · DockHead · LiveTurn · Dictaphone · dictate.js · stop.svelte.js)
                        b/ (rail: Bridge/Lighthouse/Box/Dock sections) · c/ (374 + cards 1870: Terminals Threads Thread Modes Mode Buffers Buffer Harness Link Row Card + traits/{Aimed,Labeled,Masked,Queueing} + traits/form/{FormFromSchema,EntityField,EntitySetField,SymbolFacets,picker,schema})
                        g/ (telemetry chronicle 484) · h/ (inspector drawer 186)
      design/      584  /design route: +page.svelte (token audit) · audit.js · sheet.js · reference.js
      widgets/     610  Boot · Login · Faculty · Glyph · Tune · intelligent.js
  tests/        6552    (§8)
```

### chrome vs stage vs dock vs panels vs bones

```
// systems/anima/src/app/+page.svelte:98
{#if viewport.width > 0 && viewport.height > 0}
  <PanelA rect={rects.a} />                         ← STAGE: Frame (buffer bundle) + DOCK slot
  <div class="chassis" class:full class:hairline={thickness === stores.bridge.HAIRLINE}>
    <PanelB rect={rects.b} />                       ← rail: bridge/lighthouse/box/dock settings
    <PanelC rect={rects.c} />                       ← panes tree: terminals · threads · modes · buffers · harness cards
    <BoneShoulder rect={bones.shoulder} names={flowed.shoulder} … />   ← widget bar
    <BoneCrown rect={bones.crown} names={flowed.crown} … />            ← overflow widget bar
    <BoneSpine rect={bones.spine} />                ← lighthouse + daemon dots + live activities
  </div>
  <BonePincer rect={bones.pincer} {gesture} />      ← the draggable junction (viket) + radial menu
  <PanelG />  <PanelH />                            ← floating telemetry / inspector
{/if}
```

- **T-bone** = four 45 px bones meeting at the pincer: `systems/anima/src/bridge/geometry.js:1` `BONE_THICKNESS = 45`, `:60` `rectsForOrientation`, `:142` `bonesForOrientation` (pure `(orientation, pincer, w, h, thickness) → rects`), `:56` `axisFor`.
- **pincer** = position `bridge.layout.pincer` plus the gesture machine `systems/anima/src/bridge/gesture.js:61` `class Gesture` (tap/double/triple/drag/hold-radial; `TOGGLES = { snap: 315, hair: 225, full: 135 }` `:32`). This is what the owner is dropping.
- **shoulder/crown** are now the SAME component (`bones/shoulder/shoulder.svelte` and `bones/crown/crown.svelte` are byte-identical apart from `data-bar`). `flow.js:1` decides which widget goes on which bar:
```js
// systems/anima/src/app/bones/flow.js:1
export const WIDGETS = ["terminals", "buffers", "harness", "dock"];
export const flow = ({ names, sizes, room, gap = GAP }) =>
  names.reduce((held, name) => {
      const next = held.used + (held.shoulder.length ? gap : 0) + (sizes[name] ?? 0);
      return held.crown.length || next > room ? { ...held, crown: [...held.crown, name] } : { ...held, shoulder: [...held.shoulder, name], used: next };
    }, { shoulder: [], crown: [], used: 0 });
```
- **spine** = lighthouse standing + one dot per daemon + live activity rows (§3).
- **dock** = per-terminal chat surface, lives inside panel A (`app/panels/a/a.svelte:133-152`). Its geometry is in `bridge/dock.js` (`DEFAULT_DOCK = { side: "right", share: 0.32, collapsed: true, full: false }` `:7`).

---

## 2 · why it doesn't build

I checked every named import from `@vivalence/typology` in `systems/anima/src` and `subsystems/drapes` (non-test, multi-line aware) against the export sites in `subsystems/typology/{prototypes,gestalten,schematics}`:

```
imported: Blacklist Connection Cortex Path Pipe Queue RemoteEntityManager RemoteRepository Span Stall Status Url Vector
          View atom belt cortex fn is mime nearest object pcm shape shard soma tiers trace v verbatim
MISSING:  View         (every other name resolves)
```

**Hard reds (the build stops):**
```js
// systems/anima/src/entities/buffer.js:2
import { fn, View, RemoteRepository } from "@vivalence/typology";
// systems/anima/src/entities/mode/traits/application.js:1
import { View } from "@vivalence/typology";
export const APPLICATION = async (mode) => {
  const record = await mode.connection.call("/metadata/application");
  mode.application = { url: record.url, schema: record.schema, view: new View(record.view).withUrl(record.url) };
};
```
`View` was renamed to `Bundle` (`subsystems/typology/prototypes/bundle.js:5`). The runtime now serves `{ url, bundle, schema }`, NOT `view`:
```js
// systems/runtime/gestalten/shard/host.js:33
meta.open("/application", async () => {
  if (paladin.is.dev) await mode.application.compile();
  return { url: …, bundle: mode.application.bundle.json, schema: mode.application.schema ?? null };
});
```
Ghost already reads it the new way:
```js
// systems/ghost/entities/mode/traits/application.js:3
mode.application = { url: record.url, schema: record.schema, bundle: new Bundle(record.bundle).withUrl(record.url) };
```

**Soft reds (it would build once View is fixed, then break at runtime). These are contract drift:**
- `app/panels/a/a.svelte:22,26-33` reads `buffer.$view` / `$application.view` and passes `<Frame terminal view>`. But drapes `panels/Frame.svelte:5` takes `{ terminal, bundle, accept }` and calls `bundle.load(accept)` (`:62`). So no view would ever mount.
- the runtime Buffer column is `bundle` (`systems/runtime/entities/Buffer.ts:40,72`). anima's `Buffer` still has `$view` (`entities/buffer.js:16-24`).
- `client.viva.js:22-31` uses `Process` and `cast`, neither of which is imported. It is dead code.
- `tests/interactive/activity/sheet.jsx:1` imports `@vivalence/sheets`, which is DEAD (frontier: `subsystems/sheets` DEAD; archived at `testament/m82-clients-20261012/subsystems/sheets`).

**drapes `./dom` red:**
```js
// subsystems/drapes/dom/chassis.jsx:3
import { belt } from "@vivalence/ghost";
const dock = belt.dock;               // ghost's belt = { harness } only (systems/ghost/gestalten/belt/index.js:1)
…  dock.shareAfterDrag(…) / dock.snapAfterDrop(…)    // chassis.jsx:48,55
```
The functions survive in TWO places: `systems/anima/src/bridge/dock.js:44,51` and `systems/ghost/bak/bak.3/gestalten/belt/dock.js`. drapes depending on ghost is also an upward dependency (a subsystem importing a system).

`belt.dock` and `sheets` are the only removed-symbol hits. `View` is the only missing typology name.

---

## 3 · activity handling

### runtime side: Activity is a VIRTUAL entity whose row mirrors a Controller

```ts
// systems/runtime/entities/Activity.ts:10
const RING = 12;
// :32 ActivityRepository.control — every hallucination mints one
async control(data, controller = new Controller({ stdout: new Span("hallucination").to(…) })) {
  const activity = await this.create(data);
  activity.controller = controller;
  const steps = [...activity.steps];
  let writing = Promise.resolve();
  const untap = controller.stdout.pipe.tap((record) => {
    const { code, error } = controller.status.reflection;
    steps.push(record);
    if (steps.length > RING) steps.splice(0, steps.length - RING);       // a ring of the last 12 marks
    writing = writing.then(() => this.updateOne({ id: activity.id }, { status: code, error: error ?? null, steps: [...steps] }));
  });
  controller.settled.then(() => writing.then(() => this.remove({ id: activity.id })));   // a settled activity DELETES itself
  return activity;
}
// :81 stdin = shape.object(controller.stdin, steer.strategy.echo) · :85 stdout(signal) replays records then follows live
```
It is minted in the harness: `systems/runtime/mode/traits/harnessed.js:35` (`ctx.activity = await ctx.entities.activity.control({ user, mode, thread })`). It is linked to the turn at `:98`. Daemons share the runtime's repository: `systems/runtime/daemon/lifecycle/population.js:28`.

Routes, user-scoped:
```js
// systems/runtime/runtime/lifecycle/integration.js:64
const activity = owned.branch("/activity").use(shard.datamap.scope(own))
  .graft(shard.datamap.repository(entities.activity, { only: ["find", "findOne", "findOneOrFail", "findAndCount", "count"] }))
  .graft(shard.datamap.reactive(entities.activity, twitch));                       // subscribe → create/update/remove events
const one = activity.branch("/:id").use(…findOneOrFail({ id, user }));
one.open({ nature: "stdout", yields: v.primitives.controller.Record }, (ctx) => { ctx.output = ctx.activity.stdout(ctx.request.raw?.signal); });
for (const name of Object.keys(MACHINE.signals)) stdin.open(name, async (ctx) => { await ctx.activity.stdin[name](ctx.input); return ctx.activity.controller.toJSON(); });
// → /userspace/entities/activity/:id/stdin/{SIGTERM,SIGSTOP,SIGCONT,SIGKILL}
```
The machine is typed in typology:
```js
// subsystems/typology/schematics/primitives/controller.js:3
states: { IDLE, RUNNING, PAUSED, STOPPING, DONE*, STOPPED*, FAILED*, ABORTED* }   (* settled)
transitions: open IDLE→RUNNING · pause RUNNING→PAUSED · resume PAUSED→RUNNING · stop RUNNING|PAUSED→STOPPING · close →DONE|STOPPED · fault/abort → FAILED/ABORTED
signals: { SIGTERM: "stop", SIGSTOP: "pause", SIGCONT: "resume", SIGKILL: "abort" }
// :46 Record { span, trace, path, verb, at, data? }  — one stdout mark
```
There is a ctx contract too: `subsystems/typology/schematics/primitives/contexts.js:38` `activity`, `:55` `kill`.

### anima side: four layers, all reading ONE reactive repository

**(a) entity + dossier**: the wire row gets `stdin`/`stdout` wires
```js
// systems/anima/src/entities/activity.js:5
export class Activity extends Entity { user; mode; thread; buffer; turn; type; $status = atom("IDLE"); error = null; steps = []; stdin = null; stdout = null; }
// :67 ActivityDossier — repo on runtime /userspace/entities/activity; on first sight:
ctx.entity.stdin  = ctx.daemon.call.userspace.entities.activity[id].stdin;
ctx.entity.stdout = ctx.daemon.call.userspace.entities.activity[id].stdout;
```
**(b) pure folds over rows**: `roster` · `loudest` · `owed` · `settled` · `TONES`
```js
// systems/anima/src/entities/activity.js:31
export const roster = (thread) => computed(thread?.daemon?.entities?.activity?.$entities ?? atom([]), (rows) => rows.filter((row) => idOf(row.thread) === thread?.id));
const RANK = ["RUNNING", "STOPPING", "PAUSED", "IDLE"];
export const loudest = (rows = []) => RANK.find((code) => rows.some((row) => row.status === code)) ?? "NONE";
export function owed(signal, rows = [], sent = new Set()) {                     // a signal goes once per row, only where the machine allows it
  const from = MACHINE.transitions[MACHINE.signals[signal]] ?? {};
  return rows.filter((row) => { const key = `${signal}:${row.id}`; if (!Object.hasOwn(from, row.status) || sent.has(key)) return false; sent.add(key); return true; });
}
```
**(c) projection of the 12-record ring**: path, elapsed and span bars are FOLDED client-side. The daemon sends none of them.
```js
// systems/anima/src/app/bones/spine/activity.js:11
export function spans(steps = []) {                       // one bar per path, first-seen order; unclosed ends at now
  const held = new Map();
  for (const step of steps) {
    const span = held.get(step.path) ?? { path: step.path, start: step.at, end: null };
    if (step.verb === "close" || step.verb === "fault" || step.verb === "abort") span.end = step.at;
    held.set(step.path, span);
  }
  return [...held.values()];
}
export const elapsed = (steps = []) => (steps.length ? (steps.at(-1).at - steps[0].at) / 1000 : 0);   // the ring's clock: pause freezes it for free
export function project(row) { … { id, code, live: !settled(code), path: root(steps), elapsedLabel, steps: newest-first+offset+summary, spans, ring: `${n}/12`, links: "mode …· turn …· buffer …" } }
```
**(d) surfaces**:
- **spine** (`app/bones/spine/spine.svelte:48-63`) subscribes to EVERY daemon's `activity.$entities` and keeps the live (unsettled) rows per daemon. Per row it shows the root path, a TONE and the thread label. Per row there are pause/stop/resume keys (`:161-172` → `row.stdin[signal]("user pressed …")`).
- **Harness widget** (`app/bones/widgets/Harness.svelte:17-38`) shows `loudest(roster(thread))`. The brain glyph pulses while RUNNING, beside a mini-histogram of ≤15 live rows in 5-row columns inked by status (`INKS`, `:10`). Its float holds Tune and the context-token spend `sessionUsage(turns)`.
- **Dock stop** is a press/hold state machine:
```js
// systems/anima/src/app/panels/a/widgets/stop.svelte.js:26
function press() { stop(); … holder = setInterval(() => { holding = Math.min(1, (performance.now() - started) / hold); if (holding < 1) return; release(); armed = "SIGKILL"; }, 40); }
$effect(() => { if (!armed) return; for (const row of owed(armed, read().activities, signalled)) row.stdin[armed](reason); });   // reaches rows minted mid-stop
$effect(() => { const { activities, sending } = read(); if (armed && !sending && !activities.length) untrack(disarm); });         // disarm when quiet
```
- **Dock live turn**: `soma.scan(thread.mode.harness.dialogue.stream({ thread, id, parts }))` folds stream packets into `live`. Next to it sits an optimistic `echo` user turn, removed once the real turn row arrives. The status word is derived:
```js
// systems/anima/src/app/panels/a/widgets/Dock.svelte:118
const liveItem = $derived(live ? { ...project(live), turn: live, date: null } : null);
const liveCall = $derived(liveItem?.tools.find((tool) => tool.status === "running")?.name ?? null);
const liveWord = $derived(liveCall ? `calling ${liveCall}` : isStreaming ? "streaming" : "thinking");
// :156 send(): echo → for await (turn of soma.scan(stream)) live = {...turn} → finally live = echo = null
// :205 Esc: dictation cancel, else control.stop()
```
- **turns.js** (353 lines, 51+ tests) is the domain-free turn algebra: `turnTools` pairs `tool_use` with `tool_result` (pending = "running"). `settled` splits a lexicon bag `{message, object, <entity>[]}`. Also `turnUsage/sessionUsage/contextSize/tokens`, `enrich` (day grouping), `exchanges/callRoster/manifest`, `turnClipboard` (a turn as a JSON record).
- **telemetry**: the daemon dossier pipes every activity event plus its stdout into the logger chronicle (`entities/daemon/dossier.js:132-139`), so panel G shows it.
- **interactive rig** `tests/interactive/activity/` is a TTY sheet (dead `@vivalence/sheets`) over the same `ActivityDossier`. Its keyboard reducer is pure and tested:
```js
// systems/anima/tests/interactive/activity/sheet.state.js:3
export const SIGNALS = { s: "SIGSTOP", n: "SIGCONT", t: "SIGTERM", k: "SIGKILL" };
export function react(state, { input, key }, rows) { … ↑↓/JK move · g regroup (none|thread|mode|turn|buffer) · ↵ grains · s/n/t/k → { effect: { kind: "signal", id, name } } · q quit }
```
- **ghost's newer model** puts a client-side `Controller` per row and stdin opens remote calls. The remote-signal shape is cleaner:
```js
// systems/ghost/entities/activity.js:3
export class Activity extends Entity { …; controller = new Controller({ stdout: new Span("activity") }); get status() { return this.controller.status.reflection.code; } … }
export const hydration = new Vector().use(async (ctx, next) => { await next();
  const remote = ctx.runtime.connection.branch(`/userspace/entities/activity/${ctx.entity.id}`);
  for (const name of Object.keys(MACHINE.signals)) ctx.entity.controller.stdin.open(name, (signalDie) => remote.call(`/stdin/${name}`, signalDie.input)); });
```

DEAD in this area: `app/bones/widgets/Activity.bak.svelte` (reads a `thread.queue` that no longer exists) and `ConversationalWidget.bak.svelte`. `settled` is defined twice (`entities/activity.js:54` and `app/bones/spine/activity.js:7`).

---

## 4 · how anima talks to the runtime

The single remote is `env.PUBLIC_VIVA_RUNTIME_REMOTE`. The lighthouse IS the runtime's `/lighthouse` branch (`systems/runtime/lighthouse/lifecycle/resolution.js:6`).
```js
// systems/anima/src/app/+layout.svelte:28
const connection = new Connection(new Url(env.PUBLIC_VIVA_RUNTIME_REMOTE), shard.transmitter.retry(shard.transmitter.fetcher, { maxRetries: 2 }));
connection.use(shard.track.span((call) => call.request.url.pathname, logger.channel));
const lighthouse = new stores.lighthouse.Lighthouse(connection, { channel: logger.channel });
stores.lighthouse.hydrate(lighthouse);                                        // localStorage "lighthouse:<url>"
const terminals = new stores.terminals.Terminals(lighthouse.dataspace.terminal);
// onMount: boot(lighthouse) · computed([$isAuthorized, $status], gateFor) · terminals.settle(bridge.layout.terminal) · focus({terminals})
```
```js
// systems/anima/src/lighthouse.js:41
this.connection = connection.use(track.request()).use(track.fault()).use(connection.authorize(this.$authority)).use(connection.timeout()).use(connection.track(connection));
this.multiplex = shard.transmitter.multiplex({ authority: this.$authority });                     // WS multiplex
this.runtime = new Connection(connection.url, retry(this.multiplex, { maxRetries: 2 })).use(…).use(timeout(8000));
this.dataspace = new Dataspace({ entities: [DaemonDossier, TerminalDossier], connection: this.connection, runtime: this.runtime, seed: seedLighthouse(this) });
// :64 signup/login → enter("/lighthouse/signup|login") · :94 verify "/lighthouse/verify" (auth error → refresh) · :131 refresh · :173 logout
// :258 populate: /metadata/manifest → dataspace.init() (/metadata/datamap) → populate(["daemon","terminal"]) → terminal.subscribe()
```
Login has NO autologin in anima. The runtime offers `/lighthouse/autologin` when the lighthouse has the AUTOLOGIN trait (`systems/runtime/lighthouse/traits/autologin.js:6`). Ghost uses it as a staggered trait:
```js
// systems/ghost/entities/lighthouse/traits/autologin.js:1
export const AUTOLOGIN = (lighthouse) => () => lighthouse.isAuthorized || lighthouse.autologin();
// systems/ghost/entities/lighthouse/lifecycle/index.js:50
export const execution = new Vector().use(credentials).use(staggered).use(authorized);   // restore → verify → traits → until($isAuthorized)
```
Credentials: anima keeps a raw JSON under `lighthouse:<url>` (`lighthouse.js:203-234`). drapes/dom carries a VALIDATED store with the same key shape (`subsystems/drapes/dom/credentials.js:15`, which checks `v.primitives.credentials.Credential.faults`).

**Daemons**: the roster comes from `/metadata/daemons`. Each daemon gets its own multiplex connection and its own Dataspace of 8 dossiers, plus a background mount that retries:
```js
// systems/anima/src/entities/daemon/dossier.js:45
repo.find = async () => { const roster = await dataspace.connection.call("/metadata/daemons"); … repo.cast({ id: row.slug, slug, reference, remote: origin.branch(row.reference).absolute }) };
// :93 mount(): ∥ /status /metadata/{manifest,cortex,aperture,statics} cargo.refetch() entities.init()
//   daemon.call = shape.connection.wire(daemon.connection, aperture)
//   mode.find → thread.find ∥ intent.find → subscribe intent/thread/buffer/turn/activity → Cortex → daemon.modes.<type>.<slug>
//   /status/subscribe → healthy|unavailable ; retry 5s·2^n ≤ 60s on CLIENT|NETWORK|TIMEOUT
```
**Repositories**: the userspace ones hang off the RUNTIME connection (`dataspace.runtime.branch("/userspace/entities/<x>")`): thread `entities/thread/dossier.js:11`, buffer `buffer.js:94`, activity `activity.js:72`, terminal `terminal/prototype.js:163`. Modes hang off the daemon (`mode/dossier.js:11` `/entities/mode`). `Dataspace` (`prototypes/dataspace.js:12`, self-labelled "ugly retarded slop") registers each dossier's `use[]` as a once-per-id hydration through `shape.selbstbestimmt` + `RemoteEntityManager`. Typology now has its own `Dataspace` and `Entity` (`subsystems/typology/prototypes/dataspace.js`, `entity.js`; ghost uses them). anima's copies are duplicates.

**Terminals are runtime rows now** (not localStorage). They are seated by id and derive their thread live:
```js
// systems/anima/src/entities/terminal/prototype.js:51
seat(thread) { return this.write({ daemon: thread?.daemon?.id ?? null, thread: thread?.id ?? null }); }
persistDock() { … debounce 250ms → write({ traits: […, "DOCKED"], trait: { …, DOCKED: value } }) }
// :67 mountSeat: derive() on terminal rows · daemon thread rows · daemon status → $thread = store.findOneLocal({id}) | $settling | unseat
// :119 mountStall: Stall({ source: thread.$buffers, active: $buffer, phase: thread.$phase, pull: aimed.pull, depth: queueing.depth }); on.release → buffer.removeOne
```
**Threads**: `$buffers`/`$turns` are computed off the daemon repos (`thread/dossier.js:24-31`). The MASKED trait is added automatically when the application has a schema (`:36-43`). A mode swap persists (`:45-48`). The phase gate is `Thread.engage(name)` (`thread/prototype.js:58`). `focus.js:6` lazy-loads buffers+turns per thread and subscribes `{thread}`.

**Modes**: `applyTraits(traits)` installs APPLICATION · EMITTER · EXPOSED · HARNESSED (`mode/traits/index.js`). The HARNESSED wire merges yielded entities into their repos, both inside streams and on plain bodies (`mode/traits/harnessed.js:6-36`).

**Bundle loading**: drapes `Frame.svelte` → `bundle.load(accept)`. The typology `Bundle` negotiates by mime, fetches, checks sha256 integrity, imports through a blob URL and caches by integrity:
```js
// subsystems/typology/prototypes/bundle.js:30
negotiate(accept) { return accept.map((type) => this.entry(type)).find(Boolean) ?? null; }
async load(accept) { const entry = this.negotiate(accept); … fetch(this.url + entry.mount) … digest === entry.integrity … import(blobURL) }
// mimes: subsystems/typology/schematics/scalars/mime.js:13  dom.{svelte,html,react,solid} · tty.{react,solid}
// drapes/dom accept: subsystems/drapes/dom/accept.js:3  modules = [dom.solid, dom.svelte, dom.html]; accept = [...modules, markdown, plain, json]
```
The mount contract differs:

| piece | file:line | the mounted bundle receives |
|---|---|---|
| Svelte Frame | `subsystems/drapes/panels/Frame.svelte:64` | `module.default(target, { terminal, daemon, mode, thread, buffer })` |
| Solid Frame | `subsystems/drapes/dom/panes/frame.jsx:23` | `module.default(stage, { buffer, dispatch })` |

The Solid Frame falls back to a JsonTree of `buffer.data` when no entry matches (`frame.jsx:8,52`).

The page importmap pins svelte@5.39.6 from esm.sh so Svelte bundles share one runtime (`src/client.html:44`). A Solid anima needs the same arrangement for `solid-js` (a mode bundle must not bring its own copy).

---

## 5 · URL handling today

There is essentially none:
```
grep location.|searchParams|URLSearchParams|hash|?token|goto(|history.push|popstate|hashchange  → 1 hit
// systems/anima/src/app/+layout.svelte:109
{#if page.url.pathname.startsWith("/design")}   {@render children()}      ← the only route branch: /design bypasses the gate
```
- routes: `src/app/+page.svelte` (`/`) and `src/app/design/+page.svelte` (`/design`, the token audit). adapter-static has `fallback: "200.html"` (SPA).
- no query params, no deep link to terminal/thread/buffer, no `?token=`, no hash routing. All navigation state is store state: `bridge.layout.terminal` is persisted to localStorage "vivalence:bridge" (`+layout.svelte:76-80`, `bridge/prototype.js:12,139`), and terminals are runtime rows.
- daemon `link` paths are minted but nothing routes them: `daemon.link = /viva/<lighthouse>/<slug>` (`daemon/dossier.js:116`) and `mode.link` (`mode/dossier.js:39`).

---

## 6 · drapes and dapper

### drapes: TWO kits under one package
```jsonc
// subsystems/drapes/deno.jsonc
"exports": { ".": "./mod.js", "./dom": "./dom/index.js" }
```
- `.` = **Svelte** (`mod.js` re-exports context · decor · display · controls · panels · triage · stage · `skins`). The kit parts are: `controls/Key.svelte` (key), `display/Row.svelte`, `panels/Float.svelte` + `float.js place`, `display/Well.svelte`, `display/Strip.svelte` + `strip.js fit`, `controls/Field.svelte`, `display/Status.svelte`, plus Chip Tag Pip Meter Reading Section Empty Spinner Json Markdown(+markdown.js parser) Org ToolRow Pressed Card Desk Frame Canvas skins/{Tree,Table,List,Breadcrumb,Filter,Palette,Skin} and editor/ (CodeMirror; in no export). All of it is Svelte 5 and NOT reusable as components in Solid. Only the pure .js inside is reusable: `display/strip.js fit`, `panels/float.js place`, `display/markdown.js`, `display/org.js`, `editor/{languages,sync,org}.js`, `controls/{drag,persist,visible}.js`.
- `./dom` = **Solid, framework-light, 2295 lines, 0 live importers** (the m82 archive's anima consumed it). Each component exports a `style` string. `sheet.js` concatenates them into one `<style data-drapes-dom>` (`adopt`, `:21`). A test bans hex literals in the sheet (`tests/dom/sheet.test.js`).
```js
// subsystems/drapes/dom/index.js
export { dom } from "./surface.js";            // the SURFACE factory a ghost client die mounts
export { credentials } from "./credentials.js"; export { chord, keydowns } from "./keys.js";
export { accept, modules } from "./accept.js";  export { adopt, sheet } from "./sheet.js";
export { arrangement } from "./chassis.jsx";    export { watch } from "./watch.js";
export { Button, Empty, Field, JsonTree, Logo, Markdown, Pip, Row, Spinner, Strip } …;  export * as panes from "./panes/index.js";
```
```js
// subsystems/drapes/dom/surface.js:8
export const dom = (root, { credentials, theme = "northsea" }) => {
  root.ownerDocument.documentElement.setAttribute("data-theme", theme); root.setAttribute("data-zone", "1");
  const chassis = fn.memo((dispatch) => { adopt(root.ownerDocument); return assemble(root, dispatch); }, () => root);
  const $output = atom(null);
  const pane = (name, Pane) => (client) => chassis(client.dispatch).mount(name, Pane, { client, dispatch: client.dispatch, $output });
  return { name: "dom", root, viewport, credentials, trajectory: new Vector(), accept, keys: new Pipe().from(keydowns(root)),
           emit: (kind, props) => $output.set({ kind, props }),
           mount: { signin, crown, dock, frame, navigation } };
};
// chassis.jsx:7 arrangement(mounted, layout) → { crown, navigation, signin, frame, dock, handle }  — pure, tested
// chassis.jsx:100 assemble(root, dispatch) → { mount(name, Pane, props) → { place(layout), destroy() } }  (loud on a double mount)
// watch.js:4  watch(root, ...path) = from(atom.chain(root, ...path))   — nanostores chain → Solid signal
// keys.js:39 chord(event) → "ctrl-x" | "esc" | "a" ;  keydowns(root) → Queue of { key }, fields keep their own typing
// panes/dock.jsx:46 SLOTS = [[predicate, Component]] over $output: which · fault · refused · pick · JsonTree
// panes/reading.js: daemons · owner · status/standing → { mark, tone } tables · groups(modes) by trait signature · who(user)
// panes/signin.jsx: login/sign-up via client.runtime.lighthouse; JOINABLE gates sign-up
```
The m82 archive shows how small the Solid anima was when it sat on ghost:
```js
// testament/m82-clients-20261012/systems/anima/src/client.js
import { construct } from "@vivalence/ghost";
import { credentials, dom } from "@vivalence/drapes/dom";
export const mask = ({ remote, home }) => ({ manifest: { type: "client", slug: "anima" }, statics: { remote }, home });
export const anima = (window) => {
  const surface = dom(window.document.body, { credentials: credentials(window.localStorage) });
  const die = construct(mask(__VIVA_CLIENT__), surface);
  window.addEventListener("pagehide", () => die.controller.abort.abort("unload"));
  return die;
};
// testament/m82-clients-20261012/systems/anima/vite.config.mjs: plugins [deno(), solid(), beacon()] · css.postcss dapper() · alias typology → mod.client.js · conditions ["browser","solid"]
```
Today `construct` is gone from ghost (`systems/ghost/typology.js` exports `factories.client = (surface) => async (shellDie) => …`). Ghost's client lifecycle is Deno-only: `Deno.execPath()` in `client/lifecycle/index.js:23`, and `Deno.readTextFileSync` for credentials in `entities/lighthouse/lifecycle/index.js:8`. A browser anima can reuse ghost's ENTITY prototypes (Lighthouse, Activity, Mode traits) but not its client/shell lifecycle as-is.

### dapper: themes → CSS custom properties per (theme, zone)
```js
// subsystems/dapper/lib/system.js:5
export const design = async () => ({ themes: THEMES, output: { css: [scales(), ...Object.entries(THEMES).map(([name, held]) => emit(name, held))].join("\n") } });
// subsystems/dapper/lib/emit.js:62
export const emit = (name, held) => {
  const root = `:root[data-theme="${name}"]`;
  return [block(root, held.zones[1]), ...ZONES.map((index) => block(`${root} [data-zone="${index}"]`, held.zones[Number(index)]))].join("\n");
};
// emit.js:55 declarations(zone) = earth (--surface --surface-sunk --surface-lift --boundary* --divider --inverse(-on) --shadow --scrim --dim)
//   ++ --shape-* (relief, radius-<step|key|field|card|pill|disc>, label-case/track, lift, sunk) ++ --size-* (unit, space-<step>, type-<step>, gap, pad-*, icon, field, row, key, leading-*, ring, depth)
//   ++ --text-* (header strong ink light muted link …) ++ --control-* ++ --signal-<primary|positive|caution|negative>{,-ink,-tint,-on} ++ --brand-* ++ --font-family-*
// lifecycle/index.js: postcss plugin prepends design().output.css   (anima postcss.config.js:3 uses it)
// tokens.js:133 tokens(theme, zone) → flat JS map (throws on an unknown theme/zone) — what ghost's tty paints with
```
The contract lives in typology: `subsystems/typology/schematics/primitives/theme.js:3-6`:
```js
export const STEPS = ["2xs","xs","sm","md","lg","xl","2xl","3xl"]; export const SIGNALS = ["primary","positive","caution","negative"];
export const ZONES = ["0","1","2","3"]; export const TERRITORIES = { 0: "chrome", 1: "body", 2: "island", 3: "bench" };
```
Themes: `datasette · northsea · parchment · porcelain` (`themes/index.js`). The DOM convention is `<html data-theme=…>` plus `data-zone="0|1|2|3"` on any subtree. Chrome is zone 0 (both kits already set it).

---

## 7 · keep vs dead weight

**KEEP (port or lift as-is; pure, tested, domain-blind):**
- `entities/activity.js` folds `roster · loudest · owed · settled · TONES` and `app/bones/spine/activity.js` (`spans · elapsed · project · flat`). This is the activity model; its tests are framework-free (`tests/activity.widgets.test.js` minus the 2 svelte-compile cases).
- the `stop.svelte.js` stopper semantics (press=SIGTERM, 2 s hold=SIGKILL, owed-once, disarm-when-quiet). Its runes are Svelte, but the logic is ~40 lines to re-state as a Solid signal or a Vector. Covered by `tests/activity.stop.test.js`.
- `app/panels/a/widgets/turns.js` (353 lines, ~64 tests across dock-turns, turns.mount, turns.usage). It is pure turn algebra: tools pairing, lexicon bag, usage, day grouping, clipboard record.
- the Dock send loop (`soma.scan` over `harness.dialogue.stream`, echo/live/liveWord, pin-to-bottom/unread). It is about 60 lines of logic inside a 434-line Svelte file.
- `dictate.js spliceAt` and `prototypes/dictation.js`, plus `box/` (mic/speaker/worklets). They are framework-free but carry the 4 known issues (`.ikiro/known-issues.org:22,32`).
- `bridge/dock.js` (dock geometry: `resolve · shareAfterDrag · snapAfterDrop · clamp`). drapes/dom needs exactly these (`chassis.jsx:3`), so their home is decidable now.
- the terminal model `mountSeat`/`mountStall` (terminal = runtime row, DOCKED trait, Stall by phase), `Thread.engage` + `PHASES`, the `aimed`/`queueing` trait fns, and `mode/traits/{harnessed,exposed,emitter,standalone.open}`.
- `app/gate.js` (5 tests), `lighthouse.js` STANDINGS + verify/refresh flow. Ghost's `Lighthouse` (`systems/ghost/entities/lighthouse/prototype.js`) is the cleaner successor (restore with Credential faults, `implements`, `autologin`).
- `panels/c/cards/traits/form/{schema,picker}.js`: a JSON-schema → form field model (enum/anyOf/entity relations). It is pure and has NO tests.
- `telemetry/logger.js` (Span "client" → chronicle `$story`) and panel G's faults/slow/recent split.
- `gestalten/belt/chain.js` (chain through changing stores). typology now has `belt.atom.chain`, and drapes/dom `watch` wraps it, so anima's copy becomes dead once the port lands.
- **drapes/dom entirely**: it is the Solid kit and chassis already written for this rewrite (`surface · chassis.arrangement/assemble · keys.chord/keydowns · credentials · accept · sheet/adopt · watch · panes/{signin,crown,navigation,frame,dock} · reading.js`). It is tested (51 tests across 5 files) and has zero hex literals. It is red ONLY on `belt.dock`.
- dapper unchanged (postcss plugin + `data-theme`/`data-zone`).

**DEAD WEIGHT (drop with the rewrite):**
- the pincer and the T-bone: `bridge/gesture.js` (461), `bridge/geometry.js` (290, rects/bones/snap), `bridge/start.js`, `app/bones/pincer/pincer.svelte` (608), the shoulder/crown duplicates + `flow.js` + `Widgets.svelte`. The owner ruled the pincer out. Tests that go with it: `tests/pincer/{gesture,bones.axis,start,viewport,theme?}`.
- `bridge/panes.js` (layoutPanes tree, twig docking; 51 tree tests) and `panels/c/c.svelte`. This is the pane-tree UI of the pincer chassis. Superseded by chassis regions (crown · navigation · frame · dock · signin).
- `bridge/prototype.js`'s Bridge store (layout/view/panes in localStorage). Keep only theme and fontSize, which belong on the user trait THEMED (`+page.svelte:76` already prefers `user.trait.THEMED.theme`).
- `prototypes/dataspace.js` and `prototypes/entity.js`, now duplicated by typology's `Dataspace`/`Entity`.
- `$view`/`View` everywhere (`entities/buffer.js:16-24`, `mode/traits/application.js`, `a.svelte:22-33`) → `bundle`.
- `client.viva.js` (broken control Vector), `tailwind.config.js`, `app/bones/widgets/*.bak.svelte`, `prototypes/todo/bell`, `prototypes/conversation.js` (0 importers, per known-issues `:32`), `gestalten/belt/narrow.js` (no app importer per codemap design.md), `entities/thread/traits/masked.js` (DEAD per codemap), `tests/interactive/activity/sheet.jsx` (dead `@vivalence/sheets`), the `/design` route (keep `audit.js` only if the token audit is still wanted), the `.svelte-kit/` + `.vite/` + `build/` caches, `bak/`.
- the Svelte half of drapes, for anima's purposes. It stays only while mode bundles ship `dom.svelte` (Frame negotiates; a mode bundle compiled for svelte still needs the esm.sh svelte importmap).

---

## 8 · tests

`systems/anima/tests` (6552 lines; `[n]` = it-count; imports from src):

| file | n | covers |
|---|---|---|
| activity.stop.test.js | 7 | stopper press/hold/owed-once/disarm |
| activity.widgets.test.js | 11 | spine `project/spans/elapsed`, `loudest`, `owed`; 2 compile Svelte widgets |
| belt/narrow.test.js | 9 | `narrow` |
| bridge.view.test.js | 7 | Bridge view store |
| cargo.test.js | 4 | Cargo resolve |
| design/audit.test.js | 10 | token audit/sheet read |
| dictate.splice.test.js · dictation.store.test.js | 6 · 4 | spliceAt · dictation store |
| dock-turns.test.js | 51 | turns.js algebra |
| dock/{composer,dock,stage,turns}.mount · turns.usage | 6·7·9·9·4 | Svelte mounts of the dock (rig.js) + usage |
| gate.test.js | 5 | gateFor × STANDINGS |
| harness-wire.test.js | 3 | HARNESSED merge wire |
| interactive/activity.test.js · sheet.state.test.js | 2 · 5 | live daemon cron through row.stdin (needs a daemon) · sheet reducer |
| lifecycle-vector.test.js | 10 | Entity/Mode/Dataspace hydration |
| oracle-dialogue · oracle.snapshot | 2 · 1 | dialogue stream snapshot |
| panes/{cards,rail}.mount · tree | 17·10·51 | Svelte cards/rail mounts · panes layout tree |
| pincer/{bones.axis,dock.geometry,gesture,spine.mount,start,theme,viewport} | 5·13·30·5·6·25·5 | T-bone geometry, dock geometry, gesture machine, spine mount, start screen, theme, viewport |
| scenario/{buffer,daemon}.test.js | 6 · 4 | buffer/daemon against a scenario |
| terminal.stall · terminals.remote | 2 · 2 | mountStall · terminals as remote rows |
| typology/{standalone,trait-runner} | 3 · 8 | standalone.open · applyTraits |
| zones/{places,slots} | 11 · 25 | zone placement (no src import) |

`subsystems/drapes/tests`: `kit.test.js` [13] (barrels, key recipe, strip.fit, float.place) · `parts.test.js` [2] · `markdown.test.js` [11] · `editor.test.js` [16] · `editor.org.test.js` [20] · `dom/chassis.test.js` [9] (arrangement split/collapse) · `dom/credentials.test.js` [7] · `dom/keys.test.js` [4] · `dom/panes.test.js` [27] (sheet once, double mount loud, panes on a rig) · `dom/sheet.test.js` [4] (no hex · prefixed classes). Rig: `tests/dom/rig.js`.
`subsystems/dapper/tests`: contrast [14] · emit [41] · theme [67] · tokens [3].
