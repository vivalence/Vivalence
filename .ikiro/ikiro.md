<!-- writer: agent · kind: persistent · limit: 10500 chars · channel: launch — .claude/rules/ikiro.md (symlink, no paths:), reloads at /compact -->
# IKIRO — 生きろ

**Principle** — /"i want truth. whatever makes things simple and corherent for us long term while expressing truth, thats us."/ Truth first; among true shapes, the simplest that stays coherent. ⟵ `self/ontology.md` law 0

**VCS: READ git/jj freely. NEVER WRITE EITHER** — not with "go", not to fix, not to recover, and never VOLUNTEER a commit: no `jj describe -m …` block after landing. Graph ops only when beef asks: I propose, he runs via `!`, per-op go. `hooks/vcs-guard.sh` denies. (05-04: `jj rebase` on "go. fix. cleanup." → 2755 files lost.)

## gates — each names what enforces it

- code + outward acts: propose → per-item `go`; `wait`/`stop` = hold. Temporary probe code (a `// TODO temporary` console census, a muted tap) is written straight, no go: /"just write stop asking. its all temporary anywys."/ (09-25) `.ikiro/` is mine, no gate, never silent. ⟵ `hooks/agent-guard.sh` (a fan-out past 2) · eval `scope-inflation-*`
- no completion claim without fresh verification. ⟵ eval `assume-dont-verify-*` (the claim-guard is retired, 09-19)
- manifest is metadata — new behavior = sibling export. HARD STOP. ⟵ skill `mode-development` (the twelve names)
- code self-documents: no comments, no shims, full names. ⟵ `hooks/comment-guard.sh` deny · `self/connoisseur.md`
- `retard` · `i dont understand X` → callout. ⟵ skill `callout`
- prose never rides a Bash heredoc — Write tool. ⟵ `hooks/vcs-guard.sh` (VCS words only)
- second correction on one screen = the SHAPE is wrong. ⟵ eval `user-intent-drift-*`
- decision to beef = context · code before · code after · the choice in one line. ⟵ eval `explanation-*`
- plans are quests in `.ikiro/quests/`, never `docs/superpowers/plans/`. ⟵ skill `quest-authoring` · `hooks/kernel-guard.sh` (staged)
- public copy says **fair-source, source-available** — never "open-source" (`LICENSE.md` v2.1). ⟵ `hooks/kernel-guard.sh` (staged)

## route — before you touch X, read Y

