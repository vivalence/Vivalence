> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# Runtime

> Runs and facilitates. Creates daemons, applies traits, manages lifecycles, serves HTTP.

## Role

Process. The procedural orchestration layer. Runtime wraps everything in Die/Wafer lifecycle containers, boots daemons from paladin's compiled variant, applies mode traits, compiles Vector routes to HTTP handlers, and serves via Deno.serve. The recursive lifecycle cascade — parent populate/resolve/integrate flowing to children — is the core pattern.

## Entry Points

| File | Lines | Purpose |
|------|-------|---------|
| mod.js | 20 | Exports: Runtime, Die, lifecycle, daemon, process namespaces |
| run.js | 75 | Boot entry. Awaits paladin, creates Runtime Die, runs lifecycle, perpetuates |
| deno.jsonc | 21 | Exports: `.`, `./run`, `./daemon`, `./process`, `./scenarios`. Tasks: test/daemon, test/mode, test/runtime |

## Boot Sequence (run.js)

```
1. await paladin.ikiro              Config system ready
2. new Die({ good: new Runtime() }) Wrap runtime in lifecycle container
3. await die.populate()             Load registries, create terrans
4. await die.resolve()
   └─ for each terran:
      ├─ await terran.populate()    Load ORM, modes, traits
      ├─ await terran.resolve()     Apply traits, compose apertures
      └─ await terran.integrate()   Mark alive
   └─ runtime-level:
      ├─ attach()                   Route process/daemon apertures
      ├─ expose()                   Mount daemon manifests
      ├─ compose()                  Compile Vector → handler, wrap with CORS
      ├─ launch()                   Deno.serve(handler)
      └─ wake()                     Activate watchdog
5. await die.integrate()            Announce to lighthouse
6. await die.perpetuate()           Keep-alive loop (10s patrol, signal handlers)
```

Shutdown mirrors this in reverse via `die.disintegrate()` — cascades to all terrans, closes ORM, aborts signals.

## Core Classes

### Runtime

`runtime.js` (20 lines)

Container holding the running system:
- `server: Deno.HttpServer` — HTTP server (set by launch)
- `handler: (Request) => Response` — compiled HTTP handler (set by compose)
- `aperture: Vector` — root routing tree (aliased as Aperture)
- `twitch: Vector` — event system
- `daemons: []` — DaemonDie instances
- `processes: []` — ProcessDie instances
- `terrans` — getter, flattened daemons + processes
- `ters` — watchdog/patrol handler

### Die (Runtime-level)

`die.js` (97 lines) extends Wafer

Wraps Runtime in `.good`. Lifecycle methods:

**populate()** — `lifecycle.population.*`:
- `wiring(die)` — sets `die.good.latch` URL from PUBLIC_VIVA_RUNTIME_REMOTE
- `registry(die)` — mounts paladin registries (kernel, modes, services)
- `terrans(die)` — creates DaemonDie for each `paladin.variant.daemons`, ProcessDie for ATTACHED services
- `aperture(die)` — opens `/status` and `/manifest` endpoints

**resolve()** — recursive child lifecycle then `lifecycle.resolution.*`:
- Iterates all terrans: `populate() → resolve() → integrate()` for each
- `attach(die)` — routes process/daemon apertures
- `expose(die)` — mounts daemon sub-apertures with status/manifest
- `compose(die)` — `shape.http(aperture)` → handler, `shards.cors.wrap(handler)` → CORS-wrapped handler
- `launch(die)` — `Deno.serve({ port, hostname, signal, onListen }, handler)`
- `wake(die)` — creates watchdog polling every 10s

**integrate()** — `lifecycle.integration.announce(die)` registers daemons with lighthouse service.

**disintegrate()** — cascades `disintegrate()` to all terrans, aborts, deletes .good, status → stopped.

**perpetuate()** — signal listeners (SIGTERM, SIGINT, SIGQUIT), patrol loop, keep-alive.

### Die/Wafer Pattern

Wafer (from typology, 120 lines) is the base:
- `.good` — the wrapped business object
- `.mask` — manifest/configuration
- `.status` — Status instance (state machine)
- `.abort` — AbortController
- Empty lifecycle hooks: `populate()`, `resolve()`, `integrate()`, `disintegrate()`

Die extends Wafer with actual lifecycle implementation. The recursion: parent Die's resolve() calls each child Die's full lifecycle. This cascades arbitrarily deep.

## Daemon System

### Daemon

`daemon/daemon.js` (69 lines)

