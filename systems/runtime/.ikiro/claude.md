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
| mod.js | 5 | Exports: Runtime, Die, lifecycle, daemon, process namespaces |
| run.js | 75 | Boot entry. Awaits paladin, creates Runtime Die, runs lifecycle, perpetuates |
| deno.jsonc | 25 | Exports: `.`, `./run`, `./daemon`, `./daemon/aperture`, `./daemon/traits`, `./daemon/traits/*`, `./process`, `./scenarios`. Tasks: test/daemon, test/mode, test/runtime |

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
- `call(die)` — compiles aperture via `shape.http()`, wraps in `shard.transmitter.inline()`, creates internal Connection (enables `daemon.call(path, body)` without HTTP)
- `uninstall(die)` — removes DB records for modes no longer loaded

## Mode Trait System

`daemon/traits/index.js` + `daemon/traits/*.js` (5 trait files)

Traits are async functions `(mode, daemon)` applied during daemon resolution. Each trait can modify the mode's aperture, attach middleware, or perform setup.

**VIEWABLE** `index.js` — compiles Svelte views via esbuild, exposes `/view` endpoint with bundle URL.

**DATASET** `dataset.js` (76 lines) — upserts symbols and literals from `mode.cake.dataset.entities`. Batches in chunks of 100. Links symbols ↔ literals bidirectionally.

**INTENTED** `intented.js` — iterates `mode.cake.dataset.intent[]`, upserts IntentEntity rows via `daemon.entities.intent.ensure()`. Sets `intentPojo.mode = mode.entity.id` (scalar PK, not POJO — POJO form `{ id: ... }` triggers MikroORM ghost entity creation). Seeds the intent graph at daemon startup. All 9 game modes now have FEEDING intents registered here.

**EMITTER** `emitter.js` — activates if `mode.cake.emitter` is set (a Vector). First middleware: `shard.ambient.assign` inherits `user` and `entities` from the ambient scope (set by `shard.ambient.store` in resolution.kernel) — this is how shape.object emitter contexts get ctx.user without going through the HTTP authorize chain. Then: daemon/mode context middleware, thread lookup, seek/blacklist conversion, Yield post-processor. Post-processor creates `ctx.yield = accumulator()`, resolves with `raw?.condition ? raw : ctx.yield.resolve(raw)`. Only attaches thread + increments counter on NOMINAL results. Emitters can: return bare arrays/entities (normalized to Yield), use ctx.yield.buffer()/exhaust()/error() incrementally, or return explicit Yield objects. `mode.emit` unwraps NOMINAL Yields to bare buffer arrays for internal callers (tactic emitters composing sub-mode emitters). HTTP routes via `mode.aperture.branch("/emit").slurp()` return full Yield envelope `{ condition, buffers }`. `toJSON()` handles serialization at the HTTP boundary.

**CHAOSMONKEY** `index.js` — attaches hallucinator brain to mode. (Will be updated by cortex workpackage to compose the cortex during daemon population from hallucinator faculties and construct harnesses per mode.)

**FRAUGHT** `index.js` — indexes freight catalog (mode.cake.freight), exposes `/freight` endpoint with catalog.

### Kernel Modes

`daemon/kernel.js` (21 lines) — defines Domain, Ontology, Topology classes extending Mode. These are the kernel "modes" (domain logic, data schemas, datasets).

### View Bundler

