> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# HTML Client

> Browser interface. Pincer T-bone layout. Dossier-driven entity hydration. Four Svelte contexts. Everything flows through connection, dossier, and Stall.

## Role

Surface. A SvelteKit SPA that connects to runtime daemons via Connection, hydrates entities through the dossier/EM layer, and renders mode views inside the pincer layout. Most logic lives server-side — the client is thin: connection, entity hydration, layout geometry, and view dispatch. No routes beyond the root; everything lives in panels.

## Stack

- SvelteKit adapter-static (SPA, fallback: 200.html) — no SSR
- Svelte 5 (rune props: `$props()`, `$state`, `$derived`, `$effect`)
- Vite + `@deno/vite-plugin` for Deno compatibility
- Tailwind CSS + PostCSS — dapper generates `--colors-skeleton-N-*` CSS vars (zone migration in progress, see Decorum)
- nanostores for reactive state (`atom`, `computed`, `map`, `effect`)
- nginx:alpine for production serving (Docker)

## Structure

```
src/
├── client.js                     Context symbols (LIGHTHOUSE, QUARTERS, BRIDGE, THREAD — DAEMON/MODE legacy, remove)
├── client.html                   App template (safe-area-inset padding on body for iOS)
├── client.css                    Tailwind entry + global reset
├── telemetry.js                  Pipe + $telemetry atom (sliding window, 200 spans max)
├── routes/
│   ├── +layout.js                export const ssr = false (disables SSR entirely)
│   ├── +layout.svelte            Root layout — all 4 contexts, gate, pincer + viket
│   ├── +page.svelte              Login page (env.PUBLIC_VIVA_LIGHTHOUSE_REMOTE not set)
│   ├── decorum/                  Decorum theming demo (M4 scaffolded)
│   ├── skinner/                  Vector skin lab (tree/palette/table/etc demos)
│   └── pincer/
│       ├── bones/
│       │   ├── shoulder.svelte   Phase meter + stall activity indicator
│       │   ├── crown.svelte      Terminal tab strip + spawn button
│       │   ├── pincer.svelte     Viket junction square (structural, no content)
│       │   └── spine.svelte      (status indicators — future)
│       └── panels/
│           ├── a.svelte          Buffer rendering (Frame drape skin) + Dock mount
│           ├── a/Dock.svelte     Session chat strip (embedded in Panel A)
│           ├── a/dock.geometry.js  Pure layout module (resolve/clampShare/flexDirection)
│           ├── b.svelte          Controls (G/H/snap toggles, clear, logout, eruda)
│           ├── c.svelte          D/E/F split with twig drag dividers
│           ├── d.svelte          Navigation (outside: threads/intents/modes list) + thread detail (inside: traits/buffers)
│           ├── e.svelte          Active thread JSON dump (dev)
│           ├── f.svelte          DAG tree of thread buffers
│           ├── g.svelte          Telemetry overlay (spans, fault/slow/recent, waterfall)
│           ├── h.svelte          Inspector drawer (composeInspector + breadcrumb skin, drag resize)
│           ├── inspector.js      composeInspector(lighthouse, quarters, bridge, thread) → Vector
│           └── navigation.js     compose(lighthouse, threadContext) → {threads, modes, intents}
└── typology/
    ├── mod.js                    @vivalence/html barrel (namespace + flat exports)
    ├── belt/
    │   └── narrow.js             Filter/rank utilities: text(), keyed(), narrow(), rank(), presets
    ├── entities/                 Entity classes + dossiers (domain layer)
    │   ├── terminal.js           Terminal + TerminalDossier (LocalRepository, persist: "viva.quarters")
    │   ├── mode.js               Mode + ModeDossier (RemoteRepository, BUFFERED hydration)
    │   ├── intent.js             Intent + IntentDossier (RemoteRepository)
    │   ├── thread.js             Thread + ThreadDossier (RemoteRepository + trait middleware)
    │   ├── buffer.js             Buffer + BufferDossier (RemoteRepository, view assignment)
    │   ├── turn.js               Turn + TurnDossier (RemoteRepository)
    │   └── literal.js            Literal + LiteralDossier (RemoteRepository)
    └── prototypes/               Infrastructure classes (no domain knowledge)
        ├── entity.js             Base Entity — schema-aware toJSON()
        ├── dossier.js            wireDossier, compileSchema, defaultCast, localFactory
        ├── dataspace.js          Dataspace — EM + repos from entity dossiers
        ├── daemon.js             Daemon class + selbstbestimmte boot vector
        ├── lighthouse.js         Lighthouse class + boot/populate/hydrate functions
        ├── persistence.js        hydrate(lighthouse) — localStorage authority restore + reactive persist
        ├── quarters.js           Quarters class (terminal LocalRepository + $active atom)
        ├── bridge.js             Bridge class (layout/view/paneSize stores + geometry engine)
        ├── thread-store.js       ThreadContext class ($current wrapped with stall lifecycle)
        └── stall.js              Stall — buffer queue state machine (UNINITIALIZED → IDLE → PULLING → EXHAUSTED/ERROR)
```

