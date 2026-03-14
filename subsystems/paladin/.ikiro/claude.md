# Paladin

> Bootstrap and configuration. Reads circuitry, resolves variants, composes registry entries into functional units.

## Role

Composition. Paladin is the "how things are wired" layer. It reads environment, discovers .viva.js manifests, resolves circuitry into daemon/service/client configurations, and provides the VIP registry for module resolution. The runtime consumes paladin's output — paladin itself never runs anything.

Singleton: `mod.js` exports a single paladin instance that self-initializes through two phases (incarnation + ikiro).

## Entry Points

| File | Lines | Purpose |
|------|-------|---------|
| mod.js | 32 | Singleton entry — runs incarnation (populate) then ikiro (resolve + integrate) |
| typology.js | 6 | Re-exports prototypes + lifecycle + belt |
| deno.jsonc | 15 | Exports: `.` (mod.js), `./typology` (typology.js) |

## Boot Sequence

mod.js runs two phases sequentially:

**Incarnation** (immediate, awaited):
1. `populate.env(paladin)` — reads Deno.env vars (VIVA_*, PUBLIC_VIVA_*, SECRET_VIVA_*), loads .env file
2. `populate.scopes(paladin)` — declares conditional scopes (system, registry, variant, circuitry, environment, mountpoint)
3. `populate.environment(paladin)` — loads JSON config files (secret.json → paladin.secret, others → paladin.env)
4. `populate.veryimportantpackage(paladin)` — creates VIP registry if role is SUDO or RUNTIME
5. `populate.questions(paladin)` — validates VIVA_SYSTEM_MODE and VIVA_SYSTEM_ROLE exist

**Ikiro** (async, stored as `paladin.ikiro` promise):
1. `resolve.circuitry(paladin)` — finds .viva circuit files, filters for type=circuit
2. `resolve.variant(paladin)` — compiles circuits into variant (runtime, clients, daemons[], services[])
3. `integrate.statements(paladin)` — ensures all mount directories exist
4. `integrate.publish(paladin)` — publishes PUBLIC_ env vars to Deno.env
5. `integrate.questions(paladin)` — validates paths (stub)

## Core Classes

### Paladin

`prototypes/paladin.js` (38 lines)

Properties:
- `env: Env` — public environment
- `secret: Env` — secret environment
- `traits: []` — loaded traits
- `variant` — the compiled output:
  - `circuitry[]` — raw circuit masks
  - `runtime{}` — runtime config (single)
  - `clients{}` — merged client configs
  - `daemons[]` — Mask instances with mount points
  - `services[]` — Mask instances with mount points

Getters: `role` → VIVA_SYSTEM_ROLE, `mode` → VIVA_SYSTEM_MODE.

Constructor attaches belt utilities via `belt.read(this)`, `belt.find(this)`, `belt.check(this)`, `belt.state(this)`, `belt.is(this)`, `belt.scope(this)`.

### Vip

`prototypes/vip.js` (54 lines) — "Very Important Package" registry loader.

- `mount(dir)` — scans directory for .viva.js files, registers each in pensieve
- `accio(query)` — single module fetch by lookup string (`@owner/type/slug@version`)
- `accioMany(queries[])` — batch fetch
- `accioMap(map{})` — recursive fetch preserving object structure (handles strings, arrays, nested objects)

Query format: `@vivalence/mode/flashcard@1.0.0` → parsed via `cast.lookup()`.

### Pensieve

`prototypes/pensieve.js` (49 lines) — extends Map. Nested `owner → type → slug → version → cake`.

- `register(cake)` — inserts module at manifest coordinates
- `revelio({owner, type, slug, version})` — retrieves module. No version → returns highest via semver.compare. With version → uses semver.satisfies.

## Belt Utilities

Seven modules attached to paladin instance during construction.

| File | Lines | Attaches | Key Methods |
|------|-------|----------|-------------|
| read.js | 59 | paladin.read | .file (auto-detect), .text, .json (JSONC), .viva (import + cast), .module (import) |
| find.js | 39 | paladin.find | .viva(dir) recursive, .json(dir) recursive, .read(paths[]) batch |
| check.js | 161 | paladin.check | .env(keys) validates env vars, .path(paths) validates existence. Returns result with .fails and .throw() |
| is.js | 39 | paladin.is | .sudo, .dev, .prod, .runtime, .client, .deployed, .citizen, .veryimportant — computed from role/mode/runtime |
| scope.js | 94 | paladin.scope | Proxy: `paladin.scope.system` evaluates condition before returning resolver result. paladin.scopes([name, condition, resolver]) registers scopes |
| state.js | 20 | paladin.state | .dir(path) ensures directory exists |
| index.js | 15 | — | Aggregates all belt modules |

## Lifecycle

Three phases in `lifecycle/`:

**populate.js** (156 lines) — `env`, `scopes`, `environment`, `veryimportantpackage`, `questions`

Scopes declare conditional paths:
- `system` — always available (VIVA_SYSTEM_MOUNT)
- `registry` — if env var or citizen
- `variant` — if VIVA_VARIANT_MOUNT
- `circuitry` — if env var or (variant + citizen)
- `environment` — if env var or (variant + citizen)
- `mountpoint` — if env var or (variant + citizen)