`daemon/traits/buffered.js` includes view bundler — esbuild + Svelte plugin. Compiles `.svelte` files with import map resolution for @vivalence/* packages. Returns in-memory bundle (write: false).

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

Self-contained scenario tests organized by scope. Exported via `@vivalence/runtime/scenarios`.

```
tests/
├── scenarios/                    Shared fixtures (exported via deno.jsonc)
│   ├── index.js                  Re-exports daemon, lighthouse, mountMode, mountModes, bench
│   ├── entities.ts               Domain schemas (LiteralDomain+TRANSLATED) + seed() + TestLiteralRepository
│   ├── daemon.js                 create() → { conn, authedConn, orm, em, fixtures, mode, scoped }
│   ├── mode.js                   mountMode(viva), mountModes(vivas) — lightweight mode testing
│   ├── bench.js                  bench({ kernel, modes }) — full daemon from registry modules
│   └── lighthouse.js             create() → { conn, orm, em, repos, fixtures }
├── bench/                        Bench-scope tests
│   └── smoke.test.js             Raw imports + paladin specifiers, domain repos, routes (7 steps)
├── daemon/                       Daemon-scope tests
│   ├── datamap.test.js           Daemon-unique route tests: schema, hydration, modes, traits (6 steps)
│   ├── userspace.test.js         Auth gating, handshake, thread lifecycle (3 steps)
│   ├── smoke.test.js             Emit + persist + query lifecycle (6 steps)
│   ├── batch.test.js             Batch shard operations (25 steps)
│   └── integration.test.js       Live runtime via HTTP: auth, all 9 game emitters, 5 tactic phases, pick routes, review, thread (41 steps)
├── mode/                         Mode-scope tests
│   ├── traits.test.js            INTENTED upsert/resolve, BUFFERED, EXPOSED, EMITTER compile/normalize/HTTP/EXHAUSTED (19 steps)
│   └── emitters.test.js          Parameterized across 7 game modes: wiring, per-route emit, intent seeding (28 steps)
└── runtime/                      Runtime-scope tests
    └── composition.test.js       Daemon mounted under runtime aperture (6 steps)
```

`deno task test` runs all. `deno task test/bench` for bench tests, `deno task test/mode` for mode tests.

### Scenario Tiers

Three tiers of test scenario, each building on the last:

**mountMode(viva)** — `scenarios/mode.js`. Lightest. Wires a single `.viva.js` into a minimal daemon with test-only BUFFERED (no esbuild), stub `.feed()` via TestLiteralRepository, and real INTENTED + EMITTER traits. For testing individual mode emitter behavior without domain/ontology complexity. Returns `{ mode, daemon, orm, em, fixtures, scoped }`.

**mountModes(vivas[])** — same file. Mounts N modes into one shared daemon. For cross-mode composition testing (tactics calling `ctx.daemon.modes.game.exhibit.emit.present()`). Same ORM, same entity manager.

**bench({ kernel, modes, services })** — `scenarios/bench.js`. Full daemon factory. Accepts raw imported modules OR paladin specifier strings (mixed). Boots from real lifecycle functions: `population.modes`, `resolution.modes`, all aperture setup. In-memory sqlite via `provider()` from `@vivalence/typology/scenarios`. Domain kernel entities get real repositories (`.feed()`, `.novel()`, `.due()`). Ontology/topology data seeded via DATASET trait. BUFFERED stubbed (noop bundler). Returns `{ daemon, die, orm, em, connection, user, teardown() }`.

```js
// paladin specifiers — resolve via registry
const scenario = await bench({
  kernel: ["@vivalence/domain/language-learning", "@vivalence/ontology/word"],
  modes:  ["@vivalence/game/flashcard", "@vivalence/game/judge"],
});

// raw imports — no paladin needed
import * as flashcard from "registry/modes/.../flashcard.viva.js";
const scenario = await bench({ modes: [flashcard] });

// with services — lighthouse, hallucinator, external consume services
const scenario = await bench({
  kernel: ["@vivalence/domain/language-learning"],
  modes:  ["@vivalence/game/flashcard"],
  services: {
    lighthouse: myLighthouseProvider,
    hallucinator: { object: async () => ({}), action: async () => ({}) },
    consume: { nlp: { analyze: async (text) => ({ tokens: [] }) } },
  },
});
```

**Service wiring:**

| Service | Bench key | Sets on daemon | Effect |
|---|---|---|---|
| **lighthouse** | `services.lighthouse` | `daemon.lighthouse` | Wires `shard.secure.authority()` middleware, enables `aperture.userspace` routes |
| **hallucinator** | `services.hallucinator` | `daemon.hallucinator` | Available to CHAOSMONKEY trait (`mode.brain`) |
| **consume** | `services.consume.{slug}` | `daemon.services[slug]` | Available to modes via `ctx.daemon.services[slug]` |

When no lighthouse is provided, bench installs a permissive default auth that accepts any token and returns the bench's test user. When lighthouse IS provided, real `shard.secure.authority()` + `shard.secure.authorize()` middleware runs, and the userspace aperture routes are mounted.

### What bench reuses from runtime

| Lifecycle function | Used | Notes |
|---|---|---|
| `population.core` | NO | Does paladin.vip.accioMap — bench resolves manually |
| `population.wiring` | NO | Copies statics/docs from mask |
| `population.datamap` | NO | Bench uses in-memory provider from typology/scenarios |
| `population.authority` | NO | No lighthouse in bench |
| `population.acid` | OPTIONAL | Hallucinator wired when `services.hallucinator` provided |
| `population.services` | OPTIONAL | Consume services wired when `services.consume` provided |
| `population.modes` | YES | Real mode construction — prototypes, mount paths, entity ensure |
| `population.handlers` | YES | flatmodes() helper |
| `resolution.kernel` | NO | Domain aperture wired manually (no auth chain) |
| `resolution.modes` | YES | Real trait application + mode aperture mounting |
| `resolution.freight` | NO | Freight not indexed in bench |
| `aperture.datamap` | YES | Real entity CRUD routes |
| `aperture.userspace` | OPTIONAL | Mounted when `services.lighthouse` provided (needs auth chain) |
| `aperture.modes` | YES | Mode manifest/status routes |
| `aperture.freight` | YES | Cargo endpoint |
| All traits | YES | Real INTENTED, EMITTER, DATASET, EXPOSED, etc. |
| BUFFERED trait | STUBBED | BENCH_BUFFERED: noop bundler, same mode.buffer() factory |

### What bench stubs (unless overridden via services)

- **BUFFERED**: noop bundler (`() => ({ code: "", url: "" })`), same `mode.buffer()` entity factory
- **Datamap**: in-memory sqlite via `provider()` from `@vivalence/typology/scenarios`
- **Auth**: permissive default (any token → test user). Override with `services.lighthouse` for real auth chain
- **Hallucinator**: not wired unless `services.hallucinator` provided. CHAOSMONKEY trait no-ops gracefully
- **Consume services**: not wired unless `services.consume` provided
- **Raw module mount paths**: synthetic `Path("/bench/{type}/{slug}")` for modes imported without paladin (buffer path resolution is cosmetic in bench)

### Emitters test (emitters.test.js)

Parameterized across 7 game modes (flashcard, exhibit, shadow, write, match, judge, pick). Uses `mountMode()` — lightweight, no paladin. Each mode gets:
- Wiring assertion: `mode.emit` exists with routes
- Per-route emit test: calls each emitter route with representative input
- Intent seeding test: verifies INTENTED trait created intent entities

Input map at top of file defines representative inputs per mode per route. Uses `scoped()` wrapper for RequestContext. TestLiteralRepository provides stub `.feed()` matching domain's `(where, opts?)` signature.

Scenarios are composable — the lighthouse scenario is also imported by `registry/services/@vivalence/lighthouse/multiplayer/tests/datamap.test.js` (11 steps) via `@vivalence/runtime/scenarios`.

## Where Used

- **Paladin**: Runtime consumes paladin.variant entirely — daemons, services, runtime config, clients
- **Typology**: Die extends Wafer. `shape.http(vector)` compiles routes to native HTTP handler. `shard.cors.wrap()` for CORS. Subscriber maps ORM events. Vector/Aperture for routing. Entities managed via MikroORM. Status, Connection, Url, Path used throughout. All formerly `@vivalence/vector` imports are now `@vivalence/typology`.
- **Registry**: Modes loaded via paladin.vip from registry/modes. Services loaded from registry/services. Kernels from registry/kernels.

## Work Packages

### Testing Gaps
- DATASET trait, process system, disintegrate cascade, watchdog patrol untested
- View/freight remainder serving untested at runtime level (covered by typology http shape tests)

### Active Work
- Hallucinator cortex — see [cortex.workpackage.org](../../.ikiro/cortex.workpackage.org)
- LANGUAGED/AGENTIC trait implementations (post-cortex)
- Asset entity type (VERBALIZED trait)

## Maintenance

When modifying runtime code:
1. Run tests: `deno task test` (all), or `deno task test/daemon`, `deno task test/mode`, `deno task test/runtime` by scope
2. Lifecycle changes must preserve cascade order (parent before children in populate, children before parent in disintegrate)
3. New traits go in daemon/traits/ and get re-exported from daemon/traits/index.js
4. New endpoints: follow the pattern in daemon/aperture/ — `.open()` or `.branch()` on daemon's Vector, effect arity (0/1/2 params)
5. HTTP handler is compiled from Vector in `resolve.compose()` — route changes take effect at compile time, not dynamically
6. Daemon internal connection uses the same compiled handler — `shape.http()` + `shard.transmitter.inline()`
