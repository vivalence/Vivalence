# mikro-7 — the research behind quest `m78-mikro-7.org`

Collected 2026-10-02 by two opus agents (one upstream, one on the tree) plus the session's own reads of the 6.6.7 and 7.2.3 sources. Everything here is a COPY for future reference; the quest `.ikiro/quests/done/m78-mikro-7.org` carries the decisions.

```
reference/mikro-7/
  README.md          this file — the map
  upstream.md        the v6→v7 upgrade guide condensed · CHANGELOG 7.0.0→7.2.3 · the issues · the deep changes · the two bug fixes verified
  census.md          every @mikro-orm touchpoint in the repo + ~/.viva/registry, ranked by what breaks under v7 (10-02)
  blast.md           the full blast 10-05 — breaks · shifts · verified safe · the 22 dbs · unknowns; supersedes census counts
  blast/             its scripts + raw outputs (imports.py → crosscheck.py · sweep.py · ledger.py · exports.js · raw.js)
  capabilities.md    what v7 ADDS, verdict per feature for this tree (10-05)
  changelog-7x.txt   the raw CHANGELOG.md of mikro-orm v7.2.3 — INCOMPLETE: stops at 7.0.1 (line 544), the 7.0.0 section is missing (the tarball's CHANGELOG.md:840-977 has it)
  m6.txt · m7.txt    EntityMetadata.d.ts member lists, 6.6.7 vs 7.2.3 (the "metadata shape changed")
  issues/*.json      GitHub REST dumps: searches (sqlite · mig · upg · perf · filt · deno · es) and single issues i<N>.json
  smoke/             re-runnable Deno scripts against 7.2.3 (nodeModulesDir none; DENO_DIR anywhere)
    deno.json        the import map: @mikro-orm/{core,sql,migrations,sqlite}@7.2.3
    smoke.js         the whole v6 feature set on v7 (EntitySchema · extends · embeddable · filters · fork · subscriber · virtual trick · migrator)
    smoke-tx.js      the same with migrations.transactional: true — the rebuild FAILS (pragma foreign_keys is a no-op in a tx)
    smoke-meta.js    metadata shape: getAll() Map · pivotEntity class · extends EntitySchema · prop.target
    multi.js         node:sqlite execute("A; B") and executeDump run ONLY A — silent
    bs3.js           better-sqlite3 execute("A; B") THROWS "contains more than one statement"
    v7diff.js        getUpdateSchemaSQL of v7 against a v6-built db: arg2 "compat" sets schemaGenerator.defaultUpdateRule cascade
    v6/v6.js         builds the v6 db (6.6.7 + sqlite3) that v7diff.js reads
    v6/v6mig.js      builds a v6 db THROUGH the v6 migrator (mikro_orm_migrations + snapshot) for the upgrade test
    v6up/v7.js       v7 migrator over the v6-migrated db: nothing pending, executed names match
    v6up/v7fresh*.js emit "js" migrations under Deno → `exports is not defined` (CJS); emit "ts" is ESM
    defaults/v6.sql  brazilian's Turn · symbol_literals · literal_uses DDL with rows (build: sqlite3 x.db < v6.sql)
    defaults/probe.js  <db> bare|pivots|pinned diff|apply|delete — what mikro 7's own defaults do to a v6 db (10-05)
```

## re-run

```sh
cd .ikiro/reference/mikro-7/smoke
DENO_DIR=/tmp/mikro7-deno deno run -A multi.js            # node:sqlite drops the second statement
DENO_DIR=/tmp/mikro7-deno deno run -A bs3.js              # better-sqlite3 throws on it
DENO_DIR=/tmp/mikro7-deno deno run -A smoke.js create /tmp/smoke.db
cd v6 && deno run -A v6.js && cd .. && DENO_DIR=/tmp/mikro7-deno deno run -A v7diff.js v6/v6.db        # the rebuild diff
DENO_DIR=/tmp/mikro7-deno deno run -A v7diff.js v6/v6.db compat                                         # near-empty
```

`v6/` needs its own `deno install` (6.6.7 + sqlite3 native build) — `v6/deno.json` carries the map.

## the four facts that decide the quest

1. both sqlite bugs are fixed in 7.2.3 — `sql/dialects/sqlite/SqliteSchemaHelper.js:639` returns an ARRAY per statement; `:180` matches an FK to ITS column.
2. `sqlite3@5.1.7` has no v7 driver — choose better-sqlite3 (`@mikro-orm/sqlite`, prebuilt binary, THROWS on multi-statement) or `node:sqlite` (`@mikro-orm/sql` + `NodeSqliteDialect`, no native, SILENTLY runs the first statement only).
3. the first v7 diff against a v6 db rebuilds every table that had an implied `on update cascade` and renames the pivots by case (`symbol_literals` → `Symbol_literals`) plus the self-ref columns (`literal_entity_1_id` → `literal_1_id`) — pin before upgrading.
4. metadata is keyed by CLASS: `getAll()` is a `Map`, `entity: "Name"` throws, a repository's `entityName` is the class.
