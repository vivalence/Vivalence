---
paths: ["subsystems/typology/**", "systems/runtime/**", "systems/anima/**", "systems/ghost/**"]
---
<!-- writer: agent · limit: 9100 chars · per item from methods/census.py · code is the map · paths relative to subsystems/typology -->
# codemap: typology — HOLY; ask before touching core types
Less is More, Code is Data, Schema is God · `cast` or die · `as` however · `fromm` from inside.

**`entities/`: `base/DataEntity.ts` (DataEntity·DataRepository·DataSchema) · `base/VirtualEntity.ts` (Virtual*) barrelled by `index.ts` → 16 direct (`systems/runtime/entities/Activity.ts` first), reach 48; `base/properties.js` DEAD.** `./entities` is in neither `mod`.
```js
// systems/runtime/tests/scenarios/virtual.js:3
import { VirtualEntity, VirtualRepository, VirtualSchema, ThreadEntity, UserEntity, ModeEntity, DaemonEntity } from "@vivalence/runtime";
import { provider, descriptors, DAEMON } from "./datamap.js";

export class ProbeEntity extends VirtualEntity {
```
**`gestalten/belt/`: 25 members (167 exports) under `index.js`, reach ~366.** `gestalten/index.js:8` spreads belt onto the root, so `control`·`sleep` import bare; `cortex.js` exports `strip`·`wire`, names `shape/` also owns.
```js
// subsystems/typology/tests/gestalten/belt/control.test.js:1
import { control, Controller, sleep, Span, specimen } from "@vivalence/typology";

const mint = () => new Controller({ stdout: new Span("controlled") });
```
**`gestalten/bundle/`: `index.js` {svelte}{pure} → `gestalten/index.js:11` only; `svelte.js` imports `importmap.js` (reach 1, no test uses resolveImportMap·resolveModuleSpecifier).**
```js
// subsystems/typology/tests/gestalten/bundle.test.js:12
  specimen.it("a svelte entry bundles with auto-pack", async () => {
    const entry = join(fixturesPath, "test-component.svelte");
    const outputFiles = await bundle.svelte(entry, { prod: false });
```
**`gestalten/cast/`: `primitives.js` viva·runtime·lookup · `prototypes.js` url · `scalars.js` array, under `index.js` (5 direct, `fromm/index.js` first). `gestalten/fromm/`: `index.js` sink·source·url·match·params·modes·slugmap+{controller}, 9 direct (`belt/hallucinate.js` first); `yield.js` re-exports `reader as yield` (`:97`), no test uses it.**
```js
// subsystems/typology/tests/lookup.test.js:4
  specimen.it("an identifier parses into owner, type, slug and version", () => {
    specimen.expect(cast.lookup("@vivalence/module/moduleA")).toEqual({
// subsystems/typology/tests/gestalten/fromm.test.js:3
specimen.describe("fromm.params", () => {
  specimen.it("a remainder reassembles into the whole tail", () => {
    specimen.expect(fromm.params({ 0: "words", 1: "a.adposition.mp3" }).path.absolute) //
```
**`gestalten/is/`: `index.js` (16 direct, `entities/base/DataEntity.ts` first, reach 383) over `scalars.js` (14 direct)·`prototypes.js`·`primitives.js`. `gestalten/not/index.js` `not`: 4 direct (`cast/primitives.js` first), no test uses `not`.**
```js
// subsystems/typology/tests/signature.test.js:10
    specimen.expect(is.fn(route.filter)).toBeTruthy();
    specimen.expect(is.string(route.hash)).toBeTruthy();
// subsystems/typology/gestalten/not/index.js:23
export const not = {
  is: (not, thing, params) => {
```
**`gestalten/shape/`: `index.js` (4 direct) over connection `wire`·flat·http·mcp·messenger·object/proxy·selbstbestimmt·strip·subscriber·tree; no test uses `messenger`.**
```js
// subsystems/typology/tests/gestalten/shape/strip.test.js:50
  specimen.it("a custom effect-builder reshapes the node's effect metadata", () => {
    const vector = new Vector().open({ nature: "x", input: "IN" }, () => {});
    const tagged = shape.strip(vector, (pattern) => ({ hasInput: pattern?.input !== undefined }));
```
**`gestalten/shard/`: 15 members; `index.client.js` drops datamap·ambient·receiver·hal (`index.js:8-10,14`); no test uses caching `catchAndRelease`, receiver `stdio`; `patterns.js` DEAD.**
```js
// subsystems/typology/tests/gestalten/shard/cors.test.js:1
import { specimen, shard } from "@vivalence/typology";

const { wrap } = shard.cors;
```
**`gestalten/steer/`: `index.js` *match·*trie·*dispatch·*strategy, 16 direct (`belt/hallucinate.js` first), reach 377; `bak.js` DEAD yet still imports `match.js`·`strategy.js`.**
```js
// subsystems/typology/tests/gestalten/steer/survey.test.js:5
  specimen.it("an identity visitor mirrors the trie", () => {
    const { vector } = house();
    const result = steer.trie.survey(vector);
```
**client export pipeline: `mod.ts` (333 direct) ⟷ `mod.client.js` (0 direct: `subsystems/paladin/gestalten/belt/bundler.js:29` swaps it in by path) over `prototypes/`·`gestalten/`·`gestalten/shard/` `index.client.js`; `types.d.ts` is 343 comment lines behind `mod.ts:12`.** `prototypes/index.ts` alone exports seek·freight·cargo·dataset·datasink·action·mode·yield·pool·twitch·datamap (`:6,28-31,33,41,45-46,50,55`); `index.client.js` adds none; `gestalten/index.client.js` drops `bundle` (`gestalten/index.js:11`).
```js
// subsystems/typology/mod.client.js:1
export * from "./prototypes/index.client.js";
export * from "./gestalten/index.client.js";
export * from "./schematics/index.js";
```
**`prototypes/`: 49 rows, `index.ts` → `mod.ts`; no test uses seek·wafer·scope·blacklist·action·yield (`yield.js` is `// moved to pool`); `harness/`·`orm/`·`signatures/` are EMPTY untracked dirs. `prototypes/errors/`: `index.js` BaseError+4 stars, `vector.js` Long·Short·NotFound·ValidationError (10 direct), `production.js` empty.**
```js
// subsystems/typology/tests/datamap.test.js:1
import { Datamap, Twitch, sleep, specimen } from "@vivalence/typology";
import { EntitySchema, MikroORM } from "@mikro-orm/sqlite";
// subsystems/typology/tests/gestalten/shape/http.test.js:80
          const [effect, carry, steps] = steer.dispatch.traverse(target, signal);
          if (!effect) throw new NotFound(signal);
```
**`schematics/entities/`: `index.js` re-exports DataEntitySchema+7 descriptors (2 direct); `base.js` VirtualEntitySchema bypasses it; `turn.js` DEAD.**
```js
// subsystems/typology/tests/schematics.test.js:1
import { specimen, v } from "@vivalence/typology";
const { DataEntitySchema } = v.entities;
```
**`schematics/primitives/`: 14 members under `index.js` (1 direct); `contexts.js` (57 exports) is `contexts.host`'s home; `conversation.js` DEAD; no test uses `manifest.js`.**
```js
// systems/runtime/tests/lighthouse/lighthouse.test.js:67
      specimen.expect(result.status).toBe("SUCCESS");
      specimen.expect(result.user).matches(v.primitives.auth.UserReference);
```
**`schematics/prototypes/`: `index.js` StatusCode·Status·ErrorResponse+{Yield,Condition}{Bundle}{Signature…}; `signatures.js` 3 direct; `scope.js` empty, DEAD.**
```js
// subsystems/typology/tests/schematics/bundle.test.js:3
const Bundle = v.prototypes.Bundle();

const Nascent = v.object({ mime: v.mime(), source: v.string({ minLength: 1 }) });
```
**`schematics/scalars/`: `index.js` ID·slug·Slug·JWTToken·Timestamp·Username·Password+*mime (8 direct) · `mime.js` · `url.js` PATTERN·url; `schematics/v.js` entityFactory·v (31 direct, reach 397) behind `schematics/index.js` v·{mime}·*contexts (7 direct).**
```js
// subsystems/typology/tests/v.test.js:320
    const templated = v.url().default("${VIVA_RUNTIME_ORIGIN}/");
    specimen.expect(templated.default).toBe("${VIVA_RUNTIME_ORIGIN}/");
    specimen.expect(JSON.parse(JSON.stringify(v.url())).pattern).toBe(v.scalars.PATTERN);
```
**`specimen/`: `index.js` is+3 stars+{snapshot} · `snapshot.js`; 2 direct, first `subsystems/paladin/gestalten/belt/scribe.js` (product).**
```js
// subsystems/typology/tests/mode-entity.snapshot.test.js:11
  it("captures mode-entity", () => {
    const { pojo, path } = snapshot(v.mode(), {
```

