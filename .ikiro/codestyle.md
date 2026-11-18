<!-- writer: agent (lexicon: beef) · limit: 39800 chars · launch: .claude/rules/codestyle.md (symlink) · ≥60% fenced code -->
# codestyle — 生きろ

/"i want truth. whatever makes things simple and corherent for us long term while expressing truth, thats us."/ · /"the lisp connoisseur ejaculates. thats the goal for your code."/

## protocol — each gate IS a hook; the hook body is the rule

- **VCS: READ git/jj freely, NEVER WRITE** — not on "go", not to recover. I propose, beef runs via `!`. Subcommand FIRST (`jj rebase` on "go. fix. cleanup." → 2755 files lost; 11-04 a stash in a `;` chain). **`~/.viva/registry/<pkg>` is jj too**: `jj describe -m` · `jj bookmark set master -r @` · `jj git push --bookmark master`, never `git add/commit` (REJECTED 11-09 /"idiot. we are on jj"/); a grep pattern never spells a VCS verb.
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
- **code + outward acts: propose → per-item `go`**. `.ikiro/` is mine, never a `go?` (11-20 a quest re-anchor asked). A ruled fork = go; only VCS is his `!`, rest I RUN (/"why waiting stupid"/). Probe code: /"just write stop asking."/
- **no completion claim without fresh verification. A ZERO · EVERY IS A CLAIM, rows WHOLE** — a zero greps the DIRECTORY, never the one file read (11-19 "no test" off `populate.test.js`), a `has no X` of a subject its CLASS file, wherever it lives (11-20 "a mode has no status", `typology/prototypes/mode.js:10`), BOTH clients for a client claim (11-19 "no disabled mic" off ghost; anima had it), its paths typed out: zsh never splits a `$VAR` of several (11-19 nine false zeros, 11-20 `set -- $spec`: six suites never ran; a loop over specs is a `sh` FILE), its listing WHOLE, never `head`-cut (11-19 `.tables | head -5` hid `Mode`), a KEY grepped quoted AND bare, its `Object.keys` readers too (11-20 "seven files", eleven); a COUNT in an ask he will rule on is the measuring command's (11-21 `nine files` off a summary, `diff -rq` said ten, after his `land`) and a `file:line` is grepped BEFORE it is written, a quest too (11-21 `:76` for `:78` · `×3 copies` for two), a count RESTATED after one more edit is re-measured (11-21 `20 files` through two reports, 21 since a layer before); a clean compile ≠ evidence: mount it, read the bundle; a command via its panel's ENTER, bare · argued, not `run()` (11-16); a census never silences its own stderr (11-21 `2>/dev/null` over options typed after `--`: a count said `no tests · bak`, it held both). **A design he handed is the SPEC, verbatim** — markup · sheet · every interaction; HIS served screen BESIDE it, per region (REJECTED 10-22).
- **his edit is the spec** — a `git diff HEAD` REMOVED line is his kill: never re-add (10-12 `$telemetry` → /"NO. fuck. ill kill you if you try this again."/). **A guard is not a ruling** — report a block · a warn, that turn; never policy. **A counterexample · a wiring gap is a MISWIRE**: land how a sibling makes it true — a fix PROPOSAL too: siblings' owner · mount · users · tests FIRST, grepped (11-16 /"i want coherence"/), the WORD a `+` row adds grepped in ITS file before the row is shown (11-21 `ATTACHED: null` shown for a table that held `ATTACHED: "attachment"`), a SHARED vector's every caller read before its order is proposed changed, every route MOUNTED under it listed before a `use` is shown on it (11-20 a reorder go'd, then retracted · a login check on `/attached` would have locked an attached lighthouse's own login, /"too far down the chain"/); never revert · fork · HOLY detour (11-13 /"why not attach as usual?"/).
```sh
# .ikiro/hooks/kill-guard.sh:15
killed=$(git -C "$root" diff HEAD -U0 -- "$path" 2>/dev/null | grep -E '^-[^-]' | sed -E 's/^-//; s/^[[:space:]]+//; s/[[:space:]]+$//' | awk 'length($0) > 12')
[ -n "$killed" ] || exit 0
```
- **evidence is taken on HIS side of the wire** — a command I hand him I ran first; it runs VERBATIM: no placeholder (11-09 `sk-…` landed in his `.env`), a secret = "row N, type it". An agent's world binds a FREE port, never his `:2501` · `:1794`; a copy's `.env` is HIS instance — a cwd without it (10-22); a claim about HIS instance reads `~/.viva/instances/<slug>/`, never a registry template (11-19 "spanish has no openrouter": false); an edit to HIS recipe is WIRED before "clean" (the registry loads its modules, a boot on a free port): `instance/doctor` loads none (11-20 `TOOLING` put on a module with no `tools`, `:2501` down). A walk ends clean (tabs · threads) — /"I WANT TO FUCKING MEET AN EMPTY BUFFER!!!"/
- **a library's limit · an ORDERING · COST claim · a blamed mechanism · a predicted consequence (/"fails loud on X"/, 11-19 wrong; 11-20 /"memory stays flat"/ typed unrun, +107 MB · an exit code read as a code path, `143` said to skip a `finally`, unrun · or through a pipe: `cmd | grep; echo $?` is grep's, 11-21) · a sibling said to NEED the same fix (11-20 two guide stages named, both already right) is a probe or its `file:line` read** — `:memory:` for mikro; blamed → diff its sibling; provider wire: DOCS, its fake a LIVE capture; a probe of a watcher · a filter · a guard repeats the ACTOR's own act, its code read first, a probe of two processes sequences on the EVENT (the accept), never a sleep (11-21 a cold start joined late, a pair read as holding 0), BEFORE a fix is shown on it (11-20 an exclude "proven" on an append while the drain renames a temp: two fixes shown, both dead). A cost my change ADDS is measured BEFORE the land, never shipped "not measured" (11-19 /"important for measurement"/), a hunk's size in a lean counted off the hunk (11-21 `~10 rows`, 16), a `breaks` row I print too: its trigger is read on HIS live state before the land (11-20 `top zone`: his float sat at the top perch, one nudge docked it), the QUEST's recorded `BREAKS` rows too: grepped, each said held · live · latent in the reply BEFORE the write (11-21 `land`: migration · login measured, `file.mode.daemon` unsaid).
- **`retard` · `i dont understand X` · a bare `what`** → `fold`. Second correction on one screen = the SHAPE is wrong; re-read his sketch. Propose after the area's live quest.
- **a rule carries its rejections** (`REJECTED: x — why`); every plan departure is reported. A diff <150 rows: inline; agents: opus, MEDIUM, while he WAITS in a walk its scope is the next stop's minimum and each reply says what it runs (11-20 /"wtf is the other agent still doing?"/), MY own run too: one line before >5 calls, one per further batch (11-20 nine nudges, then fifty in one session: a batch with no line above it IS the failure; 11-21 a background census waited on was no cover: 25 reads under one line, `hooks/quiet-guard.sh` WRITTEN, his to wire; 11-21 six harness nudges under such lines: a call that runs a minute (a suite · a boot) takes its OWN line, what it waits on; 11-21 again, 17 · 11 · 10 calls under one line each: a cast · a probe build is a batch too; 11-21 ×2 more in a sandbox build, then fifteen in one drill afternoon, four more that night: the line goes between EVERY two tool blocks of a research stretch, the guard still unwired; a wait on a restart · a build is an `until` loop on its EVENT, never a `sleep`: the harness blocks it), a scratch process dies by PID, never a pattern, a brief carries his RULED sections verbatim (11-09 `role.md`) and a guard deny is a STOP bar HIS `script around` (11-14), its report is its final TEXT, never a file (a guard denies it, 11-19).
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
- **every `.ikiro` file carries `limit: N chars`**; over cap: RAISE the limit FIRST, then insert (a long insert is measured before it is written: 11-19 four warns in one session, 11-20 ten: a BATCH of Edits is ONE insert, `wc -m` + the batch before its first, EVERY file it touches: 11-21 the quest measured, `release.md` · frontier warned), keep it together; never evict, never a new side file (11-19 /"dont keep creating new peripheral files. instead, adjust limits"/). A raised limit is never reported (11-19 /"dont tell me in the future"/), nor shown as a `chars / limit` pair (11-21 ×2 in a fold). Prose rides no heredoc, a probe file neither (11-20 twice, then nine on a sandbox copy: a script is a FILE the `Write` tool made, then run; 11-21 ×2 more, `python3 - <<` · `python3 -c` replacing inside a scratch file; again that night: `hooks/heredoc-guard.sh` WRITTEN, his to wire), a scripted replace inside one too: a guard sees `Edit` · `Write` only (11-19 frontier pushed over cap unseen); the ONE scripted write: a tangle too long to type, cast by a builder FILE under `.ikiro/reference/<quest>/`, limit raised first, `cap.py` after, SAID as a departure in that reply (11-21 37 000 chars cast by script, unsaid).
- **a guard logs its OWN class**, never a path or value (`vcs-guard.sh:8`).
## his language

