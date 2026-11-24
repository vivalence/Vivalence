---
name: ops
description: Pull the prod mountpoint to a local instance, gate a prod change on a cloned volume, manage DBeaver connections.
when_to_use: >-
  "pull prod state" · a prod-only bug · "deploy not working" · "force pull" · a prod deploy, slug move or schema diff ·
  "add the <slug> dbs to DBeaver" · after `viva instance/create`
---
<!-- limit: 5600 chars -->
# ops — prod data local, prod changes, DBeaver

## pull the prod mountpoint

Prod state is the docker volume `mountpoint` (`/viva/mountpoint`). It goes into the instance's `mountpoint/`. The database is only whole while the runtime is stopped.

Confirm with him first: the server, prod to local only, the target, the backup.

### 0 · inspect, read-only

A prod defect is looked at on the host, never guessed from the local tree.

```bash
C=$(docker ps --format '{{.Names}}' | grep '^runtime-')
V=$(docker volume ls -q | grep '_mountpoint$')
docker inspect $C --format '{{.Config.Image}} {{.Image}}'
docker exec $C env | grep -E '^(VIVA|PUBLIC_VIVA)_' | sort
docker exec $C tree -d -L 1 /viva
docker exec $C sh -c 'ls $VIVA_INSTANCE_MOUNT; cat $VIVA_INSTANCE_MOUNT/*.viva.js*'
docker run --rm -i -v $V:/m:ro --entrypoint sqlite3 vivalence/prod-runtime:local -readonly /m/prod.viva.db < q.sql
```

- SQL goes in from a local file on stdin.
- The migrations table is `_mikro_migrations`. Table names are capitalised.
- Never print secrets from the env.
- A module a recipe names must exist in the image: `docker exec $C ls /viva/repository/commons/<dir>`.
- The build reads each package's default branch on GitHub. Before a build I read what that commit holds, never his working copy.
- Coolify's env table is the source. A hand edit of `.env` dies at the next deploy.
- A healthcheck uses `127.0.0.1`, never `localhost`.
- An entity inserted by hand skips its hooks. Insert the entities its hooks would have made too.

### 1 · snapshot on the server

```bash
ssh <SERVER>
docker stop $C
docker run --rm -v $V:/data:ro -v /tmp:/out alpine tar -czf /out/mountpoint.tgz -C /data .
ls -lh /tmp/mountpoint.tgz
docker start $C
```

`docker start` before `exit`. Never `docker exec` a stopped container.

### 2 · pull, swap, verify

```bash
cd ~/.viva/instances/<slug>/mountpoint
mkdir -p tmp bak
scp <SERVER>:/tmp/mountpoint.tgz tmp/
tar -xzf tmp/mountpoint.tgz -C tmp/
ls tmp/
mv prod.viva.db daemon_*/ bak/
mv tmp/prod.viva.db tmp/daemon_*/ .
rm -rf tmp/
sqlite3 prod.viva.db ".tables"
```

Then `viva instance/use <slug> run`, and report boot errors.

## a prod change

- It boots first on a cloned volume. Each gate lists what it measured: auth 401 and 200, userspace, every surface 200, a file 200 and 206.
- A clone goes by name when the gate ends, never by `prune`.
- Prod data is kept. Count the entities per daemon, he rules what goes.
- A move carries the database and `tokens.json`. It drops `migrations/` and the snapshot files.
- A deploy plan starts at the step he is at. It edits only what the new code breaks: a refused key moves to where his local instance holds it.
- The image lines in compose are his. Never hardcode an image tag or hash.
- The instance is set by compose (`VIVA_INSTANCE_MOUNT` and a bind), never by a build argument.
- Every prod step needs its own `go`.

## DBeaver connections

DBeaver must be closed before a write (`pgrep -fl dbeaver` prints nothing). It rewrites the file on exit.

File: `~/Library/DBeaverData/workspace6/General/.dbeaver/data-sources.json`

```json
"viva-italian": { "provider": "sqlite", "driver": "sqlite_jdbc", "name": "viva italian", "save-password": true,
  "configuration": { "type": "dev", "database": "<abs path>.viva.db", "url": "jdbc:sqlite:<abs path>.viva.db" } }
```

Write both `database` and `url`. DBeaver ignores `url` and rebuilds it from `database`.

```sh
alias D='deno run -A .claude/skills/ops/dbeaver.js'; M=~/.viva/instances/italian/mountpoint
D list; D read viva-italian; D delete viva-italian; D create-instance hello-world --dry
D create viva-italian $M/daemon_italian/italian.viva.db --name "viva italian"
D update viva-italian --name "italian daemon" --path $M/service_multiplayer/lighthouse.viva.db
```

- `--file <path>` rehearses on a copy. `--dry` writes nothing.
- The first write keeps `data-sources.json.bak`.
- If it was written while DBeaver was open: never save from the UI. Press F5 on the project node.
