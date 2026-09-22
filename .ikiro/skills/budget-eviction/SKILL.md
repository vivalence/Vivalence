---
name: budget-eviction
description: >-
  Work a THROUGHPUT ikiro file back down to its BASELINE — 15% of its `limit: N chars` cap — because a
  throughput file is a channel, not a store: every item drains to the owner its header names (quest,
  known-issues, the compact) or is trashed. A `kind: persistent` file is never evicted — it is rebuilt; a
  `kind: ledger` is never budgeted. Measured in characters with methods/budget.py.
when_to_use: >-
  `budget.py --baseline` prints ABOVE · `budget.py` prints OVER · the compact gate lists a drain owed ·
  writing `world/frontier.md`, `loop-backlog.md`, `compacts/MARKERS.md` or `zettelkasten.md ## Open` at a fold ·
  "clean up the frontier thoroughly" · "trash them" · "prune".
---

# budget-eviction — work it through, trash it, idle at baseline

beef 09-23: /"budget is the upper limit. baseline is 15% of budget. these are throuput vectors. work them through. trash them."/ — and, the same day, the fence around it: /"some files are throughput. not each and every one of them. some are more static. map, ledger, codemaps, ikiro root, coneusseur ... these are all quite persistant."/

```sh
python3 .ikiro/methods/budget.py --baseline   # ABOVE throughput <file> n/limit (baseline b, +x) → drain: <owner> · OVER exits 1
```

| kind | this skill | why |
|---|---|---|
| `throughput` | drains to baseline | the header's `drain:` names the owner |
| `persistent` | NEVER — OVER only means rebuild (quest m69 2.2/2.3) | the 09-23 cut trashed `ikiro.md` 10 352 → 1 244 and `connoisseur.md` 14 079 → 1 628 as if they were buffers |
| `ledger` | NEVER | append-only; pruned by its own law |

Characters, not bytes (`·` `—` are three bytes each).

## One pass per throughput file

1. **capture** — a copy under `~/.viva/bak/ikiro/<slug>-<YYYYMMDD>/` when the file carries uncommitted text.
2. **every item gets one fate**:
   - **DRAIN** — to the owner in the header's `drain:` (frontier → a quest's `#+next` or `known-issues.org` · loop-backlog → a quest · `## Open` → a quest or trash · MARKERS → the compact that settles it). Drain first, then trash.
   - **TRASH** (default once drained) — inventory, counts, file lists, history, narration, anything a grep or the code answers.
   - **KEEP** — only what is still in flight and owned by nothing else yet.
3. **re-read before `Write`** — siblings write the frontier and MARKERS live ([[sibling-reconcile]]).
4. **re-measure, paste the line** — `budget.py --baseline` after; then grep skills, methods and hooks for `## section` pointers into what was trashed.

## A persistent file over its cap

Not this skill. OVER on `kind: persistent` = the authored half outgrew its territory: rebuild it — generated half from `methods/codemap.py`, authored half re-grounded trap by trap against its source.

## The MEMORY.md case

Not VCS-backed — capture the directory first. Since 09-23 (quest m69 2.4) it holds only what must stay private; a new durable fact goes to its ikiro file, never here.