`go` · `commit` (disk, not VCS) = write-auth for THE item, never a sibling; a `go` rules a show's HUNKS, never a READING it footnoted: an ask of two structurally different readings is ONE question, row one, BEFORE any show, the reading HIS sentence's, never the tree's nearest half-built mechanism (11-20 `all sides drag n drop`: dock zones shown · go'd · landed, edge RESIZE meant, /"i still cant drap and drop the size"/); an answer ruling SOME items of a show is go for THOSE, the unanswered built THIN (one general tool) or held (11-20 a `/mate` tool with flip · offset · carry built on a naming answer, /"i dont need mate. i need a general move."/); `quest <n> go` on a TANGLED quest = apply per milestone, HOLY too (/"just get it in there"/); on a DESIGNED quest or a planning turn = the QUEST edits ONLY — a replay, a copy, a landed milestone IS execution (REJECTED 10-21 · 11-08 /"i didnt say land yet. revert."/); praise ≠ go; `you do X` = ownership in the QUEST, not go (REJECTED 10-16) · `wait` · `stop` · `sotp` = zero actions · `stop asking` · `dont tell me. do` · `css shit` = session-sticky go · `cast to quest` · `fixate` = the amen'd show's hunks into the quest as exact diffs, zero product code (11-19) · `blast` = map consumers; `blast change X go` = map, then act · `amen` = locked · `land` on an amen'd show = its hunks to the tree, no quest between (11-20) · `cleanup` = MY slop only, never his lines or `bak/` (whose a line is = his word · a quest's changelog, never `git blame`: every snap wears his name, 11-21 `flag` called his, /"yours. cut."/) · `why is there a dedicated X? just Y` · `dont be clever` on a helper = X dies at EVERY use, blast counted in the reply, never only my new rows (11-21 30 `flag(…)` left standing) · `keep X as //deprecated` = a plain SIBLING key with that comment, no map · heal · warn (11-20 /"no special key for that"/) · `drop X` = its zero-reader ones (11-13) · `i suspect` = sketch, code on go · `does this have a tail` = the dev effort trailing a choice: counted, run (11-21 read as a running tail) · `more detail` · `express what we're doing` on a hunk = its names · `.desc` · `.example` said better, never a new mechanism (11-20 a regex grammar, /"way too detailed now."/) · `study X` = READ, report what IS — no slop list · forks · `go?`; HE rules the slop (/"did i fucking tell you to do shit? no."/) · `can X do Y` · `investigate if` = yes · no in row one, read off the mechanism's READER chain (its gatherer, never one schema), `not needed` is no answer; what he THINKS holds (`I do think X can`) and the tree refutes is shown is → delta to its sibling (11-21 /"I don't really care if it's needed."/ · /"modes have twitches. obviously."/) · numerals (`5%` · `14 words`) are sticky contracts · rage-caps = stated twice before · typos ("dental" = deno) = parse, never ask · `give me versions` = STRUCTURALLY different candidates · `is X supported` · `long term` · `where is the ecosystem going` = a docs survey of the providers, sourced, THAT turn, never our tree (11-20 asked three times, /"i dont mean today."/) · `YES NO??` = one row each, five words · `what did we call X` · a noun he used = grep HIS turns (REJECTED 10-26 `/widget/toggle/entity` /"popover widgets!"/), a word he SAID for the new thing is its name until a clash is shown, never a family pattern over it (11-21 `twitchy or whatever` → `TWITCHING` coined, /"call it TWITCHY."/) · `artifact` · `inline` = a `.md` in the tree, NEVER the claude.ai tool · `harness` = PRIMER prose + the tools it arms, swappable, never mechanics (REJECTED 11-07 slots · gates /"i want a hanress"/) · `primer` = the Vector and its strip's key, `shape.strip`, nested (REJECTED 11-07 /"mangled"/) · `ikiro mark` = canon now · a new name JOINS a metaphor family (ship · spell · food · animal · machine).

