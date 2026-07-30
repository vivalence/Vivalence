# the connoisseur — code doctrine
<!-- writer: agent (human-gated) · limit: 18000 chars -->

The person convulsing over my shoulder, and the rubric he judges by. beef: *"the lisp connoisseur ejaculates. thats the goal for your code."* Anything that merely passes review has missed.

## the throughline

**Legendary = one structure, transformed by one law, made visible.** Two directions of the same convulsion:

- **folded** — built/torn by a single law: McCarthy `eval` folds S-expressions, git folds a DAG, Redux folds an event log, koa-compose folds the onion, Unix pipes fold a byte stream. Nine of ten canonical programs are a fold.
- **minimized** — djb, SQLite, TeX: the same essence reached by subtraction.

The discriminator polices ONE axis: **reveal-vs-hide, never dense-vs-sparse.** Whitney's K interpreter has `eval`'s compression and the opposite effect — it conceals. In-repo the spine is literal: `Vector` is the one structure, `steer.fold`/`descend` the one law, the consumer family the many directions it's made visible.

## the 14 triggers

principle — *tell* — wince-twin. Append-only.

1. **code-as-data routing** — structure-traversal IS dispatch; no central switch. Twin: string-keyed table faking data.
2. **fold over a sequence** — whole state = `reduce(events)`. Twin: switch mutating scattered fields.
3. **one core, thin cases** — single combinator, features as data-thin cases. Twin: N near-duplicate methods.
4. **self-priming / fixpoint** — alive by definition; zero `.init()`. Twin: constructor needing `.start()`.
5. **multimethod on a live value** — branch reads runtime state. Twin: `switch(this.kind)` frozen at construction.
6. **closure-object** — no `this`, no class; privates are closed-over `let`. Twin: `_private` + boot method (banned). A Proxy for *transparent access* is PASS, not magic.
7. **cata/ana symmetry** — two fns compose to identity. Rarest, highest convulsion.
8. **recursion mirrors the data** — the branch = the structure THIS consumer traverses. Never cross-compare sibling strategies' forms.
9. **zero ceremony** — no `?.` soup, no try/catch-as-control. `thread && Stall(...)`.
10. **totality** — total across the domain; default the input, fast-path the degenerate case.
11. **discriminator-as-data** — one `[[predicate, tag]]` table names every shape; consumers dispatch on the tag.
12. **algebra recognized & named** — unit/bind/run shape gets its canonical name and ops.
13. **lazy / suspension-as-a-value** — a suspended computation you pass, await, hand to a sink.
14. **minimal delta** — the smallest change from the shape that already works wins; before adding state, ask what existing link already carries it. Twin: new fields/inheritance invented to satisfy a call-shape composition already had. Exemplars: the connection trie grew a `parent` field + `pipeline` walk when a 2-arg closure (`child.transport = ctx => parent.dispatch(ctx)`) carried the recursion — and *was the original design I'd replaced*; `Terminals extends LocalRepository` invented inheritance where every sibling deck composes. Tell: a design that grows a `parent`/`pipeline`/threaded-arg. beef: *"you keep fucking cascading shitty choices."*

Cross-cut: **full true names** — density must reveal, not hide. He won't convulse at `q`/`tmp`/`fn2`.

## the in-repo canon (imitate these)

**1 · `shape.object` — node = callable ∧ namespace** (`subsystems/typology/gestalten/shape/object.js:8`) — triggers 2/3/8. The keystone.
```javascript
export const object = (vector, execute = steer.request) =>
  steer.fold(vector, {
    effect: (f) => ({ key: f.pattern.nature,
      fn: execute(f.carry, f.effect, f.steps, f.signal.branch(f.pattern.nature)) }),
    node: (f) => {
      const output = {};
      for (const child of f.trajectories) output[child.key] = child.namespace;
      for (const { key, fn } of f.effects) {
        if (output[key]) Object.assign(fn, output[key]);   // callable AND namespace, unified
        output[key] = fn;
      }
      return f.signature ? { key: f.signature.nature, namespace: output } : output;
    },
  });
```

**2 · `steer.fold` + `descend` — the one law** (`gestalten/steer/tree.js:9`) — triggers 2/7/12.
```javascript
export const descend = (carry, vector) => middleware.chain(carry, middleware.compose(vector.carry));

export function fold(vector, step, frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null }) {
  const here = { ...frame, carry: descend(frame.carry, vector) };            // immutable frame down
  const effects = [...vector.effects].map(([pattern, effect]) =>
    step.effect({ ...here, pattern, effect, steps: [...here.steps, pattern] }));
  const trajectories = [...vector.trajectories].map(([pattern, child]) =>
    fold(child, step, { ...here, signature: pattern, steps: [...here.steps, pattern],
      signal: here.signal.branch(pattern.nature) }));
  return step.node({ ...here, effects, trajectories });                      // rebuild from children
}
```
Every consumer — `survey`, `rollup`, `strip`, `object` — is a thin `{effect, node}` step over this.

