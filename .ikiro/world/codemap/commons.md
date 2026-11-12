---
paths: ["commons/**", "**/registry/**"]
---
<!-- writer: agent · limit: 5500 chars · code is the map · commons = the checkout's package; registry = ~/.viva/registry -->
# codemap: commons · registry packages

A `*.viva.js` = a package entry at `@commons/<type>/<slug>`; svelte/jsx mount by string.

**dashboards/dataspace** (manifest · views) ← `Dashboard.svelte` ← `schema.js`; `*.bak.svelte` DEAD.
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
**`mode/memo.viva.js`** (buffer · views · harness · tools · aperture · emitter) ← deal · progress.
```js
// commons/fixtures/memo/mode/memo.viva.js:19
    { mime: mime.tty.solid, mount: "buffer/memo.jsx" },
    { mime: mime.dom.svelte, mount: "buffer/Memo.svelte" },
```
**fixtures/testing** — `data/index.js` (seed · tiers · faculties · live) ← `systems/runtime/tests/scenarios/fixtures.js`; `probe/probe.viva.js`.
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
**hallucinators/*** — `service.viva.js` (provider · manifest · docs) ← `provider/index`, + `translate.js` in anthropic · openrouter (MINE, /"i've never read openrouter. yours."/).
```js
// commons/hallucinators/openrouter/tests/provider.test.js:10
  translateTurns,
} from "../provider/translate.js";
```
**harnesses/runtime** (manifest · harness · primer · tools) + `identity.md` · `world.md`, the harness an instance brings (m117); no test.
**instances/hello-world/mode.viva.js** ← harness (← page/style) · page/{index,draw}; `localhost/` empty.
```js
// commons/instances/hello-world/mode.viva.js:29-30
  .graft(gestalten.tools.entity, gestalten.tools.buffer, gestalten.tools.thread, gestalten.tools.mode)
  .graft(drawing);
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
**playground** — 9 entries; oracle `{Helpdesk,Paragraph}.svelte` DEAD.
```js
// commons/playground/chaosmonkey/oracle/oracle.viva.js:25
export const buffer = v.buffer({ data: {} });
```
**services** — `nlp/service.viva.js` (:84 control · manifest · provider · tools); `reader/service.viva.js` ← extract · hop (← guard) · skeleton; `ocr/` own `Block` · `Word` (11-13 /"no changes or additions in typology"/). Gateways (mail) land here, modes consume; mail per VENDOR — REJECTED one + presets (/"email per provider"/). **A service's engine = an npm dep or its OWN `server/` image; the root `Dockerfile` never** (REJECTED 11-13 tesseract `apk` /"We're not going to add fucking Tesseract to our base image"/).
```js
// commons/services/nlp/service.viva.js:11
  traits: ["SERVER", "DOCKER", "COMPOSE", "TOOLING"],
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
