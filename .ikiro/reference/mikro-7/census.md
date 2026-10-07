# mikro-orm touchpoints in vivalence — census 2026-10-02

m80 landed 10-08 over this census: the runtime entities are flat in `systems/runtime/entities/`, `assemble.js` is `gestalten/belt/assemble.js` (`seal` dead), education's and chess's `domain/entities/` are dead; daemons borrow the runtime's datamap, no provider call each. m81 landed 10-10: `lifecycle/mode/traits/` is `systems/runtime/traits/`, the daemon's prune is `gestalten/belt/host.js`, `lifecycle/daemon/aperture/metadata.js` is `lifecycle/host/aperture/metadata.js`. The rows below read the 10-02 tree; m78 re-measures before it lands.

Agent report (opus, Explore), re-flowed. 55 files import `@mikro-orm/*` (38 repo, 17 registry). The agent read v7.0.2 from the Deno cache (`~/Library/Caches/deno/npm/registry.npmjs.org/@mikro-orm/*/7.0.2`); the session re-checked its load-bearing claims against 7.2.3 (notes marked `[7.2.3]`).

Shorthand: `REPO/` = the checkout · `REG/` = `~/.viva/registry/` · `C7/` = the 7.0.2 cache. Excluded: `node_modules`, `.ikiro`, `testament`, `docs`, `bak/`, `*.bak.*`, `REG/education/topologies/sentence/topography.bak/`, `REG/education/domain/aperture/bak.pick/` (the only knex-style `qb.execute("all")` + `_SymbolToLiteral`, dead).

## 1. imports

| symbol | files | where |
|---|---|---|
| `EntitySchema` | 35 (+1 sqlite) | every entity file, both `assemble.js`, `concretes.ts`, `tests/scenarios/datamap.js`, `virtual.discovery.test.js`, `REG/{assembly,chess}/tests/rig.js` |
| `types` | 29 | `string` 41 · `json` 35 · `integer` 6 · `datetime` 5 · `float` 2 |
| `Opt` / `Rel` | 25 / 17 | entity files (type-only) |
| `EntityRepositoryType` | 15 | runtime Literal/Symbol/Activity/Buffer/Intent/Turn + 9 registry |
| `Collection` | 14 | entity files (`Identity.ts` imports, never uses) |
| `RequestContext` | 9 | production: `typology/prototypes/datamap.js:1`; rest tests/scenarios + `REG/education/domain/tests/userspace/scoping.test.js` |
| `MikroORM` | 5 core + 2 sqlite | `commons/fixtures/data/lighthouse.js`, `tests/scenarios/datamap.js`, `tests/topography/harness.js`, `tests/daemon/symbols-query.test.js`, `virtual.discovery.test.js` |
| `EntityRepository` · `BaseEntity` | 3 each | `DataEntity.ts:1`, `VirtualEntity.ts:1`, `virtual.discovery.test.js:5` |
| `raw` | 3 | `DataEntity.ts:1`, `REG/education/domain/entities/kernel/Literal.ts:7`, `REG/chess/domain/entities/kernel/Literal.ts:1` |
| `wrap` | 3 | `entities/index.ts:1`, `Activity.ts:1`, `lifecycle/mode/population.js:1` |
| `EventSubscriber` · `EventArgs` | 3 each | runtime `Literal.ts:3`, `Buffer.ts:2`, education `Literal.ts:5,13` |
| `Cascade` | 3 | runtime Literal / Symbol / Mode |
| `EventType` | 2 | `VirtualEntity.ts:1`, `virtual.discovery.test.js` |
| `Utils` · `EntityManager` · `EntityMetadata` · `EntityName` · `EntitySchemaMetadata` | 1 each | `VirtualEntity.ts:1` |
| `defineEntity` | 1 | `typology/entities/base/properties.js:3` (never imported) |
| `helper` | 1 | re-export only, no live caller |
| `ChangeSetType` (unused) · `FlushEventArgs` | 1 each | education `Literal.ts:6,14` |

