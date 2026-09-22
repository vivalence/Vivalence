---
name: flywheel
description: >-
  The dedicated self-improvement consolidation pass over the two ledgers — recompute the scoreboard, mark
  extinctions, land promotion diffs, prune dead rules, re-audit the anti-rationalization anchors, and fold the
  skills ledger back into the skills themselves. Consolidator is not actor; this never folds into task work.
when_to_use: >-
  "selfimprove" · "another" · "go meta" · or five or more unprocessed callouts since the last run.
---

## The numbers, as of this invocation

```
!`python3 .ikiro/methods/scoreboard.py | head -1`
!`python3 .ikiro/methods/fires.py --since 09-21 | head -8`
!`python3 .ikiro/methods/budget.py --baseline`
!`python3 .ikiro/methods/skills.py --fold | head -4`
```

# flywheel — "selfimprove" / "go meta": drain the Callouts ledger, recompute the Scoreboard

Every ~5th flywheel (≈25 ledger entries): run [[reflection]] (`skills/reflection/`) — the meta-pass that audits THIS one (rung efficacy, staged-gate staleness, stranded channels, pipeline reconcile). Never in the same pass.

Ledger and Scoreboard both live in `.ikiro/zettelkasten.md`. **The second ledger is `.ikiro/skills/LEDGER.md`** — the skills' own exhaust, written at each fold, folded back into the skills at step 6.

Leave `disable-model-invocation` unset. Setting it true would stop a scheduled task or `/loop` prompt saying *"selfimprove"* from ever loading this skill — which is its main firing path.

## Before step 1

- [ ] Read `## Callouts` and `## Scoreboard` in full — the fold is over the whole ledger, not the tail.
- [ ] Count unprocessed callouts since the last run. Under five and beef did not ask → do not run; a thin pass pollutes the counters.
- [ ] Confirm this is a dedicated pass. Mid-task = wrong; the consolidator judges work it did not just do.
- [ ] Step 6 has its own clock and runs on every pass, including one held under the five-callout floor — the skills ledger fills at folds, not at corrections, so the two counters are never in step.

## The six steps — one todo each

1. **scoreboard** — `python3 .ikiro/methods/scoreboard.py` prints family · n · entries from the ledger headings (tags + its MAP for untagged entries; `--unmapped` lists what still needs a row). Paste those three columns whole; rule · rung · status are the judgment you write. Never hand-edit a derived cell ([[ontology]] law 1). Raw counts only, no invented scores or severities. **The paste is mechanical**: `methods/board.py <judgment.py>` takes `JUDGE` (family → rule · rung · status, `{quiet}` filled from the derived clock), `ORDER` and `HEADER` from a scratchpad data file, re-derives, rewrites, and repeats to a fixpoint; unjudged rows keep their cells with every `N quiet` re-derived. A `|` inside a cell is written `\|`.
   - **`n` counts LEDGER ENTRIES, and every entry's date goes in the `entries` column.** A bare count is not derived — nobody, including you, can reproduce it. The old `~n` column silently mixed entries with in-entry strike counts and was unreproducible for months.
   - **Reconcile before you publish**: `sum(n)` must equal the ledger's `###` entry count plus any untitled entries. This is the step that pays — it caught a double-count (an entry filed under two families after a re-file) and a board row backed by no ledger entry at all.
   - Where one incident records multiple strikes, state the strike count in the rule cell; never fold it into `n`.
   - Entries predating the `family:` tag get classified here, in the board. The ledger stays **append-only and untouched** — never backfill a tag into a historical entry.
