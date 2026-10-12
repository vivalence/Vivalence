---
paths: ["**/tests/**", "**/specimen/**", "**/fixtures/**"]
---
<!-- writer: agent · limit: 7300 chars · code is the map · the rigs (scenarios) and the toolbox (specimen) · counts recounted 10-16 -->
# testing — scenarios are the rigs, specimen is the toolbox

## run
**container `test` is `--watch` (dapper's is not, `subsystems/dapper/deno.jsonc:13`; drapes has none); root delegates** (`deno.jsonc:33`).
```jsonc
// systems/runtime/deno.jsonc:12
    "test": "deno test -A --no-check --watch tests/**/*.test.js",
// deno.jsonc:33
    "runtime/test": "deno task --cwd ./systems/runtime test",
```

| typology | paladin | runtime | anima | ghost | drapes | dapper | commons |
|---|---|---|---|---|---|---|---|
| 103 | 25 | 72 | 39 | 3 | 10 | 4 | 35 |

## specimen
**`index.js`: bdd · assert · expect · `{snapshot}` · `is` + `matches`; direct `paladin/gestalten/belt/scribe.js` · `typology/mod.ts`, reach 360.**
```js
// subsystems/typology/specimen/index.js:10
expect.extend({
  matches(ctx, schema) {
    const errors = [...schema.errors(ctx.value)];
// systems/runtime/tests/lighthouse/lighthouse.test.js:62
      specimen.expect(result).matches(v.primitives.auth.AuthResponse);
```

## scenarios (typology) — barrel `index.js` (cats · topography · metronome), `@vivalence/typology/scenarios`
**`cats/` `house` · `domain/` `manifest` · `aperture` · `*traits` (`literal symbol note`) · `*schematics` (`LANGUAGE`) · `fixtures/test-component.svelte` (read by `gestalten/bundle.test.js:13`).**
```js
// subsystems/typology/tests/gestalten/shape/flat.test.js:6
    const { vector } = house()
    const flattened = shape.flat(vector)
// subsystems/typology/tests/v.test.js:127
    specimen.expect(cast.aperture).toBe(domain.aperture);
    specimen.expect(Object.keys(cast.schematics)).toEqual(["LANGUAGE"]);
```
**`metronome.js`: `until` · `tick` · `metronome` · `ledger`; `topography.js`: `structural ontological nouns verbs sentences corpus generation dataset datasink`.**
```js
// subsystems/typology/tests/controller.test.js:7
  const clock = metronome(script);
// subsystems/typology/tests/datasink.test.js:4
const dataset = topography.dataset();
const datasink = topography.datasink();
```

## scenarios (runtime) — barrel `index.js`, `@vivalence/runtime/scenarios`; direct `commons/fixtures/testing/data/seed.js` + 2 testament probes
```js
// systems/runtime/tests/scenarios/index.js:4
export { bench } from "./bench.js"
export * as datamap from "./datamap.js"
```
**`activity.js` `TOOL OBJECT SPOKEN create` (cortex rig + metronome) · `cortex.js` `create` — reach 0, imported by path.**
```js
// systems/runtime/tests/activity.integration.test.js:9
  scenario = await create({ script: [TOOL, OBJECT, { deltas: 9 }] });
// systems/runtime/tests/buffer.labeled.test.js:25
    scenario = await create();
```
**`bench.js` `bench` mints a daemon on `assemble(stack)`; `registry.js` `accio`, reach 0.**
```js
// systems/runtime/tests/bench/smoke.test.js:12
      accio("@education/domain/language-learning"),
      accio("@education/game/dojo"),
      accio("@education/game/judge"),
```
**`daemon.js` `SECRET lighthouseOf connector create` · `lighthouse.js` `create`; both reach 3, consumed by anima too.**
```js
// systems/anima/tests/scenario/buffer.test.js:56
    scenario = await daemon.create();
// systems/anima/tests/terminals.remote.test.js:67
  const house = await lighthouse.create();
```
**`datamap.js` `DAEMON stack descriptors twitches shard provider struck seed` (`struck` unused) · `mode.js` `mountMode mountModes`.**
```js
// systems/runtime/tests/scenarios/bench.js:63
  const { entities: descriptors, twitch: twitches } = assemble(stack);
// systems/anima/tests/harness-wire.test.js:24
  scenario = await mountMode(oracle, { cortex: new Cortex().register([seer()]) });
```
**`hello.js` `REPOSITORY SHIPPED LEDGER SECRET RECIPE ENVIRONMENT lines free copy boot launch revive` spawns `run.js`.**
```js
// systems/runtime/tests/runtime/hello.test.js:191
    world = await hello.launch({
      prefix: "viva-shipped-",
      home: (home) => hello.copy(hello.SHIPPED, home),
```
**`virtual.js` `ProbeEntity ProbeSchema probe create` · `fixtures.js` `*` of `commons/fixtures/testing/data` · `entities.bak.ts` · `variant.bak.js` DEAD.**
```js
// systems/runtime/tests/virtual.integration.test.js:18
  world = await create();
// systems/runtime/tests/scenarios/fixtures.js:1
export * from "../../../../commons/fixtures/testing/data/index.js";
```

## other rigs
**`systems/runtime/tests/qa/rig.js`: `boot` spawns `run.js`, `viva` spawns `systems/ghost/run.js --json`; fresh · italian · memo · reconcile; `probe.viva.js` mounted by `italian.test.js:8`.**
```js
// systems/runtime/tests/qa/rig.js:93
export async function boot(world, { shelf, slug, extra = {}, deadline = 120_000 }) {
  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "--no-check", "--config", CONFIG, RUN],
// systems/runtime/tests/qa/fresh.test.js:23
    const { code, effect, err } = await viva(world, ["ledger/install"]);
```
**`tests/interactive/activity/daemon.js` runs `activity.create` as a process (`deno.jsonc:21`, anima `interactive/activity.test.js:10`); `tests/topography/harness.js` `DRY missing persist` for the literal/symbol snapshots.**
```js
// systems/anima/tests/interactive/activity.test.js:10
    args: ["run", "-A", "--no-check", "tests/interactive/activity/daemon.js", "--port", "0", "--tick", String(tick), "--cron", "--silent"],
// systems/runtime/tests/topography/literal.snapshot.test.js:15
    skip = missing();
```
**ghost `systems/ghost/tests/world.js` `settle screen` (`keys.test.js:5`); drapes `subsystems/drapes/tests/dom/rig.js` `fresh world fire surface` (`chassis.test.js:2`).**

## snapshots
**`snapshot.js` `snapshot(subject, {dry, locate, parse, base})`; CAPTURE (`DRY = false`, 15) vs PIN (`HOT`, 12) diffs the frozen file.**
```js
// subsystems/typology/tests/path.snapshot.test.js:14
      dry: DRY,
      locate: "path.snapshot.json",
// systems/runtime/tests/cortex-contract.snapshot.test.js:10
  if (HOT) specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, parse: (value) => value });
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
```
**`tests/snapshots/` gitignored (`.gitignore:30`): a fresh PIN throws NotFound until `SNAPSHOT_HOT=1`.**
```js
// subsystems/typology/specimen/snapshot.js:88
  if (seen.has(value)) return undefined; // cycle leaf — the dominant source of bloat
```

## laws
```sh
# census 10-16; bench/smoke.test.js:12 accio()s @education
HOME=$(mktemp -d) deno test -A --no-check systems/runtime/tests/daemon/smoke.test.js  # ok | 1 passed (6 steps)
HOME=$(mktemp -d) deno test -A --no-check systems/runtime/tests/bench/smoke.test.js   # 2 failed
```
```jsonc
// testing — census 10-16
{ "systems/runtime/tests/scenarios": {"files": 14, "exports": 50, "tests": 10},
  "subsystems/typology/tests/scenarios": {"files": 8, "exports": 25, "tests": 6},
  "subsystems/typology/specimen": {"files": 2, "exports": 6, "tests": 2} }
```
