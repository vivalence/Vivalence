---
paths: ["systems/runtime/**"]
---
<!-- writer: agent · derived-from: systems/runtime + corpus read · verified: session c795a2f7 · limit: 30 lines -->
# codemap: runtime — process (Die/Wafer cascade; HTTP via shape.http + Deno.serve)

- **boot**: `run.js` → `paladin.variant.mount()` → `new Die` → populate (registry mounts + daemons + aperture) → resolve (per-child full lifecycle) → integrate (announce to lighthouse) → perpetuate (signals + patrol).
- **mode traits** (`daemon/traits/`): APPLICATION (mode exports `app` App descriptor; standalone esbuild per buffer-view, importmap in `traits/application.js`, bundle CACHED — restart to re-bundle; BUFFERED/VIEWABLE both dead) · DATASET (upsert ×100) · INTENTED · EMITTER (mount `/emit`; inject daemon/mode/seek/blacklist) · HARNESSED (was CHAOSMONKEY: harness + cortex + dialogue + scribe) · CONVERSATIONAL (ws session; audio when VOCALIZED) · TOOLED (`shape.agentic` → {tools, llmstxt}) · FRAUGHT (freight).
- **aperture**: `/entities/*` (repository + reactive SSE) · `/userspace/*` · `/modes/:type/:method` · `/metadata/*` (mode self-description) · `/daemon/<slug>/…`.
- **gotchas**: `--watch` test tasks never exit · `:2501 /` 404 ≠ down · `thread/create` hang = buffer-bundle esbuild error (read the runtime log) · circuitry from `testament/` (dev) or image mounts (prod).
- interaction modes cheap→heavy: scenario (`tests/scenarios/`, in-memory) → aperture test (real :2501) → run+log → kajuit+chrome ([[rituals]] live-validation).
