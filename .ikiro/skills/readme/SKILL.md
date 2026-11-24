---
name: readme
description: Walk the README or an install page as a newcomer would, in a fresh container. And copy before any delete in a tree without version control.
when_to_use: >-
  "step through the readme" · "setup a docker image plain ubuntu" · "pull another linux distro" ·
  verifying an install page · "kill docker" · any `rm`, purge, strip or drop under `~/.viva` · "cleanup" near a ledger tree
---
<!-- limit: 3400 chars -->
# readme — walk the install, and copy before delete

## before the walk

```sh
lsof -i -P | grep LISTEN
docker ps
```

- Run from a directory without a `.env`. The repo's `.env` would boot his live instance.
- Use other ports than `:2501` and `:1794`. Name them in the report.

## the walk

1. A stock image (`ubuntu:24.04`), `bash` as process 1. He joins with `docker exec -it <name> bash`.
2. Scripts are written as files and copied in with `docker cp`.
3. Each README step is run verbatim. A fence in the docs shows what printed, byte for byte, never shortened.
4. Reach it from outside: `curl` the port, `/beacon/status`, a route with a real bearer. Then the `viva` commands.
5. Report per step: step, command, what printed, verdict, defect.
6. A wrong doc line is fixed in the docs. A doc line that reveals a bug fixes the code.
7. Remove every container at the end and list them in the report.

```sh
docker rm -f <names>
```

## copy before delete

`~/.viva/instances` and some registry packages have no version control. Nothing there can be undone.

1. Versioned? A versioned tree is read-only for me.

```sh
git -C <dir> rev-parse --show-toplevel 2>/dev/null || echo NO-VCS
```

2. Running? A schema change under a watcher is a deployment.

```sh
ps aux | grep deno
viva ledger/doctor
```

3. Copy to `~/.viva/bak/<scope>/<name>-<date>/`: a database with its migrations and the recipe that mounted it. Say what was kept.
4. A scratch directory is never the only copy.
5. Cut by entry, never by line.
6. A failed migration is restored from the copy, never retried.
7. The wipe is his. I copy and measure.
8. A prune of a live database he ordered: back it up, try the SQL on a copy, compare counts before and after, then run it once in one transaction.

Never removed, even under "cleanup": his `//` lines, his `console.log`s, `bak/`, `*.bak`.
