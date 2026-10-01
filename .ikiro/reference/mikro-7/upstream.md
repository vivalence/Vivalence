# mikro-orm v6 → v7, upstream — researched 2026-10-02

Agent report (opus), lightly re-flowed; every claim carries its URL or `file:line` inside the unpacked 7.2.3 packages (see README). Versions at the time: `latest` = 7.2.3 (2026-09-30), `latest-v6` = 6.6.17, `next-v7` = 7.3.0-dev.14. `gh` was absent; the GitHub REST API was read unauthenticated (dumps in `issues/`). Smoke tests ran under Deno 2.9.6.

## 1. the official upgrade guide

https://mikro-orm.io/docs/upgrading-v6-to-v7 — 65 sections; matches `docs/docs/upgrading-v6-to-v7.md` at tag v7.2.3.

### runtime and packaging
- "MikroORM v7 is a native ESM package now".
- Node 22.17+ (`engines: ">= 22.17.0"`), TypeScript 5.8+, `moduleResolution` `node20` · `nodenext` · `bundler`.
- `dataloader` optional peer; Node's built-in glob (no brace expansion except migration/seeder globs; `tinyglobby` picked up if installed).
- `.env` loading removed. Hashing md5 → FNV-1a 64-bit, `hashAlgorithm` gone.
- native `#private` on EntityManager, Collection, UnitOfWork, IdentityMap, MetadataStorage, Migrator, MigrationStorage.

### drivers — knex replaced by kysely
- `@mikro-orm/knex` → `@mikro-orm/sql`; `@mikro-orm/knex-compat` wraps knex queries in `raw`.
- "`@mikro-orm/better-sqlite` driver is removed" · "`@mikro-orm/sqlite` driver uses `better-sqlite3` internally".
- `em.getKnex()` → `em.getKysely()`; `qb.getKnexQuery()` gone.
- `driverOptions` passed straight to the client (no `connection` wrapper).
- `BaseSqlitePlatform` → `SqlitePlatform`; `LibSqlPlatform` removed.
- `quoteVersionValue` → `convertVersionValue`; `Connection.loadFile` → `executeDump(string)`.

### config
- `MikroORM.init` requires an options argument; `initSync` gone.
- precedence: explicit options > env vars > config file (`preferEnvVars` restores the old order). `MIKRO_ORM_TYPE` CLI-only; `--config` gone.
- `connect` removed (always lazy). `validate` and `strict` removed: always on, no auto-fixing.
- `forceUtcTimezone` default true. `processOnCreateHooksEarly` default true (`onCreate` runs inside `em.create`).
- `loadStrategy` default `balanced`; embeddable `prefixMode` default `relative`.
- removed discovery options: `disableDynamicFileAccess` · `requireEntitiesArray` · `alwaysAnalyseProperties` (the guide also lists `checkDuplicateEntities`, but `Configuration.js:28` still defaults it).
- `Options` has required keys → annotate partials as `Partial<Options>`. Extensions register before discovery.

### entity definition / EntitySchema
- "String references are no longer supported" — `EntityName` (`typings.d.ts:452`) dropped `string`; EntitySchema wants `entity: () => X` (`EntitySchema.d.ts:7-16`) and `extends?: EntityName<Base>` (`:39`).
- constructors used with `defineEntity` / `EntitySchema` must be public.
- builder booleans no longer accept `true`; `lazy()` no longer implies `ref()`.
- **nullability no longer inferred from `cascade`.**
- **FK rules no longer inferred from `cascade`.** Remaining defaults: FK-as-PK and pivot tables get cascade/cascade; nullable relations get `set null` on delete. Globals: `schemaGenerator.defaultDeleteRule` / `defaultUpdateRule`.
- arrays inside object embeddables are JSON. `Hidden` brand only on primitives.
- formula / index / check / generated callbacks take `(columns, table)`, with a `quote` helper.
- self-referencing M:N pivot columns use `tableName` when explicitly set.
- decorators moved to `@mikro-orm/decorators`; `ReflectMetadataProvider` no longer default (n/a to us).

