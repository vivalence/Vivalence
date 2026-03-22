> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# Typology

> The type system library. Prototypes, entities, gestalten, schematics, specimen.

## Role

Library. A grabbag of composable building blocks — everything in the system builds on these types. Power is emergent from composition, not procedure. Signature (211 lines) enables Pattern/Signal/Path/Url/Action through inheritance and a coercion system. One base class yields an entire routing ontology.

## Entry Points

| File | Lines | Purpose |
|------|-------|---------|
| mod.ts | 14 | Server entry — re-exports prototypes, gestalten, schematics, entities, specimen, types |
| mod.client.js | 8 | Client entry — prototypes (client version), gestalten, trait only. Excludes entities/schematics/agents |
| deno.jsonc | — | Package config. Exports: `.`, `./prototypes`, `./schematics`, `./gestalten`, `./entities`, `./specimen`, `./scenarios` |

## Prototypes

### Signature Hierarchy (the connected set)

These form a single inheritance chain. Signature is the root; each descendant specializes through coercions and method overrides. The coercion system is the key mechanism — constructor calls `this.coerce(signature)` which iterates `static coercions = []` (array of `[predicate, transform]` tuples). First match wins.

**Signature** `prototypes/signature.js` (211 lines)
Root prototype for hierarchical objects. Manages trace/gauges tree (parent/children).

Constructor: `(signature = null, trace = null)`

Navigation: `heritage()` yields ancestors, `descendants()` yields children, `finn()` yields descendant chain, `grab(gauge, drop)` finds/removes gauge, `pop()` removes self, `rebase(signature)` creates with new root.

Properties: `nature` (core identifier), `trace` (parent), `gauges` (children array), `absolute` (root-to-this path), `hash` (via `hasher()` → `[nature]`), `depth`, `index`, `length`, `tilde` (root ancestor), `fin` (last descendant), `heir` (first child), `lua` (last universal ancestor), `ghost` (no nature but has heir).

Composition methods: `from(trace, anon)` registers in hierarchy, `branch(signature)` creates child, `clone()` independent copy.

**Pattern** `prototypes/pattern.js` (119 lines) `extends Signature`
Route matching. Constructor splits "/" and applies patternmap probes to classify each segment:
- **wildcard** (`*`) — matches any signal
- **remainder** (`(.*)`) — catch-all
- **parameter** (`:name`) — extracts named parameter
- **literal** (default) — exact match

Key method: `apply(signal)` — calls filter function if exists, returns match or null.

**Signal** `prototypes/signal.js` (41 lines) `extends Signature`
Concrete values matched against Patterns. Constructor splits "/" into segments. `hasher()` returns `[index, nature]`. Property: `pathname` → "/" + joined absolute.

**Path** `prototypes/path.js` (63 lines) `extends Signature`
Filesystem operations. Coercions normalize paths (collapse slashes, strip trailing). Properties: `absolute` (joined segments), `filename` (last segment if has "."), `dirname` (parent path), `segment` (alias for nature). Implements `Symbol.toPrimitive`.

**Url** `prototypes/url.js` (277 lines) `extends Signature`
URL with origin handling. Coercions handle URL objects and strings. `hasher()` returns `[origin, nature]`. `branch(signature)` joins path segments via normalize/join helpers. Properties: `origin`, `href`, `pathname`, `port`, `hostname`.

**Action** `prototypes/action.js` (26 lines) `extends Signature`
Nature-based matching. `apply(signal)` returns signal if nature matches, null otherwise. `hasher()` returns `hash(absolute)`.

### How Composition Works

Signature's `branch()` creates a child with `this` as trace. Pattern inherits this and adds the patternmap filter system. Signal inherits and adds index-based hashing. The coercion system means you can pass a string to any Signature constructor and it gets transformed into the right structure — Pattern splits on "/", Path normalizes filesystem paths, Url extracts origin. One constructor interface, many behaviors.

### Standalone Prototypes

**Agent** `prototypes/agent.js` (327 lines)
AI execution controller. Fluent API: `withBrain(brain)`, `withInput(schema)`, `withOutput(schema)`, `withTemplate(template)`, `withTools(vector)`, `withContext(slug, textOrFn)`. Execution: `generate(input)` for structured output with retry, `do(input)` for tool-based action. Uses AJV for input/output validation against TypeBox schemas. `check(what)` validates required components are set.

