# anima — the reference

<!-- writer: agent · reference, unbudgeted · read against change pqxuzpnm (88a62c8b) on 2026-09-24 · every claim cites file:line, repo-rooted · the traps live in world/codemap/anima.md, this file is the map · re-read before trusting a line number -->

anima is the browser. A SvelteKit SPA (`adapter-static`, `ssr = false`) that Vite serves on `:1794`. It talks to ONE lighthouse (auth + the daemon list) and to N daemons (everything else). It compiles no mode code. Everything it knows about a mode arrives over `/metadata/*`. A mode's screen arrives as a pre-built JS bundle that anima fetches, checks the hash of, and mounts into a `<div>`.

Four nouns carry the whole client:

- **terminal**: a tab. It holds a pointer to one thread and one buffer, plus its dock.
- **thread**: a daemon row that binds a mode and a trait config (`traits` + `trait`) and has a render `phase`.
- **buffer**: a daemon row. It is one screen of a mode: `data` · `view` · `traits` · `trait`.
- **mode**: a daemon row whose `traits` decide which wires anima builds for it.

---

## 1 · the tree (dogma)

```
+layout.svelte      LIGHTHOUSE · TERMINALS · BRIDGE · BOX     setContext, once
  +page.svelte      panels A B C · bones shoulder crown pincer spine · overlays G H
    panel A         Frame (drapes)  ← the active terminal's buffer view
      buffer view   the mode's bundle, mounted with { terminal, daemon, mode, thread, buffer }
```

The law (codemap `anima.md`, DOGMA): the structures in `src/typology` are pure. Effects touch the world and return a teardown. Surfaces render and call verbs. The target is not met yet: `localStorage` sits in `lighthouse.js`/`bridge.js`, `AudioContext` in `box/drivers/audio/audio.js`, and `DaemonDossier` builds a `Connection` itself.

| symbol | class | file | holds | persisted |
|---|---|---|---|---|
| `LIGHTHOUSE` | `Lighthouse` | `src/typology/stores/lighthouse.js:9` | `$authority` `$identity` `$status` `$daemons` `dataspace` | `lighthouse:<url>` |
| `TERMINALS` | `Terminals` | `src/typology/stores/terminals.js:8` | `$entities` `$active` | `viva.terminals` · `viva.terminals.active` |
| `BRIDGE` | `Bridge` | `src/typology/stores/bridge/bridge.js:56` | `layout` `view` `panes` `$composer` | `vivalence:bridge` |
| `BOX` | `Box` | `src/typology/stores/box/box.js:5` | `drivers.audio` `device.microphone` `device.speaker` | — |

The symbols are in `systems/anima/src/client.js:1-4`, and `setContext` is at `systems/anima/src/app/+layout.svelte:33-42`. In devtools, `window.__viva = { lighthouse, terminals, bridge, box }` (`+layout.svelte:45`).

Imports, as aliased in `systems/anima/vite.config.mjs:121-134`:

- `@vivalence/anima` → `src/typology/mod.js` is the ONE barrel for app code: `stores` · `entities` · `chain` · `narrow` · `Cargo` · `Entity` · `conversation` · `dictation` · `ThreadTraits` · `loudest/owed/roster`.
- `$client` → `src/client.js` holds the four symbols and `build` (jj stamp).
- `$telemetry` → `src/telemetry/index.js` holds `logger` and `inspector`.
- `@vivalence/typology` → `subsystems/typology/mod.client.js`.
- `@vivalence/dapper` · `@vivalence/drapes` → their `mod.js`.

---

## 2 · boot lifecycle

```
+layout.svelte  <script>
  new Connection(PUBLIC_VIVA_LIGHTHOUSE_REMOTE, retry(fetcher, 2))     HTTP, span-tracked
  new Lighthouse(connection)          authorize($authority) · timeout · track
  hydrate(lighthouse)                 authority+identity ← localStorage, effect writes back
  new Bridge()                        layout/view/panes ← "vivalence:bridge"
  new Terminals() · new Box()
onMount
  boot(lighthouse)                                         lighthouse.js:231
    verify()          /auth/verify    401 → refresh() /auth/refresh → fail → logout()
    populate()                                              lighthouse.js:238 (promise memoized)
      status POPULATING
      /manifest
      dataspace.populate(["daemon"])  /entities/daemon/find
        DaemonDossier.use  (once per daemon id)             daemon/dossier.js:49
          daemon.connection   multiplex WS per origin, retry 2, timeout 8000
          daemon.entities     Dataspace(8 dossiers)
          daemon.cargo        Cargo(/metadata/cargo)
          daemon.mounting     ← NOT awaited, retries 5 s · 2^n ≤ 60 s   dossier.js:72,84
      $daemons.set(…)        re-set only when a daemon's status CODE changes
      status VERIFIED        ← gate opens here, daemons may still be mounting
  hydrate · persist · settle  (terminals)                  app/terminals.js:16,41,78
  focus  (terminals)                                        app/focus.js:3
```

The gate is a `computed` at `+layout.svelte:62`. Its order matters: auth is checked FIRST.

