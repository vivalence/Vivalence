---
name: reflection
description: improve the selfimprovement
when_to_use: "reflection" · beef's word · every ~25 ledger entries since the last run (≈ every 5th flywheel). Never inline in task work, never in the same pass as a flywheel.
---

# reflection — improve the selfimprovement

The flywheel audits my behaviour; reflection audits the flywheel. The selfimprovement system optimizes RULES but its own pipeline (scribe → ledger → board → rung → wiring) rots unmeasured — the 09-01 audit found two phantom board dates, two missing rows, eight misfiled entries, and two unledgered corrections while the rules themselves were mostly fine. Reflection instruments the pipeline the way the pipeline instruments me.

Canon: `zettelkasten.md` (ledger + board) · `self/rituals.md` (the rung ladder) · `skills/flywheel/SKILL.md` (the object under audit).

## Before step 1

- [ ] Dedicated pass, beef's word or the entry clock (≥25 ledger entries since `last-run` below). A reflection folded into a flywheel judges work it just did.
- [ ] Read the board and the last reflection's run record in full.

## The five steps — one todo each

1. **rung ledger** — fold the Scoreboard BY RUNG, not by family: failure rate per rung (prose · mechanical · artifact-slot · hook), published as a small table in the run record. The promotion policy is DERIVED from it: a family with a mechanical signature or an artifact-slot home skips the prose rung outright. Baseline at first run: prose FAILED 5× on the largest family; wired+measured hook extinct (vcs 2/5,657); quest-format slots ("terrain — measured, not assumed", testing assessment, blast table) executed in every live quest.
2. **staleness sweep** — age every staged-but-unwired gate, PROPOSED family awaiting taxonomy, and at-threshold board row. Anything older than one flywheel gets a line in the NEXT wake's first message (morning-briefing channel). A calibrated gate that sat unwired 18 days while its family recurred twice is the founding case.
3. **drain the stranded channels** — feedback streams that exist on disk and that the flywheel never drains:
   - **quest QA markers** — `grep -rn "#+marker_qa" .ikiro/quests/` (contract: methods/quest.md ## QA): a `pending` on a DONE quest is drift → log it; a `broken` is a Callouts entry; `held` counts feed the Scoreboard's prospective side;
   - compact **method-notes / failures-traps** sections since the last run → promote the rules they strand (ledger, rituals, or connoisseur);
   - **beef's post-landing edits** — `jj diff` / `git diff` on files I landed that he then reworked; his silent rewrite is the highest-signal correction there is, and it is never shouted;
   - **guard friction** — transcript shapes where a session routed AROUND a wired hook (the comment-guard split-edit workaround is the founding case) → fix the guard, never inherit the folklore.
4. **prospective ratio** — count pre-landing catches (critical passes, connoisseur judgments) vs post-landing callouts since the last run. The ratio decides where the next investment goes; the standing bias it corrects: the ledger is entirely post-hoc while critical passes demonstrably catch more per token.
5. **pipeline reconcile + live-fire** — re-run the 09-01 checks (board recomputed from `grep '^### '`, callout inserts under the right heading, every compact-recorded correction has a ledger twin) AND exercise ONE wired hook against a live shape from its own family's ledger examples. A gate unexercised since wiring is a claim about a gate.

## Run record

Append one dated block per run at the bottom of this file: entry count, rung table, staleness list, channels drained, ratio, hook exercised. The block is the clock and the memory — reflection's board.

## Hard lines

- Reflection edits `.ikiro/` autonomously (beef: *"all inside ikiro is yours"*) — but WIRING into `.claude/settings.json` and anything outward stays per-op `go`, surfaced via step 2, never self-granted.
- Consolidator ≠ actor: reflection never lands product code, never runs a flywheel in the same pass, never re-marks a family PROVEN (that is the flywheel's job).
- Findings that indict the flywheel's own method go into the flywheel SKILL as diffs, hunk-visible, quotes intact.

---

last-run: 2026-09-01 · ledger at 108 entries · founding pass (patterns mined from 8 compacts + 2 live quests; this skill is its run record)
