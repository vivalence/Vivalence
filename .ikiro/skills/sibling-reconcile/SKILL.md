---
name: sibling-reconcile
description: >-
  Another session is editing this tree right now — read the quest report's sessions column first, stamp every
  grep with its time, re-read any file before pasting over it, take the shortest clause on a shared budgeted
  file, and treat concurrent edits as canonical. Use before writing a quest, the frontier, MEMORY.md or a
  shard, and before claiming a path is dead or absent.
when_to_use: >-
  the quest report shows `(N live)` · a file changed between your read and your write · the running app looks a
  version behind · "wait, that was already fixed" · at every fold · before `Write` on frontier.md, MEMORY.md,
  quests/index.md or a codemap shard · a `rm -rf` near a live watcher.
---

# sibling-reconcile — the tree is hot; read the sessions column first

Canon: `methods/compact.md` step 8 (*"Read the `sessions` column before claiming anything about the tree"*) · `methods/quest-report.py --help` · `feedback_user_edits_are_canonical` · Scoreboard `derived-canon-drift`. Measured: 18+ compacts where a sibling moved the ground mid-fold — the quest root went 18 → 4 while a fold ran; a file was rewritten 45 seconds before it was read; the m67 quest showed `3 (3 live)` today.

## Before writing anything shared — one todo each

1. **who is live** — `CLAUDE_SESSION_ID=<me> python3 .ikiro/methods/quest-report.py --format md` → the `sessions` column. `(N live)` on a quest means its header, its terrain and any hour-old grep about its files can already be false.
2. **stamp the reading** — every grep/count in a compact or quest carries when it was taken; *"any grep older than that stamp is a claim about a tree that has since changed."* Cite working-tree lines and SAY so; ±3 tolerance is meaningless mid-edit.
3. **re-read before paste** — `Write` on a file you read minutes ago overwrites a sibling's edit. *"Owner flipped, README changed three times, the quest index grew — all under me, all kept, all built on."* Concurrent edits are canonical.
4. **shortest clause on a contended line** — `world/frontier.md`, `MEMORY.md`, `quests/index.md` are budgeted AND shared; two sessions writing one budgeted file breach it again. Never trim a sibling's clause to make room ([[budget-eviction]]).
5. **check the sibling's rulings** — a quest written AGAINST the code you are landing may already hold beef's ruling against it (m57 vs the environment band). Read it before shipping on the wrong side.
6. **never re-derive a landed fix** — *"two of the three faults I handed beef were already dead… an analysis that had no reader."* A console paste is a snapshot of a moment, not of the tree.
7. **the shelf** — a sibling wrote the repo seven minutes earlier and never synced `~/.viva/instances/<slug>/`; the runtime bundles the shelf ([[shelf-sync]]).
8. **destructive ops near a live watcher** — a sibling's `rm -rf .astro` killed beef's docs watch for 27 minutes; a schema-affecting rename under `--watch` is a DEPLOYMENT: `ps aux | grep deno` first ([[capture-before-delete]]).
9. **do not move a quest a sibling holds** — `quest-lifecycle`: a live sibling in the sessions column = not yours to sunset.

## At the fold

The compact records `* live siblings at fold` with ids and ages; the quest report is stamped from THIS session (`--stamp` races a sibling's sweep — re-run after theirs). A sibling's mid-fold rewrite of a row is theirs: left alone, cited.