## Contexts (Ship Metaphor)

Four Svelte contexts. Set unconditionally at `+layout.svelte` init via `setContext`. Gate controls whether children render, not whether contexts exist. Contexts are always populated by the time children see them.

**LIGHTHOUSE** — the navigation tower. Auth, identity, daemons.
- `Lighthouse` instance with `connection`, `$authority`, `$identity`, `$status`, `$isAuthorized`, `$isIdentified`, `daemons` Map (slug → Daemon), `$daemons` atom.
- Middleware chain on connection: `shard.track.span` → `shard.track.request` → `shard.track.fault` → `shard.connection.authorize` → `shard.connection.retry` → `shard.connection.timeout` → `shard.connection.track`.
- Methods: `login(username, password)`, `verify()`, `refresh()`, `logout()`.
- `hydrate(instance)` restores `$authority` + `$identity` from localStorage; reactive `effect` persists changes.

**QUARTERS** — the workspace. Terminal repository and active terminal management.
- `Quarters` instance with `terminals` (LocalRepository via `wireDossier(TerminalDossier)`), `$active` atom (id), `$terminal` computed (active Terminal or null).
- `spawn(slug?)` creates terminal, persists active. `activate(id)` sets `$active`. `close(id)` removes terminal, shifts active to last remaining or null.
- Active id persisted to `localStorage["viva.quarters.active"]`.

**BRIDGE** — the helm. Layout geometry, view toggles, pane sizes. Persisted to `localStorage["vivalence:bridge"]`.
- `Bridge` instance with `layout` store (`$pincer`, `$previous`, `$standard`, `$orientation`, `$inspectorHeight`, `$viewport`, `$home`, `$start`), `view` store (`$d`, `$g`, `$h`, `$snap`), `paneSize` store (`$d`, `$e`, `$f`, `$panes`).
- Every store key has a `$key` atom + transparent getter/setter via `Object.defineProperty`. `store.toJSON()` serializes declared fields.
- `bridge.save()` writes the union of all three stores to localStorage.
- Geometry functions exported: `clamp`, `snapToGrid`, `rectsForOrientation`, `bonesForOrientation`, `snapToOrientation`, `orientationToSnap`, `snapLabel`. Constants: `BONE_THICKNESS = 45`, `PINCER_SIZE = 45`, `HALF = 22.5`, `EDGE_PADDING = 22.5`.
- `SNAP_PERCENTS = [0, 13, 21, 34, 50, 66, 79, 87, 100]`, `SNAP_DISTANCE = 28`.

**THREAD** — the navigational pivot. The active thread. Daemon and mode are accessors on thread.
- `ThreadContext` instance with `$current` atom (Thread or null).
- `$current.set` is wrapped: identity check, deactivates old thread's stall, activates new thread's stall.
- `set(thread)` — updates active terminal's persisted daemon/thread markers, then sets `$current`.
- `clear()` — clears active terminal's markers, clears `$current`.
- `resolve()` — iterates all terminals, resolves daemon+thread ID markers to live objects via `daemon.entities.thread.findOneLocal` + remote fallback, then sets `$current` to active terminal's resolved thread.
- Subscriptions: `quarters.$active` and `lighthouse.$daemons` both trigger `resolve()`.

