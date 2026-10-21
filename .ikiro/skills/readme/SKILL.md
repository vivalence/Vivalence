---
name: readme
description: >-
  Walk the README or an install page end to end as a newcomer would — a stock container or a .env-less cwd,
  lsof and docker ps FIRST so nothing shadows a local instance, every fence captured from what
  printed, every body killed at the end — and capture before any purge, strip, rename, drop or rm
  in a tree without version control to ~/.viva/bak/<scope>/<slug>-<YYYYMMDD>/.
when_to_use: >-
  "step through the readme" · "setup a docker image plain ubuntu" · "pull
  another linux distro" · a fresh container or VM walk · verifying an install/slowstart page · after any ghost
  verb or onboarding doc change · beef pastes his own terminal from a walk · "kill docker" · purging a daemon
  db · stripping a recipe or `.env` · dropping rows · deleting an instance or a registry entry · any rename
  that mikro will migrate · `rm` anywhere under `~/.viva` · "cleanup" near a ledger tree · a `.bak` or `bak/`
  about to be swept · "remove the <field|trait|export>" in a registry package · migrating a key across
  recipes and `.env` files.
---
<!-- limit: 5000 chars -->
# readme — "step through the readme" · `rm` under ~/.viva: walk the verbs, capture first

Defects live between verbs, where no test looks.

## beef's orders

/"read the local readme. setup a docker image plain ubuntu. go through the instructions step by step. end with a running setup inside thats live service hello world on ports xyz localhost. test it from the outside. tell me when youre done."/ · /"tty open so i can attach besides you … run just step 0, notify me of issues, and tell me how to attach from my cli"/ · /"pull another linux distro and run the readme 0-6 again step by step … run 2. subagents."/ · /"KILL KILL KILLLLLLLLLLLLLLLLL"/ (four containers left running).

## Before step 0

- `lsof -i -P | grep LISTEN` (all processes) + `docker ps` — `grep deno` hides the container answering the walk.
- a `.env`-less cwd: the repo-root `.env` outranks os-level `VIVA_INSTANCE_MOUNT`, boots the LIVE hello-world.
- alt ports (`:2501`/`:1794` are the local instance's); name them in the report.
- the frame is in the request: /"no. idiot. i planning a docker deploy. ... no deno task runtime/run?!?!?!"/

## The walk

1. stock image (`ubuntu:24.04`), pid 1 `bash` on a pty, each step `tee /proc/1/fd/1`; beef joins by `docker exec -it <name> bash` — `exit` in `docker attach` kills pid 1. Alpine: no musl Deno ≥2.7, the installer exits 0 on a dead binary.
2. scripts `Write` to the scratchpad → `docker cp`; macOS tar `COPYFILE_DISABLE=1`, archive measured first (no freight).
3. each README step verbatim; a fence = what PRINTED; a listing ≡ the file on disk, byte-equal, no `...` (/"NOT A FUCKING ABBREVIATION"/ 08-26) — his listing edit rewrites the FILE.
4. hit it from OUTSIDE (`curl` the alt port, `/status` at three tiers, a real bearer, `/metadata/*`), then the ghost verbs.
5. per step: `step · command · printed · verdict · defect` — defects to skill `quest`; doc drift fixed in the docs, /"slop up the docs for both of us"/. A doc line claims its source: READ every file it touches (/"READ! EVERY! SINGLE! FILE! THIS! TOUCHES!"/); a lie fixes the CODE.
6. **kill the bodies** — `docker rm -f <names>`, listed in the report. REJECTED: `docker builder prune` on the HOST.

Scratch variant: `viva instance/create <scratch> --init` → walk → `viva instance/delete <scratch>`. Two shells on two instances is a pre-existing red (`strata.wet.test.js:93`) — name it. His pasted walk becomes the quest's walk section verbatim.

## Capture before delete

`~/.viva/instances` and assembly · media · stucatch · vcompany have NO VCS; chess · droneaid · education · young-ladys-primer carry their own `.git`. "I can't run git" is not "the tree is protected". /"we are in development retard. why are you such a spastic"/ — a watched rename migrated, `drop table Memory` cascaded, 18 engrams + 62 traces gone.

1. **versioned?** `git -C <dir> rev-parse --show-toplevel 2>/dev/null || echo NO-VCS` — versioned is read-only for me.
2. **running?** `ps aux | grep deno` · `viva ledger/doctor` (`locks/`) · `lsof <db>`. A schema change under `--watch` IS a deployment.
3. **capture** to `~/.viva/bak/<scope>/<slug>-<YYYYMMDD>/`: a db with its migrations and the `instance.viva.json` that mounted it; a recipe whole. Say what you kept: /"19 literals, 19 symbol links, 18 uses rows, captured to … first. 69 symbols kept."/
4. REJECTED: a scratchpad copy as the only copy — `cleanup` destroys it.
5. cut by entry, never by line.
6. a hunk bound for `~/.viva/instances` is complete and reverse-appliable — no `…`.
7. mikro half-applies an FK change: restore db + migrations from backup, never retry.
8. price the asset before building a recovery harness.
9. the wipe is HIS: I capture + measure on a copy, he runs the rm/rsync (/"i do the whipe once youre done."/ 10-22).

Never swept, even under `cleanup`: beef's `// …` lines, his `console.log`s, `bak/`, `*.bak` beside in-flight work.
