# Vector

> Routing trie. Takes Pattern and Signal from typology, makes them executable.

## Role

Engine. Vector trees route signals through patterns to effects. Middleware accumulates as you traverse. Compiles to HTTP routes (Aperture → Oak) or LLM tool specs (Agentic). The entire routing system is ~150 lines of procedural code operating on typology's Signature hierarchy.

Planned: merge into typology. Aperture becomes a Vector compiler, not a standalone system.

## Entry Points

| File | Lines | Purpose |
|------|-------|---------|
| mod.js | 8 | Root export — prototypes, controller, compiler, shards |
| deno.jsonc | 22 | Exports: `.`, `./typology`, `./controller`, `./compiler`, `./shards`, `./aperture` |
| typology.js | 1 | Re-exports prototypes (Vector, errors, Context) |

## Architecture

### Vector Class

`prototypes/vector.js` (106 lines)

Two Maps drive everything:
- `effects: Map<Pattern, Effect>` — terminal handlers (leaves)
- `trajectories: Map<Pattern, Vector>` — branch descendants (interior nodes)
- `carry: []` — middleware stack at this node
- `ancestor: Vector?` — parent reference
- `signature: Signature` — Pattern class (configurable)

**branch(signature)** — Hash-memoized descendant navigation. Creates Pattern from signature, searches trajectories by `pattern.hash` (not object reference). If found, reuses existing Vector. If not, creates new Vector and stores it. Recurses via `pattern.heir` for multi-segment paths.

**open(signature, effect)** — Registers effect handler. If pattern has heir (multi-segment), decomposes via branch then sets effect at the leaf (pops fin segment). Otherwise registers at current level.

**withSignature(signature)** — Sets pattern type for the tree.

**use(middleware)** — Pushes to carry[].

**set(vector)** — Merges effects, trajectories, carry from another Vector.

Properties: `patterns` (all Pattern keys), `descendants` (trajectory values), `heir` (first descendant).

### Controller

Six functions. Total ~153 lines. This is where the power lives.

**traverse** `controller/traverse.js` (47 lines)
Single-signal tree walk. Returns `[effect, carry, steps, position]`.

Walks `signal.array` (segments), at each position calls `scope()` to find all matching patterns. Match resolution: if 1 match, use it. If 2 matches — prefer trajectory when signal continues, prefer effect when signal exhausted. Chains middleware from each position via `chain(carry, compose(position.carry))`. Remainder patterns get enumerated params.

This is the core insight: parallel walk through two trees (Pattern tree and Signal tree) simultaneously, accumulating middleware.

**compose** `controller/carry.js` (32 lines)
Koa-style middleware composition. `compose(middleware[])` returns a function that threads the array with double-call protection (`next() called multiple times` error). `chain(first, second)` combines two middleware functions. `forward` is the identity (pass-through).

27 lines enables arbitrary middleware stacking across the entire routing tree.

**walk** `controller/walk.js` (24 lines)
Async iterator-driven traversal. Loops while `position.heir` exists, calls `more(position.patterns)` to request next Signal (async — the caller decides what signal to feed next). 20-step limit (throws Long). Calls traverse internally for each step. Returns `[effect, carry, steps, trajectory]`.

**invoke** `controller/invoke.js` (13 lines)
Single-shot wrapper. Coerces to Signal, calls traverse, throws NotFound if no effect, runs middleware stack → effect, returns `context.effect`.

**match** `controller/match.js` (29 lines)
Two strategies: `greedy()` returns first match (effects before trajectories), `scope()` collects all matches (trajectories first, then effects). traverse uses scope for rich match resolution.

**shotgun** `controller/shotgun.js` (31 lines)
Bulk routing. Flattens all matches across multiple signals via scope, pre-composes carry, returns array of `{effect, carry, steps, match}` route objects.

### Compilers

**Agentic** `compiler/agentic.js` (161 lines)
Converts Vector → LLM tool definitions. DFS compile walks the tree, normalizing paths ("/api/users" → "api_users"). Each effect becomes a tool with `execute` closure that calls `controller.invoke`. Reads `pattern.valence`, `pattern.input`, `pattern.output` for LLM descriptions. Generates `llmstxt` markdown documenting the tool tree.

**Subscriber** `compiler/subscriber.js` (56 lines)
ORM event → Signal mapper. Extracts entity name from constructor ("UserEntity" → "user"), creates `Signal([entity, event])`. Event hooks: onInit, onLoad, afterCreate, beforeCreate, afterUpdate, beforeUpdate. Gracefully ignores NOT_FOUND (routes without handlers).

**Aperture** `compiler/aperture/` (306 lines total)
Oak HTTP router DSL. Five files:

`aperture.ts` (105 lines) — `Aperture` class. `open(path, handler)` registers HTTP handler with arity dispatch (0/1/2 params → different context binding). `branch(path)` creates nested namespace. `slurp(aperture)` absorbs another Aperture. `compose(force?)` generates middleware stack (cached). `serve(router)` registers into Oak Router. `json` getter for structure inspection.