`window.__viv` in `+layout.svelte` exposes all four contexts for console debugging.

## Pincer Layout

T-bone layout system. The *viket* (square at the junction) is the user's grip. Its `{x, y}` position and `orientation` (0°/90°/180°/270°) determine the panel rects via `rectsForOrientation` and bones via `bonesForOrientation`. All positions are in viewport pixels.

**Panel rects** — `{left, top, width, height}`, 0-clamped. Position computed from `pincer` atom + orientation. Panels collapse to 0 when viket reaches an edge.

**Orientation semantics** (what goes where changes; semantic roles are fixed):
- A: the full-width panel across the top of the T (varies by orientation)
- B: one side of the stem
- C: the other side of the stem (D/E/F split)

**Viket gestures**:
- Single tap → jump to standard (home position)
- Double tap → swap pincer with previous
- Triple tap → mark current as standard
- Long press → radial menu (4 spokes: orientation directions). Drag toward spoke to commit. Release near center → sticky mode (radial stays, click spoke to commit).
- Drag → move pincer. Snap grid attractive at `SNAP_PERCENTS`. `bridge.save()` on release.

**Panel C** hosts D/E/F with twig dividers. Twig drag resizes adjacent panes pixel-pinned (no proportional math). `paneSize` store persisted.

**Panel H** (inspector drawer) — slides from the top. Height drag handle resizes. `layout.$inspectorHeight` atom. `composeInspector` builds a Vector snapshot of all four contexts; rendered via `Skin({nodes, variant: "breadcrumb"})` from `@vivalence/drapes`.

**Panel G** (telemetry overlay) — fixed position right side. Subscribes to `$telemetry` atom. Three sections: faults, slow (>500ms), recent. Click span → waterfall detail view.

**Panel A** — gates `Frame` mount on buffer *value* (not just atom existence). Svelte 5 misses nanostore atom value changes when Frame mounts with null. Tear down old subscriptions on thread change. Layout math (side/share/flex-direction/chat-size/drag) lives in `panels/a/dock.geometry.js` as pure functions; `a.svelte` holds subscriptions, `Dock.svelte` renders the session strip — three layers split clean.

**Shoulder bone** — shows `thread.phase` + stall status + buffer count. Click → `thread.queue.pull()`. Animated sweep on PULLING state.

**Crown bone** — terminal tab strip. Active tab gets primary border. `quartersInstance.spawn()` on `+` button. Close button on active tab only. Tab label reads `thread.label.name` for active, falls back to `thread?.label?.name ?? thread?.id ?? "+"`. `direction: rtl` + LRM injection so the tail of a label stays visible (most specific part).

## Dossier Architecture

The central pattern for client-side entity lifecycle. A **dossier** is a plain object:

```js
{
  name: string,           // entity name (e.g. "thread")
  kind: () => Class,      // constructor factory
  repository: (schema, dataspace?) => Repository,  // repo factory thunk
  use?: [middleware],     // enrichment middleware (post-cast)
  cast?: (ctx) => void,   // custom cast (replaces defaultCast)
}
```

**`wireDossier(schema, dataspace?)`** — the entry point. Calls `schema.repository(schema, dataspace)` to get the repo, then calls `compileSchema(schema, repo, dataspace)` and assigns the result to `repo.hydrate`. Returns the repo.

**`compileSchema(schema, repo, dataspace)`** — builds a selbstbestimmte vector:
1. Base middleware injects: `ctx.schema`, `ctx.name`, `ctx.repo`, `ctx.em`, `ctx.dataspace`
2. Each `schema.use` middleware runs post-cast
3. Effect: `schema.cast ?? defaultCast` — calls `ctx.em.cast(ctx.name, ctx.raw, ctx.schema.kind())` or falls through to `ctx.raw`
4. Compiled via `shape.selbstbestimmt(vector, dataspace?.factory ?? localFactory)`

