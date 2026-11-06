<!-- writer: agent (lexicon: beef) · limit: 24000 chars · launch: .claude/rules/codestyle.md (symlink, no paths:) · ≥60% fenced code -->
# codestyle — 生きろ

/"i want truth. whatever makes things simple and corherent for us long term while expressing truth, thats us."/ · /"the lisp connoisseur ejaculates. thats the goal for your code."/

## protocol — each gate IS a hook; the hook body is the rule

- **VCS: READ git/jj freely, NEVER WRITE** — not on "go", not to recover. I propose, beef runs via `!`. Subcommand FIRST (`jj rebase` on "go. fix. cleanup." → 2755 files lost; 11-04 a stash in a `;` chain). **`~/.viva/registry/<pkg>` is jj too**: `jj describe -m` · `jj bookmark set master -r @` · `jj git push --bookmark master`, never `git add/commit` (REJECTED 11-09 /"idiot. we are on jj"/: detached HEAD, 274 mp3s swept); a grep pattern never spells a VCS verb.
```sh
# .ikiro/hooks/vcs-guard.sh:27
while read -r sub rest; do
  case "$sub" in
    log|status|show|diff|blame|shortlog|reflog|describe|grep|version|help) ;;
    ls-files|ls-tree|ls-remote|rev-parse|rev-list|show-ref|cat-file|whatchanged) ;;
    config)   grep -qE '^(get|--get|--get-all|--get-regexp|-l|--list)' <<<"$rest" || deny "git config: only reads (get/--list). Propose the write; beef runs it via !";;
    *)        deny "git $sub: graph/worktree mutation. VCS IS WRITE-PROTECTED — propose the exact command; beef runs it via !";;
  esac
# .ikiro/hooks/vcs-guard.sh:46
    log|st|status|show|diff|evolog|obslog|interdiff|root|help|version|cat|files) ;;
    op)     grep -qE '^log' <<<"$rest" || deny "jj op $rest: only 'jj op log' is read-only. Recovery is a graph mod. Propose; beef runs.";;
```
- **code + outward acts: propose → per-item `go`**. `.ikiro/` is mine. A ruled fork = go; only VCS is his `!`, rest I RUN (/"why waiting stupid"/). Probe code: /"just write stop asking."/
- **no completion claim without fresh verification. A ZERO IS A CLAIM** — a clean compile is no evidence: mount it, read the bundle. **A design he handed is the SPEC, verbatim** — markup · sheet · every interaction; HIS served screen BESIDE it, per region (REJECTED 10-22).
- **his edit is the spec** — a line `git diff HEAD` shows REMOVED is his kill: never re-add (10-12 `$telemetry` → /"NO. fuck. ill kill you if you try this again."/). **A guard is not a ruling** — report the block, never restate it as policy. **A ruling's counterexample is a MISWIRE to trace**, never a revert (REJECTED 10-24 m105 Q12: /"there cannot be a case where there is no thread"/).
```sh
# .ikiro/hooks/kill-guard.sh:15
killed=$(git -C "$root" diff HEAD -U0 -- "$path" 2>/dev/null | grep -E '^-[^-]' | sed -E 's/^-//; s/^[[:space:]]+//; s/[[:space:]]+$//' | awk 'length($0) > 12')
[ -n "$killed" ] || exit 0
present=$(sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' "$path")
```
- **evidence is taken on HIS side of the wire** — a command I hand him I ran first; it runs VERBATIM: no placeholder (11-09 `sk-…` landed in his `.env`), a secret = "row N, type it". An agent's world binds a FREE port, never his `:2501` · `:1794`; a copy's `.env` is HIS instance — a cwd without it (10-22). A walk ends clean (tabs · threads) — /"I WANT TO FUCKING MEET AN EMPTY BUFFER!!!"/
- **a library's limit is a probe** — "mikro cannot X" runs on `:memory:`.
- **`retard` · `i dont understand X` · a bare `what`** → `fold`. Second correction on one screen = the SHAPE is wrong; re-read his sketch. Propose after the area's live quest.
- **a rule carries its rejections** (`REJECTED: x — why`); every plan departure is reported. A diff <150 rows: inline; agents: opus, MEDIUM, a brief carries his RULED sections verbatim (11-09 `role.md`) and a guard deny is a STOP, never scripted around (11-09); a report I Write, never heredoc.
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
```
- `kernel-guard.sh:12` plans → `.ikiro/quests/` · `:21` public copy is fair-source, never open-source (LICENSE.md v2.1).
- **a guard logs its OWN class**, never a path or value (`vcs-guard.sh:8` `deny()`).
## his language

`go` · `commit` (disk, not VCS) = write-auth for THE item, never a sibling; `quest <n> go` on a TANGLED quest = apply per milestone, HOLY too (/"just get it in there"/); on a DESIGNED quest or a planning turn = the QUEST edits ONLY — a replay, a copy, a landed milestone IS execution (REJECTED 10-21 · 11-08 `m118 go` → /"i didnt say land yet. revert."/; twice → hook owed); praise ≠ go; `you do X` = ownership in the QUEST, not go (REJECTED 10-16) · `wait` · `stop` · `sotp` = zero actions · `stop asking` · `dont tell me. do` · `css shit` = session-sticky go · `blast` = map consumers; `blast change X go` = map, then act · `amen` = locked · `cleanup` = MY slop only, never his lines or `bak/` · `i suspect` = sketch, code on go · `study X` = READ, report what IS — no slop list · forks · `go?`; HE rules the slop (/"did i fucking tell you to do shit? no."/) · numerals (`5%` · `14 words`) are sticky contracts · rage-caps = stated twice before · typos ("dental" = deno) = parse, never ask · `give me versions` = STRUCTURALLY different candidates · `YES NO??` = one row each, five words · `what did we call X` · a noun he used = grep HIS turns (REJECTED 10-26 `/widget/toggle/entity` /"popover widgets!"/) · `artifact` · `inline` = a `.md` in the tree, NEVER the claude.ai tool · `harness` = PRIMER prose + the tools it arms, swappable, never mechanics (REJECTED 11-07 slots · gates /"i want a hanress"/) · `primer` = the Vector and its strip's key, `shape.strip`, nested (REJECTED 11-07 a flat `shape.primer.strip` /"mangled"/ · 11-08 /"call it primer too"/) · `ikiro mark` = canon now · a new name JOINS a metaphor family (ship · spell · food · animal · machine).

## comms

A report: his states as sections, his fields first (10-24 /"buried"/).

~50% of every answer is code; length is the ask's: `short answers` = 4 lines, y/n = one word (/"focus. one thing."/). Every fence: an empty row above AND below, prose never touches code (REJECTED 11-10 /"split fucking code from fucking yap"/), its path, code hugging it; **height over depth** — stack, never nest, one thing per row (11-06). Every path in prose too. A question names `file:line` and what he would see, never a bare noun; a failing call is named as the failure (REJECTED 11-10 /"cant exists"/); a value names its KIND (slug · id · row). A flag (SKETCH · gap · unruled · defect) names the code, the undecided, what BREAKS (the probe's output). Decision = context · code before · code after · the choice, one line — a closing fork too (REJECTED 11-10 `const daemon or inline?` /"without any fucking context"/). /"speak english to me"/ → paragraphs. Move → tree · rename → table · code → diff. Tables hold enums · numbers · symbols only; a count says `chars` · `rows`, never `lines`. A mechanism's label is its English name, never its code. Every `v.object(…)` ships with a passing JSON snapshot. Voice is data: beef verbatim AND the trigger.

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
// systems/anima/src/surfaces/chrome/panels/sidebar/sections.js:155 · :161
const STATES = [[(seated) => seated.some((a) => status(a) === "PAUSED"), () => "consent"], [() => true, () => "idle"]];
```

