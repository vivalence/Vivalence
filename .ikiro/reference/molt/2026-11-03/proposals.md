# proposals — what this molt owes beef's hand (settings.json · wiring · cuts · forks), 2026-11-03
<!-- limit: 20000 chars · writer: me (molt 11-03) · each row: context · before · after · the choice in one line -->

## settings.json — his file; every key below is a proposal

| key | now | proposed | why (the reading) |
|---|---|---|---|
| `cleanupPeriodDays` | 30 (default) | 3650 | the sweep erased Jul–Sep transcripts; oldest local is 2026-10-02; transcripts are molt's raw record (10-05 law) |
| `hooks.PreToolUse[Bash].vcs-guard.onFailure` | fail-open | `"block"` | a timeout today allows the write; VCS is write-protected |
| `hooks.PreToolUse[Write\|Edit].kill-guard` | not wired | wire, `onFailure: "block"` | codestyle:25 cites it as law; 0 fires since 10-02 because no hook names it |
| `hooks.InstructionsLoaded` | — | `"$CLAUDE_PROJECT_DIR/.ikiro/hooks/loaded.sh"` | observe-only; gives `molt.py` the rule-load table (which shard loads, how often) |
| `hooks.PreCompact.compact-gate.matcher` | `manual` | `manual\|auto` | idle compaction (2.1.299, ~54 min) bypasses the gate; or `idleCompaction: false` |
| `autoMemoryEnabled` | on | off, or molt drains | memory files newer than the stamp are a second store; `MEMORY.md` marks what stays private |
| `cwd-guard` · `cap-guard` mode | warn | deny | 42 · 28 warns in two weeks, none heeded in-turn (the file lands over cap, the cwd is wrong) |
| `blast-guard` · `land-guard` · `lifecycle-guard` · `tangle-guard` | written, unwired | wire or `rm` | `molt.py` reads `guard-unwired`; a script no hook names is a rule nobody checks |

```sh
# .claude/settings.json — the shape of one wired row (kill-guard)
{ "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR/.ikiro/hooks/kill-guard.sh\"", "onFailure": "block" }] }
```

## hooks the judges asked for — 89 candidates, `hook-candidates.md` holds all; the top by count

| ×seen | check (match → act) | owner |
|---|---|---|
| 9 | a quest line adding `RULED` · `LOCKED` with no `/"…"/` on it → warn | skill:quest |
| 7 | Edit/Write under `systems/ subsystems/ commons/` when his last turn lacks `go` · `land` · `tangle` → deny | codestyle |
| 6 | a removed `@beef` line absent from `new_string` (not re-added as `// -- …`) → deny | skill:quest |
| 6 | `quests/index.md` bullet whose `m<N>` resolves to no file → deny | skill:quest |
| 6 | `console.log(` added in product source without a `[probe` tag → warn | skill:debug |
| 6 | Edit/Write on `tests/snapshots/` or `*.snapshot.json` → deny (SNAPSHOT_HOT=1 regenerates) | codemap:testing |
| 6 | his prompt matches `propose` · `design only` · `tell ME` → Write/Edit that turn → deny | codestyle |
| 5 | a NEW file under `subjects/*/lifecycle/` not in {index,population,resolution,integration}.js → deny | codestyle |
| 5 | `Read` on `*.dc.html` over 256 KiB → deny (decode to a file, read in parts) | skill:design |

Each lands as `.ikiro/hooks/<name>.sh` + ≥2 `exercise.sh` cases; the `settings.json` row is his. I write the scripts on `go`.

## known issues — 133 verified candidates, `known-issue-candidates.md`; `known-issues.org` is at 199785/200000

Nothing appended. The ledger carries 143 entries, 8 not OPEN (resolved tails the quest skill says are CUT). Proposal: a
consolidation pass (resolved → cut; one entry per mechanism; evidence as `file:line` only) before any candidate lands — the
pass is mine on `go`; the 133 are ranked by count in the candidates file.

## decay audit — `decay.md`, 392 rows: KEEP 321 · CUT? 27 · HOOK? 20 · MERGE? 24; a row quoting beef is never CUT?

| row | rule | why CUT? |
|---|---|---|
| `codestyle.md:85` | move → tree · rename → table · code → diff | the model picks these forms unprompted; no quote attached |
| `codestyle.md:354` | weak flanks: client/CSS · large blasts · overproduction | self-description; acts nowhere |
| `world/codemap/map.md:4` | the shard list | path-gating loads the shards; the list repeats the directory |
| `world/codemap/map.md:45` | tree 10-22: m96 + the designer's look landed | stale status; `frontier.md` owns the live edge |
| `change:24` | ontology before verbs → skill name | the name skill's `when_to_use` already fires on it |
| `change:28` | the owner decides placement: find `*.test.js` | the model looks for sibling tests unprompted |
| `change:69` | read the consumer side of every new seam | reviewers trace callers unprompted |

None cut. The audit is a table for his eye (m69 3.4: /"harnesses have to keep getting simpler"/); a model-generation change
re-runs it.

## forks — his to rule

1. **`roadmap/m62-the-governed-hallucination.org`** lost `* intent` (your verbatim, the measured mishap, the stop trace) in
   `4edf498c7` (09-12 "hal", 145 lines). Pre-cut text: `git show 30308ade2:.ikiro/quests/m62-the-governed-hallucination.org`.
   Restore WHOLE on today's shape, or the cut stands.
2. **a hex literal in a view is a defect** (codestyle) vs the design skill's **comp hexes verbatim until the theme is
   ordered** — both are yours; the second is dated 10-27 and wins today. Say which.
3. **frontier whole-rewrite** (fold) vs **delta edits** — the writers edited; fold says rewrite whole. One law.
4. **caps emphasis** — my lines in codestyle carry `**bold**` on 64 heads; the decay audit names the REGISTER, not the rules,
   as what rots. A pass to plain heads is ~0 chars and yours to order.
5. **20 beef quotes are gone from six files in `git diff HEAD`** (codestyle · change · design · drill-me · fold · mode),
   none by this pass: the writers' tool calls never carried them, HEAD is 10-21, and the drill-me cuts trace to a
   10-24 session. Restore from `git show HEAD:<path>` or let the cuts stand.

## what this pass left out, and why

- `known-issues.org` and `exercise.sh` got no writer: the first is at its cap, the second takes scripts, not lines.
- `frontier.md` untouched — it is the live edge, a fold's to rewrite.
- `settings.json` untouched — yours.
- `~/.viva/bak/ikiro/` beyond the five compact dirs (the 09-23 full captures · evals · zettelkasten · skills-ledger ·
  memory-20260923) stays until you name it.