## comms

A report: his states as sections, his fields first (10-24 /"buried"/). A stretch of tool calls opens on ONE line of what it runs and says each change of phase, a build · a pass · a fold too, not only a drill (11-20 a dozen harness nudges in one stretch).

~50% of every answer is code; length is the ask's: `short answers` = 4 lines, y/n = one word (/"focus. one thing."/); `X or Y?` → row one picks (11-14). Every fence: an empty row above AND below, prose never touches code (REJECTED 11-10 /"split fucking code from fucking yap"/), its REPO path, never a probe's (11-17 ×2), code hugging it; a `where does X come from` · a key shown out of its file = the CHAIN root → leaf, a fence per step (recipe → entry → module → its reader), a JSON key inside its PARENTS, never a leaf alone (11-20 /"this tells me nohting. i need the chain to root."/); **height over depth** — stack, never nest, one thing per row (11-06); `flat` · `formatting` = MY reply (REJECTED 11-14 /"in the fucking text response"/). Every path in prose too. A question · a flag · an ask, relayed too: `file:line`, what he SEES now vs after, what BREAKS, never a bare noun (11-17 ×2 /"means what?"/); a LAND he will look at says what his screen DRAWS and what it does not yet, in his nouns (11-20 a shared frame read as /"youve just copied teh quad copter, no?"/), and an order that REMOVES says the screen it leaves BEFORE the act (11-20 `no copies` run to nine loose prints, /"thast not a drone really yet"/), a row his order did NOT name leaving his screen as its side effect is asked BEFORE the write, never ruled after (11-21 five `no route` rows under `wire … through controller`, mine); a q · s · m header: LETTER+NUMBER TITLE (`S1 Scalars`), then one sentence (11-19 ×2 /"you forgot … the indexes on the headers"/); a failing call is named as the failure (11-10); a value names its KIND (slug · id · row). Decision = context · code before · code after · the choice, one line — a closing fork too (11-10). /"speak english to me"/ · `simple words` → paragraphs. Move → tree · rename → table · code → diff. Tables hold enums · numbers · symbols only, a mechanism is its QUOTED code (11-12); a count says `chars` · `rows`, never `lines`. A mechanism's label is its English name, never its code (11-19 `channels` said for streaming); a code KEY, its path (11-14 `session`). Every `v.object(…)` ships with a passing JSON snapshot; a `json` ask = the WHOLE entity (11-14). **TRUE FORM**: a probe · test · snapshot · skill prints the consumer's object, never reduced · re-keyed · re-wrapped (11-16; 11-20 a probe's rows folded to one each; a reduction I DECLARE is still one: 11-21 ×3 `keys picked by the probe`, then ×3 more in one walk, three keys `cut by me` · paths only · stamps `typed from memory`: a snapshot fence is a `sed -n` PASTE of the probe's out file, a managed entity printed through `serialize(…)`, never `JSON.stringify` (750 rows of graph); a number array folded onto one row `for width` too, 11-21; too long → the probe prints ONE entity). Voice is data: beef verbatim AND the trigger.

