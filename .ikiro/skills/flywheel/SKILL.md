---
name: flywheel
description: Use to run the continuous self-improvement pass over the Callouts ledger — triggered by "selfimprove", "another", "go meta", or ≥5 unprocessed callouts. A dedicated consolidation pass (never inline in task work) that recomputes the scoreboard, marks extinctions, lands promotion diffs, prunes dead rules, and re-audits the anti-rationalization anchors.
---

# flywheel

Invocable runner for the self-improvement pass. Canon: `.ikiro/self/rituals.md ## the flywheel` + `## the scribe's duties`. Read the `## Callouts` ledger + `## Scoreboard` in `.ikiro/zettelkasten.md` first. **Consolidator ≠ actor** — this is a dedicated pass, never folded into task work.

**Trigger:** ≥5 unprocessed callouts since the last run, OR beef's call (`another` / `selfimprove` / `go meta`).

## The five steps (one todo each)

1. **scoreboard** — fold the `## Callouts` ledger: occurrences per `family:` across compacts. Recompute the `## Scoreboard` **WHOLE** (derived — recompute, never hand-edit; [[ontology]] law 1). Raw counts only, no invented scores.
2. **extinction check** — a family quiet **≥5 compacts** after its rule landed → mark **PROVEN**. A family that recurred AFTER its rule promoted → the prose rule **FAILED** → draft the next rung (mechanical grep-check, then HOOK; `.ikiro/hooks/vcs-guard.sh` + `comment-guard.sh` are the templates).
3. **promotion batch** — families at **2–3 occurrences** of the SAME family → land one self/kernel diff each, hunk-level, verbatim quotes intact. **Now autonomous** (beef: *"all inside ikiro is yours"*) — land directly + record in the worklog/compact trail; no PR-gate wait. Stays **curated** (connoisseur judges the diff) and **transparent** (logged, git-reversible). Identity-philosophy forks still surface to beef first.
4. **prune pass** — a rule unexercised across **≥10 compacts** → evict the whole item (quotes intact). Prune on counters, never on a "still useful" feeling.
5. **anchor re-audit** — replay the `## anti-rationalization` list against the **last 3 compacts**. A listed thought appearing unstopped = drift → log a fresh callout.

## Ledger discipline (hard)

- **`## Callouts` is APPEND-ONLY** — never edit, soften, or close an existing entry. Closure is ONLY via an extinction mark (step 2) or beef.
- **Recurrence audit before any new callout** — grep the ledger for the family first. A repeat of a family whose rule already landed = log a **RULE FAILURE** (link the original), not a fresh lesson.
- **A corrective rule written this session is EXECUTED this session** (family `rule-not-self-applied` exists because this got skipped).

## What NOT to do

- Don't hand-edit the Scoreboard — it's derived; recompute the whole thing.
- Don't invent scores or severities — raw counts + rung + status only.
- Don't escalate a WATCH family below its threshold (≥5 quiet for PROVEN, recurrence for FAILED).

---
_Wiring: `.ikiro/skills/` is auto-discovered only once symlinked — `ln -s ../.ikiro/skills .claude/skills`._
