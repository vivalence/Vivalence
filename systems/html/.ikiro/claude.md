> This package is part of @vivalence/viva. Read the root orientation at $REPOSITORY/.ikiro/CLAUDE.md before working here — this subsystem does not stand alone.
>
> These docs are **ikiro** — our shared development ontology. You are not just a consumer of ikiro. You are responsible for maintaining and improving it. When you learn something, fix something, or discover a gap, update these docs. This is not optional.

# HTML Client

> Browser interface. Connects to daemon, renders modes, manages terminal/buffer lifecycle.

## Role

Surface. Under heavy construction. A SvelteKit app that connects to the runtime daemon via Connection, hydrates entities, and renders mode views in a terminal/buffer pattern. Most logic lives server-side — the client is thin, focused on connection, state management, and view rendering.

## Stack

- SvelteKit with adapter-static (SPA, fallback: 200.html)
- Vite build (ssr.noExternal: true — bundles all deps for clean builds under Deno)
- Tailwind CSS + PostCSS
- nanostores for reactive state
- @deno/vite-plugin for Deno compatibility
- nginx:alpine for production serving (Docker)

## Structure

```
src/
├── client.js               (17L) Bootstrap — Connection + Lighthouse setup
├── client.html              App template
├── routes/
│   ├── +page.svelte        (74L) Login page (video bg + Login component)
│   ├── +layout.js          (13L) Lifecycle boot — initializes daemon
│   ├── +layout.svelte       Layout wrapper
│   ├── [...viva]/           Dynamic catch-all for viva routes
│   └── drapes/              Design system demo pages
├── surface/                 UI components
│   ├── tree/                Navigation tree
│   ├── view/                Display components (lighthouse, status)
│   └── panels/              Ticker, modeline panels
└── typology/                Data layer
    ├── entities/            daemon, lighthouse, mode, valence, session, product
    └── prototypes/          (509L total)
        ├── terminal.js      (73L) Main state — nanostores for phase/context
        ├── buffer.js         Buffer lifecycle
        ├── stall.js          Terminal output
        ├── repository.js     Entity collections (find, findOne, add)
        ├── entity.js         Base entity
        └── mode.js           Mode hydration
```

## Connection Pattern

`client.js` creates Connection from PUBLIC_VIVA_LIGHTHOUSE_REMOTE. Lighthouse wraps it with middleware (authorize, retry, timeout, track). On boot (`+layout.js`), Lighthouse.lifecycle() fetches `/manifest`, branches connections per entity type, hydrates Mode and Valence objects, sets up `.call()` and `.produce()` methods.

## Key Patterns

- **nanostores atoms** for reactive state (Terminal holds $phase, $daemon, $mode, $session, $valence)
- **Terminal + Buffer lifecycle**: Terminal manages phase (STREAM/CHAT/FEED), Buffer holds state per mode
- **Repository pattern** for entity collections
- **Connection.branch()** for path-based routing (mirrors server-side Aperture structure)

## Build & Deploy

### Bundle

`deno task html/bundle` runs `vite build`. Only requires `VIVA_SYSTEM_MODE=BUILD` and `VIVA_SYSTEM_ROLE=CLIENT`. Paladin is NOT needed during build — `serverConfig()` in vite.config.mjs is gated behind `command === "serve"` and only runs for dev/preview.

Key: adapter-static eliminates SSR entirely. The postbuild phase was failing under Deno because SSR workers couldn't resolve bare imports (`clsx`, `@sveltejs/kit/internal/server`). adapter-static with `fallback: "200.html"` sidesteps this — pure SPA output. Revisit if Deno/Vite SSR resolution improves — adapter-node would eliminate the env.js entrypoint hack (see Docker Image below).

`ssr.noExternal: true` in vite.config.mjs is required so that Vite bundles all dependencies into the SSR output rather than leaving bare imports for Deno to resolve (which fails in worker subprocesses).

### Circular import constraint

