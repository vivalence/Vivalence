---
paths: ["subsystems/typology/**", "systems/runtime/**", "systems/kajuit/**", "systems/ghost/**"]
---
<!-- writer: agent · derived-from: 274 files; prototypes; gestalten; schematics; 91 tests; snapshots · verified: 8 probes (arity·use-order·segment-order·cast·enhance·is.vector·strip·span); greps: mikro·Deno.·barrel; tests: 91 files/467 it/16 fixtures, 2 run green · limit: 22000 chars -->
# codemap: typology — the library (HOLY — ask before touching core types)

`readme.org`: *"Less is More, Code is Data, Schema is God."* Canon → [[connoisseur]]. Tree: `prototypes/` 44 files, 57 nouns · `gestalten/` 9 namespaces (`is cast not fromm belt shard steer shape bundle`) · `schematics/` · `specimen/`.

## Signature — the identity spine

- **`subsystems/typology/prototypes/signature.js`** roots Pattern · Path · Url · FilePath · Signal · ToolCall · Span. A subclass declares `static coercions` (`[test, transform]`) and inherits the tree algebra: `heritage()` up, `gauges`/`descendants()` down, `absolute`, `branch`, `pop`.
- **IDENTITY IS COMPUTED ONCE.** `get hash` memoizes into `#hash`; only `from()` clears it. [[project_signature_identity_memo]]
- **`branch()` MUTATES the parent** — it pushes the child into `gauges`. Never reuse a Path you branched: probe printed `new Path("/a")` after `.branch("b").branch("c")` carrying `gauges: ["/b","/c"]`.
- **ADOPTION IS EXCLUSIVE.** Coercing a foreign Signature copies `nature` only — probe: `new Path(new Signature("x"))` → `nature "x"`, the foreign node's `gauges` stayed `0`. Identity, never linkage.
- `Signal` ALSO tokenizes CLI flags (`--k=v`, `-abc`, `--`) onto the LAST segment — ghost dispatches argv as one Signal. `ToolCall` is the same spine joined by `_`: the agentic tool-name grammar.

```js
// subsystems/typology/prototypes/signature.js:38-44,72-74
from(trace, anon = false) {
  this.#hash = null;
  this.trace = trace;
  if (!anon) this.trace?.gauges.push(this);
  return this; }
get hash() { return (this.#hash ??= this.hasher()); }
```

```json
// probe: Signal("mode/install hello --force --at 3").json · Pattern("/mode/:slug/(.*)").json →
{"signal":"/mode/install/hello","parts":["mode","install","hello"],"flags":{"force":true,"at":"3"}}
{"pattern":"/mode/:slug/(.*)","parts":["mode",":slug","(.*)"],"types":["literal","parameter","remainder"]}
```

## Vector — the declaratively dispatched monadic composer

- **`prototypes/vector.js`** — `.open(sig,fn)`/`.use(mw)`/`.branch`/`.slurp` declare effects + middleware against Signature paths. The Vector is INERT until an interpreter folds it (`shape.*` or a `steer` strategy): one structure, many interpreters. ONE `effect` per node; a node may be both leaf and branch. `affect` is `open`'s guarded twin — it refuses a second write.
- The trie is REALIZED: `trie: Map<nature, {pattern, trajectory}>`, O(1) by nature, **declaration order immovable — a collision holds its slot** (`tests/vector.test.js`). LAW: leaf metadata (`input`/`output`/`valence`/`yields`/`feeds`) rides the EDGE — the Pattern — never the Vector node.
- `slurp` SHARES (a collision mints a fresh node merging both sides, keyed by the LATER pattern; neither source mutated) · `swallow` OWNS (recurses into the existing branch). `set()` is deprecated and logs.
- **`is.vector` is dead**: `is/prototypes.js:14` demands `thing.nature`, which no Vector has — probe returned `false` for a root AND a branched Vector; zero consumers. Use `is.Vector`.
- **Aperture** = Vector + a method-keyed leaf fold: `get/post/…` wrap the tip's effect in a `methods()` dispatcher (`fn.methods = map`), 405 on a miss, throw on an ambiguous `"*"`.

