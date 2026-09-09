# cartographer — re-derive one codemap shard from the territory (agent brief, V3 — V1 mapped commons, V2 added mechanism/snapshot/observability on typology; V3 carries their feedback)

You are the cartographer for ONE file under `.ikiro/world/` (the shard) in the repo `/Users/finn/vivalence/code/vivalence`. Law: **the map defers to the territory.** A shard claim that disk contradicts is a bug in the shard. Your job: rewrite the shard so that every sentence and every code block in it was proved by a command you ran or a line you read this session.

## what a shard IS — beef's ruling (verbatim, binding)

*"I do expect the code map to contain about 25% code. I want code snippets and pseudocode. I want the code map not only to be a set of references, but also some high level overview of how the code functions. Not the not each one will be the details, but to each what is their own. So if we have the code map to the typology, we highlight things that are of the typology. Uh, prototype, schematic, cells, vectors. And then in the runtime, we would have higher order features like traits, services, stuff like that."*

And the second ruling, same session: *"besides the or inside of the 25% code, or maybe next to them. So I think also like 10% snapshots would be nice. What do objects look like at rest and in motion inside of the scope of the system?"*

Three parts, interleaved by topic:

- **snapshot** — for the container's proper objects, what one looks like AT REST (a row, a record file, a manifest, a lock, a strip — pasted JSON, real values from disk or from a probe, secrets replaced by `"…"`) and IN MOTION (the packet/record/event as it crosses a seam: an emission, a `/tool/yield`, a span record, a `Request`). Fenced ```json or ```js blocks, each headed by provenance (`// ~/.viva/locks/hello-world.lock` · `// probe: strip(vector) →`). Target ~10 % of the file's characters. A snapshot is proved by being READ or PRINTED this session — never typed from memory.

- **map** — WHERE is it (container-rooted path) · WHAT LAW does it obey · WHAT NOT TO DO (the trap). Bullets.
- **mechanism** — for each concept PROPER to this container, one fenced block showing HOW it works: real lines copied from the source, each block headed by its provenance (`// subsystems/typology/prototypes/vector.js:41-58`), trimmed to the spine (elide with `…`); pseudocode ONLY when the real code is too long to trim, and say so. Target: 20–30 % of the file's characters inside fences. A block is proved like a claim — you read those lines this session.

Third ruling: *"I want a logging trace and I want that in terms of spans and tracks. for now document where we are already using drains and tracks and console.logs in the same breath just highlight them when they are there as a reminder that the agent has some mechanism to pull data from the live system."*

- **observability** — one section per shard, `## where to read the live system`: every place THIS container emits or exposes runtime data. Measure it: `grep -rn "\.mark(\|span\.\|chronicle\|dictate" <container>` (spans/tracks) · `grep -rn "drain(" <container>` (drains: Queue/soma/datasink — name which) · `grep -rnc "console\.\(log\|warn\|error\|info\)" <container>` (paste the count; list the 3–6 sites a reader should know, with `path:line` and what each prints) · log files and verbs that surface state (`logs/<slug>/spans.jsonl`, `viva instance/doctor --json`, `/status`, `/metadata/*`). Each item is a TAP: say what you would run or read to see it live. Where a container has none, say so in one line — the absence is the finding. Size: beef — *"3% of the map … but 3% of all of them"* — the section is MANDATORY in every shard, ~3 % of each file's characters, no shard skips it; a terse list, never a narrative.

**Proper vs borrowed.** A concept is proper when its DEFINITION lives under this shard's `paths:` globs. A concept defined elsewhere that this container merely uses gets ONE pointer line naming the owning shard (`→ world/codemap/paladin.md`), never a block and never a paragraph. (V1 spent 30 % of the commons shard explaining paladin's pensieve and the runtime's arming — borrowed.)

## inputs

- `SHARD` — the file to rewrite. Its frontmatter `paths:` globs = the territory. Your task names the new `limit: N chars`; write it into the header.

