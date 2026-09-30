# m73 — builder brief, patch 5: rail C

Read `briefs/common.md` (same directory) FIRST and whole. Your sandbox is `w5`:

SANDBOX = /private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/9c4d5944-788f-4d91-9f23-f9164b5bdd9f/scratchpad/m73/tree/w5

## What you build

Quest lines 2462–2675 (`** patch 5 — anima: rail C`), whole: blast · the tree (`panes.js`) · `c.svelte` · `Pane.svelte` · the strip · the six panes · tests · gate. Analysis: M/stage.md §`c.svelte` onward (panes.js · d.svelte · e.svelte · f.svelte); corrections: M/pass/patch456.md.

In one paragraph: rail C stops being a weighted stack of three and becomes ONE tree of six panes (`terminal · navigation · thread · mode · buffer · harness`) drawn in four folds (`page · stack · accordion · free`), picked from a `Strip`; panels D · E · F are redistributed into the panes and repainted with the kit; the algebra is pure and already written and tested.

## Start from what exists

- M/sandbox2/panes.js — the new algebra, FINISHED (110 lines): `PANE_BAR PANE_HEAD PANE_MIN PANE_NAMES FOLDS RATIO_MIN RATIO_MAX leaves remove open swap insert move setRatio solo zone layout arrange available prune DEFAULT restore`. Copy it to `systems/anima/src/typology/stores/bridge/panes.js`, replacing the live file. Do not redesign it; if the component needs something it lacks, add a pure function and a test.
- M/sandbox2/run.js — 53 checks over it and over the strip and the float. Port the ones that concern `panes.js` into `systems/anima/tests/panes/tree.test.js` in the form of the repo's tests (`specimen.describe` / `specimen.it` / `specimen.expect`, see `tests/bridge.view.test.js`), and end with "the source is not mutated".
- The quest's tangle of `panes.js` (lines 2486–2600) and its witnesses are the same code.

## Your file set — touch these, nothing else

- `systems/anima/src/typology/stores/bridge/panes.js` (replaced) · `bridge.js` — ONE region, the `this.panes = store(…)` block, which becomes `this.panes = store(restore(saved?.panes), ["tree", "fold", "expanded", "heights"]);` plus the import of `restore` · `index.js` — the line `export * from "./panes.js"` becomes `export * as panes from "./panes.js"`
- `systems/anima/src/app/panels/c/c.svelte` · `widgets/Pane.svelte` (rewritten) · `widgets/Twig.svelte` (deleted) · NEW `panes/{Terminals,Mode,Buffer,Harness}.svelte`
- `systems/anima/src/app/panels/d/**` (navigation pane; `navigation.js` has no importer and goes), `panels/e/**` (thread pane: traits and editors), `panels/f/**` (thread pane: cursor, buffers, activity; `ActivityRow` on `ToolRow` + `Key hold={700}`)
- tests: NEW `tests/panes/tree.test.js`; `tests/pincer/panes.test.js` deleted; `tests/zones/places.test.js` (the map rows of `c.svelte` and `f.svelte`, the chrome step restated — quest lines 2469, 2475); `tests/activity.widgets.test.js` (its `MOUNTED` list: `f.svelte` leaves, the thread pane enters); `tests/activity.mount.test.js` (its rig follows `ActivityRow`'s new markup; the two steps keep what they prove: a 700 ms hold fires `SIGKILL`, a release at 600 ms fires nothing)

How you lay D · E · F into the panes is yours: either the files stay where they are and become the pane bodies (`d.svelte` = navigation, `e.svelte` + `f.svelte` = thread), or they move under `panels/c/panes/`. Choose the one with FEWER moved lines, keep every kept range of logic intact, and say which you chose. `f.svelte` leaves the zones map as a file only if it truly dies.

## Not yours — do not touch

- `src/app/bones/**`, `src/app/panels/{a,b,g,h}/**`, `src/client.css`, `src/app/+layout.svelte`, `src/app/+page.svelte`, `src/app/widgets/**`, `src/typology/entities/**`, `src/app/terminals.js`.
- `bridge.js` outside the panes block: the `view` store already has `fold` · `strip` for the rails' strips (`view.strip` places rail C's strip too; rail C's FOLD is `panes.fold`, not `view.fold` — `view.fold` is rail B's).
- `geometry.js` · `gesture.js` · `bridge/dock.js` — the pincer's keep-list. Byte-identical, no exceptions. `tests/pincer/{bones.axis,dock.geometry,viewport,theme}.test.js` stay green and untouched.
- `src/app/widgets/ActivityTracker.svelte` — `ActivityRow` stops importing it (`Status` with `TONES[code]` takes its place); the FILE stays, the integrator deletes it.
- `panels/a/widgets/Dock.svelte` — the console rail's content (session calls · turn manifest · meter · tools seen) becomes the harness pane, read through `turns.js` (`enrich` · `exchanges` · `callRoster` · `manifest` · `sessionUsage` · `contextSize` · `turnCensus` · `tokens`); you READ the dock's markup `:776-837` to see what it shows, you do not edit the dock.
- The global `section .row` / `section .act` rules in `panels/b/widgets/Section.svelte:54-119`: your rewritten panes must not lean on them. They are deleted at integration. After your build: `grep -rn 'class="row\|class="act\|class="k"\|class="v"' SANDBOX/systems/anima/src/app/panels/{c,d,e,f}` → nothing.

## Things the pass already found

- `Pane.svelte` and `d.svelte` · `e.svelte` declare NO zone today; `c.svelte` carries `data-zone="0"` once. After your patch the thread pane's chat-facing body is zone 1 inside the rail: its literal `data-zone="1"` sits in `c.svelte`, the map row becomes `["0", "1"]`.
- A saved `bridge.panes` in every browser is `{ open, fold, weight }`, three arrays: `restore()` takes a save only when it holds a tree of known panes and a known fold — else the default. `tests/pincer/theme.test.js` and `tests/pincer/viewport.test.js` call `new Bridge()`, which now runs `restore()`.
- Pointer capture for a pane drag is taken on the grip (`event.currentTarget.setPointerCapture`), the panel holds the listeners — as live does today (`c.svelte:63,204,262-264`).
- A client buffer holds no wire and `Frame` keeps its standing private: the buffer pane shows identity · hooks · data, the comp's lifecycle bars and wires are MARKED as having no source (a line of `--text-light` text saying so), never invented.
- The mode pane reads `mode.metadata` and `mode.application.view`; bundle path and integrity hash have no source on the client — marked.
- Pane heads are 28px, `PANE_BAR` (44px) under a coarse pointer (`@media (pointer: coarse)`).
- Dead with the old stack, by the quest's word: fold-by-drag, max, equalise, the hint line, the twig, dock-out, pull-a-tab-to-open.

## Gates

`$T/suites2.sh w5 anima=systems/anima/tests/ drapes=subsystems/drapes/tests/` green; the compile check clean over every `.svelte` you wrote or changed; the bundle exits 0; the greps above empty; `grep -rn "normalisePanes\|layoutPanes\|PANE_FOLD_ZONE\|PANE_DOCK_PULL\|fitPaneRun\|pushPanes\|settlePanes" SANDBOX/systems/anima/src SANDBOX/systems/anima/tests` → nothing outside `bak`.