```js
// subsystems/typology/prototypes/vector.js:22-42,59-71
branch(signature) {
  const pattern = new this.signature(signature);
  if (pattern.nature == null && !pattern.heir) return this;
  let edge = this.trie.get(pattern.nature);
  if (!edge) this.trie.set(pattern.nature, edge =
    { pattern, trajectory: new this.constructor(this, this.signature) });
  return pattern.heir ? edge.trajectory.branch(pattern.heir) : edge.trajectory; }
open(signature, effect) { this.branch(signature).effect = effect; return this; }
```

## steer — the four interpreters (`match · trie · dispatch · strategy`)

- `match` = `scope/greedy/feed` · `trie` = `fold/survey/rollup/descend` · `dispatch` = `invoke/shotgun/traverse/walk` · `strategy` = `fire/resolve/direct/bare/echo/request/guarded`. TWO geometries: `dispatch` consumes a Signal and MATCHES (early-terminate); `trie` ENUMERATES the whole vector. Never cross-compare their forms.
- **NO SEGMENT-TYPE PRECEDENCE — declaration order decides.** `scope` collects in insertion order, `feed` takes the first WITH an effect. Probe: `/:id` opened before `/fixed`, asking `/fixed` → `PARAM`; `/fixed` first → `LITERAL`, `/other` still falls to `PARAM`. **Declare literals first.**
- **A node's `use` wraps its DESCENDANTS, not its own effect — in the dispatch family.** Probe with `use` at root, `/x`, `/x/y`: `invoke("/x")` → `root > EFFECT@x` (the `/x` middleware never ran); `invoke("/x/y")` → `root > x > EFFECT@y`. The tree family differs — `shape.object(v).x()` → `root > x > EFFECT@x`. A root `use` DOES wrap a root effect. Measure it.
- **`fire` dispatches on DECLARED ARITY** — probe: `0 → effect()`, `1 → effect(ctx)`, `2 → effect(input, ctx)`. So `(input) => …` is arity 1 and receives the CONTEXT, not the input.
- Only `guarded` validates edge `input` schemas. `request` builds a real `Context`; `echo`/`bare` a POJO; `direct` opts out. `walk` throws `Long` past 20 steps, `Short` when the asker yields no nature.

```js
// subsystems/typology/gestalten/steer/strategy.js:3-7 · trie.js:5-24 (fold trimmed)
export function fire(effect, context) {
  if (effect.length === 0) return effect();
  if (effect.length === 1) return effect(context);
  return effect(context.input, context); }
export const descend = (carry, vector) => middleware.chain(carry, middleware.compose(vector.carry));
export function fold(vector, step, frame = { carry: middleware.forward, steps: [], … }) {
  const here = { ...frame, carry: descend(frame.carry, vector) };          // ← middleware descends here
  const trajectories = [...vector.trie.values()].map(({ pattern, trajectory }) => fold(trajectory, step,
    { ...here, signature: pattern, steps: [...here.steps, pattern] … }));
  return step.node({ ...here, effect: vector.effect ?? undefined, trajectories }); }
```

## shape — the Vector compilers, and the STRIPWIRE dual

- `gestalten/shape/` = 11 exported compilers: namespaced `connection` · `cortex`; flat `object` (which also defines `proxy` — there is no `proxy.js`), `tree flat strip http mcp messenger subscriber selbstbestimmt`. **`shape.agentic` DOES NOT EXIST** (grep → nothing).
- **STRIPWIRE**: `shape.object(vector)` = a local callable/namespace ⟷ `shape.connection.wire(conn, shape.strip(vector))` = the same surface over HTTP. One trait Vector, two backings across the daemon↔client wire; `strip` → `{effect?, branches}` JSON is the `/metadata/*` contract.
- **`yields` on an edge = the streaming contract**: declared in-trait → plucked by `strip` → `wire` returns a `connection.stream()` caller. An async generator handler IS SSE. `wire` proxies `:param` branches, DROPS `*`/`(.*)` with a warn, THROWS on a method-ambiguous leaf.