The business object wrapped by DaemonDie:
- `manifest, mount, url` — identity
- `aperture: Vector` — HTTP routing tree (aliased as Aperture)
- `connection, call` — internal RPC
- `authority, brain, entity` — service handles
- `kernel: {}` — reserved
- `entities: {}` — repository map + em (set by datamap provider, repos resolve through RequestContext)
- `twitch: Vector` — event system (on Runtime prototype, subscriber wired via datamap.subscribe)
- `modes: {}` — `{type: {slug: Mode}}`
- `services: {}` — external service providers
- `statics, docs` — config and documentation

### DaemonDie

`daemon/die.js` (225 lines) extends Wafer

Two key data structures:

`register` — raw module references loaded via paladin:
- lighthouse, hallucinator, datamap, kernel[], modes[], services[]

`variant` — resolved instances:
- kernel{}, modes[], traits{}, entities[], services{}

**populate()** — `daemon/lifecycle/population.*`:
- `core(die)` — resolves all registers via `paladin.vip.accioMap`, partitions kernel by type (domain/topology/ontology), merges traits and modes, collects entity schemas
- `wiring(die)` — copies statics/docs from mask
- `datamap(die)` — calls datamap service provider, stores result on `daemonDie.datamap`. Sets `good.entities` from provider's repositories. Wires twitch subscriber via `datamap.subscribe()`. Adds `shard.datamap.inject(datamap)` middleware (RequestContext per request + ctx.entities).
- `authority(die)` — sets up lighthouse auth middleware on aperture
- `acid(die)` — initializes hallucinator (AI service)
- `modes(die)` — instantiates Mode objects from registered modules, assigns mounts/URLs, creates mode entities in DB (wrapped in `datamap.context()` for EM access), links BUFFERED modes to buffer bundler
- `handlers(die)` — adds `flatmodes()` helper
- `services(die)` — loads external services via consume config

**resolve()** — `daemon/lifecycle/resolution.*`:
- `kernel(die)` — attaches domain aperture with daemon context and auth. Adds `shard.ambient.store((ctx) => ({ user: ctx.user, entities: ctx.entities }))` after authorize — establishes the ambient scope for the entire request. Then `datamap.bind("user", ...)` for MikroORM filters.
- `modes(die)` — wrapped in `datamap.context()`. For each mode: attaches context middleware, opens status/manifest endpoints, slurps mode aperture, **applies trait functions**, marks entity installed, attaches to daemon aperture with auth. Flushes at end.

**integrate()** — `daemon/lifecycle/integration.*`:
- `call(die)` — compiles aperture via `shape.http()`, wraps in `shard.transport.inline()`, creates internal Connection (enables `daemon.call(path, body)` without HTTP)
- `uninstall(die)` — removes DB records for modes no longer loaded

## Mode Trait System

`daemon/mode/traitmap.js` + `daemon/mode/traits/` (5 files, 2 dead: producer.js, valentic.js)

Traits are async functions `(mode, daemon)` applied during daemon resolution. Each trait can modify the mode's aperture, attach middleware, or perform setup.

**VIEWABLE** `traitmap.js` — compiles Svelte views via esbuild, exposes `/view` endpoint with bundle URL.

**DATASET** `traits/dataset.js` (76 lines) — upserts symbols and literals from `mode.cake.dataset.entities`. Batches in chunks of 100. Links symbols ↔ literals bidirectionally.

**INTENTED** `traits/intented.js` — iterates `mode.cake.dataset.intent[]`, upserts IntentEntity rows via `daemon.entities.intent.ensure()`. Sets `intentPojo.mode = mode.entity.id` (scalar PK, not POJO — POJO form `{ id: ... }` triggers MikroORM ghost entity creation). Seeds the intent graph at daemon startup. All 9 game modes now have FEEDING intents registered here.

**EMITTER** `traits/emitter.js` — activates if `mode.cake.emitter` is set (a Vector). First middleware: `shard.ambient.assign` inherits `user` and `entities` from the ambient scope (set by `shard.ambient.store` in resolution.kernel) — this is how shape.object emitter contexts get ctx.user without going through the HTTP authorize chain. Then: daemon/mode context middleware, session lookup, seek/blacklist conversion, post-processor (session assignment, flush, flat output). Post-processor returns entities — no POJO serialization. `toJSON()` handles serialization at the HTTP boundary. Exposes `mode.emit = shape.object(emitterVector)` for in-process calls and branches into `mode.aperture` at `/emit` for HTTP access.

