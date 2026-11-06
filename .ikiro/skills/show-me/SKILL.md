---
name: show-me
description: >-
  Walk beef through a CHANGE SET as a REVIEW — a quest, a `jj diff`, a drill's locks, or a design — curated code stops,
  one per turn as `S<k>/N`; he answers `amen` or a change (drill-me on that stop); verdicts in-reply, `* review` when a quest is live.
when_to_use: >-
  "/show-me" · "show me <quest|change|design>" · "walk me through it" · "review the quest with me" · "what did
  we change" · "take me through the changes" · before a quest flips DONE · after a tangle lands.
---
<!-- limit: 5000 chars -->
# show-me — a change set as a guided tour

**A review is stops; each stop is code, ruled one per turn.** REJECTED: a dump.

## phase 1 · the tour — MINE, never the reply

1. **read the subject whole** — quest: `* rulings` · `* as code` · `* the law` · `* milestones` · `* changelog`; diff: `jj diff -r <change>`; drill: its `Locked` table.
2. **measure the tree** — each hunk: `python3 .ikiro/methods/landed.py --quest <name>`, else grep its NEW text. Tag
   `LANDED` (tree `file:line`) · `QUEST` (`m102-repl.org:LINE`) · `DRIFTED` (both, tree first) — its OWN stop; his `no` reverts it.
3. **cut the stops** — one per load-bearing ruling, 5–12 (a catalog: ONE map; REJECTED 10-27 cards); mechanical hunks AND tests fold into ONE closing table — tests are mine, never a stop (11-09 /"dont care about tests. you test"/). FLOW order: entity → contract → datamap → remote → UI; boot before dispatch.
4. **the ledger** — a row per stop, verdict `—`, re-printed each reply; `* review` before `* handoff` when a quest is live.

```org
* review — 10-24
| S | stop | rides | verdict | his words |
|---|---|---|---|---|
| 1 | the Repl holds every command | Q1 · Q6′ | amen | /"amen"/ |
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
<the chain, one prose row ABOVE the fence>
```js
// systems/ghost/…:LINE
…the CALLER whole: its unit…
```

**snapshot**
```json
// probe: <scratchpad path> · JSON.stringify(signal, null, 2)
…one real entity, whole, as printed…
```

amen, or what changes?
````

Laws of a stop —
- **six sections, this order — explanation · diff · code · tests · usage · snapshot**; prose in explanation ONLY; **airy**: a hunk a fence, ≤15 lines. A snapshot: the stop's ENTITIES (signal in ·
  object out · each minted), `JSON.stringify(x, null, 2)` of the WHOLE object, a fence each, probe-printed (unlanded hunk: a scratchpad copy), never
  typed · trimmed · composite · processed (REJECTED 11-09); a contrast is TWO fences; two forms = ONE example, both ways.
- **usage is the chain, never a bare call** — the caller's WHOLE unit (its vector · beat · command with its `nature`), who runs it and when, where the result lands; `.use(x)` alone is slim. The path row is bare; prose ABOVE the fence, never a comment inside it (word-guard 11-09).
- **verbatim** — a fence copies its source, `…` a cut, never a paraphrase; `diff` for standing code, plain when new; each opens `// <path>:<line>`.
- **the counter is a contract** — `S<k>/N` every reply; N moves only on a drill. `S<k>` · my labels DIE with the walk; after: act + path (REJECTED 11-11 `the SERVICE cut`: /"whats the service cut>"/).
- **words are the locked ones** — a killed name only on a `-` row; in a live quote, cut `…` (word-guard 11-06).
- **no lean, no fork, no `go?`**. A hunk BREAKING on the probe is a MISWIRE under its lock: the stop shows the trace + the fix.
- **a NEW thing is named before it is coded** — what it IS, who reads it, what it PRINTS (probe output), then the fence (11-09 /"i dont understand. what are we exporting as primer?"/).

## his answer

| he says | I do |
|---|---|
| `amen` `ok` `next` `yes` `go` | row → `amen`; next |
| a change · `no` · `why X` | row → `drilling`; the drill below |
| `skip` · `S<k>` · `stop`/`wait` | row → `skipped`, next · re-show k · zero actions |
| `collect my notes` · `dont react` | marks land in `** notes`, acted on when released |

**a change is a drill** — skill `drill-me`, scoped: Q0 = HIS change; A = the stop as shown; B = his change as code. Locks land in the reply (`* rulings` + `* as code` when a quest is live), numbered after the last Q. Done → row `drilled → Q<n>`, re-show
the SAME stop, `S<k>/N` unchanged; his `amen` closes it. A lock is a ledger row, code waits for `go`; changed TESTS land as
sandbox-probed hunks before the re-show, every fence AFTER.

## phase 3 · finish

Last stop ruled → `N stops · A amen · D drilled (Q<n>…) · S skipped`, matching the ledger. The walk ENDS: no `go`, no next milestone.
