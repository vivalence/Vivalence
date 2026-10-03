# mikro-orm 6.6.7 → 7.2.3 — the full blast, 2026-10-05

Map only, nothing changed. Radius: the repo (`systems` · `subsystems` · `commons` · `testament` · `documentation` + root files) · `~/.viva/registry` · `~/.viva/instances` (read-only sqlite). Supersedes `census.md` (10-02) for counts; m76 moved files since. Re-derive with `blast/` (scripts + raw outputs; `exports.js` · `raw.js` need a DENO_DIR holding 7.2.3 — the one used lived in session 11950be0's scratchpad).

| radius | count |
|---|---|
| files naming `mikro` (any text) | 392 |
| live code files importing `@mikro-orm/*` | 58 (41 repo · 17 registry) |
| testament copies (`m76-probe`, gitignored) | 23 |
| dead (`bak/` · `*.bak.*`) | 49 |
| imported names | 30 (`core` 88 rows · `sqlite` 4 · `migrations` 1 · `knex` 0) |
| imported names MISSING in 7.2.3 | 0 |
| sqlite dbs | 22 (13 daemons · 9 multiplayer services, 9 instances) |
| migration files on disk | 66 live (+3 `bak/`) · 36 carry `pragma` · 0 carry `down()` |
| m:1 FKs on disk with implied `on update cascade` | 186 |
| cached mode bundles naming mikro | 205 — text only (a schematic `.desc`), no `@mikro-orm` code ships to the client |

## BREAKS — throws or silently empties at flag day

**the boot** — every process (runtime `:memory:`, every daemon, every service) dies here.

```js
// commons/datamaps/libsql/libsql.viva.js:28
  if (orm.config.get("dbName") === ":memory:") await orm.schema.createSchema();
  else {
    const migrator = orm.getMigrator();
    if (await migrator.checkMigrationNeeded()) await migrator.createMigration();
    if ((await migrator.getPendingMigrations()).length) await migrator.up();
  }
```

| v6 | v7 |
|---|---|
| `orm.schema.createSchema()` | `orm.schema.create()` |
| `orm.schema.refreshDatabase()` | `orm.schema.refresh()` |
| `orm.getMigrator()` | `orm.migrator` |
| `checkMigrationNeeded()` · `createMigration()` · `getPendingMigrations()` | `checkSchema()` · `create()` · `getPending()` |

Callers of the provider: `systems/runtime/lifecycle/runtime/population.js:22` · `lifecycle/daemon/population.js:23` · `lifecycle/service/traits/datamap.js:8` (was `commons/lighthouses/multiplayer/server/entities.js:24`, deleted by m76).

**schema verbs outside the boot** — 6 sites, tests and fixtures; every registry rig boots through the scenario.

```
systems/runtime/tests/scenarios/datamap.js:57,73      refreshDatabase   ← assembly + chess rigs
commons/fixtures/data/lighthouse.js:20                refreshDatabase
systems/runtime/tests/virtual.discovery.test.js:48    refreshDatabase
systems/runtime/tests/daemon/symbols-query.test.js:24 refreshDatabase
subsystems/typology/tests/datamap.test.js:27          createSchema
```

**`getAll()` is a `Map`** — `Object.values/entries/keys` of a Map is `[]`: no throw, everything downstream empty (smoke: `getAll() instanceof Map → true`).

```js
// subsystems/typology/prototypes/datamap.js:7
for (const meta of Object.values(orm.getMetadata().getAll())) {
// subsystems/typology/gestalten/shard/datamap.js:291
const all = metadata.getAll();
for (const [name, meta] of Object.entries(all)) {
```

`:7` → `datamap.entities = { em }`, every `daemon.entities.<type>` undefined. `:291` → the strip is `{}`: `/metadata/datamap`, DATASET, DATASINK quietly empty; its key `name` becomes the class → key by `meta.className`. Tests: `virtual.discovery.test.js:55` (`Object.keys`) · `commons/lighthouses/multiplayer/tests/shape.test.js:28` (`Object.values`).

**a string relation target** — throws at discovery (`core/metadata/EntitySchema.js:369`).

```ts
// subsystems/typology/entities/lighthouse/Identity.ts:47
      kind: "embedded",
      entity: "AuthenticatorEmbedEntity",
```

Every multiplayer service (9 mountpoints) and the lighthouse fixture. Also `subsystems/typology/tests/datamap.test.js:21`. Fix `entity: () => AuthenticatorEmbedEntity` (works on 6.6.7 too).

**`repository.entityName` is the class** (smoke: `typeof … entityName → function`).

```ts
// subsystems/typology/entities/base/DataEntity.ts:101
    const col = `\`${this.entityName.charAt(0).toLowerCase()}0\`.traits`;
```

TypeError on every `find`/`findOne` carrying a `traits` filter. `this.getEntityName()` returns the string in 7.2.3 (smoke: `string`).

**a v6 error text asserted verbatim** — `systems/runtime/tests/virtual.discovery.test.js:154` `rejects.toThrow("Torn entity is missing @PrimaryKey()")` — v7's wording UNVERIFIED.

**deps** — `import_map.json:42-44` (6.6.7 ×3) · `deno.jsonc:28` (allow-scripts `npm:sqlite3,npm:better-sqlite3`) · `:80` (deny `npm:sqlite3`) · `:107,:143` (commented copies) · `Dockerfile:51` (`--allow-scripts=npm:sqlite3`; `:12` apk `sqlite` = the CLI, stays) · `deno.lock` 8 entries. No `@mikro-orm/knex` import anywhere live. CI (`.gitlab-ci.yml`, `.github/`): 0 hits.

## SHIFTS — no throw, behaviour moves

- **FK update rules** — 186 m:1 FKs across the 22 dbs carry v6's implied `on update cascade`; unwritten, v7 rebuilds every table with an m:1 at its first boot (probe `smoke/defaults/`: rows kept, `on delete set null` kept). PKs are `v7()` uuids minted once (`DataEntity.ts:152`), so the rule never fires. Lever: `schemaGenerator.defaultUpdateRule: "cascade"` makes that diff empty (`smoke/v7diff.js … compat`). F3.
- **`processOnCreateHooksEarly` true** — `onCreate` runs inside `em.create`: `DataEntity.ts:152,155,160,161` (id · createdAt · updatedAt) · education `Retention.ts:107,113,119` · `commons/fixtures/language-learning/entities/Retention.ts:74`. 96 `create(` sites in 30 files; the ordering law at `systems/runtime/entities/userspace/Buffer.ts:23` (queries first, mint last) is the one to re-read.
- **auto-flush before a query sees only `persist`ed changes** — a managed entity's scalar edit is no longer flushed by a following `find`; sites not greppable, the Buffer invariant above is the known dependent.
- **`metadata.has("Name")` is false** — no live caller (smoke). `get`/`find` by class-name string still resolve through `#classNameMap` (`core/metadata/MetadataStorage.js:87-98`).
- **SQLite migrations gain a real `down()`** (`core/platforms/Platform.js:734`); 0 of 66 on disk have one.

## VERIFIED SAFE

| site | why | evidence |
|---|---|---|
| all 30 imported names | exported by 7.2.3 (`EventSubscriber` is a type in both) | `blast/crosscheck.txt` |
| `Migration` in 66 on-disk migrations | still exported by `@mikro-orm/migrations` | `blast/v7.json` |
| `VirtualEntity.ts:25` `get(Utils.className(…))` · `DataEntity.ts:14` `find(this.entityName)` · `typology/tests/datamap.test.js:36` | string lookup falls back to the className map | smoke · `MetadataStorage.js:97` |
| `attachment/auth.js:26,53` · `gestalten/identity.js:31` `createQueryBuilder("i").where(sql, params).getSingleResult()` | `getSingleResult` kept | `sql/query/QueryBuilder.d.ts:838` |
| `DataEntity.ts:102-103` `raw()` LIKE keys | Symbol keys survive `$and` and spread | smoke `[1]` · `[2]` |
| education `Literal.ts:167` · chess `Literal.ts:208` `orderBy: { [raw("random()")]: "asc" }` | a lone raw key is accepted | smoke |
| education `Literal.ts:319-320` `afterFlush` + `uow.getChangeSets()` | hook names identical | `upstream.md` §1 |
| the four pivots + `Identity_daemons` | names and columns declared on the owners (10-05) | `quests/m78-mikro-7.org` F2 |
| raw SQL naming pivots: dojo `aperture/index.js:36` · education `Literal.ts:338` · `multiplayer/tests/shape.test.js:167` | true by the pin | — |
| `shard/datamap.js:306` `prop.targetMeta?.name` | `EntityMetadata.name` kept | `m7.txt:60` |
| `Cascade.REMOVE` ×4 | on m:n (`Literal.ts:103` · `Symbol.ts:65`) and 1:m (`Mode.ts:93,101`) only — no FK inference moves | sweep |
| datetimes | stored as INTEGER epoch ms (`brazilian` Buffer/Turn) — `forceUtcTimezone: true` is inert | read-only sqlite |
| `allowGlobalContext` (7 test/fixture sites) | key kept | `core/utils/Configuration.js:35` |
| `RequestContext` 22 · filters 44 · subscribers 28 · lifecycle hooks 57 (live hits) | unchanged surfaces | `upstream.md` §1 |
| `nativeUpdate` `lifecycle/mode/resolution.js:22` · `traits/datasink.js:83` | `Mode.installed` is a string column, no json encoding in play | `Mode.ts:79` |

## ON DISK — the 22 dbs

| mountpoint | KiB | Turn·Buffer·Literal·Identity | m:1 upd-cascade | migrations (pragma · down) | executed |
|---|---|---|---|---|---|
| chess · daemon_chess | 11796 | 2·8·4823·- | 17 | 2 (1 · 0) | 2 |
| chess · service_multiplayer | 36 | -·-·-·1 | 0 | 1 (0 · 0) | 1 |
| droneaid · daemon_droneaid | 488 | 27·14·63·- | 13 | 3 (2 · 0) | 3 |
| droneaid · service_multiplayer | 68 | -·-·-·2 | 2 | 2 (0 · 0) | 2 |
| hello-world · daemon_hello | 1228 | 63·9·0·- | 13 | 4 (2 · 0) | 4 |
| hello-world · service_multiplayer | 36 | -·-·-·1 | 0 | 1 (0 · 0) | 1 |
| language-learning · daemon_brazilian | 28656 | 30·273·2223·- | 17 | 20 (20 · 0) | 28 |
| language-learning · daemon_italian | 19484 | 8·3·6583·- | 20 | 1 (0 · 0) | 1 |
| language-learning · daemon_playground | 240 | 0·0·0·- | 10 | 11 (7 · 0) | 11 |
| language-learning · daemon_spanish | 6640 | 2·13·1699·- | 17 | 4 (2 · 0) | 4 |
| language-learning · daemon_standalone | 224 | 0·0·2·- | 11 | 1 (0 · 0) | 1 |
| language-learning · service_multiplayer | 44 | -·-·-·9 | 0 | 3 (0 · 0) | 3 |
| media · daemon_media | 220 | 0·1·5·- | 13 | 1 (0 · 0) | 1 |
| media · service_multiplayer | 36 | -·-·-·1 | 0 | 1 (0 · 0) | 1 |
| playground · daemon_playground | 232 | 31·1·0·- | 13 | 1 (0 · 0) | 1 |
| playground · service_multiplayer | 36 | -·-·-·1 | 0 | 1 (0 · 0) | 1 |
| strata · daemon_strata | 680 | 0·4·151·- | 15 | 1 (0 · 0) | 1 |
| strata · service_multiplayer | 68 | -·-·-·1 | 2 | 1 (0 · 0) | 1 |
| stucatch · daemon_stucatch | 472 | 0·2·283·- | 10 | 3 (2 · 0) | 3 |
| stucatch · service_multiplayer | 36 | -·-·-·1 | 0 | 1 (0 · 0) | 1 |
| vivalence · daemon_vcompany | 480 | 64·14·83·- | 13 | 2 (0 · 0) | 2 |
| vivalence · service_multiplayer | 36 | -·-·-·2 | 0 | 1 (0 · 0) | 1 |

Every db has one `.snapshot-*.json`. `daemon_brazilian` logs 28 executed against 20 files (+3 in `migrations/bak/`) — v7 reads the history by name, so the missing five are history only. `Identity_daemons` exists in droneaid and strata only (m76 crossed there). Prod (two hosts) is NOT in this map — `pull-prod-mountpoint` before its crossing.

## DOCS

`documentation/content/30-39_guides/31_guides/31.02_instance-from-scratch.mdx:36` imports `EntitySchema, types` (valid in v7) · `:87` prose · `README.md:30` "any database supported by MikroORM" · `subsystems/typology/readme.org:42` prose. No `*.example.js` imports mikro, so `capture` is untouched.

## OUT OF THE LIVE RADIUS

- `testament/m76-probe/**` — 23 gitignored copies of entity + datamap files carrying the v6 words (schema verbs ×2, `getAll()` ×2): they break on v7 and are scratch.
- 49 dead files (`bak/`, `*.bak.*`), incl. `education/domain/aperture/bak.pick/` (the only `qb.execute("all")`, `_SymbolToLiteral`) and `systems/ghost/bak/localhost/` migration copies.
- `systems/anima/build/**` · `.vite/deps/**` matched `onCreate`/`expression` as unrelated words (echarts, minified chunks).

## UNKNOWNS — what no grep can answer

1. the real entity set has never been DISCOVERED by 7.2.3 — `validate` and `strict` are always on; `Process` (`type:"any"` · `persist:false` · `hidden` · `getter`), the virtual trick, `Daemon`/`Service` `extends: ProcessSchema` (non-abstract parent), enum arrays with `items: () => …` are untried. The quest's "dry diff" milestone measures it.
2. v7's text for the missing-PK error (`virtual.discovery.test.js:154`).
3. auto-flush dependents beyond `Buffer.ts:23`.
4. the prod volume's schema.

## CORRECTIONS to `census.md` / the quest

- a string `metadata.get("Name")` / `find("Name")` still resolves in 7.2.3 — only `has()` and `getAll()` changed.
- the lighthouse query builders moved: `commons/lighthouses/multiplayer/attachment/auth.js:26,53` · `gestalten/identity.js:31`; the service boots through `systems/runtime/lifecycle/service/traits/datamap.js:8`.
- the strip walk is at `shard/datamap.js:291` (was `:274`).
- 22 dbs, not 20 (strata's pair joined).
- `forceUtcTimezone` is inert: dates are INTEGER epoch ms on disk.
