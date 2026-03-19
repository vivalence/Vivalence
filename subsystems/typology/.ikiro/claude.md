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
| deno.jsonc | 25 | Package config. Exports: `.`, `./prototypes`, `./schematics`, `./gestalten`, `./entities`, `./specimen` |

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

**Connection** `prototypes/connection.js` (237 lines)
HTTP connection with middleware. `use(fn)` wraps transport, `branch(path)` creates child with extended URL, `fetch(endpoint, body, options)` executes request, `call()` fetch with error throwing, `aim()` curried call. State: nanostores atoms for `$state` (IDLE), `$error`, `$isConnected`, `$isError`.

**Request** `prototypes/request.js` (76 lines)
HTTP request object. Properties: `url` (auto-coerced to Url), `method` (default POST), `headers` (Map), `body`, `query`, `path`, `options` (timeout: 30000, retries: 0, credentials: include), `signal` (lazy AbortController).

**Response** `prototypes/response.js` (63 lines)
HTTP response. Status helpers: `ok` (200-299), `isNetworkError` (0), `isServerError` (500+), `isClientError` (400-499), `isAuthError` (401/403).

**Context** `prototypes/context.js` (17 lines)
Unified request/response container. Wraps Request + Response with alias properties: `input` (get/set → `request.body`), `output` (get/set → `response.body`). Also holds `state: {}` and `params: {}`. Used by the http compiler as the execution context — middleware and effects operate on Context. The same shape used by Connection's transport layer and daemon internal calls.

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

**Other small prototypes:**

| File | Lines | Notes |
|------|-------|-------|
| mode.js | 34 | Placeholder |
| view.js | 52 | Placeholder |
| scope.js | 38 | Placeholder |
| env.js | 56 | Environment config |
| mask.js | 33 | Exported but never imported outside typology — **likely dead** |

**Error types:** BaseError, ConnectionError, ProductionError in prototypes/errors/.

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
Traits enum: VIEWABLE, DATASET, VALENTIC, PRODUCER, CHAOSMONKEY, TOPOGRAPHICAL, BUFFERED. Properties: slug, name, description, type, installed. Relations: valences (1:m), productions (1:m → Product as producer), commissions (1:m → Product as commissioner). Unique by type+slug.

**Valence** `entities/daemon/Valence.ts` (75 lines) extends DataEntity
Type enum (SELFEVIDENT, APPLICATIVE), Traits (BUFFERED, PRODUCTIVE). Properties: slug, name, description, type, docs. Mode relation (m:1, eager). Unique by slug+mode.

### Userspace Entities

**Product** `entities/userspace/Product.ts` (105 lines) extends BaseEntity
Traits (BUFFERED, SIGNAL), Status enum (PENDING, ACTIVE, DONE, ERROR, STALE). Properties: data (JSON), position (number). Relations: producer (m:1 Mode), commissioner (m:1 Mode), session (m:1 Session), literals (m:n), symbols (m:n). Abstract schema.

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

Conversion functions: `viva`, `runtime`, `lookup`, `match(steps)` (extracts `.parameters` from traverse step array — used by http compiler for route params), `params(params)` (reconstructs `.path` from numeric remainder params — used by view/freight serving).

### belt/ — Utility Collections (12 modules)

| File | Lines | Contents |
|------|-------|---------|
| array.js | 40 | groupBy, chunk, unique, flatten |
| crypto.js | 6 | Crypto wrappers |
| fn.js | 23 | compose, pipe, once, debounce |
| hash.js | 14 | Hash generation |
| id.js | 20 | UUID generation/validation |
| object.js | 211 | Deep merge, clone, path set/get, diff |
| promise.js | 59 | all, race, retry, timeout |
| random.js | 105 | Random number/choice |
| sleep.js | 8 | Sleep utility |
| sort.js | 12 | Sorting |
| strings.js | 3 | String utilities |
| time.js | 14 | Time utilities |

### shard/ — Network Primitives (6 modules)

| File | Lines | Contents |
|------|-------|---------|
| connection.js | 76 | Connection shard middleware |
| context.js | 7 | Context extraction |
| patterns.js | 1 | Pattern definitions |
| request.js | 7 | Request handling |
| secure.js | 120 | Security middleware (JWT) |
| transporter.js | 120 | `fetcher` — HTTP fetch transport. `inline(serve)` — bridges Connection ctx ↔ native `(Request)=>Response` handler without HTTP. Used by runtime for daemon internal Connection. |

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

