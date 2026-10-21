<!-- writer: agent (lexicon: beef) · limit: 24000 chars · launch: .claude/rules/codestyle.md (symlink, no paths:) · ≥60% fenced code -->
# codestyle — 生きろ

/"i want truth. whatever makes things simple and corherent for us long term while expressing truth, thats us."/ · /"the lisp connoisseur ejaculates. thats the goal for your code."/

## protocol — each gate IS a hook; the hook body is the rule

- **VCS: READ git/jj freely, NEVER WRITE** — not on "go", not to recover. I propose, beef runs via `!`. Subcommand FIRST (`jj rebase` on "go. fix. cleanup." → 2755 files lost).
```sh
# .ikiro/hooks/vcs-guard.sh:27
while read -r sub rest; do
  case "$sub" in
    log|status|show|diff|blame|shortlog|reflog|describe|grep|version|help) ;;
    ls-files|ls-tree|ls-remote|rev-parse|rev-list|show-ref|cat-file|whatchanged) ;;
    config)   grep -qE '^(get|--get|--get-all|--get-regexp|-l|--list)' <<<"$rest" || deny "git config: only reads (get/--list). Propose the write; beef runs it via !";;
    *)        deny "git $sub: graph/worktree mutation. VCS IS WRITE-PROTECTED — propose the exact command; beef runs it via !";;
  esac
done < <(grep -oE '(^|[;&|(`[:space:]])git[[:space:]]+[[:alnum:]_-]+([[:space:]]+[^[:space:];&|`]+)?' <<<"$normalized" | sed -E 's/^[^g]*git[[:space:]]+//')
# .ikiro/hooks/vcs-guard.sh:46
    log|st|status|show|diff|evolog|obslog|interdiff|root|help|version|cat|files) ;;
    op)     grep -qE '^log' <<<"$rest" || deny "jj op $rest: only 'jj op log' is read-only. Recovery is a graph mod. Propose; beef runs.";;
```
- **code + outward acts: propose → per-item `go`**. `.ikiro/` is mine. A ruled fork = go; only VCS is his `!`, rest I RUN (/"why waiting stupid"/ · /"you fucking do it."/). Probe code: /"just write stop asking. its all temporary anywys."/
- **no completion claim without fresh verification. A ZERO IS A CLAIM** — a clean compile is no evidence: mount it, read the served bundle. **A design he handed is the SPEC, verbatim** — markup · sheet · every interaction; the verifier sets HIS served screen BESIDE it, per region (REJECTED 10-22 /"the design is wholy insufficient"/ · 10-27 /"wtf are those????"/).
- **his edit is the spec** — a line `git diff HEAD` shows REMOVED is his kill: never re-add (10-12 `$telemetry` → /"NO. fuck. ill kill you if you try this again."/). **A guard is not a ruling** — report the block, never restate it as policy. **A ruling's counterexample is a MISWIRE to trace**, never a revert (REJECTED 10-24 m105 Q12: /"there cannot be a case where there is no thread"/).
```sh
# .ikiro/hooks/kill-guard.sh:15
killed=$(git -C "$root" diff HEAD -U0 -- "$path" 2>/dev/null | grep -E '^-[^-]' | sed -E 's/^-//; s/^[[:space:]]+//; s/[[:space:]]+$//' | awk 'length($0) > 12')
[ -n "$killed" ] || exit 0
present=$(sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' "$path")
reborn=$(while IFS= read -r line; do
  grep -qxF -- "$line" <<<"$present" && continue
  grep -qF -- "$line" <<<"$incoming" && printf '%s\n' "$line"
done <<<"$killed")
[ -n "$reborn" ] || exit 0
```
- **evidence is taken on HIS side of the wire** — a command I hand him I ran first. An agent's world binds a FREE port, never his `:2501` · `:1794`; a copy's `.env` is HIS instance — a cwd without it (10-22). A walk ends clean (tabs · threads) — /"I WANT TO FUCKING MEET AN EMPTY BUFFER!!!"/
- **a library's limit is a probe** — "mikro cannot X" runs on `:memory:`.
- **`retard` · `i dont understand X` · a bare `what`** → `fold`. Second correction on one screen = the SHAPE is wrong; re-read his sketch. Propose only after the area's live quest (REJECTED 10-25 `subjects/surface/`).
- **a rule carries its rejections** (`REJECTED: x — why`); every departure from plan is reported. A diff under ~150 lines: inline; agents: opus, MEDIUM; a brief carries his rulings (REJECTED 10-26 `[ █]`).
- **no comments in product source** — a comment is the rename you didn't make.
```sh
# .ikiro/hooks/comment-guard.sh:27
case "$path" in
  *test*|*/bak/*|*.md|*.org|*.json|*.jsonc) exit 0 ;;
  */commons/*|*/systems/*|*/subsystems/*) ;;
  *) exit 0 ;;
esac
content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
hits=$(grep -nE '^[[:space:]]*(//|/\*)|[^:]//|[[:space:]]/\*' <<<"$content" \
       | grep -vE '@beef|TODO|eslint|prettier|@ts-|https?:' || true)
```
- **every `.ikiro` file carries `limit: N chars`**; over cap: consolidate, never evict. Prose never rides a heredoc.
```py
# .ikiro/methods/cap.py:16
LIMIT = re.compile(r"limit: (\d+) chars")
# .ikiro/methods/cap.py:33
CODEMAP_TOTAL = 52000
```
```sh
# .ikiro/hooks/kernel-guard.sh:12
case "$path" in
  */docs/superpowers/plans/*) reason="plans are quests in .ikiro/quests/ (skill quest), never docs/superpowers/plans/"; class=plan-placement ;;
esac
# .ikiro/hooks/kernel-guard.sh:21
  grep -qiE '\bopen[- ]source\b' <<<"$content" || exit 0
  reason="public copy says fair-source, source-available — never open-source (LICENSE.md v2.1)"; class=open-source-copy
```
- **a guard logs its OWN class**, never a path or value.
```sh
# .ikiro/hooks/vcs-guard.sh:8
deny() {
  printf '%s vcs-guard deny %s %s\n' "$(date +%s)" "$session" "$(cut -d: -f1 <<<"$1" | tr ' ' '-')" >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null
  …
}
```
## his language

`go` · `commit` (disk, not VCS) = write-auth for THE item, never a sibling; `quest <n> go` on a TANGLED quest = apply per milestone, HOLY too (/"just get it in there"/); on a planning turn = the QUEST edits — a replay or new files on a copy IS execution (REJECTED 10-21 /"no filesystem updates yet … just quest level"/); praise ≠ go; `you do X` = ownership in the QUEST, not go (REJECTED 10-16) · `wait` · `stop` · `sotp` = zero actions · `stop asking` · `dont tell me. do` = session-sticky go · `blast` = map consumers; `blast change X go` = map, then act · `amen` = locked · `cleanup` = MY slop only, never his lines or `bak/` · `i suspect` = sketch, code on go · `study X` = READ and report what IS — no slop list, no forks, no `go?`; HE rules the slop (/"did i fucking tell you to do shit? no."/) · numerals (`5%` · `14 words`) are sticky contracts · rage-caps = stated twice before · typos ("dental" = deno) = parse, never ask · `give me versions` = STRUCTURALLY different candidates · `YES NO??` = one row each, five words · `what did we call X` · a noun he used = grep HIS turns (REJECTED 10-26 `/widget/toggle/entity` → the sidebar: /"popover widgets!"/) · `artifact` · `inline` = a `.md` in the tree, NEVER the claude.ai tool · `ikiro mark` = canon now · a new name JOINS a metaphor family (ship · spell · food · animal · machine).

## comms

A report: his states as sections, his fields first (10-24 /"buried"/).

~50% of every answer is code (/"responses should be 50% code from now on"/). Every fence opens with its container-rooted path; every path in prose too — /"WHAT FFFFFIIIILLLEEEE?????? context bro"/. A question names `file:line` and what he would see, never a bare noun or fork label (/"What record? There's a shit ton of records in there."/). A flag (SKETCH · gap · unruled · defect) names the code, what is undecided, what BREAKS (the probe's output) — never the label. Decision = context · code before · code after · the choice in one line. /"speak english to me"/ → paragraphs. Move → tree · rename → table · code → diff. Tables hold enums · numbers · symbols only (/"what is what???"/). A label for a mechanism is its English name ("empty function — accepted, does nothing"), never its code. Every `v.object(…)` ships with a passing JSON snapshot. Voice is data: beef verbatim AND the trigger.

## code — one structure, one law, made visible

Triggers (aim 1–14, beef catches 15–19): 1 traversal IS dispatch · 2 state = `reduce(events)` · 3 one combinator, cases as data · 4 self-priming · 5 branch on the live value · 6 closure-objects, no `this` · 7 cata/ana pairs · 8 recursion mirrors the data · 9 `steer.*` before a hand loop · 10 total over the REAL domain, loud on failure — /"THERE IS ONE WAY THIS WORKS!!!"/ · 11 `[[predicate, tag]]` discriminator · 12 name the algebra · 13 suspension as a value · 14 minimal delta for MY additions, engagement for HIS redesigns · 15 write at the owner · 16 no second epicycle — offer from-scratch · 17 the mechanism already computes it · 18 the bag is the missing contract (/"contract both sides"/) · 19 the surface is grepped, never remembered. /"functions judged by EFFECT, not internal model"/

**1 · 3 · 8 — one fold; `shape.object`, `shape.strip`, `survey` are `node` cases over it, never three walkers.**
```js
// subsystems/typology/gestalten/steer/trie.js:16
export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
  const here = { ...frame, carry: descend(frame.carry, vector) };
  const trajectories = [...vector.trie.values()].map(({ pattern, trajectory }) =>
    fold(trajectory, step, { ...here, signature: pattern, steps: [...here.steps, pattern], signal: here.signal.branch(pattern.nature) }),
  );
  return step.node({ ...here, effect: vector.effect ?? undefined, trajectories });
}
```
```js
// subsystems/typology/gestalten/steer/dispatch.js:9
export const execute = (vector, context, signal = new Signal()) => {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  const [effect, carry] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return carry(context, resolve(effect));
};
```
```js
// subsystems/typology/gestalten/shape/strip.js:15
export const strip = (vector = new Vector(), pluck = edgeMeta) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const branches = Object.fromEntries(f.trajectories.map((c) => [c.key, c.node]));
      const node = { branches };
      if (f.effect !== undefined) node.effect = pluck(f.signature, f.effect);
      return f.signature ? { key: f.signature.nature, node } : node;
    },
  });
```

**2 · 7 — every cata names its ana**: `soma.pour` ⟷ `soma.drain` · `shape.strip` ⟷ `shape.connection.wire` · `history` ⟷ `chain`.
```js
// subsystems/typology/gestalten/belt/soma.js:3
export function pour(turn, packet) {
  switch (packet.event) {
    case "/turn/open":
      return { ...packet.turn, parts: [] };
    case "/part/open":
      turn.parts[packet.index] = { ...packet.part };
      break;
// subsystems/typology/gestalten/belt/soma.js:85
export function* drain(turn) {
  yield { event: "/turn/open", turn: { role: turn.role } };
  for (let index = 0; index < turn.parts.length; index++) {
```
```js
// subsystems/typology/gestalten/shape/connection.js:1
export function wire(connection, node) {
  const api = {};
  for (const [segment, child] of Object.entries(node?.branches ?? {})) {
    if (segment.startsWith(":")) { parameter = child; continue; }
    api[segment] = wire(connection.branch(`/${segment}`), child);
  }
  let result = node?.effect ? Object.assign(aim(connection, node.effect), api) : api;
```

**4 — inside typology a schema is STATIC, `v` from `../v.js`, never the barrel** (/"static not thunks"/ 10-21). No exception: an embedded entity is the opaque arm (`Yield`, m96 Q2). Async setup memoizes its in-flight PROMISE, never a boolean.
```js
// subsystems/typology/schematics/primitives/harness.js:1
import { v } from "../v.js";
export const Signal = v.object({ nature: v.string().desc('The effect\'s route. Example: "/mode/console/whoami"'), …
```
```js
// subsystems/typology/gestalten/belt/fn.js:49
export const inflight = (fn, { retry = true } = {}) => {
  let promise = null;
  return (...args) =>
    (promise ??= Promise.resolve(fn(...args)).catch((error) => { if (retry) promise = null; throw error; }));
};
```

**6 · 11 — closure-objects; a discriminator is a `[[predicate, tag]]` table.**
```js
// subsystems/typology/gestalten/belt/atom.js:25
export function chain(root, ...path) {
  return { subscribe(run) { return bind(root, path, run); } };
}
// systems/ghost/surfaces/chrome/keys.js:9
const CHORDS = [
  [(event) => event.ctrl, (event) => `ctrl-${named(event)}`],
  [(event) => event.meta, (event) => `meta-${named(event)}`],
  [(event) => PRINTABLE.test(event.sequence), (event) => event.sequence],
  [() => true, named],
];
export const press = (event) => ({ key: CHORDS.find(([test]) => test(event))[1](event) });
```

**9 · 10 — `steer.*` before a hand loop; total over the REAL domain, loud on failure.** A trait is CAST at hydration (m105 Q4′): hydration casts `trait` once against `v.<entity>.traits`, defaults filled, invalid THROWS; reads are straight, `entity.trait.NAME`. `v` validates, never looks up (REJECTED 10-24 `v.thread.trait(thread, NAME)` /"it's a library for validation, not for looking up stuff"/); never `entity.trait?.NAME`, never a helper over it (REJECTED 10-16 `reference(client)`).
```js
// subsystems/typology/gestalten/belt/hallucinate.js:52
const armory = (tools) =>
  steer.trie.rollup(tools, () => null).map((entry) => nameOf(entry.steps)).join(", ");
// systems/ghost/entities/thread/hydration.js — m105 Q4′
  ctx.entity.trait = belt.traits.cast(ctx.entity, v.thread.traits);
// systems/ghost/subjects/terminal/stall.js — m105 Q4′
    return this.terminal.thread.trait.QUEUEING.depth;
```
```js
// subsystems/typology/gestalten/steer/strategy.js:46
export const guarded = (carry, effect, steps, signal) => async (input) => {
  for (const step of steps) {
    if (step.input) {
      input = step.input.cast(input);
      const errors = [...step.input.errors(input)];
      if (errors.length) throw new ValidationError(errors, signal);
    }
  }
```

**absence IS the signal** — no `?? {}` · `|| x` · `?.` without a grep proving the case; a union carries a tag. **The mechanism IS the guard** — `let released = false` ✗ · `if (host.slug !== "runtime") throw` ✗ (/"very very very very stupid"/) → `fn.once`, a grafted-or-ABSENT route, a pruned trie.
```js
// subsystems/typology/gestalten/belt/fn.js:1
export const once = (fn) => {
  let called = false;
  return function (...args) {
    if (called) return;
    called = true;
    return fn.apply(this, args);
  };
};
// systems/anima/src/entities/buffer.js:64
    mount: (callback) => {
      this.hooks.mount.push(fn.once(callback));
      return this;
    },
// systems/runtime/subjects/mode/traits/tooling.js:1
export const TOOLING = (mode) => {
  if (!mode.module.tools) return;
  mode.tools.graft(mode.module.tools);
};
// subsystems/typology/gestalten/shard/datamap.js:189
  if (only) for (const nature of [...aperture.trie.keys()]) if (!only.includes(nature.replace(/^\//, ""))) aperture.trie.delete(nature);
```

**names** — full, by FP role (`fold` · `pour` · `drain`), naming the PAIR; a ctx is `<vector>Die` (m105: `stallCtx`). `t d p cfg` · `row` ✗. `verb` ✗ (/"a nothing word"/ 10-21) → a repl effect · a tool · a route. `door` · `drivers` ✗ → `shellDie`; an aperture OPENS. `line` ✗ → signal (/"LINES doesnt exists"/) — a probe's payload too, its output is quoted (word-guard 10-26: `"line 0"`). `place` ✗ (10-25). A local is the THING's name, never a role: `child` · `shown` · `branch` ✗ → `thread` · `journal` (/"call it by its fucking name"/). Every `.desc(` ends `Example: …`. `input`/`output` = a SCHEMA on signatures, the payload on `ctx`
```js
// systems/runtime/gestalten/tools/mode.js:25
    input: v.object({
      type: v.string().optional().desc('A mode type. Example: "office"'),
      slug: v.string().optional().desc('A mode slug. Example: "vdex"'),
    }),
```

**no intermediary** — `clientDie.client.runtime.x` inline, never `const { client } = clientDie`, never a ctx bag of derived keys (/"just {terminal"/). A gated route is `branch(…).use(gate).do(effect)`, inline even when shared (/"Keep the branch do"/). **A mechanism is SHOWN, never wrapped**: two entries are two functions, never `Object.fromEntries` over a config; a new mechanism is a blunt `testament/prototypes/<name>/run.js` first. Stop-tells: an options bag on a positional; a flag undoing a flag. **Legible over dense** — flat, spaced, one expression per line; a one-off lambda sits where it runs (REJECTED 10-23 /"inline, high depth … fewer implied function with one-off names"/).

**a function's HOME is its first parameter**: `boot(lighthouse)` ✓, `lighthouse.boot()` ✗. **A SUBJECT runs and owns a directory** (m91): `subjects/<subject>/prototype.js` (class · `repository` · `hydration`; its row `entities/<Subject>.ts`, REJECTED 10-26 in its dir) · `factory.js` (a kleisli MAKES the thing: its result is no die, no effect — REJECTED 10-25 `.do(client.factory(…))` · `surfaceDie = await monad.kleisli(…)`) · `lifecycle/index.js` (the Vector `execution` last + PHASE files; a beat runs a vector: `steer.dispatch.execute(vector, die)`) · `traits/<NAME>.js` + `traits/index.js` (the catalog) · `commands/` · `apertures/`. Unowned → `entities/` (does not run) · `prototypes/` (no boot) · `gestalten/` = TOOLING, blind to client · terminal · mode · paladin (REJECTED 10-21 `shard/keymap.js` — /"Gestalten is only for abstract things."/): `shard/` (`(ctx, next)` of two subjects) · `belt/` (plain over data, never `(ctx, …)` — REJECTED 10-24 `belt.dock.docked`) · `tools/` (named by its OBJECT). `typology.js` exports PREDICATES, never a subject. REJECTED: object-first · `executions/`. An execution closes what it opened in its OWN `finally`.
```js
// systems/runtime/subjects/runtime/lifecycle/index.js:13
export const execution = new Vector()
// systems/runtime/subjects/runtime/lifecycle/resolution.js:11
export const services = (factory) => async (die, next) => {
  try {
    await monad.traverse(Object.values(die.runtime.services), (service) => factory(service)(die));
    await next();
  } finally {
    await Promise.all(Object.values(die.runtime.services).map((service) => service.controller.kill("SIGTERM")));
  }
};
```

**a vector exports as a VALUE grafted onto its parent, never a factory; the trait function IS the dispatch** — one file per trait; the trait's body lives in its module (REJECTED: on the TERMINAL). `mode.module.*` is the DECLARATION: a trait mints its OWN Vector, then grafts it in. `graft` COPIES carry, `use` PUSHES — a re-mounted surface stacks a second tap.
```js
// systems/ghost/subjects/client/commands/quit.js:3
export const quit = new Vector().open(
  { nature: "/quit", valence: "leave — the client stops, the shell exits 0. Example: /quit" },
  (ctx) => ctx.client.controller.kill("SIGTERM", "quit"),
);
// systems/ghost/subjects/client/lifecycle/index.js:40
  clientDie.repl.graft(commands.help, commands.quit);
```
```js
// subsystems/typology/gestalten/belt/traits.js:6
export async function stagger(module, context, traits) {
  const finalizers = [];
  for (const name of module.manifest.traits) {
    const result = await traits[name]?.(module, context);
    if (is.fn(result)) finalizers.push(result);
// systems/runtime/subjects/mode/traits/harnessed.js:222 · :244 · :262
  const harness = new Vector()
    .use(shard.context.spread(contexts.host, context))
    .use(shard.context.bind("mode", mode))
  if (mode.module.harness) harness.graft(mode.module.harness);
    mode.harness = shape.object(harness, steer.strategy.echo);
```
```js
// subsystems/typology/prototypes/vector.js:57
  graft(...vectors) {
    for (const vector of vectors) {
      if (vector === this) continue;
      if (vector.effect) this.effect = vector.effect;
      for (const [nature, edge] of vector.trie) {
        const existing = this.trie.get(nature);
        const branch = existing?.trajectory ?? new this.constructor(this, this.signature);
        branch.graft(edge.trajectory);
        if (existing) existing.pattern = edge.pattern;
        else this.trie.set(nature, { pattern: edge.pattern, trajectory: branch });
      }
      this.carry.push(...vector.carry);
    }
```

**entity capability = a REPOSITORY METHOD on both sides, mikro-first** (/"we design mikro-orm first! mark that."/): repository method → typology contract → `shard.datamap.repository` → `RemoteRepository` → UI. `thread.call = connection.branch(…)` ✗ (/"inside out"/); ≤2 positionals `(where|data, opts?)`. An entity: mikro + typology, never paladin; disk patrol = a lifecycle beat (/"dumbest anti-pattern"/). Invariant → its entity's twitch (REJECTED 10-26 a beat: /"embedded like the other entities"/). A hook reads `ctx.input.em` READY: the dispatch forks once (`shape.subscriber` `fork`); never `em.fork()` · `setFilterParams` in a hook (REJECTED 10-29).
```js
// subsystems/typology/gestalten/shard/datamap.js:170
  aperture.post("/updateOne", scoped("where", (input, ctx) => of(ctx).updateOne(input.where || {}, input.data || {})));
// systems/runtime/entities/Turn.ts:13
  history(where, opts?) {
    return this.find(where, { ...opts, orderBy: { createdAt: "ASC" } });
  }
  async chain(data, opts?) {
    const parent = data.parent ?? (await this.history({ thread: data.thread }, opts)).at(-1) ?? null;
```

**a `$`-store ships a plain getter**; never `mode.$intents?.get() ?? []` — one `computed` per `$field`.
```js
// systems/anima/src/box/device/speaker/speaker.js:8
  $claimed = atom(false);
// systems/anima/src/box/device/speaker/speaker.js:21
  get claimed() { return this.$claimed.get(); }
```

**structure** — one child = a rename, not a directory (/"2 bad. thats just a directory around each file."/); a multi-file dir carries an `index.js` barrel; cluster by what co-varies. `manifest` is metadata. **If it's concrete, it's a LITERAL** (/"events are not symbols"/). **Mask keys are SEMANTIC**, lookup surfaces LEXICAL (`daemon.modes.<type>.<slug>`); `mask` → `module` → `mode`. **A package's thing rides its ROOT barrel** — one subpath, `@vivalence/ghost/host` (10-24 /"make /host the one fucking exception"/).
```js
// subsystems/typology/schematics/primitives/instance.js:12
export const Mask = v.object(
  { module: v.string(), statics: Statics().optional(), secrets: Secrets.optional() },
  { additionalProperties: true },
);
```

**universal over parochial** — `^(https?|wss?)://\S+$` ✗ → RFC 3986 productions, named ✓ (/"build something that is not for our case, but coherencely universally true."/). No hidden rule over an explicit grammar (/"this is iffy as fuck. dont like."/) → the repository's own `$all · $in · $none`. **A provider translates ONE request**; `belt.hallucinate` owns the session.
```js
// subsystems/typology/schematics/scalars/url.js:17
export const PATTERN = `^${SCHEME}://${USERINFO}${HOST}${PORT}${PATH}${QUERY}${FRAGMENT}$`;
export const url = (opts) =>
  v.string({ pattern: PATTERN, title: "RFC 3986 URI with an authority (scheme://…)", ...opts });
// subsystems/typology/gestalten/belt/hallucinate.js:92
        steer.dispatch.invoke(armed, new ToolCall(call.name).signal, steer.strategy.guarded)(call.input),
```

**client is domain-blind** (`map.md`). A gesture · key dispatches a repl line (REJECTED 10-26 `presses.enqueue` /"not the same as a leader key"/ · keymap `$catalog.set` /"via keymap+repl?"/). A buffer row IS the screen: selection · cursor · draft → `buffer.data` (/"state should include my current sleecteds!"/). A hex literal in a view is a defect — the dapper token is the answer.
```js
// systems/ghost/surfaces/chrome/index.js:24
  const erase = paint(renderer.root, renderer, tokens("northsea", "2"), panes.chrome, { client, accept: [mime.tty.solid, mime.json] });
```

**tests** — a repo test never reads THIS MACHINE; census = `HOME=<empty dir>` (/"stub in a temp"/). A merge/copy suite ends with "source is not mutated". NEVER `deno fmt`. A re-resolvable scope is derived at USE, never frozen at import.
```js
// systems/runtime/tests/scenarios/hello.js:88
  const root = await Deno.makeTempDir({ prefix });
// systems/runtime/tests/scenarios/hello.js:125
  const child = new Deno.Command(Deno.execPath(), { …, cwd: join(root, "instance"), env: { ...carried, ...env }, clearEnv: true,
```

## weak flanks

client/CSS · large blasts · overproduction. `canary` → `生きろ`.
