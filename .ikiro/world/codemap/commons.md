---
paths: ["commons/**"]
---
<!-- writer: agent · derived-from: every `commons/**/*.viva.js`; hello-world `tools/ page/ tests/`; `services/{reader,nlp}`; `datamaps/libsql`; `hallucinators/*/provider`; `lighthouses/multiplayer`; 3 READMEs · verified: files 141 · `*.viva.js` 22 · README instance block `diff` IDENTICAL, mode block order-only · tests 30 files / 60 describe / 252 it / 15 snapshot fixtures, all gitignored · `console.*` 36 · probe: openrouter `provider()` → 3 faculties · limit: 19800 chars -->
# codemap: commons — the checkout's ONE package; "registry" means the marketplace only

- **shape** — `commons/` is ONE package; `commons/package.viva.js` is the whole declaration. Under it 22 `*.viva.js` (the package root included) = 21 modules. A package root is a root `*.viva.js` whose `manifest.type === "package"`.

```json
// commons/package.viva.js
{ "owner": "@commons", "type": "package", "slug": "commons", "version": "0.0.1" }
```

- **census — the lookup is `@commons/<manifest.type>/<manifest.slug>`, and the type is the MANIFEST's, never the directory.** `commons/services/nlp/` is `@commons/service/nlp-stanza`; `.../hello-world/mode.viva.js` is `@commons/demo/hello-world`. Grep a slug, not a path.
  - `@commons/package/commons` · `@commons/datamap/libsql` · `@commons/lighthouse/multiplayer` · `@commons/service/{reader,nlp-stanza}` · `@commons/hallucinator/{anthropic,deepgram,elevenlabs,openrouter}`
  - `@commons/instance/{hello-world,fixture}` · `@commons/demo/hello-world` · `@commons/fixture/language-learning` · `@commons/playground/{spawner,spawned,dealer,card,automaton,switchboard}` · `@commons/chaosmonkey/{oracle,reader,vision}`

```json
// one manifest per type family, read off disk
{ "type": "hallucinator","slug": "deepgram",    "traits": ["MONK"] }
{ "type": "service",     "slug": "nlp-stanza",  "traits": ["SERVER","DOCKER","COMPOSE","TOOLED"] }
{ "type": "playground",  "slug": "card",        "version": "0.1.0", "traits": ["APPLICATION"] }
```

- **`manifest` is METADATA and nothing else** — `{owner?, type, slug, version?, name?, description?, traits[]}`. New behavior = a sibling export, never a manifest field. HARD STOP. `CONVERSATIONAL` · `STANDALONE` · `SELFEVIDENT` are markers with empty bodies. Stamping, dedup, version resolution → `world/codemap/paladin.md`.
- **`registry` names ONLY the marketplace**: `~/.viva/registry/` (the store) · `viva registry/*` · `scope.registry` / `VIVA_REGISTRY_MOUNT`. Tapped packages live in the STORE, never the checkout — `education` · `stucatch` · `vcompany` · `young-ladys-primer` → [[project_dojo_mode]] · [[project_impara_italian_course]]. Legacy `@viva/*` survives only as synthetic test strings.
- **invisible territory** — discovery skips `bak archive slp node_modules .git .DS_Store *.bak`, so `commons/instances/bak/` and `commons/hallucinators/bak/` are on disk but unreachable. `commons/instances/localhost/` is an EMPTY dir.

## hello-world — the assembly

- **`mode.viva.js` is ASSEMBLY only**: manifest + `tools` + `app` + three re-exports. Every behaviour is a sibling file.

```js
// commons/instances/hello-world/mode.viva.js
export const manifest = {
  type: "demo", slug: "hello-world",
  traits: ["HARNESSED","CONVERSATIONAL","TOOLED","EMITTER","APPLICATION","GENERATIVE","EXPOSED","STANDALONE"],
};
export const tools = new Vector().slurp(doctor).slurp(web).slurp(research);
export const app = new App("./app/App.svelte");
export { aperture } from "./aperture.js";
export { harness } from "./harness.js";
export { emitter, generator } from "./page/index.js";
```

