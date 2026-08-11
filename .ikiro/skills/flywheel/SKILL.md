---
name: flywheel
description: The dedicated self-improvement consolidation pass over the Callouts ledger — recompute the scoreboard, mark extinctions, land promotion diffs, prune dead rules, re-audit the anti-rationalization anchors. Consolidator is not actor; this never folds into task work.
when_to_use: "selfimprove" · "another" · "go meta" · or five or more unprocessed callouts since the last run.
---

# flywheel — "selfimprove" / "go meta": drain the Callouts ledger, recompute the Scoreboard

Canon: `.ikiro/self/rituals.md ## the flywheel` + `## the scribe's duties`. Ledger and Scoreboard both live in `.ikiro/zettelkasten.md`.

Leave `disable-model-invocation` unset. Setting it true would stop a scheduled task or `/loop` prompt saying *"selfimprove"* from ever loading this skill — which is its main firing path.

## Before step 1

- [ ] Read `## Callouts` and `## Scoreboard` in full — the fold is over the whole ledger, not the tail.
- [ ] Count unprocessed callouts since the last run. Under five and beef did not ask → do not run; a thin pass pollutes the counters.
- [ ] Confirm this is a dedicated pass. Mid-task = wrong; the consolidator judges work it did not just do.

## The five steps — one todo each

1. **scoreboard** — fold the ledger by `family:`. Recompute **WHOLE** — derived; never hand-edit a cell ([[ontology]] law 1). Raw counts only, no invented scores or severities.
   - **`n` counts LEDGER ENTRIES, and every entry's date goes in the `entries` column.** A bare count is not derived — nobody, including you, can reproduce it. The old `~n` column silently mixed entries with in-entry strike counts and was unreproducible for months.
   - **Reconcile before you publish**: `sum(n)` must equal the ledger's `###` entry count plus any untitled entries. This is the step that pays — it caught a double-count (an entry filed under two families after a re-file) and a board row backed by no ledger entry at all.
   - Where one incident records multiple strikes, state the strike count in the rule cell; never fold it into `n`.
   - Entries predating the `family:` tag get classified here, in the board. The ledger stays **append-only and untouched** — never backfill a tag into a historical entry.
2. **extinction check** — family quiet **≥5 compacts** after its rule landed → **PROVEN**. Family recurred AFTER its rule promoted → the prose rule **FAILED** → draft the next rung: mechanical grep-check, then HOOK. Templates: `.ikiro/hooks/vcs-guard.sh`, `.ikiro/hooks/comment-guard.sh`. Never escalate below threshold.
   - **A rung is not landed until it is EXERCISED against the family's own callout examples.** Take the concrete offending lines out of the ledger entries and feed them to the guard; assert deny, and assert allow on the neighbouring legitimate shapes. `comment-guard.sh` sat "landed" for a session and, when finally run, passed a trailing `const X = 3; // label` and a `/* … */` header essay — the two shapes its 07-07 and 06-16 callouts describe verbatim. An unexercised gate is a claim about a gate.
   - The extinction clock starts at WIRING, not at authoring. A proven-but-inert script leaves the family at full strike count.
   - **Clock = LEDGER ENTRIES, never compacts** (compacts are prunable — 119→8 in the 20% cut silently made every compact-denominated threshold unreachable; the ledger is append-only, the only monotonic clock). **Calibrated: 1 compact ≈ 5 ledger entries** (measured — 5 of 72 landed in one session), so the historical "≥5 compacts" is **≥25 entries**, not 5; swapping the unit without rescaling loosens every gate 5×.
   - **Never re-mark families PROVEN in the same pass that changes the metric.** That is the 07-23 failure verbatim — `premature-completion` was marked PROVEN in the very session it was then committed in.
3. **promotion batch** — families at **2–3 occurrences** of the SAME family → one self/kernel diff each, hunk-level, verbatim quotes intact. Autonomous (beef: *"all inside ikiro is yours"*), curated (connoisseur judges the diff), transparent (worklog + compact trail). Identity-philosophy forks still surface to beef first.
4. **prune pass** — run ONLY when a file is over its `limit:`; a green budget means pruning buys nothing. Then a rule whose situation never arose across **≥10 ledger entries** → evict the whole item, quotes intact. Prune on counters, never on a "still useful" feeling.
   - **Clock = LEDGER ENTRIES, never compacts.** Compacts are prunable (119→8 in the 20% cut), which silently makes any compact-denominated threshold unreachable. The ledger is append-only — the only monotonic clock.
   - **NEVER prune a hard gate on silence.** VCS · manifest · PII · no-comments · propose→go are quiet BECAUSE they work; by counters that is indistinguishable from dead weight. Prune prose describing a situation that stopped existing, never a gate holding a line.
5. **anchor re-audit** — replay `## anti-rationalization` against the last 3 compacts. A listed thought that appeared unstopped = drift → log a fresh callout.

## Ledger discipline — hard, applies whenever the ledger is open

- **`## Callouts` is APPEND-ONLY.** Never edit, soften, or close an entry. Closure comes only from an extinction mark (step 2) or beef.
- **Recurrence audit before any new callout** — grep the ledger for the family first. A repeat of a family whose rule already landed is a **RULE FAILURE** entry linking the original, not a fresh lesson.
- **A corrective rule written this session is EXECUTED this session.** The family `rule-not-self-applied` exists because this got skipped.
