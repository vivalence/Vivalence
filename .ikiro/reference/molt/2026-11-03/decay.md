<!-- writer: agent · decay audit, quest m69 3.4 · molt 2026-11-03 · model: Claude 5 (Opus 5.5 / Fable 5.1) · beef's table: nothing cut · limit: 48000 chars -->
# decay — per rule: does the bare Claude 5 model still need it?

counts — KEEP 321 · CUT? 27 · HOOK? 20 · MERGE? 24 · rows 392

| file | KEEP | CUT? | HOOK? | MERGE? |
|---|---|---|---|---|
| `codestyle.md` | 67 | 2 | 10 | 0 |
| `world/codemap/map.md` | 9 | 2 | 2 | 3 |
| `skills/change/SKILL.md` | 29 | 4 | 1 | 4 |
| `skills/debug/SKILL.md` | 14 | 1 | 3 | 1 |
| `skills/design/SKILL.md` | 13 | 0 | 0 | 1 |
| `skills/domain/SKILL.md` | 16 | 6 | 0 | 1 |
| `skills/drill-me/SKILL.md` | 21 | 0 | 0 | 1 |
| `skills/fold/SKILL.md` | 14 | 1 | 0 | 2 |
| `skills/mode/SKILL.md` | 8 | 3 | 1 | 3 |
| `skills/molt/SKILL.md` | 14 | 0 | 0 | 1 |
| `skills/name/SKILL.md` | 24 | 0 | 0 | 1 |
| `skills/ops/SKILL.md` | 13 | 0 | 0 | 0 |
| `skills/package/SKILL.md` | 13 | 5 | 1 | 4 |
| `skills/quest/SKILL.md` | 23 | 0 | 1 | 0 |
| `skills/readme/SKILL.md` | 19 | 1 | 1 | 0 |
| `skills/show-me/SKILL.md` | 16 | 0 | 0 | 0 |
| `skills/topography/SKILL.md` | 8 | 2 | 0 | 2 |

Test per row (synthesis.md · anthropic-official.md): KEEP = a trap · his ruling with /"…"/ or REJECTED · an off-repo
decision · a verify command · corrected twice. CUT? = Claude 5 does it unprompted · layout the tree shows · emphasis.
HOOK? = checkable on a tool call, not guarded today. MERGE? = a twin, named. A row quoting beef is never CUT?.

Wired today (`.claude/settings.json`): agent · cap · comment · compact · cwd · import · kernel · log · vcs · watch · word.
Staged, NOT wired: `blast-guard.sh` · `kill-guard.sh` · `land-guard.sh` · `lifecycle-guard.sh` · `tangle-guard.sh` —
codestyle:25 quotes kill-guard as if it guarded; it does not fire.

Findings:
- codestyle.md is nearly all his: 2 of its rows are CUT?. Its decay is not in the rules but in the REGISTER — 64 caps
  words outside /"…"/ and fences (NEVER · ONLY · HIS · ALL …), 300 across the 17 files. best-practices: emphasis
  over-applies; an unbendable rule is a hook. A caps→plain pass frees ~0 chars; it is a register edit, beef's call.
- the cut mass sits in the RECIPE skills (mode · package · domain · topography): layout fences and read-at tables
  that `ls` and grep answer and whose line numbers rot. Counter-law (m69): /"more code and data in there, more code and
  data out"/ — a read-at table IS data. Confidence stays low on those; layout FENCES score higher.
- contradiction: `codestyle:338` "a hex literal in a view is a defect" vs `design:28` "the comp's palette VERBATIM … until
  beef orders the theme". Both his; the ruling that reconciles them (one palette block = the sanctioned hexes) is unwritten.
- twins (MERGE?): `traits: []` lives 3× (domain:37 · domain:61 · mode:47) · the shelf 4× (debug · fold · mode · package)
  · per-package VCS 2× (package:83 · readme:48) · `deno fmt` 2× (codestyle:344 · map:44).


## codestyle.md

