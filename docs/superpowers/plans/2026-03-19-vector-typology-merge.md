# Vector → Typology Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fold `@vivalence/vector` into `@vivalence/typology`, eliminating the separate package and its circular dependency.

**Architecture:** Vector's modules move into typology's gestalten namespace (controller/, compiler/) and shard/ directory. Vector and Aperture prototypes move to prototypes/. All consumers rewrite imports from `@vivalence/vector` to `@vivalence/typology`. Vector's Context is dead code (logs "legacy") — drop it. Typology's deno.jsonc gains export entries that mirror vector's old sub-paths so `@vivalence/typology/controller` etc. work.

**Tech Stack:** Deno, TypeScript/JavaScript, jj (Jujutsu) VCS

---

## File Map

### Files to copy into typology

| Source (vector) | Destination (typology) |
|---|---|
| `prototypes/vector.js` | `prototypes/vector.js` |
| `prototypes/aperture.js` | `prototypes/aperture.js` |
| `prototypes/errors.js` | `prototypes/errors/vector.js` |
| `controller/traverse.js` | `gestalten/controller/traverse.js` |
| `controller/walk.js` | `gestalten/controller/walk.js` |
| `controller/invoke.js` | `gestalten/controller/invoke.js` |
| `controller/match.js` | `gestalten/controller/match.js` |
| `controller/shotgun.js` | `gestalten/controller/shotgun.js` |
| `controller/index.js` | `gestalten/controller/index.js` |
| `compiler/http.js` | `gestalten/compiler/http.js` |
| `compiler/object.js` | `gestalten/compiler/object.js` |
| `compiler/agentic.js` | `gestalten/compiler/agentic.js` |
| `compiler/subscriber.js` | `gestalten/compiler/subscriber.js` |
| `compiler/index.js` | `gestalten/compiler/index.js` (without oak re-export) |
| `shards/cors.js` | `gestalten/shard/cors.js` |
| `shards/caching.js` | `gestalten/shard/caching.js` |
| `shards/websocket.js` | `gestalten/shard/websocket.js` |
| `shards/serve.js` | `gestalten/shard/serve.js` |

### Files NOT copied (already exist in typology or dead)

