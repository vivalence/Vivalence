> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — kajuit (container)

Surface. SvelteKit SPA. Thin client: connection, dossier hydration, layout geometry, view dispatch. (Renamed from `html` 2026-05-04.) Read `.ikiro/CLAUDE.md` first.

## architecture

DOM is a consumer of the dataspace.

Components do not construct, populate, or resolve entities. They consume resolved state — subscribe to atoms, read entity properties, trigger actions (spawn, release, navigate). If a component needs a resolved entity, the dataspace delivers it resolved; if it doesn't, the gap is in the typology layer, not the component.

State is data, lifecycle is functions over data. No boot vectors on the client. No OOP lifecycle methods. Lighthouse, Daemon, Quarters, Bridge, ThreadContext are pure state containers; standalone functions (`boot`, `populate`, `resolve`, `hydrate` in `systems/kajuit/src/typology/prototypes/`) and selbstbestimmte vectors do the work.

contexts (ship metaphor) — set unconditionally at `systems/kajuit/src/routes/+layout.svelte` init:

- LIGHTHOUSE — auth / identity / daemons (the navigation tower); class at `systems/kajuit/src/typology/decks/lighthouse/lighthouse.js`
- QUARTERS — terminal LocalRepository + `$active` (the workspace); class at `systems/kajuit/src/typology/decks/quarters/quarters.js`
- BRIDGE — layout / view / paneSize stores, persisted to localStorage (the helm); class at `systems/kajuit/src/typology/decks/bridge/bridge.js`
- BOX — audio hardware deck (microphone + speaker + device); owns mic/speaker singletons, consumed by THREAD via `box.device.microphone` (shipped 2026-05-07 with voice quest)
- THREAD — `$current` (the navigational pivot; daemon and mode are accessors on thread, not separate contexts); class at `systems/kajuit/src/typology/prototypes/thread-store.js`

Decks (LIGHTHOUSE/QUARTERS/BRIDGE/BOX) are structural — set once in +layout. THREAD is the navigational pivot. Hardware singletons (mic, speaker, camera) are deck-owned (BOX); never construct them inside a panel.

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
    ├── decks/                    bridge/, quarters/, lighthouse/, box/ (each = class + dossier per deck)
    ├── entities/                 terminal, mode, intent, thread/, buffer, turn, literal
    │                             (each = class + dossier; thread/dossier.js is the canonical thread dossier)
    ├── prototypes/               entity, dataspace, daemon, persistence, thread-store, stall
    ├── gestalten/                kajuit-side composition primitives
    ├── skins/                    visual theme bindings (paired with dapper)
    └── traits/thread/            LABELED, MASKED, AIMED, QUEUEING, SELFEVIDENT, CONVERSATIONAL
                                  (INSITU dropped 2026-05-05 → CONVERSATIONAL is the engagement marker)
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

dossier pattern. Every entity is paired with a dossier — a plain object `{ name, kind, repository, use?, cast? }`. Thread dossier lives at `systems/kajuit/src/typology/entities/thread/dossier.js`. `wireDossier(schema, dataspace?)` calls `compileSchema` which builds a selbstbestimmte vector — base middleware injects `ctx.{schema, name, repo, em, dataspace}`, schema's `use[]` runs post-cast, effect runs `defaultCast` (or schema's custom cast). The compiled function is assigned to `repo.hydrate` — called on every entity ingress (create, merge).

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
- `Stall.activate` / `.suspended` flags in `systems/kajuit/src/typology/prototypes/stall.js` are plain properties, not atoms (typology-rotation quest rule 7 proposes moving these into trait modules)
- Decorum M2–M5 not implemented — `<Zone>` wrapper + DECORUM context not yet wired
- longdistance session lifecycle: rich text DONE (s49). Audio engagement on thread.CONVERSATIONAL pending live verify (voice quest IMPLEMENTED, awaiting handshake test).
- typology-rotation in flight: `prototypes/` → `decks/` migration (M1-M9 per typology-rotation.quest.org); current file paths may be in flux.

active quests:

- root `.ikiro/quests/pincer.quest.org` — T-bone layout; phases 1–17 DONE; phase 18+ in flight
- root `.ikiro/quests/decorum.quest.org` — zone theming; M1 done, M2–M5 open
- root `.ikiro/quests/longdistance.quest.org` — voice modes; rich text DONE s49; audio behind VOCALIZED gate
- root `.ikiro/quests/voice.quest.org` — Box deck + CONVERSATIONAL audio engagement; IMPLEMENTED, verify pending
- `systems/kajuit/.ikiro/datamap-client-migration.quest.org` — server DONE, client open: SSE wiring, persist test
- `systems/kajuit/.ikiro/client-layout.quest.org` — viewport management + viva-frame primitives; ACTIVE
- `systems/kajuit/.ikiro/typology-rotation.quest.org` — rotate kajuit typology to subsystems/typology grammar (decks/ + prototypes/ + entities/foundation/); ACTIVE (M1-M9 in flight)
