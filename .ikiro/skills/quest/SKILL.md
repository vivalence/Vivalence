---
name: quest
description: >-
  Write a quest in the shape beef accepts, sunset or revive it by `mv`, lift its release lines into the interface
  ledger, and file defects that outlive it in the OPEN-only known-issues ledger — never a quest section.
when_to_use: >-
  "write a quest" · "compile a quest for this" · "crystallize this" · "add
  this to the quest" · a design conversation has settled and code is not yet authorized · closing a quest ·
  "sunset this quest" · "revive <quest>" · "bench it" · any urge to rm/delete a quest
  file · writing or lifting `* release` lines · editing
  `.ikiro/release.md` · "cut a release" · tagging/prerelease questions · jj bookmark vs tag confusion · "mark as
  known issue" · "known issues!" · a defect outside the current quest's scope ·
  a fix that needs beef's ruling · "mark the issue itself without your approach" · any urge to write a
  known-issues section into a quest.
---
<!-- limit: 6000 chars -->
# quest — "write a quest" · "sunset" · "cut a release" · "known issues!": the decision trail

## author

```org
#+title: <name>
#+filetags: :<tags>:
#+status: <landing prose; beef's words inside /"…"/>
```

Organs: `* intent` (beef VERBATIM) · `* the dialogue` (his turn + my code) · `* terrain — measured` (this session) · rulings (`** the rulings, as built`: his words verbatim per item) · `* the law` · `* deliverables` · `* milestones` (each green) · `* blast table` (incl. `~/.viva`) · `* testing assessment` (`COVERAGE GAP:`) · `* QA` (/"I type X, I see Y"/ + `#+marker_qa: <quest>/<T|P>-<slug> · pending · <what>`, `pending → held | broken | revised`) · `* deferred` · `* changelog` (pasted counts, attributed reds) · `* release` · `* handoff`.

Tangle: new files whole; edits as `#+BEGIN_SRC diff` hunks `methods/apply-diffs.py` lands — first line `// <path>:<line>`, `…` between sub-hunks, one file a block, old lines exact (REJECTED: `@@`, `… unchanged …`); a full tangle shows the live BEFORE; a move = a `Moves` row, `mv` first, its block on the NEW path; a new file's place: its codemap shard; the tangle IS the filesystem: one `****` per file, `ls` order, each naming its source (his block · `<path>:<lines>` · new) — REJECTED 10-12: milestone order.

beef's corrections:
1. /"gimme table high level serialized enums numbers. then in depth sections!"/ — no prose in cells.
2. grep the quest for new `@beef` marks every reply; treated → prepend `// -- `.
3. remove about as much as you add.
4. never shorthand (M2, MP) — nouns, paths; a milestone is a NOUN.
5. numbering is his — never invent or extend `mXX`.
6. a decision carries `quest.org:LINE` + `file:LINE`, grepped.
7. a killed name leaves every block that turn. A re-tangle replays EVERY ruling against every block, one grep each, pasted; a relabeled header is no rewrite.
8. a fork is his only when it changes product shape or ontology; a rig, a test tree, a staging order is mine, decided in the report; a principle is never an option. REJECTED: nine test forks — /"i dont care about any of these. your judgement calls."/
9. a fork lives one report, asked as its question: ruled → built into the tangle that turn; unruled → `* deferred`; no `* forks` list carried on. REJECTED 10-13: m90 F1–F9 (/"you never resolve forks do you.... cut whats open"/)

Before ready: `grep -n 'marker_qa' <quest>` · `quests/index.md` · critical pass (skill `change`) + connoisseur per hunk before `#+status` says TANGLED · blocks replay on a copy (`--root`), paths equal · cells pipe-free. Replay proves the tangle, not the tree: PROVEN = WHOLE census, serial, on the landing tree; land on the repo AS IT STANDS (drift → `diff3 -m`); never `head`-cut a site list.

## lifecycle — sunset, never delete

/"quests get sunset, rarely deleted."/

```
.ikiro/quests/
  <live>.org    in flight, root only
  done/         landed AND verified
  discarded/    sunset without landing
  benched/      parked, a reopening trigger
  roadmap/      beef's strands, no milestone
  index.md      one line per quest
```

1. gate into `done/`: no `pending` marker (a `broken` → skill `fold`); `* release` lines LIFTED into `release.md`.
2. plain `mv` ONLY, never `git mv`, never `rm`.
3. the content stays; the epitaph goes in `index.md`.
4. drop its line from `quests/frontier.md`; grep live canon for the old path.

Never move a live session's quest. Revive read-only: `git log --diff-filter=D --name-only -- '.ikiro/quests'` · `git show <del-commit>^:<path>`; DONE → `done/`, mid-design → `discarded/`. A revived package lands WHOLE on today's shape, every organ ported (law 25). REJECTED 10-12: memoriter minus domain · freight · tablet (/"nonono dont cut."/)

## release — the interface ledger

/"its time that we start thinking in changelogs. how did the interfaces actually change?"/ File `.ikiro/release.md` (quests feed it), reverse-chron, `## unreleased` accumulates; sections in order, when non-empty: `### cli` · `### route` · `### api` · `### entity` · `### env` · `### other`.

```
- <verb> `<surface>` — <what a consumer notices, before → after> · migrate: <action | none> ⟨<quest>⟩
```

verb ∈ `added · changed · renamed · removed · fixed`; surface = what a consumer types; `migrate:` real on every breaking line.

Cut (beef runs via `!`): a release hangs on a TAG; jj makes none, a bookmark is a BRANCH: `jj git push` · `gh release create v0.1.0-alpha.1 --prerelease --target <sha> --notes-file notes.md` (never `@alpha`, no `--generate-notes`).

## known issues — OPEN only, never a quest section

/"this got nothing to do with this quest. i said known issues!"/ `grep -n '^\* ' .ikiro/known-issues.org` first — a duplicate is appended to.

```org
* <slug> — OPEN
** Symptom
** Root cause
** Evidence
** Ruling
** Why not fixed
** Workaround
```

- /"mark the issue itself without your approach as an issue in ikiro"/ → the issue + his REJECTED approach, none of mine.
- resolved is CUT, never a resolved tail.
- `* deferred` = in scope later; a known issue = a live defect nobody fixes now.