**`repo.hydrate`** is the compiled lifecycle function. Called on every entity ingress (create, merge). Returns the entity.

**`defaultCast`** — calls `ctx.em.cast()` for EM-managed repos, or returns `ctx.raw` for LocalRepository. Sets `ctx[ctx.name] = ctx.entity` for downstream middleware access.

**`localFactory`** — strategy for local repos (no EM). `(carry, effect) => async ({entity, raw}) => { await carry(ctx, effect); return ctx.entity }`.

## Entity Classes

All inherit from `Entity` (base class in `prototypes/entity.js`). Entity constructor does NOT call `Object.assign` — class field initializers run after `super()`, which would overwrite assignments. The EM's `merge()` calls `Object.assign` after construction.

**`Entity.toJSON()`** — schema-aware serialization. m:1 fields serialize as `{id}` stubs. 1:m/m:n fields serialize as arrays of `{id}`. Objects with custom constructors (nanostores, Stall) are skipped. Reads `this.constructor.schema?.properties` for relation kind metadata.

**`Terminal`** — does NOT extend Entity. Plain class with `id`, `slug`, `daemon`, `$thread` atom with transparent getter/setter. `toJSON()` manually lists fields (known gap: should derive from schema). `TerminalDossier` uses `LocalRepository({ kind: Terminal, persist: "viva.quarters" })`.

**`Thread extends Entity`** — `$buffer` atom, `$label` atom, `queue` (Stall). `label` getter/setter normalizes strings to `{name}` and fills defaults. `traits` array + `trait` object (config per trait). `cursor` field marked LEGACY REMOVE.

**`Buffer extends Entity`** — lifecycle hook arrays (mount/render/tick/release/destroy) via `buffer.on.mount(cb)` etc. Hooks are `fn.once`-wrapped (single-fire for non-tick). `Buffer.from(pojo, view)` static factory. `view` assigned in BufferDossier middleware from `mode.buffered`.

**`Mode extends Entity`** — `implements(trait)` checks `this.traits?.includes(trait.toUpperCase())`. ModeDossier middleware: if BUFFERED, fetches `/buffered`, sets `mode.buffered` and `mode.buffer(desc)` factory. Sets `mode.daemon`, `mode.mount`, `mode.connection`, `mode.call`, `mode.link`.

**`Intent extends Entity`** — `implements(trait)`. IntentDossier has no use middleware.

**`Turn extends Entity`** — `role`, `parts`, `meta`, `thread`, `mode`, `parent`.

**`Literal extends Entity`** — bare class.

## Thread Trait System

Client-side traits live in `traits/thread/` — one file per trait, each named-export (`LABELED`, `MASKED`, `INSITU`, `AIMED`, `QUEUEING`, `FURNISHED`, `SELFEVIDENT`). `traits/thread/index.js` re-exports them; `entities/thread.js` imports the namespace via `import * as threadTraits from "../traits/thread/index.js"` (relative path — barrel import would create a Rollup-breaking cycle). Dispatched by `ThreadDossier.use` middleware after cast. **Two-pass pattern** (mirrors runtime `resolution.js`):
1. First pass: iterate `thread.traits`, call each `traits[trait]?.(thread, ctx)`. If it returns a function, collect as finalizer.
2. Second pass: run all finalizers in order.

Finalizers exist because some traits depend on results of others:
- **AIMED** returns a finalizer — needs `thread.mask` set by MASKED.
- **QUEUEING** returns a finalizer — needs `thread.pull` set by AIMED.

**LABELED** — seeds `thread.label` from `thread.trait.LABELED` config, then intent name/slug, then mode name/slug. Three-step fallback.

**MASKED** — sets `thread.mask = { thread: thread.id, ...(thread.trait.MASKED ?? {}) }`. Used by AIMED for the pull call.

**AIMED** — finalizer: sets `thread.pull = thread.mode.connection.aim(thread.trait.AIMED.mount, thread.mask)`. This wires the SSE pull endpoint.

