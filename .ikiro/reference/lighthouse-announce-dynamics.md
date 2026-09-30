# Lighthouse Announce Dynamics — measured

> What the multiplayer lighthouse actually holds about daemons, and how that record moves when runtimes come and go. Every law below was measured against live containers (WP2 of m66), not read off the code alone. Code refs are container-rooted. Re-measure before trusting a line that a later hunk touched.

## The wire

A runtime process, after its daemons are integrated, announces each of them to the lighthouse named by `paladin.instance.lighthouse.statics.remote` (`systems/runtime/lifecycle/runtime/integration.js:36-56`, the vector's last beat since m74 M5):

```js
// systems/runtime/lifecycle/runtime/integration.js
const daemons = await die.runtime.processes.daemon.find();
for (const daemon of daemons) {
  await connection.call("/entities/daemon/ensure", { data: { slug: daemon.slug, url: daemon.url.absolute } });
}
const evicted = await connection.call("/entities/daemon/remove", {
  where: { url: { $like: `${origin}%` }, slug: { $nin: daemons.map((daemon) => daemon.slug) } },
});
```

`url` = `PUBLIC_VIVA_RUNTIME_REMOTE` + `/daemon/<slug>`. Not `/attached/process/daemon/…`; daemons hang off the runtime root.

The lighthouse serves the row through a generic repository shard (`subsystems/typology/gestalten/shard/datamap.js:138`) over this entity:

```ts
// subsystems/typology/entities/lighthouse/Daemon.ts
export class DaemonRepository extends DataRepository {
  unique(query) { return { slug: query.slug }; }
}
properties: {
  slug: { type: types.string, unique: true },
  url:  { type: types.string },
}
```

```ts
// subsystems/typology/entities/base/DataEntity.ts:45
async ensure(query) {
  const existing = await this.findOne(this.unique(query));
  if (existing) { existing.assign(query); return existing; }
  return await this.create(query);
}
```

## Rig

Three containers on a user network, plain `docker run`, no compose. Image `vivalence/runtime:alpine` for both lighthouse and runtimes. Every runtime carried `PUBLIC_VIVA_LIGHTHOUSE_REMOTE=http://lighthouse:2502/attached/process/lighthouse/multiplayer` and its own `PUBLIC_VIVA_RUNTIME_REMOTE=http://localhost:<port>/`.

```
lighthouse   commons/instances/multiplayer   :2502   volume viva_lighthouse
runtime      commons/instances/hello-world   :2501   volume viva_mountpoints
runtime2     commons/instances/hello-world   :2503   (temporary)
twin         hello-world + a second daemon `hello2`, mounted from a scratch dir   :2504   (temporary)
play         commons/instances/playground    :2505   (temporary, did not boot — see side finding)
```

Read side, every step:

```sh
curl -s -X POST http://localhost:2502/attached/process/lighthouse/multiplayer/entities/daemon/find \
  -H 'content-type: application/json' -d '{}' | jq -c '.[] | {slug,url,updatedAt}'
```

## Log

```
T0  runtime :2501 alone
    {"slug":"hello","url":"http://localhost:2501/daemon/hello","updatedAt":"2026-09-19T13:25:37.112Z"}

T1  + runtime2 :2503, same hello-world recipe
    {"slug":"hello","url":"http://localhost:2503/daemon/hello","updatedAt":"2026-09-19T13:31:58.220Z"}
    ONE row. url flipped. no second row.

T2  docker restart runtime (:2501)
    {"slug":"hello","url":"http://localhost:2501/daemon/hello","updatedAt":"2026-09-19T13:32:11.397Z"}
    flipped back. last announcer wins.

T3  docker stop runtime2
    unchanged

T4  docker stop runtime  (no daemon alive anywhere)
    {"slug":"hello","url":"http://localhost:2501/daemon/hello","updatedAt":"2026-09-19T13:32:11.397Z"}
    row stays. nothing notices absence.

T5  docker restart lighthouse alone
    {"slug":"hello","url":"http://localhost:2501/daemon/hello","updatedAt":"2026-09-19T13:32:11.397Z"}
    persisted through the volume.

T6  twin instance (daemons hello + hello2) on :2504
    {"slug":"hello","url":"http://localhost:2504/daemon/hello"}
    {"slug":"hello2","url":"http://localhost:2504/daemon/hello2"}

T7  twin removed, plain hello-world started on the SAME :2504 (hello2 no longer declared)
    {"slug":"hello","url":"http://localhost:2504/daemon/hello"}
    {"slug":"hello2","url":"http://localhost:2504/daemon/hello2"}
    hello2 STAYS. the evict call returned count 0 — no "[announce] pruned" line in the runtime log.

T9  docker rm runtime; fresh container, same recipe, same REMOTE, :2501
    {"id":"01a0b9d8-04d8-72e9-ac36-8a2cf8ed6cd8","slug":"hello","url":"http://localhost:2501/daemon/hello"}
    same row id as T0. identity is the slug, not the process.

cleanup
    POST /entities/daemon/removeOne {"where":{"slug":"hello2"}}  →  {"ok":true,"id":"01a0b9df-…"}
```

## Laws

1. **Row identity is the daemon slug.** `slug` is UNIQUE; `ensure` finds by slug and assigns the url. N runtimes announcing the same slug produce one row. No fan-out, no conflict error, no history.
2. **Last announcer wins.** Whoever booted most recently owns the url. A second host running `hello` silently steals the address from the first. For one operator with one runtime per daemon this is correct; the day two hosts share a slug it is a collision, not a cluster.
3. **Persistence is total, liveness is zero.** The row survives daemon stop, runtime `rm`, lighthouse restart. No heartbeat, no TTL, no `alive` flag. The lighthouse is a phonebook, not a presence list. A consumer (anima) dials whatever url last wrote and finds out on the wire.
4. **Prune is dead in docker.** The evict predicate matches `url LIKE '${origin}%'` where `origin` is `runtime.statics.serve.origin` (the BIND address, `http://0.0.0.0:2504`), while stored urls carry `PUBLIC_VIVA_RUNTIME_REMOTE` (`http://localhost:2504`). Bind ≠ remote → nothing ever matches → a daemon dropped from an instance leaves a stale row forever. It only worked on a laptop where bind == remote. Same disease the m66 address law diagnosed: derive from REMOTE, never from bind. Ledgered in `known-issues.org`.
5. **Removal is a curl.** `/entities/daemon/removeOne {where:{slug}}` works today. Manual hygiene is possible; nothing automatic is.

## Consequences for m66

- One lighthouse serving many runtimes is fine while every daemon slug is unique across the fleet. Nothing enforces that.
- Owed, none landed, each small: prune keys on the REMOTE origin; optionally a `runtime` (or `origin`) column on the row so a slug can be reached at many runtimes and the client picks (memory law: *a daemon slug lives in many instances*).
- Anima needs exactly one env key, `PUBLIC_VIVA_LIGHTHOUSE_REMOTE`; every daemon address it dials comes from these rows. So the quality of this table IS anima's routing.

## Side finding

`commons/instances/playground` dies at boot in `vivalence/runtime:alpine` with `[VIP] Module 404: {"lookup":{"owner":"@commons","type":"hallucinator","slug":"stub"}}`. The stub is on disk and committed (`commons/fixtures/hal/stub/service.viva.js`, since `4edf498c7 hal`); the image does not carry it because `.dockerignore:34` excludes `commons/fixtures` (and `commons/playground`). Playground is a laptop-only recipe until that line changes or the stub moves out of fixtures. Not an announce matter, noted because T8 was meant to be the "different daemon" composition and T6 (`hello2`) had to stand in for it.

## Pre-existing, unrelated, seen on the way

`POST /daemon/hello/mode/demo/hello-world/hello/bot` with a valid token → `500 Cannot read properties of undefined (reading 'manifest')`. The gate works (no token → `401 MISSING_TOKEN`); the crash is `commons/instances/hello-world/mode.viva.js:31` logging `ctx.mode.manifest.slug` with `ctx.mode` unset on the aperture ctx.
