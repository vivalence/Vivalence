<!-- limit: 6500 chars · LANDED 2026-11-11 on "land mode-consume" · sibling, live: reference/services/formalization.md · probes: reference/services/ -->
# mode consume — LANDED 11-11

beef: /"lets go back to the original problem and get just that right and worry about unification later."/ · /"the four hunks look right."/ · /"land mode-consume"/ · /"adn move to done when done"/

A mode consumes the way a daemon does, one level down. No new teardown, no new trait, no new subject.

```jsonc
// instance.viva.jsonc
"daemons": [{
  "consume": { "engine": { "module": "@chess/service/stockfish" } },
  "modes": [{
    "module": "@chess/modes/study/analysis",
    "consume": { "reader": { "module": "@commons/service/reader" } }
  }]
}]
```

## 1 · the recipe accepts it — two entries

```js
// subsystems/typology/schematics/primitives/instance.js:34 — Mode, settled
    consume: v.record(v.string(), Mask).default({}),
// subsystems/typology/schematics/primitives/instance.js:151 — ModeMask, authored (daemon AND runtime modes)
    consume: v.record(v.string(), MaskOf).optional(),
```

An entry is `{ module }`; a bare string is refused: `/daemons/0/modes/0/consume/reader must be object`.

## 2 · paladin resolves it

```js
// subsystems/typology/gestalten/belt/object.js:60 — beside `filter`, the same (key, value) order
export const traverse = async (obj, arrow) =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(obj).map(async ([key, value]) => [key, await arrow(key, value)]),
    ),
  );
```

```js
// subsystems/paladin/prototypes/registry.js:271 — wire
    const consumed = (consume) => object.traverse(consume, (slug, query) => this.accio(query));
// :279
    const placedModes = (await many(mask.modes ?? [])).map(placed);
    const modes = await Promise.all(
      placedModes.map(async (citizen) => ({
        ...citizen,
        consume: await consumed(citizen.consume ?? {}),
      })),
    );
// :289 — the daemon's own, on the same helper
      consume: await consumed(mask.consume ?? {}),
```

## 3 · the mode builds its own providers over its host's

```js
// systems/runtime/subjects/mode/lifecycle/1-population.js:14
export const providers = async (modeDie, next) => {
  modeDie.providers = { ...modeDie.providers };
  for (const [slug, citizen] of Object.entries(modeDie.mode.consume)) {
    modeDie.providers[slug] = await citizen.provider(citizen);
    if (citizen.manifest.traits.includes("TOOLING") && citizen.tools) {
      modeDie.providers[slug].tools = citizen.tools;
    }
  }
  await next();
};
```

## 4 · mounted before `core`

```js
// systems/runtime/subjects/mode/lifecycle/index.js:7
export const execution = new Vector()
  .use(population.stdout)
  .use(population.providers)
  .use(population.core);
```

## departures — mine, reported

- the bench rig mints modes WITHOUT `wire`: every bench suite died `TypeError: Cannot convert undefined or null to object` at the beat. The rig stands in for `wire`, so it fills what `wire` fills.

```js
// systems/runtime/tests/scenarios/bench.js:40
      consume: citizen.consume ?? {},
```

- `.default({})` on `Mode` makes `consume` REQUIRED on an entry judged before cast (`/1 must have required properties consume`). One existing step judged raw entries: it now casts first (`subsystems/typology/tests/schematics/instance.test.js:52`). Product casts before it judges (`subsystems/paladin/instance/lifecycle/3-integration.js:42`).

## proof

```
before  ok 127 · FAILED 8      135 files, serial, HOME empty: typology 3 · paladin 30 · runtime · ghost
after   ok 127 · FAILED 8      reds identical by name (corpus.snapshot · filetraits FILESET · 6 ghost)
```

```
subsystems/typology/tests/gestalten/belt/object.test.js   ok | 4 passed (12 steps) | 0 failed   +3
subsystems/typology/tests/schematics/instance.test.js     ok | 2 passed (15 steps) | 0 failed   +1
subsystems/paladin/tests/registry.wire.test.js            ok | 3 passed (12 steps) | 0 failed   +1
systems/runtime/tests/modes.test.js                       ok | 2 passed (5 steps) | 0 failed    +3
```

A real runtime on a free port, `reference/services/mode-consume.boot.probe.js` — the daemon consumes `page`, mode `peek` consumes `reader`, mode `quiet` nothing:

```
ready      [runtime/house] start http://localhost:56553
peek       200 {"keys":["page","reader"],"reader":"function","page":"function"}
quiet      200 {"keys":["page"],"reader":"undefined","page":"function"}
```

His `:2501` restarted on the save (17:20) and answers `RUNNING`: chess 13 · droneaid 12 · spanish 12 modes. `md5 ~/.viva/*.json` unchanged.

## handoff

- goal: a mode consumes a service the way a daemon does, one level down. DONE.
- never: paladin spawning a service · a `SERVER` trait function dispatching `/up` `/down` · widening this into the teardown unification (/"scope creep"/, `reference/teardown/study.md`).
- tails, each owned by `reference/services/formalization.md` `## owed`:
  - a mode's `consume` entry with a blank secret is not dropped at settle (`3-integration.js:37` drops the daemon's only): its provider throws at boot.
  - `${…}` inside a mode's `consume`: `1-population.js:79` expands the whole entry (`expand.js:22` walks nested objects) — READ, not run.
  - an OBJECT mode entry with a relative `module` (`{ module: "./peek.viva.js" }`) is not anchored (`1-population.js:14` anchors strings only): boot dies `Cannot read properties of undefined (reading 'split')` at `cast/primitives.js:38`. Older than this landing; `known-issues.org` has no room.
  - a bare string as a `consume` entry — HIS.
  - provider close · the runtime's own `consume` · `IMPLIED` (amen in the 11-11 walk, UNLANDED; the `SERVICE` trait and rules `:43` `:44` deleted 11-11 on /"cuut"/).

LANDED apart, 11-11, /"yes. fix this. do it now.."/: a top-level slot written as a registry identifier is `{ module }` — `subsystems/paladin/gestalten/belt/read.js:65`, test `subsystems/paladin/tests/ledger.parts.test.js:49`.