Entity files (`src/typology/entities/`) must NOT import from the barrel `@vivalence/html/typology`. The barrel re-exports all entities, creating circular dependencies that cause TDZ errors in the production bundle (Rollup flattens modules and can't linearize the cycle). Instead:

- Entity files import `Entity` from `"../prototypes/entity.js"` (direct path)
- `daemon.js` imports `Mode`, `Valence`, `Repository` from sibling/prototype files directly
- `lighthouse/lifecycle.js` imports `Daemon` from `"../daemon.js"` and uses `await import("$client")` for `dataspace` (dynamic import breaks the static cycle)

This works in dev (ESM live bindings resolve lazily) but breaks in production bundles. If you add a new entity or modify imports, verify with `deno task bundle && deno task preview`.

### Docker Image

Multi-stage build:
1. **Build stage** (vivalence/viva:alpine): sets `VIVA_SYSTEM_MODE=BUILD`, `VIVA_SYSTEM_ROLE=CLIENT`, runs `deno task html/bundle`. No circuitry, no PUBLIC_VIVA_* vars, no paladin needed.
2. **Runtime stage** (nginx:alpine): copies `build/` from stage 1, serves static files on port 1794. nginx `try_files $uri $uri/ /200.html` handles SPA fallback for `[...viva]` routing.

**Environment variable injection**: SvelteKit adapter-static writes `PUBLIC_*` env vars to `build/_app/env.js` at build time. Since Docker build has no PUBLIC_VIVA_* vars, env.js is empty. The Dockerfile entrypoint script runs at container startup, reads `PUBLIC_VIVA_*` from docker-compose runtime env vars, and overwrites `_app/env.js` before nginx starts. This makes the image deployment-agnostic — same image, different env vars per deployment.

### Local Dev

- `deno task html/watch` — Vite dev server, needs `VIVA_SYSTEM_ROLE=CLIENT` and paladin (circuitry via testament/variant/environment/)
- `deno task html/bundle` — production build, no paladin needed
- `deno task html/preview` — serves the production build locally via Vite preview, needs paladin for host/port config

### vite.config.mjs and paladin

Paladin is only loaded for dev and preview (`command === "serve"`), never during build. `serverConfig()` imports paladin, awaits `paladin.ikiro`, and reads `paladin.variant.clients.html` for host, port, cors config.

Resolve aliases map `@vivalence/*` package imports to filesystem paths relative to the monorepo root. This is how the client accesses subsystem code (typology, shared, dapper, drapes) without npm publishing.

### Deployment Flow

Docker-compose (registry/wafers/@vivalence/variant/multiplayer/docker-compose.yml) sets runtime env vars on the html service:
- `PUBLIC_VIVA_LIGHTHOUSE_REMOTE` and `PUBLIC_VIVA_CLIENT_HTML_REMOTE` — injected into env.js at container startup
- `VIVA_CIRCUITRY_MOUNT`, `VIVA_CLIENT_HTML_SERVE` — ignored by nginx (leftover from previous Deno-based serving)

## Work Packages

### Testing Gaps
- No client tests exist

### Human Documentation Needs (Divio)
- **Tutorial**: "Run the client locally" — minimal until architecture stabilizes
- **How-to**: "Build and deploy the HTML client" — Dockerfile, env vars, circuitry (documented above)
- Defer deeper documentation — under heavy construction

### Active Work
- Mobile readiness
- ~~Serving built client (production)~~ DONE — adapter-static + nginx + Docker multi-stage
- Possible SvelteKit → Svelte migration
- Possible React migration (future)
- Session-first routing — [session-first-routing.workpackage.org](session-first-routing.workpackage.org) — replace [...viva] catch-all with /daemon/:slug/session/:id. Depends on buffer/intent migration.
- Buffer/Intent entity renames on client side (valence→intent, product→buffer in entities, terminal, populate)
- LANGUAGED/AGENTIC traits will need client-side detection and UI (chat interface, task submission) per harness workpackage

## Maintenance

This is the most volatile part of the system. Don't over-invest in documenting specific component APIs — they change constantly. Focus on: connection pattern, entity hydration flow, terminal/buffer lifecycle concepts.