Imports from @vivalence/shared: `validators` (AJV), `hash`, `obj` (stripNulls, merge).

**Connection** `prototypes/connection.js`
HTTP connection with middleware. `use(fn)` wraps transport, `branch(path)` creates child with extended URL, `fetch(endpoint, body, options)` executes request, `call()` fetch with error throwing, `aim()` curried call. State: nanostores atoms for `$state` (IDLE), `$error`, `$isConnected`, `$isError`. Raw protocol methods (bypass transport middleware): `subscribe(endpoint, options)` async generator for SSE consumption (buffers frames, yields JSON or string), `publish(endpoint, source, options)` sends SSE-framed async iterable upstream via streaming POST (duplex: half), `websocket(endpoint)` returns native WebSocket with http→ws URL conversion.

**Request** `prototypes/request.js`
HTTP request object. Properties: `url` (auto-coerced to Url), `method` (default POST), `headers` (Map), `body`, `query`, `path`, `raw` (native Request, set by http shape — transient, not in clone/json), `options` (timeout: 30000, retries: 0, credentials: include), `signal` (lazy AbortController). `stream()` returns `raw?.body` (native ReadableStream) or null. `subscribe()` async generator — reads SSE-framed data from `raw.body`, buffers frames, yields JSON-parsed or raw string payloads. Mirrors Connection.subscribe() but for incoming request bodies (server-side consumption of client-pushed SSE streams).

**Response** `prototypes/response.js`
HTTP response. Status helpers: `ok` (200-299), `isNetworkError` (0), `isServerError` (500+), `isClientError` (400-499), `isAuthError` (401/403). Streaming: `stream(source)` creates pull-based ReadableStream from async iterable (strings encode via TextEncoder, Uint8Array passes through). `publish(source)` composes over stream — sets type to `text/event-stream`, formats SSE frames (`data: ...\n\n`), delegates to stream(). (Was `events()` — renamed to `publish()` to align with the publish/subscribe transport convention.)

**Context** `prototypes/context.js` (17 lines)
Unified request/response container. Wraps Request + Response with alias properties: `input` (get/set → `request.body`), `output` (get/set → `response.body`). Also holds `state: {}` and `params: {}`. Used by the http shape as the execution context — middleware and effects operate on Context. The same shape used by Connection's transport layer and daemon internal calls.

**Status** `prototypes/status.js` (66 lines)
State tracking via nanostores atom. `set(update)` updates code/error/timestamp, `is(code[])` checks current code, `reflection` getter.

**Wafer** `prototypes/wafer.js` (120 lines)
Lifecycle container — the light version of Die. Empty lifecycle hooks: `populate()`, `resolve()`, `integrate()`, `disintegrate()`. Properties: `mask`, `good`, `status` (Status instance), `abort` (AbortController), `manifest`, `slug`, `type`.

**Seek** `prototypes/seek.js` (112 lines)
Entity resolution. `fromMask(mask, ctx)` async-resolves entity references — looks up symbols/literals by ID or slug, returns `{id, slug}` objects.

**Blacklist** `prototypes/blacklist.js` (160 lines)
Filtering/blocking utility.

**Classifier** `prototypes/classifier.js` (143 lines)
**DEAD CODE.** Only referenced in bak/ and one test. Has inner classes Feature and Classifiable with hash-based caching. Hooks system via `on(type, fn)` and `parse(classifiable, ctx)`.

**Freight** `prototypes/freight.js` (69 lines)
Static asset catalog. `constructor(path)` takes filesystem path (auto-coerced to Path). `withUrl(url)` sets base URL for catalog URLs. `index(root)` recursively scans directory, collects entries with slug (filename sans extension), path (relative), and MIME type. `resolve(query)` finds by exact path, path-without-extension, or slug. `catalog` getter returns `{path: {type, url}}` object. Supports: mp3, wav, ogg, png, jpg, svg, webp, mp4, webm, json. Used by FRAUGHT trait to index mode freight directories.

**Other small prototypes:**

| File | Lines | Notes |
|------|-------|-------|
| mode.js | 34 | Placeholder |
| view.js | 52 | Placeholder |
| scope.js | 38 | Placeholder |
| env.js | 56 | Environment config |
| mask.js | 33 | Exported but never imported outside typology — **likely dead** |

