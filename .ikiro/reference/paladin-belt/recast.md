# paladin belt — notes beside the quest

The ruled design is `.ikiro/quests/paladin-belt.org`. What stands on disk today: `surface.md`.
Everything he did not rule into the quest was pruned from here on 11-27, on his word.

## probes that ran (all beside this file)

- `locks.probe.js` — locks as a set, leaves `read write remove list`. Works.
- `sets.probe.js` — locks under the repository operation set (`find findOne upsert removeOne`,
  `where` matched by typology `object.match`), plain class, no mikro. `findOne` 0.086 ms.
- `virtual.locks.probe.js` — locks as a `VirtualRepository` subclass that refills its atom from
  the lock files on every query and writes the file after `upsert`. Sees a file another writer
  made. `findOne` 0.265 ms. The file on disk gains `id` `createdAt` `updatedAt`. The probe drops
  the dead-lock removal that `prototypes/lock.js` does on read.
- `mikro.cost.probe.js` — on top of 165 ms for the paladin typology import: 30 ms for
  `@mikro-orm/core` + `@mikro-orm/sqlite`, 10 ms `MikroORM.init` (`:memory:`, one schema).
  `orm.em` refuses `create`; the repository must hold `orm.em.fork()`.
- `registry.split.probe.js` — `Registry.prototype` methods borrowed onto two objects of disjoint
  state, each behind a Proxy that throws on a read of the other half. tap · supply · list ·
  accio · wire · untap ran; `crossed []`; same module list as the one class.
- `bundle.shape.probe.js` — both shapes printed off the real `paladin.bundler`.

## declared for later

### registry: one class, two subjects

- Record half (state `paladin path held from fallback`): `read write tapped has add remove
  base locate resolve stored row discover seed reconcile tap untap`.
- Module half (state `paladin pensieve span integrity`): `mount list lookup assert module
  accio wire`.
- `supply` is the only method that needs both. `stale` is written by `supply` alone.
- `accio` and `wire` read nothing of the record: in the recast tree they sit under `modules`,
  not beside it.
- Open: the leaf names; where the inline (`held`) record lives; the cache reset in
  `gestalten/belt/scope.js` (`delete paladin.ledger.held`).

### bundle: one member, two functions

- `bundle({ mime, source | entry })` → `Bundle`, content-addressed under `<directory>/bundle/`.
- `bundle({ mime, mount, name })` → `{ bundle, sources }`, written at `<directory>/<name>`.
- One return shape cannot be filled: when the artifact is already held, the first form never
  compiles, so it knows no inputs (probe: `inputs known: false`).
- Readers: `subsystems/typology/entities/Surface.ts` `bundle` reads `.sources`, `generate` reads
  `.entries`. Splitting it touches typology: ask first.