| file:line | rule | class | why |
|---|---|---|---|
| `codestyle.md:4` | epigraph: truth, simple, coherent; the lisp connoisseur | KEEP | his verbatim; the aim every rule serves |
| `codestyle.md:8` | VCS read freely, never write; subcommand first | KEEP | vcs-guard's rule; 2755 files lost on a jj rebase |
| `codestyle.md:23` | propose, per-item go; ruled fork = go; probe code free | KEEP | his verbatim ×3; the model asks too much or too little |
| `codestyle.md:24` | no completion claim without fresh verification; a zero is a claim | KEEP | verify law; served bundle, not compile; corrected repeatedly |
| `codestyle.md:24` | a handed design is the spec, verbatim, per region | KEEP | REJECTED 10-22 · 10-27 with his verbatim |
| `codestyle.md:25` | his edit is the spec: a removed line is his kill | HOOK? | kill-guard.sh staged but NOT wired in settings.json |
| `codestyle.md:25` | a guard is not a ruling; report the block | KEEP | model restates guards as policy; off-repo decision |
| `codestyle.md:25` | a ruling's counterexample is a miswire to trace | KEEP | REJECTED 10-24 m105 Q12 with his verbatim |
| `codestyle.md:37` | evidence on his side; a handed command ran first | KEEP | verify law; his verbatim on empty buffer |
| `codestyle.md:37` | agent world binds a free port, never :2501 · :1794 | KEEP | trap; debug:64 makes his restart mine, so no blanket hook |
| `codestyle.md:38` | a library's limit is a probe on :memory: | KEEP | verify command; model asserts library limits from memory |
| `codestyle.md:39` | retard · i dont understand · bare what → fold | KEEP | his codewords; off-repo lexicon |
| `codestyle.md:39` | second correction on one screen = the shape is wrong | KEEP | corrected twice; twin debug:23 owns the variant |
| `codestyle.md:39` | propose only after the area's live quest | KEEP | REJECTED 10-25 subjects/surface/ |
| `codestyle.md:40` | a rule carries its rejections; departures reported | KEEP | the ikiro register itself |
| `codestyle.md:40` | diff under ~150 lines inline; brief carries his rulings | KEEP | REJECTED 10-26 [ █] |
| `codestyle.md:40` | agents: opus, MEDIUM | HOOK? | agent-guard counts launches; never reads model or effort |
| `codestyle.md:41-52` | no comments in product source | KEEP | comment-guard's rule, wired; four strikes before the hook |
| `codestyle.md:53` | every .ikiro file carries limit; consolidate, never evict | KEEP | cap-guard's rule, wired |
| `codestyle.md:53` | prose never rides a heredoc | HOOK? | checkable: Bash heredoc whose target sits under .ikiro/ |
| `codestyle.md:54-68` | kernel-guard: plans placement · fair-source copy | KEEP | hook body quoted; off-repo decisions (LICENSE v2.1) |
| `codestyle.md:69-75` | a guard logs its own class, never path or value | KEEP | privacy trap for hook authors; exercise.sh can assert it |
| `codestyle.md:79` | go · commit = write-auth for THE item | KEEP | his lexicon; off-repo decision |
| `codestyle.md:79` | quest go on tangled = per milestone; planning turn = quest edits | KEEP | REJECTED 10-21 with his verbatim |
| `codestyle.md:79` | praise ≠ go; you do X = ownership, not go | KEEP | REJECTED 10-16 |
| `codestyle.md:79` | wait · stop · sotp = zero actions; stop asking = sticky go | KEEP | his lexicon; typo sotp is his |
| `codestyle.md:79` | blast · amen · cleanup · i suspect · study X | KEEP | his lexicon; study X carries his verbatim |
| `codestyle.md:79` | numerals sticky; rage-caps = said twice; typos parsed | KEEP | his lexicon; off-repo |
| `codestyle.md:79` | give me versions · YES NO?? · what did we call X | KEEP | REJECTED 10-26 popover widgets |
| `codestyle.md:79` | artifact · inline = a .md, never claude.ai tool | KEEP | trap: model reaches for the artifact tool |
| `codestyle.md:79` | ikiro mark = canon; a name joins a metaphor family | KEEP | his lexicon |
| `codestyle.md:83` | report: his states as sections, his fields first | KEEP | 10-24 /buried/ verbatim |
| `codestyle.md:85` | ~50% of every answer is code | KEEP | his verbatim; numeral contract |
| `codestyle.md:85` | every fence and path is container-rooted | KEEP | his verbatim WHAT FILE |
| `codestyle.md:85` | a question names file:line and what he sees | KEEP | his verbatim What record? |
| `codestyle.md:85` | a flag names code, the undecided, what breaks | KEEP | model emits bare labels; corrected family |
| `codestyle.md:85` | decision = context · before · after · one line | KEEP | explanation-decision family, corrected many times |
| `codestyle.md:85` | speak english → paragraphs | KEEP | his verbatim |
| `codestyle.md:85` | move → tree · rename → table · code → diff | CUT? (44 ch) | Claude 5 picks these forms unprompted; no quote attached |
| `codestyle.md:85` | tables hold enums · numbers · symbols only | KEEP | his verbatim what is what |
| `codestyle.md:85` | a mechanism's label is its English name | KEEP | model labels by identifier; corrected |
| `codestyle.md:85` | every v.object ships with a passing JSON snapshot | HOOK? | checkable: a Write adding v.object( with no snapshot test |
| `codestyle.md:85` | voice is data: verbatim AND the trigger | KEEP | register rule for the record |
| `codestyle.md:89` | triggers 1–19, the code doctrine index | KEEP | taste the model lacks; doubles as a TOC |
| `codestyle.md:91-126` | one fold; shape.* are node cases | KEEP | canon code; house taste, not model default |
| `codestyle.md:128-152` | every cata names its ana | KEEP | canon pairs; house taste |
| `codestyle.md:154` | typology schema static, v from ../v.js | KEEP | his verbatim static not thunks |
| `codestyle.md:154` | async setup memoizes its in-flight promise | KEEP | points at fn.inflight; model writes booleans |
| `codestyle.md:169-183` | closure-objects; [[predicate, tag]] discriminators | KEEP | house taste; model defaults to classes and switch |
| `codestyle.md:185-205` | steer.* before a hand loop; total, loud | KEEP | his verbatim ONE WAY |
| `codestyle.md:185` | a trait is cast at hydration; reads straight | KEEP | REJECTED 10-24 · 10-16 with verbatim |
| `codestyle.md:207` | absence is the signal: no ?? {} · || x · ?. | HOOK? | checkable: warn on ?? {} · ?.get() in product source |
| `codestyle.md:207` | the mechanism is the guard: fn.once, pruned trie | KEEP | his verbatim very very stupid |
| `codestyle.md:232` | names full, by FP role; ctx is <vector>Die | KEEP | house names; model abbreviates |
| `codestyle.md:232` | dead words verb · door · line · place | KEEP | word-guard's rule, wired |
| `codestyle.md:232` | row · child · shown · branch · cfg forbidden | HOOK? | word-guard DEAD list lacks these; extend or regex |
| `codestyle.md:232` | every .desc( ends Example: … | HOOK? | checkable regex on Write: .desc(' without Example: |
| `codestyle.md:241` | no intermediary: inline clientDie.client.x | KEEP | his verbatim just {terminal |
| `codestyle.md:241` | gated route inline: branch().use().do() | KEEP | his verbatim Keep the branch do |
| `codestyle.md:241` | a mechanism is shown, never wrapped; prototype first | KEEP | house law; model wraps configs |
| `codestyle.md:241` | legible over dense; one-off lambda where it runs | KEEP | REJECTED 10-23; model mostly does, beef corrected |
| `codestyle.md:243` | a function's home is its first parameter | HOOK? | lifecycle-guard.sh staged, NOT wired |
| `codestyle.md:243-256` | a subject owns a directory: prototype · factory · lifecycle | KEEP | REJECTED ×4; layout with rulings, not derivable |
| `codestyle.md:258-297` | a vector exports as a value; trait fn is dispatch | KEEP | REJECTED on the TERMINAL; graft vs use trap |
| `codestyle.md:299-309` | entity capability = repository method, mikro-first | KEEP | his verbatim ×4; REJECTED 10-26 · 10-29 |
| `codestyle.md:311-317` | a $-store ships a plain getter | HOOK? | checkable: \$\w+\?\.get\(\) in product source |
| `codestyle.md:319` | structure: one child = rename; barrels; literals | KEEP | his verbatim ×3 |
| `codestyle.md:319` | a package's thing rides its root barrel | KEEP | his verbatim /host exception |
| `codestyle.md:328-336` | universal over parochial; no hidden rule | KEEP | his verbatim ×2 |
| `codestyle.md:328` | a provider translates one request | KEEP | house boundary; not derivable |
| `codestyle.md:338` | client domain-blind; gestures dispatch repl lines | KEEP | REJECTED 10-26 ×2 |
| `codestyle.md:338` | buffer row is the screen: selection · cursor · draft | KEEP | his verbatim my current sleecteds |
| `codestyle.md:338` | a hex literal in a view is a defect | KEEP | CONTRADICTS design:28 (comp hexes verbatim); beef rules |
| `codestyle.md:344` | repo test never reads this machine; census HOME=tmp | KEEP | his verbatim stub in a temp; verify command |
| `codestyle.md:344` | merge/copy suite ends with source-not-mutated | KEEP | house test law |
| `codestyle.md:344` | NEVER deno fmt | HOOK? | checkable Bash shape; twin map:44; not guarded |
| `codestyle.md:344` | re-resolvable scope derived at use | KEEP | trap; frozen-at-import bug class |
| `codestyle.md:354` | weak flanks: client/CSS · large blasts · overproduction | CUT? (44 ch) | self-description; acts nowhere, no rule body |
| `codestyle.md:354` | canary → 生きろ | KEEP | load instrument: proves codestyle is in context |

## world/codemap/map.md

| file:line | rule | class | why |
|---|---|---|---|
| `world/codemap/map.md:4` | shard list, path-gated, live edge, doctrine pointer | CUT? (474 ch) | layout of shards; path-gating loads them; frontier.md self-names |
| `world/codemap/map.md:6-11` | container tests --watch never exit; one-shot root runs | KEEP | trap + verify commands |
| `world/codemap/map.md:13-19` | repo test reaches packages only through accio | KEEP | trap: one module-not-found aborts; snapshots gitignored |
| `world/codemap/map.md:21-28` | runtime/watch scope; a save is a deploy | KEEP | trap; watch-guard's rule, wired |
| `world/codemap/map.md:29` | ports :2501 · :1794; readiness = start track | KEEP | traps: 404 ≠ down, bind at beat 4 |
| `world/codemap/map.md:30` | VCS jj: read only, subcommand first | MERGE? | twin of codestyle:8 |
| `world/codemap/map.md:30` | cite change ids; @ IS a commit; bookmarks to push | KEEP | jj trap the model gets wrong |
| `world/codemap/map.md:31-35` | jj log · jj diff · git show <id>:<path> | KEEP | verify commands |
| `world/codemap/map.md:36` | import_map.json root only; no prefix-map into npm: | HOOK? | checkable: Edit of import_map.json adding a "x/": "npm: entry |
| `world/codemap/map.md:37` | mikro 7.2.3 traps: snapshots, nullable, half up() | KEEP | traps, each paid for |
| `world/codemap/map.md:38` | trait cast at hydration; client domain-blind | MERGE? | twin of codestyle:185 + codestyle:338 |
| `world/codemap/map.md:39-43` | one dispatch shape; {condition, output}; ctx flat | HOOK? | checkable: ctx.daemon in product source |
| `world/codemap/map.md:44` | docs: no @deno/vite-plugin; MDX no <!-- -->; astro preview | KEEP | traps + verify command |
| `world/codemap/map.md:44` | NEVER deno fmt (hand-kept ~120 cols) | MERGE? | twin of codestyle:344; one hook serves both |
| `world/codemap/map.md:45` | tree 10-22: m96 + designer's look landed | CUT? (66 ch) | stale status; frontier.md owns the live edge |
| `world/codemap/map.md:45` | twin runs --no-lock --reload or deno.lock eats localhost | KEEP | trap |

## skills/change/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `change:22` | grep the surface; an existing primitive wins | KEEP | fit-existing-trees family, corrected |
| `change:23` | verify imports: root barrel; <pkg>/<sub> a defect | KEEP | REJECTED 10-24 ×2 |
| `change:24` | ontology before verbs → skill name | CUT? (61 ch) | pointer; name's when_to_use already triggers on it |
| `change:25` | grep a name before typing it | KEEP | dead-word family; four failures |
| `change:26` | staged commands are notes; fresh per-op go | KEEP | REJECTED 10-13 |
| `change:27` | name the path's frame owner; print the runtime value | KEEP | trap: derived paths guessed wrong |
| `change:28` | the owner decides placement: find *.test.js | CUT? (70 ch) | Claude 5 looks for sibling tests unprompted |
| `change:29` | a recorded defect lands with the touch; fix = fix | KEEP | his verbatim ×2; REJECTED 10-26 |
| `change:30` | guards read the whole command | KEEP | REJECTED 10-22 ×5 |
| `change:32` | REJECTED: every check at once over a package | KEEP | his rejection |
| `change:36` | skip the bracket on a one-caller leaf · doc · helper | KEEP | scope relief against over-process |
| `change:38-42` | blast: every consumer, whole-machine grep | KEEP | his verbatim did you cover bruno |
| `change:42` | no --include, no | head | HOOK? | blast-guard.sh staged, NOT wired |
| `change:42` | new field: blast its sibling, both clients | KEEP | REJECTED 10-27 DOCKED.markdown |
| `change:43` | consumers' suites green first; baseline reds | KEEP | verify step; attributes reds |
| `change:44` | change alone; file lists ride python (zsh) | KEEP | trap: zsh never word-splits |
| `change:45` | test again; snapshot compare + SNAPSHOT_HOT | KEEP | verify command |
| `change:46` | blast again; radius = beat 1 | MERGE? | twin of change:38 |
| `change:48` | escalate: bug → test; typology core → ask beef | KEEP | off-repo decision on typology |
| `change:52` | baseline = @ before my first edit, not HEAD | KEEP | REJECTED 10-19 git archive; jj trap |
| `change:53` | attribute pre-existing reds via known-issues grep | KEEP | REJECTED 10-24 as before ×4 |
| `change:54` | one file one verdict; censuses serial | KEEP | REJECTED 10-23 three false reds |
| `change:55` | paste ok | N passed from the tool result | KEEP | verify shape; claim-guard retired, rule stands |
| `change:56` | snapshots frozen; SNAPSHOT_HOT regenerates | KEEP | trap: regeneration passed off as verification |
| `change:57` | alive() skip counts; md5 ledger before · after | KEEP | traps + verify commands |
| `change:58` | seams: code only the served artifact runs → walk it | MERGE? | twin of codestyle:24 (mount it, read the served bundle) |
| `change:59` | run the coverage, per-file before → after | KEEP | his verbatim |
| `change:63` | argue against it, find the weak spots | KEEP | his verbatim |
| `change:65` | base facts: merge-base, patch --dry-run | KEEP | verify commands; git apply is a VCS write |
| `change:66` | sandbox: pre-edit copy, VIVA_REPOSITORY_MOUNT | KEEP | traps; REJECTED 10-23 |
| `change:67` | baseline unpatched, then patched | MERGE? | twin of change:52-53 |
| `change:68` | grep every absence claim | MERGE? | twin of codestyle:24 (a zero is a claim) + :207 |
| `change:69` | read the consumer side of every new seam | CUT? (45 ch) | Claude 5 reviewers trace callers unprompted |
| `change:70` | compare against ≥1 live sibling | CUT? (49 ch) | Claude 5 reviewers do this unprompted; low confidence |
| `change:71` | scope against the artifact; park to deferred/ | KEEP | off-repo placement |
| `change:72` | fix in sandbox → diff --no-index → dry-apply | KEEP | verify command shape |
| `change:73` | quest carries the delta: * critical pass | KEEP | quest format decision |
| `change:75` | REJECTED: applying it | KEEP | his verbatim nooooot apply |

## skills/debug/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `debug:18` | read his paste first; name a screenshot's source | KEEP | corrected; sources confused before |
| `debug:19` | reproduce before theorizing | KEEP | his verbatim on recorded diagnosis |
| `debug:20` | pin env: lsof + docker ps; which browser; TERM_PROGRAM | KEEP | REJECTED 10-27; his verbatim firefox |
| `debug:21` | isolate: binary-search boot; capped loop on a cp | KEEP | traps + verify command |
| `debug:22` | control: two runs, one variable | CUT? (41 ch) | textbook method; Claude 5 does it unprompted |
| `debug:23` | then code; three symptom-fixes = one structural miss | MERGE? | twin of codestyle:39 (second correction = shape wrong) |
| `debug:27` | instance/doctor + ledger/doctor; ledger/doctor mutates | KEEP | his verbatim; trap |
| `debug:28` | read-only sqlite via ?mode=ro; bare path creates | HOOK? | checkable: sqlite3 on ~/.viva path without mode=ro |
| `debug:29` | curl /status; boot run.js foreground | KEEP | trap: bad import dies silently under a task |
| `debug:30` | teardown in finally: SIGTERM own pid | HOOK? | checkable: kill -9 · pkill · ps | grep in a Bash call |
| `debug:34-39` | recurring shapes: esbuild, shelf, 401 storm, pty | KEEP | traps, each with its REJECTED |
| `debug:40` | a screenshot naming a scaffold → mount the real part | KEEP | his verbatim ×2 |
| `debug:44-47` | browser: restart for views; full reload; vite fallback | KEEP | traps; REJECTED 10-26 |
| `debug:49` | scoped > *; hidden tab no rAF; CDP no native drag | KEEP | traps |
| `debug:53-57` | the shelf: still after a fix → diff -q | KEEP | trap + verify command |
| `debug:59-62` | capture, cp by name, verify on the shelf | KEEP | his verbatim; REJECTED checkout vs shelf |
| `debug:60` | never rsync --delete | HOOK? | land-guard.sh staged, NOT wired |
| `debug:64` | a walk opens the product as it ships; restart detached | KEEP | REJECTED 10-21 · 10-24; traps 10-28 |
| `debug:68` | report: repro command first; silent fails first | KEEP | report shape; off-repo |

## skills/design/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `design:16` | the pass ends on the served artifact | MERGE? | twin of design:33 (walk the served artifact) |
| `design:20` | standing rulings: theme, read first, deviation licence | KEEP | his verbatim ×3 |
| `design:24` | read budget: comp + schematic, pane lines first | KEEP | his verbatim 600k context |
| `design:25` | fetch whole, decode bundles mechanically | KEEP | trap: gzip+base64 manifests |
| `design:26` | read the project as a fan; one pass per coverage | KEEP | REJECTED 10-06 with verbatim |
| `design:27` | the sample data is the spec; one line per pane | KEEP | REJECTED: data read as filler |
| `design:28` | the comp's palette verbatim until the theme | KEEP | his verbatim; CONTRADICTS codestyle:338 hex-is-defect |
| `design:28` | an undefined CSS variable fails silently | KEEP | trap |
| `design:29` | small screen never loses a control; full power | KEEP | REJECTED 10-26 with verbatim |
| `design:30` | port the intent; live chrome stays | KEEP | his verbatim view modes |
| `design:31` | mark what the system lacks as a quest list | KEEP | his verbatim mark those |
| `design:32` | the patch per item on go | KEEP | his verbatim; Implement: is not his |
| `design:33` | walk the served artifact; host CSS measured in his tab | KEEP | REJECTED 10-07; trap |
| `design:37` | port fails → designer briefing in markdown | KEEP | his verbatim |

## skills/domain/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `domain:16` | no door; a domain is a trait source; schema fixed | KEEP | REJECTED 10-07 · 10-08 with verbatim |
| `domain:18` | canon paths list | CUT? (356 ch) | layout pointers; grep finds them; line numbers rot |
| `domain:18` | vcompany · stucatch carry pre-m80 entities: never copy | KEEP | trap |
| `domain:22` | export * as; v.cast copies a namespace | KEEP | his verbatim 2 b; trap |
| `domain:24-32` | chess.viva.js barrel, verbatim | CUT? (318 ch) | restates code on disk; low confidence (code primes code) |
| `domain:36` | row traits: read at population.js:26 | CUT? (178 ch) | layout of read sites; derivable, rots |
| `domain:37` | row manifest.traits: [] = no tools, no routes | MERGE? | twin of domain:61 + mode:47 |
| `domain:38` | row schematics: ctx.domain.schematics the only path | KEEP | trap |
| `domain:39` | row aperture: grafted, daemon.call = shape.proxy | CUT? (166 ch) | layout of read sites; derivable |
| `domain:40` | row twitch: grafted on daemon's twitch | KEEP | his verbatim twiches are rich |
| `domain:41` | row tools: harnessed.js:73, armed <slug>_* | CUT? (82 ch) | layout of read sites; derivable |
| `domain:43` | additionalProperties keeps aperture; stray resolve | KEEP | trap |
| `domain:47-49` | define(NAME, {schematic, repository, entity}); claim | KEEP | mechanism the code hides behind traits |
| `domain:50` | repository verbs, this = minted, daemon filtered | CUT? (110 ch) | restates traits.js; derivable |
| `domain:51` | entity methods gated by claim; collisions at boot | KEEP | his verbatim; trap |
| `domain:53` | a trait never adds a column; json_extract | KEEP | trap/ruling |
| `domain:57` | routes are verbs, tools ride routes, owner from caller | KEEP | his verbatim ×2; REJECTED owner(kind) |
| `domain:61` | traits: [] silently disables everything | KEEP | trap (keep here, merge mode:47 into it) |
| `domain:62` | flat shapes: an ancestor key schematics | KEEP | his verbatim |
| `domain:63` | trait verb on an unclaimed row throws | KEEP | trap with the exact error |
| `domain:67` | literals, folds, twitches → the domain; client blind | KEEP | ruling; twin codestyle:338 on client half |
| `domain:71-77` | the rig mounts the way the daemon does | KEEP | trap: unit-green over a hand rig is no evidence |
| `domain:79` | gather · mint · strike; no test calls factories.instance | KEEP | trap |

## skills/drill-me/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `drill-me:14-15` | the drill captures snippets; the quest is them | KEEP | his verbatim; REJECTED rulings without hunks |
| `drill-me:19` | terrain measured; every noun he used grepped | MERGE? | twin of codestyle:79 (a noun he used = grep his turns) |
| `drill-me:20` | precedent; a handed design read whole before Q0 | KEEP | REJECTED 10-27 |
| `drill-me:21` | two approaches as code | KEEP | the skill's spine |
| `drill-me:22` | question list kept; reply asks Q0, the name | KEEP | his verbatim question zero |
| `drill-me:26-39` | the question template with lean | KEEP | his verbatim include your lean |
| `drill-me:42` | both options real, probed; two to four | KEEP | REJECTED 10-27; 10-28 verbatim |
| `drill-me:43` | consistent with every lock; a ruled noun is a lookup | KEEP | REJECTED 10-27 · 10-24 with verbatim |
| `drill-me:44` | how is X processed → the pipeline, one block | KEEP | format the model does not pick unprompted |
| `drill-me:45` | plain sentences, compression off; executor by owner | KEEP | REJECTED 10-27 · m102 with verbatim |
| `drill-me:46` | an option says what he would see, real cardinality | KEEP | REJECTED 10-24 with verbatim |
| `drill-me:47` | a snippet obeys codestyle, legible | KEEP | REJECTED inline high depth; word-guard ×4 |
| `drill-me:48` | a lock is his act, one snippet per commit | KEEP | lexicon: show me · I suggest are not locks |
| `drill-me:49` | a subject's run is its factory's | KEEP | REJECTED 10-25 ×3 with verbatim |
| `drill-me:50` | one noun per thing | KEEP | REJECTED 10-23 · 10-24 · 10-26 with verbatim |
| `drill-me:51` | no carried words; abbreviations written out | KEEP | his verbatim ×3 |
| `drill-me:52` | neither is an answer; reframed Q gets next letter | KEEP | corrected; no primes |
| `drill-me:53` | Q0 ends only on his lock | KEEP | REJECTED q0 not answered yet |
| `drill-me:54` | show me X: his frame, code, no lean | KEEP | routing to show-me |
| `drill-me:58-60` | confused: two-noun table, N laws, redraw bigger | KEEP | his verbatim relation = provenance |
| `drill-me:64` | every lock that turn: row + hunk; struck → reference | KEEP | anti-compaction ledger |
| `drill-me:68` | the drill ends: no go | KEEP | corrected: drills drifted into execution |

## skills/fold/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `fold:19` | walk the transcript, never recall | KEEP | his verbatim recency bias |
| `fold:23` | walk every beef turn with the reply it answered | KEEP | his verbatim affirmed code |
| `fold:24` | corrections: every codeword · guard fire | KEEP | process; his codewords |
| `fold:25` | quest handoffs: last affirmed iteration → * as code | KEEP | quest format decision |
| `fold:26` | frontier rewritten whole, ≤2000 chars | KEEP | REJECTED 10-24 next: go |
| `fold:27` | zero the moved names, no include filter | KEEP | REJECTED 10-19 · 10-12 with verbatim |
| `fold:28` | caps: run cap.py, paste output | KEEP | verify command |
| `fold:32-35` | correction: which skill, ≤2 lines, grep, redo | KEEP | the learning loop; failed twice → hook |
| `fold:37` | i dont understand: mark where I explained badly | KEEP | his verbatim |
| `fold:39` | retracted → nothing; not corrections: leans | KEEP | his verbatim retract |
| `fold:43` | re-read before write; concurrent edits canonical | CUT? (118 ch) | Edit/Write refuse a stale file; Bash writes bypass, low conf |
| `fold:44` | shortest clause on shared capped files | KEEP | sibling courtesy; off-repo |
| `fold:45` | check the sibling's rulings | KEEP | process trap |
| `fold:46` | the shelf goes stale after a sibling write | MERGE? | twin of debug:51-57 |
| `fold:47` | near a live watcher: rm -rf is a deploy | MERGE? | twin of map:21 + mode:81; watch-guard wired |
| `fold:51` | over cap: drain · trash · keep | KEEP | consolidation law (m69) |
| `fold:53` | capture uncommitted text to bak first | KEEP | trap: no VCS on bak paths |

## skills/mode/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `mode:17` | canon paths list | CUT? (257 ch) | layout pointers; grep finds them; line numbers rot |
| `mode:21` | the path is code: modes/<type>/<slug>/<slug>.viva.js | KEEP | convention lives in resolve.js, still non-obvious |
| `mode:23` | mountpoint on every mode; no invented env var | KEEP | his verbatim ×2; REJECTED VIVA_DRONEAID_IMPORT |
| `mode:27-41` | closed export set table, read-at sites | CUT? (998 ch) | layout of read sites; ls traits/ answers; numbers rot |
| `mode:43` | APPLICATION RETIRED; tty face as a second view | KEEP | ruling m87; trap; exemplar |
| `mode:47` | traits declared never deduced; ModeTraitsEnum | KEEP | trap with exact error; traits: [] twin domain:61 |
| `mode:51` | tune · rounds · effort are the user's | KEEP | REJECTED 10-24 m105 Q14 with verbatim |
| `mode:55` | no leaving the mode; kit copied, pinned byte-equal | KEEP | his verbatim ×2 |
| `mode:57` | tool-first at the mode; promote on a second mode | MERGE? | twin of domain:57 (tool-first is a mode's seat) |
| `mode:61-69` | layout fence modes/<type>/<slug>/ | CUT? (245 ch) | directory layout; the exemplar package shows it |
| `mode:71` | barrel takes flat helpers; mountMode; svelte/server | KEEP | trap: chess renders offline |
| `mode:73` | topology ⇒ DATASET; topography → skill | MERGE? | twin of topography:17-22 |
| `mode:77` | after first edit on a shelved mode: sync the shelf | MERGE? | twin of debug:51-62 + design:28 + change |
| `mode:81` | landing on a watched tree: one rsync | KEEP | watch-guard's rule; trap paid twice |
| `mode:83` | grep $effect bodies; no async onMount | HOOK? | checkable on Write of .svelte: async in onMount |

## skills/molt/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `molt:18-19` | epigraph: learn continuously; first 50k tokens | KEEP | his verbatim |
| `molt:24-25` | molt.py readings; --stamp last | KEEP | verify commands |
| `molt:28-30` | every number has a mechanical source | KEEP | REJECTED 09-22 · 10-05 with verbatim |
| `molt:34-36` | guard-class-hot → deny or fix regex | KEEP | process; rule owned nowhere else |
| `molt:37-38` | corrections-per-100-turns → walk transcripts | KEEP | process |
| `molt:39-41` | skill-silent → stays, merges, or sharper trigger | KEEP | process |
| `molt:42` | quests-closed → corpus pass | KEEP | process |
| `molt:43-44` | model-generation → decay audit, table for beef | KEEP | his verbatim; this file is its act |
| `molt:45` | research-age → the sweep | KEEP | process |
| `molt:46` | cap OVER → consolidate now | MERGE? | twin of codestyle:53 + fold:51 |
| `molt:50-52` | sweep: 8 angles, skeptic, synthesis | KEEP | process |
| `molt:53-56` | corpus: JSONL, second reader, merge.py, judge | KEEP | process |
| `molt:57-59` | land ≤2 lines; ≥3× unguarded → hook | KEEP | process |
| `molt:60-61` | shed only what beef ordered, recovery named | KEEP | off-repo decision; data safety |
| `molt:65-67` | REJECTED: compacts · resemblance · unordered fan-out | KEEP | his rejections |

## skills/name/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `name:18` | order: mechanism → refusal → ontology, before sketch | KEEP | process beef runs |
| `name:22` | the dissatisfaction is the spec | KEEP | his verbatim cake |
| `name:23` | collision list from disk first, measured | KEEP | 10-10 bundle struck |
| `name:24` | count what wants naming | KEEP | his verbatim unit and organ |
| `name:25` | propose fifteen by register, a lean | KEEP | REJECTED Crib · POSSESSED with verbatim |
| `name:26` | precedent in-repo and external: steal or invent | KEEP | his trigger phrase |
| `name:27` | the principle that decides | KEEP | his verbatim residence |
| `name:28` | the noun→meaning table with DEAD rows | KEEP | format beef reads; not default |
| `name:29` | prove the grammar latent on disk | KEEP | verify step |
| `name:30` | the lock per item; terse words map in order | KEEP | REJECTED 10-23 with verbatim |
| `name:33` | a carried name is renamed in the same diff | KEEP | REJECTED 10-12; third time → hook owed |
| `name:34` | a verb in his paste is his | KEEP | REJECTED 10-15 with verbatim |
| `name:35` | union → kind discriminator; too flat → ancestor | KEEP | his verbatim ×2 |
| `name:37-38` | design mode; interview shape; no cited wall | KEEP | his verbatim ×5 |
| `name:42` | entirely, no dual read, no fallback | KEEP | his verbatim ×3 |
| `name:44` | keep-list before the grep | KEEP | trap: false hits |
| `name:45` | term census, /usr/bin/grep, escaped form | KEEP | REJECTED 10-13 · 10-24; trap |
| `name:46` | radius = the whole machine | KEEP | trap: ~/.viva has no VCS |
| `name:47` | relative imports grep; file:N past a drop | MERGE? | twin of change:42 (rename → ../<old>/ grep) |
| `name:48` | new names exact; grep quests incl. done/ | KEEP | REJECTED 10-21 VIVA_VAULT_MOUNT |
| `name:49` | the atomic spine in one milestone | KEEP | trap: split boot is red |
| `name:50` | bracket it; zero old name | KEEP | pointer + verify |
| `name:51` | residue grep against the keep-list | KEEP | verify command |
| `name:52` | canon: grep .ikiro to zero | KEEP | verify command |
| `name:54` | REJECTED: alias · dual read · git mv | KEEP | his rejections |

## skills/ops/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `ops:19` | prod state in named volume; WAL; mixing | KEEP | traps |
| `ops:21` | confirm server, direction, target, backup | KEEP | off-repo: prod → local only |
| `ops:25-35` | phase 0 inspect read-only | KEEP | verify commands; every name once guessed wrong |
| `ops:39-50` | sidecar sqlite census | KEEP | verify commands |
| `ops:52-56` | _mikro_migrations; db.file pin; loop daemons | KEEP | traps |
| `ops:60-72` | phase 1 server snapshot | KEEP | off-repo procedure |
| `ops:74` | Coolify-prefixed volume; docker start before exit | KEEP | traps |
| `ops:78-90` | phase 2 local pull + swap into tmp/ | KEEP | procedure + traps |
| `ops:94-99` | phase 3 verify; the one compose | KEEP | verify commands |
| `ops:103` | DBeaver closed before any write; F5 reload | KEEP | trap |
| `ops:105` | data-sources.json format; credentials untouched | KEEP | off-repo file format |
| `ops:107-121` | connection JSON; database is load-bearing | KEEP | trap: MANUAL ignores url |
| `ops:123-135` | dbeaver.js verbs; refusals; .bak once | KEEP | verify commands; REJECTED -con · GraphQL |

## skills/package/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `package:16` | canon paths + live package list | CUT? (221 ch) | inventory; ls ~/.viva/registry answers; rots |
| `package:16` | read paladin.md first; nothing auto-loads under ~/.viva | KEEP | trap: path-gating misses ~/.viva |
| `package:20` | recipe by content: walk filters manifest.type | KEEP | non-obvious rule |
| `package:22` | two spellings, both legal, do not pick | KEEP | ruling |
| `package:23` | infinite-depth walk; stucatch declares deep | KEEP | trap |
| `package:24` | ledger.viva.json is not a package | KEEP | trap (m80) |
| `package:25` | invisible dirs list (ignore.js:4) | CUT? (100 ch) | restates ignore.js; :79 keeps the trap |
| `package:29-38` | layout fence <pkg>/ | CUT? (263 ch) | directory layout; packages on disk show it |
| `package:40` | the declaration shape | CUT? (85 ch) | restates any package.viva.js |
| `package:41` | modes/ convention is code | MERGE? | twin of mode:21 |
| `package:42` | services/ a provider, not a mode | MERGE? | twin of mode:41 provider row |
| `package:43` | instances/<slug>/ the template create copies | KEEP | trap: the shelf is a copy |
| `package:44` | tests/ package-root; domain reaches modes at runtime | MERGE? | twin of domain:67 |
| `package:46` | manifest.type free; owner vs package; derive, lock | KEEP | non-obvious ruling |
| `package:50` | deps: no package importmap; jsr; three system level | KEEP | his verbatim ×2 |
| `package:52-53` | bare specifiers: four workspace members; URL else | KEEP | ruling; twin map:36 |
| `package:54` | no ../ past the package root | HOOK? | import-guard covers commons/ only, not ~/.viva/registry |
| `package:55` | JS-only bundler drops assets | KEEP | trap |
| `package:59` | manifest authored; mounting's minted; twice = two | KEEP | non-obvious ruling |
| `package:63-67` | mount path fence: population.js lines | CUT? (528 ch) | code trace with line numbers; derivable, rots |
| `package:69` | land: registry/tap → instance/create → walk | KEEP | verify commands |
| `package:73-79` | tests: nothing runs them; name live dirs | KEEP | trap: deno test walks bak/ |
| `package:83` | per-package VCS; capture before rm | MERGE? | twin of readme:48-50 |

## skills/quest/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `quest:17` | head: title · filetags · status | KEEP | format decision |
| `quest:19` | organs list | KEEP | format decision, his verbatim QA |
| `quest:21` | tangle: diff hunks; the tangle is the filesystem | HOOK? | tangle-guard.sh staged, NOT wired |
| `quest:23` | table high level, then depth; no prose in cells | KEEP | his verbatim ×3 |
| `quest:24` | grep the quest for new @beef marks | KEEP | process; off-repo |
| `quest:25` | remove as much as you add; moved to reference/ | KEEP | REJECTED 10-12 · 10-20 with verbatim |
| `quest:26` | never shorthand; a milestone is a noun | KEEP | corrected; numbering is his |
| `quest:27` | a decision carries quest.org:LINE + file:LINE | KEEP | format decision |
| `quest:28` | a killed name leaves every block that turn | KEEP | REJECTED 10-23 with verbatim |
| `quest:29` | a fork is his only on shape or ontology | KEEP | his verbatim ×2 |
| `quest:31` | before ready: siblings, markers, replay, census | KEEP | his verbatim double work |
| `quest:35` | sunset, never delete | KEEP | his verbatim |
| `quest:37-45` | lifecycle dirs fence | KEEP | each dir's meaning, not derivable from names |
| `quest:47` | work without a quest → a new live quest | KEEP | his verbatim ×2 |
| `quest:48` | gate into done/: no pending marker | KEEP | REJECTED 10-24 |
| `quest:49` | plain mv only; epitaph in index | KEEP | vcs-guard denies git mv; rule stays |
| `quest:50` | drop the frontier line; grep the old path | KEEP | process |
| `quest:52` | never move a live quest; revive read-only | KEEP | verify commands |
| `quest:56` | release.md, reverse-chron, sections | KEEP | his verbatim changelogs |
| `quest:58` | release line shape | KEEP | format decision |
| `quest:60` | cut: a tag; gh release flags | KEEP | trap: jj makes no tags; off-repo |
| `quest:64-65` | known issues: grep first; base red filed that turn | KEEP | his verbatim ×2; REJECTED 10-23 |
| `quest:67` | known-issue shape | KEEP | format decision |
| `quest:69-71` | his approach only; resolved is cut; deferred ≠ issue | KEEP | his verbatim |

## skills/readme/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `readme:22` | defects live between verbs | CUT? (49 ch) | aphorism; no act attached |
| `readme:26` | beef's orders verbatim | KEEP | his verbatim ×4 |
| `readme:30` | lsof over all processes + docker ps | KEEP | trap: grep deno hides the container |
| `readme:31` | walk from a .env-less cwd | KEEP | trap: root .env boots live hello-world |
| `readme:32` | alt ports; name them | KEEP | trap; twin codestyle:37 free port |
| `readme:33` | the frame is in the request | KEEP | his verbatim |
| `readme:37` | stock image with a tty; give the exec line | KEEP | his order |
| `readme:38` | scripts by Write then docker cp; COPYFILE_DISABLE | KEEP | traps |
| `readme:39` | each step verbatim; capture what printed | KEEP | verify law |
| `readme:40` | hit it from outside, three tiers | KEEP | verify commands |
| `readme:41` | per-step row; doc drift fixed in docs | KEEP | his verbatim slop up the docs |
| `readme:42` | kill the bodies; never builder prune | HOOK? | checkable: docker builder prune on the host |
| `readme:44` | scratch instance variant; strata.wet red | KEEP | trap |
| `readme:48` | per-package VCS; can't run git ≠ protected | KEEP | his verbatim; incident |
| `readme:50-52` | versioned? running? capture to bak | KEEP | verify commands |
| `readme:53` | REJECTED: a scratchpad copy as only copy | KEEP | his rejection |
| `readme:54` | cut by entry, never by line | KEEP | data-safety rule |
| `readme:55` | a hunk to ~/.viva/instances reverse-appliable | KEEP | trap: no VCS there |
| `readme:56` | mikro half-applies an FK change: restore | KEEP | trap; twin map:37 |
| `readme:57` | price the asset before a recovery harness | KEEP | overproduction flank; corrected |
| `readme:59` | never swept: his lines, console.logs, bak/ | KEEP | his-edit-is-the-spec; twin codestyle:79 cleanup |

## skills/show-me/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `show-me:13` | a review is stops; each stop is code | KEEP | REJECTED dump · summary · all at once |
| `show-me:17` | read the quest whole | KEEP | process |
| `show-me:18-19` | measure the tree: landed.py; LANDED · QUEST · DRIFTED | KEEP | verify command |
| `show-me:20` | cut the stops 5–12; flow order | KEEP | REJECTED 10-27 · 10-24 with verbatim |
| `show-me:21` | * review ledger before * handoff | KEEP | format decision |
| `show-me:33-72` | the stop template, six sections | KEEP | his format, 10-24 |
| `show-me:75-76` | six sections; snapshots whole, probed | KEEP | REJECTED 10-24 hybrid |
| `show-me:77` | airy: a hunk a fence, ≤15 lines | KEEP | numeral contract |
| `show-me:78` | usage is the chain | KEEP | REJECTED 10-25 with verbatim |
| `show-me:79-80` | verbatim; diff for standing code; rooted path | KEEP | format; twin codestyle:85 rooted path |
| `show-me:81` | the counter is a contract | KEEP | numeral contract |
| `show-me:82` | words are the quest's; killed names on - only | KEEP | word-guard covers part |
| `show-me:83` | no lean, no fork, no go? | KEEP | corrected; contrasts drill-me |
| `show-me:87-93` | his answer table | KEEP | his lexicon; REJECTED 10-26 |
| `show-me:95-98` | a change is a drill, scoped | KEEP | REJECTED 10-24 with verbatim |
| `show-me:102` | the finish: tally; no go | KEEP | corrected |

## skills/topography/SKILL.md

| file:line | rule | class | why |
|---|---|---|---|
| `topography:17` | canon + measured trait counts; copus → topography | KEEP | his verbatim; the measurement is the law |
| `topography:21` | topology law | KEEP | his verbatim |
| `topography:22` | topography law; DATASINK needs harvest | KEEP | his verbatim |
| `topography:26` | what a dataset ships: ruling 19 | KEEP | his verbatim ×4; REJECTED ×2 |
| `topography:30` | freight without a dataset: FRAUGHT | KEEP | REJECTED new type; trap path ≠ URL |
| `topography:34` | read ≥3 entries before authoring | MERGE? | twin of change:22 (grep the surface) |
| `topography:35` | fixture slug through a lens is a word | KEEP | trap |
| `topography:36` | br vs pt before any Portuguese row | KEEP | off-repo domain decision |
| `topography:37` | corpus snapshot family | KEEP | house test law |
| `topography:38` | derived content never checked in | CUT? (49 ch) | Claude 5 default; sinks/harvest at :22 hold the real rule |
| `topography:42-51` | layout fence + manifest bullets | CUT? (426 ch) | directory layout; bullets restate :21-22 |
| `topography:53` | two manifests mount one topology = two modes | MERGE? | twin of package:59 |

## cut candidates, ranked

score = chars freed × confidence. Nothing is cut by me.

| # | file:line | rule | chars | conf | score | why |
|---|---|---|---|---|---|---|
| 1 | `mode:27-41` | closed export set table, read-at sites | 998 | 0.35 | 349 | layout of read sites; ls traits/ answers; numbers rot |
| 2 | `topography:42-51` | layout fence + manifest bullets | 426 | 0.60 | 256 | directory layout; bullets restate :21-22 |
| 3 | `package:63-67` | mount path fence: population.js lines | 528 | 0.35 | 185 | code trace with line numbers; derivable, rots |
| 4 | `package:29-38` | layout fence <pkg>/ | 263 | 0.65 | 171 | directory layout; packages on disk show it |
| 5 | `world/codemap/map.md:4` | shard list, path-gated, live edge, doctrine pointer | 474 | 0.35 | 166 | layout of shards; path-gating loads them; frontier.md self-names |
| 6 | `mode:61-69` | layout fence modes/<type>/<slug>/ | 245 | 0.65 | 159 | directory layout; the exemplar package shows it |
| 7 | `domain:18` | canon paths list | 356 | 0.40 | 142 | layout pointers; grep finds them; line numbers rot |
| 8 | `package:16` | canon paths + live package list | 221 | 0.55 | 122 | inventory; ls ~/.viva/registry answers; rots |
| 9 | `mode:17` | canon paths list | 257 | 0.45 | 116 | layout pointers; grep finds them; line numbers rot |
| 10 | `domain:24-32` | chess.viva.js barrel, verbatim | 318 | 0.30 | 95 | restates code on disk; low confidence (code primes code) |
| 11 | `domain:36` | row traits: read at population.js:26 | 178 | 0.45 | 80 | layout of read sites; derivable, rots |
| 12 | `domain:39` | row aperture: grafted, daemon.call = shape.proxy | 166 | 0.40 | 66 | layout of read sites; derivable |
| 13 | `fold:43` | re-read before write; concurrent edits canonical | 118 | 0.40 | 47 | Edit/Write refuse a stale file; Bash writes bypass, low conf |
| 14 | `world/codemap/map.md:45` | tree 10-22: m96 + designer's look landed | 66 | 0.70 | 46 | stale status; frontier.md owns the live edge |
| 15 | `package:25` | invisible dirs list (ignore.js:4) | 100 | 0.45 | 45 | restates ignore.js; :79 keeps the trap |
| 16 | `package:40` | the declaration shape | 85 | 0.50 | 42 | restates any package.viva.js |
| 17 | `domain:50` | repository verbs, this = minted, daemon filtered | 110 | 0.35 | 38 | restates traits.js; derivable |
| 18 | `domain:41` | row tools: harnessed.js:73, armed <slug>_* | 82 | 0.45 | 37 | layout of read sites; derivable |
| 19 | `change:24` | ontology before verbs → skill name | 61 | 0.60 | 37 | pointer; name's when_to_use already triggers on it |
| 20 | `change:28` | the owner decides placement: find *.test.js | 70 | 0.50 | 35 | Claude 5 looks for sibling tests unprompted |
| 21 | `readme:22` | defects live between verbs | 49 | 0.60 | 29 | aphorism; no act attached |
| 22 | `debug:22` | control: two runs, one variable | 41 | 0.55 | 23 | textbook method; Claude 5 does it unprompted |
| 23 | `topography:38` | derived content never checked in | 49 | 0.45 | 22 | Claude 5 default; sinks/harvest at :22 hold the real rule |
| 24 | `change:69` | read the consumer side of every new seam | 45 | 0.35 | 16 | Claude 5 reviewers trace callers unprompted |
| 25 | `codestyle.md:85` | move → tree · rename → table · code → diff | 44 | 0.35 | 15 | Claude 5 picks these forms unprompted; no quote attached |
| 26 | `change:70` | compare against ≥1 live sibling | 49 | 0.30 | 15 | Claude 5 reviewers do this unprompted; low confidence |
| 27 | `codestyle.md:354` | weak flanks: client/CSS · large blasts · overproduction | 44 | 0.30 | 13 | self-description; acts nowhere, no rule body |

all CUT? rows: 5443 chars freed (confidence-weighted 2368) of 113,008 across the 17 files (4.8%). The Claude 5 system-prompt cut was >80%; ikiro's rules are rulings, not defaults.
