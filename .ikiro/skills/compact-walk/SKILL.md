---
name: compact-walk
description: >-
  Fold a session into a compact by WALKING the transcript, never recalling it — markers first, spine 1..N from
  methods/spine.py, rows oldest-first, every section filled from the whole table, balance judged by WHY the weight
  sits where it does, then index · quest report · skill verdicts · settlement · budgets · the handoff that derives
  the frontier. Use when folding, compacting, or
  disintegrating a session, or when /compact is refused by the gate.
when_to_use: >-
  "compact" · "fold" · "disintegrate" · "write the compact" · the PreCompact gate printed its refusal · end of a
  session · a sibling asks what this session settled.
---

# compact-walk — fold a session by walking its transcript, never by recall

Canon: `methods/compact.md` (the walk, the traps). beef: *"one thing thats annoying about the compact ritual is that it has a recency bias. work in a methodology that forces the agent to go message by message and section by section"*. Recall IS the bias. Measured across 191 compacts: a stated `N=` in 66, a coverage line in 13, a balance line in 17 — the walk fires at half strength when it is remembered instead of run.

## The walk — one todo each

0. **markers** — read `compacts/MARKERS.md ## OPEN`. Each is an order beef deferred to the fold: settle it in the body, move it to SETTLED with a one-line verdict. Five consecutive folds carried the same two entries; *"an order deferred four times is not deferred, it is unranked."*
1. **spine** — `python3 .ikiro/methods/spine.py <session-id>`. PASS THE ID (the scratchpad directory name is it; `CLAUDE_SESSION_ID` is often unset) — without it the newest transcript is read, and twice that was a live sibling's. `N` is now a fact.
1b. **skills** — `python3 .ikiro/methods/skills.py <session-id>`: every `Skill` firing, aligned to the turn under it, plus the organ skeleton. Mechanical like the spine — a fold that recalls which skills fired records the ones it remembers, the same bias one level up.
2. **rows** — oldest first, ~4 turns per window: `n · what beef asked (verbatim when it decides, gates, corrects) · what landed · what died`. A quoted turn's order is its TAIL — the paste is the address.
3. **coverage** — every `n` in `1..N` in exactly one row; `NOTHING` written, never skipped. A turn the spine does not hold but a reply answers = a lost mid-turn message: log a dash row and say it is not in the transcript.
4. **sections** — `#+TOPIC` · `* Arc` · failures · `* State at fold`, each filled FROM THE WHOLE TABLE. Never top-to-bottom in one pass: *"a single pass re-imposes narrative order, which is recency order wearing a different hat."*
5. **balance** — count citations per third of N. More than half in the last third is a QUESTION, not a verdict: the test is WHY the weight is there. Two folds legitimately carried four of six rulings in the last third *"because that is where beef ruled, from the doctor's output."* The denominator is the FOLD's N when the session spans several folds — say which.
6. **index** — `python3 .ikiro/methods/compact-index.py`; its last line must read compacts = ids stamped. No `#+filetags` (retired 09-21). NO dates anywhere; `grep -n '2026-' <draft>` → 0.
7. **quest report** — `CLAUDE_SESSION_ID=<id> python3 .ikiro/methods/quest-report.py --format md --stamp --compact <compact>`. Read the `sessions` column before any claim about the tree ([[sibling-reconcile]]). It crashes on a quest that moved mid-fold (known-issue 41): re-run after the `mv`, never hand-write the table.
7b. **skill verdicts** — the `** skills` organ: one row per firing, `skill · turn · verdict · the line`, verdict from `HELD · GAP · STALE · MISFIRE · MISSED` (defined in `skills/LEDGER.md`). Add the MISSED rows the firings cannot know: a turn that needed a skill and got none, a name reached for that did not resolve. Every non-HELD row is appended to `skills/LEDGER.md` — the compact cites, the ledger stores, because compacts are prunable. `GAP`/`STALE` are the body's problem; `MISFIRE`/`MISSED` are the trigger surface's, and are never fixed by adding body.
8. **settlement** — walk each loose end against LANDED rules and FIX it in the compact turn. Codeword scan of beef's turns → [[callout]]. Anything that outlives the quest → [[known-issues]], never a quest section. Owed-to-beef lives in `world/frontier.md` — the compact POINTS. Memory: update-don't-duplicate, delete the wrong one. Shards touched by a structural landing get re-stamped with the CHECK named ([[cartographer]]).
9. **budgets** — `python3 .ikiro/methods/budget.py --baseline` → every `ABOVE throughput` row drains to the owner its header names ([[budget-eviction]]); a `persistent` row never blocks.
10. **handoff** — the compact ENDS in `* handoff` (`methods/compact.md ## the handoff`): per quest moved, `- quest ::` · `goal` · `done` · `next` · `never` · `owed`. Then `python3 .ikiro/methods/handoff.py --write` derives `world/frontier.md` and `--check` reads byte-identical — never a hand edit of the frontier. Then `/compact` again; the gate's retry passes once every throughput file sits at baseline.

## Failure modes that recur — measured, not imagined

| shape | seen | the line |
|---|---|---|
| queue echoes inflate N · a prefix match ate a sibling handoff | #180 · #9 | dedupe is FULL text within 180 s — the extractor does it; never widen the window (#99: a re-delivery past 180 s is a real repeat) |
| mid-turn turns are `queue-operation`, not `user` | #187 (14 of 17) · #189 (10 of 29, incl. the one-char ruling `/"a"/`) | a user-only walk is structurally blind; the extractor reads both |
| a mid-turn message missing from the transcript entirely | #182 | evidence is the reply that answers it — dash row, say so |
| fold-boundary denominator | #92 · #136 · #190 | balance on the fold's N, stated |
| extractor read a SIBLING transcript | #142 · #131 | pass the session id |
| a count restated from memory reached four canon files | #123 | the walk is the only thing that caught it |
| budgets counted in bytes | #165 · #19 | `budget.py` counts characters |

## What a compact is not

Not a summary from context. Not dated. Not a second copy of the quest, the ledger or the frontier — it cites them (`#<id> <slug-prefix…>`). Not a place for known issues. beef's words verbatim, praised sections at higher fidelity.