**Vector** `prototypes/vector.js`
Hierarchical routing trie with middleware accumulation. Constructor takes `(ancestor, signature = Pattern)`. Three internal maps: `effects` (Pattern → effect function), `trajectories` (Pattern → child Vector), `carry` (middleware array). API: `use(middleware)` pushes to carry, `branch(signature)` creates/finds child Vector, `open(signature, effect)` registers leaf effect, `slurp(vector)` merges another Vector's effects/trajectories/carry. Multi-segment signatures auto-decompose via Pattern.heir — `open("a/b/c", fn)` branches a→b then sets effect at c.

**Aperture** `prototypes/aperture.js` extends Vector
Method-dispatch routing. `.get(sig, handler)`, `.post(sig, handler)`, `.put()`, `.patch()`, `.delete()` register HTTP method-specific handlers via internal `_route()`. When multiple methods are registered on the same pattern, a `methods()` dispatcher is created that checks `ctx.request.method` — returns 405 for unmatched methods. `.open()` effects become the `*` wildcard method fallback.

**RemoteRepository** `prototypes/repository.js`
Client-side generic repository mirroring the datamap shard's API over a Connection. Methods: `find(where, options)`, `findOne(where, options)` (local-first), `findAndCount`, `count`, `create(data)`, `upsert(data)`, `ensure(data)`, `update(where, data)`, `remove(where)`. State: `$entities` nanostore atom. `merge(raw)` wraps in prototype + upserts into store. `_hydrate(raw)` resolves cross-repo relations via `_schema`. `subscribe(where)` returns `unsubscribe()` — consumes SSE via Connection.subscribe, drives merge/_drop.

**Broadcaster** `prototypes/broadcaster.js`
Async pub/sub primitive. `subscribe(filter)` returns `{iterable, unsubscribe}` where iterable is an async iterable (push/wait queue pattern). `push(event, entity)` checks `object.match(entity, filter)` against each subscriber's filter before delivering. Used by the datamap shard's reactive option to fan out MikroORM entity change events to SSE subscribers.

**Error types:** BaseError, ConnectionError, ProductionError in prototypes/errors/. Vector errors (Long, Short, NotFound) in prototypes/errors/vector.js.

## Entities

### Base Hierarchy

**BaseEntity** `entities/base/BaseEntity.ts` (42 lines) extends MikroBaseEntity
UUID v7 primary key, auto timestamps (createdAt, updatedAt).

**DataEntity** `entities/base/DataEntity.ts` (72 lines) extends BaseEntity
Repository with `unique(x)` (must override), `findByTrait(trait)`, `ensure(query)` (upsert).

**VirtualEntity** `entities/base/VirtualEntity.ts` (36 lines) extends BaseEntity
In-memory collection-backed. Repository extends Array. Properties: slug, name, description.

### Trait System

`entities/base/trait.js` — exported in mod.client.js for client-side use too. Trait composition via `defineTrait`, `applyTraits`, `mergeProperties`, `composeSubscriber`.

### Kernel Entities

**Literal** `entities/kernel/Literal.ts` (96 lines) extends DataEntity
Slug (unique), traits array, data (JSON), symbols (m:n Collection), products (m:n Collection). Computed `symbol` property (JSON record from symbols collection). LiteralSubscriber computes symbol on change. Repository unique by slug.

**Symbol** `entities/kernel/Symbol.ts` (139 lines) extends DataEntity
Slug (unique), traits (ONTOLOGICAL, STRUCTURAL, LABELED), data (JSON), literals (m:n), products (m:n). Repository unique by slug. Cascade remove.

**Issue** `entities/kernel/Issue.ts` (96 lines) extends VirtualEntity
In-memory. Violation enum (forbidden, required), Status enum (PENDING, PROCESSING, RESOLVED, ERROR). Tree structure via descendants/parent. Methods: `onError()`, `spawn(issues)`, `violates(constraint)`, `of(entity)`, `resolve()`.

**Constraint** `entities/kernel/Constraint.ts` (175 lines) extends VirtualEntity
In-memory. Type enum (SCHEMATIC, EXISTENTIAL, RELATIONAL — ordered 0,1,2). Async `predicate` function returns Issues. `matching(target, subject, types)` filters and sorts. `test(entity)` executes predicate.

### Network Entities

**Identity** `entities/network/Identity.ts` (55 lines) extends BaseEntity
Embeddable AuthenticatorEmbedEntity (provider, credentials, tokens). Slug unique.

