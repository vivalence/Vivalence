> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — runtime (container)

Process. Wraps everything in Die / Wafer. Boots daemons, applies traits, serves HTTP via shape.http + Deno.serve. Read `.ikiro/CLAUDE.md` first.

## architecture

cascade lifecycle.

Parent Die's `resolve()` calls each child Die's full lifecycle — `populate → resolve → integrate`. Cascades arbitrarily deep. Shutdown mirrors via `disintegrate()`. The recursion is what makes the system composable: runtime, daemons, and processes all use the same shape, all wrap their business object in `.good`, all extend Wafer (`subsystems/typology/prototypes/wafer.js`).

boot sequence (`systems/runtime/run.js`):

```
paladin.ikiro
→ new Die({ good: new Runtime() })
→ die.populate     registries + terrans + aperture
→ die.resolve      per-terran lifecycle then attach + expose + compose + launch + wake
→ die.integrate    announce daemons to lighthouse
→ die.perpetuate   signal handlers (SIGTERM/INT/QUIT) + 10s patrol loop
```

Each daemon mounts at `/daemon/{slug}/` on the runtime aperture via `.branch().slurp()`.

structure:

```
systems/runtime/
├── mod.js                        exports Runtime, Die, lifecycle, daemon, process
├── run.js                        boot entry (75 lines)
├── runtime.js                    Runtime class (20 lines)
├── die.js                        Die extends Wafer (97 lines)
├── lifecycle/                    runtime-level phases
│                                 population.{wiring, registry, terrans, aperture}
│                                 resolution.{attach, expose, compose, launch, wake}
│                                 integration.{announce}
├── daemon/
│   ├── daemon.js                 Daemon class (69 lines)
│   ├── die.js                    DaemonDie extends Wafer (225 lines)
│   ├── kernel.js                 Domain, Ontology, Corpus classes (21 lines)
│   ├── aperture/                 datamap, userspace, modes, freight
│   ├── traits/                   dataset, intented, emitter, buffered (view bundler),
│   │                             chaosmonkey, conversational (ws+harness), tooled (MCP+agentic),
│   │                             + fraught (in index.js) + SELFEVIDENT/EXPOSED markers
│   └── lifecycle/                daemon-level phases
│                                 population.{core, wiring, datamap, authority,
│                                              acid, modes, handlers, services}
│                                 resolution.{kernel, modes}
│                                 integration.{call, uninstall}
├── process/                      ATTACHED services (22 lines total)
└── tests/
    ├── scenarios/                shared fixtures (exported via deno.jsonc)
    │   ├── index.js              re-exports
    │   ├── entities.ts           Domain schemas + seed() + TestLiteralRepository
    │   ├── daemon.js             create() → { conn, authedConn, orm, em, ... }
    │   ├── mode.js               mountMode, mountModes
    │   ├── bench.js              bench({ kernel, modes, services })
    │   └── lighthouse.js         create()
    ├── bench/smoke.test.js       7 steps
    ├── daemon/                   datamap, userspace, smoke, batch, integration (41 steps)
    ├── mode/                     traits (19 steps), emitters (28 steps)
    └── runtime/composition.test.js  6 steps
```

daemon system. The Daemon class at `systems/runtime/daemon/daemon.js` is the business object — aperture, connection/call, kernel, entities, modes, services, twitch, statics. DaemonDie at `systems/runtime/daemon/die.js` extends Wafer and holds two key data structures: `register` (raw modules from paladin) → `variant` (resolved instances).

lifecycle phases at `systems/runtime/daemon/lifecycle/`:

- `population.{core, wiring, datamap, authority, acid, modes, handlers, services}` — load registries via paladin.vip.accioMap, instantiate datamap provider, wire auth, init hallucinator, instantiate Mode objects, load consume services
- `resolution.{kernel, modes}` — kernel adds `shard.ambient.store((ctx) => ({ user, entities }))` for ambient scope; modes apply trait functions inside `datamap.context()` wrapper
- `integration.{call, uninstall}` — call compiles aperture via `shape.http()` + `shard.transmitter.inline()` for internal Connection; uninstall removes DB records for modes no longer loaded

mode traits at `systems/runtime/daemon/traits/`:

