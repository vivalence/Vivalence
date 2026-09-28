---
paths: ["systems/anima/**"]
---
<!-- writer: agent · kind: persistent · limit: 17600 chars · traps only, the code is the map -->
# codemap: anima — the SvelteKit surface over dapper (tokens) and drapes (components); their own traps → `design.md`

- beef: *"claude codes like SHIIITTT on the client"* — a hex literal in a view is a defect; the dapper token is the answer. · `feedback_theme_tokens_over_literals`
- `+layout.svelte` gate ranks `!authorized` FIRST: a failed `refresh()` runs `logout()`, a tokenless `verify()` writes NO status. (`src/typology/stores/lighthouse.js:79` · `src/typology/stores/lighthouse.js:132`)
- `terminal.js` is a factory: setting `thread` CLEARS `$buffer`; the stall re-builds per thread switch.
- the bridge's save is ONE key for every tab of the profile (`src/typology/stores/bridge/bridge.js:10` `vivalence:bridge`, written at `:141`): a walk that turns the chassis or picks a theme writes beef's layout, and a snapshot restored after it overwrites whatever HE saved meanwhile (09-29). Set the theme on the DOM alone; restore only while the key still holds my tab's last write. Better: never his profile — `npm:playwright-core@1.61.1` (in deno's cache) launched with `channel: "chrome"`, headless, a fresh context owns its storage and never throttles a timer; seed `vivalence:bridge` with `addInitScript`, flip the gate client-side (`window.__viva.lighthouse.$authority` set to placeholder strings, `$status` to `VERIFIED` — `src/app/+layout.svelte:48`), then open a terminal: at 0 terminals `.empty-overlay` sits over the joint and eats the first tap (09-29).
- the page owns the pincer's `Gesture` (`src/app/+page.svelte:36`) and hands it down (`src/app/bones/pincer/pincer.svelte:6`): the hairline thickness reads `radial.show` there (`src/app/+page.svelte:44`). A second `new Gesture` splits the radial from the chassis.
- `thread.engage(name)` is THE phase gate; refuses rather than half-engages. `QUEUEING` needs `AIMED`. (`src/typology/entities/thread/thread.js:58` · `src/app/panels/f/f.svelte:38`)
- `harnessed.js` folds wire pojos into entities at the transport seam, plain body AND `/tool/yield` in a stream — the dock keeps ZERO domain knowledge.
- `Buffer.toJSON` strips only `$data $view $traits $trait` — `$label`, `hooks`, `on` LEAK. `mode` on a wire pojo is the FK id; a cast `View` loses `bundle.url`. (`src/typology/entities/buffer.js:56` · `subsystems/typology/prototypes/bundle.js:48`)
- bridge `resize()` diff-guards before writing `layout.*` (nanostores notify on an equal `set`). In a panel rect `window.innerWidth`/`100vh` LIE; `ViewportLock` `--viva-h` is `max-height`, never `height`. (`src/typology/stores/bridge/bridge.js:185`)
- `subsystems/drapes/panels/Frame.svelte`: a store PLUCKED off a prop into a plain `let` freezes at first render — `$derived`; remount identity is the TRIPLE `(buffer, key, terminal)`.
- css: scoped `> *` does not cross a child root · `$state` does not deep-track class instances · an interpolated class name masks the pruner · delete CSS by SELECTOR LIST. · `project_phase_shoulder_widget` · `project_svelte_class_state_gap`
- FOCUS LAW: ONE field element per session, no `{#key}`, never `disabled`/`readonly` (revert `oninput`); `subsystems/drapes/controls/Keyboard.svelte` is the offscreen holder.
- a denied daemon list = the browser is on ANOTHER server (`[::1]` vs `127.0.0.1` vs a `readmen*` container): `lsof` + `docker ps` first. · `project_readmen_container_port_shadow`
- `@vivalence/anima` is a VITE ALIAS (`deno.jsonc` exports EMPTY); entity files must NOT import the barrel (TDZ). (`src/typology/entities/thread/index.js:4` · `feedback_import_through_barrel`)
- a `.svelte` compile proves syntax, never behaviour — MOUNT under linkedom; style claims on the SERVED bundle. `oracle.snapshot.test.js` REWRITES its fixture when green (`DRY = false`).
- tap: `logger.entry(nature)`, DEV → `console.debug`. (`src/telemetry/logger.js:25`)

