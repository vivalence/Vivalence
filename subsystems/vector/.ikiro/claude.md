> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# Vector

> Routing trie. Takes Pattern and Signal from typology, makes them executable.

## Role

Engine. Vector trees route signals through patterns to effects. Middleware accumulates as you traverse. Compiles to HTTP routes (Aperture → Oak), LLM tool specs (Agentic), or callable objects (Object compiler). The entire routing system is ~150 lines of procedural code operating on typology's Signature hierarchy.

Planned: merge into typology. Aperture becomes a Vector compiler, not a standalone system.

## Entry Points

| File | Lines | Purpose |
|------|-------|---------|
| mod.js | 8 | Root export — prototypes, controller, compiler, shards |
| deno.jsonc | 22 | Exports: `.`, `./typology`, `./controller`, `./compiler`, `./shards`, `./aperture` |
| typology.js | 1 | Re-exports prototypes (Vector, errors, Context) |

## Architecture

### Vector Class

`prototypes/vector.js` (76 lines)

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

Six functions plus carry primitives.

**carry** `controller/carry.js`
Middleware composition primitives. `compose(middleware[])` — Koa-style threading with double-call protection. `chain(first, second)` — combines two middleware functions. `forward` — identity pass-through. `standard` — the default carry strategy for the object compiler: creates `{ input }` context, writes `ctx.output`, returns it.

These are now shared by both controllers and compilers. `standard` is the canonical `(apply, effect) => callable` strategy pattern.

**traverse** `controller/traverse.js`
Single-signal tree walk. Returns `[effect, carry, steps, position]`. Uses `resolve(scope(position, signal), signal)` for match disambiguation — extracted to match.js for clarity.

**walk** `controller/walk.js`
Async iterator-driven traversal. Loops while `position.patterns.length` (enters for effects-only vectors, not just trajectories). Calls `more(position.patterns)` to request next Signal. 20-step limit (throws Long). Calls traverse internally for each step.

**invoke** `controller/invoke.js` (13 lines)
Single-shot wrapper. Coerces to Signal, calls traverse, throws NotFound if no effect, runs middleware stack → effect, returns `context.effect`.

**match** `controller/match.js`
Three functions: `scope()` collects all matches (trajectories first, then effects). `greedy()` returns first match (effects first). `resolve(matches, signal)` disambiguates: single match → use it, two matches → prefer trajectory when signal has heir, prefer effect when exhausted. Throws NotFound on empty. Used by traverse.

**shotgun** `controller/shotgun.js`
Bulk routing. Flattens all matches across multiple signals via scope, pre-composes carry, returns array of `{effect, carry, steps, match}` route objects.

### Compilers

**Object** `compiler/object.js` (~20 lines)
Compiles Vector → nested callable object. `compile(vector, carry = strategy)` does DFS: trajectories become nested objects, effects become async functions. The `carry` parameter is a strategy function `(apply, effect) => callable` that controls context creation, effect application, and result extraction.

The strategy wraps itself at each branch to accumulate middleware — no explicit ancestor parameter. If a vector node has carry (middleware), the child's strategy becomes `(apply, effect) => parentStrategy(compose([...vector.carry, apply]), effect)`. This threads middleware through the strategy itself rather than alongside it.

`ctx.input` / `ctx.output` follow the Aperture contract. The compiled object is a peer to Aperture — same context shape, different compilation target (callable object vs HTTP routes).

Branch/effect collision: if a pattern appears in both trajectories and effects, the effect function gets the trajectory's nested properties via `Object.assign(fn, existingObject)`.

**Agentic** `compiler/agentic.js`
Converts Vector → LLM tool definitions. DFS compile walks the tree, normalizing paths ("/api/users" → "api_users"). Each effect becomes a tool with `execute` closure that calls `controller.invoke`. Reads `pattern.valence`, `pattern.input`, `pattern.output` for LLM descriptions. Generates `llmstxt` markdown.

**Subscriber** `compiler/subscriber.js` (56 lines)
ORM event → Signal mapper. Extracts entity name from constructor ("UserEntity" → "user"), creates `Signal([entity, event])`. Event hooks: onInit, onLoad, afterCreate, beforeCreate, afterUpdate, beforeUpdate. Gracefully ignores NOT_FOUND.

**Aperture** `compiler/aperture/` (~300 lines total)
Oak HTTP router DSL. `open(path, handler)` registers with arity dispatch (0/1/2 params). `branch(path)` nests. `compose()` for direct invocation, `serve()` for Oak HTTP. Dual-mode parity via handler arity dispatch.

### Shards

| File | Lines | Purpose |
|------|-------|---------|
| patterns.js | 1 | `bonnieblue = () => () => true` — always-match factory |
| caching.js | 62 | `catchAndRelease(id)` — dedup cache with in-flight promise sharing |
| secure.js | 52 | `context(provider)` extracts auth, `authorize(claims[])` validates |
| index.js | 18 | Re-exports: patterns, secure, caching, aperture.status, context.attach |

