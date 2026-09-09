---
paths: ["subsystems/**", "systems/**", "commons/**"]
---
<!-- writer: agent · derived-from: commons/datamaps/libsql, runtime traits/ + aperture/metadata.js, typology trait.js, every deno.jsonc + tests/ · verified: init 6/6 ride config(); --watch 5/6; 239 tests, 1241 it(, 27 snapshots, 70 fixtures; 2 green · limit: 8800 -->
# codemap: cross-container invariants — laws no single container owns

## the datamap seam — `commons` writes the config, everyone spreads it

- **`loadStrategy: "balanced"` is declared ONCE**, in `commons/datamaps/libsql/libsql.viva.js` `config()`; all 6 `MikroORM.init` sites spread it — the provider (`:38`), 4 under `systems/runtime/tests/`, `commons/fixtures/data/lighthouse.js:15`. **To-many populates are SELECT-IN, never JOINED** — JOINED + a limit + an unconstrained to-many `where` gives `symbols^k` rows per literal; an `init` that builds its own object re-opens the hole.

```js
// commons/datamaps/libsql/libsql.viva.js:16-27
const config = ({ dbName, contextName, entities, subscribers = [], migrations }) =>
  defineConfig({
    loadStrategy: "balanced",
    subscribers: subscribers.filter(Boolean).map((S) => new S()),
```

```json
// probe: config({dbName:":memory:", entities:[…], migrations:"/x/migrations"}) →
{ "driver": "[fn SqliteDriver]", "dbName": ":memory:", "loadStrategy": "balanced",
  "contextName": "hello-world.viva.db", "entities": [{ "name": "Buffer" }],
  "subscribers": [], "extensions": ["[fn Migrator]"],
  "migrations": { "path": "/x/migrations", "transactional": false } }
```

- **mikro owns the db** — never author a migration; `libsql.viva.js:47-50` runs `createMigration` + `up` at provider time. Entity filters do NOT reach inside `$none`/`$some` subqueries: carry the owner, set params through the shard binder (`libsql.viva.js:70-77`, `runtime/daemon/traits/intented.js:5`). `em.remove` cascades over what is LOADED (`daemon/lifecycle/integration.js:14`); a subscriber hook cannot flush.
- **entity traits become mikro subscribers** — `systems/runtime/daemon/entities/base/trait.js` folds each trait's `hooks` into one `ComposedSubscriber` that `config().subscribers` instantiates.

## trait grammar — declarative metadata, functional dispatch

- **Read a trait as a CLAIM, never a value**: `traits.includes("X")` gates, `trait?.X` may legitimately be `null`. `subsystems/typology/gestalten/shard/trait.js` is the one correct read; panels reaching straight for `row.trait?.NAME` (`systems/kajuit/src/app/panels/f/f.svelte:14`) skip the gate. Prove a trait from the surface it CAUSES.

```js
// subsystems/typology/gestalten/shard/trait.js:3-8
export function claimed(row, name, schema) {
  const value = row?.traits?.includes(name) ? row.trait?.[name] : undefined;
  if (!value) return {};
  if ([...v.errors(schema, value)][0]) return {};
  return v.cast(schema, value);
}
```

- **`stagger` is TWO-PHASE**: every trait factory runs first, the returned closures only after — a trait may depend on a sibling's aperture without ordering itself.

```js
// systems/runtime/daemon/traits/index.js:5-21
for (const trait of mode.manifest.traits) {
  const result = await traits[trait]?.(mode, daemon);
  if (is.fn(result)) finalizers.push(result);
  else if (is.object(result)) { … }
}
return finalizers;
```

## STRIPWIRE — one Vector, callable on both sides

- **A trait's ONE Vector is stripped on the daemon, wired on the client.** `systems/runtime/daemon/aperture/metadata.js` opens root strips (`manifest,statics,cargo,datamap,aperture,cortex,modes`) and per-mode strips (`+ mountpoint,app,emitter,freight,harness`); kajuit's `src/typology/entities/mode/traits/` re-hydrates the same spelling. Contract is node-centric `{effect?, branches}`; the ROOT effect strips and wires ("no path is a path").
- Symmetric: EMITTER · HARNESSED · EXPOSED (`shape.proxy` → `mode.call`) · cortex. Unwired: APPLICATION · TOOLED (`metadata.js:44` commented, in-process only).

```js
// systems/runtime/daemon/aperture/metadata.js:42  (daemon)
if (mode.implements("EMITTER")) meta.open("/emitter", () => shape.strip(mode.module.emitter));
// systems/kajuit/src/typology/entities/mode/traits/emitter.js:30  (client)
mode.emit = shape.connection.wire(emit, mode.metadata.emitter);
```

## emission — a buffer binds its thread ONLY in the drain

- **The EMITTER drain is the single binding site.** A mint passes NO thread, or the counter advances twice; cross-mode delegation forwards `ctx.input.thread` before the inner flush; results feed `ctx.pool`. `bindBuffer` has one product site; every other hit is a test double.

```js
// systems/runtime/daemon/traits/emitter.js:54-63
const result = await ctx.pool.drain();
if (ctx.thread && result.condition === "NOMINAL") {
  for (const buffer of result.output.buffer) ctx.thread.bindBuffer(buffer);
}
await daemon.entities.em.flush();
```

## bundling — a barrel is free until you spread it

- **An object spread of namespace imports pins the WHOLE barrel.** `export const map = {...ns}` at module scope forces every member module to evaluate; esbuild drops nothing. Measured on a 4000-export fixture: ~3400× the star form (probe below). An aggregate map belongs in its OWN module. `subsystems/typology/schematics/index.js:7-27` builds the `v` facade by top-level MUTATION of imported bindings — a side effect esbuild keeps, so Typebox rides into every client bundle. [[project_bundle_tree_shaking]]

```json
// probe: esbuild bundle+minify, one member consumed
{ "export * from": "87 B", "export * as ns": "95 B", "{...ns} spread": "323396 B" }
```

## paths, transport, lifecycle

- **A path is not a URL.** `URL.pathname` escapes: decode out, encode per SEGMENT in — `typology/prototypes/freight.js:28`, `paladin/skills/fs.js:11`. Never raw `fetch` where a `Connection` exists; the transport chain carries auth.
- **`populate → resolve → integrate → disintegrate`**, parent cascading to children ([[totems]] wafer), at every tier: `systems/runtime/{run.js:11-21,die.js:15-48}`, mirrored in `daemon/die.js` + `process/die.js`. State is data, never a class boot.

## how it is tested — 239 files · 1241 `it("` · 139 `Deno.test(` · 27 snapshot tests · 70 fixtures under `tests/snapshots/`

- **`deno task test` is a WATCHER** (`--watch` in 5 of the 6 test tasks; dapper alone is one-shot), so a verdict means ONE file: `deno test -A --no-check --config /Users/finn/vivalence/code/vivalence/deno.jsonc <file>`. **42** more `*.test.*` sit under `~/.viva/registry`, run by no task.
- **One suffix, TWO snapshot families.** FROZEN (9) read the committed fixture and `toEqual` it, regenerated by `SNAPSHOT_HOT=1`; CAPTURE (15) hold a file-local `const DRY = false` and REWRITE the fixture every run, asserting inline only — a capture snapshot cannot go red on drift.

```js
// test: systems/runtime/tests/cortex-contract.snapshot.test.js:11-13
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
```

- **The corpus invariant** — `systems/runtime/tests/stripwire.contract.test.js` reads `tests/snapshots/` as DATA: `it("every wire aperture is a well-formed route contract")`. Green, yet it prints `0/30 modes have an instance vantage` — its drift check is VACUOUS until a booted-daemon `SNAPSHOT_HOT=1` run.
- **Law → pin.** populate — `repository.populate.test.js` `it("a to-many populate under a to-many where and a limit fetches at most limit rows per query")` · `stagger` — `datasink.drain.test.js:112` `it("hands the daemon a terminator, so a pending settle cannot outlive the datamap")` · emission — `mode/traits.test.js:193` `it("buffer without thread has null thread")` · path≠URL — `typology/tests/freight.test.js:126` `it("a name with a space is a url on the wire and the same file coming back")`.
- **Pinned nowhere** — beyond subqueries (`symbols-query.test.js:89`) and subscriber lanes (`subscriber.test.js:98`), grep over `subsystems systems commons` + `~/.viva/registry --include=*.test.*` gives `loadStrategy` **→ 0** · `shard.trait.claimed` **→ 0** · barrel-spread **→ 0**.

## where to read the live system

- `/metadata/*` — `curl` a mode mount + `/metadata/aperture` for what a client wires.
- `/status` at three tiers, each returning `status.reflection` — `runtime/lifecycle/resolve.js:10`+`:94`, `daemon/lifecycle/resolution.js:44`.
- spans → `~/.viva/logs/<instance>/spans.jsonl` (`paladin/prototypes/ledger/log.js:8`); streams → `<process>.<stream>.log` beside it (`:12`); read with `paladin.read.jsonl`. Neither file exists on this ledger today.
- `console.*` in territory: **257** (subsystems 91, systems 130, commons 36). Hot: `runtime/daemon/traits/dataset.js` 14, `commons/services/nlp/service.viva.js` 14.