```js
// subsystems/typology/gestalten/shape/object.js:5-14 · strip.js:13-21
export const object = (vector, execute = steer.strategy.request) => steer.trie.fold(vector, { node: (f) => {
  const namespace = {}; for (const child of f.trajectories) namespace[child.key] = child.namespace;
  const compiled = f.effect !== undefined ? execute(f.carry, f.effect, f.steps, route(f.steps)) : undefined;
  return { key: f.signature?.nature, namespace: compiled ? Object.assign(compiled, namespace) : namespace }; } });
export const strip = (vector, pluck = edgeMeta) => steer.trie.fold(vector, { node: (f) => {  // strip.js
  const node = { branches: Object.fromEntries(f.trajectories.map((c) => [c.key, c.node])) };
  if (f.effect !== undefined) node.effect = pluck(f.signature, f.effect); … } });
api[segment] = wire(connection.branch(`/${segment}`), child);                // connection.js:11
```

```json
// probe: strip(aperture: GET /mode/:slug · yields /mode/watch · input /install) →
{"branches":{"mode":{"branches":{
  ":slug":{"branches":{},"effect":{"methods":["GET"]}},
  "watch":{"branches":{},"effect":{"yields":{"type":"object","required":["tick"],"properties":{"tick":{"type":"integer"}}}}}}},
  "install":{"branches":{},"effect":{"input":{"type":"object","required":["slug"],"properties":{"slug":{"type":"string"}}}}}}}
```

## Connection — the transport dual

- **`prototypes/connection.js`** is a MEMOIZED TREE: `child()` caches per segment and hands the child a transport of `(ctx) => parent.dispatch(ctx)`, so a shard at a root applies to every descendant. `branch` walks/creates; `resolve` walks only what exists. NEVER raw-fetch.
- Verbs `aim · call/fetch · stream · observe · nanoatom · publish · socket`, plus the two that carry weight: `converse` (POST an SSE body up while streaming down — the duplex frame) and `subscribe` (reconnecting, backoff 1000 → 30000 ms). `retry` rides the transport, not a `.use()`.

```js
// subsystems/typology/prototypes/connection.js:28-38
dispatch(ctx) { return middleware.compose(this.carry)(ctx, this.transport); }
child(segment) { … this.children.set(segment,
  new this.constructor(this.url.branch(`/${segment}`), (ctx) => this.dispatch(ctx))); … }
```

## Span — the trace cursor

- **`prototypes/span.js`** — a Signature whose `hasher()` is a monotonic `id`. Only the ROOT holds `journal[]` (capped at `CONFIG.journal = 1000`) and a `channel` Pipe; children reach them via `records`/`pipe`. `Span.from` calls `super.from(trace, true)` — ANON, so a span held as a long-lived field never appends to `trace.gauges`.

```js
// subsystems/typology/prototypes/span.js:47-61
mark(verb, data) {
  const record = { span: this.id, trace: this.trace?.id ?? null, path: this.absolute, verb, at: performance.now() };
  if (data !== undefined) record.data = data;
  const journal = this.records;                        // === this.root.journal
  journal.push(record);
  if (journal.length > CONFIG.journal) journal.splice(0, journal.length - CONFIG.journal);
  this.pipe.send(record); … }
```

```json
// probe: new Span("/boot").branch("mode").branch("install") → open/note/fault (`at` elided)
{"span":2,"trace":1,"path":"/boot/mode/install","verb":"open"}
{"span":2,"trace":1,"path":"/boot/mode/install","verb":"note","data":{"slug":"hello-world"}}
{"span":2,"trace":1,"path":"/boot/mode/install","verb":"fault","data":{"message":"nope","code":null}}
```

## Cortex + Hallucination — the provider seam

