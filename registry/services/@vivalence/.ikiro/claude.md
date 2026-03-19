> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# Services

> Provider/consumer contracts. Infrastructure services consumed by daemons.

## Role

Infrastructure. Services are standalone providers that daemons consume via their circuitry configuration. Each service exports a `manifest` (identity) and a `provider(config)` function (factory). Some services also expose an `aperture` (HTTP endpoints) and get attached as processes.

## Service Catalog

### Datamap (libsql) — ACTIVE

`datamap/libsql/service.viva.js` (102 lines)

Database mapping service. Initializes MikroORM with SQLite backend.

**Manifest**: `{ type: "datamap", slug: "libsql" }`

**Provider contract**: `provider(datamap, variant) → { orm, entities }`
- `datamap` — config with mount paths (database file, migrations)
- `variant` — array of entity schema definitions with optional subscribers
- Returns: ORM instance + entity repository map

Handles automatic migration. Creates repositories for each entity type.

Wired in: test-system (runtime), test-daemon (brazilian daemon).

### Hallucinator (hal257) — ACTIVE (contract changing)

`hallucinator/hal/` — 4 files

AI/LLM reasoning service wrapping the Anthropic API.

**Manifest**: `{ type: "hallucinator", slug: "hal257", traits: ["MONK"] }`

**Current provider contract**: `provider(service) → { object, action }`
- `object(options)` — structured output generation. Takes schema (TypeBox), system prompt, user prompt. Returns schema-validated object via Claude Sonnet.
- `action(options)` — agent-based tool execution. Takes tools (Vector-derived), system prompt, user prompt. Runs ToolLoopAgent with max 10 steps.

**Future provider contract** (per cortex workpackage): `provider(service) → Faculty[]`
- Each channel declares: type, accepts, produces, delivery, tune, context, hallucinate(turns, config)
- The `{object, action}` shape will be replaced by an array of faculties
- Model identity becomes internal to the service — the cortex only sees faculties with tune vectors

**Key files**:
- `provider/index.js` (144 lines) — main implementation
- `provider/providers.js` (10 lines) — Anthropic provider wrapper
- `provider/profiles.js` (32 lines) — model profiles (DRONE, ACADEMIC)

**Archive**: `hallucinator/hal/archive/` contains dormant providers (Groq, OpenAI, Perplexity, TogetherAI).

Wired in: test-daemon (brazilian daemon) with Anthropic API key.

### Lighthouse — two implementations

#### Multiplayer — ACTIVE

`lighthouse/multiplayer/` — 9 files

Full identity and authentication service. ATTACHED trait means it runs as a process with its own aperture.

**Manifest**: `{ type: "lighthouse", slug: "multiplayer", traits: ["ATTACHED", "SERVICE", "DATAMAP", "SYSTEMMAP"] }`

**Provider contract**: `provider(service) → authority setup`

**Aperture endpoints**:
- `POST /auth/signup` — create identity with argon2 password hash
- `POST /auth/login` — verify credentials, issue access + refresh JWT tokens
- `POST /auth/logout` — invalidate refresh token
- `POST /auth/verify` — check access token validity
- `POST /auth/refresh` — issue new access token from refresh token
- `GET /entities/:entity/:method` — identity/daemon CRUD

**Key files**:
- `server/authority.js` (392 lines) — auth workflow
- `server/identity.js` (78 lines) — credential verification (argon2)
- `server/entities.js` (112 lines) — ORM integration (Identity, Daemon, AuthenticatorEmbed)
- `server/lib/jwt.js` (149 lines) — token lifecycle (create, verify, revoke)
- `provider/index.js` (127 lines) — provider factory

Wired in: test-system (as system service), test-daemon (brazilian daemon).

#### Localhost — DORMANT

`lighthouse/localhost/` — 2 files (25 lines total)

**Manifest**: `{ type: "lighthouse", slug: "localhost", traits: ["IDENTITY"] }`

Hardcoded localhost identity with ADMIN role. Dev/test only. Not wired in current circuitry.

### NLP (Stanza) — ACTIVE

`nlp/` — manifest + provider + Docker server