- **`aperture.js` opens FIVE doors** `/hello/{doctor,search,research,bot,agent}`. `/hello/research` declares `yields: v.primitives.hallucination.Packet.Response` — that declaration frames it as SSE and exempts the call from the transport timeout. `/hello/search` duplicates no fetch: it calls the same `query()` the armed `web_search` does, because the app cannot reach the `tools` Vector (TOOLED is in-process only).
- **`harness.js` sets prose at two altitudes** — `system.{hello,machine,render}` at the ROOT `use`, `system.format` on `/dialogue` only: the draw tool is reachable from every harness path, and the dock is the only reader of prose.
- **`tools/` is FLAT, 7 files** — `index.js` (barrel) · `doctor.js` (192 lines) · `web.js` (two doors; `web_read` returns an ERROR naming the fix when no reader is consumed, never a silent failure) · `wikipedia.js` (keyless client; `TIMEOUT = 6000` must stay UNDER the multiplex's ~8s or the caller gets an empty envelope with no status) · `choose.js` · `research.js` · `brief.js`.

## hello-world — the instance

- **`instance.viva.js`** declares one daemon `hello` (`kernel: ["./mode.viva.js"]`, `consume.reader`, two hallucinators keyed off `paladin.secret.get`), a libsql datamap per process (`hello` · `runtime` · `lighthouse` `.viva.db`), `runtime` + `clients.kajuit` + `services.multiplayer`, ONE top-level `lighthouse`, an env schema. **The root `README.md` "Hello, Instance!" block is BYTE-IDENTICAL to this file** (its "Hello, Mode!" block differs from `mode.viva.js` in export ORDER only) — edit both together.
- **every address derives from `${VIVA_RUNTIME_ORIGIN}`; both API keys are `.optional()`.** Values are THUNKS, resolved at hydrate, never at import.

```js
// commons/instances/hello-world/instance.viva.js — the env block, as written
export const environment = v.environment({
  VIVA_RUNTIME_ORIGIN: v.url().desc("Scheme and authority the runtime is reachable at. Every address below derives from it.").default("http://localhost:2501").group("addresses"),
  SECRET_VIVA_ANTHROPIC_API_KEY: v.string().desc("Anthropic key. Declare either provider, both, or neither — a key left blank leaves its hallucinator dormant.").group("keys").optional(),
  …
});
```

- **the instance copy is what the runtime bundles** — `~/.viva/instances/hello-world/` mirrors the checkout (only `.env`, `hello.viva.db`, `mountpoint` local); a MOVE deletes the old path there too → [[feedback_flag_day_radius]].

## hello-world — research rides the harness

- **`investigate` is four lines and no adapter.** The harness IS the researcher — turns, the em fork, the armed catalog, persistence and the stream are its job. `ROUNDS = 30` is the researcher's own budget, NOT the thread's `INTELLIGENT.rounds`. ONE handler serves both doors: the aperture yields the records, the armed tool folds them by hand, because a tool result cannot stream and `render()` throws on any close but `complete` — taking the fold, and a page already on screen, with it.

```js
// commons/instances/hello-world/tools/research.js:12-18,45-53
export const investigate = async (ctx) =>
  ctx.mode.harness.dialogue.stream({
    thread: ctx.thread ?? ctx.input?.thread,
    parts: [{ type: "text", text: ctx.input.brief }],
    system: { brief: BRIEF }, config: { rounds: ROUNDS },
  });
  async (ctx) => {
    let folded = null;
    for await (const record of await investigate(ctx)) folded = soma.transcript(folded, record);
    const { message, buffer = [] } = folded.output;   // PROJECT: only these two leave
```

## hello-world — the mint vs the steering

- **`page/index.js` exports two Vectors that are not the same thing.** `emitter` is THE MINT (`/article`) — not in `tools`, so no model reaches it; EMITTER mounts it at `mode.aperture.branch("/emit")` and `mode.emit`. It passes NO thread to `buffer.create`: the EMITTER drain binds, and the repository binds when handed one, so doing both double-advances `thread.counter`.

```js
// commons/instances/hello-world/page/index.js:33-64
export const emitter = new Vector().open(
  { nature: "/article", input: v.object({ source: SOURCE, label: LABEL, data: DATA, thread: …optional() }) },
  async (ctx) => {
    const view = await ctx.mode.generator.bundle({ kind: "svelte", source: refuse(ctx.input.source) });
    const buffer = await ctx.daemon.entities.buffer.create({
      mode: ctx.mode.entity.id, view: view.json, data: ctx.input.data ?? {},
      traits: ["LABELED"], trait: { LABELED: ctx.input.label },
    });
    return Yield.NOMINAL([buffer]);
  },
);
```

- **`generator` arms NOTHING.** GENERATIVE owns `generator_view_{render,revise,inspect,list}` and slurps this vector onto them AFTER — a node opened here WITHOUT an effect rewords the trait's valence while the trait's effect stays, and its `branch("/view").use` runs on every draw and revise: it calls `refuse(ctx.input.source)`, and on a throw sets `ctx.output = {condition:"ERROR", …}` and returns WITHOUT `next()`. `page/draw.js` `refuse()` rejects any `from`/`import(` of an `https?:` specifier — esbuild leaves it EXTERNAL, past the integrity hash.
- **the armed catalog is exactly EIGHT names** — four from the assembly, four from GENERATIVE, none from `generator`. An armed name is the aperture path joined with `_`; a consumed TOOLED service mounts under its CONSUME KEY, not `manifest.slug`. On a live daemon `fs_*` + `shell_run` sit on top → `world/codemap/runtime.md`.

```json
// commons/instances/hello-world/tests/snapshots/hello-world-catalog.snapshot.json — the names
["viva_doctor","web_search","web_read","research",
 "generator_view_render","generator_view_revise","generator_view_inspect","generator_view_list"]
```

```json
// commons/instances/hello-world/tests/snapshots/hello-world-mint.snapshot.json — one page at rest
{ "condition": "NOMINAL", "counter": 1,
  "buffer": [ { "data": { "title": "Flamingo", "sources": [ { "title": "Flamingo — Wikipedia", "url": "…" } ] },
                "view": { "entries": ["index.js"], "type": "svelte" }, "index": 0 } ] }
```

## datamap — `commons/datamaps/libsql`

- **ONE file, the daemon's only ORM door.** `config()` pins `loadStrategy: "balanced"` (never `joined`), filters falsy entities/subscribers, mounts the Migrator only when `migrations` is passed. `provider()` runs pending migrations at boot, then returns `{entities:{em, …repositories by type}, shard:{context,scope,bind,carry}, subscribe, introspect, disintegrate}`.
- **`shard.carry` re-ENTERS the live `RequestContext`** for a lazy streaming body; `RequestContext.create` there forks a fresh identity map and strands the parent turn.

```js
// commons/datamaps/libsql/libsql.viva.js:19-35,48-51,82-87
  defineConfig({ dbName, ...(contextName && { contextName }), loadStrategy: "balanced",
    entities: entities.filter(Boolean),
    subscribers: subscribers.filter(Boolean).map((Subscriber) => new Subscriber()),
    ...(migrations && { extensions: [Migrator], migrations: { tableName: "_mikro_migrations", path: migrations, transactional: false } }) });
  if (await migrator.checkMigrationNeeded()) await migrator.createMigration();
  if ((await migrator.getPendingMigrations()).length > 0) await migrator.up();
      carry: () => {
        const context = RequestContext.currentRequestContext();
        return (fn) => (context ? RequestContext.storage.run(context, fn) : fn());
      },
```

## hallucinators — `provider(service) → Faculty[]`

- **a provider returns an ARRAY of faculties**, each `{type, tune, context, channels:{in,out}, config, via:{render,stream}}`. On disk: `dialogue` (anthropic ×3, openrouter ×3), `verbatim` (deepgram ×2), `speech` (elevenlabs ×2). **`object` is DERIVED — no provider declares it** → `world/codemap/runtime.md`.

```js
// commons/hallucinators/openrouter/provider/index.js:92-108
    faculties.push({
      type: "dialogue", tune: model.tune, context: model.context,
      channels: {
        in: ["text","image","document","tool_result", ...(model.thinking ? ["thinking"] : [])],
        out: ["text","tool_use", ...(model.thinking ? ["thinking"] : [])],
      },
      config: { model: model.id }, via: { render, stream },
    });
```

```json
// probe: openrouter provider({secrets:{key}}) → 3 faculties, models
//   ["openai/gpt-5.1","google/gemini-2.5-flash","google/gemini-2.5-flash-lite"]
// faculties[0], `via` reduced to its keys:
{ "type": "dialogue", "tune": [0.8, 0.85, 0.35, 0.3], "context": 400000,
  "channels": { "in": ["text","image","document","tool_result","thinking"],
                "out": ["text","tool_use","thinking"] },
  "config": { "model": "openai/gpt-5.1" }, "via": ["render","stream"] }
```

- **the model table is overridable (`service.statics?.models ?? models`); the reasoning switch is not.** `buildParams` writes `params.reasoning = {enabled:false}` EXPLICITLY whenever the model is not a thinker or `effort === "none"`. System sections are content ARRAYS; `cache.marks` holding `context` stamps `cache_control` on the LAST one. `provider/translate.js` is the pure half, snapshot-pinned offline; `tests/provider.test.js` runs offline.

## services

- **`commons/services/reader`** — `type: "service"`, NO cortex and NO model: the caller decides which node is the article. `limits.js` holds every bound (`hops:5 timeout:15_000 bytes:2_000_000 chars:24_000 images:12`) so the pure halves never import the network half. Reached as `ctx.daemon.services.reader`, never kernelled; tests inject `fetch` and `resolve`.
- **`guard` refuses before the request leaves; `hop` re-guards EVERY redirect hop** — a guard that runs on `response.url` has already let the request out.

```js
// commons/services/reader/{guard.js:23-35, hop.js:8-23}
export const guard = async (url, resolve = Deno.resolveDns) => {
  if (!/^https?:$/.test(target.protocol)) refuse(`${target.protocol} is not http(s)`);
  if (host === "localhost" || host.endsWith(".local") || isPrivate(host)) refuse(`${host} is not a public address`);
  … if (addresses.some(isPrivate)) refuse(`${host} resolves to a private address`);
export const hop = async (url, { fetch: get = fetch, resolve } = {}) => {
  let target = await guard(url, resolve);
  for (let step = 0; step <= LIMITS.hops; step++) {
    const response = await get(target, { redirect: "manual", signal: AbortSignal.timeout(LIMITS.timeout), … });
    if (response.status >= 300 && response.status < 400 && location) {
      target = await guard(new URL(location, target), resolve); continue;
```

- **`drink()` consumes the stream, so `open()`'s return is the ONLY copy of that page there will ever be** — `{url, status, headers, title, body, bytes, capped, document, skeleton, extract(selector)}`.
- **`commons/services/nlp`** — slug `nlp-stanza`, traits `SERVER DOCKER COMPOSE TOOLED`. Exports `control` alongside `provider` + `tools`: a Vector of `/status /build /start /up /down` driving docker compose against `server/docker-compose.yml`, its root `use` casting `server/.env.source` → `server/.env` first. TOOLED transports `/classify` into an armed name.

## lighthouse, playground, fixtures

- **`commons/lighthouses/multiplayer`** — the identity service (`ATTACHED SERVICE DATAMAP SYSTEMMAP`); its kernel file is three lines of re-export over `server/index.js` (the aperture) + `provider/index.js`. `server()` layers `shard.datamap.inject` → `authority.inject` → `identity.inject` under an error `use` that turns `ERR_JWT_EXPIRED` into a 401.
- **`commons/playground/*` + `.../chaosmonkey/*`** — the trait testbed, consumed by kernel lists and 7 suites across runtime/kajuit/typology. Pairs, not singletons: `spawner`→`spawned` (render-phase rig), `dealer`→`card` (driver hub + render target, `buffer.release()`), `automaton` (self-configuring thread), `switchboard` (hot-swap stall phase + render cursor), `oracle`→`vision` (aperture calling `harness.object.render`), chaosmonkey `reader` (its own `generator`).
- **`commons/fixtures/*`** — `fixtures/data/` is NOT a module (no `*.viva.js`): a plain barrel (`seed · assemble · tiers · concretes.ts · faculties · lighthouse · live`) with exactly ONE consumer, `systems/runtime/tests/scenarios/fixtures.js`, by relative path across containers. `@commons/fixture/language-learning` is the deterministic corpus.

## how it is tested — 30 files · 60 `describe` · 252 `it` · 1 `Deno.test` · 7 snapshot tests · 15 fixtures

- **there is no commons test task.** `commons/` holds NO `deno.json*` and is no workspace member (the root `deno.jsonc` names it only in `runtime/watch`). Each file runs BY NAME: `deno test -A --no-check --config <repo>/deno.jsonc <file>` — green: catalog `6 passed (17 steps)`, guard `1 passed (7)`.
- **every snapshot fixture is git-IGNORED** (`.gitignore:30` `**/tests/snapshots/`): a fresh checkout has none, so all 7 throw at `readTextFileSync` until `SNAPSHOT_HOT=1` writes them. The same `pin()` in all 7:

```js
// test: commons/instances/hello-world/tests/catalog.snapshot.test.js:12-20
  if (HOT) {
    specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, … });
  }
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
```

- **the assembly and the mint, offline, no daemon** — `catalog.test.js` builds a literal daemon + `GENERATIVE(…)`: `"P-catalog: the armed catalog is exactly eight names"`, `P-provenance`; `doctor.test.js` `P-noknobs` + `P-novalues`. In `emitter.test.js` the DESCRIBE title IS the law: `"P-nodoublebind: one drawn page advances thread.counter by exactly one"` (`:86` `expect(rigged.row.counter).toBe(1)`); `draw.test.js` `P-noexternal`; `style.tokens.test.js` `P-tokens`.
- **research** rides `tests/rig.js` — the real `respond()` loop, scripted faculty: `"P-yield: a buffer minted inside the inner agent surfaces in the OUTER yield, and NOTHING else does"`. **All four hallucinator `provider.test.js` run OFFLINE** on `provider({secrets:{key:"fake-key"}})`. **The reader injects its network** — the resolver in `guard.test.js`, `fetch` in `hop.test.js`: `P-scheme` · `P-hop` · `S2` off `tests/fixtures/`.
- **three files need a LIVE process and carry no skip** — `nlp/tests/service.test.js` (`:5555`), `multiplayer/tests/{auth,lighthouse}.test.js` (`:1729`); `tokenize.test.js` self-skips unless `import stanza` succeeds.
- **gaps**, grep `commons systems subsystems ~/.viva/registry --include=*.test.*`: `hello-world/instance.viva` → 0 · `fixtures/data` → 0 · `nlp/service.viva` → 0 · `package.viva.js` → 0 (4 synthetic hits) · `datamaps/libsql` → 1, in `systems/runtime/`.

## where to read the live system

- **the doctor fold is this container's real tap.** `report()` (`commons/instances/hello-world/tools/doctor.js:63-165`) returns `daemon` (mountpoint, statics, datamap + entities, resolved kernel with traits and routes, hallucinators + their secret SLOT NAMES, `cortex`, `dormant`, `faults`) · `ledger` (instances, services, clients, `requirements` with `unset`, `environment` by NAME) · `registry` (locations, `stale`, every pensieve module). Names, never values. READ IT: `/hello/doctor`, or armed `viva_doctor`.
- **spans** — the only span writer in `commons/` is `commons/playground/chaosmonkey/oracle/aperture.js`: notes `input`, `render`, `turn/user`, `turn/assistant`, closes, returns `trace: span.records` IN THE RESPONSE BODY. READ IT: call `/oracle/…` and read `trace` off the reply.
- **drains** — two: `commons/hallucinators/deepgram/provider/index.js:61` `inbox.drain()`, `commons/instances/hello-world/tests/rig.js:47` `soma.drain(turn)`. **No datasink in `commons/`.**
- **`console.*` = 36 lines in 10 files**, a third commented: `commons/services/nlp/service.viva.js:35-81` (14 — the compose control narrates every verb) · `commons/lighthouses/multiplayer/server/index.js:17,26` (`error.name` + `error.code` for every throw in the lighthouse) · `commons/playground/chaosmonkey/oracle/emitter.js:37` (`{render, span.records, buffer}`) · `.../oracle/buffer/Oracle.svelte:18` (`client.pipe.tap` — every wire record, in the browser).