- **Cortex** (`prototypes/cortex.js`) is a faculty REGISTRY, `Map<type, Faculty[]>`. `register/find/findOne` share one validated `where()` (`{type?, via?, tune}`); a 3-long `tune` pads to 4. `findOne` picks by `recipe.nearest`, else `DERIVATIONS` — whose only entry is `object → dialogue/render`. A tune is `[intelligence, reasoning, speed, thrift]`.
- **`Hallucination(cortex)`** — a closure factory, ONE argument. It builds an internal Vector `/{dialogue,object}/{stream,render}` + `/verbatim/stream` + `/speech/{stream,render}` and returns `shape.object(…, steer.strategy.echo)`; `cortex.hallucinate` memoizes it.
- **`policy` is the app-side half, STRIPPED by the lowering** (`rounds` = the per-turn tool limit, default 10; `backoff` `[1000,4000]`; `tune`). A `tools` VECTOR is cut to a wire catalog by `trie.rollup` + `ToolCall` naming and never crosses. What crosses is the Request.

```js
// subsystems/typology/prototypes/hallucination.js:48-69,126-134 (trimmed)
const lowering = async (ctx, next) => {          // request = ctx.input ?? {}
  const catalog = is.Vector(request.tools) ? declarations(request.tools) : (request.tools ?? []);
  ctx.policy = policing(request); ctx.span = new Span("/hallucination");
  ctx.input = { ...(request.system && { system: request.system }), turns: request.turns ?? [],
                ...(catalog.length && { tools: catalog }), … };  // policy never reaches the wire
  await next(); };
for (const avenue of ["dialogue", "object"])
  hallucinator.branch(`/${avenue}`).use(lowering)
    .open({ nature: "stream", yields: Packet.Response }, streaming(avenue))
    .open("render", rendering(avenue));
```

```json
// subsystems/typology/tests/snapshots/hallucination-request.snapshot.json (trimmed) — the wire Request
{"turns":[{"role":"user","parts":[{"type":"text","text":"primeira"}]}],
 "tools":[{"name":"bare"},{"name":"dressed","valence":"looks up a word",
   "input":{"type":"object","required":["query"],"properties":{"query":{"type":"string"}}}}],
 "cache":{"marks":["context","tools"]},"settings":{"temperature":0},"output":{"schema":{"type":"object","required":["verdict"],"properties":{"verdict":{"type":"string"}}}}}
// tests/snapshots/cortex.snapshot.json — a faculty AT REST
{"type":"dialogue","tune":[0.9,1,0.3,0.5],"channels":{"in":["text","tool_result"],"out":["text","tool_use"]},"via":["render","stream"]}
```

## schematics — `v`, the typebox wrapper

- `schematics/v.js` wraps typebox@1.3; `index.js` hangs `scalars`, `primitives` (10), `entities` (10), `prototypes` and the entity factories off one `v`. NO passthrough/strict/transform/refine/partial/nullable.
- **`cast` = Default + Convert** (request INPUT only) · **`fill` = Default only** (entities/buffers/output — Convert mauls MikroORM Collections) · **`v.convert` for a bare scalar**: probe printed `v.cast(v.integer(), "8080") → "8080"` — on a scalar Convert's result is DISCARDED and the original returned, while `v.convert(…) → 8080`. On an OBJECT `cast` mutates in place (`{port:"8080"} → {port:8080}`, same ref).
- **`enhance` GETTER/SETTER DUALITY**: `.default` / `.$id` / `.group` / `.examples` return the KEYWORD when set and the SETTER FUNCTION when unset — probe: `typeof v.string().default === "function"`, `"default" in held === false`, so `held.default ?? ""` hands a reader the setter. `v.environment(…).properties` is the exception: PLAIN properties, unset `default` is `undefined`. Read optionality with **`v.isOptional`**.
- **`v.url()`** (`schematics/scalars/url.js`) = RFC 3986 URI WITH AN AUTHORITY as `pattern` + `title`: `file:///x` passes, `localhost:2501` and `${X}` fail. TypeBox's registered `url` format wants a TLD and rejects `http://localhost:2501/`, so **no `format:` key is used anywhere**. `v.environment(props)` throws at import on any key outside the VIVA law. [[project_typology_v_api]]
- `entityFactory` intersects `DataEntitySchema` + a descriptor's `own` + its resolved `relations`, every level `additionalProperties: true`; a relation thunk re-entering its own `$id` is safe — the `resolving` guard returns the own-only shape. **`v.rel(schema)` = `union([ID, object({}, {additionalProperties:true})])`**: identity plus an opaque arm Convert cannot descend.
- Descriptors: Buffer · Literal · Symbol · Mode · Intent · Thread · User (+ `INTELLIGENT`/`VOCAL` on Thread, SELF-referential via `parent` + `children`). **`TurnDescriptor` (`entities/turn.js`) is exported from NO index and has no `v.turn` factory** — the folder's orphan. Only `BufferDescriptor` carries `spoken`.