### EntityManager / repository / filters / events
- `persistAndFlush` · `removeAndFlush` removed.
- "Change detection is no longer automatic on scalar properties, an explicit `em.persist` call is required now" — applies to AUTO-flush before queries; explicit `em.flush()` still walks the identity map (`core/unit-of-work/UnitOfWork.js:573-577`).
- `em.addFilter({ name, cond, entity })` takes one options object. `setFilterParams` · `getFilterParams` · fork copying unchanged (`EntityManager.js:293,324,1910`).
- `findByCursor` takes `where` inside options. stricter `em.create` / `em.assign` typings.
- `@Transactional` defaults to `REQUIRED`; `em.transactional` stays `NESTED` (docs error #8258, fixed). transaction events fire for nested transactions. `ArrayCollection` removed.
- `orm.getSchemaGenerator()` / `getMigrator()` → `orm.schema` / `orm.migrator`.
- EventSubscriber hook names IDENTICAL 6.6.7 ↔ 7.2.3 (diffed `EventSubscriber.d.ts`).

### query builder and raw SQL
- QueryBuilder no longer awaitable: `execute()` / `getResult()`. `where` validates aliases strictly; no top-level `$in`.
- `raw()` is symbol-based — mixing raw and string keys in `orderBy` is rejected; `.as()` quotes; `raw()` returns `RawQueryFragment`. `qb.as(Entity, 'alias')`.

### schema generator
- `createSchema` · `updateSchema` · `dropSchema` · `clearDatabase` · `refreshDatabase` → `create` · `update` · `drop` · `clear` · `refresh` — old names GONE, not deprecated (`AbstractSchemaGenerator.d.ts:13-19`).
- sqlite version dates are ms timestamps. `AbstractSchemaGenerator` → `@mikro-orm/core/schema`.

### migrations
- `createMigration` → `create` · `getPendingMigrations` → `getPending` · `checkMigrationNeeded` → `checkSchema`, plus `createInitial` · `getExecuted`.
- "`umzug` dependency removed": `UmzugMigration` → `MigrationInfo`, `logMigration({ name })`. folder auto-detection deferred to the first async call.

### not in the guide, verified in source / by running
- `orm.getMetadata().getAll()` returns `Map<EntityName, EntityMetadata>` keyed by class or schema (v6: `Dictionary` keyed by class name). `has('Name')` is false; use `getByClassName()`.
- `prop.pivotEntity` is a class; `meta.extends` is an EntitySchema object; `prop.type` still the class-name string; `prop.target` added (`smoke/smoke-meta.js`).
- `emit: 'js'` migrations are still CommonJS (`migrations/JSMigrationGenerator.js:8-23`) → under Deno `exports is not defined`; `emit: 'ts'` writes ESM (`TSMigrationGenerator.js:8`).

## 2. CHANGELOG 7.0.0 → 7.2.3

Source: https://github.com/mikro-orm/mikro-orm/blob/v7.2.3/CHANGELOG.md (raw copy `changelog-7x.txt`).

### sqlite
- 7.0.0 other sqlite libraries like `node:sqlite` (#7204); down migrations enabled; `ATTACH DATABASE` (#7131).
- 7.0.2 multiline view diffing (#7294). 7.0.9 array escaping (#7489 → #7488). 7.1.2 no snapshot flip-flop on comments (#7799). 7.1.9 libsql no longer recycles connections every 10 s (#8050). 7.2.0 sql.js driver (#7783). 7.2.3 "rebuild the table when the primary key is added or changed" (#8356).
- STILL BROKEN in 7.2.3, fixed after: #8382 — `createForeignKeyConstraints: false` produces `..., , )` DDL (`SqliteSchemaHelper.js:130-140`). We do not set it.

### migrations
- 7.0.0 umzug removed (#7203); snapshots normalized, written on up AND down (#7235); snapshot write skipped on read-only fs.
- 7.0.9 · 7.0.11 `checkSchema()` · `create()` · `getPending()` skip the DB connection when a snapshot exists (#7493, #7568).
- 7.0.13 snapshot serialization stabilized (#7608). 7.0.15 migration logged inside the runner's tx (#7676).
- 7.1.0 `migration:rollup` (#7468), runtime schema (#7597). 7.1.2 `up()` no longer churns the snapshot (#7804). 7.1.8 `skipTables` respected on snapshot rewrite (#8038). 7.1.11 stable `name` in generated migrations (#8109). 7.1.12 FKs of new tables created after alters (#8151). 7.2.0 `snapshotOnMigrate` opt-out (#8039).

### filters
- 7.0.0 "always check the database when querying by PK with filters" (#7084); filters on nested relation conditions and to-many fixed.
- 7.0.15 #7684 · 7.1.2 #7790 · 7.1.10 #8091 · 7.1.13 `$or` kept intact (#8176 #8181 #8182) · 7.1.15 filters kept in their own join branch (#8212), no endless loop on filter cycles (#8213) · 7.2.0 nested populate filters preserved across strategies (#8243) · 7.2.1 #8273 · 7.2.2 #8304 #8330.

### EntitySchema / defineEntity
- 7.0.0 `EntitySchema.new` (#7077); enum-array validation fix. 7.0.2 `EntitySchema.is()` instead of `instanceof` (#7289). 7.0.5 `REGISTRY` shared across CJS and ESM copies (#7377 → #7376 "Only abstract entities were discovered"). 7.0.6 `onCreate` applied in upsert (#7400). **7.0.7 pivot join columns use className (#7430).** 7.1.0 `em.assign` converts ISO strings to Date again (#7740, 7.0 regression). 7.1.4 arrays as `onCreate`/`onUpdate` return (#7848). 7.1.11 · 7.1.15 metadata looked up by class reference (#8108, #8209). 7.1.13 plain enum arrays accepted (#8167); enum checks skipped on json columns (#8184).

### deno
- 7.0.0 published on JSR (#7253) — `https://jsr.io/@mikro-orm/core/meta.json` latest 7.2.3. 7.1.1 CLI skips the local-dependency check under Deno (#7767).

### performance
- 7.0.0 auto-flush relies on `em.persist` (#6982). 7.2.2 kysely result maps cached (#8337).

## 3. issues and discussions (mikro-orm/mikro-orm)

65 sqlite + 69 migration issues since 2026-03; almost all closed and fixed within days.

### deno
- #7766 (closed, 7.1.1) `@mikro-orm/cli needs to be installed as a local dependency` under Deno. Reporter: "I am using Deno with Mikro-ORM. For so far, it works fine!"
- #7781 10-second stall on the second request under Deno + Postgres; workaround `pool.idleTimeoutMillis`; → discussion; not sqlite.
- #6414 (closed) 7.0.0-dev.1 depended on a package outside npm which Deno refuses; resolved with kysely 0.28.

### upgrade pain
- #7376 (closed, 7.0.5) "Only abstract entities were discovered" — two copies of the package (CJS + ESM). OUR SHAPE: abstract Literal/Symbol/Buffer sealed at runtime.
- #7412 (closed, won't fix) Bun can't load better-sqlite3 — maintainer: "you can use any sqlite library with v7".
- #7638 (closed, 7.0.14) `em.transactional` left state in the parent UoW; the next flush re-inserted a deleted row.
- #8019 (closed, not reproducible) nested to-one populate empty under `balanced` — our strategy.
- #7843 (closed) changes not detected — cause `disableIdentityMap: true`.
- #7671 MySQL pool no longer drains idle connections.
- #8001 (OPEN) values inlined into SQL instead of bind parameters.
- discussion #7737 ISO date strings in `em.assign` — maintainer: "I'd call this a bug actually, will be fixed in v7.1".
- discussion #7481 `migration:check` needed a database — fixed by #7493 and #7568.

### third party
- vivid-planet/dextinity PR #6397 (draft, 2026-09-23): replaced name-based entity references, explicit casts because Postgres `COUNT()` is no longer converted to number, metadata code rewritten — "metadata shape changed".

## 4. the deep changes

- **query building**: "Kysely is now used as the query runner, while the actual query building is done entirely by MikroORM itself" (release blog `docs/blog/2026-03-11-mikro-orm-7-released.md:47`).
- **driver/dialect model**: the connection picks its client from `driverOptions` — a function is called, a `Kysely` instance reused, any object with `createDriver` is a Kysely dialect, else the driver builds its own (`sql/AbstractSqlConnection.js:34-47`).
- **sqlite choices**
  - `@mikro-orm/sqlite` pins `better-sqlite3@13.0.3` — prebuilt binaries INSIDE the npm tarball (darwin-arm64, linux-x64, linuxmusl …), no install script.
  - `@mikro-orm/libsql` → `libsql@0.5.29`. `@mikro-orm/sql-js` → WASM (7.2.0+).
  - `@mikro-orm/sql` offers `SqliteDriver` + `NodeSqliteDialect` (`node:sqlite`; "Node.js 22.5+ and Deno 2.2+", `usage-with-sqlite.md:67`), or any Kysely dialect.
  - **the `sqlite3` package has no v7 driver** (v6 `@mikro-orm/sqlite` depended on `sqlite3: 5.1.7`; no v7 package does). A custom Kysely dialect could wrap it — inferred, untested.
  - importing `@mikro-orm/sqlite` always loads better-sqlite3 (`SqliteConnection.js:3`); for `node:sqlite` import from `@mikro-orm/sql`. The release blog's example imports from `@mikro-orm/sqlite`, misleading.
- **Deno 2.9.6, `-A`**: the full setup works on BOTH `node:sqlite` and better-sqlite3 — EntitySchema, abstract base + `extends`, embeddable `object: true`, self-ref m:1/1:m, m:n with `pivotTable`, json column, `defaultRaw`, `onCreate`/`onUpdate`, filter `cond(args)` + `default: true` + set/get params, fork, subscriber, `nativeUpdate`, raw `execute`, the virtual-entity trick (an `expression` that throws + a custom repository), `schema.create`/`refresh` on `:memory:`, migrator `create`/`getPending`/`up`/`checkSchema`.
  - `emit: 'js'` migrations FAIL under Deno (CJS → `exports is not defined`, `smoke/v6up/v7fresh2.js`). Use `emit: 'ts'` (ESM).
- **multi-statement SQL by driver**
  - `node:sqlite`: `execute("A; B")` and even `executeDump` SILENTLY run only A (`smoke/multi.js`; the dialect just `db.prepare(sql)`, `NodeSqliteDialect.js:26-27`).
  - better-sqlite3: `execute` THROWS "contains more than one statement"; `executeDump` uses `database.exec` (`SqliteConnection.js:20-22`).
  - the schema generator splits statements itself because `multipleStatements` is unset by default (`SqlSchemaGenerator.js:483-496`).
- **metadata and unit of work**: keyed by class reference (#8108, #8209); auto-flush only checks `persist`ed entities; `em.stream()` bypasses the identity map (release blog line 396).
- **migrations**: engine built in; snapshot normalized; `checkSchema()` diffs against the snapshot FILE when one exists, not the live db (`migrations/Migrator.js:119-131`); a v6 `mikro_orm_migrations` table and v6 snapshot are read fine (nothing pending, executed names matched — `smoke/v6up/v7.js`).
- **transactional migrations on sqlite**: `transactional: true` (still the default) BREAKS table rebuilds — SQLite ignores `pragma foreign_keys` inside a transaction (https://www.sqlite.org/pragma.html#pragma_foreign_keys "This pragma is a no-op within a transaction"); rebuilding a referenced table with child rows failed with `ForeignKeyConstraintViolationException` and rolled back; with `transactional: false` it succeeded (`smoke/smoke-tx.js`). **Keep `transactional: false`.**

## 5. the two v6 bugs — both fixed in 7.2.3

### bug 1 — rebuild SQL glued onto the next statement
- v6: `knex/dialects/sqlite/BaseSqliteSchemaHelper.js:196-199` `sql.push('pragma foreign_keys = on;'); return sql.join('\n');` then `SqlSchemaGenerator.js:242` `ret += diff` with no blank line; the splitter `migrations/Migrator.js:276` splits on `;\n`, so the next statement rides along. Still present in 6.6.17 (`:199`).
- 7.2.3: `getAlterTempTableSQL` returns an ARRAY (`sql/dialects/sqlite/SqliteSchemaHelper.js:639-665`), appended with padding (`SqlSchemaGenerator.js:341`), every statement gets its own `;` and a blank line after the group (`schema/SchemaHelper.js:774-789`).
- run proof: the migration file has a separate `this.addSql('pragma foreign_keys = on;')` and its own `alter table label add column color`; the column exists afterwards.
- bonus: the rebuild handles renamed columns (`:650-659`); v6 copied a renamed column as `null`.

### bug 2 — FK attached to the wrong added column
- v6: `knex/dialects/sqlite/SqliteTableCompiler.js:17,21` `const column = this.formatter.columnize(...)` (a string) then searches `` `add column ${column[0]}` `` — a lone backtick, matches the first `add column`. Identical in 6.6.17.
- 7.2.3: knex compiler gone; `getAddColumnsSQL` matches `fk.columnNames.length === 1 && fk.columnNames[0] === column.name` (`SqliteSchemaHelper.js:180-189`); composite or added FKs trigger a rebuild (`:496-505, :520-521`).
- run proof: adding `isbn` then `editor_id`, the FK lands on `editor_id`; `pragma foreign_key_list(book)` shows `editor_id -> author.id`.

## 6. must-know before upgrading (all run)

1. **the first v7 diff against a v6-built sqlite db rebuilds every table that has an m:1 relation, entities unchanged.** v6's default `Cascade.PERSIST` added `on update cascade` (`knex/schema/DatabaseTable.js:126-135`) and `Cascade.ALL` added `on delete cascade`; v7 adds neither (`sql/schema/DatabaseTable.js:190-191`). v6.6.7 + sqlite3 built `smoke/v6/v6.db`; v7 `getUpdateSchemaSQL` produced `__temp_alter` rebuilds for `author` and `book`; against a v6 snapshot `checkSchema()` returned true. Our boot calls `checkSchema → create → up`, so the first boot would generate and run it. `schemaGenerator: { defaultUpdateRule: 'cascade' }` removes most of the diff; relations relying on `Cascade.ALL`/`REMOVE` need an explicit `deleteRule: 'cascade'`; m:1 with `Cascade.REMOVE`/`ALL` and no explicit `nullable` used to be nullable (v6 `MetadataDiscovery.js:377-380`) and become NOT NULL.
2. rename calls at boot and in tests: `createSchema → create`, `refreshDatabase → refresh`, `checkMigrationNeeded → checkSchema`, `createMigration → create`, `getPendingMigrations → getPending`. Code walking `getAll()` iterates a Map; `pivotEntity` / `extends` are no longer strings.
3. driver: `sqlite3` → `@mikro-orm/sql` + `NodeSqliteDialect` (no native, silently drops multi-statement SQL) or `@mikro-orm/sqlite` (better-sqlite3, loads under Deno `-A`, throws on multi-statement).

## not verified
- Deno versions other than 2.9.6 · the `jsr:@mikro-orm/*` path · whether v6 sqlite generated enum CHECK constraints (more rebuilds under 7.1.13) · a full diff of the 20 live dbs (`orm.schema.getUpdateSchemaSQL()` against copies before the first v7 boot — quest milestone "dry diff").
