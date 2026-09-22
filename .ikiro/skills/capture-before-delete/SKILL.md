---
name: capture-before-delete
description: >-
  Capture before any purge, strip, rename, drop or rm in a tree that has no version control —
  ~/.viva/instances and half the registry packages — to ~/.viva/bak/<scope>/<slug>-<YYYYMMDD>/, name what you
  kept, and treat a schema-affecting change under --watch as a deployment. Use before deleting or overwriting
  anything under ~/.viva, dropping rows, or any rename mikro will migrate.
when_to_use: >-
  purging a daemon db · stripping a recipe or `.env` · dropping rows · deleting an instance or a registry entry ·
  any rename that mikro will migrate · `rm` anywhere under `~/.viva` · "cleanup" near a ledger tree · a `.bak`
  or `bak/` about to be swept · "remove the <field|trait|export>" in a registry package · migrating a key
  across recipes and `.env` files.
---

# capture-before-delete — the ledger recovers like nothing

Canon: `project_ledger_has_no_vcs` · `project_mikro_sqlite_fk_change_breaks_migration` · `self/lexicon.md` `cleanup` (*"the most expensive word in this lexicon — two incident receipts"*) · Scoreboard `deleted-beef-content` · `ceremony-over-task`. Measured 09-22: `chess · droneaid · education · young-ladys-primer` carry their own `.git`; `assembly · media · stucatch · vcompany` and all of `~/.viva/instances` have NONE. The repo's VCS write-protection reads the wrong way round here — "I can't run git" is not "the tree is protected".

## The receipt

The engram rename swept while `runtime/watch` was live: the italian daemon rebooted mid-refactor, mikro migrated, `drop table Memory` cascaded through Trace's FK, **18 engrams + 62 traces gone**. beef: *"we are in development retard. why are you such a spastic"* — the recovery apparatus then outgrew the data. Two rules from one incident: capture first; price the asset before building a harness to recover it.

## Before the destructive op — one todo each

1. **is it versioned?** `git -C <dir> rev-parse --show-toplevel 2>/dev/null || echo NO-VCS`. Versioned → read-only for me like the repo; unversioned → capture.
2. **is anything running on it?** `ps aux | grep deno` · `viva ledger/doctor` (`locks/`) · `lsof <db>`. A schema-affecting change under `--watch` IS a deployment — stop the watcher or wait.
3. **capture** — `~/.viva/bak/<scope>/<slug>-<YYYYMMDD>/…` (measured on disk: `~/.viva/bak/instances/droneaid-20260922/db-0933/`, `~/.viva/bak/chess.instance.viva.js.0913`). For a db: the db, its migrations, and the `daemon.js` that mounted it. For a recipe strip: the whole file. Say WHAT you kept in the report: *"19 literals, 19 symbol links, 18 uses rows, captured to … first. 69 symbols kept."*
4. **never a scratchpad copy as the only copy** — the scratchpad is session-local and is the thing `cleanup` destroys; a `Reader.svelte.bak` there was once the only 81 lines left.
5. **cut by entry, not by line** — a line-based strip of prettier-formatted `environment` mangled it; restored from the backup, re-cut per entry.
6. **elisions are fatal here** — a quest hunk headed for the repo may say `…`; one headed for `~/.viva/instances` must be complete and reverse-appliable (`feedback_full_patch_means_hunks`).
7. **mikro** — a non-transactional migrator half-applies on an FK change: nuke db + migrations from the backup, never retry the migration (`project_mikro_sqlite_fk_change_breaks_migration`).

## What is never swept

beef's `// …` lines, his `console.log`s, `bak/` directories, `*.bak` files adjacent to in-flight work — recovery surface, his content, even under `cleanup` (*"do the rest+cleanup"* deleted the backup comments he had asked to keep two turns earlier). Delete records of BUILT things; never delete un-built design ([[quest-lifecycle]]).