| condition | gate | renders |
|---|---|---|
| `!$isAuthorized` | `signin` | `Login` |
| `OFFLINE` · `ERROR` | `signin` | `Login` |
| `POPULATING` | `populating` | `Boot` |
| `≠ VERIFIED` | `verifying` | `Boot` |
| else | `ready` | `+page` · plus the "open terminal" overlay while there are 0 terminals |

Mounting a daemon happens in the background. Until it lands, `daemon.call/cortex/manifest` are `null` and `modes` is `{}`:

```
mount(daemon)                                         src/typology/entities/daemon/dossier.js:86
  status "mounting"
  /userspace/handshake                                enrollment (the only one)
  ∥ /status · /metadata/{manifest,cortex,aperture,statics} · /metadata/cargo · /datamap
  daemon.mount = /daemon/<slug> · daemon.link = /viva/<lighthouse>/<slug>
  daemon.call  = shape.connection.wire(connection, aperture)
  mode.find({})                                        → ModeDossier.use per mode   (§4)
  thread.find({}) ∥ intent.find({})
  subscribe  intent · thread · buffer · turn           all rows, dossier.js:122-125
  subscribe  activity  → Span marks + stdout stream     dossier.js:127
  daemon.cortex = Cortex(wire(/cortex, cortex strip))
  daemon.modes.<type>.<slug> = mode                    dossier.js:140
  status "healthy"
  /status/subscribe   ALIVE → healthy, else unavailable
✗ CLIENT|NETWORK|TIMEOUT → "unavailable" + retry      anything else → "error", stop
```

---

## 3 · entities and dataspaces

There are two `Dataspace`s (`src/typology/prototypes/dataspace.js:14`). The lighthouse's holds only `daemon`. Each daemon has its own, with 8 dossiers. A **dossier** is `{ name, kind, repository, use[] }`. Its `use[]` is a middleware chain the entity manager runs ONCE per `(name, id)` the first time it sees that id (`subsystems/typology/prototypes/entity-manager.js:50`). This chain is where a row turns into a live client object. Seeded context: `ctx.lighthouse` · `ctx.channel` (lighthouse space), `ctx.daemon` (daemon space), `ctx.dossier` · `ctx.repository` · `ctx.dataspace`.

| dossier | route | client class | added on first sight |
|---|---|---|---|
| `daemon` | lighthouse `/entities/daemon` | `Daemon` | connection · entities · cargo · mounting |
| `mode` | `/entities/mode` | `Mode` | `status` · traits installed · `connection` · `mount` · `link` |
| `intent` | `/userspace/entities/intent` | `Intent` | — |
| `thread` | `/userspace/entities/thread` | `Thread` | `daemon` · `$buffers` · `$turns` · LABELED · MASKED watch |
| `buffer` | `/userspace/entities/buffer` | `Buffer` | — |
| `turn` | `/userspace/entities/turn` | `Turn` | — |
| `activity` | `/userspace/entities/activity` | `Activity` | `stdin` · `stdout` wires |
| `literal` | `/entities/literal` | `Literal` | — |
| `symbol` | `/entities/symbol` | `Symbol` | — |

`RemoteRepository` verbs, from `subsystems/typology/prototypes/remote-repository.js`: `find` · `findOne` · `create` · `updateOne` · `removeOne` · `remove` · `subscribe(where, cb)` · `merge(raw)` · `drop(id)` · `resolve`. `subscribe` rides the daemon's multiplex socket. On a resume it re-runs `find(where)`. `merge` assigns INTO the instance already held, so the only change signals are `repo.$entities` and the per-field atoms.

The client entities are nanostores-backed. Every `$x` has a plain `x` getter/setter:

```js
// systems/anima/src/typology/entities/thread/dossier.js:24
thread.$buffers = computed(ctx.daemon.entities.buffer.$entities, (buffers) =>
  buffers.filter((buffer) => (buffer.thread?.id ?? buffer.thread) === thread.id),
);
thread.$turns = computed(ctx.daemon.entities.turn.$entities, (turns) =>
  turns
    .filter((turn) => (turn.thread?.id ?? turn.thread) === thread.id)
    .sort((a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)),
);
```

```js
// systems/anima/src/typology/entities/buffer.js:5
export class Buffer extends Entity {
  $data = atom({});        // the screen state — selection, cursor, drafts (codemap: "a buffer row IS the screen")
  $view = atom(null);      // a View record (GENERATIVE) or null → falls back to mode.application.view
  $traits = atom([]);
  $trait = deepMap({});
  $label = computed(this.$trait, (trait) => trait.LABELED ?? null);
  hooks = { mount: [], unmount: [], release: [] };
  on = { mount, unmount, release };   // fn.once — each callback fires at most once
}
```

`chain(root, ...path)` (`src/typology/gestalten/belt/chain.js:25`) is how every surface reads through stores that can change under it. It re-subscribes at each hop, so `chain(terminals, "$active", "$thread", "$mode")` survives terminal switches, thread switches and mode swaps:

```js
// systems/anima/src/app/panels/a/a.svelte:12
const thread = chain(terminals, "$active", "$thread");
const buffer = chain(terminals, "$active", "$buffer");
const mode = chain(terminals, "$active", "$thread", "$mode");
const application = chain(terminals, "$active", "$buffer", "mode", "$application");
```

---

## 4 · traits — which entity, which list, who reads them

