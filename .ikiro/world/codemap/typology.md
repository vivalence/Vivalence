---
paths: ["subsystems/typology/**", "systems/runtime/**", "systems/anima/**", "systems/ghost/**"]
---
<!-- writer: agent · limit: 9100 chars · per item from methods/census.py · code is the map · paths relative to subsystems/typology -->
# codemap: typology — HOLY; ask before touching core types
Less is More, Code is Data, Schema is God · `cast` or die · `as` however · `fromm` from inside. The CONTAINER: imports no runtime·paladin, `Deno.*` only in server `shard/`; a prototype is /"functions on top of data"/ (10-03).

**`entities/`: 15 entity rows + `sets` (ex-runtime 11-06, relative imports) + `base/DataEntity.ts` Data* · `base/VirtualEntity.ts` Virtual*, in no `mod`; `base/properties.js` DEAD.**
```js
// systems/runtime/tests/scenarios/virtual.js:3
import { VirtualEntity, VirtualRepository, VirtualSchema, ThreadEntity, UserEntity, ModeEntity, DaemonEntity } from "@vivalence/runtime";
import { provider, descriptors, DAEMON } from "./datamap.js";

export class ProbeEntity extends VirtualEntity {
```
**`gestalten/belt/`: 25 members (168 exports), reach ~366, spread onto the root (`gestalten/index.js:8`): `control`·`sleep` import bare; `cortex.js` `strip`·`wire` collide with `shape/`.** An explicit export SHADOWS an `export *`, two of one name DROP it, silently. `atom` = `belt.atom`, fires on subscribe.
```js
// subsystems/typology/tests/gestalten/belt/control.test.js:1
import { control, Controller, sleep, Span, specimen } from "@vivalence/typology";

const mint = () => new Controller({ stdout: new Span("controlled") });
```
**`gestalten/bundle/`: {svelte}{pure} → `gestalten/index.js:11` only; `svelte.js` → `importmap.js`, resolveImportMap·resolveModuleSpecifier untested.**
```js
// subsystems/typology/tests/gestalten/bundle.test.js:12
  specimen.it("a svelte entry bundles with auto-pack", async () => {
    const entry = join(fixturesPath, "test-component.svelte");
    const outputFiles = await bundle.svelte(entry, { prod: false });
```
**`gestalten/cast/`: `primitives.js` viva·runtime·lookup · `prototypes.js` url · `scalars.js` array, 5 direct. `gestalten/fromm/`: sink·source·url·match·params·modes·slugmap+{controller}, 9 direct; `yield.js:97` `reader as yield`, untested.**
```js
// subsystems/typology/tests/lookup.test.js:4
  specimen.it("an identifier parses into owner, type, slug and version", () => {
    specimen.expect(cast.lookup("@vivalence/module/moduleA")).toEqual({
// subsystems/typology/tests/gestalten/fromm.test.js:3
specimen.describe("fromm.params", () => {
  specimen.it("a remainder reassembles into the whole tail", () => {
    specimen.expect(fromm.params({ 0: "words", 1: "a.adposition.mp3" }).path.absolute) //
```
**`gestalten/is/`: 16 direct, reach 383, over `scalars.js` (14)·`prototypes.js`·`primitives.js`. `gestalten/not/index.js`: 4 direct, untested.**
```js
// subsystems/typology/tests/signature.test.js:10
    specimen.expect(is.fn(route.filter)).toBeTruthy();
    specimen.expect(is.string(route.hash)).toBeTruthy();
// subsystems/typology/gestalten/not/index.js:23
export const not = {
  is: (not, thing, params) => {
```
**`gestalten/shape/`: 4 direct, over connection `wire`·flat·http·mcp·messenger (untested)·object/proxy·selbstbestimmt·strip·subscriber·tree.**
```js
// subsystems/typology/tests/gestalten/shape/strip.test.js:50
  specimen.it("a custom effect-builder reshapes the node's effect metadata", () => {
    const vector = new Vector().open({ nature: "x", input: "IN" }, () => {});
    const tagged = shape.strip(vector, (pattern) => ({ hasInput: pattern?.input !== undefined }));
```
**`gestalten/shard/`: 15 members; `index.client.js` drops datamap·ambient·receiver·hal (`index.js:8-10,14`); `catchAndRelease`·`stdio` untested; `patterns.js` DEAD.** A datamap scope NARROWS the caller's where (`datamap.js:57`); an ownerless scoped write THROWS (`:212`).
```js
// subsystems/typology/tests/gestalten/shard/cors.test.js:1
import { specimen, shard } from "@vivalence/typology";

const { wrap } = shard.cors;
```
**`gestalten/steer/`: *match·*trie·*dispatch·*strategy, 16 direct, reach 377; `bak.js` DEAD, still imports `match.js`·`strategy.js`.** `fire` reads DECLARED arity (`strategy.js:6`): `(ctx)`·`(input, ctx)`; `*` catches a miss at ANY depth (`match.js:18`); a root `use` runs first.
```js
// subsystems/typology/tests/gestalten/steer/survey.test.js:5
  specimen.it("an identity visitor mirrors the trie", () => {
    const { vector } = house();
    const result = steer.trie.survey(vector);
```
**client export pipeline: `mod.ts` (333 direct) ⟷ `mod.client.js` (swapped by `subsystems/paladin/gestalten/belt/bundler.js:29`) over each `index.client.js`; `types.d.ts` is 343 comment lines behind `mod.ts:12`.** Server-only: `prototypes/index.ts` seek·freight·cargo·dataset·datasink·action·mode·yield·pool·twitch·datamap (`:6,28-31,33,41,45-46,50,55`), `gestalten/` `bundle`. `tests/bundle/weight.test.js:7` caps `atom.chain` at 1024 B: a load-time `v.x =` un-shakes it.
```js
// subsystems/typology/mod.client.js:1
export * from "./prototypes/index.client.js";
export * from "./gestalten/index.client.js";
export * from "./schematics/index.js";
```
**`prototypes/`: 49 rows → `mod.ts`; seek·wafer·scope·blacklist·action·yield untested. `errors/`: BaseError+4 stars, `vector.js` Long·Short·NotFound·ValidationError (10 direct), `production.js` empty.** `vector.js`: `branch(sig, vector)` ATTACHES live, RETURNS the child; `graft` deep-copies (/"always attach. but lets have one dedicated for deep copy."/ 10-01); ONE effect per node. `signature.js:16`'s ctor RETURNS a same-class arg: subclasses declare no fields.
```js
// subsystems/typology/tests/datamap.test.js:1
import { Datamap, Twitch, sleep, specimen } from "@vivalence/typology";
import { EntitySchema, MikroORM } from "@mikro-orm/sqlite";
// subsystems/typology/tests/gestalten/shape/http.test.js:80
          const [effect, carry, steps] = steer.dispatch.traverse(target, signal);
          if (!effect) throw new NotFound(signal);
```
**`prototypes/pipe.js` · `queue.js` · `span.js` — TELEMETRY's flow algebra.** Pipe fans out, Queue buffers, a nanostore holds; `fromm.sink` makes each a write, attaching is ONE act, `pipe.tap(sink)` → untap; `fold` · `for await` tap a nanostore · a Queue. A span's pipe taps its parent's, a record `{at, path, track, data}` climbs to the root, `$history` is its fold; eight STANDARD tracks (`start stop request response fault log entity status`) are a Vector `span.tracked`, each a span method; importance is an axis BESIDE a track; the Controller's `start() stop() fault(error)` move its status AND write the track. Ref: `documentation/content/40-49_reference/42_primitives/`.
```js
// subsystems/typology/prototypes/span.js:45
  tracks(vector) {
    this.tracked.graft(vector);
    for (const nature of vector.trie.keys()) this[nature] ??= (data) => this.track(nature, data);
```
**`schematics/entities/`: `index.js` re-exports DataEntitySchema + 14 `*Schematic` (ex-Descriptor 11-09) spreading `base.js` `DataSchematic`·`VirtualSchematic`, `is`·`examples`, fields `.desc().examples()`; `traits/index.js` `names`.**
```js
// subsystems/typology/tests/schematics.test.js:1
import { specimen, v } from "@vivalence/typology";
const { DataEntitySchema } = v.entities;
```
**`schematics/primitives/`: 14 members, 1 direct; `contexts.js` (57 exports) homes `contexts.host`; `conversation.js` DEAD; `manifest.js` untested.** A new field takes its siblings' optionality (/"obviously also optional stupid. go."/). `schematics/traits/`: `v.traits.<entity>.<NAME>`, UPPERCASE, a file each, tables OPEN.
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
**`schematics/scalars/`: ID·slug·Slug·JWTToken·Timestamp·Username·Password+*mime (8 direct) · `mime.js` · `url.js` PATTERN·url; `schematics/v.js` entityFactory·v (31 direct, reach 397) behind `schematics/index.js` (7 direct).** `v` is typebox, never zod (/"does that exist???!!! if not stfu"/ 05-18): bounds are options, literal `v.const`; `cast` never validates, `.faults()` does.
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