**QUEUEING** — closes any existing stall. Creates new `Stall($pending, thread.$buffer)` where `$pending = computed(thread.$buffers, buffers => buffers.filter(b => !b.status || b.status === "PENDING"))`. Finalizer:
1. Subscribes `queue.$active` → on buffer activation, sets `buffer.status = "ACTIVE"`, calls `em.persist(buffer)`.
2. `queue.withPull(handler, config.depth)` — pull handler: builds Blacklist from existing buffers, calls `thread.pull({blacklist})`, suspends stall, merges returned buffers (sets context + release hook on each), resumes stall.
3. Subscribes `queue.$status` → on ERROR, drains a stall.error span to telemetry.

**INSITU** — stub. Presence marker added by ThreadDossier middleware when `thread.mode` has CONVERSATIONAL. No behavior in the trait function itself.

ThreadDossier also has additional middleware (runs before trait pass):
- Injects `ctx.daemon` onto entity.
- Checks mode for CONVERSATIONAL → ensures INSITU on traits array.
- Ensures LABELED is in traits.

## Stall

Buffer queue state machine. Controls pull timing, active buffer, and queue depth threshold.

```
StallStatusEnum: UNINITIALIZED → IDLE → PULLING → EXHAUSTED | ERROR | CLOSED
```

**`withPull(handler, threshold)`** — arms the pull handler and depth threshold. Does NOT activate.

**`activate()`** — idempotent. Sets IDLE. Subscribes `$status` (on IDLE: advance if queue non-empty; pull if below threshold) and `$source` (on change: advance if queue non-empty and nothing active). Captures teardowns.

**`deactivate()`** — unsubscribes all teardowns, resets `activated` flag. Stall can be re-activated.

**`suspend()`/`resume()`** — guard against advance during buffer merge hydration. `$source` fires from `em.merge` before Buffer's `use` middleware sets `view`. Without suspend, the stall would advance to a buffer with no view.

**`next(promise?)`** — advance cursor: null active, call `advance()`, run hooks, pull if below threshold.

**`pull()`** — idempotent guard (blocks if CLOSED/PULLING/EXHAUSTED/ERROR or queue above threshold). Sets PULLING, awaits handler, updates status from result condition.

**In-flight guard**: after `await handler(stall)`, checks `!this.activated` before acting on result — prevents stale pulls from landing after deactivation.

**`close()`** — terminal state for stall replacement (QUEUEING on re-application). Sets CLOSED, nulls handlers.

**`ThreadContext.$current.set` wrapper** — on thread change: deactivates old `thread.queue`, activates new `thread.queue`. Single mutation point for all thread-switch paths.

## Dataspace

One per daemon. Created by `daemon.js` boot lifecycle. Holds `em` (RemoteEntityManager), one repo per entity dossier registered via `wireDossier`. Factory (the selbstbestimmte strategy) provides `{ raw, daemon, mount, link, connection }` as execution context per hydration call.

```js
const dataspace = new Dataspace({
  entities: [ModeDossier, IntentDossier, ThreadDossier, BufferDossier, TurnDossier, LiteralDossier],
  connection,       // daemon's connection
  factory,          // createFactory(daemon) — builds ctx for hydrate
});
await dataspace.init();         // fetches /datamap, sets em.schema
await dataspace.populate(["mode", "intent"]);  // calls find() on those repos
```

`dataspace.em` exposes `RemoteEntityManager`. `EM.persist(entity)` marks dirty and refreshes reactive store. `EM.cast(name, raw, kind)` — schema-driven relation resolution + reactive collection creation. For 1:m fields with `mappedBy`, auto-creates `entity.$field = computed(childRepo.$entities, ...)`. Transparent accessors: vanilla getter + no-op setter on the field name.

## Daemon Boot Lifecycle

Selbstbestimmte vector in `daemon.js`. Strategy: `(carry, effect) => async ({ connection, lighthouse }) => { ... }`.

