---
name: reflection
description: >-
  Audit the self-improvement pipeline itself — the flywheel audits my behaviour, reflection audits the
  flywheel: rung efficacy folded by rung not by family, the staleness of every staged-but-unwired gate, the
  stranded feedback channels, the prospective ratio, a live-fire of one wired hook, and an ABLATION — one
  harness component removed, the eval re-run, kept only on the numbers. Use on beef's word "reflection", every
  ~25 ledger entries, or when the model generation changes.
when_to_use: >-
  "reflection" · beef's word · every ~25 ledger entries since the last run (≈ every 5th flywheel). Never inline
  in task work, never in the same pass as a flywheel.
---

# reflection — improve the selfimprovement

The flywheel audits my behaviour; reflection audits the flywheel. The selfimprovement system optimizes RULES but its own pipeline (scribe → ledger → board → rung → wiring) rots unmeasured — the 09-01 audit found two phantom board dates, two missing rows, eight misfiled entries, and two unledgered corrections while the rules themselves were mostly fine. Reflection instruments the pipeline the way the pipeline instruments me.

Canon: `zettelkasten.md` (ledger + board) · `self/rituals.md` (the rung ladder) · `skills/flywheel/SKILL.md` (the object under audit).

## Before step 1

- [ ] Dedicated pass, beef's word or the entry clock (≥25 ledger entries since the newest `last-run` in `RUNS.md`). A reflection folded into a flywheel judges work it just did.
- [ ] Read the board and the last block of `RUNS.md` in full.

## The six steps — one todo each

1. **rung ledger** — fold the Scoreboard BY RUNG, not by family: failure rate per rung (prose · mechanical · artifact-slot · hook), published as a small table in the run record. The promotion policy is DERIVED from it: a family with a mechanical signature or an artifact-slot home skips the prose rung outright. Baseline at first run: prose FAILED 5× on the largest family; wired+measured hook extinct (vcs 2/5,657); quest-format slots ("terrain — measured, not assumed", testing assessment, blast table) executed in every live quest.
2. **staleness sweep** — age every staged-but-unwired gate, PROPOSED family awaiting taxonomy, and at-threshold board row. Anything older than one flywheel gets a line in the NEXT wake's first message (morning-briefing channel). A calibrated gate that sat unwired 18 days while its family recurred twice is the founding case.
3. **drain the stranded channels** — feedback streams that exist on disk and that the flywheel never drains:
   - **quest QA markers** — `python3 .ikiro/methods/markers.py` (contract: methods/quest.md ## QA): a `pending` on a DONE quest is drift → log it (20 on 3 done/ quests at first run: m46 ×10 · m57 ×5 · m61 ×5); a `broken` is a Callouts entry; `held` counts feed the Scoreboard's prospective side; a `—`-separated or unprefixed marker reads as an empty verdict in `quest-report.py` and is fixed in place;
   - compact **method-notes / failures-traps** sections since the last run → promote the rules they strand (ledger, rituals, or connoisseur);
   - **beef's post-landing edits** — `jj diff` / `git diff` on files I landed that he then reworked; his silent rewrite is the highest-signal correction there is, and it is never shouted;
   - **guard friction** — transcript shapes where a session routed AROUND a wired hook (the comment-guard split-edit workaround is the founding case) → fix the guard, never inherit the folklore.
   - **the skills ledger** — `python3 .ikiro/methods/skills.py --fold`: rows written at folds that the flywheel's step 6 never drained, and — the part only this seat can do — whether a landed amendment CHANGED anything. A trigger rewritten for `MISSED` is a hypothesis; the board's `used` column since that date is its test. An amendment that did not move the firings is the skills' own version of a prose rung failing, and the next rung is a rename or a merge, not more wording. Counterpart risk: a skill whose firings rose while its `GAP` count rose with them was not improved, it was only used more.
   - **compacts flagged for reflection** — `grep -l '^#+reflect: OPEN' .ikiro/compacts/*.org`: a fold that noticed something about ME rather than about the code parks its questions there instead of inventing a ledger family too early. Answer each question in the run record, then rewrite the property to `#+reflect: DRAINED <run date>`. Founding case: `#144 the-fold-after-the-selfclean…` — relayed agent findings reported with my own word *verified*.
4. **prospective ratio** — count pre-landing catches (critical passes, connoisseur judgments) vs post-landing callouts since the last run. The ratio decides where the next investment goes; the standing bias it corrects: the ledger is entirely post-hoc while critical passes demonstrably catch more per token.
5. **pipeline reconcile + live-fire** — re-run the 09-01 checks (board recomputed from `grep '^### '`, callout inserts under the right heading, every compact-recorded correction has a ledger twin) AND exercise ONE wired hook against a live shape from its own family's ledger examples. A gate unexercised since wiring is a claim about a gate.
6. **ablation** (m69 3.4) — /"Every component in a harness encodes an assumption about what the model can't do on its own"/ (`reference/harnesses/harness.md` §9, HN #6): remove ONE component — a kernel line, a skill, a shard's authored half, a hook — in an arm, re-run the eval on the tasks it claims to serve, keep it only if pass^k moves beyond the noise floor.

   ```sh
   A=~/.viva/bak/ikiro/ablate-<component>-<YYYYMMDD>
   bash .ikiro/methods/eval.sh snapshot "$A"                             # the live harness as an arm: ikiro/ · claude/ · memory/
   $EDITOR "$A/ikiro/<the file>"                                         # remove ONE component, nothing else
   bash .ikiro/methods/eval.sh "$A" --tasks <its tasks> --trials 2       # the ablated arm
   bash .ikiro/methods/eval.sh current --tasks <its tasks> --trials 2    # the control, same run day
   ```

   The noise floor is the SAME arm run twice (`evals/runs/*-noise`); a delta under it is not a result, and a component that cannot be told from its absence leaves. The row lands in `.ikiro/evals/runs/ablations.jsonl` — `{date, model, component, tasks, control, ablated, noise, verdict: KEEP|DELETE}` — and the flywheel reads it beside the Scoreboard: the only numerator on the harness that does not route through beef's attention. Re-run the whole round when the model generation changes (/"harnesses have to keep getting simpler as models are post-trained on agent trajectories"/). A hard gate (VCS · manifest · propose→go) is never ablated on the live tree — its eval tasks measure it, its absence is never shipped.

## Run record

Append one dated block per run to `RUNS.md` beside this file: entry count, rung table, staleness list, channels drained, ratio, hook exercised. That file is the clock and the memory; this one is the method. The gate in *Before step 1* reads the newest block's `last-run`.

## Hard lines

- Reflection edits `.ikiro/` autonomously (beef: *"all inside ikiro is yours"*) — but WIRING into `.claude/settings.json` and anything outward stays per-op `go`, surfaced via step 2, never self-granted.
- Consolidator ≠ actor: reflection never lands product code, never runs a flywheel in the same pass, never re-marks a family PROVEN (that is the flywheel's job).
- Findings that indict the flywheel's own method go into the flywheel SKILL as diffs, hunk-visible, quotes intact.