Packages: `@mikro-orm/core` 53 files · `@mikro-orm/sqlite` 2 (`REPO/commons/datamaps/libsql/libsql.viva.js:1` `defineConfig, MikroORM`; `REPO/subsystems/typology/tests/datamap.test.js:2`) · `@mikro-orm/migrations` 1 source (`libsql.viva.js:2` `Migrator`) + all 63 generated migration files (`Migration`). Re-export hub: `REPO/systems/runtime/entities/index.ts:1` `export { wrap, helper } from "@mikro-orm/core"`, consumed only by `REPO/commons/lighthouses/multiplayer/server/auth.js:2`. All still exported by v7 core.

## 2. config and boot

**`REPO/commons/datamaps/libsql/libsql.viva.js`** — the single real boot path.
- `config` (:11-24): `dbName: seat ?? ":memory:"` · `loadStrategy: "balanced"` · `contextName` (`statics.context.name` or `statics.db.file`) · when a db file exists: `extensions: [Migrator]`, `migrations: { tableName: "_mikro_migrations", path: <mountpoint>/migrations, transactional: false }` · `...options` (entities, subscribers, dbName).
- `provider` (:26-35): `MikroORM.init`; `:memory:` → `orm.schema.createSchema()` (:28); else `orm.getMigrator()` (:30) → `checkMigrationNeeded()` → `createMigration()` (:31) → `getPendingMigrations()` → `up()` (:32); → `new Datamap(orm)`.
- never set: debug, global filters, namingStrategy, forceUtcTimezone, discovery, migrations.emit/snapshot.