Every trait list has THREE homes that drift apart: the runtime enum (persistence), the runtime behaviour (`systems/runtime/lifecycle/mode/traits/*`), and the client's `implements("…")` or `traits.includes("…")`. A declared trait with no implementation is skipped SILENTLY (`systems/runtime/lifecycle/mode/traits/index.js:9`).

### mode — `ModeTraitsEnum` (`systems/runtime/entities/kernel/Mode.ts:10`)

The client installs exactly four of them (`src/typology/entities/mode/traits/index.js`, run by `applyTraits` at `mode/mode.js:57`, after `mode.connection` exists). All the others are markers the client reads with `mode.implements(name)` (`mode/mode.js:21`, case-insensitive).

| trait | runtime | strip | client install | client reads |
|---|---|---|---|---|
| `APPLICATION` | `traits/application.js` compile → `View` | `/metadata/application` | `mode.$application = { url, schema, view }` | F Open · thread MASKED auto · panel A view |
| `EMITTER` | `traits/emitter.js` → `mode.emit` | `/metadata/emitter` | `mode.emit` wire · `mode.metadata.emitter` | E: AIMED available iff emitter branches |
| `EXPOSED` | `mode.call = proxy(aperture)` | `/metadata/aperture` | `mode.call` wire | buffer views |
| `HARNESSED` | `traits/harnessed.js` harness vector | `/metadata/harness` | `mode.harness` wire + yield merge | dock · shoulder chat · F activity/chat |
| `STANDALONE` | marker | — | — | F: Open without AIMED |
| `CONVERSATIONAL` | marker | — | — | D lists the mode |
| `GENERATIVE` | `traits/generative.js` bundler + `generator_*` tools | — | — | `buffer.$view` (drawn view) |
| `SELFEVIDENT` | marker · deprecated | — | — | `panels/d/navigation.js` (no importer) |
| `TOOLING` `AGENTIC` `BOOTED` `INTENTED` `DATASET` `DATASINK` `FRAUGHT` `MOUNTED` | runtime | `/freight` for FRAUGHT · MOUNTED | — | — |
| `TOPOGRAPHICAL` `TOPOLOGICAL` | enum only | — | — | — |

The HARNESSED install is what keeps the dock free of domain knowledge. Every yielded entity is merged into its repository before any surface sees it:

```js
// systems/anima/src/typology/entities/mode/traits/harnessed.js:3
const merge = async (yielded) => {
  for (const [name, pojos] of Object.entries(yielded.output)) {
    if (name === "message" || name === "object") continue;
    if (!Array.isArray(pojos)) continue;
    const repository = ctx.daemon.entities[name];
    if (!repository) continue;
    yielded.output[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));
  }
};
// applied to a plain yieldish body AND to every "/tool/yield" packet inside a stream
```

The harness is a fixed lexicon on every HARNESSED mode: `dialogue`/`object` × `render`/`stream`, plus `choice.render`. The dock also reaches `harness.verbatim.stream` for dictation.

### thread — `ThreadTraitsEnum` (`systems/runtime/entities/userspace/Thread.ts:22`)

Config lives at `thread.trait.<NAME>`. The capability code is FREE functions over the thread (`src/typology/entities/thread/traits/`). Nothing is stamped onto the entity. App code reaches them as `ThreadTraits.aimed.pull(thread)` and `ThreadTraits.queueing.depth(thread)`.

| trait | config | set by | client code |
|---|---|---|---|
| `LABELED` | `{ name, description, flags }` | thread dossier, always | `traits/labeled.js` one-shot `label(thread)` |
| `MASKED` | emitter input · buffer seed | dossier, auto iff APPLICATION + schema non-empty | `panels/e/widgets/Masked.svelte` · F `createBuffer` spreads it |
| `AIMED` | `{ mount }` emitter leaf | E chip (needs emitter branches) | `traits/aimed.js` `pull` · `valid` |
| `QUEUEING` | `{ depth }` default 1 | E chip (needs AIMED; dropping AIMED drops it) | `traits/queueing.js` `depth` · `valid` |
| `INTELLIGENT` | `{ tune, effort, rounds, thinking }` | E `Intelligent.svelte` | runtime `harnessed.js:28` claim-gated |
| `VOCAL` | `{ language, tune, harmonize, polish }` | no client writer | runtime `harnessed.js:29` claim-gated |

`INTELLIGENT` and `VOCAL` are typed in `subsystems/typology/schematics/entities/thread.js:44`, not in the enum. The enum has 4 members, yet 3 instance dbs already carry `INTELLIGENT` in `Thread.traits` (a read-only count on 09-24), so the enum does not gate the column.

`AIMED.pull` is the only client-side fetch of buffers:

```js
// systems/anima/src/typology/entities/thread/traits/aimed.js:8
export const pull = async (thread, args = {}) => {
  const emission = await thread.mode.connection.call(
    thread.trait.AIMED.mount,
    object.merge({ thread: thread.id }, thread.trait.MASKED ?? {}, args),
  );
  const buffers = emission?.output?.buffer ?? [];
  return Promise.all(buffers.map((pojo) => thread.daemon.entities.buffer.merge(pojo)));
};
```

### thread phase — `ThreadPhaseEnum` (`Thread.ts:13`)

