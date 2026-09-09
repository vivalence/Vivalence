---
paths: ["systems/runtime/**"]
---
<!-- writer: agent · derived-from: run.js die.js runtime.js deno.jsonc lifecycle/* daemon/** tests/** · verified: find systems/runtime → 173 files · console.* → 103 (25 outside tests/bak) · span|mark|chronicle grep → 1 site, a test · 3 probes · tests → 51 files / 267 cases / 36 fixtures · limit: 22000 chars -->
# codemap: runtime — the process that serves daemons: a Die cascade over Deno.serve, modes wired by traits, entities through MikroORM

## boot — one cascade, four verbs

- **`systems/runtime/run.js`** is the whole entrypoint: paladin mounts the instance, **the ONE gate throws**, a `Die` populates, and only `import.meta.main` resolves/integrates/perpetuates — importing it gets a POPULATED die, not a serving one.
- **`Die`** (`systems/runtime/die.js`) extends typology's `Wafer`; `die.good` is a `Runtime` (`server`, `aperture`, `twitch`, `ters`, `daemons[]`, `processes[]`) and its `manifest` is READ from `paladin.instance.runtime`. `perpetuate` traps SIGTERM/SIGINT/SIGQUIT into `disintegrate()` then `Deno.exit(0)`; children disintegrate BEFORE the abort.

```js
// systems/runtime/run.js:4-23
const run = await (async function () {
  await paladin.instance.mount();
  paladin.check.instance(paladin.instance).throw();
  const die = new Die({ good: new Runtime() }); await die.populate(); return die; })();
if (import.meta.main) { await run.resolve(); await run.integrate(); await run.perpetuate(); }
```

- **runtime lifecycle** (`systems/runtime/lifecycle/`): `populate.js` mints a `DaemonDie` per instance daemon and a `ProcessDie` per service declaring `ATTACHED` **and** exporting `aperture`; `resolve.js` attaches `/attached/bundle/**` (APPLICATION **or** GENERATIVE, `x-viva-integrity`) and `/attached/cargo/**` (FRAUGHT **or** MOUNTED, `etag`/`304`/`206`); `integrate.js` `cors.wrap`s `shape.http(aperture)` into `Deno.serve` and announces to the lighthouse. **`Deno.serve` binds what the URL says**: `[::1]` while `fetch` picks `127.0.0.1`.

## the daemon Die

- **`Die.resolve`** runs each child's FULL lifecycle (`populate`/`resolve`/`integrate`) before `attach`/`expose`/`metadata`. In **`daemon/die.js`**: `core`/`wiring`/`datamap`/`authority`/`acid`/`modes`/`handlers`/`services`, then `resolution.{domain,modes,freight}` + `aperture.{datamap,userspace,modes,freight,metadata,cortex}`, then `call`+`prune`. `disintegrate` runs mode `terminators` FIRST, then closes the datamap. **`integration.call`** makes the daemon reachable in-process — a `Connection` over `shard.transmitter.inline(shape.http(aperture))`.
- **`population.core`** casts the one `manifest.type === "domain"` kernel entry to `v.primitives.kernel.Domain` and folds `{...traits, ...domain.traits}` — **a domain can ship trait implementations and they win**. `acid` builds the `Cortex`; a provider that throws costs ONE `console.warn`, not the boot. **`prune`** drops DB modes absent from config.

## the entity tier fold — `collate` overrides, subscribers accumulate

```js
// systems/runtime/daemon/lifecycle/population.js:33-63
const collate = (tiers) => { const slots = {};
  for (const tier of tiers) for (const descriptor of Object.values(tier)) {
    const slot = (slots[descriptor.type] ??= { type: descriptor.type, subscribers: new Set() });
    slot.entity = descriptor.entity ?? slot.entity; slot.schema = descriptor.schema ?? slot.schema; slot.repository = descriptor.repository ?? slot.repository;
    if (descriptor.subscriber) slot.subscribers.add(descriptor.subscriber); }
  return Object.values(slots); };
const seal = (slot) => !slot.schema.meta.abstract ? slot : { …slot, schema: new EntitySchema({ class: slot.entity, extends: slot.schema, … }) };
const instance = collate([sets.daemon, sets.kernel, sets.userspace, die.good.domain.entities]).map(seal);
```

- **LAW: schema/entity/repository OVERRIDE by type, subscribers ACCUMULATE** (a `Set`); `sets.network {identity,daemon}` is the lighthouse's and never collated. Collapsing subscribers by type drops the base one — a Literal's base subscriber and the domain's both fire. [[project_entity_variant_assembly]] `seal` concretizes any slot whose schema is still `meta.abstract`.
- **`daemon/entities/`** is the mikro reification: `DataEntity`/`DataRepository`/`DataSchema`, `VirtualEntity`, `trait`, the twelve `*Entity` classes — all on the `@vivalence/runtime` MAIN barrel; `/scenarios`, `/daemon`, `/daemon/traits`, `/process` are subpaths. **GOTCHA: explicit exports SHADOW star exports silently** — take lowercase names from `sets.<tier>.<name>`, never the barrel.
- **lineage is NOT symmetric**: `Thread.parent` m:1 `deleteRule:"cascade"`, but `Turn.parent` is nullable with **no** deleteRule. `Buffer.thread`/`Buffer.mode` cascade; `Turn.mode` is `set null`. Schema deltas land as the migration the datamap mints at boot — restart, never hand-write a migration.

## Buffer — ONE mint, always LABELED

```js
// systems/runtime/daemon/entities/userspace/Buffer.ts:25-34
async create({ thread, literals, symbols, ...fields }: any) {
  const bound = thread ? await this.em.findOneOrFail(ThreadEntity, thread) : null;
  const buffer = super.create({ ...fields, ...(literals && { literals: await … findByIdentifiers(literals) }) });
  bound?.bindBuffer(buffer);
  return buffer; }
```

- **LAW: every query first, the mint last** — a query auto-flushes a pending row, and a row flushed before its seat is taken is named for the wrong index. **`ThreadEntity.bindBuffer` is the ONLY `counter++`**: `buffer.index = this.counter++`.
- `BufferSubscriber.beforeCreate` **never reads `data`**: a claimed `LABELED` is left whole, an unclaimed one gets `LABELED: { name: "<mode.slug> #<index>" }`. Clients read `trait.LABELED.name` ONLY. `SELFEVIDENT`/`CONVERSATIONAL`/`STANDALONE` are marker traits the CLIENT reads.

```json
// probe: BufferRepository.create({thread, mode, data}) → flush → the row at rest
{ "id": "01a08864-da99-71af-ba0b-524136a83fe2",
  "createdAt": "2026-09-09T22:58:26.073Z", "updatedAt": "2026-09-09T22:58:26.073Z",
  "status": "PENDING", "index": 0, "data": { "title": "Marginalia" }, "view": null,
  "traits": ["LABELED"], "trait": { "LABELED": { "name": "dewey #0" } },
  "mode": "01a08864-da88-76fa-a127-b1c0746d6f97", "thread": "01a08864-da8c-74ef-b383-321620c36e22",
  "literals": [], "symbols": [] }
```

## traits — `stagger` is the applier

```js
// systems/runtime/daemon/traits/index.js:5-21
export async function stagger(mode, daemon, traits) {
  const finalizers = [];
  const at = `${mode.manifest.type}/${mode.manifest.slug}`;
  for (const trait of mode.manifest.traits) {
    if (!traits[trait]) console.warn(`[trait] ${at} declares ${trait}, which nothing implements`);
    const result = await traits[trait]?.(mode, daemon);
    if (is.fn(result)) finalizers.push(result);
    else if (is.object(result)) {
      if (is.fn(result.finalize)) finalizers.push(result.finalize);
      if (is.fn(result.terminate)) (mode.terminators ??= []).push(result.terminate); } }
  return finalizers; }
```

- **Two phases.** `resolution.modes` runs every mode's traits, then `Promise.all(finalizers)`, then slurps each `mode.aperture` under `/daemon/<slug>/mode/<type>/<slug>` behind `authorize()`. Terminators run at disintegrate BEFORE the datamap closes. **A declared trait nothing implements → ONE `console.warn`, never a silent no-op.** `EXPOSED` sets `mode.call = shape.proxy(mode.aperture)` — default strategy, unlike `daemon.call`'s.
- **Identity IS the manifest.** `mode.slug`/`mode.type`/`mode.traits` do not exist — every read is `mode.manifest.*`, and a kernel entry may declare its own `manifest`, so one module kernelled twice is two modes. THE EXCEPTION IS THE ROW: `ModeEntity` keeps flat `slug`/`type`/`traits`/`installed`, unique on `(slug, type)`. **The citizen carries a manifest; the row stays flat.** [[project_manifest_is_identity]]
- **`FRAUGHT` / `MOUNTED`** — two traits over one `carry(mode, daemon, root)`, which walks the root, `stow`s a `Freight`, hangs it off `daemon.attach/cargo/<daemon>` and opens `/freight`. FRAUGHT roots at `join(module.mount.dirname, module.freight.path.nature)` — what a mode CARRIES; MOUNTED at `mode.mountpoint.absolute` — the tree it SERVES — and **throws by name** when the kernel names none. Every consumer asks FRAUGHT **or** MOUNTED. [[project_freight_vs_mountpoint]]
- **`APPLICATION`** — `mode.app = new App(entry|{source}, schema)`, entry `resolve(mode.module.mount.dirname, declared.mount)`; dot segments collapse and the bundler's lookup depends on it. `mode.app.buffer(desc)` fills with `mode.app.fill(desc)` — **`fill` (Default-only), never `cast`**, whose Convert pass mauls MikroORM Collections. In DEV `/metadata/app` recompiles per read — the ONLY seam that refreshes a view.
- **`DATASET`** — no-ops when `mode.entity.installed` is truthy. Sources (`load`/`rows`/`walk`/`read`) upsert in chunks of 100 on a FORKED em, then a link phase. **A declared source is SCHEME, shared by every mounting; a computed `load` source is the mounting's OWN, stamped with `mode` as owner** — two mountings keep two row sets under the same slugs. `stamp(mode)` hashes the sources *and the installer itself*. [[project_mode_owns_rows]]
- **`DATASINK`** — rows back out to registry files. `DATASPACE = {symbol, literal}`; a user-scoped type is **refused by throw**. Twitches on `/after/<type>/{create,update,delete}` gated on `armed`, debounced 1500 ms with a cancelling `terminate`; `drain()` is single-flight. **LAW: the dataspace carries NO provenance.** [[project_dataspace_has_no_provenance]]
- **`INTENTED`** — `ensure()` self-supplies each user via `em.setFilterParams` and opens `/after/user/create`, so a NEW user gets every INTENTED peer's intents. The intent is a TEMPLATE: `Thread.beforeCreate` copies `intent.traits`, merges `intent.trait`.
- **`BOOTED`** — `mode.module.boot(daemon, mode)` runs as a FINALIZER; what it returns is the teardown. **`AGENTIC`** slurps every TOOLED peer's tools into `mode.tools.branch(peer.manifest.slug)`, `type !== "domain"` filtered.

## EMITTER — the pool drains, the thread binds

```js
// systems/runtime/daemon/traits/emitter.js:42-72
emitter.use(async (ctx, next) => {
  ctx.pool = new Pool();
  await next();
  if (is.yieldish(ctx.output) || is.buffers(ctx.output)) ctx.pool.add(ctx.output);
  const result = await ctx.pool.drain();
  if (ctx.thread && result.condition === "NOMINAL")
    for (const buffer of result.output.buffer) ctx.thread.bindBuffer(buffer);
  await daemon.entities.em.flush(); ctx.output = result; });
return () => { mode.aperture.branch("/emit").slurp(emitter); mode.emit = shape.object(emitter); };
```

- **The drain BINDS every buffer it drains** — the mint inside an emitter passes NO thread, or the counter advances twice. `thread` is optional: standalone modes emit without one. **The emitter is NOT armed as a tool**; a tool that draws delegates to it.

```json
// probe: mode.emit.present({thread}) → the emission in motion
{ "kind": "emission", "condition": "NOMINAL",
  "output": { "buffer": [ { "id": "01a08865-6229-7397-b5fc-9c208319d190",
    "status": "PENDING", "data": { "layout": "table", "title": "Test" }, "view": null,
    "index": 0, "traits": ["LABELED"], "trait": { "LABELED": { "name": "probe #0" } } } ] } }
```

## GENERATIVE — the model draws its own pages

- `mode.generator = {bundle, inspect, serve, tools}` over `paladin.bundler(<daemon.mountpoint>/bundles/<type>/<slug>)`; **throws when the daemon carries no mountpoint**. There is NO `generator.buffer` — the tools mint through the repository themselves.
- Four tools under `/view`, armed at `/generator`: **`render`** (compile → mint a LABELED buffer → return the row; `label` REQUIRED) · **`revise`** (the SAME row by id, merging `view`/`label`/`data`) · **`inspect`** (source by hash prefix) · **`list`**. `mode.module.generator` is a STEERING vector slurped on AFTER.

## HARNESSED — the armed stack, assembled per call

```js
// systems/runtime/daemon/traits/harnessed.js:47-105 (trimmed)
const iq = shard.trait.claimed(row, "INTELLIGENT", v.entities.INTELLIGENT);
const armed = new Vector().slurp(skills.entity.entity).slurp(skills.buffer.buffer).slurp(skills.thread.thread);   // unconditional — a daemon always has entities; skills/index.js exports NAMESPACES (`export * as entity`), the vector is `entity.entity`
if (mode.module?.mount?.dirname) { armed.use(shard.context.bind("root", …)); armed.slurp(paladin.skills.fs.fs).slurp(paladin.skills.shell.shell); }   // same meta on paladin: `paladin.skills.fs.fs`, `paladin.skills.fs.resolve`
for (const [slug, service] of Object.entries(daemon.services ?? {})) armed.branch(`/service/${slug}`).slurp(service.tools);
if (daemon.domain?.tools) armed.branch("/" + daemon.domain.manifest.slug).slurp(daemon.domain.tools);
if (mode.tools) armed.slurp(mode.tools);
if (mode.generator?.tools) armed.branch("/generator").slurp(mode.generator.tools);
armed.use(shard.context.bind("daemon", daemon)); armed.use(shard.context.bind("mode", mode));
if (ctx.user) armed.use(shard.context.bind("user", ctx.user)); if (input.thread) armed.use(shard.context.bind("thread", input.thread));
ctx.hallucination = { policy: { ...config, ...(iq.tune && { tune: iq.tune }), ...(iq.rounds && { rounds: iq.rounds }), ...(tune && { tune }) },
  ...(iq.effort && { settings: { effort: iq.effort } }), system: …, turns: …, tools: armed };
```

- **Seven keyed layers, later wins**: ① runtime skills (`daemon/skills/*`; `entity_find` returns `DataRepository.card`, the agent projection `{id, slug, traits}`) ② paladin `fs_*`+`shell_run`, gated on `mode.module.mount.dirname` ③ `/service/<slug>` ④ the domain ⑤ `mode.tools` ⑥ `/generator` ⑦ invocation-supplied tools. Names join with `_`. [[project_agentic_tool_naming]]
- **LAW: `armed` binds daemon, mode, user and thread ITSELF** — a toolless HARNESSED mode still has every skill, and every tool's ctx carries the caller's identity.
- **`system.thread` — the runtime's own section, LAST** (`harnessed.js` `standing()`, root `use` registered AFTER the mode-harness slurp so it lands after every mode section): `[Thread id] · label · phase · buffers minted N (Thread.counter IS the buffer counter, `Thread.ts:55`) · traits · user`, `[Mode type/slug] name · traits · mountpoint`, then one row per buffer on the thread (`index · id · label · mode · status · data KEYS · view hash`) naming `buffer_update` / `buffer_label` / `entity_find` as the doors. Volatile per turn, so it also sets `ctx.hallucination.cache = { marks: [<last stable key>, "tools"] }` — the breakpoint sits on the section BEFORE it (translate.js:103 marks by key), the system bag stays cached, only this block re-bills. Pinned by `tests/harness.thread.test.js` (order, rows, marks). Skipped without `input.thread`.
- **`INTELLIGENT` and `VOCAL` are CLAIM-GATED** through `shard.trait.claimed`, validated against `v.entities.*` before any field is projected: `tune`+`rounds` → `policy`, `effort` → `settings`. Precedence is the assignment operator — invocation > thread > mode; modes DEFAULT with `??=`, MANDATE with `=`.
- **`/dialogue` is a BRANCH, not the root.** It chains the user Turn onto `turn.history()`, then folds the response with `soma.transcript` into `TurnEntity` rows **on a FORKED em** — one unit of work: a tool flushing the root em cannot carry half a response out, and a throw `em.clear()`s it. `/verbatim` is a duplex stream (`feeds: Audio.Packet`).
- The domain harness slurps BEFORE the mode's; `dialogue` and `object` each get `render`+`stream` onto `daemon.cortex.hallucinate[type]`, published as `mode.harness = shape.object(harness, steer.strategy.echo)`. → Request/Cortex live in `world/codemap/typology.md`.

```json
// probe: dewey.harness.dialogue.stream({tools:{lookup}}) → the tool seam in motion
{ "event": "/tool/call", "id": "t1", "name": "lookup", "input": { "query": "what is casa" } }
{ "event": "/tool/yield", "id": "t1",
  "result": { "condition": "NOMINAL", "output": { "object": { "definition": "what is casa means house" } } } }
```

- **`daemon.call`** (`daemon/lifecycle/resolution.js:11`) is `shape.proxy(domain.aperture, steer.strategy.direct)`, compiled PRE-slurp: a daemon-root `authorize()` would 401 headerless internal calls. `direct` threads the caller's user/mode/thread, so a tool's `daemon.call[…]` mints rows with real owners.

## aperture — two gates, one enrollment

```js
// systems/runtime/daemon/aperture/userspace.js:6-29 · daemon/lifecycle/resolution.js:74-78
branch.use(shard.secure.authenticate());
branch.open("/handshake", async (ctx) => ({ success: true, user: await ctx.identity.enroll() }));
const owned = branch.branch("/entities").use(shard.secure.authorize())
  .use(daemonDie.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));
owned.branch("/buffer").use(shard.datamap.scope(…)).slurp(shard.datamap.repository(entities.buffer)).slurp(shard.datamap.reactive(entities.buffer, twitch, …));
// resolution.modes — the same pair on every mode branch
daemonDie.good.aperture.branch(mode.mount.nature).use(shard.secure.authorize())
  .use(daemonDie.datamap.shard.bind("user", …)).slurp(mode.aperture);
```

- **`authenticate()` = token → `ctx.identity`**, on the daemon ROOT and on `/userspace`. **`authorize()` = identity → `ctx.user`, READS ONLY** (`401 USER_NOT_FOUND — /userspace/handshake first`), on `/userspace/entities` and EVERY mode branch. **Enrollment happens in exactly ONE place**: `/userspace/handshake`. `bind("user")` sits behind `authorize()`. [[project_user_bind_behind_authorize]]
- **Surfaces**: `/entities/{literal,symbol,mode}` (unscoped) and `/userspace/entities/{intent,thread,buffer,turn}` (owned + scoped), each repository + reactive; `/modes/:type/:method` (only `findOne`); `/cargo`; `/cortex/{render,stream}`, cast against `{type, tune?, request}` first; `/metadata/*`.
- **`/metadata` is trait-conditional**: daemon-level `manifest`/`statics`/`cargo`/`datamap`/`aperture`/`cortex`/`modes`; per mode `manifest`+`aperture` always, then `statics`, `mountpoint`, `app`, `emitter`, `freight`, `harness`, each gated on its trait. All `shape.strip`ped — **the strip IS the contract.** An async generator handler IS SSE (`shape.http`) — the only escape from kajuit's 8000 ms daemon-call timeout. [[project_aperture_streaming_sse]]

```json
// systems/runtime/tests/snapshots/tactic-harvest-aperture.snapshot.json — a mode's /metadata strip, over the wire
{ "manifest": { "type": "tactic", "slug": "harvest", "name": "Harvest", "version": "0.1.0",
    "traits": ["CONVERSATIONAL", "HARNESSED", "TOOLED"], "owner": "@education" },
  "routes": [ { "path": "/status" }, { "path": "/manifest" },
    { "path": "/harness/verbatim/stream", "yields": true, "feeds": "object" },
    { "path": "/harness/dialogue/render" }, { "path": "/harness/dialogue/stream", "yields": true },
    { "path": "/harness/object/render" }, { "path": "/harness/object/stream", "yields": true } ] }
```

## how it is tested

**51 files · 267 cases** (`specimen.it` 237, `it` 26, `Deno.test`/`test` 4) **· 36 snapshot fixtures.** `tests/scenarios/` is the cheap rung (in-memory); the rest want `:2501`.

- **boot** — `runtime/disintegrate.test.js` *"disintegrate idempotent under concurrent shutdown signals"*; `registry.count.test.js` runs `lifecycle/populate.js`'s `registry` as a CENSUS, not a count.

```js
// test: tests/runtime/disintegrate.test.js:9-12
await Promise.all([die.disintegrate(), die.disintegrate()]);
assertEquals(die.status.is("STOPPED"), true); assertEquals(die.abort.signal.aborted, true);
```

- **Buffer** — `buffer.labeled.test.js` *"the repository's create is the ONE mint: a thread id binds and takes the next seat"*.

```js
// test: tests/buffer.labeled.test.js:70-77
const first = await daemon.entities.buffer.create({ mode: fixtures.dewey.id, thread: thread.id });
specimen.expect([first.index, second.index]).toEqual([0, 1]); specimen.expect(thread.counter).toBe(2);
specimen.expect(stored.map((r) => r.trait.LABELED)).toEqual([{ name: "dewey #0" }, { name: "dewey #1" }]);
```

- **traits** — `mode/tooled.test.js` *"['TOOLED', 'HARNESSED'] produces working harness"* and the reverse order; `mode/traits.test.js` pins INTENTED, APPLICATION, EXPOSED, EMITTER, BOOTED. `stagger` itself is invoked in ONE test:

```js
// test: tests/datasink.drain.test.js:118-121
const finalizers = await stagger(staggered, daemon, { DATASINK });
specimen.expect(finalizers.length).toBe(1); specimen.expect(staggered.terminators.length).toBe(1);
```

- **EMITTER, GENERATIVE, DATASET** — *"persisted buffer has correct index from thread counter"*, *"revise keeps the SEAT — same id, same index, counter unmoved"*, *"throws rather than installing anything outside the dataspace"*.
- **HARNESSED, gates** — *"a tool that flushes the root em mid-response does NOT persist the tool_use turn early"* (`turn.unit-of-work.test.js`), *"a fresh identity is refused the userspace until it handshakes"* (`daemon/userspace.test.js`).
- **fixtures** — `tests/snapshots/*.snapshot.json` is GITIGNORED (`.gitignore:30`); the ONE tracked fixture is `tests/fixtures/corpus.snapshot.json`. `SNAPSHOT_HOT=1` regenerates: `deno task --cwd systems/runtime test/snapshots`. One file: `deno test -A --no-check --config <repo>/deno.jsonc <file>` — `deno task test` is `--watch` and never exits. [[project_corpus_snapshot_regime]]
- **gaps** (`grep -rl` over runtime + repo + `~/.viva/registry` tests → **0** each): `collate`/`seal(` (the tier fold) · `prune(` · `carry(`/FRAUGHT/MOUNTED · `ProcessDie` · `perpetuate` · `x-viva-integrity`/`/attached/*`.

## where to read the live system

- **spans: the runtime emits NONE.** `grep -rn "\.mark(\|span\.\|chronicle" systems/runtime` → 1 hit, a test (`tests/span-tracked.snapshot.test.js:29`). Nothing in `daemon/` or `lifecycle/` opens a span — **the absence IS the finding**; to trace a call you compose `shard.track.span` yourself, as that test does.
- **drains** — `mode.datasink.drain({all?})` is the only one here: `deno task --cwd systems/runtime playground/drain`.
- **console.\*** — 103 in the territory, **25 outside `tests/` and `bak.belt/`**: `lifecycle/integrate.js:34` `launching on <url>`, `:22` the 60 s patrol; `traits/index.js:10` `[trait] … nothing implements`; `traits/dataset.js:16` `[DATASET:install] <phase> <done>/<total>`; `lifecycle/population.js:118` `[provider] … refused`; `integration.js:15` `pruned mode|intent:`.
- **taps**: `/metadata/{daemons,instance,services,aperture}`; `/daemon/<slug>/metadata/{modes,datamap,cortex}`; `…/mode/<t>/<s>/metadata/harness` for the armed surface; `<slug>/status`.
- **dev loop** — `runtime/watch` watches `../../commons` + `$HOME/.viva/registry` ONLY: a repo edit does NOT restart it, a tapped mode DOES. → `world/ledger.md`
