<!-- writer: agent · reference, uncapped · written 2026-11-16 · entry point of the inspector-rework briefing for a design agent -->
# inspector rework — a design briefing

Input for a design agent reworking the telemetry window: its INSPECTOR tab and the LOGGER beside it. Three census agents (opus, 11-16) each wrote one section against the live tree (`jj` change `stlnwvmt`). Every claim cites `file:line`; describes what IS, proposes nothing.

| § | file | chars | answers |
|---|---|---|---|
| 1 | `1-entities.md` | 102044 | every object the panel reads, captured LIVE in true form · relations · traits |
| 2 | `2-client.md` | 41893 | the client: boot · wire · subjects + stores · dispatch · surface · where telemetry sits |
| 3 | `3-inspector-logger.md` | 70281 | logger + inspector as implemented: sources · writes · folds · props · DOM · CSS · gaps |
| — | `entities.probe.js` · `form.probe.js` | — | the probe behind §1; boots a ghost test world on a FREE port |

Read order: §2 §0 (the tree) → §3 §1–2 (state · records) → §3 §3–4 (logger · inspector) → §1 per entity, on demand.

## the panel in one view

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:366
const TABS = { logger: Logger, inspector: Inspector };
```

```js
// systems/ghost/subjects/app/prototypes/telemetry.js:4
$state = persistentAtom(
  "viva.telemetry.state",
  { open: false, view: "logger", filter: "all", selection: null, since: 0, window: { … } },
```

```js
// systems/ghost/subjects/app/prototypes/telemetry.js:20
get $logger() {
  return this.app.client.controller.stdout.$history;
}
```

- logger = `story` fold over span records (`telemetry.jsx:31`) + activities (`telemetry.jsx:65`) → `parts.Logger` (`subsystems/drapes/Logger.jsx:128`).
- inspector = `inspect` hand-written tables (`telemetry.jsx:153`) + `trees.modes` · `trees.harnesses` (`trees.js`) → `parts.Inspector` (`subsystems/drapes/Inspector.jsx:131`).
- window = `parts.Tele` (`subsystems/drapes/Tele.jsx`); tty twin is a stub swatch.

## defects — verified by the orchestrator on the tree

| # | code | what breaks |
|---|---|---|
| 1 | `telemetry.jsx:39-40` | span whose parent sent no record → filed as a ROOT  · FIXED 11-16 `spans.js` `arrange` |
| 2 | `telemetry.jsx:72` × `systems/ghost/entities/activity/prototype.js:19` | `activity.error` setter-only → read `undefined` → logger never shows an activity fault  · FIXED 11-16 getter |
| 3 | `systems/ghost/gestalten/commands/content/activity.js:23` | per-activity `/stop` acts on `ctx.terminal.thread.activities` → wrong thread's activities |
| 4 | `subsystems/typology/prototypes/connection.js:66` × `subsystems/typology/gestalten/shard/track.js:28` | ctx carries no `span` → no `request`/`response` record → logger `net` filter empty |

Further gaps (agent-reported, not re-verified): §3 §10 (17 entries) · §1 §17 · §2 tail. Notable: `seen()` unmemoized, the fold reruns ×3 per state write (`telemetry.jsx:264`); tables rebuilt per new record, a half-typed `thread.label` lost (`telemetry.jsx:292`); `/set` ranges vs inspector options disagree; `Mode.toJSON` circular; most gestures `patch` state directly instead of dispatching a repl signal (`telemetry.jsx:259`); `systems/anima/src/surfaces/chrome/send.js` zero importers.

## landed 11-16

The anima face of the comp: `comp/panes.md` (spec · dropped · owed) · `model.probe.js` (live world).

## tests

| suite | state |
|---|---|
| `systems/anima/tests/trees.test.js` | green |
| `subsystems/drapes/tests/parts/tele.test.js` | green |
| `systems/anima/tests/tele.test.js` | aborts at load: `world.js:10` bundles the deleted `src/surface/` |

## codemap drift found (owed to `fold`)

- `world/codemap/design.md`: "a part reaches widgets via `ambient(key, schema)`" — `grep ambient subsystems/drapes/*.jsx` = 0; parts are props-only.
- `world/codemap/design.md`: cell view `panels/dock/journal.jsx:84` → `panels/frame/view.jsx:33`; `cover.jsx:54` → `:55`.
- `world/codemap/ghost.md`: `repl.js:23` `commands` → `:34`; persisted keys omit `viva.telemetry.state`.
- `client-design-briefing.md` (10-16): anima as SvelteKit — now Solid on vite 8.