## code — one structure, one law, made visible

Triggers (aim 1–14, beef catches 15–19): 1 traversal IS dispatch · 2 state = `reduce(events)` · 3 one combinator, cases as data · 4 self-priming · 5 branch on the live value · 6 closure-objects, no `this` · 7 cata/ana pairs · 8 recursion mirrors the data · 9 `steer.*` before a hand loop · 10 total over the REAL domain, loud on failure — /"THERE IS ONE WAY THIS WORKS!!!"/ · 11 `[[predicate, tag]]` discriminator · 12 name the algebra · 13 suspension as a value · 14 minimal delta for MY additions · HIS picks, engagement for HIS redesigns · 15 write at the owner, not its reader (11-18 /"fix at the source. not the surface"/) · 16 no second epicycle — offer from-scratch · 17 the mechanism already computes it · 18 the bag is the missing contract (/"contract both sides"/) · 19 the surface is grepped, never remembered. /"functions judged by EFFECT, not internal model"/

**1 · 3 · 8 — one fold; `shape.object`, `shape.strip`, `survey` are `node` cases over it, never three walkers.**
```js
// subsystems/typology/gestalten/steer/trie.js:16
export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
  const here = { ...frame, carry: descend(frame.carry, vector) };
  const trajectories = [...vector.trie].map(([pattern, trajectory]) =>
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

**4 — inside typology a schema is STATIC, `v` from `../v.js`, never the barrel** (/"static not thunks"/ 10-21). No exception: an embedded entity is the opaque arm (`Yield`, m96 Q2).
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
const armory = (tools) => steer.trie.leaves(tools).map((entry) => nameOf(entry.steps)).join(", ");
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

**absence IS the signal** — no `?? {}` · `|| x` · `?.` without a grep proving it; a union carries a tag; zero readers (grep) = cut the EXISTING, no compat arm (/"not real. trash"/ 10-03), never a reason to CLOSE a surface the quest is building readers for (`hidden` · a narrowed answer: REJECTED 11-20 /"zero reader ... TODYA. cause werre just now building fucking upload."/) — bar a trait's surface (11-08) and a NEW surface in a quest: its caller is the quest's (REJECTED 11-09 /"its new. retard."/). An arm for an ABSENT subject (`x !== null`) is minted only after x's PRODUCT mint sites are grepped: an absence only a test rig has = the rig is fixed (REJECTED 11-21 `ctx.client.app !== null` in the turn command, both mints seat an app, /"i ssupects thats not needed."/). **The mechanism IS the guard** — `let released = false` ✗ · a refusal by word list · a never-matching type on a key ✗, the key LEAVES the schematic (11-20 `Unheld` · a blacklist pattern, /"no unheld. no manifest."/ · /"this makes no sense. cut"/) · `if (host.slug !== "runtime") throw` ✗ (/"very very very very stupid"/) → `fn.once`, a grafted-or-ABSENT route, a pruned trie. **A consumer's set is declared INCLUSIVE at the consumer** (`PARSED = ["part", "placement"]`), never its source minus an exclusion (REJECTED 11-20 `!guides.has(…)` /"other way round. be inclusive. the editor has a set of ontologies it parses. those and non else."/).
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
// systems/runtime/subjects/mode/traits/repling.js:8
  mode.repl = steer.trie.sieve(mode.repl, (pattern) => pattern.rank !== "void");
```