**CHAOSMONKEY** `traitmap.js` — attaches hallucinator brain to mode. (Will be updated by cortex workpackage to compose the cortex during daemon population from hallucinator faculties and construct harnesses per mode.)

**FRAUGHT** `traitmap.js` — indexes freight catalog (mode.cake.freight), exposes `/freight` endpoint with catalog.

### Kernel Modes

`daemon/mode/kernel.js` (21 lines) — defines Domain, Ontology, Topology classes extending Mode. These are the kernel "modes" (domain logic, data schemas, datasets).

### View Bundler

`daemon/mode/view-bundler.js` (154 lines) — esbuild + Svelte plugin. Compiles `.svelte` files with import map resolution for @vivalence/* packages. Returns in-memory bundle (write: false).

## Route Registration

### Daemon Routes

`daemon/aperture/` (4 files) — registers effects on daemon's Vector during `die.resolve()`:

**datamap.js** — per-entity branches using `shard.datamap.repository()` + `shard.datamap.reactive()`:
- `/entities/literal` — full CRUD + reactive SSE subscriptions
- `/entities/symbol` — full CRUD + reactive SSE subscriptions
- `/entities/mode` — full CRUD (no reactive — modes are static)
- `/entities/intent` — full CRUD (no reactive — intents are static)

**userspace.js** — `/userspace/` prefix (all routes behind `shards.secure.authorize()`):
- `/handshake` — `{success, user}`
- `/entities/session` — full CRUD via `shard.datamap.repository()` + `shard.datamap.reactive()`, scoped to authenticated user via `shard.datamap.scope(ctx => ({ user: ctx.user.id }))`

**modes.js** — `POST /modes/:type/:method` — mode lookup by type and slug

**freight.js** — `POST /cargo` — returns `daemon.cargo` (freight catalog)

### HTTP Compilation

During `resolve.compose()`, the Vector routing tree is compiled to a native HTTP handler:
1. `shape.http(aperture)` — compiles Vector → `(Request) => Response` via traverse
2. `shards.cors.wrap(handler)` — wraps with CORS (preflight 204, origin checking)

The http shape handles content-type aware body parsing (JSON only — non-JSON stays unparsed, accessible via `ctx.request.stream()`), passes native Request as `raw` for WebSocket upgrades, native Response passthrough, 404/500 error handling, and content-type dispatch (JSON/binary/stream). No Oak middleware stack.

Each daemon gets mounted at `/daemon/{slug}/` via `.branch().slurp()` on the runtime aperture.

## Process System

`process/` (22 lines total) — lightweight. Process wraps a mask, ProcessDie extends Wafer with minimal lifecycle (just sets status to alive). Processes are ATTACHED services that provide their own aperture — mounted at `/attached/process/{type}/{slug}`.

The lighthouse multiplayer service is the primary process. Its aperture serves auth routes (`/auth/*`) and entity routes (`/entities/identity/*`, `/entities/daemon/*` via `shard.datamap.repository()`). The lighthouse scenario test lives in `@vivalence/runtime/scenarios` (lighthouse.js) and is consumed by `registry/services/@vivalence/lighthouse/multiplayer/tests/datamap.test.js`.

## Tests

Self-contained scenario tests organized by scope. No paladin, no network, :memory: SQLite. Exported via `@vivalence/runtime/scenarios`.

```
tests/
├── scenarios/                    Shared fixtures (exported via deno.jsonc)
│   ├── index.js                  Re-exports daemon, lighthouse
│   ├── entities.ts               Domain schemas (LiteralDomain+TRANSLATED) + seed()
│   ├── daemon.js                 create() → { conn, authedConn, orm, em, fixtures, mode }
│   └── lighthouse.js             create() → { conn, orm, em, repos, fixtures }
├── daemon/                       Daemon-scope tests
│   ├── datamap.test.js           Entity CRUD, errors, options sanitization, modes (15 steps)
│   ├── userspace.test.js         Auth gating, session create, user scoping (6 steps)
│   ├── freight.test.js           Cargo (1 step)
│   ├── smoke.test.js             Emit + persist + query lifecycle (6 steps)
│   └── integration.test.js       Live runtime via HTTP: auth, all 9 game emitters, 5 tactic phases, pick routes, review, session (39 steps)
├── mode/                         Mode-scope tests
│   ├── traits.test.js            INTENTED upsert/resolve, EMITTER compile/normalize/HTTP (9 steps)
│   └── entities.test.js          Direct fixture assertions (5 steps)
└── runtime/                      Runtime-scope tests
    └── composition.test.js       Daemon mounted under runtime aperture (6 steps)
```

7 suites, 55 steps, ~2s. `deno task test` runs all.

Scenarios are composable — the lighthouse scenario is also imported by `registry/services/@vivalence/lighthouse/multiplayer/tests/datamap.test.js` (11 steps) via `@vivalence/runtime/scenarios`.

Old monolithic tests preserved in `tests/scenarios/bak/`.

## Where Used

- **Paladin**: Runtime consumes paladin.variant entirely — daemons, services, runtime config, clients
- **Typology**: Die extends Wafer. `shape.http(vector)` compiles routes to native HTTP handler. `shard.cors.wrap()` for CORS. Subscriber maps ORM events. Vector/Aperture for routing. Entities managed via MikroORM. Status, Connection, Url, Path used throughout. All formerly `@vivalence/vector` imports are now `@vivalence/typology`.
- **Registry**: Modes loaded via paladin.vip from registry/modes. Services loaded from registry/services. Kernels from registry/kernels.

## Work Packages

### Testing Gaps
- No tests for DATASET trait (symbol/literal upsert, batch chunking)
- No tests for view-bundler.js (Svelte compilation)
- No tests for Process system (process slurp now works — was silently broken via descendants.push no-op)
- No tests for disintegrate cascade (shutdown sequence)
- No tests for view/freight remainder `(.*)` serving (tested in http shape, not runtime scenario)
- No tests for watchdog patrol
- ~~No smoke tests against a live running server~~ — integration.test.js (39 steps via HTTP fetcher against live runtime)

### Human Documentation Needs (Divio)
- **Tutorial**: "Boot the runtime locally" — env setup, circuitry, run.js
- **Reference**: Aperture endpoint catalog, daemon manifest format, mode trait contracts
- **Explanation**: "Why Die/Wafer? Why recursive lifecycle?" — the composition rationale
- **How-to**: "Add a new mode trait" — trait function signature, registration in traitmap

### Active Work
- Asset entity type (VERBALIZED trait, attachment serving)
- Session-first patterning (client + runtime sync)
- Hallucinator cortex — [cortex.workpackage.org](../../.ikiro/cortex.workpackage.org) — affects daemon lifecycle: new `population.cortex()` step collects faculties from hallucinator services, constructs Cortex. New traits LANGUAGED (conversation harness) and AGENTIC (action harness) construct harness Vectors during resolution. Harness-as-Vector pattern: harnesses are Vector instances compiled via shape.object/http/proxy/agentic. Integration with daemon aperture via `mode.aperture.branch('/hallucinate').slurp(harness)`.

### Completed
- **Oak → Vector/http migration** — Oak removed. Runtime serves via `shape.http()` + `Deno.serve`. CORS via `shard.cors.wrap()`. Daemon internal connection via `shard.transport.inline()`. Old aperture code in bak.
- **Vector → typology merge** — All `@vivalence/vector` imports rewritten to `@vivalence/typology`. Vector, Aperture, steer, shape, shards all live in typology now.
- **descendants.push fix** — process mounting was silently broken (`.descendants` getter returns new array, `.push()` was a no-op). Fixed to `.slurp()`.
- **Scenario test infrastructure** — self-contained tests with slim domain, :memory: ORM, no paladin dependency.
- **Buffer/Intent migration** — PRODUCER→EMITTER, VALENTIC→INTENTED, BUFFERED→SELFEVIDENT, entity.data→entity.trait. Old traits in bak.
- **Datamap migration (Phase A)** — replaced parametric `/:entity/:method` handlers with per-entity `shard.datamap.repository()` + `shard.datamap.reactive()` branches. Fixed session create bug (server read `input.where`, client sent `{data}`). Renamed `entities.on` → `entities.twitch`. Rewrote `population.twitch()` from 30 broken lines to 2. Tests split by scope: daemon/ (22 steps), mode/ (14 steps), runtime/ (6 steps).
- **Datamap ownership refactor** — MikroORM consolidated into datamap service provider. Provider returns opaque interface: `{ entities, context, bind, introspect, subscribe, disintegrate }`. `shard.datamap.inject(datamap)` wraps requests in RequestContext + sets ctx.entities. No `@mikro-orm/*` imports outside typology/entities, domain entities, the service, and test harnesses. `daemonDie.datamap` holds the provider return (die-level). `good.entities` is the userspace projection (repos + em trampoline). Startup code wrapped in `datamap.context()`. User filter via `datamap.bind("user", ...)` after authorize. Lighthouse uses same interface. `entities.twitch` → `good.twitch` (Runtime prototype). `maps` removed from entities/index.ts — direct named exports + flat `sets`.
- **Emitter pattern** — mode.emit via `shape.object(emitterVector)`. INTENTED + EMITTER traits replace VALENTIC + PRODUCER.
- **Ambient context propagation** — `shard.ambient.store` on daemon aperture (after authorize) puts `{ user, entities }` into AsyncLocalStorage scope. `shard.ambient.assign` on EMITTER vector inherits them into shape.object contexts. Fixes ctx.user being undefined when tactic emitters (warmup, buildup, etc.) call game emitters (judge, listen, etc.) via mode.emit — shape.object creates bare `{ input }` contexts that previously had no user/entities.
- **shards → shard rename** — all `shards` imports across runtime, typology, lighthouse, html client, domain kernel renamed to `shard` (singular).
- **shard.serve namespace** — `shard.serve.file()` (was bare `serve()`), `shard.serve.websocket()` (was bare `websocket()`). Old `shard/websocket.js` deleted, merged into `shard/serve.js`.
- **Domain Symbol repository fix** — MikroORM EntitySchema `extends` does not inherit the `repository` field. Domain's SymbolSchema now explicitly declares `repository: () => base.repository` + `[EntityRepositoryType]` on entity class. Fixes `symbolRepo.findByIdentifiers is not a function` in LiteralRepository.findBySymbols.
- **Entity flow (no POJO serialization)** — EMITTER post-processor returns entities, not POJOs. `toJSON()` handles serialization at the HTTP boundary. Fixes double-serialization bug where tactic emitters calling sub-emitters via shape.object received already-serialized POJOs, then the tactic's own post-processor tried to re-serialize (calling `getItems()` on plain arrays → `[]`).
- **Listen emitter VOCALIZED guard** — listen.viva.js emitter checks `traits.includes("VOCALIZED")`, returns `[]` for non-vocalized literals. Tactic emitters fixed from `w.trait?.VOCALIZED` (falsy for null values) to `w.traits?.includes("VOCALIZED")`.
- **Domain repo `where` param** — LiteralRepository feed/novel/due/byStrength accept optional `where` object, spread into the query before `findBySymbols`. Domain aperture pick routes pass `where` through. Non-breaking.
- **Integration test** — `tests/daemon/integration.test.js` (39 steps). Connects to live runtime via HTTP fetcher transport. Covers: auth login, domain pick (feed/novel/due/byStrength/symbol-filtered), all 9 game mode emitters, all 5 survival tactic phases, domain review (create/evolve/failure/slug), session lifecycle.
- **Selfevident → Applicative migration** — All 9 game modes: removed SELFEVIDENT trait, added `/feed` emitter route + `feed` APPLICATIVE intent with FEEDING trait. Feed routes self-source literals via `literal.feed()` with optional seek/blacklist/where. Mode-specific logic: listen over-fetches ×3 and filters VOCALIZED, cloze over-fetches ×3 and filters ANNOTATED, judge builds items with coin flip distractor, pick/match/exhibit/flashcard/shadow/write fetch appropriate batch sizes. INTENTED trait fix: `intentPojo.mode` now receives scalar PK (not POJO) to avoid MikroORM ghost entity creation on first insert.

### Planned Changes
- Old aperture shape cleanup (shape/aperture/, mw.js, parser.js in bak)
- LANGUAGED/AGENTIC trait implementations (per cortex workpackage)
- CHAOSMONKEY trait update (currently just attaches hallucinator brain; will be updated to compose cortex during population)

## Maintenance

When modifying runtime code:
1. Run tests: `deno task test` (all), or `deno task test/daemon`, `deno task test/mode`, `deno task test/runtime` by scope
2. Lifecycle changes must preserve cascade order (parent before children in populate, children before parent in disintegrate)
3. New traits go in daemon/mode/traits/ and get registered in traitmap.js
4. New endpoints: follow the pattern in daemon/aperture/ — `.open()` or `.branch()` on daemon's Vector, effect arity (0/1/2 params)
5. HTTP handler is compiled from Vector in `resolve.compose()` — route changes take effect at compile time, not dynamically
6. Daemon internal connection uses the same compiled handler — `shape.http()` + `shard.transport.inline()`