Callers of `provider`: `REPO/systems/runtime/lifecycle/runtime/population.js:22` (the runtime's own `:memory:` datamap: Process/Service/Daemon virtual entities) · `REPO/systems/runtime/lifecycle/daemon/population.js:23` (every daemon, subscribers constructed) · `REPO/commons/lighthouses/multiplayer/server/entities.js:24` (Identity, Daemon, AuthenticatorEmbed).

Direct `MikroORM.init`: `typology/tests/datamap.test.js:26` (+ `createSchema()` :27) · `tests/scenarios/datamap.js:52,68` (`refreshDatabase()` :57,:73 — the registry rigs boot through this) · `commons/fixtures/data/lighthouse.js:14` (`refreshDatabase()` :19) · `tests/daemon/symbols-query.test.js:20` (:24) · `tests/topography/harness.js:60` (read-only) · `virtual.discovery.test.js:44` (:48, :143). `getCreateSchemaSQL`: `virtual.test.js:55`, `virtual.discovery.test.js:73,180`.

`allowGlobalContext: true` (7 sites, none production): `virtual.discovery.test.js:46,143` · `scenarios/datamap.js:54,70` · `symbols-query.test.js:22` · `topography/harness.js:66` · `commons/fixtures/data/lighthouse.js:16`.

`Datamap` prototype: `REPO/subsystems/typology/prototypes/datamap.js:4-35`.

## 3. entity definitions

Base classes:
- `DataSchema` (`REPO/subsystems/typology/entities/base/DataEntity.ts:147`): abstract, `repository: () => DataRepository`; `id` string PK `onCreate: () => v7()`; `createdAt`/`updatedAt` datetimes with `onCreate`/`onUpdate` + `defaultRaw: CURRENT_TIMESTAMP`.
- `VirtualEntity.ts`: abstract `base` schema (:89), `id` not a PK; `VirtualSchema` (:97-105) forces `extends: base`, `repository: () => VirtualRepository`, `expression: () => { throw … }`.

| entity | defined at | notable |
|---|---|---|
| AuthenticatorEmbed | `typology/entities/lighthouse/Identity.ts:16` | `embeddable` |
| Identity | `Identity.ts:31` | `kind:"embedded", entity: "AuthenticatorEmbedEntity"` — a STRING (:38-43); `object: true`; `slug` unique |
| Daemon (lighthouse) | `lighthouse/Daemon.ts:15` | `DaemonRepository`; `slug` unique |
| Literal (runtime) | `systems/runtime/entities/kernel/Literal.ts:79` | ABSTRACT, no class; uniques `[slug, mode]`; enum array json; m:n `symbols` (`mappedBy` fn, `Cascade.REMOVE`); m:1 `mode` (`inversedBy` fn); self m:n `uses` (`inversedBy:"in"`) / `in` (`mappedBy:"uses"`) |
| Symbol (runtime) | `kernel/Symbol.ts:35` | abstract, no class; uniques; m:n `literals` OWNER (`inversedBy` fn, `Cascade.REMOVE`); m:1 `mode` |
| Mode | `kernel/Mode.ts:67` | uniques `[slug, type]`; enum array without type; 1:m `intents`/`buffers` `Cascade.REMOVE` + `orphanRemoval` |
| User | `kernel/User.ts:20` | `name:"user"`; enum array `columnType:"json"` |
| Intent | `userspace/Intent.ts:33` | uniques `[user, slug, mode]`; `filters.user`; m:1 `fieldName` + update/delete cascade; `eager: true` |
| Buffer (runtime) | `userspace/Buffer.ts:53` | abstract; `filters.user` cond `{thread:{user}}`; m:n `literals`/`symbols` `owner: true` |
| Thread | `userspace/Thread.ts:60` | `filters.user`; `hooks.beforeCreate:[fn]` (:71); self m:1 `parent` `deleteRule: cascade` |
| Turn | `userspace/Turn.ts:54` | `filters.user` `{thread:{user}}` (10-02); self m:1 `parent` no rule; `mode` required + cascade (10-02) |
| Activity | `transient/Activity.ts:86` | `VirtualSchema`; five m:1; enum `items: () => Object.keys(...)` |
| Process | `transient/Process.ts:60` | `VirtualSchema`; `type:"any"` + `persist:false` + `hidden` (:66-68); `getter:true` (:69) |
| Daemon / Service | `runtime/prototypes/daemon.js:42`, `service.js:10` | `VirtualSchema` `extends: ProcessSchema`, a NON-abstract parent |
| seal() concretes | `runtime/entities/assemble.js:18-30`, `commons/fixtures/data/assemble.js:21`, `REG/assembly/tests/rig.js:37`, `REG/chess/tests/rig.js:38` | `new EntitySchema({class, extends: abstract, name/tableName: meta.className, repository})` |
| Education Literal | `REG/education/domain/entities/kernel/Literal.ts:251` | redeclares `uses` with `orderBy:{strength}` (:272); `strength` formula + `persist:false` + `lazy` (:279); 1:m `retentions` `strategy:"select-in"` (:294) |
| Education Retention | `REG/education/domain/entities/userspace/Retention.ts:72` | uniques; `filters.user`; enum + `onCreate` + `defaultRaw`; formula `lastSignal` (:124); lazy formula `strength` (:132); `type: Date` (:147-148) |
| others | education Symbol `:19`, Buffer `:6`, Trace `:21`; assembly Literal `:776` / Symbol `:8`; vcompany Literal `:54` / Symbol `:10`; stucatch Literal `:30`; chess Literal `:240` / Symbol `:8` / Trace `:20`; `commons/fixtures/language-learning/entities/{Retention:40, Trace:24}` (live via `fixtures/data/tiers.js:2`) | — |

Feature counts (live, tests included): abstract 6 · extends 39 · embeddable 2 / `kind:"embedded"` 2 · filters 9 · hooks 5 · uniques 5 · indexes 0 · formula 3 · lazy 2 · `enum: true` 22 (14 `array: true`) · defaultRaw 33 · onCreate 7 / onUpdate 1 · `persist: false` 7 · `getter: true` 1 · `hidden: true` 4 · expression 5 · cascade 4 · orphanRemoval 2 · updateRule 19 / deleteRule 21 · `mappedBy` fn 17 / string 2 · `inversedBy` fn 3 / string 2 · **`pivotTable` 0** · eager 1 · fieldName 35 · columnType 2 · `owner: true` 3 · discriminator 0 · 1:1 0 · m:n 7 · 1:m 17 · m:1 40.

Dead files (imported nowhere): `kernel/Issue.ts`, `kernel/Constraint.ts`, `base/properties.js`, `REG/education/.../Todoliteral.ts`.

## 4. EntityManager and repository API

Custom repositories on core `EntityRepository`: `DataRepository` (`DataEntity.ts:11`: `unique` · `ensure` · `updateOne` · `update` · `removeOne` · `remove` · `find`/`findOne` overrides · `resolveTraits` · `findByIdentifiers`); `VirtualRepository` (`VirtualEntity.ts:19`); subclasses Daemon · Literal · Symbol · Mode · Intent · Buffer · Turn · Activity · Process + 5 registry Literal repos + vcompany Symbol.

`em.fork()` production: `lifecycle/mode/traits/harnessed.js:109`, `intented.js:20`, `dataset.js:38`; registry `vcompany/modes/office/vdex/boot.js:15`, `media/modes/editor/media/boot.js:12`, `stucatch/vivaware/domain/ingress.js:81,93`.

Filter params: `setFilterParams` `typology/prototypes/datamap.js:14`, `intented.js:5`; `getFilterParams` `typology/gestalten/shard/datamap.js:185`, `REG/education/.../Literal.ts:58` (via `getEntityManager().getContext()`); `filters: false` `daemon/integration.js:28` + three assembly harnesses (editor guide :145, editor assembly :67, player guide :76).

`nativeUpdate`: `lifecycle/mode/resolution.js:22`, `lifecycle/mode/traits/datasink.js:83` (+ `tests/daemon/enroll.test.js:40`). `em.refresh`: `REG/education/modes/games/dojo/aperture/index.js:86`. `upsert`/`ensure`: `shard/datamap.js:132,142` forwards `onConflict*` (unchanged in v7); `ensure` callers `mode/population.js:26`, `intented.js:7`.

`populate`: dotted `["retentions","retentions.strength"]` (aprende `drill.js:46`, riddler `emitter.js:54`, survival `buildup.js:70`), `["strength","literal"]` (aprende `board.js:29`), `["uses.retentions", …]` (clinic `conjugations.js:17`, survival `exercise.js:23`, dojo `set/resolve.js:10`). `fields` with `card` projections ~10 places. `exclude` only in the `ALLOWED` allowlist (`shard/datamap.js:36`).

`orderBy`: `Turn.ts:9`; education `Literal.ts:90` and `:112` (`{retentions:{strength:"ASC"}}`); `raw("random()")` keys below; `gestalten/skills/entity.js:140`.

Every raw SQL string:
1. `REG/education/domain/entities/kernel/Literal.ts:332-336` in `afterFlush`: `INSERT OR IGNORE INTO literal_uses (literal_entity_1_id, literal_entity_2_id) VALUES ${rows}` (string-interpolated).
2. `REG/education/modes/games/dojo/aperture/index.js:33-37`: `SELECT symbol_entity_id AS symbol, count(*) AS literals FROM symbol_literals GROUP BY symbol_entity_id`.
3. same file `:82-86`: `update ${meta.tableName} set ${fieldNames[0]} = ? where …` + `em.refresh(buffer)`.
4. tests: `scoping.test.js:106,114` (count subselects); `literal.test.js:200,207` (`sqlite_master`, `pragma foreign_key_check`); `REPO/systems/runtime/tests/repository.populate.test.js:11-18` monkeypatches `connection.execute(query, params, method)`.

`raw()` fragments: `DataEntity.ts:101-103` as object keys `` `${this.entityName.charAt(0).toLowerCase()}0`.traits LIKE ? ``; `orderBy: {[raw("random()")]: "asc"}` education `Literal.ts:167`, chess `Literal.ts:208`. Formula SQL: education `Literal.ts:282-288`; `Retention.ts:126-127`, `:134-140` (retention drivers `retention/bayesian.js:93`, `boolean.js:46`, `counter.js:52`).

QueryBuilder: `REPO/commons/lighthouses/multiplayer/server/auth.js:47-52` and `identity.js:13-19` — `createQueryBuilder("i").where("json_extract(i.authentication, '$.credentials.username') = ?", [u]).getSingleResult()`. No live `getKnex` / `knex.raw` / `qb.raw`.

## 5. metadata walking

Production: `typology/prototypes/datamap.js:7-9` `Object.values(orm.getMetadata().getAll())`, skipping `abstract` · `pivotTable` · `embeddable`; keys by `meta.className.toLowerCase().replace("entity","")`; `getRepository(meta.class)` · `typology/gestalten/shard/datamap.js:272-299` (the strip): `Object.entries(metadata.getAll())`, `meta.properties`, `prop.kind` (`"scalar"`/`"embedded"`), `primary`/`onCreate`/`onUpdate`/`nullable`/`persist`, `prop.targetMeta?.name`, `mappedBy`, `owner`, `type` · `lifecycle/mode/traits/dataset.js:37` (strip), `:80` (`.properties.mode?.kind === "m:1"`), `:163-165` (`kind !== "m:n"`) · `lifecycle/mode/traits/datasink.js:12` · `lifecycle/daemon/aperture/metadata.js:10`, `daemon/aperture/datamap.js:4` (strip) · `gestalten/skills/entity.js:78-83` · `DataEntity.ts:14` (`find(this.entityName)?.uniques`) · `VirtualEntity.ts:25,33-34` (`meta.props`, `meta.relations`) · `assemble.js:19,26-27` (`schema.meta.abstract`, `meta.className`) · dojo `aperture/index.js:82-84` (`meta.tableName`, `properties[x].fieldNames[0]`).

Client: `typology/prototypes/entity-manager.js:83,86,165,168,178` reads the strip's `kind` strings `"m:1"`/`"1:m"`/`"m:n"` — unchanged in v7. Not used: `ReferenceKind`, `meta.virtual` (tests), `meta.root`, `discriminator`.

## 6. events and subscribers

`EventSubscriber` classes: runtime `LiteralSubscriber` (`kernel/Literal.ts:124`, before Create/Update) · `BufferSubscriber` (`userspace/Buffer.ts:114`, async `beforeCreate` calling `em.findOne`) · education `LiteralSubscriber` (`Literal.ts:303`, before Create/Update + `afterFlush({em, uow})` → `uow.getChangeSets()` → the raw INSERT). Generic: `typology/gestalten/shape/subscriber.js:3-22` (`getSubscribedEntities` → `[]`, handles after/before create/update/delete via `args.meta?.className`), registered through `Datamap.registerSubscriber` (`prototypes/datamap.js:28`) from `runtime/population.js:30` and `daemon/population.js:30`. Schema hooks: `Thread.ts:71` (fn); `beforeDelete:["teardown"]` (string method) `scenarios/virtual.js:18`, `virtual.discovery.test.js:34,138`. Manual dispatch: `VirtualEntity.ts:26-29,56-77` `getEventManager().dispatchEvent(EventType.*, {entity, em, meta}, meta)`. `getUnitOfWork().getIdentityMap()` only `virtual.discovery.test.js:119`. Unused: `trait.js:23` `composeSubscriber`.

## 7. serialization and helpers

`wrap(entity).toPOJO()` `lifecycle/mode/population.js:28`; `wrap(this).toObject()` `Activity.ts:80`; `wrap(identity).assign()` `auth.js:70,114,145,213`. `entity.assign()` ~20 places; `toJSON()` `shard/datamap.js:179`; `em.getReference` `harnessed.js:111`. Collection in production: `getItems` 30 · `add` 17 · `isInitialized` 16 · `init()` 11 · `removeAll` 7 · `set` 6 · `remove` 2 · `contains` 2; internal `removeWithoutPropagation` optionally at `REG/assembly/.../Literal.ts:610`. Not used: `Reference`, `ref()`, `serialize()`, `helper()`.

## 8. migrations on disk (`~/.viva/instances`)

66 `Migration*.ts` (all TS); 63 live, 3 in `language-learning/.../daemon_brazilian/migrations/bak/`. By mountpoint: brazilian 20 · playground (language-learning) 11 · spanish 4 · hello 4 · droneaid 3 · stucatch 3 · language-learning multiplayer 3 · chess 2 · vcompany 2 · 1 each for the other 10. All import `{ Migration } from '@mikro-orm/migrations'`; 36 contain `PRAGMA`. 20 `.snapshot-<db>.json` (one per mountpoint), keys `namespaces` · `tables` · `nativeEnums`.

Example head (`daemon_italian/migrations/Migration20260919114551.ts`):
```ts
import { Migration } from '@mikro-orm/migrations';
export class Migration20260919114551 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table \`Mode\` (\`id\` text not null, …`);
```

Pivot names in the live snapshots: `literal_uses(literal_entity_1_id, literal_entity_2_id)` · `symbol_literals(symbol_entity_id, literal_entity_id)` · `buffer_literals` · `buffer_symbols` (`buffer_entity_id, …`). `_mikro_migrations` row: `1|Migration20260919114551|2026-09-19 11:45:51`; v7 storage strips `.ts`/`.js` the same way and names the snapshot the same — history and snapshots compatible.

## 9. Deno-specific

None of `createRequire`, reflect-metadata, ts-morph, `@Entity`. sqlite drivers: `REPO/deno.jsonc:2` `nodeModulesDir: auto`; `dependencies` task (:28) `--allow-scripts=npm:sqlite3,npm:better-sqlite3,…`; `allowScripts.deny` (:80) lists `npm:sqlite3`; `REPO/Dockerfile:51` allows install scripts for ONLY `npm:sqlite3`; `deno.lock:79-81` resolves 6.6.7 with `better-sqlite3@12.8.0`. Local: `node_modules/.deno` has `sqlite3@5.1.7` built + `knex@3.1.0`; `better-sqlite3@12.8.0` present, native binding NOT built. `import_map.json:46` maps `@libsql/client`, which mikro does not use — the "libsql" datamap runs on `@mikro-orm/sqlite`. Deno 2.9.6.

## what breaks under v7, most dangerous first

1. **m:n link tables renamed, and boot applies the migration automatically.** `[7.2.3]` `core/metadata/MetadataDiscovery.js:505` `prop.pivotTable = joinTableName(meta.className, meta2.tableName, prop.name, meta.tableName)`; `UnderscoreNamingStrategy.js:5` `classToTableName(entityName, tableName) { return tableName ?? this.underscore(entityName) }` — an explicit `tableName` is used RAW. Every entity sets `tableName: "Literal"` etc. Renames: `symbol_literals` → `Symbol_literals` · `buffer_literals` → `Buffer_literals` · `buffer_symbols` → `Buffer_symbols` · `literal_uses` → `Literal_uses`; join columns stay (`[7.2.3]` 7.0.7 #7430 reverted them to className, `MetadataDiscovery.js:531`) EXCEPT the self-ref m:n: `MetadataDiscovery.js:792` `baseName = isExplicitTableName(meta) ? meta.tableName : meta.className` → `literal_entity_1_id` → `Literal_1_id`-shape (`joinKeyColumnName(baseName + '_1', …)` = `Literal_1_id`). v7's comparator matches table names case-sensitively (`sql/schema/DatabaseSchema.js:40`) → drop + create per pivot while SQLite treats `literal_uses`/`Literal_uses` as the same table. `libsql.viva.js:31-32` creates and applies on boot → under `--watch` live on all 20 dbs. Also breaks the two hardcoded pivot names (education `Literal.ts:335`, dojo `aperture/index.js:36`). Owners to pin: `kernel/Symbol.ts:58` · `kernel/Literal.ts:111` · `userspace/Buffer.ts:100,106` · education `Literal.ts:272`. Fix: explicit `pivotTable` / `joinColumns` / `inverseJoinColumns`, or a naming strategy ignoring the 4th argument.
2. **migrator API renamed** (`libsql.viva.js:30-32`): no `getMigrator()`; `orm.migrator` getter; `checkSchema()` · `create()` · `getPending()` · `up()`. Every file-backed daemon and service fails to boot.
3. **schema-generator methods renamed, no aliases** (`createSchema` → `create`, `refreshDatabase` → `refresh`): `libsql.viva.js:28` is the runtime's own `:memory:` process datamap → **the runtime itself cannot start**; `scenarios/datamap.js:57,73` breaks every runtime rig + both registry rigs; also `commons/fixtures/data/lighthouse.js:19`, `symbols-query.test.js:24`, `virtual.discovery.test.js:48`, `typology/tests/datamap.test.js:27`.
4. **`getAll()` returns a `Map` keyed by class** (`[7.2.3]` `core/metadata/MetadataStorage.js:65`). Silent: `prototypes/datamap.js:7` `Object.values(...)` → nothing, `datamap.entities` = `{ em }`, every `daemon.entities.<type>` undefined; `shard/datamap.js:274` `Object.entries(all)` → strip `{}`, `/metadata/datamap`, DATASET, DATASINK quietly empty; `virtual.discovery.test.js:55`.
5. **string `entity` on an embedded property throws** (`Identity.ts:40` `entity: "AuthenticatorEmbedEntity"`; `[7.2.3]` `core/metadata/EntitySchema.js:369` "Relation target needs to be an entity class or EntitySchema instance, string … given"). The multiplayer lighthouse (7 mountpoints) and its fixtures cannot boot. Same in `typology/tests/datamap.test.js:21`. Fix `entity: () => AuthenticatorEmbedEntity`.
6. **`this.entityName.charAt(0)` throws in `DataRepository.resolveTraits` (`DataEntity.ts:101`)** — v7 `getRepository` hands the repository the CLASS (`[7.2.3]` `core/EntityManager.js:98-105` `new RepositoryClass(this, entityName)` where `entityName` is what `getRepository(meta.class)` passed); any `find`/`findOne` with a `traits` filter raises a TypeError. Fix `Utils.className(this.entityName)`. Also `raw()` keys become Symbols (`core/utils/RawQueryFragment.js:24`) — survive spread, not `Object.entries`/JSON; the `l0`/`s0` alias guess still matches v7.
7. **raw SQL through the connection** — `execute(string, params, method)` unchanged (`sql/AbstractSqlConnection.d.ts:86`), but two of three hardcode the pivot names from item 1.
8. **driver swap to better-sqlite3** — v7 `@mikro-orm/sqlite` drops knex + node-sqlite3 for kysely + better-sqlite3 (statically imported `SqliteConnection.js:3`); local binding not built; `Dockerfile:51` does not allow its install scripts (v7 pins 13.0.3 with PREBUILT binaries, no install script). v7 gets `AsyncLocalStorage` via `process.getBuiltinModule('node:async_hooks')` and throws if missing (`core/utils/AsyncContext.js:1-8`) — the upstream smoke on Deno 2.9.6 passed, so it is provided.
9. `createQueryBuilder` with a raw `where` (`auth.js:48`, `identity.js:14`) — `where(string, params)` + `getSingleResult()` still exist; default repository still `SqlEntityRepository`. Low risk.
10. **virtual-entity `expression` trick holds** — `virtual = !!expression && !view` (`core/typings.js:181`); validator allows a virtual with m:1 and no PK (`MetadataValidator.js:28-47`); `extends:` copies neither `expression` nor `repository` (`MetadataDiscovery.js:1006-1046`). To verify: Daemon/Service `extends: ProcessSchema` (non-abstract) against v7's TPT inheritance detection; `virtual.discovery.test.js:155` asserts a v6 error message text.
11. `RequestContext.storage.run` (`prototypes/datamap.js:19`, `scenarios/datamap.js:43`) — still a static at runtime (TS-private only); fine.
12. **default flips** — `processOnCreateHooksEarly` true: ids/timestamps set at `em.create`, not flush; `BufferRepository.create` (`Buffer.ts:23-34`) depends on create/flush ordering. `forceUtcTimezone` true: `CURRENT_TIMESTAMP` rows read as UTC.
13. verified unchanged: subscriber matching by class name, `afterFlush`/`getChangeSets`; formula callbacks `(columns, table)` but `toString()` still the alias; error class names in `shard/datamap.js:64-73`; Collection methods; `wrap().toPOJO`/`toObject`/`assign`; `defineEntity.properties`.