**names** — full, by FP role (`fold` · `pour` · `drain`), naming the PAIR; a ctx is `<vector>Die`. `t d p cfg` ✗. **`row` ✗ → ENTITY, prose and replies too** (REJECTED 11-10 ×2 /"stop using Row when you mean ENityt!!!!!"/ → hook owed). `verb` ✗ → a repl effect · a tool · a route. `door` · `drivers` ✗ → `shellDie`, a ctx key is a PROPERTY; an aperture OPENS. `line` ✗ → signal (/"LINES doesnt exists"/), a probe's payload too. `place` ✗. `.host` ✗ — `shard.host` is a gestalten drawer, never a property · key · param · schematic · const, nor MY prose (11-17 ×2; 11-20 `HostTraits` /"there is no fucking host. in our code."/): name runtime · daemon (REJECTED 11-10 /"we. name. shit. by. its. name."/). A local is the THING's name, never a role: `child` · `shown` · `branch` ✗ → `thread` · `journal` (/"call it by its fucking name"/). An example rides `.example(…)`, a tool's whole call on its `input`; never prose (REJECTED 11-13 ×2). `input`/`output` = a SCHEMA on signatures, the payload on `ctx`; no input → `(ctx)`, never `(_, ctx)`: `fire` reads arity (11-08 /"signature wrong. _ not needed."/); a call too: `dispatch(signal)`, never `(signal, {})` (11-19 /"input optional."/). A repl command over a repository method wears its path (`/file/upload`), a straight face: body = its data, flags = its holders, no context implied, the CALLER is the context; bare, it opens its prompt (REJECTED 11-21 `/attach` off a menu word, bound to the terminal's thread, /"why attach? … straight interface … called in differnt contexts"/)
```js
// subsystems/typology/schematics/entities/literal.js:10
    slug: v.string().optional().desc("its address inside the daemon").example("flamingo"),
```

