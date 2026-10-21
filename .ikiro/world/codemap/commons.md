---
paths: ["commons/**", "**/registry/**"]
---
<!-- writer: agent · limit: 5500 chars · code is the map · commons = the checkout's package; registry = ~/.viva/registry -->
# codemap: commons · registry packages

A `*.viva.js` = a package entry at `@commons/<type>/<slug>`; svelte/jsx mount by string.

**dashboards/dataspace** (manifest · views) ← `Dashboard.svelte` ← `schema.js`; `*.bak.svelte` DEAD; no test.
```js
// commons/dashboards/dataspace/dataspace.viva.js:15
const views = [{ slug: "dataspace", mount: "Dashboard.svelte", mime: mime.dom.svelte }];

```
**datamaps/libsql** = config · manifest · `provider(datamap, options)` (:37) (/"mask apart."/ 09-29); `contextName` = `db.file` (:13): 2 datamaps/file cross forks.
```js
// commons/datamaps/libsql/libsql.viva.js:15
    dbName: seat ?? ":memory:",
    loadStrategy: "balanced",
```
**fixtures/memo** = `package.viva.js` + 3 entries: `dataset/latin.viva.js` (manifest · fileset · dataset) ← `entities/*`.
```js
// commons/fixtures/memo/tests/dataset.test.js:2
import { entities } from "../dataset/entities/index.js";

```
**`domain/domain.viva.js`** (traits · aperture · tools · harness · `*`types) ← card · retention/* · traits/{literal,note}/*; `types.js` has 10 importers.
```js
// commons/fixtures/memo/tests/memo.snapshot.test.js:10
import { card } from "../domain/card.js";

```
**`mode/memo.viva.js`** (buffer · views · harness · tools · aperture · emitter) ← deal · progress; no `used`.
```js
// commons/fixtures/memo/mode/memo.viva.js:19
    { mime: mime.tty.solid, mount: "buffer/memo.jsx" },
    { mime: mime.dom.svelte, mount: "buffer/Memo.svelte" },
```
**fixtures/testing** — `data/index.js` (seed · tiers · faculties · live) ← `systems/runtime/tests/scenarios/fixtures.js`; `probe/probe.viva.js`; no `used`.
```js
// commons/fixtures/testing/data/index.js:1
export { seed, DAEMON } from "./seed.js";
export { instance, stack, tiers } from "./tiers.js";
```
**`hal/stub/service.viva.js`** ← provider/{index,script}.
```js
// commons/fixtures/testing/hal/stub/tests/stub.test.js:16
  specimen.it("reads flags out of prose and leaves the prose alone", () => {
    const held = plan({ turns: [said("tell me about flamingos --deltas 6 --stall 3s")] });
```
**hallucinators/*** — `service.viva.js` (provider · manifest · docs) ← `provider/index`, + `translate.js` in anthropic · openrouter (MINE, /"i've never read openrouter. yours."/); elevenlabs no `used`.
```js
// commons/hallucinators/openrouter/tests/provider.test.js:10
  translateTurns,
} from "../provider/translate.js";
```
**harnesses/runtime** (manifest · harness), no test; `daemon/` empty.
```js
// commons/harnesses/runtime/runtime-harness.viva.js:12
export const harness = new Vector();

```
**instances/hello-world/mode.viva.js** ← harness (← page/style) · page/{index,draw}; `localhost/` empty.
```js
// commons/instances/hello-world/tests/catalog.snapshot.test.js:37
  manifest: { slug: "hello-world", type: "demo" },
  module: { generator },
```
**hello-world/tools/index.js** `*`×5; routes ← doctor · research · wikipedia.
```js
// commons/instances/hello-world/tests/research.test.js:2
import { research, ROUNDS } from "../tools/research.js";
import { calling, rig, saying, SOURCE } from "./rig.js";
```
**ledger/** (json) names modules by type/slug; root `package.viva.js` = package/commons.
```json
// commons/ledger/ledger.viva.json:9
  "datamap": { "module": "@commons/datamap/libsql" },
  "hallucinators": [
```
**playground** — 9 entries; oracle `{Helpdesk,Paragraph}.svelte` DEAD; no `used`.
```js
// commons/playground/chaosmonkey/oracle/oracle.viva.js:25
export const buffer = v.buffer({ data: {} });
```
**services** — `nlp/service.viva.js` (:84 control · manifest · provider · tools); `reader/service.viva.js` ← extract · hop (← guard) · skeleton. Gateways (mail · OCR) land here, modes consume; mail per VENDOR — REJECTED one + presets (/"email per provider"/).
```js
// commons/services/nlp/tests/classify.test.js:3
import { tools } from "../tools/index.js";

```

## registry packages

**Barrel**; `resolve` → `systems/runtime/subjects/daemon/lifecycle/2-resolution.js:21`.
```js
// ~/.viva/registry/assembly/domain/assembly/assembly.viva.js:1
export * as traits from "./traits/index.js";
export * as schematics from "./schematics.js";
export { aperture } from "./aperture/index.js";
export { tools } from "./tools/index.js";
```
**Topography** `DATASET · FILESET · DATASINK`.
```js
// ~/.viva/registry/droneaid/topographies/models/models.viva.js:25
  symbol: [[{ slug: { $like: "family.%" } }, project.omit("literals"), "dataset/symbols/families.js"]],
  literal: [
    ["part", lean, "dataset/literals/parts.js"],
```
**Tests from the repo root.**
```js
// ~/.viva/registry/chess/services/stockfish/tests/provider.test.js:6
const FAKE = new URL("./fake-uci.js", import.meta.url).pathname;
// suites run from the repo root (README) — the fake engine needs the same config the suite got
const CONFIG = `${Deno.cwd()}/deno.jsonc`;
```
**Deps by URL**, nothing in `import_map.json`.
```js
// ~/.viva/registry/chess/topographies/openings/harvest.js:8
import { Chess } from "https://esm.sh/chessops@0.14.2/chess";
import { makeFen } from "https://esm.sh/chessops@0.14.2/fen";
import { parseSan } from "https://esm.sh/chessops@0.14.2/san";
```
```
census 10-16 · files/exports/tests
. 1/1/0, dashboards 4/7/0, datamaps 1/0/0, fixtures 39/121/9, hallucinators 10/31/3,
harnesses 1/2/0, instances 14/37/9, playground 28/39/0, services 9/9/6
```