**resolve.js** (99 lines) — `circuitry`, `variant`

Circuitry resolution: finds .viva files in scope.circuitry, filters type=circuit. Variant compilation: extracts runtime (single, validates), merges clients, wraps daemons/services in Mask with mount points (`scope.mountpoint/daemon_{slug}`).

**integrate.js** (80 lines) — `statements`, `publish`, `questions`

Ensures mount dirs exist, publishes PUBLIC_ vars to Deno.env.

## How Composition Works

1. Circuitry files (`.viva.js` with type=circuit) define what a system looks like: which runtime, which clients, which daemons, which services
2. Paladin scans, loads, and compiles these into `paladin.variant`
3. VIP mounts the registry directory, indexing all .viva.js manifests by owner/type/slug/version
4. Runtime later calls `paladin.vip.accioMap(daemon.mask)` to resolve module references into actual code
5. Each daemon/service mask gets a mount point for filesystem isolation

The key insight: circuitry is declarative configuration, VIP is a package manager, and paladin bridges the two.

## Tests

| File | Lines | Pattern | Coverage |
|------|-------|---------|----------|
| paladin.test.js | 291 | Specimen BDD | Full lifecycle: construction → population → resolution. Validates env, scopes, circuitry length, variant compilation |
| vip.test.js | 76 | Deno.test | mount, accio, accioMany, accioMap with temp dirs |
| pensieve.test.js | 49 | Deno.test | register/revelio, version resolution (highest wins) |
| tools.test.js | 78 | Deno.test | Belt methods: read.json, find.viva, Path creation |
| scopes.test.js | 18 | — | Mostly empty/commented out |

Total: ~512 lines. Lifecycle test pattern: construction → gestalt checks → cycle through phases → verify state.

## Where Used

- **Runtime**: Imports paladin singleton. Reads `paladin.variant.daemons/services/runtime/clients`. Uses `paladin.vip.accioMap` to resolve all module references. Checks `paladin.is.*` for role decisions.
- **HTML Client**: vite.config.mjs imports paladin, awaits `paladin.ikiro`, reads `paladin.variant.clients.html` for server config (host, port, cors). svelte.config.js also imports paladin (currently unused beyond import).
- **Circuitry**: `.viva.js` files are the input paladin processes. Located at:
  - **Local dev**: testament/variant/circuitry/ (via VIVA_VARIANT_MOUNT or VIVA_CIRCUITRY_MOUNT)
  - **Deployment**: registry/wafers/@vivalence/circuitry/ (set via VIVA_CIRCUITRY_MOUNT in docker-compose)
- **Registry**: All .viva.js manifests are indexed by VIP via pensieve.

## Environment Resolution in Different Contexts

Paladin resolves configuration differently depending on context:

**Local development** (testament):
- VIVA_VARIANT_MOUNT or VIVA_ENVIRONMENT_MOUNT points to testament/variant/environment/
- JSON files (variant.jsonc, secrets.jsonc, services.jsonc) are loaded into paladin.env/paladin.secret
- Circuitry found via scope.circuitry → testament/variant/circuitry/

**Docker build** (Dockerfile):
- No testament directory — it's in .dockerignore (has secrets)
- Env vars set directly: VIVA_SYSTEM_MODE, VIVA_SYSTEM_ROLE, VIVA_CIRCUITRY_MOUNT, etc.
- VIVA_CIRCUITRY_MOUNT points to registry/wafers/@vivalence/circuitry/ inside the image
- Circuitry .viva.js files use `paladin.env.get()` to read the env vars

**Production** (docker-compose):
- docker-compose.yml sets all env vars (including secrets and PUBLIC_VIVA_* for client URLs)
- Same VIVA_CIRCUITRY_MOUNT pointing to circuitry inside the image
- PUBLIC_VIVA_* vars get published to Deno.env by integrate.publish() and are available to SvelteKit

## Dependencies

From typology: Env, Path, Mask, cast, is, fromm, Url.
External: @cross/runtime (CurrentRuntime), @std/dotenv, @std/jsonc, @std/fs, @std/path, @std/semver.

## Work Packages

### Testing Gaps
- scopes.test.js is effectively empty — scope proxy and conditional resolution untested
- No tests for resolve.variant() output structure (Mask creation, mount point assignment)
- No tests for belt/check.js validation framework (.fails, .throw() error flow)
- pensieve.test.js calls "lookup" but actual method is "revelio" — may be outdated
- No integration test for full paladin → runtime consumption flow

### Human Documentation Needs (Divio)
- **How-to**: "Wire a new daemon via circuitry" — .viva.js format, mount resolution, VIP registration
- **Explanation**: "Why scopes? Why conditional resolution?" — the deployment flexibility story
- **Reference**: Circuitry format specification, VIP query format, belt API
- **Tutorial**: "Add a new service to the system" — manifest, provider contract, circuitry wiring

### Active Work
- Circuitry format may evolve as more daemons are added
- @vivalence/shared removal affects belt imports

### Planned Changes
- Aperture migration may affect how mount points are resolved
- resolve.consumables() and resolve.cross() are commented out — cross-service validation planned