## protocol — territory FIRST, claims SECOND

1. **Walk the territory before reading the shard's claims.** `find <container> -type f -not -path "*/node_modules/*" -not -path "*/bak/*" | head -400` · `grep -rln "^export" <container> --include=*.js --include=*.ts` · read the entry files (`mod.js`, `index.js`, `*.viva.js`, `deno.jsonc`) · list test files and read their `Deno.test(` / `describe(` / `it(` names — tests are the laws · the container README if any. Absolute paths in every command (the shell cwd persists between calls).
2. **Inventory the proper concepts** from what you walked: the dirs, the exported nouns, the prototypes/traits/verbs that are DEFINED here. Pick the 4–8 that carry the container (a reader who knows only these could predict the rest). Those get mechanism blocks.
3. **Then read the shard** and classify EVERY claim: **HELD** (a command agrees — keep, tightened) · **STRUCK** (disk disagrees — drop; record the disproof) · **UNPROVABLE** (not checkable this session — drop) · **OUT OF TERRITORY** (true, checkable, but defined outside the globs — replace with a one-line pointer to where it lives; if it has NO home you can name, keep the line and list it under `homeless` in the report — never delete knowledge silently). Claims shaped "X is dead / unused / has zero consumers / does not exist / lives at P" get a grep each.
4. **Add what the territory has and the shard lacks**: files/dirs with no line, exports nobody names, tests whose names state a law the shard omits.
5. **Probe when reading cannot settle it** (budget: ≤ 4 probes per shard — pick the claims whose truth changes what a reader would DO). A claim about ORDER or RUNTIME SHAPE (which middleware runs first, what a fold returns, what a cast discards) is settled by a scratch script, not by two source lines: write it under `/private/tmp/claude-501/` and run `deno run -A --config /Users/finn/vivalence/code/vivalence/deno.jsonc <script>` — import the module, print the shape. No daemon boot, no db, no network, nothing written outside the scratch dir.
6. **Write the shard — draft at ~70 % of `limit`, then add.** Rewording saves ~40 chars; only whole-bullet eviction moves the number, and V2 spent twelve trimming passes landing 5 chars under. Draft lean, measure, then spend the remaining 30 % on the highest-value additions. Format: frontmatter `paths:` verbatim · header comment ≤ 600 chars: `<!-- writer: agent · derived-from: <files/dirs read, short> · verified: <the CHECKS as terse command→count pairs> · limit: N chars -->` (the long form of your checks goes in the REPORT, not the header — V1 lost bullet budget to a 1 200-char stamp) · `# codemap: <container> — <one-line role>` · then topics, each = map bullet(s) + mechanism block where the concept is proper.
7. **Measure before finishing**: `wc -c` under `limit`; bullet cap: `awk 'length > 700' <shard> | grep -c '^- '` must be 0 (fenced lines excluded — a bullet is a `- ` line); code share and snapshot share, split by fence language: `awk '/^```json/{j=1;next} /^```js|^```ts|^```svelte|^```sh/{c=1;next} /^```/{j=0;c=0;next} j{sj+=length($0)+1} c{sc+=length($0)+1} {t+=length($0)+1} END{printf "code %.0f%%  snapshots %.0f%%\n",100*sc/t,100*sj/t}' <shard>` — code 20–30 %, snapshots ~10 % (a snapshot block is ```json; a mechanism block is ```js/ts/svelte). Over budget → evict whole bullets, lowest value first; never pad, never shorten a code block into nonsense.

## style

- No landing histories ("m47 moved…", "since the rename…", "this bullet used to say…"), no quest state ("LANDED uncommitted", "owed"), no dates inside bullets, no narrative of how you found something. Quests and compacts own history; the shard owns shape and mechanism.
- Bold the noun a bullet is about; backticks for every identifier and path; container-rooted paths always (`systems/…` `subsystems/…` `commons/…`), never a bare filename.
- `[[name]]` links: reuse ONLY targets already present in the current shard or in `.ikiro/self/*.md` filenames; never mint one.
- Every number comes from a command you ran; paste the count, not "many".
- Code blocks are the source's own lines — no comments added by you, no renaming, provenance header only.