- **VIEWABLE** at `traits/viewable.js` — compiles Svelte views via esbuild, exposes `/view` endpoint. (Note: renamed from BUFFERED; the old name is retained as a deprecated `ModeTraitsEnum` alias for persisted-data compatibility.)
- **DATASET** at `traits/dataset.js` — upserts symbols and literals from `mode.cake.dataset.entities` in chunks of 100 via `orm.em.upsertMany()`
- **INTENTED** at `traits/intented.js` — upserts IntentEntity rows from `mode.cake.dataset.intent[]`
- **EMITTER** at `traits/emitter.js` — compiles `mode.cake.emitter` Vector with ambient inheritance, thread lookup, blacklist conversion, Yield post-processor
- **CHAOSMONKEY** at `traits/chaosmonkey.js` — wires harness via slurp + shape.object + aperture mounts (returned finalizer; refactored 2026-05-06)
- **CONVERSATIONAL** at `traits/conversational.js` — owns websocket dialogue session, ambient user binding, harness stream consumption, audio engagement (BOX deck) when mode declares VOCALIZED
- **TOOLED** at `traits/tooled.js` — integrates `mode.cake.tools` (a Vector of tool descriptors) into hallucinator via `shape.agentic()`; harness absorbs the tool catalog
- **FRAUGHT** (in `traits/index.js`) — indexes freight catalog from `mode.cake.freight`, exposes `/freight` endpoint
- **SELFEVIDENT / EXPOSED** (markers in `traits/index.js`) — no-op + aperture binding markers

route registration at `systems/runtime/daemon/aperture/`:

- `datamap.js` — per-entity branches: `/entities/{literal,symbol,mode,intent}` with `repository()` + (literal/symbol) `reactive()` SSE
- `userspace.js` — `/userspace/` prefix, all behind `shard.secure.authorize`. `/handshake`, `/entities/session` (scoped to authenticated user via `shard.datamap.scope(ctx => ({ user: ctx.user.id }))`)
- `modes.js` — `POST /modes/:type/:method` mode lookup
- `freight.js` — `POST /cargo` returns freight catalog

Compiled at `resolve.compose`: `shape.http(aperture) → handler` then `shard.cors.wrap(handler)`. No Oak. No middleware stack — just Vector traversal.

scenario tiers at `systems/runtime/tests/scenarios/`, exported via `@vivalence/runtime/scenarios`:

- `mountMode(viva)` at `systems/runtime/tests/scenarios/mode.js` — lightweight; single `.viva.js` → minimal daemon; stub VIEWABLE, TestLiteralRepository, real INTENTED + EMITTER
- `mountModes(vivas[])` at `systems/runtime/tests/scenarios/mode.js` — N modes into one shared daemon; for cross-mode composition (tactic emitters)
- `bench({ kernel, modes, services })` at `systems/runtime/tests/scenarios/bench.js` — full daemon factory; real lifecycle except paladin (resolved manually), datamap (in-memory provider from `subsystems/typology/tests/scenarios/datamap.js`), auth (permissive default; override with `services.lighthouse`); accepts paladin specifiers OR raw imports

service wiring on bench: `services.lighthouse` enables real auth chain + userspace routes; `services.hallucinator` populates `daemon.hallucinator` for CHAOSMONKEY; `services.consume.<slug>` populates `daemon.services[slug]`.

process system. `systems/runtime/process/` (22 lines total). ATTACHED services with their own aperture, mounted at `/attached/process/{type}/{slug}`. Lighthouse multiplayer at `registry/services/@vivalence/lighthouse/multiplayer/` is the primary process — serves `/auth/*` and `/entities/{identity,daemon}/*`.

## context

testing gaps:

- DATASET trait, process system, disintegrate cascade, watchdog patrol — untested
- view/freight remainder serving — untested at runtime level (covered by typology http shape tests at `subsystems/typology/tests/shape/http.test.js`)

active work:

- cortex — DONE 2026-04-18 (`.ikiro/quests/cortex.quest.org`). CHAOSMONKEY + CONVERSATIONAL traits live.
- toolcalling — IMPLEMENTING (`.ikiro/quests/toolcalling.quest.org`). TOOLED trait shipped M1+M2; M3 bruno-surface landed, anthropic-stream-bug-blocked.
- voice / longdistance — Box deck + CONVERSATIONAL audio engagement shipped (`.ikiro/quests/voice.quest.org` IMPLEMENTED, awaiting live handshake verify); VOCALIZED literal-trait + asset entity-type pending typology enum expansion (`.ikiro/quests/longdistance.quest.org`).
- wafer-lifecycle — vector-based process composition; typology + paladin migrated, runtime pending (`.ikiro/quests/wafer-lifecycle.quest.org`).
