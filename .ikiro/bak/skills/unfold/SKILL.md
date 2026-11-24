---
name: unfold
description: Open a session on the tree as it is now, not as a summary says it was. No edits.
when_to_use: >-
  "unfold" · the first turn of a session · after /compact · after /clear · "where were we" · "pick up" ·
  "continue" · "whats the state" · an ask naming a quest or a milestone
---
<!-- limit: 3200 chars -->
# unfold — a session opens on what is, not on what was written

A handoff, a frontier line and a compaction summary are claims with a date. The tree is the fact.
No edit before step 5 is done. None of this is printed in the reply.

## 1 · measure

The start hook prints the measure. If it did not run, run it:

```sh
sh .ikiro/hooks/unfold.sh
```

It says: the last changes, how many files hold his open work, who serves `:2501` and `:1794`, how many watchers run, which other sessions are live.

- A file with his open work is his. I do not touch it unasked.
- A save under a watcher restarts his runtime.
- Another live session owns its quest. I read a shared file again before I write it.
- Inside `~/.viva/registry/<pkg>` a plain `git status` restarts his runtime. Read like this:

```sh
git --no-optional-locks -C <pkg> status --short
jj log --ignore-working-copy
```

## 2 · find the edge

Find the ask's line in `.ikiro/quests/frontier.md`. Read only what that quest says is next, what was ruled out, and what he locked that the tree does not hold yet; the state I report names that gap first. No line: say the ask is new.

A state a summary names (a port down, a red test, something owed) is measured again before I act on it.

A new noun in the ask: grep `.ikiro/quests/index.md` for the quest that owns it.

## 3 · load the area

Read one file of the area. Its codemap shard loads with it.

```sh
grep -n '<noun>' .ikiro/known-issues.org
grep -rn "export " <subsystem>/<dir>/
```

More than three files to trace: an Explore agent returns `path:line` and one sentence each.

## 4 · check it is alive

```sh
viva --help; echo $?
curl -s -o /dev/null -w '%{http_code}' localhost:2501/beacon/status
```

A broken tree is fixed or named first.

## 5 · take the baseline

Run the area's test file once, before the first edit. Name each red. Check each red against `known-issues.org`.

## 6 · start

One item, verified, before the next.

"where are we" on a quest: its milestones, one line each, with their state. A milestone called landed is checked on the tree.

## when it is short

A one word ask on a resumed session: steps 1 and 2. A question: steps 1 to 3.
