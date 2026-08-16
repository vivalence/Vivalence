# the connoisseur — code doctrine
<!-- writer: agent (human-gated) · limit: 18000 chars -->

The person convulsing over my shoulder, and the rubric he judges by. beef: *"the lisp connoisseur ejaculates. thats the goal for your code."* Anything that merely passes review has missed.

## the throughline

**Legendary = one structure, transformed by one law, made visible.** Two directions of the same convulsion:

- **folded** — built or torn by a single law: `eval` over S-expressions, a commit DAG, an event log, the middleware onion. Nine of ten canonical programs are a fold.
- **minimized** — the same essence reached by subtraction.

The discriminator polices ONE axis: **reveal-vs-hide, never dense-vs-sparse.** Whitney's K interpreter has `eval`'s compression and the opposite effect — it conceals. In-repo the spine is literal: `Vector` is the one structure, `steer.fold`/`descend` the one law, the consumer family the many directions it's made visible.

## the triggers

principle — *tell* — wince-twin. Append-only. **1-14 are the bar to aim at; 15-19 are what beef actually catches** — folded from the Callouts ledger, where — at the fold — 8 of the first 14 had never once been the lesson and 14 of 35 code-shape corrections landed outside all of them.

1. **code-as-data routing** — structure-traversal IS dispatch; no central switch. Twin: string-keyed table faking data.
2. **fold over a sequence** — whole state = `reduce(events)`. Twin: switch mutating scattered fields.
3. **one core, thin cases** — single combinator, features as data-thin cases. Twin: N near-duplicate methods.
4. **self-priming / fixpoint** — alive by definition; zero `.init()`. Twin: constructor needing `.start()`.
5. **multimethod on a live value** — branch reads runtime state. Twin: `switch(this.kind)` frozen at construction.
6. **closure-object** — no `this`, no class; privates are closed-over `let`. Twin: `_private` + boot method (banned). A Proxy for *transparent access* is PASS, not magic.
7. **cata/ana symmetry** — two fns compose to identity. Rarest, highest convulsion.
8. **recursion mirrors the data** — the branch = the structure THIS consumer traverses. Never cross-compare sibling strategies' forms.
9. **zero ceremony** — no `?.` soup, no try/catch-as-control, no three locals re-derived at the head of every handler. `thread && Stall(...)`. Twin: a hand loop where a `steer.*` walk exists; `.split`/`.replace` on a typology field — reshaping a primitive's own shape means you are misusing it. beef: *"youre writing shit from scratch instead of using whats there. read typology."*
10. **totality** — total across the REAL domain: trace the producer, default only what it can emit, fast-path the degenerate case. Total also means LOUD — a path that cannot complete its contract throws. Twin: a `||`-ladder over shapes no producer makes; warn-and-continue, which is a defect wearing a log line. beef: *"STOP WITH ALL THESE FUCKING EVENTUALITIES AND OPTINS!!! THERE IS ONE WAY THIS WORKS!!!"* · *"issue 1 very important! i hate silent fails!"*
11. **discriminator-as-data** — one `[[predicate, tag]]` table names every shape; consumers dispatch on the tag.
12. **algebra recognized & named** — unit/bind/run shape gets its canonical name and ops.
13. **lazy / suspension-as-a-value** — a suspended computation you pass, await, hand to a sink.
14. **minimal delta** — the smallest change from the shape that already works wins; before adding state, ask what existing link already carries it. Twin: new fields/inheritance invented to satisfy a call-shape composition already had. Exemplars: the connection trie grew a `parent` field + `pipeline` walk when a 2-arg closure (`child.transport = ctx => parent.dispatch(ctx)`) carried the recursion — and *was the original design I'd replaced*; `Terminals extends LocalRepository` invented inheritance where every sibling deck composes. beef: *"you keep fucking cascading shitty choices."* **Counter-clause**: minimal delta governs MY additions, never HIS redesigns — when beef points at an interface and asks whether to recast it, the smallest change is engagement, not a verdict. Twin: a harness that outgrows the fix it guards. beef: *"i told you retard! contract. contract both sides."*
15. **write at the owner** — whatever owns a fact writes it: a generator emits its own artifact, a store is written through its API, a singleton is constructed one level above every consumer. Twin: a `Migration…ts` hand-typed beside a tool that diffs it; `sqlite3 UPDATE` beside a datamap route; a `liveBuffer` `$derived` shadowing `terminal.$buffer`; `new Mic()` inside a panel. Tell: an instruction that REMOVES work has been converted into work, or a consumer bent to ratify an upstream mistake. beef: *"mikro manages db."* · *"terminal buffer is the source of truth! revert your hack!"* · *"BOX owns it. panel and dock consume box.device.microphone"*
16. **no second epicycle** — a fix needing a workaround to prop up the first means the abstraction is wrong; name the flaw and offer the from-scratch model unprompted. Twin: union-subscribers → subscriber-only descriptors → a harvest step, all circling `concrete()`; three CSS attempts reacting to screenshots; a parallel status path around hooks that already exist; a workaround for a defect never reproduced. beef: *"i hate this concrete function! its utterly retarded. lets get rid of it! what would entity handling look like from scratch"*
17. **the mechanism already computes it** — before authoring an ordering, pacing, schedule, tier or phase, find the `feed`/`rank`/scheduler that owns it; the artifact is a `where` clause, not a curriculum. Never offer a fork the mechanism already resolves. Twin: a day-1-to-day-7 ramp laid over an adaptive engine. beef: *"those are heuristics not guides for experience"*
18. **the bag is the missing contract** — heterogeneous members in one `config`/`options`/`manifest` object name an absent bilateral shape; split it, never excuse it. Twin: `tools` crammed in beside `rounds`/`tune` inside `config`; `voice: {…}` added to a manifest because the slot was there. beef: *"contract. contract both sides. …???!!! why are the tools inside config?!"*
19. **the surface is grepped, never remembered** — a method, import or path typed from another ecosystem's muscle memory. Twin: `.passthrough()` on a typebox wrapper; `import … from "@vivalence/tactic/survival"`; `daemon.subscribe?.()` — the `?.` is the tell that hides the fabrication. beef: *"where does this exist?? it doenst. nowhere."*