**Daemon** `entities/network/Daemon.ts` (52 lines) extends BaseEntity
Url string, slug (unique).

### Daemon Entities

**User** `entities/daemon/User.ts` (51 lines) extends BaseEntity
Roles enum (USER, ADMIN, GUEST), config (JSON), sessions (1:m → Session).

**Mode** `entities/daemon/Mode.ts` (86 lines) extends DataEntity
Traits enum: VIEWABLE, DATASET, INTENTED, SELFEVIDENT, EMITTER, CHAOSMONKEY, TOPOGRAPHICAL, FRAUGHT (+ VALENTIC, BUFFERED, PRODUCER as legacy in enum only). Properties: slug, name, description, type, installed. Relations: intents (1:m → Intent), buffers (1:m → Buffer). Unique by type+slug.

**Intent** `entities/daemon/Intent.ts` extends DataEntity
Type enum (SELFEVIDENT, APPLICATIVE), Traits (FURNISHED, FEEDING). Properties: slug, name, description, type, trait (JSON). Mode relation (m:1, eager). Symbols (m:n), Literals (m:n). Unique by slug+mode.

### Userspace Entities

**Buffer** `entities/userspace/Buffer.ts` extends BaseEntity
Traits (FURNISHED, STATEFUL, DIALOGIC, AGENTIC), Status enum (PENDING, ACTIVE, DONE, ERROR, STALE). Properties: trait (JSON), position (number). Relations: mode (m:1 Mode), session (m:1 Session), literals (m:n), symbols (m:n). Abstract schema.

**Session** `entities/userspace/Session.ts` (61 lines) extends BaseEntity
Properties: user (m:1 User, cascade delete), traits, data (JSON), cursor, counter, products (1:m → Product).

### Entity Exports

`entities/index.ts` organizes into: `sets.{network, daemon, userspace, kernel}` and `maps.{...}` for programmatic access.

## Gestalten

Four families plus utilities and network primitives.

### is/ — Type Predicates (104+80+9 lines)

**Scalars** `gestalten/is/scalars.js`: `array`, `object`, `fn`, `string`, `number`, `boolean`, `undefined`, `nill`, `defined`, `empty`, `integer`, `positive`, `negative`, `numberPositive`, `email`, `date`, `regex`, `promise`, `error`, `module`, `id`, `slug`, `url`.

**Prototypes** `gestalten/is/prototypes.js`: Uppercase = instanceof (`Signature`, `Pattern`, `Signal`, `Path`, `Vector`, `Aperture`, `View`). Lowercase = duck-type (`signature` has .nature, `pattern` has .filter+.nature, `vector` has effects/trajectories/carry/use/branch/open, `action` constructor check, `url` has .origin).

**Primitives** `gestalten/is/primitives.js`: Custom checks (product, lookup).

### cast/ — Type Coercion (48+5+5 lines)

`cast/primitives.js`: `viva(thing)`, `runtime(thing)`, `lookup(thing)` — module resolution and coercion.

### not/ — Negation/Error (35 lines)

Complements cast. Error throwing on failed type checks.

### fromm/ — Conversions (48 lines)

Conversion functions: `viva`, `runtime`, `lookup`, `match(steps)` (extracts `.parameters` from traverse step array — used by http shape for route params), `params(params)` (reconstructs `.path` from numeric remainder params — used by view/freight serving).

### belt/ — Utility Collections (12 modules)

| File | Lines | Contents |
|------|-------|---------|
| array.js | 40 | groupBy, chunk, unique, flatten |
| crypto.js | 6 | Crypto wrappers |
| fn.js | 23 | compose, pipe, once, debounce |
| hash.js | 14 | Hash generation |
| id.js | 20 | UUID generation/validation |
| middleware.js | 30 | `compose(middleware[])` — Koa-style middleware composition (27 lines that enable the entire middleware system). `chain(first, second)` — compose two middleware. `forward` — noop passthrough. |
| object.js | 211 | Deep merge, clone, path set/get, diff |
| promise.js | 59 | all, race, retry, timeout |
| random.js | 105 | Random number/choice |
| sleep.js | 8 | Sleep utility |
| sort.js | 12 | Sorting |
| strings.js | 3 | String utilities |
| time.js | 14 | Time utilities |

### shard/ — Network Primitives + HTTP Shards

