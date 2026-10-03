# mikro-orm 7 — what it adds over 6.6.7, for this tree — 2026-10-05

Agent report (opus, general-purpose), asked by beef /"what capabilities does v7 offer?"/. Sources: the 7.2.3 tarball's `CHANGELOG.md:840-977` and `docs/blog/` (our `changelog-7x.txt` STOPS at 7.0.1, line 544 — the 7.0.0 section, where most features live, is missing from the copy), `upstream.md`, and the 7.2.3 sources (`core/` · `sql/` · `sqlite/` · `migrations/` = `@mikro-orm/<pkg>/7.2.3/`). UNVERIFIED = not found in source. Verdicts: USE NOW · LATER · IRRELEVANT.

## the ones that matter here

1. slow-query logging — `slowQueryThreshold` · `slowQueryLoggerFactory`, warns under `slow-query` with `debug` off. 7.0.0 #7271 · `core/utils/Configuration.d.ts:749` · `core/connections/Connection.js:231`. USE NOW — one key in `config` (`commons/datamaps/libsql/libsql.viva.js:14`), no schema effect.
2. SQLite down migrations — generated migrations carry a real `down()`. 7.0.0 bd3bb56 · `core/platforms/Platform.js:734` true (v6 `BaseSqlitePlatform.js:81` false). USE NOW (automatic) — every boot-created migration gains a rollback, the first v7 rebuild included.
3. FK rule defaults — `schemaGenerator.defaultUpdateRule` · `defaultDeleteRule`. 7.0.0 #7115 · `core/utils/Configuration.d.ts:880`. The lever on the first v7 diff (`upstream.md` §6.1, `smoke/v7diff.js … compat`).
4. migrator `logMigration(name)` · `unlogMigration(name)` · `rollup(names?)` from code. 7.1.0 #7347 #7468 · `core/utils/AbstractMigrator.d.ts:81,92,96`. LATER — the repair tool for a half-applied migration under `transactional: false`; rollup could fold brazilian's history into one file.
5. `getNativeClient()` → the better-sqlite3 `Database`. 7.2.0 #8148 · `sqlite/SqliteConnection.d.ts:13`. LATER — `.pragma()` · `.backup()` · `.function()`.
6. named parameters in `execute` — `:name` values, `:name:` identifiers. 7.2.0 #8173 · `sql/AbstractSqlConnection.js:246-248`. LATER — dojo `aperture/index.js:85` splices table/column names into SQL.
7. `em.countBy` / `repo.countBy`, `Collection.loadCount({ dataloader: true })`. 7.1.0 #7372 #7373 · `core/EntityManager.d.ts:516`. LATER — the dojo tally counts over a pivot; m:n `loadCount` per-parent fallback UNVERIFIED.
8. `populateHints` — per-relation `strategy` · `joinType` · per-parent `limit`/`offset`/`orderBy`. 7.0.0 #7198 · 7.1.0 #7370 · `core/typings.d.ts:1577-1586`. LATER — a per-query `select-in`.

## query API

- `$size` on to-many (`{ intents: { $size: 0 } }`) — 7.0.0 #7090 · `sql/query/ObjectCriteriaNode.js:64-72`. LATER.
- `$all` on collections — 7.2.0 #8248. LATER.
- `$elemMatch` on JSON arrays of objects (`json_each`) — 7.0.0 #7265 · `sql/dialects/sqlite/SqlitePlatform.js:148`. IRRELEVANT for `traits` (string arrays); `$contains`/`$overlap` stay PostgreSQL-only, so `DataEntity.ts:101-103`'s LIKE stays.
- CTEs `qb.with()` / `withRecursive()` — 7.0.0 #7231 · `sql/query/QueryBuilder.d.ts:902,923`. LATER — Turn/Thread `parent` chains in one query.
- `unionWhere` · `qb.union()` / `unionAll()` — 7.0.0 #7214. LATER.
- `em.stream()` — 7.0.0 #6923; `chunkSize` ignored on SQLite. LATER.
- typed `em.getKysely()` bound to the transaction, `tableNamingStrategy: 'entity'` · `columnNamingStrategy: 'property'` — 7.0.0 #6998 · 7.1.0 #7701. LATER — would retire hard-coded pivot names in raw SQL.
- IRRELEVANT: AbortSignal cancellation (SQLite ignores, UNVERIFIED) · `em.clone()` · `em.map(…, { disableIdentityMap })`.

## entity definition (all via `EntitySchema`)

- entity-level `orderBy` — 7.0.0 #7133. LATER — `TurnRepository.history` hard-codes `createdAt ASC` (`Turn.ts:9`).
- `through` — a read-only to-one picked by subquery. 7.2.0 #8239. LATER — "latest turn of a thread".
- `targetKey` (FK to a non-PK column) · `StringType({ trim, case })` · column `collation` · scalar `array: true`. LATER.
- TPT (`inheritance: 'tpt'`, opt-in — `Daemon`/`Service` `extends: ProcessSchema` unaffected) · polymorphic relations · `EntitySchema.new`. IRRELEVANT.

## schema / SQLite

- `triggers` — 7.1.0 #7379 · `sql/dialects/sqlite/SqliteSchemaHelper.js:566`. LATER.
- view entities (`view: true` + `expression` → `create view`) — 7.0.0 #7116. LATER; the virtual-entity trick stays separate.
- partial indexes / uniques (`where`) — 7.1.0 #7593. LATER.
- `attachDatabases: [{ name, path }]` — SQLite `ATTACH`. 7.0.0 #7131 · `sql/dialects/sqlite/BaseSqliteConnection.js:9-14`. LATER — joins across daemon files.
- routines — SQLite JS UDFs (`bodyJs`, experimental). 7.1.0 #7693. LATER.
- `index` on m:n · `snapshotOnMigrate`. IRRELEVANT.

## runtime

- `await using orm` — 7.2.0 #8159. LATER — test rigs.
- `RequestContext.create` takes fork options (`flushMode` · `signal` · `freshEventManager`) — 7.1.5 #7920 · 7.2.0 #7925. LATER — `Datamap.shard.scope` (`typology/prototypes/datamap.js:11`).
- `loadStrategy` defaults to `balanced` (`core/utils/Configuration.js:44`) — our explicit key at `libsql.viva.js:16` becomes redundant.
- IRRELEVANT: `onReserveConnection` (ignored on SQLite) · node:sqlite / sql.js / JSR (the driver is ruled: better-sqlite3).
- listed new but not new: `onConflictWhere` (6.6.7 has it, `IDatabaseDriver.d.ts:179`).
