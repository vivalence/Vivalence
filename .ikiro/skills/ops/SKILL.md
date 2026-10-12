---
name: ops
description: >-
  Snapshot the prod runtime's mountpoint (daemon SQLite + service state) out of its docker named volume and
  swap it into the local ledger instance at ~/.viva/instances/<slug>/mountpoint/ without trampling existing
  snapshots; CRUD DBeaver connections by editing data-sources.json (desktop DBeaver has no API), with
  `create-instance <slug>` mounting every *.viva.db of an instance. Use when a prod-only bug needs prod data
  against local code, or a sqlite file needs a DBeaver connection.
when_to_use: >-
  "pull prod state" · "snapshot the prod daemon" · "run prod data locally" · "grab the prod sqlite" ·
  debugging a prod-only bug against local code · "add the <slug> dbs to DBeaver" · "point DBeaver at this
  sqlite file" · after `viva instance/create` · which connections exist.
---
<!-- limit: 7000 chars -->
# ops — "pull prod state" · "add the <slug> dbs to DBeaver": prod data local, dbs in DBeaver

## Pull prod mountpoint

Prod state lives in the named volume `mountpoint` (`/viva/mountpoint`). Target: `~/.viva/instances/<slug>/mountpoint/` — never `testament/`. Foot-guns: **named** volume (no host path to `tar`); WAL flushes only with the runtime **stopped**; extracting onto local `daemon_brazilian/` `service_multiplayer/` mixes state silently.

Confirm: server (default `root@com-vivalence-runtime-R000`) · prod → local only (the reverse: propose, per-command go) · target · backup to `bak/` (default yes).

### Phase 0 — inspect, read-only

Every name here was once guessed wrong. Tag + sha = the rollback pin; the env grep skips secrets; never `tree -L 2` on `/viva`.

```bash
C=$(docker ps --format '{{.Names}}' | grep '^runtime-')
V=$(docker volume ls -q | grep '_mountpoint$')
docker inspect $C --format '{{.Config.Image}} {{.Image}}'
docker exec $C env | grep -E '^(VIVA|PUBLIC_VIVA)_' | sort
docker exec $C tree -d -L 1 /viva
docker exec $C sh -c 'ls $VIVA_INSTANCE_MOUNT; cat $VIVA_INSTANCE_MOUNT/*.viva.js'
docker run --rm -it -v $V:/m:ro registry.vivalence.org/beef/viva/vivalence/viva:alpine bash
```

Inside the sidecar:

```bash
du -sh /m/*
for db in /m/daemon_*/*.viva.db; do
  echo "== $db"
  sqlite3 -readonly "$db" "select slug, traits from Mode order by slug;"
  sqlite3 -readonly "$db" "select name from _mikro_migrations order by id;"
  sqlite3 -readonly "$db" "select (select count(*) from Buffer),(select count(*) from Turn),(select count(*) from User);"
done
L=/m/service_multiplayer/lighthouse.viva.db
sqlite3 -readonly $L "select count(*) from Identity; select count(*) from Daemon;"
jq 'length' /m/service_multiplayer/tokens.json
```

- `_mikro_migrations`, not `mikro_orm_migrations`; tables Capitalised (`Mode` `Buffer` `Turn` `User` `Identity` `Daemon`).
- daemon dbs carry the `db.file` their creating recipe pinned (prod: `test-language*.viva.db`), NOT the default `<slug>.viva.db` (`paladin/instance/lifecycle/resolution.js:30`); a mismatch mints an empty db beside the old. Rename the file, keep the dir.
- PROD only; local since m80 = ONE `<instance>.viva.db` (`runtime/population.js:31`).
- `$D=$(ls -d /m/daemon_*)` over several daemons expands to several paths — loop, never assign.
- `-readonly` on `:ro` is safe live; "disk I/O error" = wrong path, not a lock.

### Phase 1 — server snapshot (on the host, not in the container)

```bash
ssh <SERVER>
docker ps
docker volume ls | grep mountpoint
docker stop <CONTAINER_ID>
docker run --rm \
  -v <VOLUME_NAME>:/data:ro \
  -v /tmp:/out \
  alpine tar -czf /out/mountpoint.tgz -C /data .
ls -lh /tmp/mountpoint.tgz
docker start <CONTAINER_ID>
exit
```