```js
// subsystems/typology/schematics/v.js:26-28,45-47 (enhance, trimmed)
if (prop === "default") {
  if ("default" in target) return target.default;                       // set → the KEYWORD
  return (val) => enhance(derive(target, { default: val })); }          // unset → the SETTER
if (prop === "fill") return (value) => (Value.Default(target, value), value);
if (prop === "cast") return (value) => (Value.Default(target, value), Value.Convert(target, value), value);
```

## gestalten belt & the carriers

- **`belt.query`** is the ONE MikroORM-query compiler (`lift` normalizes a selector, `where` compiles it to a row predicate). STORE THE LIFT, never the sugar — `repo.find("word")` as a primary key matches nothing.
- **`belt.object.place`** (behind `object.set` and `LiteralSubscriber.symbol()`): a dotted slug pops its LAST segment as the VALUE — `word.tense.present` → `{word:{tense:"present"}}`; a single-segment slug writes a root flag (`{conjugation:true}`). Invariant test `tests/gestalten/belt/object.test.js`.
- **Dataset / Datasink** (`prototypes/`, PURE — no `Deno.*`): `Dataset` = `{intent, ...sources}` lifted by `reader.lift` — a value is a source-LIST only when EVERY element is a descriptor, else ONE source. `Datasink` = per-type `(selector, projection?, target)`; **a `writer.codec` with no matching `paladin.find.data` read path is a one-way door**.

## how it is tested

91 `*.test.*` · 467 `it(` · 12 snapshot tests · 16 fixtures. Harness = `specimen/` (`@std/testing` + `matches(schema)` + `snapshot`, `locate` REQUIRED); per-concept `--watch` tasks: `subsystems/typology/deno.jsonc`. One file: `deno test -A --config deno.jsonc <path>`.

- **Signature** `tests/toolcall.test.js` *"construction from a foreign Signature adopts identity, never linkage"* · `tests/path.test.js` *"branching a child never grows the parent (the daemon-mount crash)"*. `#hash`'s memo is UNPINNED — `grep -rn hash tests` → `is.string(route.hash)`.
- **Vector · steer** `tests/vector.test.js` *"the trie keys by nature: one edge per sibling nature, declaration order immovable — a collision holds its slot"* · 21 `it` in `tests/gestalten/steer/`. GAP: the dispatch-vs-tree `use` asymmetry this shard probes is pinned NOWHERE — `invoke.test.js` covers a ROOT `use` only.

```js
// test: tests/vector.test.js:158-160
specimen.expect([...new Vector().slurp(base).slurp(override).trie.keys()]).toEqual(["a", "b"]);
```

```js
// test: tests/gestalten/steer/fire.test.js:6 — "an effect fires by its arity"
specimen.expect(steer.strategy.fire((ctx) => ctx.input, { input: "one" })).toBe("one");
```

- **shape · Connection · Span** STRIPWIRE proved BY CONSTRUCTION: one assertion set replayed over both backings · `connection.test.js` *"a connection assembles and branches its tree"* pins the child memo · `span.test.js` *"a record is a self-describing fact: identity, lineage, path, clock"*.

