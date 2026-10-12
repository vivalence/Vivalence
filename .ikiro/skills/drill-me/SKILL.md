---
name: drill-me
description: >-
  Run a design interview whose product is CODE SNIPPETS: research, two approaches as code, one locked ruling per
  turn, every lock a hunk; the hunks are the quest.
when_to_use: >-
  "/drill-me" · "drill me" · "help me think" · "I have no image of what this looks like" · "big architectural
  design space open here" · "research the design space … ask me a dozen questions" · "go one by one" · "defuddle me" · a new entity or relation is being born · beef thinks aloud for a page and ends on
  "fuck. shit." · a sketch I would otherwise answer with code.
---
<!-- limit: 6000 chars -->
# drill-me — the goal is SNIPPETS; snippets go to the quest

**The drill exists to capture code snippets.** A question is two snippets; a lock picks one; the picked
snippet lands under `* as code` the same turn; the quest IS those snippets in `ls` order (/"mark my resolutions as
CODE. always"/ · /"full of code, not full of yap"/ 10-21). Prose that produces no snippet is yap. REJECTED: rulings without hunks · a quest written from memory.

```org
* as code
*** systems/runtime
**** entities/Artifact.ts
#+BEGIN_SRC js
// systems/runtime/entities/Artifact.ts:1   ← Locked Q3: /"four artifacts, one per mime"/
…the snippet he picked, verbatim from the option…
#+END_SRC
```

## phase 1 · research — before a word of design

1. **terrain, measured** — the chain as it IS, `file:line` per row, a table; every noun he used grepped for collisions.
2. **precedent** — one table, one row per system; name which holds the thing he is unsure about.
3. **two approaches as CODE** — A and B, each an entity or a schematic plus the call sites, five lines each, one cost line under each; the first snippets.
4. **the question list** — a dozen, numbered, one sentence each — then the SAME turn asks Q0 in full. Q0 is the NAME whenever the thing is new (/"question zero is what we call this"/); re-derived after every lock.

## phase 2 · the interview — one question, two snippets, per turn

```
Locked Qn: **the ruling in one line.**  + its hunks, `// path:line`, IN THE REPLY (one tree per system, in sequence) and appended to `* as code` THIS turn — a landing note is not a reply

**Qm — the question in one sentence.**
<context: 1–3 plain sentences, what exists today with file:line>

Option A. <one sentence what it means>
```js … 3–8 lines, the REAL cardinality, every helper defined in the fence …```
Option B. <one sentence>
```js … 3–8 lines …```

Lean **X**: <one reason>.   ← /"start to include your lean in the question"/
A or B?
```

Laws of a question:
- **both options are real**
- **consistent with every lock** — before each question `grep -rn '<its noun>' .ikiro/quests` (done · discarded too), hits pasted, codestyle too (REJECTED 10-21 /"There is no rendering on the client"/); a ruled noun is a LOOKUP (REJECTED 10-21 /"q4 also was already answered"/); a fork names the lock it sits UNDER (REJECTED 10-21 Q9: ruling 16 already said one verb set).
- **plain sentences, compression OFF**; the two THINGS first (what each is, which HOST runs it, where it lives today), a domain word expanded at first use, the options after (REJECTED 10-21 ×3). The thing that EXECUTES is named by its owner at run time, not where it is built (REJECTED 10-21 /"you have your model wrong"/ — a press hits the TERMINAL's keymap; the client's is built once).
- **an option says what he would SEE** — the screen or the call, at the REAL cardinality (/"should be four artifacts"/); `build(…)` undefined in a fence ✗.
- **a snippet obeys codestyle; an entity copies `systems/runtime/entities/Buffer.ts`**; a hunk's HOME is the module that writes that field TODAY, grepped (REJECTED 10-21 registry minting a mountpoint — the instance does). Precedent is per QUESTION when the thing has one (10-21 /"How do other REPLs work?"/ came after the lock).
- **a lock is HIS act, ONE SNIPPET per commit** — an answer to the A/B, `amen`, `keep X`, `lock` commits THAT snippet only; `I suggest` · `show me` · `design this` · a reframe is design: his words go to `* open`, a hunk stays `SKETCH` (10-21 /"don't assume"/ · /"I have not greenlit any Q5 code"/). An unlock relabels, never reverts. REJECTED 10-20 /"I just am still designing"/.
- **no carried words** — a noun I coin (seat · face · `register`) is struck once he names it; a noun the tree lacks is its path (/"call things by their name"/). The tree's `row` is still `row` ✗ → `terminal` (REJECTED 10-21 /"wtf is row"/); a designer's part name is a bare noun: ascii the screen, then his name (`Panel` → `Chord`).
- **neither is an answer** — his reframe beats both; a LOOKUP before the next question. A lean that hides a third option ✗.
- **Q0 ends only on HIS lock** — a reframe re-asks Q0 with his word in both options, never Q1 (REJECTED 10-21 /"q0 not answered yet"/); a coined noun (`berth`) ✗.
- **"show me X"** — X as HE framed it, in CODE: one tree per system, no table, no prose, no lean. A holes pass names only what changes shape.

## phase 3 · when he is confused — /"defuddle me"/ · /"I'm confused"/ · a question he already answered, repeated

1. **two nouns in one hand** — a table: the two concepts × (is · owned by · carries · changes); the conflation IS the knot.
2. **N laws, numbered, one line each** — /"relation = provenance · mime = kind"/.
3. **redraw bigger** — every entity hunk, the flows as one block; code.

## the ledger — against compaction

Every lock, the same turn: one row (his words verbatim) + its hunk under `* as code`; no REJECTED trail in a row; the struck option moves whole to `reference/<quest>/`.

## phase 4 · the finish

Interview complete → skill `quest`: `* as code` `ls`-wise, rulings VERBATIM beside their hunks, law, milestones as nouns, blast, QA, deferred, release; index + frontier. The drill ENDS there: no `go`, no next milestone (REJECTED 10-19).

REJECTED: a dozen questions in one turn · a lock longer than a line · a lock without its hunk · an option without code.