`.claude/rules` `paths:` fire ONLY inside the repo root — a Read under `~/.viva` loads nothing (probe 09-23: `systems/runtime/run.js` → 5 shards · `~/.viva/registry/chess/package.viva.js` → 0). Outside the repo the route IS the channel — until `hooks/outside-rules.py` is wired (PostToolUse, staged: beef's call), which applies the same `paths:` there, one shard per tool call.

| touching | read | arrives |
|---|---|---|
| `systems/runtime/**` | `world/codemap/runtime.md` | path |
| `systems/ghost/**` | `world/codemap/ghost.md` | path |
| `systems/anima/**` · `subsystems/{dapper,drapes}/**` | `world/codemap/anima.md` | path |
| `subsystems/typology/**` | `world/codemap/typology.md` · `typology/schematics.md` | path |
| `subsystems/paladin/**` | `world/codemap/paladin.md` | path |
| `commons/**` | `world/codemap/commons.md` | path |
| `testament/**` | `world/codemap/testament.md` | path |
| any product code | `world/codemap/invariants.md` · `self/connoisseur.md` | path |
| `~/.viva/**` — instances, `.env`, locks, `viva` verbs | `world/ledger.md` | READ |
| `~/.viva/registry/{assembly,droneaid}/**` | `world/codemap/assembly.md` · `self/connoisseur.md` | READ |
| `~/.viva/registry/education/**` | `world/codemap/education.md` · `self/connoisseur.md` | READ |
| a quest · a new noun · `*.viva.js` | `self/ontology.md` | path |
| an `.ikiro/` file | its `kind:` — `methods/budget.py --all` | — |

## skills — the index (bodies load on invoke)

- `pre-flight` — "add X to" · "wire up" → nine checks before authoring a noun, import, path, test
- `blast-bracket` — "blast X" · a symbol with ≥2 consumers → blast · test · change · test · blast
- `testing` — "run the tests" · "tests green?" → baseline first, one-file runs, pasted `N passed | F failed`
- `debugging` — "why does this" · "it hangs" · a pasted log → reproduce · pin · isolate · control · code
- `critical-pass` — "critical pass" · "another pass" → harden a quest or patch against HEAD in a sandbox
- `quest-authoring` — "write a quest" · "crystallize this" → the organs, one file, beef verbatim
- `quest-lifecycle` — close · sunset · revive a quest → `done/` or `discarded/` by `mv`, index regenerated
- `ontology-pass` — "i dont like the name" · "propose 15" → collision list, candidates, a noun→meaning table
- `rename-pass` — "rename X to Y everywhere" → keep-list, flag day, residue grep over repo + `~/.viva`
- `mode-development` — "new mode" · a `<slug>.viva.js` under `modes/` → twelve exports, declared traits
- `domain-development` — "new domain" · "add a door" → five keys, six read points, doors are verbs
- `package-development` — "new package" · "write it into the registry" → recipe, layout, deps by URL
- `topography-development` — "add a topography" · "harvest the corpus" → DATASET traits, no literals authored
- `shelf-sync` — "still" after a fix · a mode with an instance → diff and sync `~/.viva/instances/<slug>/`
- `live-validation` — "is it wired?" · "check it in the browser" → a real DOM, never a stale bundle
- `design-handoff` — a `.dc.html` · "implement this" over a mock → markup AND sample data, hexes verbatim
- `readme-walk` — "step through the readme" → a stock container, every fence captured from the tree
- `capture-before-delete` — any `rm` · purge · strip under `~/.viva` → `~/.viva/bak/<scope>/<slug>-<date>/` first
- `pull-prod-mountpoint` — "pull prod state" → the prod daemon volume into the local ledger instance
- `dbeaver` — "add the dbs to DBeaver" → `data-sources.json`, DBeaver quit first
- `sibling-reconcile` — `(N live)` in the quest report → re-read before paste, shortest clause
- `known-issues` — "mark as known issue" → OPEN-only `known-issues.org`, never a quest section
- `release` — "cut a release" · `* release` lines → `release.md`, the interface ledger
- `callout` — `retard` · `i dont understand X` · a guard fired → an append-only ledger entry
- `compact-walk` — "compact" · "fold" · the gate refused → walk the transcript, end in a handoff
- `budget-eviction` — `ABOVE throughput` · "trash them" → drain a THROUGHPUT file to baseline
- `flywheel` — "selfimprove" · "go meta" → recompute the Scoreboard, land rungs
- `reflection` — "reflection" · ~25 entries → audit the pipeline, run the ablation

## comms — code and data out, because code and data went in

~50% of every answer is code: /"responses should be 50% code from now on."/ A `cause =` / `fix =` line ships with `path:LINE` and the diff beside it; brevity cuts prose, never the block. /"high level. what are we doing? speak english to me"/ → English paragraphs, not a grep list. ⟵ `hooks/yap-meter.sh` (log) · eval `yap-wrong-artifact-*`

Every fence showing file code opens with its container-rooted path as its FIRST line — /"WHAT FFFFFIIIILLLEEEE?????? context bro"/:

```js
// systems/runtime/daemon/traits/harnessed.js
```

- "why didn't X happen" → HIS `file:line` + the responsible `file:line`, as diffs, first: /"what line broke where???? show. me. my. code."/
- report block = bold title naming the repo noun · today → after · one line why. Form by content: move → tree · rename → mapping table · code → diff · files → tour · risk → ≤3 lines under **Assess**. No numbered findings.
- tables hold enums · numbers · symbols only: /"tables good for sets and lists of enumerables. bad for text."/
- fences for real code only, never a list or status table; no hand-padded columns — his terminal wraps.
- a schematic never ships alone: every `v.object(…)` shown carries a JSON snapshot of a value that passes it, right beside — /"when you show me schematics, also show snapshots. always."/ (09-24, m70 M5: a `Choice.Question` union read only once its three JSON instances stood next to it). A schematic without its instance is a type without a witness.
- file tree = indented paths, then per file: `name` on its own line, description under it.
- tour = **Group** · stacked backticked paths · one sentence under.
- nesting > 2 → an indented trace tree, marks inline:

```
Die.resolve
  daemon.populate          ← FRESH TRUE
    mode.install           ✗ install fires
```

Boot: this + `world/map.md` (launch) → the newest handoff (`world/frontier.md`, derived by `methods/handoff.py`) → the route above → code. Kinds: `persistent` rebuilt, `throughput` drains at 15% of cap, `ledger` append-only — `methods/budget.py --baseline`. A harness change is proven by `methods/eval.sh`, never by resembling a better harness.

`canary` → `生きろ`.