## hard limits

- Edit ONLY the shard file (and scratch probes under `/private/tmp/claude-501/`). Nothing else on disk, nothing in `~/.viva`, nothing in `.claude/`.
- VCS is read-only: `git log/show/diff/status/blame/grep` are fine; never any mutation; no VCS words inside heredocs.
- Never run `viva ledger/doctor`, `viva registry/list`, `viva registry/doctor` — they WRITE. `viva instance/doctor` and raw reads of `~/.viva` are fine.
- Do not run test suites (`deno task test` never exits). Reading tests is the check.

## the fleet (one agent per shard; limits sized for map + 25 % code + 10 % snapshots)

| shard | territory | limit | proper concepts to block | snapshots to read |
|---|---|---|---|---|
| `world/codemap/typology.md` | `subsystems/typology/**` | 20000 | Signature · Vector · steer fold/descend · shape object/strip/wire · `v` cast/fill · Cortex/Hallucination Request | `strip(vector)` · a Signal · a `Request` · a span record |
| `world/codemap/runtime.md` | `systems/runtime/**` | 20000 | trait `stagger` · the armed stack · `daemon.call` · entity tier fold · Buffer mint · aperture gates | a Buffer row · an emission · a `/tool/yield` packet · `/metadata/*` strip |
| `world/codemap/paladin.md` | `subsystems/paladin/**` | 16000 | strata `Env` · `assign/split` · `hydrate` pinhole · `settle` · Vip/Pensieve · skills | a hydrated `instance.requirements` row · a `Mask` · a pensieve key path |
| `world/ledger.md` | `~/.viva/**` + `subsystems/paladin/prototypes/ledger/**` + `systems/ghost/trajectories/{ledger,instance,registry}/**` | 18000 | record read · lock lifecycle · `ledger.boot → Die` · the verbs' write paths | `instances.json` · `registry.json` · a `sessions/<pid>.json` · a lock file · `instance/doctor --json` (secrets elided) |
| `world/codemap/ghost.md` | `systems/ghost/**` | 12000 | `ShellSignal` argv dispatch · lens/pick · path law · rendering middleware | a parsed ShellSignal · a lens row · `--json` doctor output |
| `world/codemap/kajuit.md` | `systems/kajuit/**` `subsystems/dapper/**` `subsystems/drapes/**` | 16000 | decks · terminal = f(thread) · stall/engage · dossier subscriptions · pincer geometry · dapper token pipeline | a client Buffer entity · `$dock` · a dapper token triple · a Frame mount identity |
| `world/codemap/invariants.md` | cross-container (`subsystems/** systems/** commons/**`) | 8000 | none proper — every bullet is a LAW with its grep; code share may sit below 20 % and say so | the MikroORM `config()` · a bundle-spread measurement |
| `world/codemap/testament.md` | `testament/**` | 3000 | what the dev tree holds and what reads it | one fixture file |
| `world/map.md` | repo root: containers · `deno.jsonc` tasks · `documentation/content/` tree · run surfaces | 8000 | the L2 tree only; every deeper claim is a pointer to a shard | the `deno.jsonc` tasks block · the docs tree listing |
| `world/codemap/commons.md` | `commons/**` | 18000 | hello-world assembly · the mint vs the steering · reader guard/hop · libsql `config()` | a manifest · the hello-world `instance.viva.js` env block · a Faculty |

## the V3 fleet — outcome (ten shards, one pass)

