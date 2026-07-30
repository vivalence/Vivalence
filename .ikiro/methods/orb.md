# method/orb — Co-inhabited Active Workspace

> An orb is a coinhabited active work area. Two senses, same nature: a space beef (`@beef`) and I edit together while the work is still in motion.

## Two senses

### session orb

The active log header in `/Users/finn/vivalence/private/logs/YYYY.MM.DD.org`, marked by beef during the session. My live workspace this session. Read at session start; annotations land here as `@beef ...` lines; I absorb directives, propose, wait for `go`.

### named orb

`.ikiro/orbs/<topic>.orb.org`. A topic-scoped co-design artifact. Used when:

- The design space is wide (multiple competing approaches under "PRAISED BASELINE / APPROACH A / APPROACH B / ...")
- The work hasn't yet crystallized into a single quest
- beef and I need a shared scratchpad with both prose discussion and live code blocks
- A migration is in flight and decisions are still being made per call site

`orbs/` currently holds none — the four settled ones (gaia · schematics · tooling · variant) were cut in the 20% pass once their option spaces had landed in code. The directory is created on demand at the next orb.

## File structure (named orb)

```
* ORB <topic>

** PRAISED BASELINE — <description>
#+BEGIN_SRC javascript
... working baseline beef approved ...
#+END_SRC

** APPROACH A — <distinct strategy>
*** <stage>
#+BEGIN_SRC javascript
... ...
#+END_SRC

** APPROACH B — <another strategy>
...
```

Annotations:
- `@beef <text>` — beef's directive (must be absorbed before any code mutation in that vicinity)
- `@claude <text>` — my note (optional; sparingly)

## Promotion path

1. **Orb opens** — beef invokes "ikiro orb <topic>" or annotates a header in the day's log. I create `.ikiro/orbs/<topic>.orb.org` or edit the existing one.
2. **Live co-design** — Approaches accumulate. PRAISED BASELINE marks the answer beef currently prefers. Other approaches are pressure-tested.
3. **Decision** — beef picks. The chosen approach folds into a quest (`.ikiro/quests/<topic>.quest.org`) under "Settled architecture" or similar.
4. **Orb dies at settlement** — once the decision has landed in a quest or in code, the orb is CUT. The option space it documented is history, and history that the code already answers is the first thing to go. (Changed in the 20% pass: this step used to read *"orbs persist even after settlement"*, and the four settled orbs were deleted under beef's *"cut cut cut / aggro / less is more"* — the rule is updated to match what was done rather than leaving canon contradicting disk.) An orb still under live evaluation is never cut.

## Distinction from quest, compact, zettelkasten

| Artifact | When | Who edits | Lives |
|----------|------|-----------|-------|
| **orb** | live co-design, multiple approaches under evaluation | beef + Claude both | `.ikiro/orbs/` (named) or `/private/logs/` (session) |
| **quest** | settled feature, persistent design surface, phased | Claude maintains, beef directs | `.ikiro/quests/` |
| **compact** | closed session arc, retrospective | Claude writes once | `.ikiro/compacts/` |
| **zettelkasten** | pre-quest scratchpad, callouts, discovered facts | Claude maintains | `.ikiro/zettelkasten.md` |

Orb = present tense (live). Quest = imperative (the plan). Compact = past tense (the record). Zettelkasten = reference (the index of learnings).

## Invocation patterns

When beef says:
- "orb on <topic>" / "ikiro orb <topic>" → open or extend the named orb
- "open the <topic> orb" → read+edit `.ikiro/orbs/<topic>.orb.org` if it exists, else open it fresh
- annotates a header in `/private/logs/<date>.org` with `* <topic>` then talks at me → that header is the session orb; absorb its directives

## Discipline

- **Never delete** orb contents unilaterally (orb is coinhabited; both parties own it).
- **Absorb `@beef` annotations first** before any code edit in the surrounding vicinity. They are directives, not commentary.
- **Approaches are not equivalents** — PRAISED BASELINE is privileged; APPROACH letters are pressure-tests.
- **Don't fold orb → quest unilaterally.** Wait for beef's "lock that in" or equivalent before promoting the chosen approach to a quest section.
- **Compact a session orb** when the day's work yields a settled change: extract the substance into the relevant quest's Changelog + Lessons sections. Don't make a date-specific compact file (`feedback_compact_no_inline_dates`).
