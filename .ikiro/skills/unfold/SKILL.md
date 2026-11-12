---
name: unfold
description: >-
  Open a session on the tree as it IS: measure the census (tree · his wip · live ports · watchers), read the
  ONE edge the ask touches, load the area by touching it, take a baseline that can fail, report six facts,
  then start. Zero edits. The cata of `fold`: fold writes the handoff, unfold reads it and re-measures it.
when_to_use: >-
  "unfold" · the first turn of any session · after /compact · after /clear · a session resumed from a summary ·
  "where were we" · "pick up" · "continue" · "whats the state" · an ask naming a quest or a milestone · before the
  first Edit or Write of a session · a summary claims a state (a port down · a red · an owed) you are about to
  act on · a sibling session is live on this tree.
---
<!-- limit: 4200 chars · research: reference/harnesses/2026-11-16-priming.md · hook: hooks/unfold.sh -->
# unfold — the session opens on what IS, never on what was written

`fold` ⟷ `unfold`. A handoff, a frontier entry, a compaction summary is a CLAIM with a date; the tree is the fact. Six beats, ~10 tool calls, no edit before beat 6. Budget: identifiers (`path:n`), never dumps; nothing "in case".

## 1 · census — measured, the hook's job

`hooks/unfold.sh` prints it at SessionStart (wired: it is already in context; unwired: run it by path). Never from recall, never from the summary.

```sh
# .ikiro/hooks/unfold.sh
jj log --ignore-working-copy -n 5 --no-graph        # the tree: change ids
jj diff --ignore-working-copy --stat | tail -1      # HIS wip — a file in it is mid-edit, his
lsof -nP -iTCP:2501 -sTCP:LISTEN                    # who serves; a watcher's save IS a deploy
ps -axo command | grep -- '[-]-watch'
```

His wip decides the session: a path in `jj diff --stat` is his until he says otherwise (`kill-guard`), and a red there is his WIP, not my regression.

## 2 · edge — ONE entry, not the frontier

Match the ask to its `quests/frontier.md` entry, then read ONLY that quest's `* handoff` (`goal · done · next · never · owed`). `never` first: a fresh context re-proposes it. No entry → its nearest slug by SOUND (he dictates), else new; say so. A compaction summary: each state it names (a port · a red · an `owed`) is re-measured before it is acted on (11-16 stale "404").

## 3 · area — load by touching, not by reading about

The path-gated shard loads when a file under its `paths:` is read: `Read` ONE file of the area, the shard arrives. Then:

```sh
grep -n '<the ask noun>' .ikiro/known-issues.org | head      # a recorded defect lands WITH the touch
grep -rn "export " <subsystem>/<dir>/ | head -40             # the surface, grepped, never remembered
```

A trait WORD = its quest ruling (grepped in quests), never its name. More than three files to trace → an `Explore` agent returns `path:n` + one sentence each; its dumps never enter this context.

## 4 · alive — a smoke before new work

```sh
viva --help; echo $?                                         # 0, or nothing below counts
curl -s -o /dev/null -w '%{http_code}' localhost:2501/beacon/status
```

A broken tree is fixed or NAMED first: a red base hides new reds.

## 5 · baseline — the area's suite, once, before edit one

One file, one-shot, from the root (`map.md`). Paste the envelope; reds BY NAME, each `grep`ped in `known-issues.org`.

## 6 · report — six facts, then the ask

```
tree      <change id> · his wip <n> files · mine: none
live      :2501 <pid|down> · :1794 <pid|down> · watchers <n>
edge      <quest> — next: <its next> | new
never     <the quest's never, verbatim> | —
reds      <suite>: <names> | green <envelope>
first     <the ONE act this turn opens with>
```

Six entries, no prose. Then the ask: ONE item, verified, before the next.

## when it is short

A one-word ask (`go` · `stop` · `yes`) on a resumed session: beats 1 · 2 only, two entries. A question (`study X` · `what is`) : beats 1 · 3. Never zero: the census is free.

## never

- a state repeated from a summary without its re-measure.
- the whole frontier, a whole quest, a whole shard "to get oriented" (context files do not move correctness; the dumb zone starts near half a window).
- an edit under a watcher before beat 1 named the watcher.