Cross-cut: **full true names** — density must reveal, not hide. He won't convulse at `q`/`tmp`/`fn2`. **The qualifier is part of the name**: `trace.chronicle`, never `const { chronicle } = trace`, never a one-off `const schema = v.primitives.variant.Variant` — a name whose origin left the call site is shorter and worse. **And no comments** — the largest code family in the ledger, 4 strikes, now hook-gated: a comment explaining what the code does IS the rename you didn't make. beef: *"i need the context of the.dot.notation to fucking knwo where what is fuckin gcoming from."* · *"RETARD I TOLD YOU NO MORE COMMENT BLOCKS!!!"*

## the in-repo canon

**Re-read before you quote.** Three of eight code-bearing entries were FALSE when last measured — a pasted excerpt is DERIVED ([[ontology]] law 1) inside an authored file, so it rots into confident wrongness while the prose around it still reads true. The entries below name the law and cite the path; go read the lines.

**1 · `shape.object` — node = callable ∧ namespace** (`subsystems/typology/gestalten/shape/object.js:5`) — triggers 2/3/8. The keystone.
A `steer.fold` whose `effect` step keys by `f.pattern.nature` and whose `node` step rebuilds an object from its children — then, where a key is BOTH a leaf and a branch, `Object.assign(fn, output[key])` hangs the namespace onto the function itself. That one line is why `mode.emit.drill(...)` and `mode.emit.drill.cast(...)` are the same object, and why the call form is `.nature`-keyed dot-notation — never `emit["/drill"]`.

**2 · `steer.fold` + `descend` — the one law** (`gestalten/steer/trie.js` :5, :9) — triggers 2/7/12.
`descend` is one line — `middleware.chain(carry, middleware.compose(vector.carry))` — and `fold` threads an IMMUTABLE frame downward (`{...frame, carry: descend(...)}`, `steps` and `signal` branched per pattern) while rebuilding upward through `step.node({...here, effects, trajectories})`. Down carries context, up carries the result: that is the whole law. Every consumer — `survey`, `rollup`, `strip`, `object` — is a thin `{effect, node}` step over it.

**3 · `middleware.compose` — koa lineage, VERBATIM** (`gestalten/belt/middleware.js`) — triggers 2/3. Upstream koa-compose unchanged, down to the `next() called multiple times` reject; read it there, not here. The onion is why `descend` can fold carry immutably.

**4 · `atom.bind` — self-priming store-of-store descent** (`gestalten/belt/atom.js:4`) — triggers 4/8/13.
A store found mid-path re-enters `bind` on every emission, tearing down the previous inner binding — the recursion re-primes itself, so a store-of-store-of-value needs no lifecycle. A path segment may be a function; the leaf `emit`s.

