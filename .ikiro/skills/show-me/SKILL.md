---
name: show-me
description: Walk him through a change set as a review. One stop of code per turn. He answers amen or a change.
when_to_use: >-
  "/show-me" · "show me <quest|change|design>" · "walk me through it" · "what did we change" ·
  "take me through the changes" · before a quest is done
---
<!-- limit: 3200 chars -->
# show-me — a change set, walked one stop per turn

## 1 · prepare

- Read the subject whole: the quest, the diff (`jj diff -r <change>`), or the drill's locks.
- Check each hunk on the tree: landed, only in the quest, or drifted.

- Cut the stops. One concern per stop, 5 to 12 stops, in flow order: entity, contract, datamap, remote, UI.
- Mechanical hunks and tests go into one closing table. They are not stops.
- An open fork is asked before its stop, never inside it.

## 2 · the walk

````md
**S3/8 — the boot grafts every command once**

One paragraph, plain English.

```diff
// systems/ghost/subjects/client/lifecycle/index.js:38
-  clientDie.repl.graft(commands.help, commands.quit);
```

```js
// systems/ghost/entities/terminal/lifecycle/index.js:40
the code after
```

```js
// the caller, whole
```

```json
// one real entity, whole
```

S3/8: amen, or what changes?
````

A stop:

- It is code. One paragraph of prose, no more.
- Every fence names a repo path that exists, or a new file declared in this stop.
- A fence is a copy of its source. Never typed from memory.
- Siblings or a chain are stacked fences, one per step, numbered from root to leaf.
- The caller is shown whole: who runs it, when, and what hands it its input.
- The snapshot is one real entity, whole, as printed.
- A fence is 15 lines at most.
- No fork, no lean, no `go?` inside a stop.
- The counter `S3/8` is on every reply of the walk.
- What he already knows is not explained.

## his answer

- `amen` · `ok` · `next` · `yes`: the next stop.
- A change · `no` · `why X`: a drill on that stop (skill `drill-me`). Option A is the stop as shown. Option B is his change as code. Then the same stop again.
- `skip`: the next stop.
- `stop` · `wait`: nothing.

## 3 · finish

An amen'd stop goes into its quest milestone that turn, when a quest is live.

After the last stop: how many amen, how many changed, how many skipped.
