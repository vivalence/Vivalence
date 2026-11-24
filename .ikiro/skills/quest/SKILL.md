---
name: quest
description: Write a quest he accepts, move it when it ends, file defects in known issues.
when_to_use: >-
  "write a quest" · "create a quest" · "add this to the quest" · "update the quest" · "cast to quest" ·
  "move to done" · "sunset this quest" · "bench it" · "mark as known issue" · "known issues!"
---
<!-- limit: 4200 chars -->
# quest — a design he ruled, as code

## what a quest holds

```org
#+title: <name> — <one line>
#+status: <one line: what is true now>

* intent        his words, verbatim
* rulings       a table: his words, the state
* as code       the approved code, as diffs
* milestones    a waterfall: step, green when, state
* never         what was ruled out
* next          one line
```

- Milestone states: `DECLARED` · `DESIGNED` · `TANGLED` · `LANDED`.
- Milestones are a waterfall in build order: each step stands on the one above and says what makes it green. What he opens is a late step, never the first. An area is its directory.
- A ruling row holds his words only. Its code sits under `* as code`.
- No changelog, no transcript, no done list, no test count table.
- Nothing about one moment of the machine: no pid, no restart, no clock time, no session.
- No shorthand. Nouns and paths.
- A name he killed leaves every block that turn.
- His `@beef` marks in a quest are never cut or reworded.
- A fork is his only when it changes the product's shape or its names. The rest I decide and say in one line.

## as code

- A new file is shown whole.
- An edit is a diff block. Line one is `// <path>:<line>`. Old lines are exact.
- Each new diff is replayed on a copy the turn it is written:

```sh
python3 .ikiro/methods/apply-diffs.py --root <copy>
```

- The scripts and probes of a quest live in `.ikiro/reference/<quest>/`.

## where a quest lives

```
.ikiro/quests/
  <live>.org    in flight
.ikiro/bak/quests/
  done/         landed and verified
  discarded/    stopped, not landed
  benched/      parked
  roadmap/      his strands, no milestone yet
```

- Work without a quest gets a new one before its first ruling. It has no number until he gives one.
- A quest moves to `.ikiro/bak/quests/done/` when nothing of mine is red and he has looked.
- Move with `mv`. Never delete a quest.
- Never move a quest a live session works on.

## known issues

A defect outside the quest goes to `.ikiro/known-issues.org` that turn. Grep for a duplicate first.

```org
* <slug> — OPEN
** Symptom
** Root cause
** Evidence
** Workaround
```

- A resolved issue is cut.
- "mark the issue without your approach": the issue only, none of my fixes.
