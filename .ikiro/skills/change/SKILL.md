---
name: change
description: Guard a code edit. Check before, bracket the edit with tests and a consumer grep, give a verdict that can fail.
when_to_use: >-
  `go` on my proposal · the first edit of product source in a session · "add X to <subsystem>" · "wire up" ·
  "blast X" · "change this everywhere" · "is it safe to touch" · "run the tests" · "tests green?" ·
  "critical pass" · "another pass" · "argue against it"
---
<!-- limit: 3800 chars -->
# change — guard a code edit

## before

- Grep the surface before using it: `grep -rn "export " <subsystem>/<dir>/`. An export I add is followed up every `export *` above its file, and where it surfaces is said with the hunk.
- Grep a name before typing it, coined or worn: the repo, `~/.viva/registry`, `.ikiro/quests/`. A clash or a pending rename is asked.
- Check `.ikiro/known-issues.org` and the quest's `* open` for the mechanism I lean on.
- A recorded defect or a ruled rename in a file I touch lands with the touch.
- A tree without version control is copied to `~/.viva/bak/<scope>/<name>-<date>/` before the write.
- A migration of his stored data is shown as a dry run first: the tally, and one entity before and after.

## around: blast, test, change, test, blast

Skip it for a leaf with one caller, a doc, a test helper.

1. Blast. Find every consumer, tests too, and read every hit. The grep is the bare word in every spelling.

```sh
grep -rnI "<symbol>" systems/ subsystems/ commons/ testament/ documentation/ \
  ~/.viva/instances ~/.viva/registry --exclude-dir={node_modules,bak}
```

2. Test. The whole suite of each touched directory and of each consumer, before the first edit.
3. Change. Nothing else in the pass. When a watcher runs, every save is a deploy: build in a copy of the whole tree, run its suites there, land all files green in one pass. A fix found after goes through the copy again.
4. Test. Green. A new red is mine.
5. Blast again. The radius equals step 1.

Typology core: ask first. A suspected bug: first a test that shows it, then the patch.

## after

- Paste the test result line from the tool, beside the baseline.
- A red that was there before is checked against `known-issues.org`. No entry: find the cause and file it.
- A land that touches core ends with the census, before the report; its suites run one after another:

```sh
sh .ikiro/methods/census-suites.sh
```

- `SNAPSHOT_HOT=1` regenerates snapshots. It verifies nothing.
- A new green test must fail once: break the code and see it red.
- Code that only runs when served is mounted or walked (skill `debug`).

## critical pass: argue against it on a copy

1. Copy the tree as it was before the edit, without `.git`, `.jj`, `.env*`. Keep a pristine twin.
2. Run the baseline on both.
3. Read the consumer of every new seam.
4. Compare with one live sibling.
5. Fix in the copy and show the diff. Never apply it to the tree by hand.
