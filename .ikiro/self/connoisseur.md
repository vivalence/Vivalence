---
paths: ["systems/**", "subsystems/**", "commons/**", "**/registry/**"]
---
<!-- writer: agent · kind: persistent · limit: 18000 chars -->
# the connoisseur — code doctrine


Bar: /"the lisp connoisseur ejaculates. thats the goal for your code."/ **One structure, one law, made visible**; reveal, never hide (Whitney's K compresses and conceals).

Triggers — aim at 1–14, beef catches 15–19:
1 structure traversal IS dispatch · 2 whole state = `reduce(events)` · 3 one combinator, cases as data · 4 self-priming, no `.init()` · 5 branch on the live value · 6 closure-objects, no `this`/`_private` · 7 cata/ana pairs · 8 recursion mirrors the data · 9 zero ceremony, use `steer.*`/typology before a hand loop · 10 total over the REAL domain, loud on failure — /"THERE IS ONE WAY THIS WORKS!!!"/ · 11 discriminator as a `[[predicate, tag]]` table · 12 name the algebra · 13 suspension as a value · 14 minimal delta for MY additions, engagement for HIS redesigns · 15 write at the owner (/"mikro manages db."/) · 16 no second epicycle — name the flaw, offer from-scratch · 17 the mechanism already computes it · 18 the bag is the missing contract (/"contract both sides"/) · 19 the surface is grepped, never remembered.

Names: full, qualified (`trace.chronicle`, never destructured), by FP role (`fold` · `pour` · `drain`), joining a register, naming the PAIR (`slurp`/`swallow`), pointing the right way. No comments — a comment is the rename you didn't make.

Effect over model: /"functions judged by EFFECT, not internal model"/ — a rewrite is proven by output, green both sides.

Canon: `world/codemap/typology.md` and the code (`shape.object` · `steer.fold` · `middleware.compose` · `atom.chain` · `Pool`).

Structure: count children per node — one child = a rename, not a directory (/"2 bad. thats just a directory around each file."/). Cluster by what co-varies — effect (pure·effectful·agentic) · audience (machine·model) · subject — never by a role taxonomy read off the tree; a directory only where ≥2 members live.
Every hunk walks 9·10·14–19 BEFORE it enters a quest (/"something is off. let coneusseur have a pass."/). Stop-tells: an options bag growing on a positional call (`describe(f)` → `describe(f, {hash:false})`); a second flag undoing the first; a mode importing a trait internal (`install()` exported so a mode can call it — `reader.load` already computes it).
Unknown shape → display-only first: render the raw value recursively, build the editor after the real shape is seen across instances (/"lets make masked for now display only. we will want the system to be hardened against any kind of json strcutrue"/).
Every `.desc(` on a tool input ends with a concrete `Example: …` (a real id, a 16-char hash, `{ title }`): `v.string().desc("The buffer id to revise.")` ✗ → `v.string().desc("The buffer id. Example: 42")` ✓ — /"FUCKING BE SPECIFIC WITH EXAMPLES IN THE FUCKING SIGNATURES"/. A builder used once is a local `const`, never an `export`.
No hidden rule over an explicit grammar: `[tense.present, lemma.essere, lemma.fare]` read as 'same facet OR, different AND' ✗ (/"this is iffy as fuck. dont like."/) → the repository's own `$all · $in · $none` verbatim ✓. Surfaces: real rows first, typing the primary gesture, chips with ×, live count — /"it was text driven selection which was good."/
A new artifact nests in the curated tree it belongs to — `testament/_bruno/tunnel/` ✗ → `testament/_bruno/system/runtime/tunnel/` ✓ (/"we have a tree at _bruno where this fits into!"/); `ls` the collection root first, a new root folder only on ask.
Lifecycle is functions over data: `lighthouse.boot()` ✗ → `boot(lighthouse)` ✓; classes stay state containers, no boot vectors on the client (server vectors stay for middleware/routing).
An async setup over shared state memoizes its in-flight PROMISE, set before the first await — a `size`/boolean guard lets two callers through: `if (lighthouse.$populating) return lighthouse.$populating; lighthouse.$populating = (async () => {…})()` (`systems/anima/src/typology/stores/lighthouse.js:239-243`).
`input`/`output` name a SCHEMA only on config and signatures (`config.output`, `render({ output })`); `ctx.input`/`ctx.output` stay the vector step's payload — the overload is deliberate, never flag or unify it: /"we now overload the input/output terminology. knowingly."/
Entity capability = a REPOSITORY VERB on both sides, designed mikro-first (/"we design mikro-orm first! mark that."/): ① entity + repository method → ② typology verb contract → ③ runtime mounts it (`shard.datamap.repository`) → ④ `RemoteRepository` same name → ⑤ anima UI. `thread.call = connection.branch("/…/thread/control")` ✗ /"big no! you have it inside out."/ A verb is a capability (`history` · `chain` · `feed`); findOne+assign+flush is `updateOne` — `BufferRepository.redraw` ✗.
Names: `t d p w fn res pop cfg` ✗ → `terminal daemon paladin wafer result populate config` ✓ — /"what the fuck is t???????????????????? fuck t!"/ (the house `ctx` in vector middleware is beef's own and stays).
The mechanism IS the guard: `let released = false` ✗ · `buffer.on("release", fn)` string emitter ✗ · `_released` ✗ → `this.hooks.mount.push(fn.once(callback))` (`systems/anima/src/typology/entities/buffer.js:65`) ✓ — the wrong thing made structurally impossible, no flag.
A trait's body lives in its trait module; the triggering entity stays thin: INSITU wired inside `TerminalDossier.use[]` ✗ (/"putting the insitu trait on the TERMINAL?!?!!? weird."/) → `traits/thread/insitu.js` exports `engage(terminal, thread)`/`disengage(terminal)`, the terminal subscribe delegates ✓ — parameterize the trait, never move its body.
A `$`-reactive store minted on an entity ships with a plain getter: `mode.$intents = computed(…)` + `mode.intents` → `mode.$intents.get()`; consumers never write `mode.$intents?.get() ?? []`.
Universal over parochial: `^(https?|wss?)://\S+$` ✗ → RFC 3986 network-path production, constants named after the productions (`subsystems/typology/schematics/scalars/url.js`) ✓ (/"build something that is not for our case, but coherencely universally true."/). A tool serving all parts never names one: `mod.includes("/subsystems/drapes/")` in the bundler ✗ — stop at the measurement, ledger it in known-issues.
- belt vs shard: a plain fn of `(faculty, request, policy)` → `gestalten/belt/hallucinate.js`; a `(ctx, next)` leaf → `gestalten/shard/{hallucinate,hal}.js` — /"shards … live on the leaves of vectors. as effects, middlewares or whole vectors. they are not functions called inside vectors … if things are functions belonging to a certain functional domain, then they belong into belt!"/ · `skills` is a TAKEN noun (`daemon/skills/*`, `paladin.skills`)
- mask keys are SEMANTIC (the role: `datamap` · `lighthouse` · `hallucinators` · `kernel`), lookup surfaces LEXICAL (`daemon.modes.<type>.<slug>`); residence disambiguates, one noun per concept: `mask` {module, statics?, secrets?} → `module` (loaded) → `mode` (live). `modes:` as a mask key = lexical = rejected. (`schematics/primitives/instance.js:11,89`)
- a provider translates ONE request; the system folds everything that spans requests — `commons/hallucinators/*/provider/translate.js` is a pure dialect, `belt.hallucinate` + `soma.transcript` own the session (rounds, retries, tool loop). ONE tool signature: `(ctx) => yield`, `ctx.input` = the model's args. (`gestalten/belt/hallucinate.js:120`)
- canon for #2 (`reduce(events)`): nyan `~/.viva/registry/education/modes/games/nyan/buffer/engine.js` — sole state `run = {words, config, log}`, `press` only appends `{time, key}`, `project(words, config, log)` folds `dead`/`done` OUT (`:93` "values read out of this fold, never flags mutated"); live view and `analyze` are one replay, no drift.
- if it's concrete, it's a LITERAL: /"if its concrete, its a literal"/ · /"events are not symbols"/ — symbols are vocabulary only. Membership + measurements are data; positions/kinematics RE-DERIVE from current placements, never stored (`~/.viva/registry/stucatch/vivaware/domain/fold.js`, the contract).
- `mode.module.*` is the read-only DECLARATION: a trait mints its OWN live Vector, wires it, then slurps the declaration in — never `.use()` on `mode.module.X`. (`systems/runtime/daemon/traits/harnessed.js:200`)
```js
const harness = new Vector();                       // runtime/daemon/traits/harnessed.js:162
harness.use(…);
if (mode.module.harness) harness.slurp(mode.module.harness); // :180
mode.harness = shape.object(harness);
```
- a repository method caps at TWO positionals: `(where|data, opts?)` — `TurnRepository.history(where, opts?)` · `chain(data, opts?)` · `fold(tract, judge)` (`systems/runtime/daemon/entities/userspace/Turn.ts:8,12,25`), like `find`/`updateOne`/`feed` — /"scalable."/ /"extendable."/. `history`/`fold` = this repo's fifth ana/cata pair.
- a multi-file directory ALWAYS carries an `index.js` barrel (`export * as ns from "./x.js"` · `export * from` · selective); only a one-file dir whose index is exactly `export { X } from "./x.js"` is indirection tax — `stores/box/device/speaker/{speaker.js, worklet.js, index.js}`, never `speaker.js` + `speaker.worklet.js` siblings (`systems/anima/src/typology/stores/box/device/speaker/index.js`).

<!-- generated: python3 .ikiro/methods/codemap.py connoisseur — never hand-edited -->
```js
// subsystems/typology/gestalten/shape/object.js:5 — shape.object
export const object = (vector, execute = steer.strategy.request) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const namespace = {};
      for (const child of f.trajectories) namespace[child.key] = child.namespace;
      const compiled = f.effect !== undefined ? execute(f.carry, f.effect, f.steps, route(f.steps)) : undefined;
      const value = compiled !== undefined ? Object.assign(compiled, namespace) : namespace;
      return f.signature ? { key: f.signature.nature, namespace: value } : value;
    },
  });

export function proxy(vector, execute = steer.strategy.request) {
```
```js
// subsystems/typology/gestalten/steer/trie.js:8 — steer.fold
export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
```
```js
// subsystems/typology/gestalten/belt/middleware.js:1 — middleware.compose
export function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError("Middleware stack must be an array!");

  return function (context, next) {
    let index = -1;

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error("next() called multiple times"));

      index = i;

      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve(context);

      try {
```
```js
// subsystems/typology/gestalten/belt/atom.js:4 — atom.chain → bind
function bind(value, path, emit) {
  if (isStore(value)) {
    let inner = noop;
    const off = value.subscribe((next) => {
      inner();
      inner = bind(next, path, emit);
    });
    return () => {
      inner();
      off();
    };
  }
  if (!path.length) {
    emit(value ?? null);
    return noop;
  }
```
```js
// subsystems/typology/prototypes/pool.js:41 — Pool
export class Pool {
  items = [];

  static of(...args) {
    return new Pool().add(...args);
  }

  add(...args) {
    for (const arg of args) {
      switch (classify(arg)) {
        case "promise":
        case "pool":
        case "buffer":
          this.items.push(arg);
          break;
        case "nominal":
```
<!-- /generated -->