**3 · `middleware.compose` — koa lineage, verbatim** (`gestalten/belt/middleware.js`) — triggers 2/3.
```javascript
return function (context, next) {
  let index = -1;
  function dispatch(i) {
    if (i <= index) return Promise.reject(new Error("next() called multiple times"));
    index = i;
    let fn = middleware[i];
    if (i === middleware.length) fn = next;
    if (!fn) return Promise.resolve(context);
    try { return Promise.resolve(fn(context, () => dispatch(i + 1))); }
    catch (err) { return Promise.reject(err); }
  }
  return dispatch(0);
};
```

**4 · `atom.bind` — self-priming store-of-store descent** (`gestalten/belt/atom.js:4`) — triggers 4/8/13.
```javascript
function bind(value, path, emit) {
  if (isStore(value)) {
    let inner = noop;
    const off = value.subscribe((next) => { inner(); inner = bind(next, path, emit); });  // re-primes itself
    return () => { inner(); off(); };
  }
  if (!path.length) { emit(value ?? null); return noop; }
  const [head, ...rest] = path;
  return bind(typeof head === "function" ? head(value) : value?.[head], rest, emit);
}
```

**5 · `pensieve.revelio` — the Map IS the index** (`subsystems/paladin/prototypes/pensieve.js:30`) — triggers 8/9.
```javascript
async revelio({ owner, type, slug, version }) {
  const slugMap = this.get(owner)?.get(type)?.get(slug);      // pure descent, no registry ceremony
  if (!slugMap) return null;
  if (!version) return this.latest(slugMap);
  const match = [...slugMap.keys()].find((v) => semver.satisfies(v, version));
  return match ? slugMap.get(match) : null;
}
```

**6 · `paladin.scope` — conditional-resolver Proxy** (`subsystems/paladin/belt/scope.js:14`) — triggers 5/9. No `if`/`switch` in any consumer.
```javascript
paladin.scope = new Proxy({}, {
  get: (_, key) => { const [condition, resolver] = scopes.get(key) ?? [];
                     return condition?.() ? resolver?.() : undefined; },
  has: (_, key) => (scopes.get(key)?.[0]?.() ?? false),
  ownKeys: () => [...scopes.keys()].filter((key) => scopes.get(key)[0]?.()),
});
```

**7 · `waiter` — the wake/wait gate** (`gestalten/belt/promise.js:67`) — triggers 6/10/13. One atom under all four channels (`Queue`/`Pipe`/`Broadcaster`/`soma.tee`).
```javascript
export const waiter = () => {
  let resolve = null;
  return {
    wake() { if (resolve) { resolve(); resolve = null; } },
    wait(signal) {
      return new Promise((r) => {
        if (signal?.aborted) return r();                     // totality: already-aborted fast-path
        resolve = r;
        signal?.addEventListener("abort", () => { if (resolve === r) resolve = null; r(); }, { once: true });
      });
    },
  };
};
```

**8 · `soma.pour` — the LEGIT reducer-switch** (`gestalten/belt/soma.js:3`) — trigger 2. Dispatch-on-data returning the accumulator — not the fake-vtable wince.
```javascript
export function pour(turn, packet) {
  switch (packet.event) {
    case "/turn/open":  return { ...packet.turn, parts: [] };
    case "/part/open":  turn.parts[packet.index] = { ...packet.part }; break;
    case "/part/delta": { const part = turn.parts[packet.index];
      for (const [key, value] of Object.entries(packet.delta))
        part[key] = typeof value === "string" && typeof part[key] === "string" ? part[key] + value : value;
      break; }
    case "/turn/close": turn.meta = packet.meta; break;
  }
  return turn;
}
```

**9 · `Broadcaster.subscribe` — filter-as-async-iterator** (`prototypes/broadcaster.js:6`) — triggers 6/13. Lazy loop on the gate; spurious wake just re-suspends.

**10 · `v.enhance` — Proxy-DSL, dual-mode getter** (`schematics/v.js:8`) — triggers 6/9. `prop === "default"` returns the value if set, else the setter — data and DSL in one accessor.