| File | Contents |
|------|---------|
| connection.js | Connection shard middleware |
| context.js | `attach(key, val)` — context extraction middleware |
| patterns.js | Pattern definitions |
| request.js | Request handling |
| secure.js | `authority(provider)` — sets `ctx.authority = provider`. `authorize(claims)` — full auth chain: checks Bearer header → calls `ctx.authority.authenticate(token)` → calls `identity.getUser()` → sets `ctx.user`. Returns 401 on missing header, invalid token, or unknown user. Test scenarios must provide a mock authority, not just set ctx.user directly. |
| transporter.js | `fetcher` — HTTP fetch transport. `inline(serve)` — bridges Connection ctx ↔ native `(Request)=>Response` handler without HTTP. Used by runtime for daemon internal Connection. |
| cors.js | CORS wrapper — origin allowlist, preflight 204, header reflection |
| caching.js | `catchAndRelease(id)` — Map-based response caching middleware |
| websocket.js | `websocket(handler)` — WebSocket upgrade effect combinator. Arity 1, returns native Response. |
| serve.js | `serve(root)` — static file serving effect. Remainder params reconstruct file path, MIME detection, Deno.open().readable streaming. |
| analyzer.js | `Trace` class + `trace(name)` / `mark(name)` middleware. Trace collects named spans via `begin(name)`/`end(name)`, exposes `timing` getter for Server-Timing header. `trace()` creates `ctx.trace`, `mark()` adds checkpoints. Effects use `ctx.trace?.begin/end` for ad-hoc spans. HTTP shape injects Server-Timing header from `ctx.trace.timing`. Universal — works across all shape surfaces (http, object, proxy, agentic, subscriber). Extension point for OTel: `begin(name, attrs)` when `@opentelemetry/api` is added later. |
| datamap.js | Three composable shards, each returning an Aperture (compose via `.slurp()`): `repository(repo)` — CRUD routes (find, findOne, findOneOrFail, findAndCount, count, create, upsert, ensure, update, remove) with options sanitization whitelist. `reactive(repo, twitch)` — opens entity event handlers on a twitch Vector, creates Broadcaster + `/subscribe` SSE endpoint. `ingest(repo)` — `/ingest` POST endpoint consuming incoming SSE via `ctx.request.subscribe()`, applies create/update/delete to repo. Plus: `scope(ctx => patch)` — middleware setting `ctx.scope`. `errors()` — middleware translating MikroORM exceptions to HTTP status codes + `{code}` bodies. Entity name normalization: `getEntityName().toLowerCase().replace("entity", "")`. Two client-side functions: `strip(metadata)` — projects ORM metadata into a client-consumable schema (entity names normalized, only relation properties: m:1, 1:m, m:n, skips scalars/embedded/abstract/pivot). `wire(entities, schema)` — takes an object of RemoteRepositories + a schema from strip, wires `_stores` on each repo so `_hydrate` resolves cross-repo relations automatically. |

### steer/ — Routing Operations

| File | Contents |
|------|---------|
| traverse.js | `traverse(vector, signals)` — walks Vector trie matching Signal segments against Patterns. Returns `[effect, carry, steps, position]`. Handles literal, parameter, wildcard, and remainder match types. Accumulates middleware via `middleware.chain`. |
| walk.js | `walk(vector, more)` — interactive traversal. Calls `more(patterns)` for each position, advances until effect found. Max 20 steps (Long error). |
| invoke.js | `invoke(vector, signal, execute)` — one-shot: traverse + execute. Returns curried `async (input) => output`. |
| match.js | `scope(vector, signal)` — collects all matching trajectories + effects. `greedy(vector, signal)` — first match wins. `resolve(matches, signal)` — picks best match (trajectory if more signals, effect if last). |
| shotgun.js | Three multi-effect steer controllers: `shotgun(vector, signal)` — fires effects at EVERY level during traversal (hits everything along the way). `shine(vector, signal)` — fires only direct hits at the terminal node (precise targeting). `spray(vector, signal)` — navigates to position via signal, then harvests ALL effects in entire subtree below. All share `steer.strategy` from invoke, return arrays of `async (input) => output`. |
| spread.js | `spread(vector, signals)` — flatMap scope across multiple signals at one level. Returns array of `{effect, carry, steps, match}`. Preserved behavior from old shotgun. |

### shape/ — Vector Compilation Targets