1. **Effect**: `new Daemon(connection)`, assign `daemon.lighthouse`.
2. **Middleware**: fetch `/manifest` + `/cargo` in parallel. Set `daemon.manifest`, `daemon.mount = new Path("/daemon/{slug}")`, `daemon.link = new Path("/{lighthouse.slug}/{slug}").rebase("/viva")`, `daemon.call = connection.call.bind(connection)`.
3. **Middleware**: create `Dataspace`, call `init()`, `populate(["mode", "intent"])`.

Daemon connection also gets batch middleware: `shard.connection.batch({ hatch: url, filter: ctx => ctx.request.headers.get("accept") !== "text/event-stream" })`. SSE requests bypass batch.

## Lighthouse Boot Functions

Functional lifecycle — standalone functions over a `Lighthouse` instance (no boot vectors).

**`hydrate(instance)`** (`persistence.js`) — restores `$authority` + `$identity` from localStorage keyed by connection URL. Reactive `effect` on both atoms — persists changes.

**`boot(instance)`** — calls `verifyAuth`, then `populate` if authorized.

**`populate(instance)`** — fetches `/manifest` + `/entities/daemon/find`. For each daemon pojo, creates Connection with authorize + batch middleware, calls `bootDaemon({ connection, lighthouse })`. Stores in `lighthouse.daemons` Map (keyed by slug). Sets `$daemons`.

## Root Layout Boot Sequence

`+layout.svelte` (top-level, never replaced by routes):

1. `new Connection(new Url(env.PUBLIC_VIVA_LIGHTHOUSE_REMOTE))` — raw connection.
2. `new Lighthouse(connection)` — constructor applies middleware chain.
3. `lighthouse.hydrate(instance)` — localStorage restore.
4. `setContext(LIGHTHOUSE)`, `setContext(QUARTERS)`, `setContext(BRIDGE)`, `setContext(THREAD)` — unconditionally at init.
5. `window.__viv = { lighthouse, quarters, bridge, thread }` — dev handle.
6. Gate computed from `$isAuthorized` + `$status`:
   - `"offline"` — status.code === "OFFLINE"
   - `"error"` — status.code === "ERROR" or "SESSION_EXPIRED"
   - `"auth"` — !authorized
   - `"verifying"` — AUTHENTICATING/VERIFYING/REFRESHING
   - `"ready"` — authorized + no transitional status
7. `onMount`:
   - `lighthouse.boot()` kicks off verify → populate.
   - Subscribe `$isAuthorized`: on first authorization, call `populate()` once (idempotent guard).
   - Subscribe `quarters.terminals.$entities` for `terminalCount` (blur overlay).
8. When gate = "ready": render `{@render children()}` (the pincer layout).
9. When gate = "auth": render Login component.
10. When gate = "error"/"offline": render retry/reconnect screens.
11. Blur overlay when `terminalCount === 0` — click to `quartersInstance.spawn()`.

## @vivalence/html Barrel

`src/typology/mod.js` is the barrel. Alias `@vivalence/html` → `src/typology/mod.js` in vite.config.mjs.

Namespace exports:
- `lighthouse` — all from `prototypes/lighthouse.js`
- `daemon` — all from `prototypes/daemon.js`
- `quarters` — all from `prototypes/quarters.js`
- `bridge` — all from `prototypes/bridge.js`
- `thread` — all from `prototypes/thread-store.js`

Flat exports: `Entity`, `wireDossier`, `compileSchema`, `defaultCast` (from dossier.js); all entity classes + dossiers.

**Circular import constraint**: entity files (`entities/`) must NOT import from the `@vivalence/html` barrel. Rollup flattens modules and cannot linearize static cycles — produces TDZ errors in production build. Entity files use direct relative paths to `"../prototypes/entity.js"`. This constraint applies everywhere in `entities/` and `prototypes/`.

## Telemetry

`src/telemetry.js`: `telemetry` is a `Pipe` instance. `$telemetry` is an atom holding the last 200 spans. Any code that wants to emit spans imports `{ telemetry }` from `"$telemetry"`. Panel G subscribes to `$telemetry` for display.

