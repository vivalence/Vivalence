---
name: rename-pass
description: >-
  Land a settled noun across the whole machine — keep-list first (where the word survives meaning something
  else), exact new names with collisions checked, flag-day with no alias window, one atomic spine milestone
  that keeps boot green, and a residue grep over repo + ~/.viva/instances + every tapped package. Use when a
  term is already locked and now has to move.
when_to_use: >-
  "rename X to Y everywhere" · "BIG rename coming up" · "globally rename" · after an ontology-pass locks a word ·
  a `manifest.type` string, scope key, env var or export name changes · "no dual read" · "entirely" · a key
  RETIRED or a path MOVED ("you fucked up the migration") — the grep for the old name is the denominator.
---

# rename-pass — partition a WORD, then move it in one blast

Canon: `done/variant-to-instance.quest.org` (the reference pass) · `done/m15_cake_rename.quest.org` · `done/m58-application-noun.org` · `feedback_rename_includes_consumers` · `feedback_flag_day_radius`. Choosing the noun is [[ontology-pass]]; sizing a code radius is [[blast-bracket]]; this skill partitions a word that has more than one meaning in the tree.

## beef's rulings on renames — verbatim, standing

*"entirely. no dual read. replace with instance."* · *"no fallback window. i manage installations. you everything on this sysem!"* · *"KILLLLLL"* · *"rename files, content and references."* · *"not as atomic step by step microprocess, but as a blast change"*.

## The organs — one todo each

1. **keep-list** — every place the word SURVIVES because it means something else (style variants · `font-variant-numeric` · the word "invariant" · a linguistic term · `.ikiro/` history · a `.bak`). Written BEFORE the grep so the residue check has an oracle.
2. **term census** — the surfaces the word lives on: identifiers · `manifest.type` strings · scope keys · env vars (`VIVA_*`) · route nouns · file and directory names · fixtures and snapshots · docs · bruno · docker/compose · `.mjs` configs. **`grep -rI` with NO include filters** — one missed `vite.config.mjs` crashed beef's dev server: *"did you cover bruno? testing? json?"* · *"svelte"* · *"docker?"* · *"compose??"*
3. **radius = the whole machine** — repo + `~/.viva/instances/*` + `~/.viva/registry/*` (tapped packages, their `instances/*/instance.viva.js` templates). Reporting a tapped package as "owed" is not a landing. `~/.viva` has no VCS → [[capture-before-delete]] first.
4. **relative imports** — `grep -rn '\.\./.*<old>/'` — a `../../viva/…` path carries no literal `registry/` and went red on beat 4 once.
5. **new names exact, collisions checked** — `grep -rn '<new>'` before writing; a coexisting same-name-different-concept is named as such (`datamapInstance` coexists; ledger `instances.json` is the SAME concept converging).
6. **the atomic spine** — scope key · env var · `find.type` discriminator · manifest `type` strings · ledger path form ONE milestone; any split leaves boot red between milestones.
7. **blast-bracket around it** — consumer suites green before, the change, green after; `*.snapshot.test.js` in compare mode + `SNAPSHOT_HOT=1` for the wire ones; fixtures/ + snapshots/ (repo AND registry) grep for the old name → ZERO.
8. **residue grep against the keep-list** — the closing count. *"Residue after FINAL BLAST: keep-list (…) + the ghost README quest pointer — exactly as predicted."* Anything else is a miss.
9. **canon** — `python3 .ikiro/methods/sweep.py <old>` for live canon; memory bodies that named the old word get updated or deleted; the shard gets re-stamped with the CHECK named.

## What it is not

Not an alias, a dual read, a deprecation window, or a `// was X` comment. Not a rename of beef's `//` lines or `bak/` (recovery surface). Not `git mv` — plain `mv`, VCS is write-protected.