| shard | before → after / limit | code | snap | struck | probes |
|---|---|---|---|---|---|
| typology (V2) | 17353 → 19998 / 20000 | 22 % | 9 % | 5 | 3 |
| runtime | 10412 → 19988 / 20000 | 24 % | 9 % | 4 | 3 |
| paladin | 6692 → 15998 / 16000 | 22 % | 9 % | 2 | 1 |
| ledger | 8873 → 17992 / 18000 | 21 % | 11 % | 5 | 1 |
| ghost | 5331 → 11994 / 12000 | 24 % | 10 % | 4 | 2 |
| kajuit | 10004 → 16000 / 16000 | 27 % | 10 % | 11 | 2 |
| commons (V1→V3) | 8440 → 17994 / 18000 | 23 % | 8 % | 11 | 2 |
| invariants | 6088 → 7977 / 8000 | 19 % | 7 % | 3 | 2 |
| map | 3807 → 7998 / 8000 | 22 % | 11 % | 5 | 1 |
| testament | 915 → 2998 / 3000 | 21 % | 10 % | 7 | 0 |

57 struck claims in total, ~40 of them lines the morning's hand rewrite had CARRIED from the old shards (trimmed, never re-measured). Three agent strikes were themselves wrong, all the same shape — a repo-scoped grep reading a tapped-package consumer as dead (`lazy: true` in education's `Retention.ts` · the drapes editor's consumer in vcompany's `Reader.svelte` · `check.instance().throw()` in a `.mjs`): **the SELF-SCOPED axis — V4 must say "grep `~/.viva/registry` too, and every extension".** Cost: ~1.9 M agent tokens, ~2.5 h wall, 9 parallel.

## fleet feedback → V4 (collected from the V3 reports; not yet folded into the protocol above)

- **bytes ≠ chars**: `wc -c` counts BYTES, the awk share check counts characters, `limit: N chars` says chars; with `·—…→` in the prose they differ by ~8 % and one agent stripped every en-dash chasing bytes. V4: state the budget in BYTES (`wc -c`) and keep the typography.
- **the snapshot fence**: the share formula classes only ```json as a snapshot; a `.bru`, a `.env`, a lock file are snapshots in other syntaxes. V4: any fence whose provenance header starts `// snapshot:` or `# snapshot:` counts as a snapshot regardless of language.
- **fixed costs at small limits**: ~3 % observability + ~10 % snapshot + 20–30 % code leaves ~1 800 chars of prose in a 3 000 file. V4: below 6 000 the shares are targets, not floors — say which were dropped.
- **fleet-table territory rows were incomplete**: the ledger row named `trajectories/{ledger,instance,registry}` and half the write paths live in `trajectories/instances/**`; the agent folded it in on its own. V4: territory rows are derived from `ls`, not typed.
- **the read-only rule hides the richest snapshot**: `ledger/doctor` and `registry/doctor` WRITE, so the ledger's own doctor output cannot appear in its own shard. V4 option: run them on a SCRATCH ledger (`XDG_CONFIG_HOME` + `VIVA_LEDGER_MOUNT` per the ledger shard's law) and paste that.