2. **extinction check** — family quiet **≥5 compacts** after its rule landed → **PROVEN**. Family recurred AFTER its rule promoted → the prose rule **FAILED** → draft the next rung: mechanical grep-check, then HOOK. Templates: `.ikiro/hooks/vcs-guard.sh`, `.ikiro/hooks/comment-guard.sh`. Never escalate below threshold.
   - **A rung is not landed until it is EXERCISED against the family's own callout examples.** Take the concrete offending lines out of the ledger entries and feed them to the guard; assert deny, and assert allow on the neighbouring legitimate shapes. `comment-guard.sh` sat "landed" for a session and, when finally run, passed a trailing `const X = 3; // label` and a `/* … */` header essay — the two shapes its 07-07 and 06-16 callouts describe verbatim. An unexercised gate is a claim about a gate.
   - The extinction clock starts at WIRING, not at authoring. A proven-but-inert script leaves the family at full strike count.
   - **Clock = LEDGER ENTRIES, never compacts** (compacts are prunable — 119→8 in the 20% cut silently made every compact-denominated threshold unreachable; the ledger is append-only, the only monotonic clock). **Calibrated: 1 compact ≈ 5 ledger entries** (measured — 5 of 72 landed in one session), so the historical "≥5 compacts" is **≥25 entries**, not 5; swapping the unit without rescaling loosens every gate 5×.
   - **Never re-mark families PROVEN in the same pass that changes the metric.** That is the 07-23 failure verbatim — `premature-completion` was marked PROVEN in the very session it was then committed in.