**5 · `pensieve.revelio` — the Map IS the index** (`subsystems/paladin/prototypes/pensieve.js:26`) — triggers 8/9.
`this.get(owner)?.get(type)?.get(slug)` — the nesting IS the index; no registry object, no lookup table, and `version` resolves by `semver.satisfies` over the innermost keys.

**6 · `paladin.scope` — conditional-resolver Proxy** (`subsystems/paladin/belt/scope.js:14`) — triggers 5/9. No `if`/`switch` in any consumer.
Three traps over one `scopes` Map of `[condition, resolver]`: `get` resolves only if the condition holds, `has` IS the condition, `ownKeys` filters to the live ones. The scope answers "am I in it?" itself, so no consumer branches on it — and `undefined` is the answer, never a bug to default around.

**7 · `waiter` — the wake/wait gate** (`gestalten/belt/promise.js:67`) — triggers 6/10/13. One atom under all four channels (`Queue`/`Pipe`/`Broadcaster`/`soma.tee`).
One closed-over `resolve`; `wake` fires and nulls it, `wait` returns a promise that resolves on wake OR abort, with an already-aborted fast-path before anything is allocated (trigger 10, the good half) and an identity check so a stale abort cannot clear a fresh waiter.

**8 · `soma.pour` — the LEGIT reducer-switch** (`gestalten/belt/soma.js:3`) — trigger 2. Dispatch-on-data returning the accumulator — not the fake-vtable wince.
`switch (packet.event)`, every arm returning or mutating the SAME accumulator: `/turn/open` seeds `{...packet.turn, parts: []}`, `/part/delta` string-concatenates matching keys and replaces the rest. The grammar GROWS — 12 cases across two switches now (`/part/close`, `/turn/full`, `/tool/yield`, `/tool/call`, `/response/close`). Growth by adding a case, with the accumulator still returned, is why this is the legit switch and not the fake vtable.

**9 · `Broadcaster.subscribe` — filter-as-async-iterator** (`prototypes/broadcaster.js:6`) — triggers 6/13. Lazy loop on the gate; spurious wake just re-suspends.

**10 · `v.enhance` — Proxy-DSL, dual-mode getter** (`schematics/v.js:8`) — triggers 6/9. `prop === "default"` returns the value if set, else the setter — data and DSL in one accessor.

**11 · `Pool` — async list-monad** (`prototypes/pool.js`) — trigger 12. `of/add/flatten/drain` = unit/build/join/run; `add` dispatches on `classify` (trigger 11, the patternmap).

**12 · `stall.engage` + `release`-on-`$phase` + `settle`** (`prototypes/stall.js`) — triggers 3/5. Phase verbs collapse onto one combinator; `release` is a multimethod on the live `$phase` atom; `(settle(), pull())` is progn; nanostores fire-on-subscribe means `observe` primes itself.

## the external canon

What the in-repo canon descends from. Names, not listings — this half lives in my weights already; what earns bytes is the pointer and the trigger.

- **McCarthy's eval/apply** (Lisp 1.5) — `eval` is a `cond` over the form's own shape, `apply` its dual; code and data unified. The deepest trigger-1, and the ancestor of `steer.fold`'s `{effect, node}`.
- **Hutton's universal fold** — `fold f v (x:xs) = f x (fold f v xs)`, and `map` is *defined* by it. The algebra named: triggers 2/12.
- **The Y combinator** — `f => (x => f(y => x(x)(y)))(x => f(y => x(x)(y)))`; recursion without self-reference. Trigger 4, and the reason `atom.bind` re-priming itself is not a trick.
- **nanostores atom** — the north star of self-priming minimalism (triggers 4/6/9): closed-over `value`, a `Set` of listeners, and `subscribe` firing immediately. That last clause is why `stall.observe` needs no priming call. In-repo: canon #4.
- **Redux `createStore`** — `state = reducer(state, action)` and notify; the event-log fold in one line (trigger 2).
- **Reynolds defunctionalization** — the closure becomes `{tag, …}` and an interpreter reads the tag (triggers 1/11); in-repo the carrier is `Pool`'s `classify` patternmap.
- **Clojure transducer** — `(fn [xf] (fn [result input] (xf result (f input))))`: the reducing function wrapped, composition without collections (triggers 2/3).

