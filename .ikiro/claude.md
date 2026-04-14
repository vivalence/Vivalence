# @vivalence/viva

You are reading the root orientation document for the @vivalence/viva project. This is your first foothold. Use it well.

## Before You Do Anything

Stop. Read this document fully before writing a single line of code or making a single suggestion. The system you're working in is deeply intentional — names are chosen with care, abstractions earn their place, and every line of code is carrying weight. If you charge in without understanding, you will propose things that were already tried and abandoned, suggest complexity that was deliberately cut, or misname things that have precise vocabulary.

The subsystem docs listed below are your next reads. But this document tells you how to think about the system, how to maintain these docs, and how to be genuinely useful here.

## What Is Vivalence

An operating system with a language learning system as its first application. Not an app — an OS. Types compose into routing, routing composes into daemons, daemons compose into a runtime. Game modes are plugins. Memory is Bayesian. The whole thing runs on Deno with MikroORM, Svelte, and Anthropic's Claude.

The power is emergent. Signature (211 lines) enables an entire routing ontology. Vector (107 lines) enables hierarchical routing with middleware accumulation. traverse (47 lines) walks two trees in parallel. compose (27 lines) enables arbitrary middleware stacking. rollup (18 lines) + shape.mcp (53 lines) = a fully compliant MCP tool server with typed schemas, validation, and middleware — 86 lines total, zero dependencies outside typology. These are not large systems — they are small, sharp tools that compose into large capability.

If you find yourself thinking "this could use a framework for X" — stop. The framework IS the types. Read them again.

## System Map

| Package | Role | Location | Doc |
|---------|------|----------|-----|
| **Typology** | Library + Engine | subsystems/typology/ | [claude.md](../subsystems/typology/.ikiro/claude.md) |
| **Paladin** | Composition | subsystems/paladin/ | [claude.md](../subsystems/paladin/.ikiro/claude.md) |
| **Runtime** | Process | systems/runtime/ | [claude.md](../systems/runtime/.ikiro/claude.md) |
| **Registry** | Marketplace | registry/ | [claude.md](../registry/.ikiro/claude.md) |
| **Services** | Infrastructure | registry/services/@vivalence/ | [claude.md](../registry/services/@vivalence/.ikiro/claude.md) |
| **Kernels** | Domain + Data | registry/kernels/@vivalence/ | [claude.md](../registry/kernels/@vivalence/.ikiro/claude.md) |
| **Modes** | Feature | registry/modes/@vivalence/ | [claude.md](../registry/modes/@vivalence/.ikiro/claude.md) |
| **HTML Client** | Surface | systems/html/ | [claude.md](../systems/html/.ikiro/claude.md) |

**How they connect:**
1. Typology defines the types AND makes them executable (prototypes + Vector routing trie + steer + shape + shards)
2. Paladin reads circuitry and resolves the registry into a compiled variant
3. Runtime boots daemons from the variant, applies mode traits, serves HTTP via `shape.http()` + `Deno.serve`
4. Registry holds everything domain-specific: kernels, modes, services, circuits
5. Client connects to the daemon and renders mode views

## Canonical Vocabulary

Use these terms precisely. Don't substitute generic alternatives.

**Lifecycle**: construct → populate → resolve → integrate (→ disintegrate)

**Typology**: gestalt, prototypes, entities, schematics, specimen, v

**Gestalten**: is (predicates — scalars + primitives: `is.labeled(thing)` checks `{ name: string }`), cast (coercion), not (negation), fromm (conversion), belt (utilities), shard (network), steer (routing), shape (compilation)

**Signature hierarchy**: Signature → Pattern, Signal, Path, Url, Action. Url accepts full URLs (`is.url` — strings with `://` or objects with `.origin`), Signals (`is.Signal` — instanceof), or bare paths (strings without `://` — normalized, no origin). Signal→Url conversion via `u.pathname`.

**System**: vector, aperture, paladin, daemon, mode, intent, buffer, wafer, die, process, cast, terminal, stall, lobby, door

