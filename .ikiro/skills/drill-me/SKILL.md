---
name: drill-me
description: >-
  Run a design interview whose product is CODE SNIPPETS: research, two approaches as code, one locked ruling per
  turn, every lock a hunk; the hunks are the quest.
when_to_use: >-
  "/drill-me" · "drill me" · "help me think" · "I have no image of what this looks like" · "big architectural
  design space open here" · "research the design space" · "defuddle me" · a new entity or relation is born · beef thinks aloud for a page and ends on
  "fuck. shit." · a sketch I would otherwise answer with code.
---
<!-- limit: 6000 chars -->
# drill-me — the goal is SNIPPETS; snippets go to the quest

**The drill exists to capture code snippets.** A question is two snippets; a lock picks one; the quest IS
the picked snippets in `ls` order (/"full of code, not full of yap"/). REJECTED: rulings without hunks · a quest from memory.

## phase 1 · research — MINE, never the reply

1. **terrain, measured** — the chain as it IS, `file:line`; every noun he used grepped.
2. **precedent** — one row per system holding what he is unsure of. A design he handed is read WHOLE here, before Q0 (REJECTED 10-27 /"this holds info about how cells work"/).
3. **two approaches as CODE** — A and B: an entity or schematic plus call sites.
4. **the question list** — numbered, kept; the reply asks Q0 alone — the NAME when the thing is new (/"question zero is what we call this"/).

## phase 2 · the interview — one question, two snippets, per turn

```
Locked Qn: **the ruling in one line.**  + its hunks, `// path:line`, IN THE REPLY and in `* as code` THIS turn, never a landing note

**Qm — the question in one sentence.**
<context: 1–3 plain sentences, what exists today with file:line>

Option A. <one sentence what it means>
```js … 3–8 lines, REAL cardinality, helpers defined in the fence …```
Option B. <one sentence>
```js … 3–8 lines …```

Lean **X**: <one reason>.   ← /"start to include your lean in the question"/
A or B?
```

Laws of a question:
- **both options real, each probed** — its own key shows its expression (REJECTED 10-27 /"there is no "same":true"/); two to FOUR, smallest to largest, one decision each (10-28 /"break up the options more"/)
- **consistent with every lock** — `grep -rn '<its noun>' .ikiro/quests` first, each `* the dialogue` too; a ruled noun is a LOOKUP, so is a fork the tree's style answers (/"too obvious. match the style"/) — a HOME or a dir move is a QUESTION; a fork names its lock; a fork an earlier lock decides is a lookup (REJECTED 10-27 /"why would it?"/). An option over an entity reads its `.ts` relations (REJECTED 10-24 /"clients arent per user"/).
- **"how is X processed?"** — the pipeline end to end, ONE block, the fork a step in it.
- **plain sentences, compression OFF**; the two THINGS and every code word first (what · which HOST · when · where today), options after. The EXECUTOR named by its owner (a press hits the TERMINAL's keymap); an act starts where it is clicked, not the buffer it writes (REJECTED 10-27 /"orientation wrong"/). A gap no caller hits says so in sentence ONE; a report's fork is a drill question, never AskUserQuestion (REJECTED m102 /"…the gap"/).
- **an option says what he would SEE** — a WHOLE unit (a command with its `nature`), at the REAL cardinality (REJECTED 10-24 /"a command without giving me any of the context"/). Every hunk opens with its story in English: WHO calls it, WHEN; a "no caller" claim greps `~/.viva/registry` too.
- **a snippet obeys codestyle, LEGIBLE: flat, spaced, no one-off helper name** (REJECTED /"inline, high depth"/); a hunk's HOME is the module that writes that field TODAY, grepped; a choice = `.open` on the live value, env = `paladin.is`; a fence quoting tree code drops its dead words (word-guard ×4).
- **a lock is HIS act, ONE SNIPPET per commit** — an answer to the A/B, `amen`, `keep X`, `lock` commits THAT snippet only; `I suggest` · `show me` · `design this` · a reframe is design: his words go to `* open`, a hunk stays `SKETCH`. An unlock relabels, never reverts.
- **a subject's RUN is its factory's** (mint · dispatch · hand back RUNNING); a consumer receives the running thing as CONTEXT, never re-runs or wraps its vector (REJECTED 10-25 ×3 /"I don't understand the client needs to be executed"/).
- **one noun per thing** — an input (a signal), a position (a status), a record (a track) never share a name; a UI word (`frame`) never names a store (`terminal.$buffer`); a fork on what code does today quotes that code first (REJECTED 10-23 /"Signal isn't state"/ · 10-24 Q6G /"Frame is a UI element"/); a move keeps no other subject's noun (REJECTED 10-26 `/shell`)
- **no carried words** — a noun I coin (`berth` · 10-25 `place`) is struck once he names it; a noun the tree lacks is its path (/"call things by their name"/). `row` ✗ → `terminal` (REJECTED /"wtf is row"/ · `lines` /"Stop inventing words"/); abbreviations written out (`$tele`).
- **neither is an answer** — his reframe beats both; a LOOKUP before the next question; a reframed Q gets the next LETTER, `Q6A · Q6B`, never a prime. A lean hiding a third option ✗; two options on one UNRULED premise ask it first.
- **Q0 ends only on HIS lock** — a reframe re-asks Q0 with his word, never Q1 (REJECTED /"q0 not answered yet"/).
- **"show me X"** — X as HE framed it, in CODE, one tree per system, no lean; a quest → `show-me`.

## phase 3 · when he is confused — /"defuddle me"/ · /"I'm confused"/ · /"I don't understand"/ · an answered question, repeated

1. **two nouns in one hand** — a table: the two concepts × (is · owned by · carries · changes); the conflation IS the knot.
2. **N laws, numbered, one line each** — /"relation = provenance · mime = kind"/.
3. **redraw bigger** — every entity hunk, the flows as one block; code.

## the ledger — against compaction

Every lock, that turn: row + hunk; the struck option → `reference/<quest>/`.

## phase 4 · the finish

Interview complete → skill `quest`'s whole shape, index, frontier. The drill ENDS: no `go`.

