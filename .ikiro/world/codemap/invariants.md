---
paths: ["subsystems/**", "systems/**", "commons/**"]
---
<!-- writer: agent · kind: persistent · limit: 8800 chars -->
# codemap: invariants

- `loadStrategy: "balanced"` declared ONCE in `commons/datamaps/libsql/libsql.viva.js:config()`; every `MikroORM.init` spreads it — a hand-built init re-opens the `symbols^k` hole. `project_mikro_populate_balanced`
- mikro owns the db: never author a migration. Filters do NOT reach inside `$none/$some`. `em.remove` cascades over what is LOADED; a subscriber hook cannot flush. (`commons/datamaps/libsql/libsql.viva.js:49`)
- read a trait as a CLAIM: `v.<entity>.trait(row, NAME)`, never `row.trait?.NAME`. (`subsystems/typology/schematics/v.js:126`)
- STRIPWIRE: one trait Vector stripped daemon-side (`systems/runtime/lifecycle/daemon/aperture/metadata.js:42`), wired client-side (anima `mode/traits/`); APPLICATION · TOOLING stay in-process.
- the EMITTER drain binds every buffer it drains and `buffer.create` binds whenever handed a thread; a mint the emitter drains passes none (both = `thread.counter` twice). (`systems/runtime/entities/userspace/Buffer.ts:32`)
- an object spread of namespace imports pins the WHOLE barrel. `project_bundle_tree_shaking`
- a path is not a URL: decode out, encode per SEGMENT in. Never raw `fetch` over a `Connection`. (`subsystems/typology/prototypes/freight.js:28`)
- a default only where a grep proves the absent case; "absence" describing an ONTOLOGY is a defect — a union carries a tag. · ledger 09-22
- `deno task test` is a WATCHER — run ONE file. CAPTURE snapshots (`DRY = false`) rewrite the fixture and cannot go red. `project_snapshot_test_family`

- client domain-blind: /"nothing domain or mode specific can be loaded rendered or run on the client"/ — no domain key, enum or per-mode branch in anima/drapes source; domain words arrive as DATA through a generic renderer; mode UI only through the APPLICATION bundle seam (buffer views bundled server-side, loaded by id). (`systems/anima/src/typology/entities/mode/traits/application.js:8`)
- a lifecycle hook (any, incl. `afterFlush`) cannot `em.flush()` and a Collection `.set()` inside it never persists — m:n junction rows from a subscriber go as ONE `em.getConnection().execute("INSERT OR IGNORE …")`. (`education/domain/entities/kernel/Literal.ts:335`)
- mikro diffs against `.snapshot-*.json`, NEVER the live db — deleting the snapshot re-diffs from reality and will not apply on a drifted dev db. A rename's drop+create is mikro's job. `lsof -iTCP:2501` before any entity edit: under `--watch` a save IS a live migration. /"trash this stupid migration. mikro manages db."/
- barrel weight, measured on a 4000-export fixture: `export * as heavy from` → 32 B; `export const v = { ...core, heavy }` → 214 876 B (one property access/spread/call in the initializer pins everything it names; getters and `sideEffects:false` do not rescue it). A dev bundle is ~20× prod (rep-o-mat 11.78 MB vs 1.33 MB) — never quote a size without saying which. · compact the-eleven-megabyte-bundle
- a mikro `lazy: true` prop is absent from the SELECT AND the serialization — populate it BY NAME: `populate: ["retentions", "retentions.strength"]` (`~/.viva/registry/education/domain/entities/userspace/Retention.ts:142`, a `formula` CASE column); the relation alone never loads it.
- `daemon.modes` is a nested map `{type:{slug}}` — search peers with `daemon.flatmodes()` (`systems/runtime/lifecycle/mode/traits/intented.js:21`). mikro `ensure({…, uses:[{slug}]})` cascades an INSERT and collides on an existing slug: omit relations, resolve, then `.add()`; reading an unpopulated Collection throws.
- a mode that re-exports `aperture` while the aperture imports a constant FROM the mode hits a TDZ at load — shared constants live in the mode's `types.js` (chess). (`chess/modes/board/play/aperture/index.js:2`)