**Client shell**: terminal (primary client entity — like iTerm processes, emacs buffers. Everything is a terminal. Has command vector, phases, history), client (root singleton: lighthouses Map, terminals Map, active terminal), repl (terminal phase — command line. Read: input. Eval: Signal + steer.invoke on command vector. Print: string or {component, props} via `<svelte:component>`. Loop.), stall (internal buffer queue on terminal for STREAM phase, not a UI primitive), mint (populate's buffer factory — resolves view from mode.buffered, sets context `{buffer, terminal}`, wires release, registers in daemon buffer repo), modeline (status bar — shows active terminal, tab switching), command vector (Vector on terminal — assembled from base commands + client commands + daemon commands + mode commands. Same pattern as daemon aperture growing from traits), inspector (debug panel — context inspectors live in panel H, toggled by L/Q/B/T dev buttons in the H bar via `view.$inspect{Lighthouse,Quarters,Bridge,Thread}`. Four bespoke overlays in `panels/inspectors/` — each pulls its context, renders handpicked atom fields with live subscriptions. Bridge inspector has write controls: pincer nudge, orientation cycle, standard capture. Quarters inspector has entity actions: activate, close, spawn. Layout: 4 columns at `calc(25vw - 12px)` capped 320px, collapse full-width below 600px. `window.__viv` in +layout.svelte exposes all four contexts for console debugging), keymap (Vector per input mode — mode keymap for buffer interaction, space keymap for OS control), keymap shard (Vector factory for reusable key bindings — shards.audio, shards.rating, shards.navigation), stage (rendering engine shim in drapes — sole consumer of echarts/three.js, re-exports as `stage.*`. `stage.chart(container)` → echarts instance, `stage.scene(container)` → Three.js scene kit. `stage.echarts`/`stage.THREE` escape hatches. Canvas component = managed container with init callback)

**Client contexts** (ship metaphor): LIGHTHOUSE (auth, identity, daemons — the navigation tower), QUARTERS (terminal LocalRepository, $active — the workspace), BRIDGE (layout store, view store — persists `d` panel toggle to localStorage, geometry engine — the helm), DECORUM (theming mothership — holds `$theme` atom, drives `data-theme` on `<html>`). Navigational: THREAD (single navigational context — the active thread. Daemon and mode are accessors on thread, not separate contexts). Zone: ZONE (many per tree — `<Zone zone={N}>` applies `.zone-N` class, CSS cascade resolves `--zone-*` variables). Structural set unconditionally at init in root `+layout.svelte`, THREAD set reactively when terminal activates a thread. Context classes in `typology/prototypes/` (Quarters, Bridge, ThreadContext). Imports through `@vivalence/html` barrel. Instantiated as `new namespace.Class()` (e.g. `new quarters.Quarters()`).

**Client lifecycle** (EntitySchema + selbstbestimmte vectors): Entity classes + dossiers live in `typology/entities/`. Each dossier declares `kind`, `remote.endpoint`, `use` (middleware array), optional `cast`. Six entity dossiers: ModeDossier, IntentDossier, ThreadDossier, BufferDossier, TurnDossier, LiteralDossier (Trace removed 2026-04-14). Dataspace compiles each dossier into a lifecycle vector via `shape.selbstbestimmt(vector, factory)`. Factory (strategy) builds execution context (`ctx.daemon`, `ctx.mount`, `ctx.link`, `ctx.connection`). `defaultCast` calls `ctx.em.cast()` — schema-driven relation resolution + reactive collection creation. `repo.hydrate` is the compiled lifecycle — called on every entity ingress. Dataspace exposes `em` (RemoteEntityManager). `EM.persist(entity)` marks dirty + refreshes reactive store. Daemon and Lighthouse lifecycles are also selbstbestimmte vectors inlined in their prototype files. `daemon.boot({ connection, lighthouse })` returns wired Daemon. Lighthouse exports `boot(instance)`, `populate(instance)`, `create(connection)`. No separate `lifecycles/` or `stores/` directories — everything in `prototypes/` and `entities/`.

**Cortex**: cortex, faculty, channel, harness, turn, part, tune, tier, dialogue, render, whole, stream, soma (stream gestalt: pour/drain/attend/bridge), hallucinate (conditioned environment), spawn (cortex→hallucinate factory)

**Context**: Execution envelope. `ctx.input` → `request.body`, `ctx.output` → `response.body`. Created by shape.http and steer direct/guarded strategies. Process strategy uses plain die object instead.

**Die namespace** (process wafers): `die.good` (product), `die.variant` (cast-time config), `die.control` (host lifecycle: abort, release, ready), `die.output` (effect return, set by strategy).

**Transport**: publish (SSE framing), subscribe (SSE consumption), websocket (bidirectional), stream (raw ReadableStream)

**Ambient**: `shard.ambient.store/combine/assign/current` — AsyncLocalStorage scope. Daemon uses store after authorize for `{ user, entities }`, EMITTER uses assign to inherit.

**Serve**: `shard.serve.file(root)` static files, `shard.serve.websocket(handler)` upgrade. Effect combinators.

**Datamap**: `inject` (RequestContext), `repository` (CRUD Aperture), `reactive` (Broadcaster + SSE), `ingest` (incoming SSE → repo), `scope` (query patch), `errors` (exception → HTTP status), `wire` (cross-repo relations), `strip` (MikroORM metadata → client schema: `kind`, `target`, `mappedBy`, `owner`, `nullable` per relation property). RemoteRepository mirrors server CRUD over Connection with persist/cast/merge/store. `persist()` hydrates from localStorage through `merge()` (guaranteeing prototypes), `store()` writes to localStorage on every `put()`/`drop()` — no third-party persistence layer. Datamap provider returns `{ entities, shard: { context, bind }, introspect, subscribe, disintegrate }`. CRUD convention: `find`/`update`/`remove` = many, `findOne`/`updateOne`/`removeOne` = single. **Relation resolution**: `EM.resolve(name, reference)` normalizes any shape (string ID, `{id}` stub, full object) to the canonical identity-map entity. `EM.cast()` uses `resolve()` per relation field from the schema. For 1:m fields with `mappedBy`, `cast()` auto-creates `entity.$field = computed(childRepo.$entities, ...)` — reactive collections derived from the child repo's store via nanostores `computed`. **Transparent accessors**: `cast()` also defines a vanilla getter on the field name (`mode.intents` reads from `mode.$intents.get()`) + no-op setter (prevents merge conflicts). Consumers never need to know about the reactive layer. No manual inverse maintenance.

**Batch**: `shard.batch.route(aperture)` server multiplexer, `shard.connection.batch({hatch, filter?})` client DataLoader via queueMicrotask. `hatch` is the base Url. `filter(ctx) → bool` skips batching when false (e.g., SSE requests bypass batch).

**Steer** (4 modules): match (greedy/scope/resolve), navigate (traverse/walk), strategy (direct/bare/request/guarded/process), apply (invoke/shotgun/rollup). Strategies pluggable: `shape.object(vector, steer.guarded)` opts into validation. `steer.bare` wraps raw input in `{input, output}` — no Context class, no signal, no steps; default for patternless vectors. Process strategy: die is a plain object (no Context wrapping), caller owns die, wafer enriches it. Cast = `steer.invoke(wafer, signal, strategy)` returns executor, executor(die) runs it. Inline for now, extract to typology when stable.

**Pattern descriptors**: `vector.open({ nature, input, output, valence }, effect)`. Use `input`/`output`, never `schema`.

**Patternless vector**: A Vector used as a middleware-staging ground. `Vector.affect(effect)` registers a null-keyed anonymous effect. `shape.selbstbestimmt(vector, strategy = steer.bare)` does a greedy DFS to the first reachable effect, accumulates carry along the walked path, and returns `async (input) => output`. Swap strategies: `steer.direct` when the caller owns a pre-built context, `steer.request`/`guarded` drop in for signal/steps ceremony. No routing, no matching. `Vector.open(null, ...)` still crashes — `affect` is the only null-sentinel entry point.

**Subscriber**: `shape.subscriber(vector)` → MikroORM EventSubscriber POJO, routes via steer.shotgun through twitch Vector.

**MCP**: `shape.mcp(vector, info)` → `{ handle, tools, handlers }`. JSON-RPC 2.0 tool server via steer.rollup + guarded.

**Receiver**: `shard.receiver.stdio(handle)` — newline-delimited JSON stdin/stdout. Protocol-agnostic.

**Mode traits**: BUFFERED, DATASET, INTENTED, EMITTER, CHAOSMONKEY, TOPOGRAPHICAL, FRAUGHT, EXPOSED, SELFEVIDENT.

**BufferView**: `new BufferView(mount, schema)` — mount points at `.svelte` file, auto-packed by bundler.

**Intent** (template): `{slug, name, description, traits, trait, mode}`. No `type` field — intent is a thread template/preset, not a buffer producer. Intent traits mirror `ThreadTraitsEnum` exactly. At thread create time, `ThreadSchema.beforeCreate` hook copies `intent.traits` wholesale into `thread.traits` and deep-merges `intent.trait` into `thread.trait` with thread winning per nested key (via `belt/object.merge`). Intent ref stays on Thread for provenance; runtime reads config off thread, never through intent. `FEEDING` remains on `IntentTraitsEnum` under `// archive` as a back-compat marker — do NOT clean up.

**Thread / Intent trait enum** (mirrored): LABELED (structured label — `{ name, description, flags }`), MASKED (thread id + overrides — pull parameters), AIMED (mount — connection aim to emitter), QUEUEING (depth threshold — Stall lifecycle), FURNISHED (default props), SELFEVIDENT (fallback, no pull). Client-side trait application uses two-pass pattern (matching runtime `resolution.js`): first pass sets state, returned functions collected as finalizers and run after all traits register. AIMED returns a finalizer (needs mask from MASKED). QUEUEING returns a finalizer (needs `thread.pull` from AIMED). **Trait config keys**: `LABELED: { name, description }`, `MASKED: { ...mask params }`, `AIMED: { mount }`, `QUEUEING: { depth }`. **Thread.label**: getter/setter pair backed by `$label` atom. Setter normalizes (string → `{ name }`) and fills defaults. LABELED trait seeds from `thread.trait.LABELED` if `is.labeled()`, else derives from intent name → mode name/slug/description (three-step fallback). `is.labeled(thing)` predicate in gestalten/is/primitives. **Stall cursor model**: Stall reads from a PENDING-filtered `computed` over `thread.$buffers`. No consumed Set — buffer status (PENDING → ACTIVE → DONE) drives collection membership. `StallStatusEnum` frozen object for status states. **Stall lifecycle**: `withPull(handler, threshold)` arms the stall but does NOT set IDLE — stall stays UNINITIALIZED until activated. `activate()` is idempotent (returns early if already activated), sets IDLE, subscribes to $status and $source, auto-advances and auto-pulls. Subscriptions captured in `teardowns[]`. `deactivate()` unsubscribes all teardowns, resets `activated` flag — stall can be re-activated later. `suspend()`/`resume()` guard against advance during buffer merge hydration (em.merge fires $entities before Buffer use-middleware sets view). In-flight pull results discarded after deactivation (`!this.activated` guard after await). `close()` sets CLOSED status + nulls handlers — for stall replacement on trait re-application. QUEUEING closes any prior stall on re-application. **ThreadContext lifecycle**: `$current.set` is wrapped — identity check (=== previous), deactivate old thread's stall, activate new thread's stall. Single mutation point for all paths (resolve/set/clear). `resolve()` is the source — guards redundant $current.set. **Pull lifecycle**: constructs `Blacklist.absorb(thread.$buffers.get())` before each pull — filters seen literals on server. Span tracing wraps pull with transition + subject + fault tracks, drains to telemetry Pipe. Stall error subscriber emits separate stall.error span. **Panel A**: Gates Frame mount on buffer value (not just atom existence) — Svelte 5 misses nanostore atom value changes when Frame mounts with null. Frame.svelte guards dom after async import (race between {#key} destroy and module load).

**Buffer (server)**: `{status, data, index, mode, thread, literals, symbols}`. `BufferStatusEnum`: PENDING (queued), ACTIVE (presented), DONE (released), ERROR (failed), STALE (cron-marked). Status defaults PENDING. Entities flow through system; `toJSON()` serializes at HTTP boundary.

**Buffer (client)**: Hydrated via repo merge/cast. View assigned from `mode.buffered` in BufferSchema.use middleware. Status transitions via `EM.persist()` (mutate + refreshStore). Context + release wired in QUEUEING trait pull handler.

**Schematics**: `v` — fluent Proxy over TypeBox. `v.string().default().desc().optional()`. `lib.js` is sole TypeBox consumer. `v.rel(schema)` for m:1 relations, `v.array(v.entity())` for collections. Entity factories: `v.buffer(spec)`, `v.literal(spec)`, etc.

**Gameplay**: `data.gameplay` UPPERCASE string enum per mode (PICK, TYPE, TRANSLATE, DESCRIBE, LISTEN). `data.layout` UPPERCASE string enum (TABLE, PATTERN). `data.forgiving` boolean for typed input.

**Yield protocol**: `Yield.NOMINAL(buffers)`, `Yield.EXHAUSTED(meta)`, `Yield.ERROR(error)`. `condition` discriminant. `Pool` on `ctx.pool` collects buffers, `drain()` produces yield envelope. `mode.emit` returns yield envelope directly (no unwrap). `Pool.add()` absorbs anything (pojos, arrays, yields, promises, pools, falsy→drop). `pool.section(...).apply(array.shuffle)` for independent shuffling. `pool.of()` for detached sub-pools.

**Memory signals**: MASTERY, SUCCESS, NEUTRAL, MISTAKE, FAILURE

**Memory states**: UNTOUCHED → UNKNOWN → LEARNING → KNOWN → GRADUATED

**Memory drivers**: BAYESIAN (ebisu), BOOLEAN, COUNTER. Interface: encode/evolve/assess. Pure — no entity refs, no IO.

**Memory.is**: Compound status getters on MemoryEntity. `virgin` (no status or UNTOUCHED), `weak` (UNTOUCHED or UNKNOWN), `familiar` (LEARNING or KNOWN), `strong` (KNOWN or GRADUATED), `succeeded` (last signal SUCCESS or MASTERY), `failed` (last signal FAILURE or MISTAKE). Usage: `entity.memory?.is?.weak`, `entity.memory?.is?.familiar`.

## Conventions

- **No comments in code.** Comments are user space. Code is self-documenting through naming and structure.
- **.viva.js manifest pattern.** Every registry entry exports manifest + type-specific content.
- **Die/Wafer lifecycle.** Wafer is the base container. Die extends with implementation. Lifecycle cascades parent → children.
- **Trait system.** Traits are async functions applied to modes during daemon resolution. They compose middleware, endpoints, and behavior.
- **bak/ directories** are archives. Old code kept for reference. Never suggest re-adding patterns from bak/.
- **Publish/Subscribe transport convention.** Three named transport primitives form a complete surface:
  - `stream` — raw bytes. Response.stream(asyncIterable), Request.stream() returns ReadableStream.
  - `publish`/`subscribe` — SSE-framed JSON. Response.publish(asyncIterable) formats SSE frames server-side. Connection.subscribe(endpoint) consumes SSE as async generator client-side. Request.subscribe() consumes SSE from incoming request body. Connection.publish(endpoint, asyncIterable) sends SSE-framed stream upstream.
  - `websocket` — bidirectional. Connection.websocket(endpoint) opens WebSocket. shard.websocket(handler) upgrades server-side.
- **Harness-as-Vector pattern.** AI interaction surfaces (cortex harnesses) are Vector instances with middleware, branches per faculty type, and effects per operation. Same shape compilers (object, http, proxy, agentic) apply to harnesses as to any Vector.
- **JSON Merge Patch (RFC 7396) for entity upsert.** `null` means delete in `deepMergeCore` (belt/object.js). Omission means don't touch. Tradeoff: can never store `null` as a meaningful value. Arrays replaced wholesale (no positional deletion).
- **EntitySchema `extends` does NOT inherit `repository`.** When a domain schema extends a typology base schema, the `repository` field must be re-declared on the domain schema. MikroORM resolves the repository class from the leaf schema's metadata — it does not walk the extends chain for it. Similarly, `[EntityRepositoryType]` must be re-declared on the domain entity class.
- **`shard` not `shards`.** The shard namespace is `shard` (singular). All imports from typology use `import { shard } from "@vivalence/typology"`.
- **SQLite `ALTER TABLE RENAME COLUMN` does NOT update FK constraints.** MikroORM's auto-migrator generates column renames, but the FK target table remains unchanged. For table renames that have FK references, the DB needs table recreation or a fresh schema. Never silently delete and recreate — ask first.
- **MikroORM migration `addSql` concatenation bug.** MikroORM can concatenate `pragma foreign_keys = on;` with the next ALTER TABLE in a single `addSql()` call. SQLite only executes the first statement, silently skipping the ALTER. After generating migrations, inspect the output for concatenated statements — especially the last `addSql` which often joins `pragma foreign_keys = on;ALTER TABLE...`. Split into separate `addSql()` calls before deploying.
- **No shorthand alias variables.** Don't create `const modes = ctx.daemon.modes.game` or `const literal = ctx.daemon.entities.literal`. Read off the objects directly. Loop variables use full names: `literal` not `lit`, `form` not `f`, `sentence` not `s`, `word` not `w`, `token` not `t`.
- **SQLite date functions need `unixepoch` modifier.** MikroORM stores dates as millisecond timestamps. SQLite's `julianday()` and `datetime()` can't parse raw milliseconds — use `julianday(column / 1000.0, 'unixepoch')`. Without the modifier, these functions silently return NULL.
- **Check traits via `traits` array, not `trait` object.** `entity.traits.includes("VOCALIZED")` — not `entity.trait?.VOCALIZED`. Trait values can be `null` (e.g., `VOCALIZED: null` means "is vocalized" with no additional data), which is falsy. The `traits` array is the source of truth for trait presence.
- **LiteralRepository custom methods follow MikroORM's `(where, opts?)` pattern.** `feed(where, opts?)`, `novel(where, opts?)`, `due(where, opts?)`, `byStrength(where, opts?)` where opts = `{ limit, blacklist, populate }`. Exception: `byLastSignal(signals, where?, opts?)` takes signals as first arg because it's the method's primary discriminant. Never use single-object `({ limit, blacklist, where })` style.

## Principles

Rules of engagement. Not guidelines — gates.

### Hard Gates

Non-negotiable. If you catch yourself rationalizing past one, stop.

- **NO IMPLEMENTATION WITHOUT DESIRED END STATE STATED IN PLAIN LANGUAGE.** If you can't say what's true after the work that isn't true now, you don't understand the task yet. Ask.
- **NO WRITE WITHOUT EXPLICIT APPROVAL.** Every file write — edits, new files, restores, overwrites — requires showing the content and waiting for approval. Never chain showing a diff with applying it. "It's just a restore" or "it's just one file" is not an exemption.
- **STOP MEANS STOP.** When told to stop editing, stop immediately. No "cleanup" edits, no reverts, no deletions, no "just removing the file I created." Stop means zero further file operations of any kind. The instruction to stop is not qualified — it covers all writes, all deletes, all modifications. If something needs reverting, wait for explicit instruction to revert it.
- **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION.** Before saying "done," run the relevant tests and confirm output. Evidence before assertions.
- **NO FIXES WITHOUT READING THE CODE FIRST.** Don't propose changes to code you haven't read. Don't assume entity fields exist — read the schema.
- **NO VCS OPERATIONS WITHOUT EXPLICIT COMMAND.** Never run jj commands that modify the graph (new, commit, squash, rebase, abandon, bookmark) unless Finn explicitly asks. This includes "helpful" commits. Finn manages the entire version control graph.

### Aesthetic

Code is beautiful, elegant, minimal. No comments — comments are user space. Code is self-documenting through naming and structure. Don't force abstractions where explicit repetition carries meaning; three explicit lines that each do something slightly different are better than a loop that erases the differences. Complexity emerges from simplicity, from composition, not from individual cleverness.

### Presentation

Show complete code — every line, every import, every function body. Never use `...` or `// rest`. The code IS the communication; incomplete code is incomplete communication. Start with usage: who calls this, what does the test look like, why this shape. Then show internals. Propose the complete diff and wait for explicit approval before implementing. Never chain showing a diff with applying it in the same message. New files need review too. Don't show changes to import/export index files — that's clutter. Handle re-exports silently. When replacing code, keep the old version as a comment below unless explicitly told to delete it — Finn's code history is his reference.

### Design

**Desired end state first. Always.** Before touching code, before proposing a diff, before designing anything — get crystal clear on the expected outcome. What does the system look like when this is done? What is true that wasn't true before? What can the user do? What does the data look like? If you can't state the desired end state in plain language, you don't understand the task yet. Ask until you do. This is not a guideline — it is the gate that opens everything else.

**Emergence over workarounds.** Never solve a problem by working around it. Design the system so the problem's source disappears. If you're writing adapter code, extraction logic, compatibility shims, or cross-concern plumbing — stop. The system should be structured so that information flows naturally to where it's needed. If it doesn't, the structure is wrong, not the plumbing. This is why the type system is thick, why entities carry their own paths, why `mode.buffer()` exists. Every design decision should make future problems impossible, not just solvable.

**Architecture over expedience.** This system is pre-users, pre-migration, pre-constraint. Maximum freedom. Never reach for the simplest hack when we can lay a foundation. The principle is: work on the system as a whole, solve problems by engineering the architecture such that the problem doesn't arise in the first place. We are guided by simplicity, elegance, and power — not by speed of delivery. A 50-line primitive in typology that makes an entire class of problems disappear is worth more than a 5-line patch that fixes one symptom. When you see a gap, ask: what's the long-term shape? Build that.

Design and implementation are separate modes. Never mix them. In design mode: show usage, show complete diffs, wait for approval. In implementation mode: write code, run tests, report results. "Rethink" means improve, not delete and reverse — show the revised approach alongside the current one, get confirmation before changing direction. Verify entity fields exist before writing code that references them — read the schema, don't assume. Fix existing tests before designing new features. Inspect real data, don't theorize about APIs.

### Testing

Each concept gets its own test file. Integration tests run over real HTTP, not just inline transport. Never leak internal state for testing convenience. Tests live at the level of the package they test — typology tests typology, runtime tests runtime. Use package exports for cross-package imports, never deep relative paths. Don't jam two concepts into one test file, and don't create separate files for tiny additions to an existing concept.

### jj

This repo uses **jj (Jujutsu)**, not git. jj is the version control system — git is the colocated backend. When reading history, always use jj commands (`jj log`, `jj diff`, `jj show`), never git equivalents (`git log`, `git diff`, `git show`). Don't run jj commands that modify the graph (new, commit, rebase, squash, abandon, bookmark) — Finn manages the entire version control graph. This applies to subagents too.

### Boundaries

Don't delete databases, migration files, or perform destructive data operations without explicit approval. Don't use Claude Code worktrees — jj treats worktree contents as new files, causing ghost commits. Gestalten namespaces (shape, steer, shard) are only for Vectors — don't put non-Vector concerns there. Transport adapters go in `typology/gestalten/shard/transmitter.js`.

### Communication

Never present things that are layers as if they are parallel alternatives. If X uses Y internally, they're layers — show the stack. If they're independent choices, show the choices. Never mix. Use canonical vocabulary precisely — don't substitute generic alternatives. Terms are chosen deliberately and become canonical once settled.

## Testing Architecture

Structural testing. Specimen is king. Each layer tests what's novel to itself — never re-test what a lower layer already covers.

### Layers

| Layer | Package | Scenario | What it tests |
|-------|---------|----------|---------------|
| **Shard** | typology | `datamap.seed()` | Shard CRUD, routing primitives, schema ops, transport, repository identity |
| **Daemon** | runtime | `daemon.create()` | Trait composition, auth gating, daemon route wiring, mode emission, lifecycle |
| **Mode** | runtime | `mountMode(viva)` | Individual mode emitters, buffer shapes, intent seeding |
| **Bench** | runtime | `bench({ kernel, modes })` | Full daemon from registry modules — domain repos, ontology data, real lifecycle |
| **Client** | html | imports runtime scenario | Prototype wrapping, persistence round-trip, Buffer.from lifecycle, schema wiring |

### Scenario Hierarchy

```
@vivalence/typology/scenarios
  ├─ datamap.seed()          ORM + em + bare entities (user, symbol, literals, mode)
  ├─ provider(variant)       In-memory sqlite datamap matching libsql provider contract
  ├─ SymbolConcrete          Concrete entity schemas for test contexts
  └─ BufferConcrete

@vivalence/runtime/scenarios
  ├─ daemon.create()         Full handcrafted daemon (aperture, routes, auth, conn)
  ├─ mountMode(viva)         Single .viva.js → minimal daemon, stub BUFFERED + feed
  ├─ mountModes(vivas[])     N modes → shared daemon (for tactic cross-mode composition)
  ├─ bench({ kernel, modes }) Full daemon factory from registry modules (raw or paladin specifiers)
  └─ lighthouse.create()     Lighthouse service scenario
```

**Three tiers of mode testing:**

1. **mountMode** — lightest. Stub BUFFERED, TestLiteralRepository, real INTENTED + EMITTER. For iterating on a single mode's emitters without domain complexity.

2. **bench (raw imports)** — medium. Real domain entities with `.feed()/.novel()/.due()`, real lifecycle functions (population.modes, resolution.modes), real trait application. No paladin needed. For testing mode behavior with production-grade repos.

3. **bench (paladin specifiers)** — heaviest. Resolves `"@vivalence/game/flashcard"` through paladin VIP, seeds ontology data via DATASET trait, boots full daemon with domain + ontology + topology + modes. For integration testing with real registry data.

Each tier builds on the same infrastructure. The bench imports `provider()` from typology/scenarios for its in-memory ORM. Any system in the ecosystem can `import { bench } from "@vivalence/runtime/scenarios"` to spin up a realistic daemon.

Each scenario extends the previous. Never duplicate schema definitions — import and extend.

### Testing Principles

**Test what's novel to the layer.** Typology tests shard CRUD. Runtime doesn't re-test CRUD — it tests that daemon routes wire shards correctly, that traits compose, that auth gates work. Client doesn't re-test routing — it tests that prototypes survive persistence, that schema wiring resolves relations.

**Test for strain, not basics.** Don't test that `typeof x === "number"` on a known number. Don't test fixture shape — if `seed()` breaks, everything breaks. Test edge cases: empty inputs, missing references, concurrent operations, boundary conditions. The default path works; find conditions that break.

**Multi-step flows over individual assertions.** "Create thread, find scoped to user, findOne matches" is one test with three assertions, not three tests with one assertion each. Fewer test entries, more ground covered per entry.

**Scenarios mirror production.** `repository: () => DataRepository` must be declared on every domain schema (MikroORM `extends` doesn't inherit it). Prototype classes must be used in scenarios that test client paths. If a test passes without these but the browser crashes, the scenario is lying.

### Specimen

Test runner: `specimen` (re-export of `@std/testing/bdd` + `@std/expect`). Import: `import { specimen } from "@vivalence/typology"`. Pattern: `specimen.describe()`, `specimen.it()`, `specimen.expect()`, `specimen.beforeAll()`, `specimen.afterAll()`.

### Anti-Patterns

- Don't test fixture shape (if seed() breaks, everything breaks — write a seed-level smoke test, not per-field checks)
- Don't re-test CRUD at the daemon layer — typology covers it exhaustively
- Don't test JS semantics (isDefined, isArray, typeof on known-good values)
- Don't create separate test files for trivial additions — extend existing concept files
- Don't use deep relative paths for cross-package imports — use package exports (`@vivalence/runtime/scenarios`)

## Session Protocol

When starting a session on vivalence:

1. Read this document (you're doing that now)
2. Read the subsystem doc(s) relevant to your task
3. Read the actual code — the docs are scaffolds, not substitutes
4. Check the Work Packages section in the relevant doc for known gaps and active work
5. After completing work, run the relevant routines (see Routines below)

### Anti-Rationalization Table

If you catch yourself thinking any of these, stop — you're drifting.

| Thought | Reality |
|---------|---------|
| "I'll just add a helper function" | Emergence over workarounds. Rethink the structure. |
| "This comment explains the tricky bit" | No comments in code. Rename until it's obvious. |
| "I'll use git log to check" | This is a jj repo. Use jj commands. |
| "Let me amend this quickly" | Don't touch the jj graph. Finn manages it. |
| "I'll just commit this real quick" | No VCS operations without explicit command. Ever. |
| "I already know the entity shape" | Re-read it. Server buffer ≠ client buffer ≠ schematic. |
| "I'll show the diff and apply it" | Two separate messages. Always. |
| "This is basically done, I'll clean up later" | Run the tests first. No completion claims without verification. |
| "I'll add a shim for backwards compat" | Delete the old thing. No shims, no re-exports, no _vars. |
| "Let me refactor this while I'm here" | Only touch what was asked. Scope creep erodes trust. |
| "The bak/ version had a good pattern" | bak/ is an archive. Those patterns were deliberately abandoned. |
| "I'll import Type from @sinclair/typebox" | Use the shim. Import from @vivalence/typology. Only lib.js touches typebox directly. |
| "I'll use Type.String() for this schema" | Use v.string(). v is the sole schematics interface. Type is the escape hatch. |
| "I'll use Ref for this relation" | Use v.rel(v.entity()) for single relations, v.array(v.entity()) for collections. Ref is legacy. |
| "I'll just delete and recreate the DB" | NEVER. Explain the problem and options. Finn decides what happens to data. |
| "I'll just restore this quickly" | No write without approval. Restores change the working copy too. |
| "The default parameter still works after the rename" | When renaming a function in steer/strategy.js (or similar), audit every `= X.name` default across the codebase. If a new function takes the old name, defaults silently resolve to the new function with different semantics. Type system can't catch it. Grep `steer\.\|strategy\.` after any rename in that layer. |

## Routines

Named protocols invoked during sessions. These are deliberate maintenance acts on the ontology itself.

### ikiro/workpackage

**Trigger:** Mid-session, after meaningful progress on the current task.

Keep workpackage state current so the next session starts from truth, not stale notes.

1. Read the active workpackage file
2. Update: phase transitions, decisions made, blockers discovered, implementation details settled
3. Add gaps discovered during implementation
4. If a workpackage is complete, mark it done in the master index
5. If new cross-cutting work surfaced, note it

### ikiro/reflection

**Trigger:** After a correction, process insight, or when explicitly invoked.

The ontology learns. Method and process updates propagate into principles, conventions, and vocabulary. Stale state gets cleaned.

1. Identify what changed in how we work — a new rule, a refined principle, a deprecated term
2. Update the relevant principle in this document, or add a new convention
3. Update canonical vocabulary if terms were coined or deprecated
4. Scan memory files — consolidate any that are now absorbed into principles or conventions. If a memory is fully captured by the ontology, delete it
5. Scan project memories — remove snapshots that no longer reflect current state
6. Verify memory index (MEMORY.md) is accurate after deletions

### ikiro/principle

**Trigger:** When Finn states something to remember — a rule, a preference, a correction.

Absorb it into the ontology. Principles live in this document, not in memory files.

1. Identify which existing principle it extends, or whether it's a new one
2. Update the relevant principle section in this document
3. If it's a new convention or vocabulary term, add it to the appropriate section
4. If a memory file exists for a superseded version of this rule, delete it

### ikiro/method

**Trigger:** When Finn identifies a process-level pattern — how we work on something specific, not a high-level value.

Methods are about process. Principles are about values. "Always show diffs first" is a principle. "When designing a new primitive, define the process loops first" is a method.

1. Identify the method — what's the process pattern?
2. If it relates to an active workpackage, add it there as a section
3. If it's cross-cutting, add it to this doc under a Methods section (create if needed)
4. Workpackage changelog: every workpackage gets a =* Changelog= section. Each ikiro invocation that touches the workpackage appends an entry with date and what changed.

### ikiro/verify

**Trigger:** Before claiming any implementation work is complete.

Evidence before assertions. This is the gate between "I think it works" and "it works."

1. Run the relevant test suite — not just the new tests, the existing ones too
2. If there's a build step, run it
3. Confirm output matches expected behavior — read the actual output, don't assume from exit code
4. Only then proceed to ikiro/workpackage updates or completion claims

### ikiro/compact

**Trigger:** End of session, or when explicitly invoked.

Compress the session's learnings into the ontology. The system should be cleaner after you leave than when you arrived.

1. Update orientation: active work areas (mark done, add new), dead code registry (add/remove entries), canonical vocabulary (new terms from this session)
2. Compress zettelkasten: implement the good ideas, discard the stale ones, keep the pending ones sharp
3. Update workpackage states for anything that moved
4. Audit dead code flags against the actual repo — remove entries for deleted files, add entries for newly dead code
5. Run ikiro/reflection (memory cleanup is part of leaving clean)
6. Report: what shipped, what's blocked, what the next session should pick up

### Routine Composition

Which routines chain into which workflows:

```
design:      ikiro/workpackage → [design mode: show diffs, wait] → ikiro/principle
implement:   [write code] → ikiro/verify → ikiro/workpackage → ikiro/reflection
correct:     ikiro/principle → ikiro/reflection
end session: ikiro/compact (includes ikiro/reflection)
```

ikiro/verify is the gate between implementation and completion. Nothing downstream of it runs if verification fails.

## Dead Code Registry

Still on disk — don't document, extend, or suggest using:

| What | Where | Status |
|------|-------|--------|
| sheets subsystem | subsystems/sheets/ | Completely unused |
| NLP service | registry/services/@vivalence/nlp/ | Uncertain activity |
| lighthouse/localhost | registry/services/@vivalence/lighthouse/localhost/ | Not wired |
| hallucinator hal257 | registry/services/@vivalence/hallucinator/bak/hal/ | Retired — replaced by anthropic faculty provider |
| hallucinator archive | REMOVED | Was registry/services/@vivalence/hallucinator/hal/archive/ |
| Archived modes | registry/modes/@vivalence/bak/ | Abandoned approaches |
| Archived topologies | registry/kernels/@vivalence/topology/bak/ | Spanish, Latin, etc. |
| Game mode stubs | registry/modes/@vivalence/game/bak/todo/ | Superseded by proper modes |
| SELFEVIDENT mode trait impl | runtime/daemon/traits/index.js | No-op on Mode. SELFEVIDENT is a valid Thread/Intent trait (fallback semantics), but carries no Mode-level behavior. |
| Second-level archive | systems/html/src/bakk/ | Parallel to `bak/`. Contains old terminal wafer. Safe to delete when convenient. |
| Old EMITTER commented code | REMOVED | Was runtime/daemon/traits/emitter.js lines 62-93. Deleted during Pool migration. |
| Old BUFFERED commented code | REMOVED | Was runtime/daemon/traits/buffered.js. File deleted. |
| Old client.js + client.wafer.js | systems/html/src/bak/client.js, client.wafer.js | Replaced by terminal-first client |
| client.bak.js | REMOVED | Was systems/html/src/client.bak.js. Deleted — replaced by context architecture |
| Lighthouse wafer (client) | systems/html/src/bak/typology/lighthouse/lighthouse.wafer.js | Superseded by selbstbestimmte vector in prototypes/lighthouse.js |
| Daemon wafer (client) | systems/html/src/bak/typology/daemon/daemon.wafer.js | Superseded by selbstbestimmte vector in prototypes/daemon.js |
| Old typology (entire dir) | systems/html/src/bak/typology/ | Lighthouse, daemon, terminal, entities — superseded by EntitySchema architecture |
| Old entity prototypes + lifecycle + stores | systems/html/src/bak/ | Pre-EntitySchema prototypes, daemon lifecycle, registry, factory-pattern stores. Superseded by entities/ + prototypes/ |
| Old routes (entire tree) | systems/html/src/bak/routes/ | viva/, login, lobby, modeline, inspector — superseded by REPL at root |
| Old surface dir | systems/html/src/bak/surface/ | Login component, inspector components |
| Cortex workpackage (all) | REMOVED | Was runtime/tests/workpackages/cortex/. Entire directory deleted. |
| Trace entity (client) | REMOVED | Was systems/html/src/typology/entities/trace.js. Deleted 2026-04-14 — unused on client (only in bak/ Inspector). Server Trace entity unchanged. |

## Active Work Areas

As of 2026-04-13:

- **Wafer lifecycle** — [wafer-lifecycle.workpackage.org](wafer-lifecycle.workpackage.org). Vector-based process composition replacing Wafer/Die class hierarchy. Pattern proven (27 typology tests). Paladin migrated (22 tests). Client migrated: 4 wafers (client, lighthouse, daemon, terminal) with process strategy + die.good/variant/control namespace. 11 daemon wafer tests. Next: extract process strategy to typology, runtime migration (Die class retirement).
- **Stage + Dashboard** — [stage-canvas-devtools.workpackage.org](stage-canvas-devtools.workpackage.org). `stage` rendering shim in drapes (sole echarts consumer). `Canvas` managed container component. ECharts v6 via import_map. `dashboard` mode type in learning domain. `dashboard/dataspace` mode: graph (practiced literals + symbol anchors), memory (status bars + scatter), traces (timeline scatter + live SSE). Phase 1 done, Phase 2 iterating (graph layout tuning). Three.js deferred.
- **Literal hierarchy** — `uses`/`in` M:N self-relation. LiteralSubscriber afterFlush. Open: twitch migration question
- **Modes & tactics** — [language-learning-modes.workpackage.org](language-learning-modes.workpackage.org). 9 game modes + 2 tactics operational. Three ontologies (word, sentence, conjugation). Pool emitter composition. All gameplay/layout enums UPPERCASE. Tactics: Five-Fold Session (5-phase: warmup→cooldown, renamed from survival), Clinic (12 adaptive scopes: class, regularity, questions, connectors, negation, pronouns, determiners, adverbs, numbers, degrees, prepositions, ser-vs-estar — with phase-aware sub-emitter composition: introduce/drill/reinforce/hunt). Clinic uses strength-based assess + weighted random selection + trace errorRate. PWA manifest for standalone mobile. Open: CompletableSymbol, Tier 2 (reorder, dictation), tense/mood clinic intents (need A1), colors scope (needs dataset)
- **Cortex** — [cortex.workpackage.org](cortex.workpackage.org). All 4 milestones + daemon lifecycle wiring DONE. 27 integration test steps (21 inline + 6 HTTP/SSE). Dewey live as registry mode. Hal257 retired, anthropic provider active. Bruno test regime. Next: history windowing (MID PRIORITY), client consumption, workpackage cleanup
- **Datamap client** — [datamap-client-migration.workpackage.org](../systems/html/.ikiro/datamap-client-migration.workpackage.org). Server-side DONE. Batch DONE. Memory + trace datamap shards now exposed in domain aperture. Open: persist test, identity map, SSE subscribe wiring
- **Shell client** — [shell-client.workpackage.org](../systems/shell/.ikiro/shell-client.workpackage.org). MCP as future phase
- **Package manager** — [very-important-packagemanager.workpackage.org](very-important-packagemanager.workpackage.org). Design only
- **v schema builder** — [v-schema-builder.workpackage.org](../subsystems/typology/.ikiro/v-schema-builder.workpackage.org). DONE (M1+M2). M3 game mode migration pending
- **Terminal-first client** — [terminal-first-client.workpackage.org](terminal-first-client.workpackage.org). Complete client redesign. Terminal as primary entity. REPL at root, no routes. Command vector assembled from base + client + daemon + mode commands. Phase 1 in progress: bare REPL loop with command vector dispatch working. Supersedes client-typology workpackage (Phases 1-4 of that work — EM, repos, wafers — are foundation, Phase 5 route migration is now obsolete).
- **Pincer layout + context architecture** — [pincer.workpackage.org](pincer.workpackage.org). T-bone layout system with viket controller. Phases 1-17 complete: prototype, skeleton rebuild, skinner, component isolation, state primitives, context architecture. 4 contexts (LIGHTHOUSE, QUARTERS, BRIDGE, THREAD) wired in root layout. `@vivalence/html` barrel with namespace aggregates. **EntitySchema lifecycle** (2026-04-12): typology restructured to `prototypes/` (infrastructure: Entity, Daemon, Lighthouse, Dataspace, Stall, Terminal, Quarters, Bridge, ThreadContext, persistence) + `entities/` (domain: Mode, Intent, Thread, Buffer, Turn, Trace, Literal — each with class + schema). `lifecycles/` and `stores/` directories removed — context classes + daemon/lighthouse lifecycles live in `prototypes/`. Dataspace rewritten to accept EntitySchema array, compile lifecycle vectors, wire `repo.hydrate`. Factory (strategy) provides execution context per hydration. Traits (QUEUEING) folded into thread entity schema as middleware — emit pipeline fully wired via `mode.connection.aim()` + Stall + `mint()`. **Terminal persistence** (2026-04-12): Terminal.toJSON includes daemon/thread markers, ThreadContext.set() goes through `repo.update()` for localStorage flush, ThreadContext.resolve() async with remote findOne fallback for post-refresh hydration. **SSE batch bypass** (2026-04-12): `shard.connection.batch` filter excludes `accept: text/event-stream` requests — SSE subscribes go direct, not through batch multiplexer. `hatch` parameter (was `url`). Panel D outside: navigation Vector with real effects (openFromMode/openFromIntent/resume) rendered via Tree drape. Panel D inside: thread display table. Panel E: active thread JSON dump (dev). Panel F: Dag drape from thread buffers. `$terminal` computed on quarters. Terminal spawn with null slug, close button on active tab, blur overlay on empty. **Context inspectors** (2026-04-12): dev tooling in panel H. 4 bespoke inspector overlays toggled by L/Q/B/T buttons in H bar. `window.__viv` dev handle. **Known issue**: Terminal.toJSON manually lists fields — should derive from schema to prevent silent data loss. **Resize anchor** (2026-04-13): orientation-aware resize handler anchors pincer to B panel's far corner per orientation (delta-shift, not proportional). All three trackers (pincer, previous, standard) shift via `reanchor()`. Old proportional code commented out. **Desk flexbox** (2026-04-13): `Desk.svelte` from grid to flex column — surface `flex:1 1 0` + `min-height:0`, controls `flex-shrink:0` (pinned bottom). **Panel A skeleton-0** (2026-04-13): background darkened from `skeleton-1` to `skeleton-0`. **Layout persistence** (2026-04-13): Bridge saves/restores pincer position, orientation, standard, previous, and panel C pane sizes to localStorage via `bridge.save()`. On mount, detects saved positions and clamps to viewport. **iOS mobile fixes** (2026-04-13): safe-area-inset padding on body (client.html), paradigm table overflow containment (width:100%, min-width:0 on table/cell/stage), tree skin indentation reduced (16→6px/level), panel divider touch moved to window-level pointer listeners. Open: buffer rendering in Panel E (replace JSON dump with view module), session lifecycle (terminal phase + stall integration), systemAlert (derived from lighthouse + daemon aggregate), history windowing.
- **Client typology** — [client-typology.workpackage.org](client-typology.workpackage.org). Phases 1-4 DONE (EM, repos, wafers, 78 test steps). Phase 5 (route migration) SUPERSEDED by terminal-first-client workpackage.
- **Decorum (zone-based theming)** — [decorum.workpackage.org](decorum.workpackage.org). 5 milestones. M1 DONE (2026-04-12). M4 scaffolded (2026-04-13): `/decorum` route with skeleton swatch grid (0-4), theme/system compat alias cards, live specimen with clickable skeleton selection. Dark.js restored `theme` + `system` compat aliases using original `palette.*` ramps (`createColorType` pattern: surface=color[500], contrast=color[200], boundary=color[300]`). 9 tests, 50 steps green. Next: M2 (Zone.svelte wrapper + Decorum mothership context), M3 (migrate panels/components to `--zone-*`), M5 (dark+light switching).
- Mobile readiness, progression system — deferred.
- **Intent-as-template refactor** — DONE 2026-04-11 (see [intent-as-template.workpackage.org](intent-as-template.workpackage.org)). Intent lost its `type` field, became a thread template. Intent/Thread traits mirror ({QUEUEING, FURNISHED, SELFEVIDENT}). ThreadSchema `beforeCreate` hook copies intent traits + deep-merges trait JSON on thread creation. 13 mode datasets migrated. All typology + runtime trait tests green. Session entity deleted. Follow-up: move `intent.emit` from intent to thread (structural, deferred). beforeCreate hook fixed 2026-04-11: uses `args.em.findOne(IntentEntity)` to populate intent when it's a foreign key ID.
- **shape.object dispatch fix** — DONE 2026-04-11. Two-line fix in `subsystems/typology/gestalten/shape/object.js`: `execute = steer.direct` → `execute = steer.request` on both `object()` and `proxy()` defaults. Required because `direct` was renamed to `request` in `steer/strategy.js` and a new `direct` (pre-built context, no wrapping) took the old name, silently breaking all `shape.object(vector)` default callers. Resolved 4 typology + 10 runtime test failures.
- **shape.selbstbestimmt (patternless vectors)** — DONE 2026-04-11. New `Vector.affect(effect)` registers a null-keyed anonymous effect. New `shape.selbstbestimmt(vector, strategy?)` does greedy DFS to the first reachable effect, accumulates middleware along the walked path, returns `async (input) => output`. Default strategy `steer.bare`; `steer.direct` works drop-in for caller-owned contexts. No changes to Vector.open, steer, or existing shape compilers. 12-step test suite with two worked examples (bare string-normalizer, direct sub-pipeline). Shipped as a single-session primitive — no dedicated workpackage.

## Divio Documentation + Testing Matrix

Four styles applied to both documentation AND testing:

```
                LEARNING              WORKING
PRACTICAL       Tutorials             How-to Guides
                (walk-throughs)       (recipes)
THEORETICAL     Explanation           Reference
                (why decisions)       (specs/API)
```

Each subsystem doc has a Work Packages section identifying gaps in both documentation and testing through this lens.

---

## Self-Improvement Protocol

These docs are living scaffolds. After every task, ask: **"What would the next session need to know?"** Write it in the appropriate doc. Keep file paths accurate, method signatures current, dead code flags verified, Work Packages reflecting actual state.

## Zettelkasten

[zettelkasten.md](zettelkasten.md) — a scratchpad for documentation improvement ideas. When you notice something that could be better but don't want to break your flow, write it there. Periodically review and implement the good ones. Ask Finn for extra turns if you want dedicated time to work on them.

## Work Packages (Master Index)

Each subsystem doc has its own Work Packages section. This is the master view:

**Active work packages:**
- [terminal-first-client.workpackage.org](terminal-first-client.workpackage.org) — Terminal-first client redesign (REPL, command vector, no routes)
- [wafer-lifecycle.workpackage.org](wafer-lifecycle.workpackage.org) — Vector-based process composition (wafer/die/cast)
- [cortex.workpackage.org](cortex.workpackage.org) — Hallucinator cortex
- [language-learning-modes.workpackage.org](language-learning-modes.workpackage.org) — Game modes & tactics
- [stage-canvas-devtools.workpackage.org](stage-canvas-devtools.workpackage.org) — Stage rendering primitives + dashboard mode
- [shell-client.workpackage.org](../systems/shell/.ikiro/shell-client.workpackage.org) — Operator interface + MCP
- [very-important-packagemanager.workpackage.org](very-important-packagemanager.workpackage.org) — Registry as jj scopes
- [decorum.workpackage.org](decorum.workpackage.org) — Zone-based theming (M1 done, M2-M5 open)

**Completed:**
- [pool-prototype.workpackage.org](pool-prototype.workpackage.org) — Pool emitter composition primitive (DONE 2026-04-02)
- [client-typology.workpackage.org](client-typology.workpackage.org) — Client typology reorganization (Phases 1-4 DONE, Phase 5 superseded)
- [intent-as-template.workpackage.org](intent-as-template.workpackage.org) — Intent-as-template refactor (DONE 2026-04-11, all 6 phases + shape.object dispatch fix)

**Key testing gaps:** Memory drivers untested in isolation. Process system untested. Agentic compiler untested. Paladin has 22 baseline tests. Daemon client wafer has 11 tests. Client/lighthouse/terminal wafers build-tested only (no scenario tests yet). Pre-existing buffer.test.js failures (unrelated to wafer migration). Paladin: 5 pre-existing failures — (1) `paladin.test.js:128` expects `hal257` but circuitry says `anthropic` since 2fab6794, (2) `pensieve.test.js` calls `lookup()` but method is `revelio()` (born dead Oct 2025), (3) `vip.test.js` default exports return strings but `cast.viva()` expects object with manifest. Survival/clinic tactic orchestration tests (need mountModes + enriched fixtures for ANNOTATED/VOCALIZED). Conjugation/paradigm mode emitter tests (need CONJUGATED ontology fixtures). RemoteEntityManager flush() not tested against /batch endpoint. Managed repo persist() + subscribe() interaction with EM untested. Stall has 33-step test suite (2026-04-15: cursor model, status machine, pull guards, hooks, activate, toJSON). EM.persist() has 6 tests covering refreshStore propagation + subscriber notification (2026-04-15).

**Cross-cutting:** @vivalence/shared migration, asset entity type, hallucinator contract update