`index.ts` (28 lines) — Factory: `create(options)` and `context(path, body, params)` for test contexts.

`path.ts` (13 lines) — Simple path wrapper with ancestor chain.

`mw.js` (95 lines) — `cors()` (allowed origins: localhost, *.vivalence.com) and `notFound()` 404 handler.

`parser.js` (50 lines) — Request body parsing: GET → query, POST → JSON/object/string.

### Dual-Mode Parity

Aperture enables identical semantics via two modes:
- `compose()` for direct JS invocation (internal/test)
- `serve()` for Oak HTTP integration (production)

Handler arity dispatch makes this work: `handler()` (no args), `handler(ctx)` (full context), `handler(input, ctx)` (destructured). Same handler works in both modes.

### Shards

| File | Lines | Purpose |
|------|-------|---------|
| patterns.js | 1 | `bonnieblue = () => () => true` — always-match factory |
| caching.js | 62 | `catchAndRelease(id)` — dedup cache with in-flight promise sharing |
| secure.js | 52 | `context(provider)` extracts auth, `authorize(claims[])` validates |
| index.js | 18 | Re-exports: patterns, secure, caching, aperture.status, context.attach |

catchAndRelease is notable: hash-based dedup with three paths — cache hit (immediate), in-flight dedup (await existing promise), first caller (execute + cache + resolve waiters).

### Error Types

`prototypes/errors.js` (21 lines): Long (max steps exceeded), Short (empty signal stream), NotFound (stores signal).

## Tests

665 total lines across 5 test files. Mix of Deno.test (direct) and describe/it (BDD via specimen).

| File | Lines | Pattern | Coverage |
|------|-------|---------|----------|
| vector.test.js | 82 | Deno.test | Branch creation, hash merging, open() decomposition, carry stacking |
| carry.test.js | 63 | Deno.test | compose execution order, chain, forward identity |
| traverse.test.js | 84 | Deno.test | Effect finding, nested descendants, carry assembly, NotFound |
| walk.test.js | 83 | Deno.test | Single/multi step, middleware composition, Long/Short errors |
| aperture-oak.test.js | 353 | describe/it + HTTP | compose (16 tests) + serve (8 tests) + dual-mode parity (2) + ctx contract (2) + json inspection (1) |

aperture-oak.test.js is the most comprehensive — tests both internal compose and HTTP serve paths, verifying parity. Uses a real Oak server with beforeAll/afterAll lifecycle.

## Where Used

These stubs should be populated as you trace dependencies through the system.

- **Runtime**: Aperture compiles daemon routes to Oak. invoke() handles request dispatch. Subscriber maps ORM events to Signals for entity lifecycle hooks.
- **Paladin**: Configures Vector trees during daemon composition. Attaches mode routes via branch/open.
- **Registry/Modes**: Each mode registers its routes via Vector patterns.
- **Agent**: Agentic compiler generates LLM tool specs from Vector trees.
- **Typology**: Pattern and Signal are typology types consumed here. Planned merge will combine the packages.

## Dependencies

From typology: Pattern, Signal, Signature, Path, Url (core routing types).
External: Oak (HTTP framework, used by Aperture), nanostores (not directly — via typology).

## Work Packages

### Testing Gaps
- No tests for shotgun.js (bulk routing)
- No tests for Agentic compiler (LLM tool generation)
- No tests for Subscriber (ORM event → Signal mapping)
- No tests for match.js (greedy vs scope strategies)
- No tests for invoke.js (single-shot wrapper)
- No tests for shards (caching, secure, patterns)
- traverse.test.js missing: remainder handling, parallel match resolution, early exit on effect+trajectory conflict
- carry.test.js missing: error propagation, context mutation
- walk.test.js missing: signal.nature validation, early termination
- No stress tests (deep trees, concurrent walks)

### Human Documentation Needs (Divio)
- **Tutorial**: "Route your first signal through a vector" — walk through branch/open/invoke
- **Explanation**: "How traverse walks two trees in parallel" — the core insight of the system
- **Reference**: Complete controller API — all six functions with signatures and return types
- **How-to**: "Compile a Vector to Oak routes" — Aperture usage, dual-mode setup

### Active Work
- Aperture migration: move from direct Oak routing to Vector → Oak compilation
- Object/proxy compiler: mode.produce.[xyz]() pattern via Vector
- Merge into typology planned

### Planned Changes
- Vector → typology merge
- Aperture becomes a compiler target, not standalone

## Maintenance

When you modify vector code:
1. Run tests: `deno task test` in subsystems/vector
2. aperture-oak.test.js is the integration anchor — if routing changes, verify dual-mode parity
3. If modifying traverse, check that carry composition order is preserved
4. If adding a compiler, follow the agentic/subscriber pattern (DFS tree walk → output format)
5. Note: planned merge into typology — avoid deepening the package boundary
