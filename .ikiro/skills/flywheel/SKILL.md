---
name: flywheel
description: The dedicated self-improvement consolidation pass over the Callouts ledger — recompute the scoreboard, mark extinctions, land promotion diffs, prune dead rules, re-audit the anti-rationalization anchors. Consolidator is not actor; this never folds into task work.
when_to_use: "selfimprove" · "another" · "go meta" · or five or more unprocessed callouts since the last run.
---

# flywheel

Canon: `.ikiro/self/rituals.md ## the flywheel` + `## the scribe's duties`. Ledger and Scoreboard both live in `.ikiro/zettelkasten.md`.

Leave `disable-model-invocation` unset. Setting it true would stop a scheduled task or `/loop` prompt saying *"selfimprove"* from ever loading this skill — which is its main firing path.

## Before step 1

- [ ] Read `## Callouts` and `## Scoreboard` in full — the fold is over the whole ledger, not the tail.
- [ ] Count unprocessed callouts since the last run. Under five and beef did not ask → do not run; a thin pass pollutes the counters.
- [ ] Confirm this is a dedicated pass. Mid-task = wrong; the consolidator judges work it did not just do.

## The five steps — one todo each

1. **scoreboard** — fold the ledger: occurrences per `family:` across compacts. Recompute the Scoreboard **WHOLE** — it is derived; never hand-edit a cell ([[ontology]] law 1). Raw counts only, no invented scores or severities.
2. **extinction check** — family quiet **≥5 compacts** after its rule landed → **PROVEN**. Family recurred AFTER its rule promoted → the prose rule **FAILED** → draft the next rung: mechanical grep-check, then HOOK. Templates: `.ikiro/hooks/vcs-guard.sh`, `.ikiro/hooks/comment-guard.sh`. Never escalate below threshold.
3. **promotion batch** — families at **2–3 occurrences** of the SAME family → one self/kernel diff each, hunk-level, verbatim quotes intact. Autonomous (beef: *"all inside ikiro is yours"*), curated (connoisseur judges the diff), transparent (worklog + compact trail). Identity-philosophy forks still surface to beef first.
4. **prune pass** — a rule unexercised across **≥10 compacts** → evict the whole item, quotes intact. Prune on counters, never on a "still useful" feeling.
5. **anchor re-audit** — replay `## anti-rationalization` against the last 3 compacts. A listed thought that appeared unstopped = drift → log a fresh callout.

## Ledger discipline — hard, applies whenever the ledger is open

- **`## Callouts` is APPEND-ONLY.** Never edit, soften, or close an entry. Closure comes only from an extinction mark (step 2) or beef.
- **Recurrence audit before any new callout** — grep the ledger for the family first. A repeat of a family whose rule already landed is a **RULE FAILURE** entry linking the original, not a fresh lesson.
- **A corrective rule written this session is EXECUTED this session.** The family `rule-not-self-applied` exists because this got skipped.
