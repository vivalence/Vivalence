# Runtime

> Runs and facilitates. Creates daemons, applies traits, manages lifecycles, serves HTTP.

## Role

Process. The procedural orchestration layer. Runtime wraps everything in Die/Wafer lifecycle containers, boots daemons from paladin's compiled variant, applies mode traits, composes HTTP apertures, and serves it all via Oak. The recursive lifecycle cascade — parent populate/resolve/integrate flowing to children — is the core pattern.

## Entry Points

| File | Lines | Purpose |
|------|-------|---------|
| mod.js | 20 | Exports: Runtime, Die, lifecycle, daemon, process namespaces |
| run.js | 75 | Boot entry. Awaits paladin, creates Runtime Die, runs lifecycle, perpetuates |
| deno.jsonc | 27 | Exports: `.`, `./run`, `./daemon`, `./process`. Tasks for test suites per subsystem |

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
      ├─ compose()                  Assemble Oak middleware
      ├─ launch()                   Start HTTP server
      └─ wake()                     Activate watchdog
5. await die.integrate()            Announce to lighthouse
6. await die.perpetuate()           Keep-alive loop (10s patrol, signal handlers)
```

Shutdown mirrors this in reverse via `die.disintegrate()` — cascades to all terrans, closes ORM, aborts signals.

## Core Classes

### Runtime

`runtime.js` (20 lines)

Container holding the running system:
- `server: Application` — Oak HTTP server
- `aperture: Aperture` — root HTTP routing tree
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
- `compose(die)` — CORS, 404, body parser, error handling, aperture composition into Oak
- `launch(die)` — starts Oak server on configured host:port
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
- `aperture: Aperture` — HTTP routing for this daemon
- `connection, call` — internal RPC
- `authority, brain, entity` — service handles
- `kernel: { orm, em }` — database
- `entities: {}` — repository map
- `twitch: Vector` — event system
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
- `datamap(die)` — initializes MikroORM, creates entity repositories
- `authority(die)` — sets up lighthouse auth middleware on aperture
- `acid(die)` — initializes hallucinator (AI service)
- `modes(die)` — instantiates Mode objects from registered modules, assigns mounts/URLs, creates mode entities in DB, links VIEWABLE modes to view bundler
- `twitch(die)` — sets up Subscriber (ORM events → Signals via Vector)
- `handlers(die)` — adds `flatmodes()` helper
- `services(die)` — loads external services via consume config

**resolve()** — `daemon/lifecycle/resolution.*`:
- `kernel(die)` — attaches domain aperture with daemon context and auth
- `modes(die)` — for each mode: attaches context middleware, opens status/manifest endpoints, slurps mode aperture, **applies trait functions**, marks entity installed, attaches to daemon aperture with auth

**integrate()** — `daemon/lifecycle/integration.*`:
- `call(die)` — creates internal Connection with composed aperture as transport (enables `daemon.call(path, body)` without HTTP)
- `uninstall(die)` — removes DB records for modes no longer loaded

## Mode Trait System

`daemon/mode/traitmap.js` (58 lines) + `daemon/mode/traits/` (3 files)

Traits are async functions `(mode, daemon)` applied during daemon resolution. Each trait can modify the mode's aperture, attach middleware, or perform setup.

**VIEWABLE** `traitmap.js` — compiles Svelte views via esbuild, exposes `/view` endpoint with bundle URL.

**DATASET** `traits/dataset.js` (76 lines) — upserts symbols and literals from `mode.cake.dataset.entities`. Batches in chunks of 100. Links symbols ↔ literals bidirectionally.

**PRODUCER** `traits/producer.js` (154 lines) — the production pipeline. Middleware chain:
1. Normalize request scope (set user)
2. Load valence, session, intent
3. Cast to ProductionRequest
4. Flush ACTIVE products to STALE
5. Greed: serve from PENDING queue first
6. Lock: prevent concurrent production (Map-based per session/valence/commissioner)
7. Blacklist: filter known bad products
8. Production: call mode.cake.production to create new products

**VALENTIC** `traits/valentic.js` (38 lines) — per-valence routing. For each valence, creates a branch under `/valence/{slug}` that sets scope and delegates to the PRODUCTIVE mount.

**CHAOSMONKEY** `traitmap.js` — attaches hallucinator brain to mode.

### Kernel Modes

`daemon/mode/kernel.js` (21 lines) — defines Domain, Ontology, Topology classes extending Mode. These are the kernel "modes" (domain logic, data schemas, datasets).

### View Bundler

`daemon/mode/view-bundler.js` (154 lines) — esbuild + Svelte plugin. Compiles `.svelte` files with import map resolution for @vivalence/* packages. Returns in-memory bundle (write: false).

## HTTP Aperture

### Daemon Aperture Endpoints

`daemon/aperture/` (3 files, 73 lines total):

**datamap.js** — `GET /entities/:entity/:method` → direct ORM access (find, findOne, create)

**userspace.js** — `/userspace/` prefix:
- `GET /status` — daemon status
- `GET /handshake` (auth) — `{success, user}`
- `GET /entities/:entity/:method` — user-scoped CRUD (intent, session only), auto-filters by user.id

**modes.js** — `GET /modes/:type/:method` — mode lookup by type and slug

### Runtime Aperture Composition

During `resolve.compose()`, the full middleware stack is assembled:
1. CORS middleware (localhost, *.vivalence.com)
2. 404 handler
3. Body parser (ctx.input from request body)
4. Error handler (500 on exception)
5. Aperture tree composed into Oak router

Each daemon gets mounted at `/daemon/{slug}/` with its own aperture subtree.

## Process System

`process/` (22 lines total) — lightweight. Process wraps a mask, ProcessDie extends Wafer with minimal lifecycle (just sets status to alive). Processes are ATTACHED services that provide their own aperture — mounted at `/attached/process/{type}/{slug}`.

## Tests

| File | Lines | Pattern | Coverage |
|------|-------|---------|----------|
| runtime/lifecycle.test.js | 47 | Lifecycle | Full boot/shutdown cycle, status transitions |
| runtime/aperture.test.js | 42 | HTTP | GET /status, GET /manifest, daemon status/manifest via HTTP |
| daemon/lifecycle.test.js | 41 | Lifecycle | Daemon creation from mask, full lifecycle cycle |
| daemon/aperture.test.js | 44 | HTTP | Authenticated endpoints, daemon aperture via HTTP |
| daemon/modes.test.js | 60 | HTTP | Mode manifest/status access, VIEWABLE view URL check |

Total: ~234 lines. Tests require paladin.ikiro and real ORM initialization.

## Where Used

- **Paladin**: Runtime consumes paladin.variant entirely — daemons, services, runtime config, clients
- **Vector**: Aperture compiles to Oak. Subscriber maps ORM events. twitch Vector for events.
- **Typology**: Die extends Wafer. Entities managed via MikroORM. Status, Connection, Url, Path used throughout.
- **Registry**: Modes loaded via paladin.vip from registry/modes. Services loaded from registry/services. Kernels from registry/kernels.

## Work Packages

### Testing Gaps
- No tests for PRODUCER trait pipeline (greed, lock, blacklist, production chain)
- No tests for DATASET trait (symbol/literal upsert, batch chunking)
- No tests for VALENTIC trait (per-valence routing)
- No tests for view-bundler.js (Svelte compilation)
- No tests for Process system
- No tests for daemon internal connection (call via composed aperture)
- No tests for disintegrate cascade (shutdown sequence)
- aperture tests depend on running server — no unit-level aperture tests
- No tests for watchdog patrol

### Human Documentation Needs (Divio)
- **Tutorial**: "Boot the runtime locally" — env setup, circuitry, run.js
- **Reference**: Aperture endpoint catalog, daemon manifest format, mode trait contracts
- **Explanation**: "Why Die/Wafer? Why recursive lifecycle?" — the composition rationale
- **How-to**: "Add a new mode trait" — trait function signature, registration in traitmap

### Active Work
- Aperture migration to Vector (compile to Oak instead of direct Oak routing)
- mode.produce.[xyz]() pattern (Vector object/proxy compiler)
- Asset entity type (VERBALIZED trait, attachment serving)
- Session-first patterning (client + runtime sync)

### Planned Changes
- Production pipeline rewrite (producer trait in flux)
- Vector→typology merge affects twitch and Subscriber usage
- Aperture becomes a compiler target

## Maintenance

When modifying runtime code:
1. Run tests: `deno task test` in systems/runtime
2. Lifecycle changes must preserve cascade order (parent before children in populate, children before parent in disintegrate)
3. New traits go in daemon/mode/traits/ and get registered in traitmap.js
4. Aperture changes: verify both internal (compose) and HTTP (serve) paths
5. New endpoints: follow the pattern in daemon/aperture/ — context attachment, auth middleware, handler arity