| File | Contents |
|------|---------|
| http.js | `http(vector)` — compiles Vector to `async (Request) => Response`. Content-type aware body parsing (JSON only), passes `raw` native Request to Context, native Response passthrough for WebSocket upgrades. Dispatches by effect arity (0/1/2). Injects `Server-Timing` header from `ctx.trace.timing` when analyzer trace middleware is active. |
| object.js | `object(vector)` — compiles Vector to nested JS object. `proxy(vector)` — compiles to Proxy with dynamic property access for lazy traversal. Both use `strategy(apply, effect)` for middleware composition. |
| agentic.js | `Agentic` class — compiles Vector into LLM tool definitions. Walks effects/trajectories, generates tool names from paths, registers `execute` functions via `steer.invoke`. Produces `.tools` map and `.llmstxt` documentation string. |
| subscriber.js | `subscriber(vector)` — function returning MikroORM-conforming POJO. When entity events fire, builds Signal from entity name + event type (e.g. `"literal/create/after"`), uses `steer.shine` to fire ALL matching effects at terminal. `getSubscribedEntities()` returns `[]` — MikroORM fires all events regardless, Signal routing handles filtering. Registered once on EM, Vector populated over daemon lifecycle. |

## Schematics

TypeBox validation schemas. 7 files, 346 lines total.

| File | Lines | Defines |
|------|-------|---------|
| scalars/index.js | 34 | Slug (pattern), ID, JWTToken (pattern), Timestamp (ISO 8601), Username, Password |
| prototypes/index.js | 22 | StatusCode (union of literals), Status (with Timestamp), ErrorResponse |
| primitives/auth.js | 66 | Login, register, token schemas |
| primitives/production.js | 44 | Production Request, Result, Condition, Status enums |
| prototypes/scope.js | 0 | Empty placeholder |

## Specimen

`specimen/index.js` (13 lines)

Re-exports from `@std/testing/bdd` (describe, it, beforeEach), `@std/assert` (assert, assertEquals), and `@std/expect` (expect). Adds custom `is` object with typology-specific assertions like `is.Path(thing)`.

Current state: thin ergonomic wrapper. Future vision: lifecycle-driven BDD framework composed via Vector, with gestalt-valence duality as the testing paradigm.

## Tests

All tests use specimen's describe/it pattern with construction → gestalt → valences structure.