```js
// test: tests/gestalten/shape/stripwire.test.js:24-31 → ok | 3 passed (14 steps)
local: shape.proxy(vector), remote: shape.connection.wire(connection, shape.strip(vector)),
for (const [name, side] of Object.entries(sides())) specimen.describe(`stripwire symmetry: ${name}`, …
```

- **Hallucination · `v`** `hallucination.test.js` 17 `it` — *"a tools Vector on the request is LOWERED to the wire catalog and dispatched"* · `v.test.js` 19 `it` — *"environment hands back PLAIN properties — an unset default is undefined, never the setter"*.
- **A fixture is a WITNESS, not a golden.** 11 of the 12 `*.snapshot.test.js` hold `const DRY = false` and REWRITE `tests/snapshots/*.json` every run; drift lands silently. Only `hallucination.snapshot.test.js` freezes (`expect(pojo).toEqual(frozen)`, rewritten only under `SNAPSHOT_HOT=1`), so its 5 fixtures are the only diffable ones. Regenerate: `deno task typology/test/snapshots`.
- **gaps**, each grep → 0 in `tests/`, repo-wide, and in `~/.viva/registry`: `Blacklist` `Scope` `Seek` `Wafer` `TurnDescriptor`. `Action` `Cargo` `Status` live only downstream (kajuit · paladin · multiplayer). `shape.messenger`, `shard.receiver` → 0 everywhere; `shard.caching` → 0 repo-wide, **2 in `~/.viva/registry`**.

## the barrel law, the client half

- **DAEMON-DEPENDENT EFFECTS DO NOT LIVE IN TYPOLOGY.** 59 non-test source files import their OWN barrel `@vivalence/typology`, so a module evaluated before the barrel finishes sees `undefined` — which ones is the runner's choice (deno green, vite 500). No eval-time Vector/`v` construction inside it; skills and entities live downstream in `systems/runtime/daemon/`. Thunk idiom: `schematics/prototypes/yield.js`. [[project_bundle_tree_shaking]]
- **The prototypes/ seam holds**: `grep -n "Deno\." prototypes/*.js` finds one commented line (`url.js:233`), nothing live. **Zero MikroORM imports anywhere in typology** — only comments, tests, and `specimen/snapshot.js` duck-typing a Collection via `getItems`.
- `mod.client.js` = the browser half: no `mode`/`dataset`/`datasink`/`freight`, and 10 of 16 shard namespaces (no `datamap ambient receiver hal trait hallucinate`). Buffer-views import ONLY it.

## where to read the live system

- **Spans are the ONE runtime tap typology owns.** `gestalten/shard/track.js` is the whole emitter surface: `track.span(name, pipe)` opens/closes a `Span` per request and re-parents `ctx.span`; `track.request()` marks `{method, path, status}`; `track.subject` marks the row touched. `shard/hallucinate.js:82` marks `open {input}` per tool call; `socket.js:152,189` mark `error {status}` per frame.
- To SEE them: `span.to(sink)` (or `belt.trace.hold(sink)` / `decant`), then fold with `belt.trace`: `chronicle` → a story, `dictate` → records again, `live(span)` → a reactive story, `timing`/`faulty`/`slower(ms)` → verdicts. Anything named `drain(` is the CHANNEL family, not telemetry: `Queue`, `Pool`, `soma`.
- **No log files, `/status` or doctor verb here** — those taps are runtime's and paladin's; the one exposed surface is `shape.strip` behind `/metadata/*`.
- **31 live `console.*` in source** (grep `prototypes gestalten schematics specimen`, comments excluded). Worth knowing: `prototypes/vector.js:45,51` — "vector already affected" / "vector.set() is depracated", the two silent-misuse warnings; `socket.js:87,122,127,151,216` — every rejected or unroutable multiplex packet; `shape/connection.js:8` — the `*`/`(.*)` drop; `stall.js:14,63` — every release, every swallowed pull error.