**9 · 10 — `steer.*` before a hand loop; total over the REAL domain, loud on failure.** A trait is CAST once at hydration (m105 Q4′) against `v.<entity>.traits`, defaults filled, invalid THROWS; reads are straight, `entity.trait.NAME`. `v` validates, never looks up (REJECTED 10-24 `v.thread.trait(thread, NAME)`); never `entity.trait?.NAME`, no helper over it (REJECTED 10-16 `reference(client)`).
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
// subsystems/typology/gestalten/steer/strategy.js:49
      input = step.input.cast(input);
      const errors = [...step.input.errors(input)];
      if (errors.length) throw new ValidationError(errors, signal);
```

**absence IS the signal** — no `?? {}` · `|| x` · `?.` without a grep proving it; a union carries a tag; zero readers (grep) = cut the EXISTING, no compat arm (/"not real. trash"/ 10-03) — bar a trait's surface (11-08) and a NEW surface in a quest: its caller is the quest's (REJECTED 11-09 the HARNESSED `/picture` leaf cut: /"its new. retard."/). **The mechanism IS the guard** — `let released = false` ✗ · `if (host.slug !== "runtime") throw` ✗ (/"very very very very stupid"/) → `fn.once`, a grafted-or-ABSENT route, a pruned trie.
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
// systems/runtime/subjects/mode/traits/tooling.js:1
export const TOOLING = (mode) => {
  if (!mode.module.tools) return;
  mode.tools.graft(mode.module.tools);
};
// subsystems/typology/gestalten/shard/datamap.js:189
  if (only) for (const nature of [...aperture.trie.keys()]) if (!only.includes(nature.replace(/^\//, ""))) aperture.trie.delete(nature);
```

