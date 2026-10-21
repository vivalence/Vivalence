---
name: quest
description: >-
  Write a quest in the shape beef accepts, sunset or revive it by `mv`, lift its release lines into the interface
  ledger, file defects that outlive it in the OPEN-only known-issues ledger — never a quest section.
when_to_use: >-
  "write a quest" · "crystallize this" · "add this to the quest" · a design settled, code not yet authorized · closing a quest ·
  "sunset this quest" · "revive <quest>" · "bench it" · an urge to rm a quest · writing, lifting or editing
  `* release` · `.ikiro/release.md` · "cut a release" · tags vs jj bookmarks · "mark as known issue" · "known issues!" · a defect outside the current quest's scope · a pass's base-tree red ·
  a fix that needs beef's ruling · "mark the issue itself without your approach".
---
<!-- limit: 6000 chars -->
# quest — the decision trail

## author

Head: `#+title: <name>` · `#+filetags: :<tags>:` · `#+status: <landing prose; his words in /"…"/>`.

Organs: `* intent` (beef VERBATIM) · `* the dialogue` (his turn + my code) · `* terrain — measured` · rulings (his words verbatim per item) · `* the law` · `* deliverables` · `* milestones` (each green) · `* blast table` (incl. `~/.viva`; BREAKS: now or at land) · `* testing assessment` (`COVERAGE GAP:`) · `* QA` (/"I type X, I see Y"/ + `#+marker_qa: <quest>/<T|P>-<slug> · pending · <what>`, `pending → held | broken | revised`) · `* deferred` · `* changelog` (pasted counts, attributed reds) · `* release` · `* handoff`.

Tangle: new files whole; edits as `#+BEGIN_SRC diff` hunks `methods/cut.py` writes, `apply-diffs.py` lands — line 1 `// <path>:<line>`, `…` between sub-hunks, one file a block, old lines exact (REJECTED: `@@`, `… unchanged …`); a move = a `Moves` row, `mv` first, its block on the NEW path; the tangle IS the filesystem: `***` system · `****` directory · `*****` file (his, 10-16), `ls` order, each file naming its source (REJECTED 10-12: milestone order).
beef's corrections:
1. /"gimme table high level serialized enums numbers. then in depth sections!"/ — no prose in cells; a ruling row = his words only, its hunk under `* as code`, no REJECTED trail — /"full of code, not full of yap"/. Terrain + questions = verbatim fences (/"all yap and no code. idiot"/); a quoted dead-word line → `…`.
2. grep the quest for new `@beef` marks each reply; treated → prepend `// -- `.
3. remove as much as you add; removed = MOVED whole to `reference/<quest>/`. REJECTED 10-12 /"nonono dont cut."/ · 10-20 /"not just my yap also your code"/
4. never shorthand (M2, MP) — nouns, paths; a milestone is a NOUN; numbering is his.
5. a decision carries `quest.org:LINE` + `file:LINE`, grepped.
6. a killed name — his, or a sibling's ruled death — leaves every block that turn (REJECTED 10-23 `/chrome/on`: /"there is no chrome on/off atm"/). A re-tangle replays EVERY ruling on every block, a grep each, pasted; a relabeled header is no rewrite.
7. a fork is his only when it changes product shape or ontology (rig · test tree · staging order: mine, /"your judgement calls."/); asked as a question, ruled → the tangle that turn, unruled → `* deferred`, never a `* forks` list (/"you never resolve forks do you"/).

Before ready: a block a sibling rewrites moves there (10-24 /"double work"/) · `grep -n 'marker_qa' <quest>` · `quests/index.md` · critical pass (skill `change`) + connoisseur per hunk before TANGLED · blocks replay on a copy (`--root`), paths equal · cells pipe-free. Replay ≠ the tree: PROVEN = WHOLE census, serial, on the landing tree; land on the repo AS IT STANDS (drift → `diff3 -m`); no `head`-cut list.

## lifecycle — sunset, never delete

/"quests get sunset, rarely deleted."/

```
.ikiro/quests/
  <live>.org  in flight, root only
  done/       landed AND verified
  discarded/  sunset without landing
  benched/    parked, a reopening trigger
  roadmap/    beef's strands, no milestone
  index.md    a line per quest
```

0. work without a quest → a NEW live quest (number: `index.md` + `ls` the root; a sibling's quest on the subject absorbs it, /"idiot. combine!"/) before its first ruling or review; `done/` gets a pointer only (/"why are we in m87??"/).
1. gate into `done/`: no `pending` marker — MY walk (REJECTED 10-24 listed as owed); `broken` → skill `fold`; `* release` LIFTED.
2. plain `mv` ONLY, never `git mv` · `rm`; epitaph in `index.md`.
3. drop its frontier line; grep live canon for the old path.

Never move a live session's quest. Revive read-only: `git log --diff-filter=D --name-only -- '.ikiro/quests'` · `git show <del-commit>^:<path>`; DONE → `done/`, mid-design → `discarded/`, WHOLE on today's shape (rule 2).

## release — the interface ledger

/"its time that we start thinking in changelogs. how did the interfaces actually change?"/ `.ikiro/release.md`, reverse-chron, `## unreleased` accumulates; sections ordered, if non-empty: `###` cli · route · api · entity · env · other.

Line: - <verb> `<surface>` — <what a consumer sees, before → after> · migrate: <action | none> ⟨<quest>⟩; verb ∈ `added · changed · renamed · removed · fixed`; surface = what a consumer types; `migrate:` real when breaking.

Cut (beef runs via `!`): a release hangs on a TAG; jj makes none, a bookmark is a BRANCH: `jj git push` · `gh release create v0.1.0-alpha.1 --prerelease --target <sha> --notes-file notes.md` (never `@alpha`, no `--generate-notes`).

## known issues — OPEN only, never a quest section

/"this got nothing to do with this quest. i said known issues!"/ `grep -n '^\* ' .ikiro/known-issues.org` first — a duplicate appends.
A base-tree red with a named cause is filed that turn, never offered (REJECTED 10-23: /"i assume all teh bugs … are in the quest?"/).

Shape: `* <slug> — OPEN` › `**` Symptom · Root cause · Evidence · Ruling · Why not fixed · Workaround.

- /"mark the issue itself without your approach as an issue in ikiro"/ → the issue + his REJECTED approach, none of mine.
- resolved is CUT.
- `* deferred` = in scope later; a known issue = a live defect no one fixes.