```jsonc
// subsystems/typology — census 10-16
{ "entities": {"files": 1, "exports": 2, "tests": 0}, "entities/base": {"files": 3, "exports": 9, "tests": 2},
  "gestalten": {"files": 2, "exports": 19, "tests": 0}, "gestalten/belt": {"files": 26, "exports": 167, "tests": 25},
  "gestalten/bundle": {"files": 4, "exports": 6, "tests": 2}, "gestalten/cast": {"files": 4, "exports": 11, "tests": 3},
  "gestalten/fromm": {"files": 3, "exports": 10, "tests": 2}, "gestalten/is": {"files": 4, "exports": 50, "tests": 3},
  "gestalten/not": {"files": 1, "exports": 1, "tests": 1}, "gestalten/shape": {"files": 11, "exports": 21, "tests": 9},
  "gestalten/shard": {"files": 18, "exports": 90, "tests": 13}, "gestalten/steer": {"files": 6, "exports": 27, "tests": 4},
  ".": {"files": 3, "exports": 14, "tests": 0}, "prototypes": {"files": 49, "exports": 142, "tests": 37},
  "prototypes/errors": {"files": 5, "exports": 11, "tests": 1}, "schematics": {"files": 2, "exports": 5, "tests": 2},
  "schematics/entities": {"files": 10, "exports": 18, "tests": 1}, "schematics/primitives": {"files": 15, "exports": 193, "tests": 12},
  "schematics/prototypes": {"files": 5, "exports": 16, "tests": 4}, "schematics/scalars": {"files": 3, "exports": 20, "tests": 3},
  "specimen": {"files": 2, "exports": 6, "tests": 2} }
```
