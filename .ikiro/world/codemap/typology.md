---
paths: ["subsystems/typology/**", "systems/runtime/**", "systems/anima/**", "systems/ghost/**"]
---
<!-- writer: agent · limit: 2350 chars · traps only · paths relative to subsystems/typology -->
# codemap: typology — HOLY; ask before touching core types

- **`branch()` MUTATES the parent; `#hash` is memoized** — never reuse a branched Path; `new Path(p)` is the SAME instance. `branch(p, v)` ATTACHES (live), `graft(v)` COPIES (frozen); `open()` silently REPLACES; `.root` only when the chain ends inside a `.branch()`. - **a Signal is `{ nature, body, flags }`**; `ToolCall` = the spine joined `_`. Dispatch is ONE shape: `steer.dispatch.invoke(vector, signal, steer.strategy.guarded)(input)`. Literals before `:params`; `use` wraps DESCENDANTS in dispatch, its own effect in `shape.object`; `fire` dispatches on ARITY. Only `guarded` validates and fills `.default`s — an HTTP aperture call does neither.
- **every effect returns `{condition, output}`**; `output` = `message?` · `object?` · one SINGULAR key per entity type. **ctx is FLAT**: the `contexts.host` words, never `ctx.daemon`; `host` is the set's NAME.
- **STRIPWIRE** — `shape.object(v)` ⟷ `shape.connection.wire(conn, shape.strip(v))`. Verbs `call · stream · publish · converse`; `subscribe` reconnects itself; never raw `fetch` over a Connection; `Socket.feed` is TEXT only.
- **cortex**: a hallucination REQUIRES a `controller`; tune is POSITIONAL; `choice` options are bounded BY HAND; a round's tool calls run SERIALLY on ONE em fork.
- **`v` (typebox@1.3)**: never spread a schema; no zod verbs; `cast` = Default+Convert for request INPUT only, `fill` = Default only; `.default(x)` alone makes a field REQUIRED on the wire; `Value.Decode` MUTATES — once. Relations are THUNKS; a cycle comes back FLAT.
- **no eval-time Vector/`v` construction inside typology** — memoized thunk `schema ??=`. Modules import their owners, never the barrel; the signature core reads `is/scalars.js` ONLY (TDZ). `mod.client.js` keeps mikro off the browser; buffer-views import ONLY it.
- `App` declares sources by mime → `Bundle`, `load(accept)` negotiates. `bundle/svelte.js` blanks a `<style>` holding `:global { }` — write `:global(sel)`. `reactive(…)` throws on a null owner; `scoped()` NARROWS. `Literal.symbol` is a facet tree: read `literal.ontology`. `pluck` drops `undefined`.