- **testing-pass feedback (V3.1, four of eight reports in)**: (a) +10 % does not fit the section spec — every agent evicted V3 content (a mechanism block, two snapshots, a bullet) to land 1 fence instead of 4–8; size the pass as "old limit + the section" (≈ +20 %) or say "1–2 fences, titles carry the rest". (b) `Deno.test(` UNDERCOUNTS — ghost's `mounted()` wrapper hid 30 of 115 cases; count every local wrapper too. (c) test titles are ~120 B each and load-bearing; mid-title `…` elision is ALLOWED, say so. (d) **the scratchpad is shared across the fleet** — two agents wrote `<scratchpad>/section.md`, one injected the other's section into its shard; scratch names MUST carry the shard slug or `$$`. (e) an agent "repaired" a frontmatter edit the orchestrator made mid-run (`paths:` widened on beef's order) as pollution — the brief must say the frontmatter is the orchestrator's, hands off. (f) the territory can move UNDER a running agent (paladin's `hydrate`/`settle` relocated at a checkout 15 min before the V3 shard was written from earlier reads) — stamp `derived-from` with the source mtimes or `git rev-parse HEAD` + dirty-file list, and re-derive when they differ. (g) six of eight in: the count grep MUST include `specimen.it(`/`specimen.describe(` — runtime has 237 of them vs 2 `Deno.test(`, a 10× undercount. (h) a shard that already carries a testing section (runtime's `## testing ladder, gotchas`) must be told FOLD, and the limit sized old + 10 % + that section. (i) invariants: the testing section IS the map (every law's pin is its proof) — landed at 23 %, not 10 %; give it its own share or allow `path:line` pins without titles. (j) snapshot tests are TWO families under one suffix — FROZEN (`SNAPSHOT_HOT=1` regen, `toEqual` the fixture, 9 files) vs CAPTURE (`const DRY = false`, rewrites the fixture every green run, 15 files) — a capture test cannot go red on drift; name the family in every shard's fixtures bullet. (k) all eight in: state the section budget as `limit − current wc -c`, and scale the block count to it (typology had 1939 B, not the ~2200 the 10 % line implies; five drafting passes lost). (l) an eviction that orphans a heading → rename allowed, list it. (m) `specimen.it(` wraps its title onto the next line — title extraction needs a multi-line grep. (n) SELF-SCOPED axis paid twice: `shard.caching`'s only test lives in a tapped package; education's `domain/tests/{kernel/literal,userspace/scoping}.test.js` import `~/.viva/registry/fixtures/data/seed.js`, which does not exist — dead tests in a tapped package are a finding for beef, not a gap for the shard.

## the testing pass (V3.1 — APPEND `## how it is tested` to an existing shard; beef: *"another 10% roundabout for testing per code map"*)

You are NOT rewriting the shard. You append ONE section and touch nothing above it except the header's `limit:` (already raised 10 % for you) and the `verified:` stamp (add your test counts). The three rulings above still bind: real lines, provenance per block, territory before claims.

**What the section holds** — for the 4–8 proper concepts the shard already blocks, in the shard's own order:

- **the pin**: which test file pins the concept (`subsystems/typology/tests/v.test.js`), and the LAW as the test names it — the `Deno.test("…")` / `it("…")` title VERBATIM, because the title is the law and the shard's bullet must not paraphrase it away.
- **the assertion**: one fenced ```js block per concept, headed `// test: <path>:<lines>`, holding the most law-bearing assertion (real lines, trimmed with `…`). 4–8 blocks total, short.
- **the fixtures**: where snapshots/fixtures live (`tests/snapshots/*.snapshot.json`, `.bru`, `.env.test`), how a snapshot is regenerated if the test says (`UPDATE_SNAPSHOTS=1` or whatever the file reads — grep it, never assume), and the ONE-file run line: `deno test -A --config /Users/finn/vivalence/code/vivalence/deno.jsonc <file>`.
- **the gaps**: proper concepts / exported nouns with NO test importing them. Prove each gap by grep: `grep -rln "<module path or export>" <container>/tests /Users/finn/vivalence/code/vivalence/{systems,subsystems,commons}/**/tests 2>/dev/null` — and `grep -rln … ~/.viva/registry --include=*.test.*` (the SELF-SCOPED axis: a tapped package may hold the test). A "gap" with no grep is a guess; paste the grep as `→ 0`.
- **the counts** (header `verified:` + section head): `find <container> -name "*.test.*" -not -path "*/node_modules/*" | wc -l` · `grep -rho "Deno\.test(\|^\s*it(" <container> | wc -l` · snapshot fixtures count. Numbers from commands, pasted.

**Running tests** — reading is the check. You MAY run at most 2 single files, only ones whose imports carry no daemon/db/network boot, under `timeout 120 deno test -A --config /Users/finn/vivalence/code/vivalence/deno.jsonc <file>`; paste the summary line (`ok | N passed | M failed`). NEVER `deno task test` (never exits). A red single file is a FINDING for `needs beef`, not something you fix.

**Budget** — the header `limit:` is the old limit + 10 %. Measure in BYTES (`wc -c`) and keep the typography (`·—…→` stay; V3 lost an agent to stripping en-dashes chasing chars). Section target ≈ 10 % of the new total; below 6 000 bytes shares are targets, say what you dropped. Over → trim the NEW section first; never evict an existing bullet without listing it in the report under `evicted`. Bullet cap 700 stays. The share formula: a fence inside `## how it is tested` counts as TEST, not code — measure the section as bytes from its heading to the next `## ` or EOF, divided by file bytes.

**Placement** — `## how it is tested` goes BEFORE `## where to read the live system` (observability stays the closing section). Shard `invariants.md`: the section names the cross-container test FAMILIES (snapshot tests, invariant tests, bundle-spread measurements) and which laws above have a test twin vs none. Shard `testament.md`: which tests read the dev tree, by grep on `testament/`.

**Liveness** — a background agent dies at 600 s of stream silence. Keep every command short; no watch modes, no servers, no `deno task`.

**Report** — the block below, ≤ 40 lines, plus `evicted:` and `gaps:` lists, and one `brief feedback` line.

## the testing pass — outcome (eight shards, one pass)

| shard | bytes / limit | test | code | snap | evicted V3 bytes | runs |
|---|---|---|---|---|---|---|
| typology | 21986 / 22000 | 13 % | 23 % | 8 % | 913 | 2 green |
| runtime | 22000 / 22000 | 12 % | 25 % | 8 % | 823 (old `## testing ladder` folded) | 2 green |
| commons | 19800 / 19800 | 12 % | 22 % | 8 % | 1 bullet | 2 green |
| paladin | 17600 / 17600 | 10 % | 21 % | 8 % | 181 | 2 green |
| kajuit | 17599 / 17600 | 14 % | 22 % | 8 % | 826 (`chain()` block + identity snapshot) | 2 green |
| ghost | 13197 / 13200 | 15 % | 23 % | 6 % | 806 (ShellSignal snapshot + old `## tests`) | 2 green |
| invariants | 8790 / 8800 | 23 % | 17 % | 6 % | 4 bullets | 2 green |
| testament | 3300 / 3300 | 17 % | 19 % | 9 % | 1 bullet | 1 green |

Every shard landed under budget with the section; every shard paid for it in V3 content because +10 % was ≈ a third of the section spec. Struck along the way: ghost's `--slug in neither schema` (help.wet.test.js:40-42 asserts it) · commons' `provider.test.js hits live APIs` (fake key, offline) · typology's test census (91/467/16) · testament's console.log paraphrase. Two fleet-wide findings: CAPTURE snapshots (15 files) cannot go red on drift; `~/.viva/registry` holds 42 test files, education's two kernel tests import a fixture path that does not exist. Cost: ~1.09 M agent tokens, ~12.5 min wall, 8 parallel.

## report back (≤ 50 lines, plain text)

```
shard: <path>  chars: <before> → <after> / <limit>  code share: <n>%  snapshot share: <n>%  bullets>700: 0
HELD n · STRUCK n · UNPROVABLE-dropped n · OUT-OF-TERRITORY→pointer n · ADDED n · mechanism blocks n · snapshots n · taps n (console.* count in territory: n)
struck:
  - "<claim, shortened>" — disproof: <command → what it showed>
mechanism blocks: <concept> (<path:lines>) · …
probes run: <script → what it printed>, or "none needed"
homeless (true, checkable, no home you could name):
  - …
needs beef (territory contradicts itself, product docs stale, a dir with no role):
  - <file:line> — <one line>
brief feedback: what this brief lacked, what cost you time, what you could not decide
```
