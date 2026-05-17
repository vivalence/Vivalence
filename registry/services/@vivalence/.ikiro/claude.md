> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — registry/services (container)

Infrastructure. Standalone providers consumed by daemons via circuitry. Each service exports `manifest` (identity) + `provider(config)` (factory). Services with the ATTACHED trait also export an `aperture` and run as their own process. Read `.ikiro/CLAUDE.md` first.

## architecture

manifest declares; provider creates.

Every service exports the same shape from `service.viva.js`: `manifest` + async `provider(config) → service_interface`. Circuitry references services as strings (`@vivalence/{type}/{slug}`). Paladin resolves them via VIP; the daemon's populate phases call each provider with its config block. Some providers return data structures (`datamap → { orm, entities }`), some return functions (`nlp → (text) → tokens`), some are async setup with side effects (lighthouse → authority + entity routes mounted on a process aperture).

structure:

```
registry/services/@vivalence/
├── datamap/libsql/                ORM + SQLite + auto-migration
├── hallucinator/
│   ├── anthropic/                 Claude — text/object/action (was hal257, renamed)
│   ├── elevenlabs/                speech faculty (TTS) — longdistance
│   ├── deepgram/                  verbatim faculty (ASR) — longdistance
│   └── bak/                       hal257 retired + Groq/OpenAI/Perplexity/TogetherAI archive
├── lighthouse/
│   ├── multiplayer/               full identity + auth + datamap (ATTACHED)
│   └── localhost/                 dormant — hardcoded localhost ADMIN
└── nlp/                           Stanza tokenization via Docker
```

provider/consumer flow (daemon side):

```
daemon.populate.core         paladin.vip.accioMap(consume) — resolve all service modules
daemon.populate.datamap      datamap.provider(config, variant) → { orm, entities }
daemon.populate.authority    lighthouse.provider(config) → authority + entity routes
daemon.populate.acid         initialize hallucinator/cortex
daemon.populate.services     each consume.<slug>.provider(config) → daemon.services[slug]
```

datamap (`registry/services/@vivalence/datamap/libsql/service.viva.js`, 102 lines):

- manifest `{ type: "datamap", slug: "libsql" }`
- provider(`datamap, variant`) → `{ orm, entities }`. `datamap` carries mount paths (DB file, migrations). `variant` is an array of entity schemas + subscribers. Auto-migration. Repositories per entity type.
- wired in test-system (runtime) + test-daemon (brazilian)

hallucinator — provider contract migrating from `{ object, action }` to `Faculty[]` per cortex quest:

- anthropic — `manifest { type: "hallucinator", slug: "anthropic" }`. Was hal257 (renamed). `provider/index.js` (~144 lines), `provider/profiles.js` (DRONE / ACADEMIC). Old contract: `object(options)` (structured output via TypeBox schema) + `action(options)` (ToolLoopAgent, max 10 steps). New contract: `Faculty[]` — each declares type, accepts, produces, delivery, tune, context, `hallucinate(turns, config)`. The cortex resolves providers by tune in 3-space.
- elevenlabs — speech faculty (TTS). Part of longdistance audio pipeline.
- deepgram — verbatim faculty (ASR / transcription). Part of longdistance audio pipeline.
- bak — `hallucinator/bak/hal257/` (retired) + legacy archive (Groq, OpenAI, Perplexity, TogetherAI).

lighthouse/multiplayer (`registry/services/@vivalence/lighthouse/multiplayer/`):

- manifest `{ type: "lighthouse", slug: "multiplayer", traits: ["ATTACHED", "SERVICE", "DATAMAP", "SYSTEMMAP"] }` — ATTACHED runs as a process with own aperture
- aperture endpoints — `POST /auth/{signup, login, logout, verify, refresh}`; `/entities/identity/*` + `/entities/daemon/*` via `shard.datamap.repository()`
- key files:
  - `server/authority.js` (392 lines) — auth workflow
  - `server/identity.js` (78 lines) — credential verification (argon2)
  - `server/entities.js` (112 lines) — ORM integration (Identity, Daemon, AuthenticatorEmbed)
  - `server/lib/jwt.js` (149 lines) — token lifecycle (create, verify, revoke)
  - `provider/index.js` (127 lines) — provider factory

lighthouse/localhost (dormant, `lighthouse/localhost/`, ~25 lines): hardcoded ADMIN identity; dev/test only; not wired in current circuitry.

nlp (`registry/services/@vivalence/nlp/`):

- manifest `{ type: "service", slug: "nlp-stanza", traits: ["SERVER", "DOCKER", "COMPOSE"] }`
- provider returns `async (text) → tokens[]` — max 1000 chars; processors tokenize / mwt / pos / lemma / depparse; language-specific (e.g., "es")
- control vector — Docker CLI ops (status, build, start, up, down)
- server: `nlp/server/` Python + Docker (Dockerfile, docker-compose, server.py)

## context

consumers:

- runtime — services resolved during daemon populate; lighthouse attached as process; datamap provides ORM; hallucinator/cortex provides faculties
- daemon modes — CHAOSMONKEY uses cortex/hallucinator; EMITTER produces buffers; auth middleware via `shard.secure.authority()` + `authorize()`
- circuitry — `wafers/@vivalence/variant/multiplayer/server/{runtime,daemon}.viva.js` wire services into the system

testing:

| file | lines | coverage |
|------|-------|----------|
| hallucinator/anthropic/tests/hallucinator.test.js | 108 | object generation, agent tool execution (uses Anthropic API) |
| lighthouse/multiplayer/tests/auth.test.js | 85 | login/signup, token validation |
| lighthouse/multiplayer/tests/lighthouse.test.js | 176 | full auth workflow |
| lighthouse/multiplayer/tests/datamap.test.js | 91 | entity CRUD via `@vivalence/runtime/scenarios` (lighthouse.js) |

testing gaps:

- no unit tests for datamap service (ORM init, migration, repository creation)
- hallucinator tests hit live API — no mock/stub
- no tests for nlp service provider
- no tests for lighthouse JWT expiry/revocation edge cases
- no integration test for service → daemon consumption flow

active work:

- cortex — hallucinator contract migration from `{ object, action }` to `Faculty[]` (see `.ikiro/cortex.quest.org`). Biggest upcoming change to services.
- elevenlabs / deepgram audio faculties — longdistance pipeline (see `.ikiro/longdistance.quest.org`)
- realtime call service (future — bidirectional WebSocket audio)

dormant — nlp wired but may not be actively called by current modes; lighthouse/localhost not wired (dev fallback); hallucinator/bak legacy providers (Groq, OpenAI, Perplexity, TogetherAI).

completed — lighthouse datamap migration: parametric `/:entity/:method` replaced by per-entity `shard.datamap.repository()` branches; old `expose()` preserved as comment in `server/entities.js`.