**names** — full, by FP role (`fold` · `pour` · `drain`), naming the PAIR; a ctx is `<vector>Die`. `t d p cfg` ✗. **`row` ✗ → ENTITY, prose and replies too** (REJECTED 11-10 ×2 /"stop using Row when you mean ENityt!!!!!"/ → hook owed). `verb` ✗ → a repl effect · a tool · a route. `door` · `drivers` ✗ → `shellDie`, a ctx key is a PROPERTY; an aperture OPENS. `line` ✗ → signal (/"LINES doesnt exists"/), a probe's payload too. `place` ✗. `.host` ✗ — `shard.host` is a gestalten drawer, never a property: name runtime · daemon (REJECTED 11-10 `mode.host` /"we. name. shit. by. its. name."/). A local is the THING's name, never a role: `child` · `shown` · `branch` ✗ → `thread` · `journal` (/"call it by its fucking name"/). Every `.desc(` ends `Example: …`. `input`/`output` = a SCHEMA on signatures, the payload on `ctx`; no input → `(ctx)`, never `(_, ctx)`: `fire` reads arity (11-08 /"signature wrong. _ not needed."/)
```js
// systems/runtime/gestalten/tools/mode.js:25
    input: v.object({
      type: v.string().optional().desc('A mode type. Example: "office"'),
      slug: v.string().optional().desc('A mode slug. Example: "vdex"'),
    }),
```

**no intermediary** — `clientDie.client.runtime.x` inline, never `const { client } = clientDie`, never a ctx bag of derived keys (/"just {terminal"/) — nor a host bag (`parentDie.context` ✗ 11-09). An entity hangs only what a reader greps — `entity.runtime` ✗ (11-06). A gated route is `branch(…).use(gate).do(effect)`, inline even when shared (/"Keep the branch do"/). An ungated leaf is one `open("/a/b")`, never `.branch("/a").open("b")`. **A mechanism is SHOWN, never wrapped**: two entries are two functions, never `Object.fromEntries` over a config, a static set a LITERAL where mounted (REJECTED 11-06 `Object.keys(sets.traits)` /"just hardcode the set inline"/); a new mechanism is a blunt `testament/prototypes/<name>/run.js` first. **Thin first**: no verb · belt fn · typology lift until a second consumer (04-04). Stop-tells: an options bag on a positional; a flag undoing a flag. **Legible over dense** — flat, spaced, one expression per line; a row ≤100 chars, MY fences too: an object of 2+ keys, a spread list, a `.desc(` break one per row (REJECTED 11-10 /"NOT FUCKING WRITE WIDE CODE"/); a one-off lambda sits where it runs.

**a function's HOME is its first parameter**: `boot(lighthouse)` ✓, `lighthouse.boot()` ✗. **A SUBJECT runs and owns a directory** (m91): `subjects/<subject>/prototype.js` (class) · `repository.js` · `hydration.js` (its row `entities/<Subject>.ts`, REJECTED 10-26 in its dir) · `factory.js` (a kleisli MAKES the thing — no die, no effect; REJECTED 10-25 `.do(client.factory(…))`) · `lifecycle/index.js` (`execution` + `1-population.js · 2-resolution.js · 3-integration.js`, 11-04; construct implicit, disintegrate = a beat's `finally`; a beat runs a vector: `steer.dispatch.execute(vector, die)`) · `traits/<NAME>.js` + `traits/index.js` (the catalog) · `commands/` · `apertures/`. Unowned → `entities/` (does not run) · `prototypes/` (no boot) · `gestalten/` = TOOLING, blind to client · terminal · mode · paladin (REJECTED 10-21 `shard/keymap.js` — /"Gestalten is only for abstract things."/): `shard/` (`(ctx, next)` of two subjects) · `belt/` (plain over data, never `(ctx, …)` — REJECTED 10-24 `belt.dock.docked`) · `tools/` (named by its OBJECT). `typology.js` exports PREDICATES, never a subject. REJECTED: object-first · `executions/`. An execution closes what it opened in its OWN `finally`.
```js
// systems/runtime/subjects/runtime/lifecycle/index.js:13
export const execution = new Vector()
// systems/runtime/subjects/runtime/lifecycle/2-resolution.js:11
export const services = (factory) => async (die, next) => {
  try {
    await monad.traverse(Object.values(die.runtime.services), (service) => factory(service)(die));
    await next();
  } finally {
    await Promise.all(Object.values(die.runtime.services).map((service) => service.controller.kill("SIGTERM")));
  }
};
```

