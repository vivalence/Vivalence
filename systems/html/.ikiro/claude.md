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

`deno task html/bundle` runs `vite build`. Requires paladin to resolve — needs env vars or circuitry:

- **Local dev**: testament/variant/environment/ provides config via JSONC files
- **Docker build**: env vars set in Dockerfile, VIVA_CIRCUITRY_MOUNT points to circuitry inside the image

Key: adapter-static eliminates SSR entirely. The postbuild phase was failing under Deno because SSR workers couldn't resolve bare imports (`clsx`, `@sveltejs/kit/internal/server`). adapter-static with `fallback: "200.html"` sidesteps this — pure SPA output.

`ssr.noExternal: true` in vite.config.mjs is required so that Vite bundles all dependencies into the SSR output rather than leaving bare imports for Deno to resolve (which fails in worker subprocesses).

### Docker Image

Dockerfile pattern:
1. FROM vivalence/viva:alpine (has full repo + deps)
2. COPY changed files (temporary bridge until base image is rebuilt)
3. Set env vars for paladin: VIVA_SYSTEM_MODE=BUILD, VIVA_SYSTEM_ROLE=CLIENT, VIVA_CIRCUITRY_MOUNT, VIVA_CLIENT_HTML_SERVE, PUBLIC_VIVA_*
4. `RUN deno task html/bundle` — builds static assets into systems/html/build/
5. CMD runs serve.js — lightweight Deno static server with SPA fallback

### serve.js

14-line static file server using `@std/http/file-server`. Serves files from build/, falls back to 200.html for any non-file path (SPA client-side routing). Runs on port 1794.

### Deployment Flow

Docker-compose (registry/wafers/@vivalence/variant/multiplayer/docker-compose.yml) sets:
- `VIVA_CIRCUITRY_MOUNT=/viva/repository/registry/wafers/@vivalence/circuitry/html`
- `VIVA_CLIENT_HTML_SERVE=http://0.0.0.0:1794`
- `PUBLIC_VIVA_LIGHTHOUSE_REMOTE` and `PUBLIC_VIVA_CLIENT_HTML_REMOTE` with production URLs

PUBLIC_VIVA_* vars that get baked into the SvelteKit bundle at build time determine where the client connects at runtime. For production builds, these should point to production URLs.

### vite.config.mjs and paladin

The vite config imports paladin and awaits `paladin.ikiro` to get `paladin.variant.clients.html`. This provides server config (host, port, cors, allowedHosts). For `vite build`, the server config is irrelevant but paladin still needs to resolve — hence the env vars in the Dockerfile.

Resolve aliases map `@vivalence/*` package imports to filesystem paths relative to the monorepo root. This is how the client accesses subsystem code (typology, shared, dapper, drapes, vector) without npm publishing.

## Work Packages

### Testing Gaps
- No client tests exist

### Human Documentation Needs (Divio)
- **Tutorial**: "Run the client locally" — minimal until architecture stabilizes
- **How-to**: "Build and deploy the HTML client" — Dockerfile, env vars, circuitry (documented above)
- Defer deeper documentation — under heavy construction

### Active Work
- Mobile readiness
- ~~Serving built client (production)~~ DONE — adapter-static + serve.js + Docker
- Possible SvelteKit → Svelte migration
- Possible React migration (future)
- Session-first patterning

## Maintenance

This is the most volatile part of the system. Don't over-invest in documenting specific component APIs — they change constantly. Focus on: connection pattern, entity hydration flow, terminal/buffer lifecycle concepts.