| phase | digram | integrity rules | stall | shoulder verbs |
|---|---|---|---|---|
| `inert` | ⚏ | — | off: release ignored, empty cursor respected | — |
| `manual` | ⚎ | — | settle: an empty cursor snaps to the first buffer · advance on release | prev · next |
| `continuous` | ⚌ | `aimed.valid` · `queueing.valid` | manual + `pull` while items < depth | more · stop |
| `escort` | ⚍ | — | manual · on an empty list, cursor → first buffer outside the filter · no pull | prev · next · home |
| `stream` | — | — | deprecated, kept for the CHECK | — |

`thread.engage(name)` (`src/typology/entities/thread/thread.js:58`) is THE phase gate. It folds the phase's rules, writes `$errors`, and refuses (`false`) rather than half-engaging. Callers persist only after it returns true:

```js
// systems/anima/src/app/bones/shoulder/widgets/Phase.svelte:68
function engage(key) {
  const thread = terminal?.thread;
  if (!thread || problems(key).length) return;
  if (thread.engage(key))
    thread.daemon.entities.thread.updateOne({ id: thread.id }, { phase: key });
}
```

### buffer · intent · activity

| entity | enum | members |
|---|---|---|
| buffer | `BufferTraitsEnum` (`Buffer.ts:18`) | `LABELED`, stamped server-side `{ name: "<mode.slug> #<index>" }` (`Buffer.ts:119`) |
| buffer | `BufferStatusEnum` (`Buffer.ts:10`) | `PENDING` `ACTIVE` `DONE` `ERROR` `STALE` |
| intent | `IntentTraitsEnum` (`Intent.ts:6`) | `LABELED` `MASKED` `AIMED` `QUEUEING` |
| activity | `v.primitives.controller.MACHINE` | `RUNNING` › `STOPPING` › `PAUSED` › `IDLE` (loudest-first, `activity.js:38`) |

An **intent** is a saved thread config. On create, `ThreadEntity.beforeCreate` copies `intent.traits` and merges `intent.trait` into the thread (`Thread.ts:72-82`). E's "save as intent" writes the current `traits` + `trait` into a new intent row (`panels/e/e.svelte:70`).

An **activity** is one live hallucination (a transient row). `roster(thread)` gives its rows. `stdin[SIGTERM|SIGKILL](reason)` stops it, and `owed(signal, rows, sent)` sends each signal once per row. The dock's stop is a press = SIGTERM, a 2 s hold = SIGKILL (`panels/a/widgets/stop.svelte.js`).

---

## 5 · how a mode reaches the screen

A mode is authored in a package (`<slug>.viva.js`, the twelve exports; see skill `mode-development`). anima meets it through three doors:

1. **the strips**: `/metadata/{application,emitter,aperture,harness}` on the mode's branch, emitted per trait by `systems/runtime/lifecycle/daemon/aperture/metadata.js:26-50`.
2. **the bundle**: a hashed `.svelte.mjs` compiled by paladin's bundler and served under `attach/bundle/<daemon mount>/<mode mount>`.
3. **the wires**: `mode.call` · `mode.emit` · `mode.harness`, proxies built from the strips by `shape.connection.wire`.

```js
// commons/instances/hello-world/mode.viva.js:5
export const manifest = {
  type: "demo",
  slug: "hello-world",
  traits: ["HARNESSED", "CONVERSATIONAL", "TOOLING", "EMITTER", "APPLICATION", "GENERATIVE", "EXPOSED", "STANDALONE"],
};
export const application = new App("./app/App.svelte");
```

Server side, APPLICATION compiles that entry. In dev, `/metadata/application` recompiles on EVERY read, and this is the only seam that refreshes a view:

```js
// systems/runtime/lifecycle/daemon/aperture/metadata.js:33
meta.open("/application", async () => {
  if (paladin.is.dev) await mode.application.compile();
  return {
    url: die.daemon.attach.branch("/bundle").branch(die.daemon.reference.absolute).branch(mode.reference.absolute).absolute,
    view: mode.application.view.json,
    schema: mode.application.schema ?? null,
  };
});
```

The bundler wraps every component in a mount function (`subsystems/typology/gestalten/bundle/svelte.js:65`). The only bare imports it maps are `@vivalence/typology` and `@vivalence/drapes[/]` (`subsystems/paladin/belt/bundler.js:11`):

```js
// subsystems/typology/gestalten/bundle/svelte.js:63 (generated wrapper)
import { mount, unmount } from "svelte";
import Component from "./<entry>.svelte";
export default (target, props) => {
  const instance = mount(Component, { target, props });
  return { instance, destroy: () => unmount(instance) };
};
```

Client side, panel A picks the view: a drawn one (GENERATIVE, `buffer.$view`) beats the application's. Both are served under the application's url:

```js
// systems/anima/src/app/panels/a/a.svelte:21
const view = $derived.by(() => {
  const active = $buffer;
  if (!active) return null;
  const base = $application?.url ?? null;
  const drawn = $record;
  if (drawn) return base ? drawn.withUrl(base) : drawn;
  return $application?.view ?? null;
});
```

`Frame` (drapes) loads and mounts it. `Bundle.load` fetches `url + mount`, checks the sha256 against `entry.integrity`, imports it through a blob URL, and caches it by integrity (`subsystems/typology/prototypes/bundle.js:25`):