| File | Lines | Tests |
|------|-------|-------|
| signature.test.js | 445 | Signature construction, trace/gauges hierarchy, Pattern matching, Signal handling |
| production.test.js | 355 | ProductionRequest (batch, stock, demand, satisfiedBy), ProductionResult (conditions, status), recalls |
| agent.test.js | 224 | Agent construction, context accumulation, input/output validation, generate/do |
| path.test.js | 219 | Path normalization, branching, filename/dirname extraction |
| connection.test.js | 218 | Connection construction, middleware chaining, branching, URL extension, errors |
| agent.integration.test.js | 183 | Agent + brain integration, mock brain, full workflows |
| classifier.test.js | 134 | Classifier parsing, Feature caching — **tests dead code** |
| lookup.test.js | 65 | Lookup query parsing (string → {owner, type, slug}) |
| url.test.js | 37 | URL parsing, branching, origin/pathname |
| request.test.js | 26 | Request construction, headers, clone |
| response.test.js | 11 | Response status checks |

Total: ~1,917 lines of tests.

## Where Used

These stubs should be populated as you trace dependencies through the system.

- **Vector**: Pattern and Signal are the core routing types. Vector.branch creates Patterns; traverse matches Signals against Patterns. Url used in aperture compilation.
- **Paladin**: Wafer is the base lifecycle container. Seek resolves entity references during populate. Status tracks daemon state.
- **Runtime**: Die extends Wafer. Entities are managed via MikroORM. Mode/Valence entities drive daemon composition. Trait system applied during daemon lifecycle.
- **Registry**: Mode manifests (.viva.js) declare traits from Mode.Traits enum. Literal/Symbol entities populated from topology datasets.
- **Client**: Connection prototype drives server communication. mod.client.js is the entry point — gestalten + prototypes (client subset) + trait.

## Dependencies

Imports from @vivalence/shared (still referenced despite planned removal):
- `hash` — used in Signature, Pattern, Signal, Path, Action, Url, Issue (7 files)
- `validators` — used in Agent (AJV compilation)
- `obj` — used in Agent (stripNulls, merge)

External: @mikro-orm/core (entities), @sinclair/typebox (schematics), nanostores (Connection, Status), @std/testing/* (specimen).

## Work Packages

### Testing Gaps
- classifier.test.js tests dead code (Classifier/Feature only in bak/) — should be moved to bak or deleted
- agent.integration.test.js may reference removed @vivalence/shared patterns — verify
- production.test.js — production system in flux, tests may be outdated
- Missing: entity trait system tests (defineTrait, applyTraits, composeSubscriber)
- Missing: gestalt belt/shard coverage (12+6 modules with no dedicated tests)
- Missing: Remedy/RemedyHandler integration tests
- Missing: schematics validation tests
- response.test.js extremely thin (11 lines)

### Human Documentation Needs (Divio)
- **Reference**: Complete API surface for Signature hierarchy — method signatures, coercion rules, property contracts
- **Explanation**: Why the coercion system, why hash-based identity, why trace/gauges tree structure
- **Tutorial**: "Build a custom prototype extending Signature" — walk through the coercion system
- **How-to**: "Add a new entity type" — BaseEntity vs DataEntity vs VirtualEntity, trait attachment, schema definition

### Active Work
- Vector merge planned — typology will absorb vector
- Asset entity type incoming (VERBALIZED trait on literals, mp3 vocalization)
- @vivalence/shared removal — belt re-exports need migration (hash used in 7 prototype files)
- Production system in flux — ProductionRequest/Result may change

### Planned Changes
- Specimen evolution into lifecycle-driven BDD framework
- Note entity type (persistent cross-session state)

### Dead Code Flags
- **Classifier** (143 lines) + its test (134 lines): only in bak code
- **Mask** (33 lines): exported, never imported outside typology
- **Feature**: only in bak
- prototypes/scope.js, mode.js, view.js: placeholders with minimal content

## Maintenance

When you modify typology code:
1. Run tests: `deno task test` in subsystems/typology
2. Check if Signature hierarchy changes affect Vector's Pattern/Signal usage
3. If adding an entity, update entities/index.ts sets and maps
4. If modifying gestalten/is, ensure specimen's custom `is` object stays in sync
5. If touching @vivalence/shared imports, track the migration status
