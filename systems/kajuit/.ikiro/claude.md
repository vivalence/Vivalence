> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — html (container)

Surface. SvelteKit SPA. Thin client: connection, dossier hydration, layout geometry, view dispatch. Read `.ikiro/CLAUDE.md` first.

## architecture

DOM is a consumer of the dataspace.

Components do not construct, populate, or resolve entities. They consume resolved state — subscribe to atoms, read entity properties, trigger actions (spawn, release, navigate). If a component needs a resolved entity, the dataspace delivers it resolved; if it doesn't, the gap is in the typology layer, not the component.

State is data, lifecycle is functions over data. No boot vectors on the client. No OOP lifecycle methods. Lighthouse, Daemon, Quarters, Bridge, ThreadContext are pure state containers; standalone functions (`boot`, `populate`, `resolve`, `hydrate` in `systems/kajuit/src/typology/prototypes/`) and selbstbestimmte vectors do the work.

four contexts (ship metaphor) — set unconditionally at `systems/kajuit/src/routes/+layout.svelte` init:

- LIGHTHOUSE — auth / identity / daemons (the navigation tower); class at `systems/kajuit/src/typology/prototypes/lighthouse.js`
- QUARTERS — terminal LocalRepository + `$active` (the workspace); class at `systems/kajuit/src/typology/prototypes/quarters.js`
- BRIDGE — layout / view / paneSize stores, persisted to localStorage (the helm); class at `systems/kajuit/src/typology/prototypes/bridge.js`
- THREAD — `$current` (the navigational pivot; daemon and mode are accessors on thread, not separate contexts); class at `systems/kajuit/src/typology/prototypes/thread-store.js`

structure:

```
systems/kajuit/src/
├── client.js                     context symbols (LIGHTHOUSE, QUARTERS, BRIDGE, THREAD)
├── client.html                   app template (safe-area-inset padding for iOS)
├── client.css                    tailwind entry
├── telemetry.js                  Pipe + $telemetry atom (200 spans max)
├── routes/
│   ├── +layout.js                export const ssr = false
│   ├── +layout.svelte            root layout — 4 contexts, gate, pincer + viket
│   ├── +page.svelte              login page
│   ├── decorum/                  theming demo (M4 scaffolded)
│   ├── skinner/                  skin lab
│   └── pincer/
│       ├── bones/                shoulder, crown, pincer, spine
│       └── panels/               a (buffer + Dock), b, c, d, e, f, g (telemetry), h (inspector)
└── typology/
    ├── mod.js                    @vivalence/kajuit barrel
    ├── belt/narrow.js            filter/rank utilities
    ├── entities/                 terminal, mode, intent, thread, buffer, turn, literal
    │                             (each = class + dossier)
    ├── prototypes/               entity, dossier, dataspace, daemon, lighthouse,
    │                             persistence, quarters, bridge, thread-store, stall
    └── traits/thread/            LABELED, MASKED, INSITU, AIMED, QUEUEING, SELFEVIDENT
```

boot sequence (`systems/kajuit/src/routes/+layout.svelte`):

```
new Connection(env URL)
→ new Lighthouse(connection)
→ lighthouse.hydrate (localStorage restore via systems/kajuit/src/typology/prototypes/persistence.js)
→ setContext × 4 (LIGHTHOUSE, QUARTERS, BRIDGE, THREAD)
→ gate (offline / error / auth / verifying / ready)
→ onMount: lighthouse.boot → verify → populate
→ ready: render pincer
```

dossier pattern. Every entity is paired with a dossier — a plain object `{ name, kind, repository, use?, cast? }`. `wireDossier(schema, dataspace?)` at `systems/kajuit/src/typology/prototypes/dossier.js` calls `compileSchema` which builds a selbstbestimmte vector — base middleware injects `ctx.{schema, name, repo, em, dataspace}`, schema's `use[]` runs post-cast, effect runs `defaultCast` (or schema's custom cast). The compiled function is assigned to `repo.hydrate` — called on every entity ingress (create, merge).

No special-cased hydration outside dossier middleware. New entity type → class + dossier + add to entities array in `systems/kajuit/src/typology/prototypes/daemon.js`.

pincer layout. T-bone. The viket (square at the junction) is the user's grip. Position `{x, y}` + orientation (0°/90°/180°/270°) determine panel rects via `rectsForOrientation` and bones via `bonesForOrientation`, both in `systems/kajuit/src/typology/prototypes/bridge.js`.

gestures: tap (jump home), 2tap (swap previous), 3tap (mark home), hold (radial menu with 4 spokes), drag (snap + save).

panels: A (buffer + Dock) / B (controls) / C (D|E|F split with twig dividers) / D (nav + thread detail) / E (JSON dump) / F (DAG of thread buffers) / G (telemetry overlay) / H (inspector drawer with composeInspector + breadcrumb skin).

stall — buffer queue state machine at `systems/kajuit/src/typology/prototypes/stall.js`:

```
UNINITIALIZED → IDLE → PULLING → EXHAUSTED | ERROR | CLOSED
```

Single mutation point in `ThreadContext.$current.set` wrapper at `systems/kajuit/src/typology/prototypes/thread-store.js`: deactivates old `thread.queue`, activates new on thread switch. `withPull(handler, threshold)` arms; `activate()` is idempotent; `suspend/resume` guards against advance during merge hydration.

barrel rule. `@vivalence/kajuit` → `systems/kajuit/src/typology/mod.js`. Consumers go through the barrel. Entity files in `systems/kajuit/src/typology/entities/` MUST NOT import the barrel — Rollup TDZ cycles. Use direct relative paths to `systems/kajuit/src/typology/prototypes/` instead.

## context

known issues:

- `Terminal.toJSON` at `systems/kajuit/src/typology/entities/terminal.js` manually lists fields — silent data loss risk
- `ThreadContext.resolve` at `systems/kajuit/src/typology/prototypes/thread-store.js` has @beef inline — terminal serialization not clean
- `Stall.activate` / `.suspended` flags in `systems/kajuit/src/typology/prototypes/stall.js` are plain properties, not atoms
- `INSITU` trait body in `systems/kajuit/src/typology/traits/thread/insitu.js` is a stub
- Decorum M2–M5 not implemented — `<Zone>` wrapper + DECORUM context not yet wired
- longdistance session lifecycle not built — TerminalDossier subscriber for INSITU threads pending

active workpackages:

- `.ikiro/pincer.workpackage.org` — T-bone layout; phases 1–17 done
- `.ikiro/decorum.workpackage.org` — zone theming; M1 done, M2–M5 open
- `.ikiro/longdistance.workpackage.org` — voice modes; client gate is INSITU subscriber
- `systems/kajuit/.ikiro/datamap-client-migration.workpackage.org` — server done, client open: SSE wiring, persist test
- `systems/kajuit/.ikiro/client-layout.workpackage.org` — viewport management + viva-frame primitives
- `systems/kajuit/.ikiro/session-first-routing.workpackage.org` — URL scheme + populate routing pattern (complete)