```js
// subsystems/drapes/panels/Frame.svelte:62
component = module.default(target, {
  terminal,
  daemon: next.mode.daemon,
  mode: next.mode,
  thread: next.thread,
  buffer: next,
});
next.mount();
```

The remount identity is the triple `(buffer, view identity, terminal)`. View identity is `record.hash ?? bundle.url + mount` (`Frame.svelte:15`). If any of the three changes, the old view is torn down (`destroy()` + `buffer.unmount()`) and the new one is mounted. The Frame's standing states are `resolving buffer` · `loading view` · `view refused` (a fault that shows the bundle url).

What a buffer view does with its props:

- **reads/writes its screen state**: `buffer.data`, persisted through `daemon.entities.buffer.updateOne({ id }, { data })`. Every flush is broadcast to every `{thread}` subscriber, the writer included.
- **calls its mode**: `mode.call.*` (EXPOSED) · `mode.emit.*` (EMITTER) · `mode.harness.*` (HARNESSED).
- **finishes**: `buffer.release()`. The stall advances and the terminal DELETES the row (§6).
- **imports**: typology and drapes only. `<Icon carbon=…>` is app-layer, so inline the SVG. The page pins `svelte@5.39.6` and `carbon-icons-svelte@13` from esm.sh in its importmap (`src/client.html:44`).

---

## 6 · terminals

A terminal is a closure object, not a class (`src/typology/entities/terminal.js:14`):

```js
// systems/anima/src/typology/entities/terminal.js:38
set thread(value) {
  if (($thread.get()?.id ?? null) !== (value?.id ?? null)) $buffer.set(null);
  $thread.set(value);
},
```

```
Terminal({ id, dock })
  $thread · $buffer · $dock = atom(dock ?? defaultDock())
  $buffer.subscribe   → vigil: buffer leaves the repo → $buffer = null
  $thread.subscribe   → vigil: thread leaves the repo → terminal.thread = null
                      → stall.deactivate(); stall = Stall({
                           source: thread.$buffers,   active: $buffer,
                           phase:  thread.$phase,     pull: () => aimed.pull(thread, { blacklist }),
                           depth:  () => queueing.depth(thread) })
                      → stall.on.release(buffer → buffer.drop(id) + removeOne({ id }))   terminal.js:100
  toJSON → { id, thread: id, buffer: id, dock }
```

Lifecycle:

```
terminals.create()                    random id · prepended · activated        stores/terminals.js:22
  terminal.thread = thread            ← D: selectMode · activateIntent · loadThread
    $buffer → null                    thread id changed
    focus.engage(thread)              once per thread id: buffer.find + turn.find, subscribe {thread}   app/focus.js:6
    Stall rebuilt                     manual: cursor snaps to thread.$buffers[0]
  terminal.buffer = buffer            ← F list · F Open · shoulder prev/next/home · dock ▶ run · stall
    Frame mounts the view → buffer.mount()
    view calls buffer.release()
      Stall.release                   inert → ignored
        advance cursor                stall.js:69
        terminal hook                 buffer.drop(id) + removeOne({ id })   ← released = deleted
        refill                        continuous → pull
terminals.remove(id)                  if active → active = last
```

Across a reload, three effects are mounted from `+layout` (`src/app/terminals.js`):

- `hydrate` rebuilds shells `Terminal({ id, dock })` from `viva.terminals` and stashes the `{ thread, buffer }` ids in a module-level `serialized` map. The dock comes back immediately. The thread/buffer come back only through settle.
- `persist` writes `viva.terminals` on every `$thread`/`$buffer`/`$dock` change. It keeps the stashed ids of refs that have not settled yet, so an unsettled terminal does not lose its pointer.
- `settle` re-runs on every daemon status transition, one pass at a time (a queued rerun, no overlap). Thread first (`populate: ["mode", "intent"]`), then buffer:

| outcome | when | action |
|---|---|---|
| `pending` | no healthy daemon has the repo yet | keep, retry next transition |
| `unreachable` | `findOne` threw | keep, retry next transition |
| `absent` | every healthy daemon answered null | drop the ref |
| resolved | found | `repository.resolve(entity)` · `terminal.thread/buffer = entity` |

---

## 7 · the bridge: T-bone, pincer, bones, panels

Vocabulary (quest `done/pincer.quest.org` names it; the code is the authority):

- **pincer** is the junction's POSITION (`bridge.layout.pincer`, x/y px). **viket** is its component: the 45 px square with the vinca pictogram that you drag.
- **T-bone** is the skeleton: four 45 px bones meeting at the pincer. `BONE_THICKNESS = 45` (`stores/bridge/geometry.js:1`).
- **orientation** is 0 · 90 · 180 · 270, the direction the stem points. `rectsForOrientation` / `bonesForOrientation` are pure: `(orientation, pincer, w, h) → rects`.

Orientation 0 (the default):

```
┌──────────────────────── A · stage ────────────────────────┐
│               Frame (buffer view)  +  dock                │
├──── shoulder ────┬──■──┬──────────── crown ───────────────┤ ← pincer.y
│                  │  s  │                                  │
│   B · rail       │  p  │   C · panes                      │
│   bridge         │  i  │     instance (D)                 │
│   lighthouse     │  n  │     terminal (E)                 │
│   terminals      │  e  │     buffer   (F)                 │
└──────────────────┴─────┴──────────────────────────────────┘
                      ↑ pincer.x
G (telemetry) and H (inspector) float over everything, without a rect.
```

