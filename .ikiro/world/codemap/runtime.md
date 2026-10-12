---
paths: ["systems/runtime/**", "systems/ghost/client/**"]
---
<!-- writer: agent · limit: 8100 chars · per item from methods/census.py · code is the map · paths relative to systems/runtime -->
# codemap: runtime — five subjects, the lexicon beside (m91, 10-19)

**A subject owns a dir: `runtime/ lighthouse/ daemon/ service/ mode/` = `prototype.js` (+ `Daemon.ts` · `Mode.ts`) · `lifecycle/index.js` (`execution` + its phases) · `traits/` · `apertures/`; `entities/ gestalten/ schematics/` hold what no subject owns. `typology.js` is predicative, keyed by subject; `Runtime Lighthouse Daemon Service` also flat (2 tests import `Daemon`).**
```js
// systems/runtime/typology.js:14
export const prototypes = { Runtime: runtime.Runtime, Lighthouse: lighthouse.Lighthouse, Daemon: daemon.Daemon, Service: service.Service };
export const lifecycle = { runtime: runtime.lifecycle, lighthouse: lighthouse.lifecycle, daemon: daemon.lifecycle, service: service.lifecycle, mode: mode.lifecycle };
export const traits = { mode: mode.traits, lighthouse: lighthouse.traits, service: service.traits };
export const apertures = { lighthouse: lighthouse.apertures };
```
**`daemon/` — `prototype.js` (`Daemon · DaemonSchema`) ← `index.js` · `runtime/lifecycle/population.js` · `typology.js`; `Daemon.ts` re-exported by `entities/index.ts`. `lifecycle/` = `population` (`core wiring datamap acid services modes`) · `resolution` (`domain modes freight`) · `integration` (`call prune` + the old `aperture/*`: `datamap freight entities metadata cortex`).**
```js
// systems/runtime/tests/scenarios/bench.js:122
    lifecycle.daemon.population.modes,
    lifecycle.daemon.resolution.modes(lifecycle.mode.execution),
    lifecycle.daemon.integration.datamap,
    lifecycle.daemon.integration.entities,
    lifecycle.daemon.integration.freight,
```
**`entities/` — 13 `*.ts` (`<X>Repository · <X>Entity · <X>Schema`) + `traits.js` (`traits`, re-exported as `kernel`) under `index.ts` (`sets · wrap · helper` + stars, `../mode/Mode.ts` · `../daemon/Daemon.ts` among them), reach 27; every entity file but `Process.ts` imports `index.ts` back.** `Issue.ts` DEAD (not in `index.ts`) · `Constraint.ts` DEAD (only `Issue.ts`); no test uses `Process · Symbol · Terminal`.
```js
// systems/runtime/tests/mint.test.js:4
import { sets, kernel, DaemonEntity, LiteralEntity, LiteralRepository, NoteEntity, UserEntity, ThreadEntity, BufferEntity } from "@vivalence/runtime";
import { assemble } from "../gestalten/belt/assemble.js";
import { config, provider } from "../../../commons/datamaps/libsql/libsql.viva.js";
import { gather, mint, strike } from "../gestalten/belt/traits.js";
```
**`gestalten/belt/` — `assemble` · `modes.js` `resolve · release · prune` · `traits.js` `stagger · gather · mint · strike`; `index.js` (`*modes`) ← 10 direct, 9 of them lifecycle phases.**
```js
// systems/runtime/tests/datasink.drain.test.js:7
const { DATASET, DATASINK } = traits.mode;
const { stagger } = gestalten.belt;
```
**`gestalten/shard/` — `cargo` `serve` · `host` `metadata · cortex · entities` · `process` `settle · keepalive`; 7 direct (the `daemon · runtime · service` `lifecycle/index.js` + both `integration.js` + `runtime/lifecycle/resolution.js` + `gestalten/index.js`).**
```js
// systems/runtime/tests/cortex-contract.snapshot.test.js:57
    gestalten.shard.host.cortex(daemon);
    daemon.aperture.branch("/metadata").open("/cortex", () => cortex.strip(daemon.cortex));
```
**`gestalten/tools/` (was `skills/`) — `buffer · entity · mode (places, mode) · thread (summary, thread)`; ← `gestalten/index.js` + `mode/traits/harnessed.js` (arms all four + `paladin.tools.{fs,shell}`).**
```js
// systems/runtime/mode/traits/harnessed.js:62
    .graft(tools.entity.entity)
    .graft(tools.buffer.buffer)
    .graft(tools.thread.thread)
    .graft(tools.mode.mode)
    .graft(paladin.tools.fs.fs)
    .graft(paladin.tools.shell.shell);
```
**`lighthouse/` — `prototype.js` `Lighthouse` · `signer.js` (reach 2, 5 tests) · `apertures/users.js` (`respond · card · authority · aperture`, the one Vector, ← `lifecycle/population.js` · `traits/{autologin,joinable}.js`) · `lifecycle/` `population` `core` · `resolution` `traits` · `traits/` `joinable` (`signup · JOINABLE`) · `autologin` · `invitational`.**
```js
// systems/runtime/tests/lighthouse/auth.test.js:3
import { signer } from "../../lighthouse/signer.js";
```
**`mode/` — `Mode.ts` · `lifecycle/` (`population` `stdout · core` · `resolution` `traits`, `stamp` straight from `../traits/dataset.js`) ← the `daemon/` and `runtime/` lifecycles · `traits/` 16, one UPPERCASE export each, read `traits.mode.<NAME>` (was `runtime.traits.<NAME>`).**
```js
// systems/runtime/mode/lifecycle/resolution.js:1
import { stagger } from "../../gestalten/belt/index.js";
import { stamp } from "../traits/dataset.js";
```
**`run.js` + `runtime/` — `run.js` mounts paladin (`factories.instance`), dispatches `runtime/lifecycle/index.js`; `Runtime` untested; `lifecycle/` = `population` (9) · `resolution` (7) · `integration` (`prune ledger patrol serve userspace` + `entities metadata cortex`).** The host beats exist once per die (`runtime/` · `daemon/` `integration.js`); only the daemon's is tested (`cortex-contract`).
```js
// systems/runtime/runtime/lifecycle/index.js:26
  .use(integration.entities)
  .use(integration.metadata)
  .use(integration.cortex)
```
**`schematics/index.js` `Instance`.**
```js
// systems/runtime/tests/door.test.js:6
  const sentences = (held) => schematics.Instance.faults(held).map(({ at, reason }) => `${at} ${reason}`);
```
**`service/` — `prototype.js` `Service · ServiceSchema`; `lifecycle/` `resolution` `traits`; `traits/index.js` = `SERVICE · PROVIDER` + `*attached` (`ATTACHED`); no test uses them.** Trait homes are THREE, each `<subject>/traits/index.js`.
```js
// systems/runtime/service/traits/index.js:1
export * from "./attached.js";

export const SERVICE = () => {};
export const PROVIDER = () => {};
```
**`typology.js` ← 6: `commons/fixtures/testing/data/{seed,tiers}.js` · 2 `testament/m76-probe` · `mode/traits/{harnessed,intented}.js` (from inside, by package name).**