- a buffer row IS the screen: selection, cursor, expanded rows, query, unsaved draft, pane sizes → `buffer.data`; local `$state` only for re-fetched readings + momentary faults. `~/.viva/registry/assembly/modes/editor/assembly/buffer/Assembly.svelte:92` `retain(patch, { soon })` = `buffer.data = { ...buffer.data, ...patch }` FIRST, then `daemon.entities.buffer.updateOne({ id }, { data })` debounced ~400 ms. Never wipe on mount — a fresh buffer is `data: {}`. /"state should include my current sleecteds!"/
- delete CSS by SELECTOR LIST — a regex cut of `.composer input` out of `.agent input,\n  .composer input { … }` leaves `.agent input,` merging into the NEXT rule; `css_unused_selector` cannot see it. After any cut: `grep -nE '^\s*\.[a-z].*,$'`. · `feedback_delete_css_by_selector_list`
- inline-edit chips render the CANONICAL field, never the draft: `<span>{tok.form}</span>`, `editValue` lives only inside the focused `<input>` and clears on commit · fail · Esc · blur (/"the chip displays the data not the user input after focus lost"/). · `feedback_display_canonical_after_blur`
- one anima barrel: `import { bridge } from "@vivalence/anima"` → `bridge.clamp(…)`; never an `@vivalence/anima/bridge` sub-alias (`systems/anima/vite.config.mjs:125` maps the name to `src/typology/mod.js`); no exception left — `skins` moved out of anima into the drapes barrel (`import { skins } from "@vivalence/drapes"`, `subsystems/drapes/mod.js:8`).
- mount rig (`systems/anima/tests/activity.mount.test.js`): under Deno bare `svelte` is the SERVER stub (`flushSync` no-op) — import `svelte/src/index-client.js`; linkedom defines `firstChild`/`nextSibling` on `ParentNode`, delegate from `Node.prototype`; a plain-object fixture in `$state` is DEEP-PROXIED (`this.owner.signals.push` lands in the proxy) — log into a closure; delegated handlers are `el.__click(...)`, `dispatchEvent` never reaches them. `subsystems/paladin/belt/bundler.js:24` keeps only the entry output — emitted `.css` is dropped.
- a prop named `state` · `derived` · `effect` · `props` collides with the rune: `let { pressed, vector, state } = $props()` compiles `state` into a store read (503 / `validate_store`) — name it `vitals` or `condition`. · `feedback_svelte5_rune_props`
- dapper surface (`subsystems/dapper/lib/emit.js:57` `declarations`): inside a `data-zone` box a view reads the ground `--surface` · `--surface-sunk` · `--surface-lift` · `--boundary` · `--boundary-strong` · `--boundary-soft` · `--divider` · `--inverse` · `--inverse-on` · `--shadow` · `--scrim` · `--dim`, text `--text-{header,strong,ink,light,muted,link,code}`, controls `--control-*`, signals `--signal-{primary,positive,caution,negative}` (the fill) with `-ink` · `-tint` · `-on`, lengths `--size-*` · `--shape-*`; scales `--font-size-*` · `--font-family-*` come from `subsystems/dapper/lib/tokens.js`. Signal TEXT reads `-ink`, a glyph on a fill reads `-on`. A hex or a zone number in a view is a defect. The law binds anima + drapes; a mode buffer may keep its own palette on beef's word.
- safe-area pads `<body>` (`src/client.html:23` `--safe-area-*`); a `position: fixed` panel escapes it → `top: calc(16px + var(--safe-area-top))` on the element itself (`src/client.css:1` `@tailwind base` ships preflight `*{box-sizing: border-box}` globally: padding eats an inline height, never adds outside it). iOS tap floor 44px.
- intermittent load/connect failures right after boot or a dev reload → count sockets FIRST (`about:networking#sockets` · `chrome://net-internals/#sockets`): HTTP/1.1 caps 6 per host:port per PROFILE, every open SSE holds one; the failing subsystem is usually starved, not broken. · `project_browser_connection_budget`
- an `$effect` must not read a `$state` it writes in the same synchronous run (tracking closes at the first `await`): `log = [{ route }, ...log]` inside `call()` stormed hundreds of POSTs/s. Cures: `...untrack(() => log)`; `load()` at component top level, the effect owns only the subscription; a handle the markup never reads is a plain `let`; a long async draw holds its handle in a LOCAL. (`~/.viva/registry/vcompany/modes/office/email/buffer/Mail.svelte:41`)
- DOGMA (/"this is now dogma. this is canonical."/): structures (`src/typology`) are pure — no fetch/localStorage/console/AudioContext; effects touch the world, return teardown, mount at their subject's context provider; surfaces render + call verbs. Entities receive connections, never construct them. Tree: `+layout` LIGHTHOUSE/TERMINALS/BRIDGE/BOX → panel TERMINAL → frame THREAD → buffer view BUFFER. Gate: `rg "localStorage|fetch\(|console\." systems/anima/src/typology` → 0 is the TARGET, unmet (quest m16_client M16.4 never landed): localStorage in `src/typology/stores/lighthouse.js:186` · `src/typology/stores/bridge/bridge.js:49`, AudioContext in `src/typology/stores/box/drivers/audio/audio.js:10`, a Connection built in `src/typology/entities/daemon/dossier.js:58`, no provider below `+layout`.
- font scale `subsystems/dapper/lib/tokens.js` `font.size`: `2xs .55 · xs .6 · sm .8 · md .875 · base 1 · lg 1.4 · xl 1.6 · 2xl 1.8 · 3xl 2 · 4xl 2.4 …` rem; one knob: `bridge.view.fontSize` → `documentElement.style.fontSize`.
- the dock is PER TERMINAL: `Terminal({ id, dock })` holds `$dock = atom(dock ?? defaultDock())` (`src/typology/entities/terminal.js:18`), plain data persisted via `terminal.toJSON().dock`, outside the settle tri-state; mutators are free fns in `stores/bridge/dock.js`. Every chat-surface gate reads `mode.implements("HARNESSED")` (panels a · f · Dock), never CONVERSATIONAL.
- the gate opens after auth + daemon LIST; `daemon.mounting` runs un-awaited (`src/typology/entities/daemon/dossier.js:72`, status `mounting`) and never throws — `daemon.manifest/mount/call/cortex` are null (`modes` an empty `{}`) until it lands. `lighthouse.js:249-252` re-sets `$daemons` only when `reflection.code` CHANGES (the heartbeat re-sets `healthy` every beat).
- a wholesale-replaced fold (trace story `{nodes: Map, roots}`) → `$state.raw`; deep `$state` re-wraps proxies per access, so a `WeakSet` `seen.has()` cycle guard never matches (`too much recursion`). Span `note()` data = ids, never a live entity. · `project_span_svelte_render_laws`
- `em.merge` assigns INTO the held instance; the only signals are `repo.$entities` and per-field atoms — a row widget derives with `$derived.by(() => { void version; return project(row); })` off an owner-counted `version`. A nanostores listener fires SYNCHRONOUSLY inside the subscribing `$effect`: one that READS what it writes (`version += 1`, `[...list, x]`) → `effect_update_depth_exceeded`; wrap it `untrack(() => …)` (`src/app/panels/f/widgets/ActivitySection.svelte:43`).
- Svelte scoping RAISES specificity, it does not isolate: an unscoped `section .act { height: 22px }` claims every property your scoped `.act` leaves undeclared. Prefix a class family (`.avenue-*`) and declare every box property; probe collisions INSIDE the real ancestor, never on `document.body`. (`project_svelte_scoping_is_not_isolation`)
- `src/client.css` loads Tailwind utilities GLOBALLY: never name a class after one (`collapse` → `visibility: collapse`, `ring`, `grow`, `hidden`…); the kit's `Key size="row"` and `Row` carry the class `row`, so an unscoped `.row` rule reaches every one of them (m73 deleted panel B's `:global(section .row)` block for it). Before naming: `grep -rn ':global(' systems/anima/src --include='*.svelte'`. A box that measures but paints nothing → `getComputedStyle(el).visibility`.
- boot slow while EVERY localhost WebSocket (vite HMR and daemon) queues 8–30 s and releases together, HTTP fast, CLI WS 6 ms = Firefox's global WS cap exhausted by leaked dev sockets → restart Firefox; not repo code. Ask WHICH BROWSER first. · `project_transport_retry_timeout_dead`
- the kit's `Strip` places ITSELF (`subsystems/drapes/display/Strip.svelte`, `order: -1` for `top` and `rail`): its host is a plain flex column, a row when `rail` is bound true — a host that reverses its own column puts a top strip at the bottom. A hidden tab never runs the `ResizeObserver` behind `bind:clientWidth`: the strip's fold reads true only after a screenshot. A static build holds `_app/env.js` as `{}` — served alone it has no lighthouse remote; serve that one path yourself to walk it.
- `vite.config.mjs` is bundled by vite's loader with NODE resolution, past `import_map.json`: a bare `vite` import resolved astro's vite 8 from the flat `node_modules` (musl: rolldown binding dies). Never import a workspace-conflicted package from a vite/astro config. · `project_vite_config_bundler_bypasses_import_map`

<!-- generated: python3 .ikiro/methods/codemap.py anima — never hand-edited -->
```jsonc
// systems/anima
{
 "package": "@vivalence/anima",
 "exports": {},
 "barrels": {},
 "tasks": {
  "run": "VIVA_SYSTEM_ROLE=CLIENT deno run -A npm:vite@6 dev",
  "watch": "VIVA_SYSTEM_ROLE=CLIENT deno run -A npm:vite@6 dev",
  "start": "VIVA_SYSTEM_ROLE=CLIENT deno run -A npm:vite@6 dev",
  "bundle": "deno run -A npm:vite@6 build",
  "preview": "deno run -A npm:vite@6 preview",
  "interactive/activity": "deno run -A --no-check tests/interactive/activity/panel.jsx http://localhost:7710"
 },
 "tasks, one file each (all --watch)": 4,
 "tests": {
  "tests": 15,
  "tests/belt": 1,
  "tests/design": 1,
  "tests/dock": 5,
  "tests/interactive": 2,
  "tests/panes": 3,
  "tests/pincer": 5,
  "tests/scenario": 2,
  "tests/typology": 1,
  "tests/zones": 2
 }
}
```
<!-- /generated -->
