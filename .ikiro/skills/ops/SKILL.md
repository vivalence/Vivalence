---
name: ops
description: >-
  Snapshot the prod mountpoint (daemon SQLite + service state) out of its docker volume into
  ~/.viva/instances/<slug>/mountpoint/; gate a prod change on a cloned volume; CRUD DBeaver connections in
  data-sources.json, `create-instance <slug>` per *.viva.db.
when_to_use: >-
  "pull prod state" · a prod-only bug · a prod deploy, slug move or schema diff · "add the <slug> dbs to DBeaver" ·
  after `viva instance/create` · which connections exist.
---
<!-- limit: 7000 chars -->
# ops — prod data local · prod changes · DBeaver

## Pull prod mountpoint

Prod state = the named volume `mountpoint` (`/viva/mountpoint`). Target: the instance's `mountpoint/`, never `testament/`. No host path to `tar`; WAL flushes only with the runtime **stopped**; extract to `tmp/` first.

Confirm: server (`root@com-vivalence-runtime-R000`) · prod → local only · target · `bak/`.

### Phase 0 — inspect, read-only

A prod defect is scouted ON the host — volume · image · container — never by local grep; LIST each container's ledger · mountpoint · instance first; a prod compose/`.env` is the OLD world till checked against HEAD (/"scout the issue on location."/ 09-20). The env grep skips secrets; never `tree -L 2` on `/viva`.

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
  sqlite3 -readonly "$db" "select slug, traits from Mode order by slug; select name from _mikro_migrations order by id;
    select (select count(*) from Buffer),(select count(*) from Turn),(select count(*) from User);"
done
sqlite3 -readonly /m/service_multiplayer/lighthouse.viva.db "select count(*) from Identity; select count(*) from Daemon;"
jq 'length' /m/service_multiplayer/tokens.json
```

- `_mikro_migrations`, not `mikro_orm_migrations`; tables Capitalised, as queried above.
- a prod daemon db carries the `db.file` its recipe pinned (`test-language*.viva.db`); HEAD = ONE `<instance>.viva.db` (`runtime/subjects/runtime/lifecycle/1-population.js:39`), no migration path — the prod volume is wiped (ruled 11-06).
- **Coolify `Restart` KEEPS the container** (11-06): env · healthcheck land by `docker compose up -d --force-recreate <svc>` in the service dir (`--no-build` · `-V`); its `.env` has no trailing newline. Healthcheck host `127.0.0.1`, never `localhost` (`::1`, 503). Anima compose sets `VIVA_MOUNTPOINT_MOUNT`.
- **a hand-inserted row skips its entity's twitches** (11-06: User by SQL → no Terminal → anima boots forever): insert each twitch-minted sibling too (`typology/entities/*.ts` `/after/<entity>/create`).

### Phase 1 — server snapshot (host, not container)

```bash
ssh <SERVER>
docker stop $C
docker run --rm -v $V:/data:ro -v /tmp:/out alpine tar -czf /out/mountpoint.tgz -C /data .
ls -lh /tmp/mountpoint.tgz
docker start $C
```

`$C` `$V` from Phase 0. **`docker start` before `exit`**; never `docker exec` a stopped container.

### Phase 2 — local pull + swap + verify

```bash
cd ~/.viva/instances/<slug>/mountpoint
mkdir -p tmp bak
scp <SERVER>:/tmp/mountpoint.tgz tmp/
tar -xzf tmp/mountpoint.tgz -C tmp/
ls tmp/
mv daemon_brazilian/ service_multiplayer/ bak/
mv tmp/daemon_brazilian/ tmp/service_multiplayer/ .
rm -rf tmp/
sqlite3 daemon_brazilian/<dbname>.viva.db ".tables"
```

`ls` before `tar`; swap each `daemon_<slug>/`; then `viva instance/use <slug> run`, report boot errors.

## Prod change

A prod change boots first on a CLONED volume with a throwaway lighthouse — each milestone's gate lists what it MEASURED: auth 401/200 · userspace · freight `200 audio/mpeg` + `206` (/"this is prod. be careful"/ · /"check that the freight works."/).

Prod data is KEPT: row counts per daemon, beef rules (/"if its got rich data, use it. else chuck it"/ 09-20), the chucked seat stays byte-identical beside; a move carries db + `tokens.json`, drops `migrations/` · `.snapshot-*.json` (/"drop generated files"/ 09-20).

A deploy plan leads with the step beef is AT and names each image's ROLE — the copy tool pinned by digest, **the image lines are HIS, untouched**: `:alpine` IS the deploy tag, CI moves it (`.gitlab-ci.yml:32`), `:$SHA` the rollback pin only. REJECTED 11-06 twice — `FROM …:df54e5b7` · `ARG VIVA_BASE` · `image: ${VIVA_ANIMA_IMAGE}` (/"no hardcoding of images."/ · /"why are you … so hardboiled on changing this?"/): a deploy plan edits only what HEAD BREAKS; a container's state fills through an entrypoint, every step checks first (/"I want a flexible entry point"/ 09-19). **The instance is a compose fact** (`VIVA_INSTANCE_MOUNT` + a bind), never a CI build-arg: anima's `paladin:baked` runs in the ENTRYPOINT against the mounted recipe (REJECTED 11-06 a CI bake — /"the docker compose file sets instance."/).

**`do now` after a list = the bullet he quoted** — REJECTED 11-06: four GitLab hops ran on a /"do now"/ meant for `docker stop` (/"you read that wrong"/); a prod hop is its own go. GitLab: memory `prod-runtime-host` (stops x.2/5/8/11, never `:latest`).

## DBeaver connections

**DBeaver closed before any write** (`pgrep -fl dbeaver` empty) — it rewrites the file from memory on exit. Wrote while open → never save from the UI; **F5 on the project node** (`DBNProject.refreshNode()`), the only reload.

File: `~/Library/DBeaverData/workspace6/General/.dbeaver/data-sources.json` — tab-indented, no trailing newline; of `folders` · `connections` · `virtual-models` · `connection-types` the script touches `connections` only, never `credentials-config.json` (SQLite needs none).

```json
"viva-italian": { "provider": "sqlite", "driver": "sqlite_jdbc", "name": "viva italian", "save-password": true,
  "configuration": { "type": "dev", "database": "<abs path>.viva.db", "url": "jdbc:sqlite:<abs path>.viva.db" } }
```

`database` is load-bearing: absent `configurationType` = `MANUAL`, which **ignores `url`** and regenerates it from `configuration.database`. Write both.

```sh
alias D='deno run -A .claude/skills/ops/dbeaver.js'; M=~/.viva/instances/italian/mountpoint
D list; D read viva-italian; D delete viva-italian; D create-instance hello-world --dry
D create viva-italian $M/daemon_italian/italian.viva.db --name "viva italian"
D update viva-italian --name "italian daemon" --path $M/service_multiplayer/lighthouse.viva.db
```

Refusals exit 1; `--file <path>` rehearses on a copy; `create-instance` mints `viva-<slug>-<stem>` from `~/.viva/instances.json`, `--dry` writes nothing. Repo root.

First write copies `data-sources.json.bak` once (delete to re-arm). REJECTED: the CLI `-con` (launches the GUI) · GraphQL (CloudBeaver only).
