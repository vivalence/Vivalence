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
- Check each hunk on the tree: landed, only in the quest, or drifted. A hunk built for the walk is in its quest before stop 1.

- Rate every name the walk touches against the familiarity map. A stop of names at 4 and up is one line in the closing table.
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
- A fence is the code as it will stand in his file, copied from what ran. A probe's own code, config or stand-in path never reaches his screen: what it measured is told as plain result lines.
- A chain is one fence in call order, root to leaf. Never one fragment per fence.
- The caller is shown whole: who runs it, when, and what hands it its input.
- The snapshot is one real entity, whole, printed that turn. A consequence is one input and what came back, never a phrase.
- A fence stands alone: every name it reads is defined inside it, or named in a `//` line on top (what it is, where it is declared). Whole functions, never a slice of one. No length cap.
- No fork, no lean, no `go?` inside a stop.
- The counter `S3/8` is on every reply of the walk.
- Each name in a stop is shown at its familiarity level. A stop leads with the lowest level it leans on.

## his answer

- `amen` · `ok` · `next` · `yes`: the next stop.
- A change · `no` · `why X`: a drill on that stop (skill `drill-me`). Option A is the stop as shown. Option B is his change as code. Then the same stop again.
- `skip`: the next stop.
- `stop` · `wait`: nothing.

## 3 · finish

An amen'd stop goes into its quest milestone that turn, when a quest is live.

After the last stop: how many amen, how many changed, how many skipped.