The bones re-flow when they turn: `axisFor(rect)` → `column` when the rect is 45 wide and not 45 tall (`geometry.js:43`).

What sits on the bones:

- **shoulder** (`app/bones/shoulder/shoulder.svelte`), shown only with an active thread:
  - `Phase`: integrity LED (✓ or the joined `$errors`, click clears), the phase name → a 2×2 digram menu with each blocked cell's reasons, the phase's verbs, the queue position `n/total`
  - `ActivityTracker`: the loudest activity state, never a count
  - chat `Dock` toggle, if HARNESSED
- **crown** (`app/bones/crown/crown.svelte`): terminal tabs. `+` creates one. Each `Tab` labels itself with `chain(terminal, "$thread", "$label")`, activates on click, and has a close.
- **pincer** (`app/bones/pincer/pincer.svelte`): the bone square, the viket (theme pictogram; the "eye" closes while dragging), and the radial menu.
- **spine** (`app/bones/spine/spine.svelte`): the lighthouse dot `L`, then one dot per daemon (`ok`/`lag`/`down`). Hovering shows slug · status · modes · threads · error.

Viket gestures (`stores/bridge/gesture.js`):

| input | threshold | effect |
|---|---|---|
| tap ×1 | < 250 ms, < 8 px | pincer → `standard`, old → `previous` |
| tap ×2 | 280 ms window | swap pincer ↔ `previous` |
| tap ×3+ | 280 ms window | `standard` = pincer |
| drag | > 8 px | move · snap `0 13 21 34 50 66 79 87 100` % within 28 px · `previous` = start |
| hold | 420 ms | radial; release > 32 px away commits the orientation, near → sticky radial (tap a spoke) |

Every commit calls `bridge.save()`.

Panels:

- **A · stage** (`app/panels/a/a.svelte`): `Frame` for the active terminal's buffer. If the mode is HARNESSED, it also holds the dock slot and a drag seam (§8).
- **B · rail** (`app/panels/b/b.svelte`):
  - `BridgeSection`: g/h/snap toggles, theme, font size, dock side/share/show/full
  - `LighthouseSection`: status, identity, logout
  - `TerminalsSection`: list, spawn, clear
- **C · panes** (`app/panels/c/c.svelte`): three panes `PANE_NAMES = ["instance", "terminal", "buffer"]` → D · E · F (`c.svelte:296`), laid out by the pure `layoutPanes(rect, { open, fold, weight })` (`stores/bridge/panes.js:120`).
  - tall rect → stacked; wide → across
  - grip drag resizes; a pane under 84 px folds into a 44 px bar
  - pulling a pane up docks it into the **twig** (a tab strip); tapping a tab brings it back
  - head tap toggles fold; ⤢ maximises or equalises; ✕ docks
- **D · instance** (`app/panels/d/d.svelte`):
  - daemons → their modes (only `application` or `conversational`, `d.svelte:215`), threads grouped per daemon, intents
  - mode click: new thread, or re-mode the current thread if it is on the same daemon
  - thread click loads it; double-click also spawns a buffer; middle-click opens it in a new terminal
- **E · terminal** (`app/panels/e/e.svelte`): daemon/mode crumb, mode-trait chips, thread-trait chips (`+`/`×` toggle AIMED · QUEUEING · INTELLIGENT), one widget per trait, save/update intent.
- **F · buffer** (`app/panels/f/f.svelte`):
  - `ActivitySection` and a "start chatting" button, if HARNESSED
  - buffer verbs: Open (AIMED, or STANDALONE + APPLICATION) · start/stop queue (QUEUEING = `engage("continuous"|"manual")`) · "aim required"
  - the buffer list, with clear
- **G · telemetry** (`app/panels/g/g.svelte`): `logger.$story`, the chronicle fold of every span, split into faults · slow (> 500 ms) · recent. Drill-down shows entries, fault, children.
- **H · inspector** (`app/panels/h/h.svelte`): a drawer with a drag handle. It renders `inspector.project(lighthouse, terminals, bridge)` as a `skins.Skin` breadcrumb, with a live action (`logout`) in the tree.

`bridge` state, persisted to `vivalence:bridge` by an explicit `bridge.save()`:

```js
// systems/anima/src/typology/stores/bridge/bridge.js:60
this.layout = store({ pincer, previous, standard, orientation, inspectorHeight, viewport, home, start },
  ["pincer", "previous", "standard", "orientation", "inspectorHeight"]);
this.view = store({ d, "d.threads", "d.intents", "d.modes", f, g, h, snap, theme, fontSize },
  ["d", "d.threads", "d.intents", "d.modes", "f", "theme", "fontSize"]);
this.panes = store({ open, fold, weight }, ["open", "fold", "weight"]);
this.$composer = atom({ enterSends: true, density: "comfortable" });
```

`bootLayout` clamps the saved positions into the new viewport. With nothing saved, pincer = 33 % × 40 % and standard = the bottom-left home. `attachViewport` listens to `resize` · `scroll` · `focusout` · `visualViewport` resize/scroll and re-anchors on a device rotation. `client.html` reads `bridge.view.theme` before first paint, so a theme never flashes.