**a vector exports as a VALUE grafted onto its parent, never a factory; the trait function IS the dispatch** — one file per trait; the trait's body lives in its module (REJECTED: on the TERMINAL). `mode.module.*` is the DECLARATION: a trait mints its OWN Vector, then grafts it in. `graft` COPIES carry, `use` PUSHES — a re-mounted surface stacks a second tap. A barrel grafts WHOLE.
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

**a system's beat READS paladin** (11-04): env · mask · spawn = `paladin.scope` · `instance.mask(slug)` · `instance.specs(…)` · `ledger.boot`; an Instance capability is a METHOD on its prototype, grep paladin first. REJECTED: ghost `carried` · `specs` · `clients.find` copied.

**entity capability = a REPOSITORY METHOD on both sides, mikro-first** (/"we design mikro-orm first! mark that."/): repository method → typology contract → `shard.datamap.repository` → `RemoteRepository` → UI. `thread.call = connection.branch(…)` ✗ (/"inside out"/); ≤2 positionals `(where|data, opts?)`. An entity: mikro + typology, never paladin; disk patrol = a lifecycle beat (/"dumbest anti-pattern"/). Invariant → its entity's twitch (REJECTED 10-26 a beat: /"embedded like the other entities"/). A hook reads `ctx.input.em` READY: the dispatch forks once (`shape.subscriber` `fork`); never `em.fork()` · `setFilterParams` in a hook (REJECTED 10-29).
```js
// subsystems/typology/gestalten/shard/datamap.js:170
  aperture.post("/updateOne", scoped("where", (input, ctx) => of(ctx).updateOne(input.where || {}, input.data || {})));
// subsystems/typology/entities/Turn.ts:13
  history(where, opts?) {
    return this.find(where, { ...opts, orderBy: { createdAt: "ASC" } });
  }
  async chain(data, opts?) {
    const parent = data.parent ?? (await this.history({ thread: data.thread }, opts)).at(-1) ?? null;
```

**a `$`-store ships a plain getter**; never `mode.$intents?.get() ?? []` — one `computed` per `$field`; a field beside a store IS a store (REJECTED 11-09 ghost `Buffer.files = []`).
```js
// systems/anima/src/box/device/speaker/speaker.js:8
  $claimed = atom(false);
// systems/anima/src/box/device/speaker/speaker.js:21
  get claimed() { return this.$claimed.get(); }
```

**structure** — one child = a rename, not a directory (/"2 bad. thats just a directory around each file."/); a multi-file dir carries an `index.js` barrel; a `gestalten/` member is a DIRECTORY with its barrel, never a root file (11-09 /"thats not how gestlatne work"/); cluster by what co-varies. `manifest` is metadata. **If it's concrete, it's a LITERAL** (/"events are not symbols"/). **Mask keys are SEMANTIC**, lookup surfaces LEXICAL (`daemon.modes.<type>.<slug>`); `mask` → `module` → `mode`. **A package's thing rides its ROOT barrel** — no subpath (11-04 `ghost/host` cut).
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
```

**client is domain-blind** (`map.md`). A gesture · key dispatches a repl line (REJECTED 10-26 `presses.enqueue` /"not the same as a leader key"/ · keymap `$catalog.set` /"via keymap+repl?"/). A buffer row IS the screen: selection · cursor · draft → `buffer.data` (/"state should include my current sleecteds!"/). A hex literal in a view is a defect — the dapper token is the answer.
```js
// systems/ghost/surfaces/chrome/index.js:24
  const erase = paint(renderer.root, renderer, tokens("northsea", "2"), panes.chrome, { client, accept: [mime.tty.solid, mime.json] });
```

**tests** — a repo test never reads THIS MACHINE; census = `HOME=<empty dir>` (/"stub in a temp"/). A merge/copy suite ends with "source is not mutated". A re-resolvable scope is derived at USE, never frozen at import.
```js
// systems/runtime/tests/scenarios/hello.js:88
  const root = await Deno.makeTempDir({ prefix });
```

## weak flanks

client/CSS (`codemap/design.md`) · large blasts · overproduction.
