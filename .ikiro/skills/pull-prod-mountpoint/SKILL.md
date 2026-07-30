---
name: pull-prod-mountpoint
description: Snapshot the prod runtime's mountpoint (daemon SQLite + service state) out of its docker named volume and swap it into the local testament without trampling existing snapshots — ~24 shell ops with three foot-guns beef has already hit.
when_to_use: "pull prod state" · "snapshot the prod daemon" · "run prod data locally" · "grab the prod sqlite" · debugging a prod-only bug against local code.
---

# Pull Prod Mountpoint → Local Testament

## Intent

The vivalence runtime stores all stateful data (daemon SQLite, service state) in a docker named volume `mountpoint`, mounted at `/viva/mountpoint` inside the container. To debug prod issues against local code, that volume needs to be snapshotted, transferred, and swapped into `testament/variant/mountpoint/` — without trampling the existing local snapshots.

This skill captures a workflow that is otherwise ~24 manual shell ops with at least three foot-guns the user has already hit:

1. The volume is **named**, not bind-mounted — there's no host path to `tar` directly.
2. SQLite WAL must flush before snapshotting, so the runtime must be **stopped first**.
3. Local `daemon_brazilian/` and `service_multiplayer/` already exist; extracting on top mixes prod and local state silently.

> **Wiring note (for Finn):** This skill lives under `.ikiro/skills/` for ontology reasons but Claude Code only auto-discovers from `.claude/skills/` or `~/.claude/skills/`. Wire it up via `ln -s ../.ikiro/skills .claude/skills` (or equivalent) so it becomes invocable.

## Inputs to confirm before running

Before touching anything, confirm with the user:

- **Server hostname** (default: `root@com-vivalence-runtime-R000`)
- **Direction**: pulling prod → local (this skill) vs. pushing local → prod (out of scope)
- **Local target**: `testament/variant/mountpoint/` (default; assumed)
- **Whether to keep existing local mountpoint as backup** (default: yes, move to `bak/`)

## Procedure

### Phase 1 — Server side (snapshot)

Run on the host, **not** inside the runtime container.

```bash
ssh <SERVER>

# 1. Find runtime container ID and volume name
docker ps                            # note the runtime container ID
docker volume ls | grep mountpoint   # note the prefixed volume name (e.g. <slug>_mountpoint)

# 2. Stop runtime cleanly so SQLite WAL flushes
docker stop <CONTAINER_ID>

# 3. Tar the volume via a throwaway alpine sidecar
docker run --rm \
  -v <VOLUME_NAME>:/data:ro \
  -v /tmp:/out \
  alpine tar -czf /out/mountpoint.tgz -C /data .

# 4. Verify size (should be a few MB for a fresh prod, more if used)
ls -lh /tmp/mountpoint.tgz

# 5. Restart runtime BEFORE disconnecting (do not skip — easy to forget)
docker start <CONTAINER_ID>

exit
```

### Phase 2 — Local side (pull + swap)

```bash
cd testament/variant/mountpoint

# 6. Pull tarball into a scratch dir
mkdir -p tmp
scp <SERVER>:/tmp/mountpoint.tgz tmp/

# 7. Extract into scratch (NOT into mountpoint root — it would mix with local state)
tar -xzf tmp/mountpoint.tgz -C tmp/
ls tmp/   # confirm: daemon_brazilian/ service_multiplayer/

# 8. Backup existing local mountpoint (don't delete — user may want to revert)
mkdir -p bak
mv daemon_brazilian/ service_multiplayer/ bak/

# 9. Swap prod snapshot in
mv tmp/daemon_brazilian/ tmp/service_multiplayer/ .

# 10. Clean scratch
rm -rf tmp/
```

### Phase 3 — Verify

```bash
ls testament/variant/mountpoint/   # daemon_brazilian/ service_multiplayer/ bak/ should be present
sqlite3 testament/variant/mountpoint/daemon_brazilian/<dbname>.sqlite ".tables"   # sanity-check the schema loaded
```

Then run the local testament and report any boot/migration errors back to the user.

## Foot-guns (from the live session this was built from)

- **Don't `tar -xzf` from the wrong cwd.** The user did `tar -xzf mountpoint.tgz -C mountpoint` while the file was in `tmp/` — failed silently-ish. Always `ls` first or use absolute paths.
- **Don't extract into the mountpoint root.** It will merge with `daemon_brazilian/` and `service_multiplayer/` already there and you won't notice until the daemon hits stale schema.
- **Restart the prod container before logging out.** Easy to forget; users will be down until you reconnect.
- **The volume name is project-prefixed.** Coolify (or whatever orchestrator) prepends a slug like `egcwkgw0cwg0kkwko4owooco_mountpoint`. Always discover via `docker volume ls | grep mountpoint`, never hardcode.
- **Don't `docker exec` into a stopped container** to tar — use the alpine sidecar pattern. Works whether the runtime is up or down.

## Reverse direction (local → prod)

Out of scope. Do not attempt without explicit user instruction — overwriting prod state is destructive and irreversible without a snapshot. If the user asks, propose the inverse procedure and require explicit confirmation per command.

## Compose context

The volume is declared in `registry/wafers/@vivalence/variant/multiplayer/docker-compose.yml`:

```yaml
volumes:
  mountpoint:
    driver: local

services:
  runtime:
    volumes:
      - mountpoint:/viva/mountpoint
```

If that compose ever switches to a bind mount, this skill needs updating — the alpine sidecar step becomes unnecessary and you can `tar` directly on the host.