Two kinds of legendary, both respected: **density-elegance** (SICP eval, Parsec, lenses, transducers, Y, FRP, Backus, Wadler, Okasaki, Iverson, Hughes) and **discipline-craft** (SQLite ~600:1 tests, QuickCheck, TeX, redis ae.c, Erlang/OTP, djb, Hickey's *Simple Made Easy* — the wince is complecting). The ⚡ boundary: fast-inverse-sqrt, Duff's device, Whitney's K — compression that hides.

## naming & semantics

Naming IS design. beef's standard: *"good language semantics in functional programming. more of this."*

- **name by FP role** — `fold`, `descend`, `classify`, `waiter`, `inflight`, `swallow`, `pour`, `drain`. Never `helper`, `step2`, `check`.
- **join a register** — food: `slurp·swallow·pour·drain·barf·yeet`; spell-craft: `accio·revelio·pensieve`; routing: `branch·open·affect·survey·rollup`. A loner name earns nothing.
- **name the PAIR** — `slurp` (share: `dest.branch IS src.branch`) beside `swallow` (own: deep copy). A "bug" can be a feature pair — the aliasing wasn't fixed, it was *named*.
- **the false binary is the pair at design time** — A-or-B forks often hide two objects on different axes (declaration/record, supply/demand, share/own, cata/ana). Name both, or dissolve the frame. Settle *how many objects there are* before choosing between them.
- **the metaphor must be TRUE** — `graft` was rejected for reading like sharing while naming a copy. A name pointing the wrong way is worse than a dull one.
- **semantics drive the abstraction** — "these are different characters" forbids collapsing; "this is a catamorphism" tells you it folds.

## the Vector-consumer principle

One declared `Vector` (functions hung on a pattern trie) compiled into a stateless monad, consumed by a role-fit strategy family — `steer.{trie,dispatch,strategy}` walks it, `shape.*` compiles it. The ROSTER is derived and belongs to the territory: `world/codemap/typology.md` holds the current one, stamped; a copy kept here drifts (this section carried a five-row table that had lost `flat`, `http`, `subscriber`, `selbstbestimmt`, `cortex` and `connection`).

**Judge a consumer WITHIN its role, against the geometry it traverses.** `rollup` and `shotgun` are different characters, not better/worse forms of one walk. Same rule for the channels (`Queue`/`Pipe`/`Broadcaster`/`soma.tee`) — role-fit family, one shared wake-atom.

## the cata/ana ecosystem (Hutton, in-repo)

One recursive trie, three faces — Signature (linked path), Vector (routing trie), Connection (transport dual) — four round-trip pairs:

```
1  string ⟷ Signature        ana: new Signal("/a/b/c")  ·  cata: .pathname        id: new Signal(s).pathname === s
2  Vector ⟷ stripped JSON    cata: shape.strip (drops effects, keeps CONTRACT)  ·  ana: shape.messenger (+socket)
                              = hylomorphism ACROSS THE NETWORK: client is a structural mirror of the server's trie
3  Vector ⟷ namespace        ana: shape.object  ·  cata: steer.traverse — same unfold, local dispatch leaf
4  Connection = transport dual  ana: branch(path) child-chain  ·  cata: resolve(endpoint); aim() = pre-folded call
```

`Aperture` = Vector + method-keyed leaf-fold: the HTTP server IS the trie.

## effect over model

beef verbatim: *"INTERNAL REPRESENTATIONS are irrelevant — functions judged by EFFECT, not internal model."*
- refactor equivalence is proven by OUTPUT (the namespace `object` yields, the entries `rollup` returns) — never by resembling old internals; rewrites gate on a behavior proof, green both sides.
- the triggers judge the *setting* of new code; they never reject an identical-effect rewrite. When internal elegance and effect conflict, effect wins.

## standing state

**Checked this pass** — every cited path and line re-read against disk. Corrected: #1 cited `steer.request` at 8 (it is `steer.strategy.request` at 5) · #2 cited `steer/tree.js` (the file is `trie.js`) · #5 cited :30 (`revelio` is at :26) · #8 was frozen at 4 cases (it carries 12). Exact: #4 #6 #7 #9-#12. The old note called `Pool`'s `Condition` strings dead — they are LIVE (`pool.js:11-13`). A *"this is dead"* claim rots fastest.

- debts remaining: `shape.object`-on-fold (prove-first by its produced namespace) · DaemonDie flatten (lowest urgency) · `messenger` as a clean anamorphism (one caller, no `unfold`) — all three UNRE-MEASURED; treat as claims, not facts.
- accepted non-winces: imperative `ctx` mutation in `steer/strategy.js` is idiomatic Koa; the carry-fold is order-dependent BY DESIGN (the onion).