| File | Tests |
|------|-------|
| signature.test.js | Signature construction, trace/gauges hierarchy, Pattern matching, Signal handling |
| production.test.js | ProductionRequest (batch, stock, demand, satisfiedBy), ProductionResult (conditions, status), recalls |
| agent.test.js | Agent construction, context accumulation, input/output validation, generate/do |
| path.test.js | Path normalization, branching, filename/dirname extraction |
| connection.test.js | Connection construction, middleware, branching, subscribe() SSE, publish() upstream SSE, websocket() lifecycle |
| response.test.js | Response construction, stream() (async gen, string encoding, Uint8Array passthrough, chaining), publish() (SSE framing, headers, concatenation) |
| agent.integration.test.js | Agent + brain integration, mock brain, full workflows |
| classifier.test.js | Classifier parsing — **tests dead code** |
| lookup.test.js | Lookup query parsing (string → {owner, type, slug}) |
| url.test.js | URL parsing, branching, origin/pathname |
| context.test.js | Context construction, input/output aliases to request.body/response.body |
| freight.test.js | Freight construction, index (directory scan, MIME detection, recursion), resolve (path/slug lookup), catalog (keys, URLs) |
| middleware.test.js | Carry compose (execution order, shared context, empty array), chain (two middleware functions) |
| request.test.js | Request construction, headers, clone |
| vector.test.js | Vector construction, open, branch, middleware accumulation, slurp |
| aperture.test.js | Aperture method dispatch (GET/POST/PUT), 405, open+method fallback, branching, middleware, params |
| shape/http.test.js | HTTP shape: simple routes, middleware+params, response types, re-entrant calls, wildcards, remainders, SSE (publish), upload streams, method dispatch, native Response passthrough, static file serving, Connection integration (fetcher + inline) |
| shape/object.test.js | Object shape: strategy, nested compilation, proxy access |
| steer/traverse.test.js | Traverse: literal, parameter, wildcard matching, middleware accumulation |
| steer/match.test.js | Scope, greedy, resolve match strategies |
| steer/walk.test.js | Interactive walk with signal provider |
| steer/invoke.test.js | One-shot invoke with params |
| shards/cors.test.js | CORS: preflight 204, origin allowlist, header reflection |
| shards/websocket.test.js | WebSocket: shape (arity, flag), lifecycle (echo test over real connection) |
| shards/serve.test.js | Static serving: MIME detection, HTML/JS/binary/404 via temp files |
| shards/analyzer.test.js | Trace begin/end/timing, trace() middleware (Server-Timing header), mark() named checkpoints, mark without trace safety, ad-hoc begin/end in effects, branch-level mark isolation |
| broadcaster.test.js | Standalone Broadcaster tests (9): push, filter, empty filter, unsubscribe, multiple subscribers, closed no-op, timeout, queue ordering, cleanup |
| repository.test.js | Standalone RemoteRepository tests (29): CRUD over inline transport (10), prototype wrapping (2), store identity — merge/upsert/drop (4), offline mode — no connection (3), cross-repo hydration — m:1, 1:m, schema edge cases (4) |
| shards/datamap.test.js | Shard tests (38 steps): repository CRUD (11), scope injection (2), error handling (2), reactive twitch effects (1), ingest via SSE stream (4), strip schema projection (6), wire relation stores + cross-repo hydration + prototype wrapping (5). Ingest tested via direct shape.http handler with streaming native Request (inline transport can't handle SSE). |
| shards/datamap.integration.test.js | Full E2E over real Deno.serve (10): CRUD over HTTP (1), reactive SSE subscriptions — create/update/delete/multi-entity (4), RemoteRepository CRUD over HTTP (1), RemoteRepository.subscribe drives nanostore (1). Tests the full flow: entity mutate → MikroORM event → shape.subscriber → steer.shine → twitch Vector → reactive handler → Broadcaster → SSE → Connection.subscribe → RemoteRepository.$entities. |

## Where Used

These stubs should be populated as you trace dependencies through the system.

- **Runtime**: Die extends Wafer. `shape.http(aperture)` compiles routes. `shard.datamap.repository()` + `.reactive()` + `.scope()` wire entity CRUD routes. `shard.transport.inline()` for daemon internal Connection. `shape.subscriber(twitch)` routes ORM events via Vector. Mode/Intent entities drive daemon composition. Runtime scenarios (`@vivalence/runtime/scenarios`) import typology entities and the Mode prototype.
- **Paladin**: Wafer is the base lifecycle container. Seek resolves entity references during populate. Status tracks daemon state.
- **Registry**: Mode manifests (.viva.js) declare traits from Mode.Traits enum. Literal/Symbol entities populated from topology datasets. Modes use Vector/Aperture for routing.
- **Client**: Connection prototype drives server communication (including subscribe/websocket). mod.client.js is the entry point — gestalten + prototypes (client subset) + trait.

## Dependencies

Imports from @vivalence/shared (still referenced despite planned removal):
- `hash` — used in Signature, Pattern, Signal, Path, Action, Url, Issue (7 files)
- `validators` — used in Agent (AJV compilation)
- `obj` — used in Agent (stripNulls, merge)

External: @mikro-orm/core (entities), @sinclair/typebox (schematics), nanostores (Connection, Status), @std/testing/* (specimen).

## Work Packages

### Testing Gaps
- classifier.test.js tests dead code (Classifier/Feature only in bak/) — should be moved to bak or deleted
- production.test.js — production system in flux, tests may be outdated
- Missing: entity trait system tests (defineTrait, applyTraits, composeSubscriber)
- Missing: gestalt belt coverage (12 modules with no dedicated tests)
- Missing: Remedy/RemedyHandler integration tests
- Missing: schematics validation tests
- Missing: agentic shape tests
- Missing: steer shotgun/shine/spray unit tests (tested indirectly via datamap reactive + integration)

### Human Documentation Needs (Divio)
- **Reference**: Complete API surface for Signature hierarchy — method signatures, coercion rules, property contracts
- **Explanation**: Why the coercion system, why hash-based identity, why trace/gauges tree structure
- **Tutorial**: "Build a custom prototype extending Signature" — walk through the coercion system
- **How-to**: "Add a new entity type" — BaseEntity vs DataEntity vs VirtualEntity, trait attachment, schema definition

### Active Work
- Asset entity type incoming (VERBALIZED trait on literals, mp3 vocalization)
- @vivalence/shared removal — belt re-exports need migration (hash used in 7 prototype files)
- Production system in flux — ProductionRequest/Result may change
- Cortex primitives (Turn, Part shapes) may land in typology as gestalten or lightweight prototypes — see [cortex.workpackage.org](../../.ikiro/cortex.workpackage.org)
- ~~Buffer/Intent entity migration~~ DONE — see root ikiro
- Datamap shard + client entity migration — see [datamap-client-migration.workpackage.org](../../systems/html/.ikiro/datamap-client-migration.workpackage.org) — ~~Phase A (runtime)~~ DONE. ~~Phase D server-side (lighthouse)~~ DONE. ~~Phase C schema projection~~ DONE (`strip` + `wire` in datamap.js). Client (B) and reactive E2E (E) next. Runtime scenario has `/datamap` endpoint. Client tests at `systems/html/tests/scenario/daemon.test.js` verify prototype wrapping, cross-repo hydration through wired stores, and authed session creation — all importing from `@vivalence/runtime/scenarios`.
- **Known issue: _upsert cascade overwrite** — when mode.find() returns a mode with intents from the EM identity map (unpopulated symbols = `[]`), the cascading `_hydrate` merges those intents into the intent store, overwriting previously-populated `symbols: [...]` with `[]`. Fixed with a heuristic: `_upsert` now skips overwriting non-empty arrays with empty ones. A proper solution needs smarter merge strategy (like Apollo's normalized cache) or avoiding hydration of unpopulated relations. The MikroORM EM identity map also caches entities without re-populating on subsequent find+populate calls.

### Completed
- ~~Vector merge~~ — Vector, Aperture, steer, shape, shards absorbed into typology. `subsystems/vector/` deleted. All consumers rewritten to `@vivalence/typology`.
- ~~HTTP feature surface~~ — Response.stream/publish, Request.stream/subscribe, websocket shard, serve shard, Connection.subscribe/publish/websocket. Full test coverage.
- ~~Transport rename: events→publish~~ — Response.events() renamed to Response.publish(). New Request.subscribe() for server-side SSE consumption. New Connection.publish() for client-side upstream SSE streaming.
- response.test.js expanded from 11 lines to full stream/publish coverage
- ~~Analyzer shard~~ — `Trace` class, `trace()`/`mark()` middleware, Server-Timing header injection in http shape. Universal across all shape surfaces. Extension point for OTel.

### Planned Changes
- Specimen evolution into lifecycle-driven BDD framework
- Note entity type (persistent cross-session state)

### Transport Surface (Complete)

The transport layer is now complete across three primitives:

| Primitive | Server (Response/Request) | Client (Connection) | Shard |
|-----------|---------------------------|---------------------|-------|
| **stream** (raw) | Response.stream(asyncIterable), Request.stream() | — | — |
| **publish/subscribe** (SSE) | Response.publish(asyncIterable) | Connection.subscribe(endpoint) consumes, Connection.publish(endpoint, source) sends | — |
| **subscribe** (SSE incoming) | Request.subscribe() async generator | — | — |
| **websocket** (bidirectional) | — | Connection.websocket(endpoint) | shard.websocket(handler) for upgrade |

Future transport primitives (deferred): WebRTC (peer-to-peer media), WebTransport (QUIC-based bidirectional).

### Dead Code Flags
- **Classifier** (143 lines) + its test (134 lines): only in bak code
- **Mask** (33 lines): exported, never imported outside typology
- **Feature**: only in bak
- prototypes/scope.js, mode.js, view.js: placeholders with minimal content

## Maintenance

When you modify typology code:
1. Run tests: `deno task test` in subsystems/typology
2. Check if Signature hierarchy changes affect Pattern/Signal/Vector usage in steer/shape
3. If adding an entity, update entities/index.ts sets and maps
4. If modifying gestalten/is, ensure specimen's custom `is` object stays in sync
5. If touching @vivalence/shared imports, track the migration status
6. Effects can either return a value (assigned to `c.output`) OR configure `ctx.response` directly (e.g. `response.publish()` for SSE). `shape.http` only assigns output when the effect returns non-undefined. Handlers that set up streaming responses should NOT return a value.
7. Tests using native Deno `Response` in a file that imports typology's `Response` must use `globalThis.Response` to avoid shadowing
