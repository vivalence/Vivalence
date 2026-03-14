# HTML Client

> Browser interface. Connects to daemon, renders modes, manages terminal/buffer lifecycle.

## Role

Surface. Under heavy construction. A SvelteKit app that connects to the runtime daemon via Connection, hydrates entities, and renders mode views in a terminal/buffer pattern. Most logic lives server-side — the client is thin, focused on connection, state management, and view rendering.

## Stack

- SvelteKit with adapter-auto
- Vite build
- Tailwind CSS + PostCSS
- nanostores for reactive state

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

## Work Packages

### Testing Gaps
- No client tests exist

### Human Documentation Needs (Divio)
- **Tutorial**: "Run the client locally" — minimal until architecture stabilizes
- Defer deeper documentation — under heavy construction

### Active Work
- Mobile readiness
- Serving built client (production)
- Possible SvelteKit → Svelte migration
- Possible React migration (future)
- Session-first patterning

## Maintenance

This is the most volatile part of the system. Don't over-invest in documenting specific component APIs — they change constantly. Focus on: connection pattern, entity hydration flow, terminal/buffer lifecycle concepts.