The volume is Coolify-prefixed (`egcwkgw0cwg0kkwko4owooco_mountpoint`) — discover, never hardcode. **`docker start` before `exit`**. Never `docker exec` a stopped container — the sidecar works either way.

### Phase 2 — local pull + swap

```bash
cd ~/.viva/instances/<slug>/mountpoint
mkdir -p tmp
scp <SERVER>:/tmp/mountpoint.tgz tmp/
tar -xzf tmp/mountpoint.tgz -C tmp/
ls tmp/
mkdir -p bak
mv daemon_brazilian/ service_multiplayer/ bak/
mv tmp/daemon_brazilian/ tmp/service_multiplayer/ .
rm -rf tmp/
```

Extract into `tmp/`, never the mountpoint root; `ls` before `tar` (a wrong cwd fails silently-ish). Prod may hold several `daemon_<slug>/` — swap each.

### Phase 3 — verify

```bash
ls ~/.viva/instances/<slug>/mountpoint/
sqlite3 ~/.viva/instances/<slug>/mountpoint/daemon_brazilian/<dbname>.sqlite ".tables"
```

Then `viva instance/use <slug> run`; report boot/migration errors. `commons/instances/hello-world/docker-compose.yml` is the one compose.

## DBeaver connections

**DBeaver must be closed before any write** — it rewrites the file from memory on save and exit. `pgrep -fl dbeaver` must print nothing. Wrote while open anyway → do NOT save from the UI; **F5 on the project node in Database Navigator** first (`DBNProject.refreshNode()` → `refreshConfig()`), the only reliable reload.

File: `~/Library/DBeaverData/workspace6/General/.dbeaver/data-sources.json` — tab-indented, no trailing newline; sections `folders` · `connections` · `virtual-models` · `connection-types`; the script touches `connections` only. `credentials-config.json` is never touched (SQLite needs none).

```json
"viva-italian": {
  "provider": "sqlite",
  "driver": "sqlite_jdbc",
  "name": "viva italian",
  "save-password": true,
  "configuration": {
    "database": "/Users/finn/.viva/instances/italian/mountpoint/daemon_italian/italian.viva.db",
    "url": "jdbc:sqlite:/Users/finn/.viva/instances/italian/mountpoint/daemon_italian/italian.viva.db",
    "type": "dev"
  }
}
```

`database` is load-bearing: absent `configurationType` = `MANUAL`, which **ignores `url`** and regenerates `jdbc:sqlite:{file}` from `configuration.database`. Write both.

```sh
deno run -A .claude/skills/ops/dbeaver.js list
deno run -A .claude/skills/ops/dbeaver.js read viva-italian
deno run -A .claude/skills/ops/dbeaver.js create viva-italian ~/.viva/instances/italian/mountpoint/daemon_italian/italian.viva.db --name "viva italian"
deno run -A .claude/skills/ops/dbeaver.js update viva-italian --name "italian daemon" --path ~/.viva/instances/italian/mountpoint/service_multiplayer/lighthouse.viva.db
deno run -A .claude/skills/ops/dbeaver.js delete viva-italian
deno run -A .claude/skills/ops/dbeaver.js create-instance hello-world --dry
deno run -A .claude/skills/ops/dbeaver.js create-instance hello-world
```

`create` refuses an existing id and a missing path (`--allow-missing`); `update`/`delete` refuse an unknown id; refusal exits 1. `--file <path>` rehearses on a copy. `create-instance` reads `~/.viva/instances.json`, walks `<mount>/mountpoint/`, mints `viva-<slug>-<stem>` named `viva <slug> <filename>` per `*.viva.db`; existing ids `skipped`; `--dry` writes nothing. Run from `/Users/finn/vivalence/code/vivalence`.

First write copies `data-sources.json.bak` once (delete to re-arm); reparse is identical. REJECTED: the CLI `-con` (launches the GUI, one per call) and GraphQL (CloudBeaver only).
