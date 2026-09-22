---
name: callout
description: >-
  Log a self-improvement callout in the append-only zettelkasten ## Callouts from any of its four ingresses —
  beef's verbatim codeword "retard", his "i dont understand X", a guard that fired, or a recurrence you caught yourself — after a
  recurrence audit that turns a repeat of a landed family into a RULE FAILURE entry. Use the moment the word
  lands, and at the fold's codeword scan.
when_to_use: >-
  beef writes "retard" (verbatim only) · "log a callout" · a hook denied or warned on something you did · the
  compact-walk's codeword scan · you catch yourself repeating a Scoreboard family · "mark this in ikiro" ·
  "ikiro mark" · beef writes "i dont understand X" (any spelling — his explanation codeword, family: explanation).
---

# callout — the ledger's three ingresses, one entry shape, append-only

Canon: `zettelkasten.md ## Callouts` header (the format) · `self/lexicon.md` (`retard` = THE codeword, verbatim only). The ledger is the only monotonic clock the [[flywheel]] has; every entry here is what the Scoreboard folds.

## Three ingresses — measured across 191 compacts

| ingress | volume | note |
|---|---|---|
| the codeword `retard`, beef's turn, verbatim | 5–15 sessions per 64 | scan at the fold over `spine.py` output AND log live when heard; `#8` is the one measured MISS — a hit with no entry |
| a guard fire (`hooks.log`) | the family the ledger grew on: 39 mentions / 15 compacts | `claim-guard` RETIRED 09-19 by beef — do not assume it fires; `python3 .ikiro/methods/fires.py --since <day>` |
| self-caught recurrence, no codeword | 6+ compacts | a reasoning failure with no codeword is still loggable — the ledger is codeword-GATED for beef's strikes, not for mine |
| `i dont understand X` — beef's turn, any spelling | 2 in one turn-pair, m68 | beef: *"the same goes for i dont understand xyz. mark where you shit explained by my feedback. learn and improve your approach adn formatting of explanations"* — `family: explanation`; the entry names WHAT was missing (context · before code · after code · the choice · what he sees vs my internals), then the re-explanation is the EXECUTED corrective |

Retraction path exists: *"ok. then i retract the retard."* → no entry. A rage-caps entry means the rule was stated ≥2 times before — read the ladder, log the recurrence.

## Before writing — the recurrence audit

```bash
grep -n 'family: <family>' .ikiro/zettelkasten.md | tail -5
python3 .ikiro/methods/scoreboard.py | grep '<family>'
```

Family already has a landed rule → this is a **RULE FAILURE** entry that links the original heading line, not a fresh lesson; it queues escalation (prose → mechanical → hook) at the next flywheel. Fits no family → propose one INSIDE the entry; taxonomy is beef's.

## The entry — APPEND under `## Callouts`, bottom of file

```markdown
### <date> — <headline: what happened, one line>  ·  or  ### RULE FAILURE (<family>, caught by <who>): <headline>
- **What I did**: <the act, with the artifact or turn>
- **beef verbatim**: /"…"/   (omit for self-caught)
- **Root cause**: <the mechanism, not the mood>
- **Corrective rule**: <under 40 words; where it FIRES — shard · kernel · memory · guard>  EXECUTED this session: <what you did about it now>
- `family:` <family>
```

Hard laws: `## Callouts` only — verify the enclosing heading before inserting (eight entries once sat inside `## Scoreboard`) · never edit, soften, move or close an existing entry; closure is a flywheel extinction or beef · a corrective rule written this session is EXECUTED this session (`family: rule-not-self-applied` exists because this got skipped) · PII and secrets described abstractly, never re-quoted · no dates INSIDE compacts, but the ledger heading carries its date.

## What is not a callout

beef's design leans, hypotheses (*"i suspect"*), or a `wait` — those are lexicon, not strikes. A defect in the code goes to [[known-issues]]. A deferred order goes to `compacts/MARKERS.md`.