---

## 8 · the dock

The dock is the chat surface of a HARNESSED mode, and it belongs to each **terminal**:

```js
// systems/anima/src/typology/stores/bridge/dock.js:6
export const DEFAULT_DOCK = { side: "right", share: SHARE_DEFAULT, collapsed: true, full: false };
// SHARE_DEFAULT 0.32 · clamp 0.18–1.0 · side ∈ top right bottom left
```

- **state**: `terminal.$dock`, plain data outside the settle tri-state, persisted inside `viva.terminals`. The mutators are free functions (`setDockCollapsed/Full/Side/Share`, `dragDock`) that take the `$dock` atom.
- **shown**: in panel A when `mode.implements("HARNESSED") && thread && !collapsed` (`a.svelte:30`). `resolve(dock, rect)` gives the flex direction and pixel size. A seam drag changes `share`. `full` takes the whole of panel A.
- **toggles**: shoulder chat button · F "start chatting" · B dock controls · the dock's own header.

Inside (`app/panels/a/widgets/Dock.svelte`):

```js
// systems/anima/src/app/panels/a/widgets/Dock.svelte:233
const id = crypto.randomUUID();
echo = { id, role: "user", parts, createdAt: new Date().toISOString() };
// …
for await (const turn of soma.scan(
  thread.mode.harness.dialogue.stream({ thread: thread.id, id, parts }),
)) {
  live = { ...turn };
}
```

- **history**: `thread.$turns`, which is the repo's rows and never component state. The user turn is minted with a client uuid. When the repo delivers the same id, the echo drops by identity.
- **live**: the running `soma.scan` fold, `null` when idle. The header shows "calling X" · streaming · thinking · idle.
- **rendering**: consecutive assistant turns merge into one entry, with day dividers. Tool calls show status · input digest · output (`Json`) · per-entity channels. Buffers yielded by tools get a `▶ run` that sets `terminal.buffer` (and un-fulls the dock).
- **stop**: `Esc` or the stop button sends SIGTERM to every owed activity. Holding it 2 s sends SIGKILL. The state reads the activity ROWS, so a hallucination the dock did not start still shows.
- **dictation**: offered only when the cortex has a `verbatim` faculty over `stream`. BOX microphone → `harness.verbatim.stream` → `verbatim.fold` → spliced into the draft at the caret (`prototypes/dictation.js`).
- **keys**: Enter sends (the default; off on coarse pointers), `↑` on an empty draft recalls your last message, and `Esc` cancels dictation, else stops.
- **consoles rail**: context · meter · activity. At ≥ 820 px it sits beside the log, below that it stacks.

---

## 9 · dapper and drapes

### dapper — tokens, build time only

```js
// subsystems/dapper/lib/system.js:12
export const design = async () => {
  const ds = await [colors, tokens, themes].reduce(
    (carried, step) => carried.then(step),
    Promise.resolve({ colors: {}, tokens: {}, themes: {} }),
  );
  return { ...ds, ...generateCSS(ds) };
};
```

- **pipeline**: `lib/colors.js` (the root ramps) → `lib/tokens.js` (scale, fonts) → `themes/{nordic,paper}.js` (`skeleton({ surface, contrast, boundary, roles, error, font })` per zone) → `lib/flatten.js`, which emits `:root[data-theme="<name>"] { --<category>-<path> }` plus `.zone-N` blocks.
- **wiring**: `systems/anima/postcss.config.js` runs `dapper → tailwind → autoprefixer`, and dapper's plugin PREPENDS the generated sheet (`subsystems/dapper/lifecycle/index.js:7`). Tailwind's theme is dapper's `tailwindClasses`, and the `safelist` enumerates every skeleton class.
- **theme switch**: `bridge.setTheme(name)` → `<html data-theme>`. Font scale: `bridge.setFontSize(name)` → `<html style="font-size">`.
- **the surface**:
  - `--colors-skeleton-{0..4}-{surface,contrast,boundary}`
  - `--colors-skeleton-N-{primary,secondary,accent,info,success,warning,danger}-{base,hover,active}`
  - `--text-{primary,body,support}` · `--signal-{positive,caution,negative}`
  - `--font-family-{code,sans-text,sans-heading}` · `--font-size-{2xs…}`
- **the law**: a hex literal in anima or drapes is a defect; the token is the answer.

| theme | mood | zone roles 0‥5 |
|---|---|---|
| `nordic` | dark | canvas · panel · recess · raised · accent · overlay |
| `paper` | light | — |

In anima (counted 09-24): gate · pincer · spine · stage paint skeleton-0; shoulder · crown lean on skeleton-1; rail B paints skeleton-2; panes D · E · F use 0 and 3.

### drapes — the Svelte 5 kit

drapes is both what anima's chrome is built from AND the only UI library a buffer bundle may import (besides typology). Barrel `subsystems/drapes/mod.js`:

**context**
`subsystems/drapes/context/`
`Decorum` · `Zone` · `SkeletonProvider` · `preferences`. Only `preferences` has a consumer (registry views).