**subjects by nature — an entity that does not run is a file in `entities/`.**
| subject | entity | process | prototype | lifecycle | traits | apertures |
|---|---|---|---|---|---|---|
| Runtime | – | ✓ | ✓ | ✓ | – | – |
| Lighthouse | – | ✓ | ✓ | ✓ | JOINABLE AUTOLOGIN INVITATIONAL | users |
| Daemon | ✓ | ✓ | ✓ | ✓ | – | – |
| Service | – | ✓ | ✓ | ✓ | ATTACHED SERVICE PROVIDER | – |
| Mode | ✓ | ✓ | typology | ✓ | 16 | – |
| Thread Turn Buffer Intent | ✓ | – | – | – | enum only; INTELLIGENT VOCAL read, undeclared | – |
| Literal Symbol Note | ✓ | – | – | – | schema only | – |
| User Terminal Process Activity Constraint Issue | ✓ | – | – | – | – | – |

```jsonc
// systems/runtime — census 10-19 (files · exports · files a test uses)
{
 ".": [2, 12, 1], "entities": [15, 78, 10], "schematics": [1, 1, 1],
 "daemon": [3, 9, 2], "daemon/lifecycle": [4, 20, 4],
 "lighthouse": [3, 9, 2], "lighthouse/apertures": [2, 5, 1], "lighthouse/lifecycle": [3, 5, 3], "lighthouse/traits": [4, 8, 1],
 "mode": [2, 7, 1], "mode/lifecycle": [3, 6, 3], "mode/traits": [17, 34, 15],
 "runtime": [2, 3, 0], "runtime/lifecycle": [4, 28, 4],
 "service": [2, 5, 0], "service/lifecycle": [2, 3, 2], "service/traits": [2, 4, 0],
 "gestalten": [1, 3, 0], "gestalten/belt": [4, 11, 3], "gestalten/shard": [4, 9, 3], "gestalten/tools": [5, 10, 4],
 "tests/qa": "rig.js spawns run.js AND systems/ghost/run.js — the testing shard owns it"
}
```
