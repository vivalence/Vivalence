---
name: quest-authoring
description: >-
  Write or extend an implementation quest in the shape beef accepts — the twelve organs as PRACTICED in the
  canon quests (intent verbatim · terrain measured · rulings · the law · milestones · blast table · testing
  assessment · QA markers · changelog · release), one file, no sidecars, unnumbered until beef numbers it. Use
  on "write the quest", "crystallize this", or when a design has settled and code is not yet authorized.
when_to_use: >-
  "write a quest" · "compile a quest for this" · "crystallize this" · "write the full patch as a quest" ·
  "add this to the quest" · a design conversation has settled and code is not yet authorized.
---

# quest-authoring — the organs as practiced, one file, beef's voice verbatim

Canon: `methods/quest.md` (the spec: tangle convention, testing assessment, QA two perspectives, QA-before-blast). This skill carries what the spec understates — measured against the 12 canon quests (those with both a testing assessment and `#+marker_qa`), not against the 129. Lifecycle (sunset · revive · index) is [[quest-lifecycle]]; the adversarial pass is [[critical-pass]].

## Header — as every modern quest has it

```org
#+title: <name>
#+filetags: :<tags>:
#+status: <landing prose, agent-authored; beef's words inside /"…"/; a superseded status stays as a second line>
#+status: (was) <the previous status>
```

`#+phase` · `#+progress` · `#+next` are STAMPED by `quest-report.py` with a `(derived)` suffix — never author them unless overriding, and an override has no suffix. The status line is MACHINE-READ (`DONE_WORDS`): a clause containing `landed · applied · done · green` is booked as a finished milestone of THIS quest — one fold booked another quest's M1–M3 as its own. Name only your own milestones inside done-worded clauses.

## The organs — canon frequency in brackets (of 12)

- `* intent` (12) — beef's words VERBATIM, never a digest (*"one file, no sidecars"* · *"intent verbatim"*, #178).
- `* terrain — measured` (11) — the live tree BEFORE design, every number from a command run this session. The evidentiary base: *"Every mechanism claim below was MEASURED this session by script against typebox 1.3 and the live tree."*
- a **rulings organ** (union 78/129) — `* forks` (41) · `* decisions` (33) · `* the decision trail` (9) · `* rulings` (2). Require the organ, not the heading. Each fork: options · beef's ruling verbatim · why it settled. `amen` locks per item.
- `* the law` (8) — the invariants the quest establishes, as an `#+BEGIN_EXAMPLE` prose block.
- `* milestones` (10) — each `blast → test → land → test → blast`; each boots green at its boundary; coupled halves are absorbed into ONE milestone.
- `* blast table` (11) — `file · change · milestone · kind`, container-rooted paths, every touchpoint incl. `~/.viva/instances` and tapped packages (`feedback_flag_day_radius`).
- `* testing assessment` (12) — `in place` + an explicit `COVERAGE GAP:` paragraph · `changes` (test | why) · `adds` · `per-milestone green ladder` (milestone | gate) · the pre-DONE sentence. See [[testing]].
- `* QA` (12) — ① testimony, first person, pre-registered *"I type X, I see Y"* · ② programmatic probes + markers:
  ```
  #+marker_qa: <quest>/<T|P>-<slug> · pending · <one line: what to verify>
  ```
  Separator is `·`, verdict enum `pending → held | broken | revised`. A `—` separator or a missing `<quest>/` prefix reads as an empty verdict in `quest-report.py` (18 + 11 on disk today, `methods/markers.py`).
- `* deferred` (11) — out of scope + the trigger that reopens it. Park, never delete; `quests/<name>/deferred/` for artifacts.
- `* changelog` (12) — per milestone: PASTED counts `N passed (M steps) | F failed` · the baseline · pre-existing reds NAMED with attribution (*"Ghost is red from the SIBLING m57 rework, not m59"*) · walk incidents that are not the quest's · coverage before → after. Never the `suite N/M` shorthand — it means files/steps in one quest and passed/failed in another.
- `* release` (10) — one line per interface delta in the [[release]] format, or `none: no interface moved`. Lifted verbatim at sunset.

Tangle: NEW files `:tangle` whole; surgical edits in large files as `#+BEGIN_SRC diff` hunks with the path in prose; a full-file tangle of an EXISTING file shows the live BEFORE (re-read that turn) and brackets the change. Every `### []` to the level of a diff — *"way too flat"* · *"is the quest really complete? full patch?"* — a row in a table is not a hunk.

## beef's repeated corrections — in order of frequency

1. **no prose in table cells** — *"gimme table high level serialized enums numbers. then in depth sections!"*
2. **container-rooted path on every snippet, per message** — *"WHAT FILE?????? context bro"* — two `populate.js` in one quest.
3. **grep the quest for new `@beef` marks before every reply** — his inline edits are the highest-signal correction and never shouted.
4. **known issues never live in a quest** — *"this got nothing to do with this quest. i said known issues!"* → [[known-issues]].
5. **mark unsettled as QUESTIONED, do not guess.**
6. **remove about as much as you add**; sort by milestone for the reader who arrives at one.
7. **never answer beef in quest shorthand** (M2, T3, gate ids) — nouns and file paths.
8. **numbering is his** — author unnumbered; a number arrives only from beef, and an explicit order (*"compile a quest 48 for this change"*) IS the arrival. Never invent or extend `mXX` (`feedback_mxx_quests_are_finns`).
9. **run the critical pass BEFORE the status says tangleable** — eleven faults sat in a quest already marked tangleable.
10. **a go on a sketch is a go on the ITEM; praise is not a go; scope confirmation is not a go.**
11. **every decision carries its line** — `quest.org:LINE` (the fork AND the hunk) + `file:LINE` (the code), grepped at reply time, never recalled — *"I also navigate by line … tell me what lines I'm at."* (m68). Item 7's nouns and paths, now with the line.

## Before calling it ready

`python3 .ikiro/methods/markers.py` (no `—`, no unprefixed ids) · `python3 .ikiro/methods/quest-report.py --format md` (progress reads as designed, not as done) · regenerate `quests/index.md` · [[critical-pass]] if the quest carries an executable artifact.