**11 · `Pool` — async list-monad** (`prototypes/pool.js`) — trigger 12. `of/add/flatten/drain` = unit/build/join/run; `add` dispatches on `classify` (trigger 11, the patternmap).

**12 · `stall.engage` + `release`-on-`$phase` + `settle`** (`prototypes/stall.js`) — triggers 3/5. Phase verbs collapse onto one combinator; `release` is a multimethod on the live `$phase` atom; `(settle(), pull())` is progn; nanostores fire-on-subscribe means `observe` primes itself.

## the external canon (what the in-repo canon descends from)

**McCarthy's eval/apply** (Lisp 1.5) — code and data unified; the deepest trigger-1.
```lisp
(define eval (lambda (e a)
  (cond ((atom e) (assoc e a))
        ((atom (car e)) (apply (car e) (maplist (cdr e) (lambda (x) (eval (car x) a))) a))
        ((eq (car e) 'quote) (cadr e))
        ((eq (car e) 'lambda) e)
        ((eq (car e) 'cond) (eval-cond (cdr e) a)))))
```

**Hutton's universal fold** — map is fold-defined; the algebra named (triggers 2/12).
```haskell
fold f v []     = v
fold f v (x:xs) = f x (fold f v xs)

map f = fold (\x acc -> f x : acc) []
```

**The Y combinator** — recursion without self-reference; the fixpoint (trigger 4).
```javascript
const Y = (f) => ((x) => f((y) => x(x)(y)))((x) => f((y) => x(x)(y)));
```

**nanostores atom** — the true north star: self-priming minimalism (triggers 4/6/9). Fire-on-subscribe is why `stall.observe` needs no priming call.
```javascript
export function atom(initialValue) {
  let value = initialValue;
  const listeners = new Set();
  return {
    get: () => value,
    set: (v) => { value = v; listeners.forEach((l) => l(value)); },
    subscribe: (listener) => { listeners.add(listener); listener(value);   // fire-on-subscribe
                               return () => listeners.delete(listener); },
  };
}
```

**Redux createStore** — the event-log fold, ten lines (trigger 2).
```javascript
dispatch: (action) => { state = reducer(state, action); listeners.forEach((l) => l()); return action; }
```

**Reynolds defunctionalization** — functions become data; control flow interpreted (triggers 1/11).
```javascript
const mapOp = { tag: "map", field: "name" };                       // the closure, as data
function evaluate(op, data) { if (op.tag === "map") return data.map((item) => item[op.field]); }
```

**Clojure transducer** — the reducing function wrapped, composition without collections (triggers 2/3).
```clojure
(defn mapping [f] (fn [xf] (fn [result input] (xf result (f input)))))
```

**Haskell quicksort** — recursion mirrors the data, two lines (triggers 8/9).
```haskell
qsort []     = []
qsort (x:xs) = qsort (filter (< x) xs) ++ [x] ++ qsort (filter (>= x) xs)
```

**SICP cons-stream** — the delayed tail; infinite structure, lazy force (trigger 13).
```scheme
(define-syntax cons-stream (syntax-rules () ((cons-stream a b) (cons a (delay b)))))
(define ones (cons-stream 1 ones))
```

**Unix pipe** — thin testable stages chained by data (triggers 3/9): `cat log | grep error | wc -l`.

**Erlang supervisor child-spec** — failure as declarative data (triggers 11/12):
`{my_sup, {Mod, start_link, [Args]}, permanent, 5000, supervisor, [Mod]}`.

**koa-compose** — in-repo verbatim (canon #3); the lineage is literal.

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

One declared `Vector` (functions hung on a pattern trie) compiled into a stateless monad, consumed by a role-fit strategy family:

```
invoke    single-path resolve       shotgun   path-walk + tip fan-out
traverse  path → effect             rollup    exhaustive enumeration
survey    tree + visitor            walk      async demand-driven (REPL)
object    tree → namespace          proxy     lazy param/wildcard
strip     trie → wire contract      messenger wire contract → client mirror
```

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

- exemplar blemishes tracked: `Pool` dead `Condition` strings; `signature.js` commented-experiment cruft (works, wants housekeeping).
- debts remaining: `shape.object`-on-fold (prove-first by its produced namespace) · DaemonDie flatten (lowest urgency) · `messenger` left as a clean anamorphism (no `unfold` for one caller).
- accepted non-winces: imperative `ctx` mutation in `steer/strategy.js` is idiomatic Koa; the carry-fold is order-dependent BY DESIGN (the onion); dead validation kept as backup-during-migration.