| File | Reason |
|---|---|
| `prototypes/context.js` | Legacy wrapper that logs "legacy vector context". Typology's Context is canonical. Consumers importing `Context` from vector (e.g. `html/populate.js`) silently get the real Context after merge — correct behavior. |
| `prototypes/index.js` | Re-export plumbing, replaced by typology's own. |
| `shards/patterns.js` | Identical content already at `gestalten/shard/patterns.js` |
| `shards/secure.js` | Superseded by `gestalten/shard/secure.js` (typology's is more complete) |
| `shards/index.js` | Replaced by updated `gestalten/shard/index.js` |
| `compiler/oak.js` | Depends on `@oak/oak` — legacy, not migrated. Eagerly loading it from the barrel would break environments without Oak. |
| `compiler/bak/*` | Dead Oak aperture code |
| `typology.js` | Re-export shim, not needed |
| `mod.js` | Package entry point, not needed |

### Files to modify in typology

| File | Change |
|---|---|
| `prototypes/index.ts` | Add exports for Vector, Aperture, vector error types |
| `prototypes/errors/index.js` | Add re-export of vector errors |
| `gestalten/index.js` | Add `controller` and `compiler` namespace exports |
| `gestalten/shard/index.js` | Add cors, caching, websocket, serve exports |
| `mod.ts` | No change needed (already re-exports prototypes/ and gestalten/) |
| `deno.jsonc` | Add export entries: `./controller`, `./compiler`, `./aperture` |
| `gestalten/is/prototypes.js` | Replace lazy `await import("@vivalence/vector")` with direct import |
| `prototypes/agent.js` | Rewrite `import { Agentic } from "@vivalence/vector/compiler"` |
| `prototypes/mode.js` | Rewrite `import { shards } from "@vivalence/vector"` |

### Test files to copy

| Source (vector) | Destination (typology) |
|---|---|
| `tests/vector.test.js` | `tests/vector.test.js` |
| `tests/compiler/http.test.js` | `tests/compiler/http.test.js` |
| `tests/compiler/object.test.js` | `tests/compiler/object.test.js` |
| `tests/compiler/benchmark.test.js` | `tests/compiler/benchmark.test.js` (only if it doesn't depend on oak) |
| `tests/controller/traverse.test.js` | `tests/controller/traverse.test.js` |
| `tests/controller/walk.test.js` | `tests/controller/walk.test.js` |
| `tests/controller/match.test.js` | `tests/controller/match.test.js` |
| `tests/controller/invoke.test.js` | `tests/controller/invoke.test.js` |
| `tests/shards/cors.test.js` | `tests/shards/cors.test.js` |
| `tests/shards/websocket.test.js` | `tests/shards/websocket.test.js` |
| `tests/shards/serve.test.js` | `tests/shards/serve.test.js` |
| `tests/prototypes/aperture.test.js` | `tests/aperture.test.js` |

### Consumer files to rewrite (active code only)

| File | Current import | New import |
|---|---|---|
| `systems/runtime/runtime.js:2-3` | `Vector` from `@vivalence/vector`, `Aperture` from `@vivalence/vector/aperture` | Both from `@vivalence/typology` |
| `systems/runtime/daemon/daemon.js:2-3` | `Vector, shards` from `@vivalence/vector`, `Aperture` from `@vivalence/vector/aperture` | All from `@vivalence/typology` |
| `systems/runtime/daemon/lifecycle/integration.js:2` | `compiler` from `@vivalence/vector` | From `@vivalence/typology` |
| `systems/runtime/daemon/lifecycle/resolution.js:1` | `Aperture` from `@vivalence/vector/aperture` | From `@vivalence/typology` |
| `systems/runtime/daemon/lifecycle/population.js:5-6` | `Vector, compiler, controller` from `@vivalence/vector`, `Aperture` from `@vivalence/vector/aperture` | All from `@vivalence/typology` |
| `systems/runtime/lifecycle/resolve.js:3` | `compiler, shards as vectorShards` from `@vivalence/vector` | From `@vivalence/typology` |
| `systems/runtime/lifecycle/populate.js:3` | `Aperture` from `@vivalence/vector/aperture` | From `@vivalence/typology` |
| `systems/runtime/lifecycle/integrate.js:3` | `compiler, Vector` from `@vivalence/vector` | From `@vivalence/typology` |
| `systems/runtime/tests/scenario/runtime.test.js:2-3` | `shards, compiler` + `Aperture` | From `@vivalence/typology` |
| `systems/runtime/tests/scenario/daemon.js:2-3` | `shards, compiler` + `Aperture` | From `@vivalence/typology` |
| `systems/shell/trajectories/index.js:1` | `Vector` from `@vivalence/vector` | From `@vivalence/typology` |
| `systems/shell/lifecycle/call.js:1` | `controller, compiler` from `@vivalence/vector` | From `@vivalence/typology` |
| `systems/shell/lifecycle/run.js:1` | `controller, errors` from `@vivalence/vector` | From `@vivalence/typology` |
| `systems/html/client.viva.js:2` | `Vector` from `@vivalence/vector` | From `@vivalence/typology` |
| `systems/html/src/routes/[...viva]/lib/populate.js:2` | `Vector, controller, Context, NotFound` from `@vivalence/vector` | From `@vivalence/typology` |
| `registry/kernels/@vivalence/domain/learning/aperture/index.js:1` | `Aperture` from `@vivalence/vector/aperture` | From `@vivalence/typology` |
| `registry/kernels/@vivalence/domain/learning/modes/index.js:2` | `shards` from `@vivalence/vector` | From `@vivalence/typology` |
| `registry/services/@vivalence/nlp/service.viva.js:3` | `Vector` from `@vivalence/vector` | From `@vivalence/typology` |
| `registry/services/@vivalence/hallucinator/hal/tests/hallucinator.test.js:3` | `Vector` from `@vivalence/vector` | From `@vivalence/typology` |
| `registry/modes/@vivalence/tactic/test/test.viva.js:2` | `Vector` from `@vivalence/vector` | From `@vivalence/typology` |
| `registry/wafers/@vivalence/variant/multiplayer/server/daemon.viva.js:3` | `Vector` from `@vivalence/vector` | From `@vivalence/typology` |

---

## Task 1: Copy prototypes (Vector, Aperture, errors)

**Files:**
- Copy: `subsystems/vector/prototypes/vector.js` → `subsystems/typology/prototypes/vector.js`
- Copy: `subsystems/vector/prototypes/aperture.js` → `subsystems/typology/prototypes/aperture.js`
- Copy: `subsystems/vector/prototypes/errors.js` → `subsystems/typology/prototypes/errors/vector.js`
- Modify: `subsystems/typology/prototypes/errors/index.js`
- Modify: `subsystems/typology/prototypes/index.ts`

- [ ] **Step 1: Copy vector.js**

Copy `subsystems/vector/prototypes/vector.js` to `subsystems/typology/prototypes/vector.js`. Rewrite its imports:

```js
import { Pattern, Signature } from "@vivalence/typology";
```

These are already `@vivalence/typology` imports — no change needed to the file contents.

- [ ] **Step 2: Copy aperture.js**

Copy `subsystems/vector/prototypes/aperture.js` to `subsystems/typology/prototypes/aperture.js`. Rewrite its import:

```js
import { Vector } from "./vector.js";
```

This relative import stays the same since both files are in the same directory.

- [ ] **Step 3: Copy errors**

Copy `subsystems/vector/prototypes/errors.js` to `subsystems/typology/prototypes/errors/vector.js`. No import changes — it has no imports.

- [ ] **Step 4: Wire error exports**

In `subsystems/typology/prototypes/errors/index.js`, add at the end:

```js
export * from "./vector.js";
```

- [ ] **Step 5: Wire prototype exports**

In `subsystems/typology/prototypes/index.ts`, add:

```js
export * from "./vector.js";
export * from "./aperture.js";
```

These must come after the existing exports. `Vector` and `Aperture` classes, plus `Long`, `Short`, `NotFound` errors (via errors/index.js which is already exported) become available at `@vivalence/typology`.

- [ ] **Step 6: Verify prototype imports resolve**

Run:
```bash
deno eval "import { Vector, Aperture, Long, Short, NotFound } from '@vivalence/typology'; console.log('Vector:', typeof Vector, 'Aperture:', typeof Aperture, 'NotFound:', typeof NotFound);"
```

Expected: `Vector: function Aperture: function NotFound: function`

---

## Task 2: Copy controller

**Files:**
- Create dir: `subsystems/typology/gestalten/controller/`
- Copy: all 6 files from `subsystems/vector/controller/` → `subsystems/typology/gestalten/controller/`
- Modify: `subsystems/typology/gestalten/index.js`

- [ ] **Step 1: Create directory and copy files**

```bash
mkdir -p subsystems/typology/gestalten/controller
```

Copy these files from `subsystems/vector/controller/`:
- `traverse.js`
- `walk.js`
- `invoke.js`
- `match.js`
- `shotgun.js`
- `index.js`

- [ ] **Step 2: Rewrite imports in copied files**

**`match.js` line 1:** Change:
```js
import { NotFound } from "@vivalence/vector/typology";
```
To:
```js
import { NotFound } from "@vivalence/typology";
```

**`walk.js` line 1:** Change:
```js
import { Long, Short } from "@vivalence/vector/typology";
```
To:
```js
import { Long, Short } from "@vivalence/typology";
```

**`invoke.js` line 2:** Change:
```js
import { NotFound } from "@vivalence/vector/typology";
```
To:
```js
import { NotFound } from "@vivalence/typology";
```

All other imports in these files (`@vivalence/typology`, relative `./traverse.js`, `./match.js`) are already correct.

- [ ] **Step 3: Wire controller into gestalten**

In `subsystems/typology/gestalten/index.js`, add:

```js
export * as controller from "./controller/index.js";
```

- [ ] **Step 4: Add export entry to deno.jsonc**

In `subsystems/typology/deno.jsonc`, add to `"exports"`:

```json
"./controller": "./gestalten/controller/index.js"
```

- [ ] **Step 5: Verify controller imports resolve**

Run:
```bash
deno eval "import { controller } from '@vivalence/typology'; console.log('traverse:', typeof controller.traverse, 'invoke:', typeof controller.invoke);"
```

Expected: `traverse: function invoke: function`

---

## Task 3: Copy compiler

**Files:**
- Create dir: `subsystems/typology/gestalten/compiler/`
- Copy: 6 files from `subsystems/vector/compiler/` → `subsystems/typology/gestalten/compiler/`
- Modify: `subsystems/typology/gestalten/index.js`

- [ ] **Step 1: Create directory and copy files**

```bash
mkdir -p subsystems/typology/gestalten/compiler
```

Copy these files from `subsystems/vector/compiler/`:
- `http.js`
- `object.js`
- `agentic.js`
- `subscriber.js`
- `index.js`

Do NOT copy `oak.js` — it depends on `@oak/oak` which is not available in all consumer environments. The barrel export in `compiler/index.js` eagerly loads all re-exports, so including oak would break any import of the compiler namespace.

- [ ] **Step 2: Rewrite imports in copied files**

**`http.js` line 1:** Change:
```js
import { Signal, Context, fromm } from "@vivalence/typology";
```
No change needed — already uses `@vivalence/typology`.

**`http.js` lines 2-3:** Change:
```js
import { traverse } from "../controller/traverse.js";
import { NotFound } from "../prototypes/errors.js";
```
To:
```js
import { traverse } from "@vivalence/typology/controller";
import { NotFound } from "@vivalence/typology";
```

**`agentic.js` line 1:** Change:
```js
import { controller } from "@vivalence/vector";
```
To:
```js
import { controller } from "@vivalence/typology";
```

**`object.js`:** No changes needed — already imports from `@vivalence/typology`.

**`subscriber.js`:** No changes needed — already imports from `@vivalence/typology`.

**`index.js`:** Remove the oak re-export. Change:
```js
export * from "./oak.js";
```
To: delete this line entirely.

- [ ] **Step 3: Wire compiler into gestalten**

In `subsystems/typology/gestalten/index.js`, add:

```js
export * as compiler from "./compiler/index.js";
```

- [ ] **Step 4: Add export entry to deno.jsonc**

In `subsystems/typology/deno.jsonc`, add to `"exports"`:

```json
"./compiler": "./gestalten/compiler/index.js"
```

- [ ] **Step 5: Verify compiler imports resolve**

Run:
```bash
deno eval "import { compiler } from '@vivalence/typology'; console.log('http:', typeof compiler.http, 'object:', typeof compiler.object);"
```

Expected: `http: function object: function`

---

## Task 4: Copy shards (cors, caching, websocket, serve)

**Files:**
- Copy: 4 files from `subsystems/vector/shards/` → `subsystems/typology/gestalten/shard/`
- Modify: `subsystems/typology/gestalten/shard/index.js`

- [ ] **Step 1: Copy shard files**

Copy from `subsystems/vector/shards/`:
- `cors.js` → `subsystems/typology/gestalten/shard/cors.js`
- `caching.js` → `subsystems/typology/gestalten/shard/caching.js`
- `websocket.js` → `subsystems/typology/gestalten/shard/websocket.js`
- `serve.js` → `subsystems/typology/gestalten/shard/serve.js`

No import rewrites needed — none of these files import from `@vivalence/vector`.

- [ ] **Step 2: Wire shard exports**

In `subsystems/typology/gestalten/shard/index.js`, add:

```js
export * as cors from "./cors.js";
export * as caching from "./caching.js";
export { websocket } from "./websocket.js";
export { serve } from "./serve.js";
```

- [ ] **Step 3: Verify shard imports resolve**

Run:
```bash
deno eval "import { shard } from '@vivalence/typology'; console.log('cors:', typeof shard.cors, 'websocket:', typeof shard.websocket, 'serve:', typeof shard.serve);"
```

Expected: `cors: object websocket: function serve: function`

---

## Task 5: Add Aperture export entry + wire is.Vector

**Files:**
- Modify: `subsystems/typology/deno.jsonc`
- Modify: `subsystems/typology/gestalten/is/prototypes.js`

- [ ] **Step 1: Add aperture export to deno.jsonc**

In `subsystems/typology/deno.jsonc`, add to `"exports"`:

```json
"./aperture": "./prototypes/aperture.js"
```

- [ ] **Step 2: Replace lazy Vector import in is/prototypes.js**

In `subsystems/typology/gestalten/is/prototypes.js`:

Replace:
```js
let VP;
async function loadVector() { VP ??= (await import("@vivalence/vector")).Vector; }
```

With:
```js
import { Vector as VP } from "@vivalence/typology";
```

Then replace the `Vector` function:
```js
export function Vector(thing) {
  if (!VP) loadVector();
  return VP ? thing instanceof VP : vector(thing);
}
```
With:
```js
export function Vector(thing) {
  return thing instanceof VP;
}
```

- [ ] **Step 3: Verify**

Run:
```bash
deno eval "import { is, Vector } from '@vivalence/typology'; const v = new Vector(); console.log('is.Vector:', is.Vector(v), 'is.vector:', is.vector(v));"
```

Expected: `is.Vector: true is.vector: true`

---

## Task 6: Rewrite circular imports in typology

**Files:**
- Modify: `subsystems/typology/prototypes/agent.js:3`
- Modify: `subsystems/typology/prototypes/mode.js:2`
- Modify: `subsystems/typology/tests/agent.test.js:4`
- Modify: `subsystems/typology/tests/agent.integration.test.js:4`

- [ ] **Step 1: Fix agent.js**

Line 3, change:
```js
import { Agentic } from "@vivalence/vector/compiler";
```
To:
```js
import { Agentic } from "@vivalence/typology/compiler";
```

- [ ] **Step 2: Fix mode.js**

Line 2: remove the entire import — `shards` is imported but never used in this file:
```js
import { shards } from "@vivalence/vector";
```
Delete this line.

- [ ] **Step 3: Fix agent test files**

In `tests/agent.test.js` line 4 and `tests/agent.integration.test.js` line 4, change:
```js
import { Vector } from "@vivalence/vector";
```
To:
```js
import { Vector } from "@vivalence/typology";
```

- [ ] **Step 4: Run existing typology tests**

Run:
```bash
deno test -A --no-check subsystems/typology/tests/context.test.js subsystems/typology/tests/response.test.js subsystems/typology/tests/connection.test.js subsystems/typology/tests/agent.test.js
```

Expected: All pass.

---

## Task 7: Copy and rewrite test files

**Files:**
- Copy 13 test files from vector to typology (see file map above)

- [ ] **Step 1: Create test directories**

```bash
mkdir -p subsystems/typology/tests/compiler
mkdir -p subsystems/typology/tests/controller
mkdir -p subsystems/typology/tests/shards
```

- [ ] **Step 2: Copy test files**

Copy each test file from `subsystems/vector/tests/` to `subsystems/typology/tests/` maintaining subdirectory structure. Special case: `tests/prototypes/aperture.test.js` → `tests/aperture.test.js`.

- [ ] **Step 3: Rewrite imports in all copied test files**

Every test file needs its imports rewritten. The pattern:

Replace `from "@vivalence/vector"` → `from "@vivalence/typology"`
Replace `from "@vivalence/vector/controller"` → `from "@vivalence/typology/controller"`
Replace `from "@vivalence/vector/aperture"` → `from "@vivalence/typology/aperture"`

Replace relative compiler/controller/shard imports with `@vivalence/typology` package imports:

- `from "../../compiler/http.js"` → `from "@vivalence/typology/compiler"`  (import `{ http }`)
- `from "../../compiler/object.js"` → `from "@vivalence/typology/compiler"` (import `{ object }`)
- `from "../../controller/traverse.js"` → `from "@vivalence/typology/controller"` (import `{ traverse }`)
- `from "../../prototypes/aperture.js"` → `from "@vivalence/typology/aperture"` (import `{ Aperture }`)
- `from "../../prototypes/errors.js"` → `from "@vivalence/typology"` (import `{ NotFound }`)
- `from "../../shards/cors.js"` → `from "@vivalence/typology"` then access via `shard.cors.wrap`
- `from "../../shards/websocket.js"` → `from "@vivalence/typology"` then access via `shard` namespace or direct: `import { websocket } from "@vivalence/typology"`
- `from "../../shards/serve.js"` → `from "@vivalence/typology"` then access via `import { serve } from "@vivalence/typology"`

- [ ] **Step 4: Add test tasks to typology deno.jsonc**

Add to `"tasks"`:
```json
"test/vector": "deno test -A --no-check --watch tests/vector.test.js",
"test/aperture": "deno test -A --no-check --watch tests/aperture.test.js",
"test/compiler": "deno test -A --no-check --watch tests/compiler/*.test.js",
"test/compiler/http": "deno test -A --no-check --watch tests/compiler/http.test.js",
"test/compiler/object": "deno test -A --no-check --watch tests/compiler/object.test.js",
"test/controller": "deno test -A --no-check --watch tests/controller/*.test.js",
"test/controller/traverse": "deno test -A --no-check --watch tests/controller/traverse.test.js",
"test/controller/match": "deno test -A --no-check --watch tests/controller/match.test.js",
"test/controller/walk": "deno test -A --no-check --watch tests/controller/walk.test.js",
"test/controller/invoke": "deno test -A --no-check --watch tests/controller/invoke.test.js",
"test/shards": "deno test -A --no-check --watch tests/shards/*.test.js",
"test/shards/cors": "deno test -A --no-check --watch tests/shards/cors.test.js",
"test/shards/websocket": "deno test -A --no-check --watch tests/shards/websocket.test.js",
"test/shards/serve": "deno test -A --no-check --watch tests/shards/serve.test.js"
```

- [ ] **Step 5: Run all migrated tests**

Run:
```bash
deno test -A --no-check subsystems/typology/tests/vector.test.js
deno test -A --no-check subsystems/typology/tests/aperture.test.js
deno test -A --no-check subsystems/typology/tests/compiler/http.test.js
deno test -A --no-check subsystems/typology/tests/compiler/object.test.js
deno test -A --no-check subsystems/typology/tests/compiler/benchmark.test.js
deno test -A --no-check subsystems/typology/tests/controller/traverse.test.js
deno test -A --no-check subsystems/typology/tests/controller/match.test.js
deno test -A --no-check subsystems/typology/tests/controller/walk.test.js
deno test -A --no-check subsystems/typology/tests/controller/invoke.test.js
deno test -A --no-check subsystems/typology/tests/shards/cors.test.js
deno test -A --no-check subsystems/typology/tests/shards/websocket.test.js
deno test -A --no-check subsystems/typology/tests/shards/serve.test.js
```

Expected: All pass.

---

## Task 8: Rewrite consumer imports — runtime system

**Files:**
- Modify: `systems/runtime/runtime.js`
- Modify: `systems/runtime/daemon/daemon.js`
- Modify: `systems/runtime/daemon/lifecycle/integration.js`
- Modify: `systems/runtime/daemon/lifecycle/resolution.js`
- Modify: `systems/runtime/daemon/lifecycle/population.js`
- Modify: `systems/runtime/lifecycle/resolve.js`
- Modify: `systems/runtime/lifecycle/populate.js`
- Modify: `systems/runtime/lifecycle/integrate.js`
- Modify: `systems/runtime/tests/scenario/runtime.test.js`
- Modify: `systems/runtime/tests/scenario/daemon.js`

- [ ] **Step 1: Rewrite each file**

For each file, replace all `@vivalence/vector` imports with `@vivalence/typology` equivalents. Merge lines where a file imports from both `@vivalence/vector` and `@vivalence/vector/aperture` into a single `@vivalence/typology` import.

Examples:

`runtime.js` lines 2-3:
```js
import { Vector } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
```
→
```js
import { Vector, Aperture } from "@vivalence/typology";
```

`daemon/daemon.js` lines 2-3:
```js
import { Vector, shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
```
→
```js
import { Vector, Aperture, shards } from "@vivalence/typology";
```

`daemon/lifecycle/population.js` lines 5-6:
```js
import { Vector, compiler, controller } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
```
→
```js
import { Vector, Aperture, compiler, controller } from "@vivalence/typology";
```

Same pattern for all other files in this list.

- [ ] **Step 2: Run runtime scenario tests**

Run:
```bash
deno test -A --no-check systems/runtime/tests/scenario/
```

Expected: Tests pass (or match pre-migration state — some may have pre-existing issues).

---

## Task 9: Rewrite consumer imports — shell, html, registry

**Files:**
- Modify: `systems/shell/trajectories/index.js`
- Modify: `systems/shell/lifecycle/call.js`
- Modify: `systems/shell/lifecycle/run.js`
- Modify: `systems/html/client.viva.js`
- Modify: `systems/html/src/routes/[...viva]/lib/populate.js`
- Modify: `registry/kernels/@vivalence/domain/learning/aperture/index.js`
- Modify: `registry/kernels/@vivalence/domain/learning/modes/index.js`
- Modify: `registry/services/@vivalence/nlp/service.viva.js`
- Modify: `registry/services/@vivalence/hallucinator/hal/tests/hallucinator.test.js`
- Modify: `registry/modes/@vivalence/tactic/test/test.viva.js`
- Modify: `registry/wafers/@vivalence/variant/multiplayer/server/daemon.viva.js`
- Modify: `systems/runtime/daemon/mode/view-bundler.js`

- [ ] **Step 1: Rewrite shell imports**

`shell/trajectories/index.js`:
```js
import { Vector } from "@vivalence/vector";
```
→
```js
import { Vector } from "@vivalence/typology";
```

`shell/lifecycle/call.js`:
```js
import { controller, compiler } from "@vivalence/vector";
```
→
```js
import { controller, compiler } from "@vivalence/typology";
```

`shell/lifecycle/run.js`:
```js
import { controller, errors } from "@vivalence/vector";
```
→
```js
import { controller, errors } from "@vivalence/typology";
```

Note: `errors` here refers to the vector errors namespace. After migration, it's available as the `errors` re-export from `prototypes/errors/index.js` via `prototypes/index.ts`. Verify this export exists — if not, the consumer may need `import { NotFound } from "@vivalence/typology"` directly (check what `errors` is used for in run.js).

- [ ] **Step 2: Rewrite html imports**

`html/client.viva.js`:
```js
import { Vector } from "@vivalence/vector";
```
→
```js
import { Vector } from "@vivalence/typology";
```

`html/src/routes/[...viva]/lib/populate.js`:
```js
import { Vector, controller, Context, NotFound } from "@vivalence/vector";
```
→
```js
import { Vector, controller, Context, NotFound } from "@vivalence/typology";
```

- [ ] **Step 3: Rewrite registry imports**

All registry files follow the same pattern — replace `@vivalence/vector` with `@vivalence/typology`, replace `@vivalence/vector/aperture` with `@vivalence/typology`.

- [ ] **Step 4: Rewrite view-bundler.js import map**

In `systems/runtime/daemon/mode/view-bundler.js`, lines 21-25, change:
```js
"@vivalence/vector": join(reporoot, "subsystems/vector/mod.js"),
"@vivalence/vector/typology": join(
  reporoot,
  "./subsystems/vector/typology.js",
),
```
To:
```js
"@vivalence/typology": join(reporoot, "subsystems/typology/mod.ts"),
```
(Remove both vector entries. The typology entry on line 26 already exists — just remove the vector lines.)

- [ ] **Step 5: Verify no remaining @vivalence/vector imports in active code**

Run:
```bash
grep -r '@vivalence/vector' --include='*.js' --include='*.ts' --include='*.mjs' systems/ registry/ subsystems/typology/ | grep -v '/bak/' | grep -v '/archive/' | grep -v '.ikiro/' | grep -v '#' | grep -v '\.org'
```

Expected: No results (zero remaining active imports of `@vivalence/vector`).

---

## Task 10: Remove vector from workspace

**Files:**
- Modify: `deno.jsonc` (root workspace)
- Modify: `subsystems/vector/deno.jsonc` (optional: leave or remove)

- [ ] **Step 1: Remove vector from workspace members**

In root `deno.jsonc`, remove `"./subsystems/vector"` from the workspace array.

- [ ] **Step 2: Final full test run**

Run all typology tests:
```bash
deno test -A --no-check subsystems/typology/tests/
```

Run runtime scenario tests:
```bash
deno test -A --no-check systems/runtime/tests/scenario/
```

Expected: All green.

- [ ] **Step 3: Verify vector directory can be archived**

The vector subsystem directory remains on disk but is no longer part of the workspace. It can be moved to `subsystems/vector.bak/` or left as-is for reference.
