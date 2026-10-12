---
paths: ["systems/anima/**", "subsystems/dapper/**", "subsystems/drapes/**", "subsystems/sheets/**"]
---
<!-- writer: agent · limit: 1950 chars · traps only · anima (browser client) · dapper (tokens) · drapes (dom + tty) · sheets (opentui host) -->
# codemap: design — the surfaces

- **anima IS `construct(mask, dom(document.body, …))`** (`src/client.js`); the lifecycle is ghost's, the panes drapes' — never a new file in anima. The mask is BAKED at build (`vite.config.mjs` → `define: { __VIVA_CLIENT__ }`), paladin in the config only. `vite.config.mjs` resolves NODE-style past `import_map.json`. ROLLED BACK 10-12: the SvelteKit client sits in `bak/`.
- **dapper is ONE build-time pipe**: themes `northsea · parchment · porcelain · datasette`, no polarity; `tokens(theme, zone)` THROWS on another name. A hex literal or zone number in a view is a DEFECT. `vite dev` holds dapper IN MEMORY: prove a sheet on `anima/bundle`.
- **a surface is a BAG the client die reads**: `tty(renderer, { credentials, trajectory, theme })` · `dom(root, { credentials, theme })`, five panes over ghost's bare `Client`; the oracle for a dom pane is ghost's tty panes. Chassis: `full` hides the FRAME, `collapsed` the dock. The frame negotiates `mime.dom.*` through `bundle.load(accept)`.
- **tty = Solid 1.9.12 on opentui 0.5.17** through `subsystems/sheets/host/` (`sh subsystems/sheets/host/install.sh` after every `deno install`); views are BUNDLED (`deno run -A subsystems/drapes/tty/bundle.js`, gitignored); `/tty/plain` · `/tty/credentials` need none. Ink is dead.
- a drapes class name is reachable by any unscoped consumer rule — never a generic name. A buffer row IS the screen: selection · cursor · draft → `buffer.data`, never wiped on mount.
- prove on headless renderers (`tests/tty/` · `tests/dom/`); a browser session = one `localStorage` row of the `Credential` shape keyed by runtime ORIGIN. Flaky connects → count sockets (6 per host:port).
