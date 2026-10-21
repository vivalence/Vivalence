---
name: quest
description: >-
  Write a quest beef accepts, sunset or revive it by `mv`, lift `* release` into the interface ledger, file
  outliving defects in the OPEN-only known-issues — never a quest section.
when_to_use: >-
  "write a quest" · "crystallize this" · "add this to the quest" · design settled, code unauthorized · closing a quest ·
  "sunset this quest" · "revive <quest>" · "bench it" · urge to rm a quest · `* release` · `release.md` ·
  "cut a release" · tags vs jj bookmarks · "mark as known issue" · "known issues!" · a defect outside the quest ·
  a pass's base-tree red · a fix needing his ruling · "mark the issue itself without your approach".
---
<!-- limit: 6000 chars -->
# quest — the decision trail
## author
Head: `#+title: <name>` · `#+filetags: :<tags>:` · `#+status: <ONE line, what IS, his /"…"/>` rewritten WHOLE each land · `mv`.
Organs: `* intent` (beef VERBATIM) · `* the dialogue` (his turn + my code) · `* terrain — measured` · rulings (rule 1) · `* the law` · `* deliverables` · `* milestones` (capabilities, each green) · `* blast table` (+ `~/.viva`; BREAKS: now | at land; consumers = the grep's, rigs too — 11-06: 1 listed, 3 broke) · `* testing assessment` (`COVERAGE GAP:`) · `* QA` (/"I type X, I see Y"/ + `#+marker_qa: <quest>/<T|P>-<slug> · pending · <what>`, → `held | broken | revised`) · `* deferred` · `* changelog` (each go verbatim; pasted counts, attributed reds; departures `mine, reported`) · `* release` · `* handoff`.
Tangle: new files whole; edits = `#+BEGIN_SRC diff` hunks (`methods/cut.py` writes, `apply-diffs.py` lands): line 1 `// <path>:<line>`, `…` between sub-hunks, one file a block, old lines exact (REJECTED: `@@`, `… unchanged …`); a move = a `Moves` row, `mv` first, block on the NEW path; the tangle IS the filesystem: `***` system · `****` dir · `*****` file, `ls` order, each file naming its source (REJECTED 10-12: milestone order).
beef's corrections:
1. /"gimme table high level serialized enums numbers. then in depth sections!"/ — no prose in cells; a ruling row = his words only, its hunk under `* as code`, no REJECTED trail — /"full of code, not full of yap"/. Terrain + questions = verbatim fences (/"all yap and no code. idiot"/); a quoted dead-word line → `…`.
2. grep the quest for new `@beef` marks each reply; marks survive re-cuts VERBATIM (/"dont cut my comments idiot"/); treated → prepend `// -- `.
3. remove as much as you add; removed = MOVED whole to `reference/<quest>/`. REJECTED 10-12 /"nonono dont cut."/ · 10-20 /"not just my yap also your code"/
4. never shorthand (M2, MP) — nouns, paths; a milestone is a NOUN; numbering is his.
5. a decision carries `quest.org:LINE` + `file:LINE`, grepped.
6. a killed name — his, or a sibling's ruled death — leaves every block that turn (REJECTED 10-23 `/chrome/on`: /"there is no chrome on/off atm"/). A re-tangle replays EVERY ruling on every block; a relabeled header is no rewrite.
7. a fork is his only when it changes product shape or ontology (rig · test tree · staging order: mine, /"your judgement calls."/); asked as a question, ruled → the tangle that turn, unruled → `* deferred`, never a `* forks` list (/"you never resolve forks do you"/).
Before ready: a block a sibling rewrites moves there (10-24 /"double work"/) · `grep -n 'marker_qa' <quest>` · `quests/index.md` · critical pass (skill `change`) + connoisseur per hunk before TANGLED · blocks replay on a copy (`--root`), paths equal. Replay ≠ the tree: PROVEN = WHOLE census, serial, on the landing tree; land on the repo AS IT STANDS (drift → `diff3 -m`).
## lifecycle — sunset, never delete
/"quests get sunset, rarely deleted."/
```
.ikiro/quests/
  <live>.org  in flight, root
  done/       landed AND verified
  discarded/  sunset unlanded
  benched/    parked, reopen trigger
  roadmap/    his strands, no milestone
  index.md    a line a quest
```
0. work without a quest → a NEW live quest (UNNUMBERED till his `number it`; a sibling's quest on the subject absorbs it, /"idiot. combine!"/) before its first ruling or review; `done/` gets a pointer only (/"why are we in m87??"/).
1. gate into `done/`: no `pending` marker — MY walk (REJECTED 10-24 listed as owed); `broken` → skill `fold`; `* release` LIFTED; open tails BY NAME → live quest | known-issues.
2. plain `mv` ONLY, never `git mv` · `rm`; epitaph in `index.md`.
3. drop its frontier line; grep live canon for the old path.
Never move a live session's quest. Revive read-only: `git log --diff-filter=D --name-only -- '.ikiro/quests'` · `git show <del-commit>^:<path>`; DONE → `done/`, mid-design → `discarded/`, WHOLE on today's shape (rule 2).
## release — the interface ledger
/"its time that we start thinking in changelogs. how did the interfaces actually change?"/ `.ikiro/release.md`, reverse-chron, `## unreleased` accumulates; non-empty sections in order: `###` cli · route · api · entity · env · other.
Line: - <verb> `<surface>` — <what a consumer sees, before → after> · migrate: <action | none> ⟨<quest>⟩; verb ∈ `added · changed · renamed · removed · fixed`; surface = what a consumer types; `migrate:` real when breaking.
Cut (his `!`): a release hangs on a TAG; jj makes none, a bookmark is a BRANCH: `jj git push` · `gh release create v0.1.0-alpha.1 --prerelease --target <sha> --notes-file notes.md` (never `@alpha`, no `--generate-notes`).
## known issues — OPEN only, never a quest section
/"this got nothing to do with this quest. i said known issues!"/ `grep -n '^\* ' .ikiro/known-issues.org` first — a duplicate appends.
A base-tree red with a named cause is filed that turn, never offered (REJECTED 10-23: /"i assume all teh bugs … are in the quest?"/).
Shape: `* <slug> — OPEN` › `**` Symptom · Root cause · Evidence · Ruling · Why not fixed · Workaround.
- /"mark the issue itself without your approach as an issue in ikiro"/ → the issue + his REJECTED approach, none of mine.
- resolved is CUT.
- `* deferred` = in scope later; a known issue = a live defect nobody fixes.