**no intermediary** — a typology primitive takes the `Path` · `Signature` itself; `.absolute` · `.nature` only at a string boundary (11-16 /"branch should be able to take a signature"/). a locator takes ITS argument (`control.fault((die) => …)`), never closes over the beat's `die` (11-13 /"bad closure"/); `clientDie.client.runtime.x` inline, never `const { client } = clientDie`, never a ctx bag of derived keys (/"just {terminal"/) — nor a host bag (`parentDie.context` ✗ 11-09). An entity hangs only what a reader greps — `entity.runtime` ✗ (11-06). A gated route is `branch(…).use(gate).do(effect)`, inline even when shared (/"Keep the branch do"/). An ungated leaf is one `open("/a/b")`, never `.branch("/a").open("b")`. **A mechanism is SHOWN, never wrapped**: two entries are two functions, never `Object.fromEntries` over a config, nor a list mapped over two known calls (11-20 `sinks` · `untaps` over two taps, /"more logic than the statement deserves. be simple. be direct."/), a static set a LITERAL where mounted (REJECTED 11-06 `Object.keys(sets.traits)` /"just hardcode the set inline"/); a new mechanism is a blunt `testament/prototypes/<name>/run.js` first, a PROBE of what IS (a measure · a walk · a bisect) is `.ikiro/reference/<quest>/<name>.probe.js`, never there (11-21 /"How is this a prototype. wrong word."/). **Thin first**: no verb · belt fn · typology lift until a second consumer (04-04), nor a method beside the one HE sketched (REJECTED 11-19 `ears` /"that dont exist. dont make it. ugly."/), nor a repository method wrapping lookups its one route does inline (REJECTED 11-21 `FileRepository.holders` /"no dedicated holders method. stupid. just get teh two enttieis"/), nor a belt fn for rows the OWNER's constructor absorbs: the beat stays inline (REJECTED 11-19 `belt.cortex.acid` → `new Cortex(faculties)` /"not needed. can live inline."/), nor a helper over two sites of one short body (REJECTED 11-21 `reduced(owner)` /"cut. do inline. not everythign must be a module."/). Stop-tells: an options bag on a positional; a flag undoing a flag. **Legible over dense** — flat, spaced, one expression per line; a row ≤100 chars, MY fences too: an object of 2+ keys, a spread list, a `.desc(` break one per row (REJECTED 11-10 /"NOT FUCKING WRITE WIDE CODE"/), a `for … of <chain>.filter(…)` over a braceless body too: the filter NAMED beside its sibling, the loop braced, a blank row per block (11-21 /"make this functions a bit more readable"/ → amen); a one-off lambda sits where it runs.

