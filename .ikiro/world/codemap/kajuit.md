---
paths: ["systems/kajuit/**", "subsystems/dapper/**", "subsystems/drapes/**"]
---
<!-- writer: agent · derived-from: kajuit/src (112 js+svelte) + tests/ (17 suites) · dapper + drapes whole · verified: probe design() → 2 themes, 1382 vars, skeleton 0..4 vs zone 0..5 · probe Buffer/Terminal toJSON · console.* = 5 · logger.entry( = 19 · selfevident = 1 consumer · tests 26 files/241 leaves/1 fixture, 2 run green · limit: 17600 chars -->
# codemap: kajuit — the surface (SvelteKit SPA) over dapper (tokens) and drapes (components)

⚠ beef-observed weak flank: *"claude codes like SHIIITTT on the client"* — slow down here, read tokens, no one-off hacks. A hex literal in a view is a defect; the dapper token is the answer. See [[identity]].

## decks, gate, page

- **decks** (symbols in `src/client.js`, set ONCE in `src/app/+layout.svelte`): `LIGHTHOUSE` · `TERMINALS` · `BRIDGE` · `BOX` (audio singletons — never construct one in a panel). Context is the source, props the fallback ([[project_context_architecture]]).
- **the launch gate** ranks `!authorized` FIRST: a failed `refresh()` runs `logout()` and a tokenless `verify()` writes NO status, so anything above it wedges ([[project_gate_after_daemon_list]]).

```js
// systems/kajuit/src/app/+layout.svelte:62-71
computed([lighthouse.$isAuthorized, lighthouse.$status], (authorized, status) => {
    if (!authorized) return "signin";
    if (status.code === "OFFLINE" || status.code === "ERROR") return "signin";
    if (status.code === "POPULATING") return "populating";
    if (status.code !== "VERIFIED") return "verifying";
    return "ready"; }).subscribe((value) => { gate = value; … });
```

- **`+page.svelte` owns the frame**: it mounts panels A·B·C·G·H and bones shoulder·crown·pincer·spine, driving `dataset.theme` + `style.fontSize` (`FONT_SIZES`, 7 stops, NO `md`).
- **D·E·F live INSIDE C** as a stacked pane run, not a tab switch: `PANE_NAMES = ["instance","terminal","buffer"]`; a closed pane docks to a twig bar `PANE_BAR = 44` and `normalisePanes` still fills it.

## terminal = f(thread)

- **`terminal.js` is a factory, not a class** — three atoms `$thread · $buffer · $dock`, transparent accessors, a `vigil` clearing a pointer when its entity leaves the repo. **Setting `thread` clears `$buffer`.** The stall re-builds per thread switch, reading `pull`/`depth` LIVE so nothing goes stale (`Stall` → `world/codemap/typology.md`).
- **`$dock`** = per-terminal chat geometry `{side, share, collapsed, full}` — `full` is the fourth field. Verbs are free functions in `stores/bridge/dock.js` ([[project_dock_per_terminal]]); panel A gates the dock on `implements("HARNESSED")`.

```js
// systems/kajuit/src/typology/entities/terminal.js:85-105 (elided)
$thread.subscribe((thread) => {
    threadVigil?.(); threadVigil = thread ? vigil(thread, thread.daemon?.entities?.thread, …) : null;
    stall?.deactivate();
    stall = thread && Stall({ source: thread.$buffers, active: $buffer, phase: thread.$phase,
        pull: () => pull(thread, { blacklist: new Blacklist().absorb(thread.$buffers.get()) }),
        depth: () => depth(thread) });
    stall?.on.release((buffer) => { thread.daemon.entities.buffer.drop(buffer.id);   // optimistic
      thread.daemon.entities.buffer.removeOne({ id: buffer.id }) … }); });
```

```json
// probe: Terminal({id:"term-1"}).toJSON() → setDockSide("bottom")+setDockShare(.42) → resolve(dock, 1200×800)
{ "id": "term-1", "thread": null, "buffer": null,
  "dock": { "side": "right", "share": 0.32, "collapsed": true, "full": false } }
{ "side": "bottom", "vertical": false, "share": 0.42, "direction": "column", "dimension": 800, "size": 336 }
```

- **terminals persist as SHELLS, then settle**: `app/terminals.js` writes `viva.terminals` (+ `.active`; `BRIDGE` writes `vivalence:bridge`) on every atom tick, and re-resolves each held id against every healthy daemon on a status tick.

## thread — the phase gate

- **`thread.engage(name)` is THE gate every driver flows through.** A phase names a SET of rules; the phase owns the set, each trait owns its rule. `$integrity` re-folds the table on any composition change; `engage` refuses rather than half-engage.

```js
// systems/kajuit/src/typology/entities/thread/thread.js:9-18, 58-64
const PHASES = { inert: [], manual: [], continuous: [aimed.valid, queueing.valid], escort: [] };
const violations = (name, thread) => (PHASES[name] ?? []).map((rule) => rule(thread)).filter(Boolean);
  engage(name) { const problems = violations(name, this);
    this.$errors.set(problems);
    if (problems.length) return false;
    this.$phase.set(name); return true; }
```

- **panel E is the traits surface** — read-only mode traits over thread traits (`LABELED · MASKED · AIMED · QUEUEING · INTELLIGENT`; only the last three toggle, `QUEUEING` needs `AIMED`). `thread/traits/index.js` exports `aimed` + `queueing` ONLY; mode traits run through `belt/runner.js` `applyTraits(ns)`, after `next()`.

## daemons, the dataspace, emission

- **`daemon/dossier.js` makes a daemon usable**: a multiplexed authed `Connection` (span/request/fault, 8000 ms timeout), a `Dataspace` over 7 dossiers, a `Cargo`, then a retrying `mount()` opening FOUR subscriptions — each an F5 bug.

```js
// systems/kajuit/src/typology/entities/daemon/dossier.js:93-136 (elided)
await daemon.connection.call("/userspace/handshake");
const [status, manifest, cortex, aperture, statics] = await Promise.all([ … daemon.entities.init() ]);
daemon.call = shape.connection.wire(daemon.connection, aperture);
daemon.entities.intent.subscribe(); daemon.entities.thread.subscribe();
daemon.entities.buffer.subscribe(); daemon.entities.turn.subscribe();
daemon.cortex = new Cortex().register(shape.cortex.wire(daemon.connection.branch("/cortex"), cortex));
```

- **EMISSION CONTRACT**: an emitter returns `{kind:"emission", condition, output:{buffer:[…]}}` — no top-level `buffers`, no `entities` ([[project_thread_emission_contract]]).
- **`HARNESSED` folds wire pojos into managed entities at the transport seam**, for a plain body AND a `/tool/yield` inside a stream — the dock keeps ZERO domain knowledge ([[feedback_client_domain_blind]]).

```js
// systems/kajuit/src/typology/entities/mode/traits/harnessed.js:6-35 (elided)
const merge = async (yielded) => { for (const [name, pojos] of Object.entries(yielded.output)) {
    if (name === "message" || name === "object") continue;
    const repository = ctx.daemon.entities[name]; if (!repository || !Array.isArray(pojos)) continue;
    yielded.output[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo))); } };
mode.connection.branch("/harness").use(async (rqx, next) => { await next();
    const body = rqx.response?.body;
    if (body?.[Symbol.asyncIterator] && !body.getReader) { rqx.response.body = (async function* () {
        for await (const packet of body) {
          if (packet?.event === "/tool/yield" && is.yieldish(packet.result)) await merge(packet.result);
          yield packet; } })(); return; }
    if (is.yieldish(body)) await merge(body); });
```

```json
// probe: Object.assign(new Buffer(), pojo) → JSON.stringify — note what LEAKS past toJSON
{ "$label": { "lc": 0, "events": { "5": [null], "6": [] } },
  "context": null, "hooks": { "mount": [], "unmount": [], "release": [] }, "on": {},
  "id": "buf-1", "mode": "mode-1", "literals": [{ "id": "lit-1" }], "data": { "recall": "LEARNING" },
  "view": { "kind": "svelte", "hash": "deadbeef", "mount": "/deadbeef.svelte.mjs",
            "bundle": { "entries": [{ "type": "js", "mount": "/deadbeef.svelte.mjs", "bytes": 9 }] } },
  "traits": ["LABELED"], "trait": { "LABELED": { "name": "ciao" } } }
```

- **TRAP — `Buffer.toJSON` strips only four backing fields** (`$data $view $traits $trait`), so `$label`, `hooks` and `on` ride out into the JSON above. `mode` on a wire pojo is the FK id; a cast `View` loses its `bundle.url`.
- **mode visibility is MANIFEST-gated, twice**: `panels/d/d.svelte` lists `implements("application") || implements("conversational")`; `navigation.js` (palette) gates on `implements("selfevident")` — the runtime declares that marker a no-op and this is its ONLY consumer.
- **`conversation.js` `drain()` sets `$error` only from a THROW** — a `/response/close {state:"error"}` packet pours into `soma` and the UI never faults. Open defect.
- **`chain(root, ...path)`** subscribes across store→entity→store without plucking: each hop re-binds on its own value, so `$`-auto-subscription survives any swap.

## pincer geometry

- **`stores/bridge/geometry.js` is the ONE table**: grip `{x,y}` + orientation in `{0,90,180,270}` → three panel rects (a·b·c) and four bone rects (shoulder·crown·pincer·spine), `BONE_THICKNESS = 45`, snap grid `[0,13,21,34,50,66,79,87,100]%` within 28px. `bones.axis.test.js` sweeps 4 × 16 placements: the arms share an axis, the spine crosses them. The bones still hardcode one axis while the table already flips ([[project_m56_pincer_turns]]).
- **viewport owner = bridge** (`bridge.js attachViewport`): `visualViewport` + `resize`/`scroll`/`focusout` → rAF-coalesced `sync` → `anchor()` then `resize()`, which DIFF-GUARDS before writing `layout.*` (nanostores notify on every `set`, even an equal object). A buffer view lives in a panel rect, so `window.innerWidth`/`100vh` LIE: measure the component, and take `ViewportLock`'s `--viva-h` as `max-height`, never `height`.

## dapper — the token pipeline

- **dapper is build time only.** `lib/system.js design()` folds `colors → tokens → themes`; `generateCSS` flattens every category to `--<category>-<path>` and appends the zone sheet; `lifecycle/index.js` prepends it through postcss. Themes `nordic`, `paper`.

```css
/* probe: design() → output.css, the paper block (52548 chars, 1382 declarations, 2 themes) */
--colors-skeleton-0-surface: #F5F3E8;  --colors-skeleton-0-contrast: #0B0F2D;  --colors-skeleton-0-boundary: #A0967C;
--colors-theme-primary-surface: #80ede6; --colors-theme-primary-contrast: #004244; --colors-theme-primary-boundary: #1ebcb5;
--colors-system-danger-surface: #ed8090; --colors-system-danger-contrast: #440004; --colors-system-danger-boundary: #bc1e33;
```

- **TWO ladders that do not line up**: `--colors-skeleton-N-*` runs 0–4 (`theme.colors.skeleton`), `.zone-N` runs 0–5 (`theme.zones`, `ZONE_COUNT = 6`). `Zone.svelte` and `Decorum.use()` spell `--colors-skeleton-{level}-…`, so `skeleton={5}` resolves to nothing 

## drapes — components that only ever read CSS vars

- **eight families**, 50 `.svelte`: `context` (`Decorum Zone`) · `controls` (`Field Key Keyboard ViewportLock` + actions `persist visible drag`) · `display` (18) · `decor` · `panels` (`Card Desk Frame Icon`) · `skins` · `stage` · `triage`. `mod.js` re-exports all but `editor`; `<Icon carbon=…>` is app-layer ONLY — inline the SVG in a buffer bundle.
- **`Frame.svelte` owns mount identity.** A store PLUCKED off a prop into a plain `let` freezes at first render — use `$derived`; the remount test is the TRIPLE `(buffer, key, terminal)`.

```svelte
<!-- subsystems/drapes/panels/Frame.svelte:6, 15-18, 33-67 (elided) -->
const buffer = $derived(terminal.$buffer);
function identity(record) { if (!record) return null; return record.hash ?? record.bundle.url + record.mount.nature; }
$effect(() => { const next = $buffer; const key = identity(view); const target = dom;
    if (next === live && key === shown && terminal === seated) return;
    teardown(); if (!next) return;
    if (typeof next.mount !== "function") { standing = "resolving"; return; }
    … const module = await view.load(); if (live !== next || shown !== key) return;
    component = module.default(target, { terminal, daemon: next.mode.daemon, mode: next.mode, thread: next.thread, buffer: next }); });
```

- **`drapes/editor/` (CodeMirror 6) has ONE consumer, outside the repo**: `~/.viva/registry/vcompany/modes/office/vdex/buffer/parts/Reader.svelte` (the vdex `raw` view); not in `mod.js`, not in `deno.jsonc` `exports` (`"."` only) ([[project_drapes_editor]]).
- **style gotchas**: scoped `> *` does not cross a child's root · an unscoped `section .x` claims every property a scoped rule leaves undeclared · `$state` does not deep-track class instances · an interpolated class name masks the CSS pruner · delete CSS by SELECTOR LIST, never by selector.
- **FOCUS LAW**: the field is ONE element for the whole session — `{#key}` destroys it per iteration and iOS will not reopen the keyboard from a non-gesture `.focus()`; reset with `$effect.pre` on a token. **Never `disabled`, never `readonly`** — revert `oninput`. ONE focus owner per field; across a gap where it unmounts, `controls/Keyboard.svelte` is the offscreen HOLDER (`focus` · `blur` · `guard`).

## barrel + build

- **TRAP — a daemon list the runtime denies means the browser is on ANOTHER server**: Deno binds `[::1]`, vite `127.0.0.1`, a stray `readmen*` container publishes `0.0.0.0`; check `lsof` + `docker ps` before any trait/cache theory ([[known-issues]]).
- **`@vivalence/kajuit` is a VITE ALIAS, not a deno export**: `kajuit/deno.jsonc` has an EMPTY `exports` block; `vite.config.mjs` maps it to `src/typology/mod.js` and boots paladin at `serve` for host/port ([[project_vite_config_bundler_bypasses_import_map]]). Consumers import the barrel only; entity files must NOT (TDZ cycles). A buffer App bundles ~2.6 MB whatever its own size ([[known-issues]]).

## how it is tested

- **the harness**: `26` files (kajuit 17 · dapper 5 · drapes 4), `241` leaves, `1` snapshot fixture. `specimen` (`@vivalence/typology` over `@std/testing/bdd`) everywhere but `terminal.stall.test.js` (raw `Deno.test`) and `trait-runner.test.js`. **A `.svelte` is tested by COMPILING it** — `compile(src,{runes:true})`, `warnings` must equal `[]`; no DOM, no vitest. `deno test -A --config deno.jsonc <file>` → `ok | 2 passed | 0 failed`.
- **pincer**, swept — `pincer/panes.test.js` *"the all-folded state still fills the run — the v3 dead-space defect"* · `pincer/bones.axis.test.js` *"the two arms always share an axis, and the spine always crosses them"* over 4×16 placements · `pincer/dock.geometry.test.js` (14) pins `clampShare`/`resolve`.
- **terminal** `tests/terminal.stall.test.js` — *"terminal builds a stall from the thread; phase drives terminal.$buffer"* · *"continuous: the stall pulls via AIMED to keep depth filled"*.

```js
// test: systems/kajuit/tests/terminal.stall.test.js:47-52
assertEquals(terminal.buffer.id, "a");
a.done();  assertEquals(terminal.buffer.id, "b");  assertEquals(t.dropped, ["a"]);
```

- **traits** `typology/trait-runner.test.js` — *"calls next() before invoking traits"*; finalizers run after ALL traits. `thread.engage`/`PHASES` untested.
- **the wire** `harness-wire` *"the stream leaf carries yields in the harness strip"* · `scenario/buffer` *"toJSON carries data + view past the accessor skip"* · `lifecycle-vector` · `scenario/daemon` · `cargo` · `dock-turns`.
- **the two ladders are pinned APART**: `css-emit` *"emits all 5 skeletons"* loops `[0,1,2,3,4]`; `zone-emit` *"has 6 zones (0–5)"* asserts `ZONE_COUNT === 6`.
- **drapes** `parts.test.js` compiles 6 parts + checks the barrels; `editor.test.js` *"theme and highlight name no literal colours"*; `editor.org` (20) · `markdown` (11).
- **the snapshot REWRITES itself**: `const DRY = false` + `write` defaults true, so a green `oracle.snapshot.test.js` overwrites `tests/snapshots/oracle-ask.snapshot.json`. No `UPDATE_SNAPSHOTS` env — flip `DRY` to preview.
- **gaps**, grep over all repo `tests/` + `~/.viva/registry` → `0`: the `+layout.svelte` gate · `client.js` decks · `dossier.js` · `harnessed.js` · `thread.js` · `chain.js` · `conversation.js` · `terminals.js` · `navigation.js` · `Frame.svelte` · `dapper/lifecycle/`.

## where to read the live system

- **`logger.channel`** (`src/telemetry/logger.js`) — a typology `Pipe`; `logbook = new Span("client").to(channel)`, `entry(nature) = logbook.branch(nature)`, **19** uses; DEV taps it into `console.debug` (`+layout.svelte:49`). THE client-side tap.
- **`logger.$story`** is the live chronicle (`trace.chronicle.step`), 200 roots. **Panel G** splits it faulted / slow (>500 ms) / recent with each node's response body; **Panel H** (`telemetry/inspector.js`) projects lighthouse + terminals + bridge as a table with invokable rows.
- **`shard.track.span/request/fault`** — 6 sites: the lighthouse connection (`+layout.svelte:30`) and every daemon one (`dossier.js:56-58`), keyed on `url.pathname`.
- **live `console.*` = 5** of 22: `+layout.svelte:50` (DEV tap) · `Frame.svelte:72` (`view refused for buffer <id>`) · `dapper/lib/flatten.js:99,110` + its stale twin `dapper/belt/lib.js:32,43`.
- **no telemetry drains here** — `drain(` in territory is `conversation.js` (stream) and `box/device/speaker` (PCM queue).
- **`tests/oracle.snapshot.test.js`** folds a real wire trace into `trace.chronicle` — daemon spans as they reach the client (`/ask` requires `thread`). Live validation = a JS DOM assertion via `javascript_tool`, never clicks ([[rituals]]).

```json
// systems/kajuit/tests/snapshots/oracle-ask.snapshot.json (672 bytes, elided)
[ { "path": "/aperture/ask", "nature": "ask", "timing": { "measured": true },
    "children": [ { "path": "/aperture/ask/input", "nature": "input", "entries": ["note"] },
                  { "path": "/aperture/ask/turn/assistant", "nature": "assistant", "entries": ["note"] } ] } ]
```