`Span` used in thread traits for pull tracing: `new Span("pull").to(telemetry).begin()` → `span.track.transition().depart(status)` → `span.track.subject().target("buffer", id)` → on result → `span.track.transition().arrive(condition)` → `span.drain()`.

## Principles

### DOM is a consumer of the dataspace

Components do NOT construct, populate, or resolve entities. They consume resolved state. Components may:
- **Integrate** — subscribe to reactive atoms, bind to stores
- **Consume** — read entity properties, iterate collections
- **Affect** — trigger actions (spawn terminal, release buffer, navigate)

They do NOT resolve IDs to instances, enrich entities with references, or build paths. If a component needs a resolved entity, the dataspace delivers it resolved. If it doesn't, the gap is in the typology layer.

### State is data, lifecycle is functions over data

No boot vectors on the client. No OOP lifecycle methods. `Lighthouse`, `Daemon`, `Quarters`, `Bridge`, `ThreadContext` are pure state containers. All async work happens in standalone functions (`boot`, `populate`, `resolve`) or in selbstbestimmte vectors. The class exists to hold atoms and provide accessors. The functions do the work.

### Dossier is the single entity lifecycle pattern

Every entity class is paired with a dossier. `wireDossier` is how repos get created. `repo.hydrate` is how entities get enriched. No special-cased hydration code outside of dossier middleware. When adding a new entity type, add a class + dossier + add to the entities array in `daemon.js`.

### Imports through @vivalence/html barrel

All consumer-side imports go through `@vivalence/html`. Never deep sub-paths. Exception: entity files themselves use direct relative paths to avoid circular deps.

### Layout math is pure, separate from subscription wiring

When a panel has non-trivial layout math (side/share/flex-direction/chat-size/drag/clamp), extract it to a sibling `*.geometry.js` module as pure functions — no Svelte, no atoms, no DOM. The `.svelte` component subscribes, holds state, renders; the geometry module owns constants (enums, bounds, defaults) and transforms (`resolve(state, rect)` → derived values). Precedent: `typology/prototypes/bridge.js` (pincer geometry) and `routes/pincer/panels/a/dock.geometry.js` (dock). Constraint tests against the pure module catch regressions without Svelte runtime: see `tests/pincer/dock.geometry.test.js` for the shape. Panel fittings (like `Dock.svelte`) also live with their panel (`panels/a/Dock.svelte`) rather than in a shared `components/` dir — fittings belong to the panel they mount into.

## Navigation Pattern

`navigation.js` `compose(lighthouse, threadContext)` builds three flat node arrays (threads, modes, intents) from live lighthouse/daemon state. Effects:
- **resume(thread)** — `threadContext.set(thread)`
- **openFromMode(daemon, mode)** — `daemon.entities.thread.create({mode: mode.id})`, then `threadContext.set(thread)`
- **openFromIntent(daemon, mode, intent)** — `daemon.entities.thread.create({mode: mode.id, intent: intent.id})`, then `threadContext.set(thread)`

Only SELFEVIDENT modes appear in the modes list (modes with `SELFEVIDENT` trait). Intents appear always (mode authors seed intents as the primary nav surface).

`narrow.js` provides filter/rank utilities. `narrow.narrow(query, nodes, matchers)` splits query on spaces, every term must match at least one matcher. `navigation` preset: `text("nature", ...)` + `keyed()`.

## Build & Deploy

### Dev

`deno task html/watch` — Vite dev server. Needs `VIVA_SYSTEM_ROLE=CLIENT` and paladin (circuitry). `serverConfig()` in vite.config.mjs runs paladin, reads `paladin.variant.clients.html` for host/port/cors.

`deno task html/bundle` — production build. Only needs `VIVA_SYSTEM_MODE=BUILD` and `VIVA_SYSTEM_ROLE=CLIENT`. Paladin NOT needed.

`deno task html/preview` — serves production build locally. Needs paladin for config.

### Bundle constraint

`ssr.noExternal: true` in vite.config.mjs — Vite bundles all deps into SSR output so Deno workers can resolve them. Deno fails on bare imports in worker subprocesses otherwise.

### Docker Image