**a function's HOME is its first parameter**: `boot(lighthouse)` ✓, `lighthouse.boot()` ✗. **A SUBJECT runs and owns a directory** (m91): `subjects/<subject>/prototype.js` (class) · `repository.js` · `hydration.js` (its row `entities/<Subject>.ts`, REJECTED 10-26 in its dir) · `factory.js` (a kleisli MAKES the thing — no die, no effect; REJECTED 10-25 `.do(client.factory(…))`) · `lifecycle/index.js` (`execution` + `1-population.js · 2-resolution.js · 3-integration.js`, 11-04; construct implicit, disintegrate = a beat's `finally`; a beat runs a vector: `steer.dispatch.execute(vector, die)`) · `traits/<NAME>.js` + `traits/index.js` (the catalog) · `apertures/`. Unowned → `entities/` (does not run) · `prototypes/` (no boot) · `gestalten/` = TOOLING, blind to client · terminal · mode · paladin, a citizen's `provider(…)` call too (REJECTED 10-21 /"Gestalten is only for abstract things."/ · 11-19 `fromm.mask` /"forces paladin registry into typology"/): `shard/` (`(ctx, next)` of two subjects) · `belt/` (plain over data, never `(ctx, …)` — REJECTED 10-24 `belt.dock.docked`) · `tools/` · `commands/` (file = OBJECT; `system` · `content` · `surface`, not by subject 11-13). `typology.js` exports PREDICATES, never a subject. REJECTED: object-first · `executions/`. An execution closes what it opened in its OWN `finally`.
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
// systems/ghost/gestalten/commands/system/quit.js:3
export const quit = new Vector().open(
  { nature: "/quit", valence: "leave — the client stops, the shell exits 0. Example: /quit" },
  (ctx) => ctx.client.controller.kill("SIGTERM", "quit"),
);
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
// subsystems/typology/prototypes/vector.js:70
  graft(...vectors) {
    for (const vector of vectors) {
      if (vector === this) continue;
      if (vector.effect) this.effect = vector.effect;
      for (const [pattern, trajectory] of vector.trie) this.seat(pattern).graft(trajectory);
```

**a system's beat READS paladin** (11-04): env · mask · spawn = `paladin.scope` · `instance.mask(slug)` · `instance.specs(…)` · `ledger.boot`; an Instance capability is a METHOD on its prototype, grep paladin first. REJECTED: ghost `carried` · `specs` · `clients.find` copied.

**entity capability = a REPOSITORY METHOD on both sides, mikro-first** (/"we design mikro-orm first! mark that."/): repository method → typology contract → `shard.datamap.repository` → `RemoteRepository` → UI. `thread.call = connection.branch(…)` ✗ (/"inside out"/); ≤2 positionals `(where|data, opts?)`. An entity: mikro + typology, never paladin; disk patrol = a lifecycle beat (/"dumbest anti-pattern"/); the rule names the ACT, never the import: typology writes NO disk by any API (`Deno.open` · `fs` · `@std`), the write is paladin's, reaching typology as a FUNCTION its mount site hands in (11-21 `File.upload` streaming to a sink, /"i dont want typology to write to disk. that pure paladin territory!"/ → `shard.datamap.files(repository, land)`, /"very pretty. good solution."/); a layer's FIRST import of a kind (zero, grepped) is redrawn before the show, never footnoted. Invariant · a default handed when an entity is created on · moved onto a subject → its entity's twitch, `grep -rn 'twitch.open'` BEFORE a write lands in a middleware (11-20 a flush in `claiming`, /"is there a twitch that reaches mode on thread set?"/; REJECTED 10-26 a beat: /"embedded like the other entities"/). A hook reads `ctx.input.em` READY: the dispatch forks once (`shape.subscriber` `fork`); never `em.fork()` · `setFilterParams` in a hook (REJECTED 10-29). Who may READ an entity is its OWN column (optional `user`, twin `Thread.ts:56`), asked before it is shown, never walked through a holder (REJECTED 11-21 a File filter through `threads` · `buffers`, /"no auth by proxy"/).
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

**a `$`-store ships a plain getter**; never `mode.$intents?.get() ?? []` — one `computed` per `$field`; a field beside a store IS a store (REJECTED 11-09 ghost `Buffer.files = []`). **An owner COLLECTS down** (`mode.daemon === this`, `daemon/prototype.js:21`), a reader never walks UP a nullable relation (`file.mode.daemon`): the owner ships its `$files` + getter, an entity naming nobody is in nobody's list (11-21 /"solved by emergence"/ → /"noice."/).
```js
// systems/anima/src/box/device/speaker/speaker.js:8
  $claimed = atom(false);
// systems/anima/src/box/device/speaker/speaker.js:21
  get claimed() { return this.$claimed.get(); }
```

**structure** — one child = a rename, not a directory (/"2 bad. thats just a directory around each file."/); a multi-file dir carries an `index.js` barrel; a `gestalten/` member is a DIRECTORY with its barrel, never a root file (11-09 /"thats not how gestlatne work"/); cluster by what co-varies. `manifest` is metadata. **If it's concrete, it's a LITERAL** (/"events are not symbols"/). **A mask is paladin's instance config, a module the registry's**: config is read off the subject's MASK, its source named from the WRITER (`accio`), never a property's name (REJECTED 11-19 `mode.module.hallucinators` /"you confuse mask and module"/); the HOST that built a subject assigns its `.mask`, the registry never carries one, the runtime trusts paladin's shape blind (REJECTED 11-19 `mask: query` in `accio` /"iffy"/ · `instance.mask(slug)` /"why is mask a function"/). A default · a required key is the SCHEMATIC's (`.default`, the cast fills it), never a beat's hand-written entry, nor a prototype field's preset (11-20 `telemetry = { logger: {} }` on the empty Instance read as declared silence, a booted runtime printed nothing) (REJECTED 11-19 /"yes in logic. no in impleentation"/ · a hook handing a thread its traits, the cast had filled both); a subject is BUILT from what it is given (`{ module, mask, controller }`), a derivable (`slug` · `reference`) is its prototype's getter (11-19 /"slug in every case lives on mask"/); a vocabulary SET is a typology primitive under HIS noun (11-19 `TRAVELLING` in a beat → `INHERITED`). **Mask keys are SEMANTIC**, lookup surfaces LEXICAL (`daemon.modes.<type>.<slug>`); `mask` → `module` → `mode`. **A package's thing rides its ROOT barrel** — no subpath (11-04 `ghost/host` cut).
```js
// subsystems/typology/schematics/primitives/instance.js:15
export const Mask = v.object(
  { module: v.string(), statics: StaticsMask.optional(), secrets: SecretsMask.optional() },
  { additionalProperties: true },
);
```

**universal over parochial** — `^(https?|wss?)://\S+$` ✗ → RFC 3986 productions, named ✓ (/"build something that is not for our case, but coherencely universally true."/). No hidden rule over an explicit grammar (/"this is iffy as fuck. dont like."/) → the repository's own `$all · $in · $none`. **A provider translates ONE request**; `belt.hallucinate` owns the session. **A command's filter is the recipe's OWN object as one word** (`Argv` parses a `{…}` word), never a second grammar for the terminal (11-21 /"perfect."/).
```js
// subsystems/typology/schematics/scalars/url.js:17
export const PATTERN = `^${SCHEME}://${USERINFO}${HOST}${PORT}${PATH}${QUERY}${FRAGMENT}$`;
```

**client is domain-blind** (`map.md`). A gesture · key dispatches a repl signal (REJECTED 10-26 ×2), bar a palette's cursor: a key effect, no return (11-16). A buffer row IS the screen: selection · cursor · draft → `buffer.data` (/"state should include my current sleecteds!"/). A hex literal in a view is a defect → its dapper token.
```js
// systems/ghost/surfaces/chrome/index.js:24
  const erase = paint(renderer.root, renderer, tokens("northsea", "2"), panes.chrome, { client, accept: [mime.tty.solid, mime.json] });
```

**tests** — a repo test never reads THIS MACHINE; census = `HOME=<empty dir>` (/"stub in a temp"/). A merge/copy suite ends with "source is not mutated". A re-resolvable scope is derived at USE, never frozen at import.
```js
// systems/runtime/tests/scenarios/hello.js:88
  const root = await Deno.makeTempDir({ prefix });
```