3. **promotion batch** — families at **2–3 occurrences** of the SAME family → ONE rule, **under 40 words**, landed in the file that FIRES for its shape (path-gated codemap shard for code shapes · kernel for every-turn shapes · memory for beef's preferences), hunk-level, verbatim quotes intact. **A family with a mechanical signature skips prose**: author the guard, exercise it in `hooks/exercise.sh` against the family's own ledger lines, stage it in WARN mode (`IKIRO_GUARD_MODE=warn` — logs to `~/.claude/projects/…/hooks.log`, never blocks) and only after real fires are counted propose `deny`. False positives are what make people switch guards off. Autonomous (beef: *"all inside ikiro is yours"*), curated (connoisseur judges the diff), transparent (compact trail). Identity-philosophy forks still surface to beef first.
   - **the numerator**: `python3 .ikiro/methods/fires.py --since <last board day>` folds `hooks.log` per guard × decision × classification with the rig's `exercise*` rows excluded; `fires.py --yap` folds `hooks.log-yap` (words outside fences per turn). These are the first measurements of my behaviour that do not route through beef's attention — read them before any PROVEN mark on a family a guard covers.
   - **supersession**: a rule that a later ruling retracts gets a `superseded-by:` line in its board cell, never a deletion — the ledger stays append-only and the retired rule stops firing (Agent Memory Atlas: *"correction, not retrieval, is where memory fails"*).
4. **prune pass** — `python3 .ikiro/methods/budget.py --baseline`; every THROUGHPUT row printed ABOVE drains to the owner its header names, down to its baseline (15% of cap — beef 09-23: /"these are throuput vectors. work them through. trash them."/) per [[budget-eviction]]. A `kind: persistent` file is NEVER pruned here — it is rebuilt (beef, same day: /"some are more static. map, ledger, codemaps, ikiro root, coneusseur ... these are all quite persistant."/); a persistent rule leaves only on an ablation's numbers ([[reflection]] step 6). Then a THROUGHPUT rule whose situation never arose across **≥10 ledger entries** → trash it. Prune on counters, never on a "still useful" feeling.
   - **Clock = LEDGER ENTRIES, never compacts.** Compacts are prunable (119→8 in the 20% cut), which silently makes any compact-denominated threshold unreachable. The ledger is append-only — the only monotonic clock.
   - **NEVER prune a hard gate on silence.** VCS · manifest · PII · no-comments · propose→go are quiet BECAUSE they work; by counters that is indistinguishable from dead weight. Prune prose describing a situation that stopped existing, never a gate holding a line.
5. **anchor re-audit** — replay `## anti-rationalization` against the last 3 compacts. A listed thought that appeared unstopped = drift → log a fresh callout.
6. **skills pass** — `python3 .ikiro/methods/skills.py --fold`: the board over `skills/LEDGER.md` crossed with every firing in all 135 transcripts. The other four steps fold beef's corrections; this one folds the channel's own exhaust, and it is the only step whose numerator I generate without him. Amend the skills, then write what was amended as new ledger lines (the ledger stays append-only).
   - **The rungs, and they are not the Callouts rungs.** 1 note → nothing; a single observation is not a family. **2 notes, same skill, same verdict → amend.** `GAP`/`STALE` amend the BODY (add the beat, correct the claim, re-stamp the measurement). `MISFIRE`/`MISSED` amend the TRIGGER SURFACE ONLY — `description` and `when_to_use`, in beef's own words from `lexicon.md`, never the body: a skill that was not found is not fixed by making it longer, and every word added past the point of discovery is paid for at listing time by all 28 (`project_skill_listing_budget`).
   - **A trigger that was fixed and MISSES again is a naming defect, not a wording one.** Two skills competing for one turn get merged, the loser reduced to a pointer. Sunset, never delete — the quest law holds here.
   - **Never fired** → clock is ledger notes, never days: a skill quiet through **≥10 notes** while its neighbours fired gets its trigger rewritten ONCE and stamped; quiet through 10 more → merge it into the nearest live skill. A skill written the same week has a quiet of 0 and is not a candidate; the board prints the date it was written so this cannot be eyeballed wrong. **The count alone never fires the rewrite — the skill's SITUATION must have arisen inside the window** (a MISSED note, a callout or a compact naming its shape). 09-23: all ten unfired skills crossed QUIET 23 in thirty hours; two had a situation (rename-pass: a retired env key · ontology-pass: the fourth ontology `guide` designed in #200–#201), package-development's was answered by mode-development, the rest (pull-prod-mountpoint, readme-walk, topography-development…) are rare-situation skills and their zero is rarity.
   - **The ledger takes BOTH shapes**: the `- MM-DD` line and the compact's `** skills` table row (`| skill | where | VERDICT | line |`), undated rows stamped with the file's day. 09-23 three folds pasted table rows and the board read 4 notes of 27 until `skills.py` learned the row.
   - **`NAMES THAT DID NOT RESOLVE` is the highest-value row on the board** — the only place the trigger surface is measured against what was actually reached for, rather than against what I imagine I would reach for. Resolve it in this order: (a) **nothing on disk answers it** → that is a skill PROPOSAL, already justified by a hand that expected it; (b) a skill exists and the name missed it → rename to the reached-for name, or file the spelling as a spoken alias in `when_to_use`. Measured 09-22, all three landing in (a): `ikiro-compact` · `ikiro:compact` (a fold skill reached for twice, 09-19 and 09-21, and built 09-22 by an unrelated route) · `design-login` (08-30, three weeks before `design-handoff` existed). Check the date a skill was written before reading its miss as a naming defect — the naming reading is the flattering one.
   - **A plugin skill outfiring mine on my own ground is a finding.** `superpowers:systematic-debugging` at 20 firings against `debugging` at 0 is either a dead trigger or a redundancy; name which, in the ledger, before amending either.
   - **A board's first run is a BASELINE, never a finding** — the clock starts at wiring here exactly as it does for a guard in step 2. Every empty cell on 09-22 was newborn and two of them were written up as defects before the dates were checked; the instrument now says `NEWBORN` rather than `quiet 0` so the question cannot be skipped, but the seat still has to ask it.
   - **Never amend a skill from this seat on a feeling.** The consolidator judges work it did not just do — a GAP found while running the skill is a ledger line at the fold, not an edit in the turn.

## Ledger discipline — hard, applies whenever the ledger is open

- **`## Callouts` is APPEND-ONLY.** Never edit, soften, or close an entry. Closure comes only from an extinction mark (step 2) or beef.
- **Recurrence audit before any new callout** — grep the ledger for the family first. A repeat of a family whose rule already landed is a **RULE FAILURE** entry linking the original, not a fresh lesson.
- **A corrective rule written this session is EXECUTED this session.** The family `rule-not-self-applied` exists because this got skipped.
