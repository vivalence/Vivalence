---
paths: ["systems/anima/**", "subsystems/dapper/**", "subsystems/drapes/**"]
---
<!-- writer: agent · limit: 6100 chars · code is the map · anima (browser) · dapper (tokens) · drapes (dom + tty) -->
# codemap: design — the surfaces

## anima `src` — ghost with a DOM surface (10-26)

- **`src/client.js` runs `ghost.app.lifecycle.execution` whole; `src/surfaces/chrome/<f>` twins `systems/ghost/surfaces/chrome/<f>` — shared folders, never shared code; shareable → a ghost library** (10-23 /"sharing a folder structure but not implementation."/). REJECTED 10-26 a second beat sequence (its bundle beat: `bytes: 0`). `logging` taps ABOVE the `try`: below it a TDZ throw lands untapped, page blank (10-27 /"client doesnt load"/).
- **keys live in the shown terminal's keyed `Show`, never the mount or window (10-26); ⌥ reads `event.code` (mac ⌥1 is ¡). iOS: ONE mounted input, never remounted·disabled·readonly, `preventDefault` on pointerdown, the keyboard moves only `visualViewport`** — /"make sure that the handling of keyboard and input focus is top notch."/
- **a view measures its OWN box in px, never the window; an effect keys on its REAL input, a store is read at use** (09-23 /"the frame function gets called. OMG. way to fucking agressive."/). A projection exists only under observation: `<Show when={open}>` IS the lifecycle, animation is CSS (/"things done in manual js that could be css?"/); a gesture in flight ends in ONE repl command.
- **no row model: a section is a hand-written widget** (REJECTED 10-21 /"No row model."/); one panel's widget lives IN it, two → `surfaces/chrome/widgets/`. A subscription keys on the id, no id → return early (09-21 /"not just load * when *."/); `grep -rn ':global('` before naming a class.
- **CSS: density scopes `[data-sec=X]`, never `.phone .srow`; a swapped control keeps its neighbor's ink · size** (11-06 /"overdone"/); a new class is grepped in `parts.css` first (11-08 /"stupid icon"/); a sidebar item ACTS: `signal` · `fn`, else `fn: none`.
- **hardware is owned ONCE by `systems/ghost/subjects/app/prototypes/box/device/`; a panel consumes `ambient.app.consume().box.device.microphone`** (05-08 /"BOX owns it. panel and dock consume box.device.microphone"/); a worklet loads by `new URL("./worklet.js", import.meta.url)`, vite `?url` fails under deno.
- **a cell view plays in the dock on the SAME buffer** (`panels/dock/journal.jsx:84`; REJECTED 10-20 a per-cell terminal copy); one view per place (10-16 /"One artifact per place."/).

## drapes — `.` Svelte · `./dom` Solid

- **dapper = theming; drapes = a kit per render target (`@vivalence/drapes/<target>`); target code lives in the clients** (10-12 /"out of the subsystems. all of it."/); medium = mime `application/vnd.viva.<target>.<framework>+javascript`, no app reused across targets; Solid replaces Svelte (10-10). **A part never sees client** (`grep -lw client subsystems/drapes/*.jsx` = 0): it reaches widgets via `ambient(key, schema)` (`systems/ghost/gestalten/ambient.js`, 10-23 /"ambient."/).
- **a library behind a drapes export, never our own** (04-02 /"rolling our own is shit."/); `solid-js` = `npm:solid-js@1.9.12/dist/solid.js` exact (bare = SERVER build).
- **`mod.js` (78 direct) re-exports 7 dirs + `*skins`, mostly `.svelte`; named: `SIGNAL·FILL·INK·GLYPH` · `strip.fit` · `float.place` · `parseBlocks`.**
```js
// subsystems/drapes/tests/kit.test.js:4
import { fit } from "../display/strip.js";
import { place } from "../panels/float.js";
```
- **`panels/Frame.svelte` IS the clients' frame contract: one bag, then `next.mount()` (`:71`; bundle-less `:52`); `teardown` unmounts (`:25`).** A view gets the TERMINAL, never which vector called it (10-12 /"we hand it the terminal."/); REJECTED a props bag · `nature` · `place`.
```svelte
// subsystems/drapes/panels/Frame.svelte:64
        component = module.default(target, {
          terminal,
          daemon: next.mode.daemon,
          mode: next.mode,
          thread: next.thread,
```
- **`editor/` is in no export (`index.js` direct=[]); `vim.js` DEAD; `languages·sync·org` tested.** A heavy part is a SUBPATH, never `mod.js`: the barrel compiles into every App (0.54 → 1.33 MB); a size is read at `prod: true` (`prod: false` = dev + inline map, ~3x, `typology/gestalten/bundle/svelte.js:55`).
```js
// subsystems/drapes/tests/editor.test.js:5
import { language, formats } from "../editor/languages.js";
import { diff, NONE, External, originated } from "../editor/sync.js";
```
- **`dom/`, 25 files (`dom·credentials·chord·keydowns·accept·sheet·watch`, `*panes`): importer: testament only; RED, `chassis.jsx:3` reads `belt.dock`, absent on ghost's `belt`.**
```js
// subsystems/drapes/tests/dom/keys.test.js:2
import { chord, keydowns } from "../../dom/keys.js";
import { document, fire, fresh, settle, surface } from "./rig.js";
```

## dapper

- **`lib/` `contrast·emit·design·theme·tokens`; `themes/` `THEMES` (datasette·northsea·parchment·porcelain); `lifecycle/` = `./postcss`, `belt/` = `./tailwind`.** `tokens.kebab · tokens.camel`: two flattenings over ONE fold, THROWS on an unknown theme · zone (10-21 /"the core structure is objects, and then we have two ways of flattening that"/).
```js
// subsystems/dapper/lib/tokens.js:146
export const tokens = { camel: flat(camel), kebab: flat(kebab) };
// subsystems/dapper/tests/emit.test.js:2
import { theme } from "../lib/theme.js";
import { declarations, emit } from "../lib/emit.js";
```
- **the token space IS the contract (m72): `theme(definition)` → static `Theme`; ZONES `0–3` (chrome·body·island·bench), depth inside (`--shape-sunk·-lift`); STEPS `2xs…3xl`; theme = bridge `viva.bridge.theme` → client mask → user `THEMED`** (09-28 /"sunk and lift."/; 11-06 REVERSED 10-19: a setting persists as `persistentAtom("viva.<subject>.<field>")`, drapes `context/preferences.js` = `viva.mode.<slug>`; `vault:<origin>` stays secrets). Emit = `:root[data-theme=X]` + `[data-zone="N"]` (`emit.js:65`): grep the EMITTED `design().output.css`, never source; every ink/ground pair passes on EVERY theme (4.5 · 3).