Multi-stage:
1. **Build stage** (vivalence/viva:alpine): `VIVA_SYSTEM_MODE=BUILD`, `VIVA_SYSTEM_ROLE=CLIENT`, runs `deno task html/bundle`.
2. **Runtime stage** (nginx:alpine): copies `build/`, serves on port 1794. `try_files $uri $uri/ /200.html` for SPA fallback.

**Env injection**: adapter-static writes `PUBLIC_*` vars to `build/_app/env.js` at build time. Dockerfile entrypoint overwrites `_app/env.js` at container startup from runtime env vars. Image is deployment-agnostic.

## Testing

Tests live in `systems/html/tests/`. Current suites:

- `tests/pincer/dock.geometry.test.js` — constraint invariants for Panel A dock layout: share clamping, side enum, flex-direction mapping, drag-sign convention, zero-dim rect safety. 13 specs.
- `tests/typology/dossier.test.js` — `wireDossier`, `compileSchema`, middleware pipeline order, `defaultCast` (LocalRepository path). 6 specs.
- `tests/typology/quarters.test.js` — Quarters CRUD, active tracking, LocalRepository integration. 5 specs.
- `tests/typology/terminal.dossier.test.js` — TerminalDossier, LocalRepository with localStorage persistence. 7 specs.
- `tests/daemon/` — older wafer-era tests (may be stale relative to functional lifecycle).
- `tests/stall.test.js` — Stall state machine, cursor model, pull guards. 33 steps.

## Known Issues and Gaps

- **Terminal.toJSON** manually lists fields — should derive from schema like `Entity.toJSON` does. Silent data loss risk.
- **DAEMON/MODE symbols** in `client.js` are marked LEGACY — should be removed once all consumers confirmed gone.
- **ThreadContext.resolve()** has inline `@beef` comments marking the resolution logic as wrong — `thread.id ?? thread` and `daemon?.slug ?? daemon` guards indicate terminal serialization is not yet clean.
- **Thread.cursor** field marked LEGACY REMOVE.
- **Panel E** shows raw JSON dump — intended to become a proper view module using `Buffer` view dispatch.
- **systemAlert** hardcoded `false` in `+page.svelte` — needs real derivation from lighthouse + daemon aggregate.
- **INSITU trait handler** is a stub (empty function body).
- **Stall `activate`/`suspended`** flags are plain properties, not atoms — noted as ugly in source.
- **Dossier.js** has a "dirty dirty claude" comment — the `localFactory` is ad hoc, should integrate cleaner with the selbstbestimmte strategy pattern.
- **Decorum M2-M5 not implemented** — zone-based theming still uses `--colors-skeleton-N-*` vars. `<Zone>` wrapper and `DECORUM` context not yet wired.
- **Session (longdistance)** not yet implemented — TerminalDossier subscriber for INSITU threads not built.

## Active Work Packages

- **pincer.workpackage.org** — T-bone layout system. Phases 1–17 complete (prototyping through context architecture). Phases 2–7 (extraction, totems, persistence, wiring) superseded by the direct implementation that landed.
- **terminal-first-client.workpackage.org** — Phase 1 (REPL skeleton) superseded by pincer layout approach. The terminal-first philosophy is implemented but via context architecture rather than the REPL-at-root design originally envisioned.
- **decorum.workpackage.org** — M1 done (zone CSS emission). M2 (Zone wrapper + DECORUM context), M3 (component migration), M4 (demo page), M5 (theme switching) open.
- **longdistance.workpackage.org** — DESIGN step 1 done. TerminalDossier subscriber for INSITU/session lifecycle is the client-facing gate for step 2.
- **datamap-client-migration.workpackage.org** — Server-side done. Client open: SSE subscribe wiring, persist test against /batch endpoint.

## Maintenance

This is the most volatile part of the system. The architecture is now stable (contexts, dossiers, pincer) but panel content evolves quickly. When updating this doc: keep the dossier architecture, context semantics, stall lifecycle, and boot sequence sections accurate — those are the most load-bearing for new work. Panel implementations are secondary.
