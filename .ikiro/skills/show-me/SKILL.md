---
name: show-me
description: >-
  Walk beef through a CHANGE SET as a REVIEW — a quest, a `jj diff`, a drill's locks, or a design — curated code stops,
  one per turn as `S<k>/N`; he answers `amen` or a change (drill-me on that stop); verdicts in-reply, `* review` when a quest is live.
when_to_use: >-
  "/show-me" · "show me <quest|change|design>" (m102) · "walk me through it" · "review the quest with me" · "what did
  we change" · "take me through the changes" · before a quest flips DONE · after a tangle lands.
---
<!-- limit: 5000 chars -->
# show-me — a change set as a guided tour

**A review is stops; each stop is code, ruled one per turn.** Subject = what he names: a quest · `jj diff -r @` · a drill's locks · a report's approach. REJECTED: a dump · all stops at once.

## phase 1 · the tour — MINE, never the reply

1. **read the subject whole** — quest: `* rulings` · `* as code` · `* the law` · `* milestones` · `* changelog`; diff: `jj diff -r <change>`; drill: its `Locked` table.
2. **measure the tree** — each hunk: `python3 .ikiro/methods/landed.py --quest <name>`, else grep its NEW text. Tag
   `LANDED` (tree `file:line`) · `QUEST` (`m102-repl.org:LINE`) · `DRIFTED` (both, tree first) — its OWN stop; his `no` reverts it to
   the ruled placement.
3. **cut the stops** — one per load-bearing ruling, 5–12 (a catalog: ONE map, item · caller · source; REJECTED 10-27 cards); mechanical hunks fold into ONE closing table. FLOW order: entity → contract → datamap → remote → UI; boot before dispatch. A stop IS code; prose ≤1 line.
4. **the ledger** — a row per stop, verdict `—`, re-printed each reply; `* review` before `* handoff` when a quest is live.

```org
* review — 10-24
| S | stop | rides | verdict | his words |
|---|---|---|---|---|
| 1 | the Repl holds every command | Q1 · Q6′ | amen | /"amen"/ |
| 2 | dispatch has one entry | Q2 | drilled → Q18 | /"it lives on the client"/ |
```

## phase 2 · the walk — one stop per turn

First reply: the tour (a line per stop), then S1.

````
**S3/8 — the boot grafts every command once** · Q3 · Q6′ · LANDED

**explanation**
<one paragraph, plain English>

**diff**
```diff
// systems/ghost/subjects/client/lifecycle/index.js:38
-  clientDie.repl.graft(commands.help, commands.quit);
```

**code**
```js
// systems/ghost/entities/terminal/lifecycle/index.js:40
…the result after, verbatim…
```

**tests**
```js
// systems/ghost/tests/…:LINE
…the expects, AFTER…
```

**usage**
```js
// systems/ghost/…:LINE   — the CALLER whole: its unit, who runs it, where the result lands
…
```

**snapshot**
```json
// probe: <scratchpad path> · JSON.stringify(signal, null, 2)
…one real entity, whole, as printed…
```

amen, or what changes?
````

Laws of a stop —
- **six sections, this order — explanation · diff · code · tests · usage · snapshot** (10-24); prose in explanation ONLY; **airy**: a hunk a fence, ≤15 lines. A snapshot: the stop's ENTITIES (signal in ·
  object out · each minted), `JSON.stringify`'d WHOLE, a fence each, probe-printed (unlanded hunk: a scratchpad copy), never
  typed, trimmed or composite; a contrast is TWO fences, before · after.
- **usage is the chain, never a bare call** — the caller's WHOLE unit (its vector · beat · command with its `nature`), who runs it and when, where the result lands; `.use(x)` alone is slim.
- **verbatim** — a fence copies its source, `…` a cut, never a paraphrase; `diff` for standing code, plain when new; each opens `// <path>:<line>`.
- **the counter is a contract** — `S<k>/N` every reply; N moves only on a drill adding or killing a stop.
- **words are the locked ones** — a killed name (`verb` · `line` · `row`) only on a `-` line; in a live quote, cut `…` — his screen too (word-guard 11-06 `<door>/count`).
- **no lean, no fork, no `go?`**. A hunk BREAKING on the probe is a MISWIRE under its lock (codestyle): the stop shows the trace + the fix, never `A as shown · B revert` (REJECTED 11-06 S2 Q2′ /"wasn't this already decided?"/).

## his answer

| he says | I do |
|---|---|
| `amen` `ok` `next` `yes` `go` | row → `amen`; next. A probed TEST fix: amen = apply, rerun |
| a change · `no` · `why X` | row → `drilling`; the drill below |
| `skip` · `S<k>` · `stop`/`wait` | row → `skipped`, next · re-show k · zero actions |
| `collect my notes` · `dont react` | marks land verbatim in `** notes`, none acted on till released (10-15) |

**a change is a drill** — skill `drill-me`, scoped: Q0 = HIS change; A = the stop as shown; B = his change as code. Locks land in the reply (`* rulings` + `* as code` when a quest is live), numbered after the last Q. Done → row `drilled → Q<n>`, re-show
the SAME stop, `S<k>/N` unchanged; his `amen` closes it. A lock is a ledger row, code waits for `go`; changed TESTS land as
sandbox-probed hunks before the re-show, every fence AFTER (REJECTED 10-24).

## phase 3 · finish

Last stop ruled → `N stops · A amen · D drilled (Q<n>…) · S skipped`, matching the ledger. The walk ENDS: no `go`, no next milestone.
