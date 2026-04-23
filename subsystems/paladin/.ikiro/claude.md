# IKIRO — paladin (container)

Composition. Reads circuitry, resolves manifests, compiles a runnable variant. The runtime consumes this variant; paladin itself never runs anything. Read `.ikiro/CLAUDE.md` first.

## architecture

declarative manifests, compiled product.

Paladin is a singleton compiler. Circuitry files (`.viva.js` with `type: "circuit"`) declare what the system is — runtime, clients, daemons[], services[]. Paladin scans the registry, indexes every `.viva.js` manifest in pensieve (owner → type → slug → version), then compiles each circuit into `paladin.variant` with mount points. The runtime later resolves module references through `paladin.vip.accioMap()` to wire concrete modules into daemons.

boot sequence (`subsystems/paladin/mod.js`):

```
incarnation (sync, awaited)
├── populate.env             VIVA_*, PUBLIC_VIVA_*, SECRET_VIVA_*; .env file
├── populate.scopes          system / registry / variant / circuitry / environment / mountpoint
├── populate.environment     JSON config (secret.json → paladin.secret; rest → paladin.env)
├── populate.veryimportantpackage  VIP if role ∈ {SUDO, RUNTIME}
└── populate.questions       validate VIVA_SYSTEM_MODE + VIVA_SYSTEM_ROLE present
ikiro (async, paladin.ikiro promise)
├── resolve.circuitry        find .viva files in scope.circuitry, filter type=circuit
├── resolve.variant          extract runtime, merge clients, wrap daemons/services in Mask + mount
├── integrate.statements     mkdir mount points
├── integrate.publish        publish PUBLIC_ vars to Deno.env
└── integrate.questions      stub
```

structure:

```
subsystems/paladin/
├── mod.js                    singleton entry — runs incarnation + ikiro
├── typology.js               re-exports prototypes + lifecycle + belt
├── prototypes/
│   ├── paladin.js            Paladin class (38 lines) — env, secret, traits, variant
│   ├── vip.js                Vip (54 lines) — mount(dir), accio(query), accioMap(map)
│   └── pensieve.js           Pensieve extends Map (49 lines) — owner→type→slug→version
├── belt/
│   ├── read.js               .file (auto-detect) / .text / .json (JSONC) / .viva / .module
│   ├── find.js               .viva(dir) / .json(dir) / .read(paths) — recursive
│   ├── check.js              .env(keys) / .path(paths) — returns { fails, throw() }
│   ├── is.js                 .sudo / .dev / .prod / .runtime / .client / .deployed / .citizen
│   ├── scope.js              Proxy — paladin.scope.system evaluates condition before resolving
│   └── state.js              .dir(path) — ensures directory exists
└── lifecycle/
    ├── populate.js           env / scopes / environment / veryimportantpackage / questions
    ├── resolve.js            circuitry / variant
    └── integrate.js          statements / publish / questions
```

three core prototypes:

- Paladin (`subsystems/paladin/prototypes/paladin.js`) — the singleton. Fields: `env`, `secret`, `traits[]`, `variant: { circuitry[], runtime{}, clients{}, daemons[], services[] }`. Getters `role` / `mode` from `VIVA_SYSTEM_*`. Constructor attaches all belt utilities via `belt.read(this)` etc.
- Vip (`subsystems/paladin/prototypes/vip.js`) — package resolver. `mount(dir)` scans for `.viva.js`, registers each in pensieve. `accio(query)` parses `@owner/type/slug@version` via `cast.lookup()`, fetches one. `accioMany([])` batches. `accioMap({})` recursively walks an object preserving structure (handles strings, arrays, nested objects).
- Pensieve (`subsystems/paladin/prototypes/pensieve.js`) — extends Map, nested by manifest coordinates. `register(cake)` inserts at `owner/type/slug/version`. `revelio({owner, type, slug, version})` retrieves; no version → highest via `semver.compare`; with version → `semver.satisfies`.

variant compilation — `resolve.variant` extracts the single runtime, merges client configs, wraps each daemon and service spec in a Mask with a mount point: `scope.mountpoint/daemon_{slug}`. The runtime later does `paladin.vip.accioMap(daemon.mask)` to resolve all module-reference strings into actual loaded modules.

deployment contexts — paladin resolves env differently:

- local dev — `VIVA_VARIANT_MOUNT` or `VIVA_ENVIRONMENT_MOUNT` → `testament/variant/environment/`; circuitry via scope.circuitry → `testament/variant/circuitry/`
- docker build — testament absent (.dockerignore has secrets); env vars set directly; `VIVA_CIRCUITRY_MOUNT` → `registry/wafers/@vivalence/circuitry/` inside the image
- production — `docker-compose.yml` sets all vars including `PUBLIC_VIVA_*`; `integrate.publish` exposes them to Deno.env for SvelteKit

## context

dependencies:

- typology — `Env`, `Path`, `Mask`, `cast`, `is`, `fromm`, `Url`
- external — `@cross/runtime` (CurrentRuntime), `@std/dotenv`, `@std/jsonc`, `@std/fs`, `@std/path`, `@std/semver`

consumers:

- runtime — imports the singleton, awaits `paladin.ikiro`, reads `paladin.variant.{daemons, services, runtime, clients}`, resolves all module references via `accioMap`. Checks `paladin.is.*` for role decisions.
- html — `vite.config.mjs` awaits `paladin.ikiro`, reads `paladin.variant.clients.html` for host/port/cors. `svelte.config.js` imports paladin (currently unused beyond import).
- circuitry input — local: `testament/variant/circuitry/`; deployment: `registry/wafers/@vivalence/variant/multiplayer/` (currently the only active variant)
- registry — every `.viva.js` is indexed by VIP via pensieve

testing:

| file | lines | coverage |
|------|-------|----------|
| paladin.test.js | 291 | full lifecycle: construction → population → resolution; validates env, scopes, circuitry length, variant compilation |
| vip.test.js | 76 | mount, accio, accioMany, accioMap with temp dirs |
| pensieve.test.js | 49 | register/revelio, version resolution |
| tools.test.js | 78 | belt methods: read.json, find.viva, Path creation |
| scopes.test.js | 18 | mostly empty / commented |

testing gaps:

- `scopes.test.js` mostly empty — scope proxy + conditional resolution untested
- no tests for `resolve.variant` output shape (Mask creation, mount assignment)
- no tests for `belt/check.js` validation framework (.fails / .throw())
- `pensieve.test.js` calls "lookup" but actual method is "revelio" (born dead Oct 2025)
- `paladin.test.js:128` expects `hal257` but circuitry says `anthropic` since 2fab6794
- `vip.test.js` default exports return strings but `cast.viva()` expects object with manifest
- no integration test for full paladin → runtime consumption flow

active work:

- circuitry format may evolve as more daemons land
- `@vivalence/shared` removal affects belt imports
- VIP evolving toward jj-driven discovery scopes — see `.ikiro/very-important-packagemanager.workpackage.org`

retired — `resolve.consumables` and `resolve.cross` commented out (cross-service validation planned). Aperture migration done: mount points resolve through Vector/shape compilation, not Oak.