### Error Types

`prototypes/errors.js`: Long (max steps exceeded), Short (empty signal stream), NotFound (stores signal).

## Key Patterns

### The Strategy Pattern (carry)

The object compiler's `carry` parameter is `(apply, effect) => callable`. This single function controls:
1. Context creation from input
2. How the effect is applied to context
3. How the result is extracted

The default `standard` strategy: creates `{ input }` context, runs `apply(ctx, terminal)`, returns `ctx.output`. Custom strategies enable different context shapes without changing the compiler.

The strategy wraps itself during tree descent to accumulate middleware — eliminating the need for explicit ancestor tracking. This is the "profunctor" pattern: pack (input→ctx) + through (ctx,effect→ctx) + unpack (ctx→result) collapsed into one function.

### Middleware imports from typology

Controllers and compilers import middleware primitives from `@vivalence/typology` via `import { middleware } from "@vivalence/typology"`, accessing `middleware.compose`, `middleware.chain`, `middleware.forward`. The controller/carry.js file is the source, re-exported through typology.

## Tests

All tests use specimen pattern (BDD via `@vivalence/typology`). Run with `deno test --no-check --allow-all`.

| File | Steps | Coverage |
|------|-------|----------|
| vector.test.js | 9 | construction, branch (hash merging), open (decomposition), use (carry isolation) |
| carry.test.js | 7 | compose (ordering, context sharing, empty), chain, forward, standard |
| controller/match.test.js | 11 | scope (trajectories, effects, both, empty), greedy (first match, priority, empty), resolve (single, empty throw, heir preference, exhausted preference) |
| controller/traverse.test.js | 5 | effect finding, nested descendants, carry accumulation, NotFound, null effect on trajectory-only |
| controller/invoke.test.js | 5 | invocation, context passing, middleware, path/signal on context, NotFound |
| controller/walk.test.js | 3 | single step, no-heir effects, middleware carry |
| compiler/object.test.js | 13 | flat effects, branching (nested, deep, siblings), middleware (wrapping, accumulation, context flow, custom strategy, strategy+branch composition) |
| compiler/aperture-oak.test.js | 29 | compose + serve + dual-mode parity + context contract |

## Where Used

- **Runtime**: Aperture compiles daemon routes to Oak. invoke() handles request dispatch. Subscriber maps ORM events to Signals for entity lifecycle hooks.
- **Paladin**: Configures Vector trees during daemon composition. Attaches mode routes via branch/open.
- **Registry/Modes**: Each mode registers its routes via Vector patterns.
- **Agent**: Agentic compiler generates LLM tool specs from Vector trees.
- **Typology**: Pattern and Signal are typology types consumed here. Middleware primitives (compose, chain, forward, standard) are re-exported through typology.

## Dependencies

From typology: Pattern, Signal, Signature, Path, Url, middleware primitives.
External: Oak (HTTP framework, used by Aperture).

## Work Packages

### Testing Gaps
- No tests for shotgun.js (bulk routing)
- No tests for Agentic compiler (LLM tool generation)
- No tests for Subscriber (ORM event → Signal mapping)
- No tests for shards (caching, secure, patterns)
- traverse: remainder handling, early exit on effect+trajectory conflict
- walk: multi-step navigation (signal refresh issue — walk doesn't reset signal between steps, so multi-step interactive traversal doesn't work as expected)

### Known Issues
- traverse remainder increment bug: `match.params` and `match.parameters` get different keys due to double `remainder++` (lines 25-26)
- walk signal refresh: after the first traverse call, `signal` retains its `.nature`, so `more()` is never called again for subsequent steps. Multi-step interactive walks don't work correctly.

### Active Work
- Object compiler: `mode.produce.[xyz]()` pattern — compiles Vector to callable object with strategy-driven context
- Proxy compiler planned: extends object compiler with parameter/wildcard support via Proxy
- Aperture migration: move from direct Oak routing to Vector → Oak compilation
- Merge into typology planned

### Human Documentation Needs (Divio)
- **Tutorial**: "Route your first signal through a vector" — walk through branch/open/invoke
- **Explanation**: "How traverse walks two trees in parallel" — the core insight of the system
- **Explanation**: "The strategy pattern" — how (apply, effect) => callable enables compiler polymorphism
- **Reference**: Complete controller API with signatures and return types
- **How-to**: "Compile a Vector to Oak routes" — Aperture usage, dual-mode setup
- **How-to**: "Build a custom compiler strategy" — context control via carry parameter

## Maintenance

When you modify vector code:
1. Run tests: `deno test --no-check --allow-all` in subsystems/vector
2. aperture-oak.test.js is the integration anchor — if routing changes, verify dual-mode parity
3. If modifying traverse, check that carry composition order is preserved
4. If adding a compiler, follow the object compiler pattern — strategy function `(apply, effect) => callable`
5. Note: planned merge into typology — avoid deepening the package boundary
6. Middleware primitives live in controller/carry.js but are consumed via `@vivalence/typology` middleware namespace