Tokenization service via Python Stanza NLP over HTTP.

**Manifest**: `{ type: "service", slug: "nlp-stanza", traits: ["SERVER", "DOCKER", "COMPOSE"] }`

**Provider contract**: `provider(service) → async (text) → tokens[]`
- Takes text (max 1000 chars), returns sentence token arrays
- Configurable processors: tokenize, mwt, pos, lemma, depparse
- Language-specific (e.g., "es" for Spanish)

**Control vector**: CLI operations for Docker management (status, build, start, up, down).

**Key files**:
- `service.viva.js` (84 lines) — manifest + control vector
- `provider/index.js` (44 lines) — HTTP client to Stanza server
- `server/` — Python/Docker infrastructure (Dockerfile, docker-compose, server.py)

Wired in: test-daemon as consumed service.

## Provider/Consumer Contract Pattern

All services follow the same pattern:

```
service.viva.js exports:
  manifest — { type, slug, name?, traits? }
  provider — async (config) => service_interface

Circuitry references:
  { module: "@vivalence/{type}/{slug}", ...config }

Resolution:
  paladin.vip.accio(module) → cake
  cake.provider(config) → usable service
```

The daemon's `populate.core()` resolves all service references via `paladin.vip.accioMap`, then `populate.datamap()`, `populate.authority()`, `populate.acid()`, and `populate.services()` call each provider.

## Tests

| File | Lines | Coverage |
|------|-------|----------|
| hallucinator/hal/tests/hallucinator.test.js | 108 | Object generation, agent tool execution (uses Anthropic API) |
| lighthouse/multiplayer/tests/auth.test.js | 85 | Login/signup flow, token validation |
| lighthouse/multiplayer/tests/lighthouse.test.js | 176 | Complete auth workflow: signup, login, verify, refresh, logout |

Total: ~369 lines. Hallucinator tests require API key. Lighthouse tests require running server.

## Where Used

- **Runtime**: Services resolved during daemon populate phase. Lighthouse attached as process. Datamap provides ORM. Hallucinator provides brain.
- **Daemon modes**: CHAOSMONKEY trait uses hallucinator. PRODUCER trait uses products from datamap ORM. Auth middleware from lighthouse.
- **Circuitry**: test-system.viva.js and test-daemon.viva.js wire services into the system.

## Work Packages

### Testing Gaps
- No unit tests for datamap service (ORM initialization, migration, repository creation)
- Hallucinator tests hit live API — no mock/stub tests
- No tests for NLP service provider
- No tests for lighthouse JWT token expiry/revocation edge cases
- No integration test for service → daemon consumption flow

### Human Documentation Needs (Divio)
- **How-to**: "Add a new service" — manifest format, provider contract, circuitry wiring, ATTACHED trait for aperture services
- **Reference**: Provider contract specification per service type
- **Explanation**: "Why provider/consumer? Why not direct imports?" — the composition and deployment flexibility story

### Active Work
- Hallucinator cortex — [cortex.workpackage.org](../../../.ikiro/cortex.workpackage.org) — the hallucinator service contract is changing from `{object, action}` to an array of faculties. Each faculty declares type (conversation/object/speech/call), channels (accepted/produced data types), delivery modes (whole/stream), tune vector ([cost, quality, speed]), context limit, and a stateless `hallucinate(turns, config)` function. The cortex resolves providers by tune in 3-space. This is the biggest upcoming change to services.
- Voice/speech service (future — ElevenLabs or similar, provides speech faculty)
- Call service (future — realtime bidirectional audio, WebSocket-based)

### Dormant
- NLP service: wired but may not be actively called in current modes
- lighthouse/localhost: not wired, dev-only fallback
- hallucinator/archive: legacy AI providers (Groq, OpenAI, etc.)

## Maintenance

When adding a new service:
1. Create directory under registry/services/@vivalence/{type}/{slug}/
2. Export manifest and provider from service.viva.js
3. Wire in circuitry (.viva.js circuit file)
4. If ATTACHED trait: also export aperture for HTTP endpoints
5. Add to daemon's consume config if daemon-level service