**display**
`subsystems/drapes/display/`
`Section` · `Chip` · `Pip` · `Json` · `Markdown` · `Org` · `Pdf` · `Empty` · `Asset` · `Tile` · `Plate` · `Entry` · `Helpdesk` …, the read-only atoms.

**controls**
`subsystems/drapes/controls/`
`Keyboard` (the offscreen focus holder) · `ViewportLock` · `Key` · `Field` · `Input` · `Textarea` · the actions `drag` · `visible` · `persist`. `Button` is dead: hand-roll the button.

**panels**
`subsystems/drapes/panels/`
`Frame` (the buffer mount, §5) · `Icon` (Carbon, app layer only) · `Card` · `Desk` · `Loader`.

**skins**
`subsystems/drapes/skins/`
`Skin` over signature nodes, drawn as `Tree` · `Table` · `List` · `Filter` · `Palette` · `Breadcrumb`. H uses breadcrumb.

**stage · triage · decor**
`subsystems/drapes/stage/` · `subsystems/drapes/triage/` · `subsystems/drapes/decor/`
`Canvas` + `stage` (the 3D stage registry views use) · `Plane`/`Box`/`Shelve` (BSP layouts) · `Text`/`Pictogram`/`Image`/`Audio`/`Video`.

**editor**
`subsystems/drapes/editor/index.js`
A CodeMirror editor, reached ONLY by this subpath (~400 kB, never the barrel). Its one consumer is outside the repo.

Imports measured on 09-24. anima: `Section` 4 · `Icon` 2 · `Frame` · `Chip` · `Pip` · `Json` · `Markdown` · `skins`. Registry views: `Empty` 8 · `Pip` 7 · `Asset` 7 · `Desk` 6 · `drag` 6 · `Canvas`/`stage` 4 · `visible` 4 · `ViewportLock` 3.

---

## 10 · the wire: what anima speaks

Lighthouse (HTTP fetch, `PUBLIC_VIVA_LIGHTHOUSE_REMOTE`, retry 2, no default timeout; a request's own `options.timeout` applies):

```
/auth/login  /auth/verify  /auth/refresh  /auth/logout  /manifest  /entities/daemon/*
```

Daemon (one WebSocket per origin at `/multiplex?token=<access>`, `shard.transmitter.multiplex`, `subsystems/typology/gestalten/shard/transmitter.js:11`):

```
/userspace/handshake
/status  /status/subscribe
/metadata/{manifest,cortex,aperture,statics,cargo}   /datamap
/entities/{mode,literal,symbol}/*
/userspace/entities/{thread,buffer,turn,intent,activity}/*   …/subscribe
/userspace/entities/activity/<id>/{stdin,stdout}
/cortex/*
/mode/<type>/<slug>/metadata/{application,emitter,aperture,harness}
/mode/<type>/<slug>/{emit/*, harness/*, <aperture>}
attach/bundle/<daemon>/<mode>/<hash16>.svelte.mjs     ← plain fetch by Bundle.load
```

Every connection call opens a span on `logger.channel` (the bundle fetch is a plain `fetch`, no span). Those spans are G's story and, in DEV, the `console.debug` tap (`+layout.svelte:49`).

---

## 11 · drift this read found

- `navigation.js` (`app/panels/d/navigation.js`) has no importer. It is the only reader of `SELFEVIDENT`, so both are dead.
- `conversation()` (`prototypes/conversation.js`) and `box.device.speaker` have no live consumer: the dock streams itself, and B's `BoxSection` is commented out.
- drapes `context/` (`Decorum` · `Zone` · `SkeletonProvider`) has zero consumers in anima, drapes or the registry.
- `ThreadTraitsEnum` has 4 members, while E writes `INTELLIGENT` into `thread.traits`. The column accepts it (3 dbs carry it).
- The Stall's built-in release hook still `console.log`s (`subsystems/typology/prototypes/stall.js:14`).
- `.system-alert-rail` CSS in `+page.svelte:103` has no element.
- In `done/pincer.quest.org`, "A = header/nav" is stale: A is the stage now.
- Two gates, one question: D lists modes by `application|conversational`, while the dock and chat gate on `HARNESSED`.

---

## 12 · where to look

**Shell**
`systems/anima/src/app/+layout.svelte`
`systems/anima/src/app/+page.svelte`
The four contexts, the gate, the effects, and the rect math that places panels and bones.

**Effects**
`systems/anima/src/app/terminals.js`
`systems/anima/src/app/focus.js`
Terminal hydrate/persist/settle, and per-thread buffer+turn hydration.

**Structures**
`systems/anima/src/typology/stores/`
`systems/anima/src/typology/entities/`
Lighthouse, terminals, bridge, box; the eight dossiers and the trait code.

**Surfaces**
`systems/anima/src/app/bones/`
`systems/anima/src/app/panels/`
The T-bone chrome and panels A–H. `panels/a/widgets/Dock.svelte` is the largest file (1859 lines).

**Shared prototypes**
`subsystems/typology/prototypes/{stall,view,bundle,remote-repository,entity-manager}.js`
The cursor machine, the view record, the verified loader, the repositories.

**The other end**
`systems/runtime/lifecycle/daemon/aperture/metadata.js`
`systems/runtime/lifecycle/mode/traits/`
What each trait publishes and does server-side.
<context files="0" tokens="~0">

</context>
