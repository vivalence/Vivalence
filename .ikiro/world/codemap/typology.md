---
paths: ["subsystems/typology/**", "systems/runtime/**", "systems/anima/**", "systems/ghost/**"]
---
<!-- writer: agent · limit: 9400 chars · code is the map · paths relative to subsystems/typology -->
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
**`gestalten/cast/`: `primitives.js` viva·runtime·lookup · `prototypes.js` url · `scalars.js` array. `gestalten/fromm/`: sink·source·url·match·params·modes·slugmap+{controller}, 9 direct; `yield.js:97` `reader as yield`, untested.**
```js
// subsystems/typology/tests/lookup.test.js:4
  specimen.it("an identifier parses into owner, type, slug and version", () => {
    specimen.expect(cast.lookup("@vivalence/module/moduleA")).toEqual({
// subsystems/typology/tests/gestalten/fromm.test.js:3
specimen.describe("fromm.params", () => {
  specimen.it("a remainder reassembles into the whole tail", () => {
    specimen.expect(fromm.params({ 0: "words", 1: "a.adposition.mp3" }).path.absolute) //
```
**`gestalten/is/`: over `scalars.js` (14)·`prototypes.js`·`primitives.js`. `gestalten/not/index.js` untested.**
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
**`gestalten/shard/`: 15 members; `index.client.js` drops datamap·ambient·receiver·hal (`index.js:8-10,14`).** A datamap scope NARROWS the caller's where (`datamap.js:57`); an ownerless scoped write THROWS (`:212`).
```js
// subsystems/typology/tests/gestalten/shard/cors.test.js:1
import { specimen, shard } from "@vivalence/typology";

const { wrap } = shard.cors;
```
**`gestalten/steer/`: *match·*trie·*dispatch·*strategy; `bak.js` DEAD.** `trie`: `fold` · `survey` · `at` · `leaves` · `rollup` = leaves + an executor · `sieve(vector, keep)` copies, the CONSUMER's predicate (11-12, /"filter as sieve"/). `fire` reads DECLARED arity (`strategy.js:6`): `(ctx)`·`(input, ctx)`; `*` catches a miss at ANY depth (`dispatch.js:30`); a root `use` runs first.
```js
// subsystems/typology/tests/gestalten/steer/survey.test.js:5
  specimen.it("an identity visitor mirrors the trie", () => {
    const { vector } = house();
    const result = steer.trie.survey(vector);
```
**client export pipeline: `mod.ts` ⟷ `mod.client.js` (swapped by `subsystems/paladin/gestalten/belt/bundler.js:29`) over each `index.client.js`.** Server-only: `prototypes/index.ts` seek·freight·cargo·dataset·datasink·action·mode·yield·pool·twitch·datamap, `gestalten/` `bundle`. `tests/bundle/weight.test.js:7` caps `atom.chain` at 1024 B: a load-time `v.x =` un-shakes it.
```js
// subsystems/typology/mod.client.js:1
export * from "./prototypes/index.client.js";
export * from "./gestalten/index.client.js";
export * from "./schematics/index.js";
```
**`prototypes/` → `mod.ts`.** `vector.js`: `branch(sig, vector)` ATTACHES live, RETURNS the child; onto a SEATED path it COPIES (11-19: a later `open` is lost); `graft` copies (/"always attach. but lets have one dedicated for deep copy."/ 10-01), `trie` = `Map<Pattern, Vector>`, by nature = `edge(nature)`; `seat` merges declared keys INTO the trie's OWN pattern; `trim("/a/b")` drops along a path; ONE effect per node `signature.js:16`'s ctor RETURNS a same-class arg: subclasses declare no fields.
**`dataspace.js` — ONE identity map per runtime**: `branch` mints a repository per route, one `em`; `literal:<id>` is one object whichever route loaded it. A load is one `/find`; a push needs an open `.subscribe(where)` on a route with `datamap.reactive`; mode routes have none (runtime `mode/lifecycle/1-population.js:36`). Probed 11-14.
```js
// subsystems/typology/prototypes/dataspace.js:43
    return Object.fromEntries(kinds.map((name) => [name, new RemoteRepository(this.em.repositoryMap[name].kind).connect(connection.branch(`/entities/${name}`)).manage(this.em, name)]));
```
**`prototypes/pipe.js` · `queue.js` · `span.js` — TELEMETRY's flow algebra.** Pipe fans out, Queue buffers, a nanostore holds; `fromm.sink` makes each a write, attaching is ONE act, `pipe.tap(sink)` → untap; `fold` · `for await` tap a nanostore · a Queue. A span's pipe taps its parent's, a record `{at, path, track, data}` climbs to the root, `$history` is its fold; eight STANDARD tracks (`start stop request response fault log entity status`) are a Vector `span.tracked`, each a span method; importance is an axis BESIDE a track; the Controller's `start() stop() fault(error)` move its status AND write the track. Ref: `documentation/content/40-49_reference/42_primitives/`.
**`schematics/entities/`: `index.js` re-exports DataEntitySchema + 14 `*Schematic` spreading `base.js` `DataSchematic`·`VirtualSchematic`, `is`·`examples`, fields `.desc().example()`; `traits/index.js` `names`.**
```js
// subsystems/typology/tests/schematics.test.js:1
import { specimen, v } from "@vivalence/typology";
const { DataEntitySchema } = v.entities;
```
**`schematics/primitives/`: 15 working groups (/"semantic working groups"/ 11-12), `v.primitives.<group>.<Name>`; `contexts.js` homes `contexts.host`; `conversation.js` DEAD.** `v` ORDER (`done/signature-rank.org`): drawer by KIND, a consumer's enum a NAMED export of its group (REJECTED: its `* the dialogue`). `rank` rides the strip, filtering is each consumer's (/"i dont want rank handled on typology level."/). A new field: siblings' optionality (/"obviously also optional stupid. go."/). `traits/`: `v.traits.<entity>.<NAME>`, UPPERCASE, tables OPEN.
```js
// systems/runtime/tests/lighthouse/lighthouse.test.js:67
      specimen.expect(result.status).toBe("SUCCESS");
      specimen.expect(result.user).matches(v.primitives.auth.UserReference);
```
**`schematics/prototypes/`: `index.js` StatusCode·Status·ErrorResponse+{Yield,Condition}{Bundle}{Signature…}.**
```js
// subsystems/typology/tests/schematics/bundle.test.js:3
const Bundle = v.prototypes.Bundle();

const Nascent = v.object({ mime: v.mime(), source: v.string({ minLength: 1 }) });
```
**`schematics/scalars/`: ID·Slug·ModuleIdentifier·JWTToken·Username·Password+*mime · `mime.js` · `url.js` PATTERN·url; `schematics/v.js` entityFactory·v behind `schematics/index.js`.** `v` is typebox, never zod (/"does that exist???!!! if not stfu"/ 05-18): bounds are options, literal `v.const`; `cast` never validates, `.faults()` does.
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
