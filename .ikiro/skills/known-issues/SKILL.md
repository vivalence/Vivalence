---
name: known-issues
description: >-
  File a defect that outlives the current quest in the OPEN-only ledger .ikiro/known-issues.org — symptom ·
  root cause · evidence · ruling · why not fixed · workaround, beef's words verbatim, resolved entries CUT —
  and never write a "known issues" section into a quest. Use when a defect is found outside the live scope, or
  when a fix needs a ruling you do not have.
when_to_use: >-
  "mark as known issue" · "mark this in ikiro for later" · "known issues!" · a defect outside the current quest's
  scope · a fix that needs beef's ruling · "mark the issue itself without your approach" · any urge to write a
  known-issues section into a quest.
---

# known-issues — the OPEN-only defect ledger, never a quest section

Canon: `.ikiro/known-issues.org` (41 entries today) · kernel: *"`known-issues.org` (OPEN only — resolved is cut)"*. beef, verbatim: *"this got nothing to do with this quest. i said known issues!"* — known issues had been written into the quest twice before he said it, while the ledger existed the whole time (`grep -li "known issue" .ikiro/` would have found it in one call). **Ledger before quest for anything that outlives the quest.**

## The entry

```org
* <slug-with-hyphens> — <STATUS: OPEN | SETTLED LATENT | …>
** Symptom
<what is observed, the exact command/route and its output>
** Root cause
<file:line, the mechanism>
** Evidence
<pasted output · counts · the compact/quest that met it>
** Ruling
/"beef verbatim"/ — or: none yet, direction is his
** Why not fixed
<the ruling it needs · the quest it belongs to · the cost>
** Workaround
<what a session does today>
```

Grep the ledger first — `grep -n '^\* ' .ikiro/known-issues.org` — a duplicate of an existing entry is a line appended to it, not a new heading. Entry count after: `grep -c '^\* '`.

## Laws

- **beef's approach ruling wins over mine** — *"no. omg. horrible! completely wrong direction. ok. mark the issue itself without your approach as an issue in ikiro"* → the entry carries the issue and the REJECTED approach, no approach of mine.
- **a measurement inside a tool serving all parts stops here** — a fix that names one part is parochial; direction is his (`feedback_universal_over_parochial`).
- **resolved is CUT** — the fold that resolves an entry deletes it and cites the resolution in the compact; the ledger never grows a "resolved" tail.
- **a quest's `* deferred` is not this** — deferred = in scope later, with a reopening trigger; known issue = a live defect nobody is fixing now.
- **a live sibling may file the same defect** — check the tail of the file before appending ([[sibling-reconcile]]).

## Kin

`.ikiro/loop-backlog.md` — STAGED items awaiting `go`, not defects. `compacts/MARKERS.md` — orders beef deferred to the fold. `zettelkasten.md ## Callouts` — MY failures, not the system's ([[callout]]). `zettelkasten.md ## Open` — one-line ikiro-side leads.
