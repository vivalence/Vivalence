---
name: show-me
description: >-
  Walk beef through a quest as a REVIEW: I curate the key segments as code, show one step per turn with
  `S<k>/N`, he answers `amen` or a change; a change opens drill-me on that step; every verdict lands in `* review`.
when_to_use: >-
  "/show-me" · "show me <quest>" · "show me m102" · "walk me through it" · "review the quest with me" · "what did
  we change" · "take me through the changes" · before a quest flips DONE · after a tangle lands, before `go` on the next.
---
<!-- limit: 5000 chars -->
# show-me — the quest as a guided tour; he rules each stop

**A review is a sequence of stops; each stop is code.** he rules one per turn: `amen` or a change → a drill on that stop. REJECTED: a dump · a summary · all stops at once.

## phase 1 · the tour — MINE, never the reply

1. **read the quest whole** — `* rulings` · `* as code` · `* the law` · `* milestones` · `* changelog`.
2. **measure the tree** — each hunk: `python3 .ikiro/methods/landed.py --quest <name>`, else grep its NEW text. Tag
   `LANDED` (tree `file:line`) · `QUEST` (`m102-repl.org:LINE`) · `DRIFTED` (both, tree first).
3. **cut the stops** — one per load-bearing ruling, 5–12 (a catalog: ONE map, item · caller · source; REJECTED 10-27 cards /"too complicated"/); mechanical hunks fold into ONE closing table. FLOW order: entity → contract → datamap → remote → UI; boot before dispatch. A stop IS code; prose ≤1 line (REJECTED 10-24 /"Code, code, code"/).
4. **the ledger** — `* review` in the quest, before `* handoff`: one row per stop, verdict `—` now.

```org
* review — 10-24
| S | stop | rides | verdict | his words |
|---|---|---|---|---|
| 1 | the Repl holds every command | Q1 · Q6′ | amen | /"amen"/ |
| 2 | dispatch has one entry | Q2 | drilled → Q18 | /"it lives on the client"/ |
```

## phase 2 · the walk — one stop per turn

First reply: the tour, a line per stop, then S1; then one stop per reply.

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

Laws of a stop:
- **six sections, this order — explanation · diff · code · tests · usage · snapshot** (10-24). Prose: explanation ONLY. A snapshot is the stop's ENTITIES, each `JSON.stringify`'d WHOLE — signal in · object out · every entity minted — a fence each
 . A probe prints it (a QUEST hunk: on a scratchpad copy); never typed, trimmed or a composite (REJECTED 10-24 a hybrid); a contrast is TWO fences, before then after.
- **airy** — a hunk a fence, ≤15 lines
- **usage is the chain, never a bare call** — the caller's WHOLE unit (its vector · beat · command with its `nature`), who runs that caller and when, where the result lands; `.use(x)` alone is slim (REJECTED 10-25 /"I don't know the context. I don't know what there is around that."/).
- **verbatim** — a fence copies its source; `…` marks a cut, never a paraphrase. `diff` for standing code, plain
  when new; every fence opens `// <container-rooted path>:<line>`.
- **the counter is a contract** — `S<k>/N` every reply, a stop's name like Q<n> · m<n>; N moves only when a drill adds or kills a stop, said in the header.
- **words are the quest's** — locked nouns only; a killed name (`verb` · `line` · `row`) only on a `-` line; in a live quote, cut `…`.
- **no lean, no fork, no `go?`**.

## his answer

| he says | I do |
|---|---|
| `amen` `ok` `next` `yes` `go` | row → `amen`; next. A probed TEST fix: amen = apply, rerun (REJECTED 10-26 /"are they fixed??"/) |
| a change · `no` · `why X` · `I don't like` | row → `drilling`; skill `drill-me`, phase 2 |
| `skip` | row → `skipped`; next stop |
| `back` · `S<k>` | re-show k |
| `stop` · `wait` | zero actions |

**a change is a drill** — skill `drill-me`, scoped: Q0 is HIS change in one sentence, Option A = the stop's code as
shown, Option B = his change as code. Its locks land in `* rulings` + `* as code`, numbered after the last Q. Drill done → row `drilled → Q<n>`, re-show the SAME stop with the new hunk, `S<k>/N` unchanged; his
`amen` there closes it. A lock edits the QUEST only — product code waits for his `go`; its changed TESTS land as
sandbox-probed hunks before the re-show, every fence AFTER (REJECTED 10-24 /"why is there still vivalence here"/).

## phase 3 · the finish

Last stop ruled → `N stops · A amen · D drilled (Q<n>…) · S skipped`, matching `* review`. The walk ENDS: no `go`, no next milestone.
