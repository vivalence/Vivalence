---
paths: ["systems/anima/**", "subsystems/dapper/**", "subsystems/drapes/**"]
---
<!-- writer: agent · limit: 6800 chars · code is the map -->
# codemap: design — the surfaces

## anima `src` — ghost with a DOM surface (10-26)

- **`src/client.js` runs `ghost.app.lifecycle.execution` whole; `src/skins/chrome/<f>` twins `systems/ghost/skins/chrome/<f>` — shared folders, never shared code; shareable → a ghost library** (10-23 /"sharing a folder structure but not implementation."/). REJECTED 10-26 a second beat sequence. 11-20: anima mounts FIRST over `ghost.client.minted`, then `reported · reach · connect` (`client.js`); `runtime.entities === null` = `Booting` (`cover.jsx`). `logging` taps ABOVE the `try`: below it a TDZ throw lands untapped, page blank (10-27 /"client doesnt load"/).
- **keys live in the shown terminal's keyed `Show`, never the mount or window (10-26); ⌥ reads `event.code` (mac ⌥1 is ¡). iOS: ONE mounted input, never remounted·disabled·readonly, `preventDefault` on pointerdown, the keyboard moves only `visualViewport`; bottom pad `--bar-inset`** — /"make sure that the handling of keyboard and input focus is top notch."/
- **a view measures its OWN box in px, never the window; an effect · a memo keys on its REAL input: the store its WRITER flips, grepped on the real path (11-18 `/dictate` · host `$status`); a store is read at use** (09-23 /"the frame function gets called. OMG. way to fucking agressive."/). A projection exists only under observation: `<Show when={open}>` IS the lifecycle, animation is CSS (/"things done in manual js that could be css?"/); a gesture in flight ends in ONE repl command.
- **no row model: a section is a hand-written widget** (REJECTED 10-21 /"No row model."/); one panel's widget lives IN it, two → `skins/chrome/widgets/`. A subscription keys on the id, no id → return early (09-21 /"not just load * when *."/); `grep -rn ':global('` before naming a class.
- **CSS: density scopes `[data-sec=X]`, never `.phone .srow`; a new · swapped control keeps its neighbor's KIND · ink · size** (11-06 /"overdone"/ · 11-18 /"incoherent"/); a raw payload (fault · json) folds closed behind one summary line (11-18 /"too much detail by default"/); a new class · an override is grepped in `parts.css` first, it restates late (11-08 /"stupid icon"/ · 11-13 `:536`); a sidebar item ACTS: `signal` · `fn`, else `fn: none`; a control LOOKS its kind, drills OR folds; a count names its unit (11-16); a NEW part is SEEN on a DOM before it lands: the drapes rig proves markup, never layout, and a pick I call weak is drawn right first (11-21 a card as wide as its caption · a boxed control inside it · two borrowed icons, /"how does this make sense??"/).
- **sizes are rem, the ROOT size is the scale** (11-13): `parts.css` keeps px only for rings · radii · hairlines; `Icon` · `Viket` size inline rem; root = `FONTS[bridge.font]` (`cover.jsx:55`), `/font/set`. No scheme, no `dark` (/"we have themes."/).
- **hardware is owned ONCE by `systems/ghost/subjects/app/prototypes/box/device/`; a panel consumes `ambient.app.consume().box.device.microphone`** (05-08 /"BOX owns it. panel and dock consume box.device.microphone"/); a worklet loads by `new URL("./worklet.js", import.meta.url)`, vite `?url` fails under deno.
- **a cell view plays in the dock on the SAME buffer** (`panels/frame/view.jsx:33`; REJECTED 10-20 a per-cell terminal copy); one view per place (10-16 /"One artifact per place."/).

## drapes — `./svelte` · `./solid`, no root

- **dapper = theming; drapes = DOM, a framework a subpath; sheets = TTY; target code lives in the clients** (10-12 /"out of the subsystems. all of it."/); medium = mime `application/vnd.viva.<target>.<framework>+javascript`, no app reused across targets; Solid replaces Svelte (10-10). **A part never sees client** (`grep -lw client subsystems/drapes/*.jsx` = 0): it reaches widgets via `ambient(key, schema)` (`systems/ghost/gestalten/ambient.js`, 10-23 /"ambient."/).
- **a library behind a drapes export, never our own** (04-02 /"rolling our own is shit."/); `solid-js` = `npm:solid-js@1.9.12/dist/solid.js` exact (bare = SERVER build).
- **`svelte/` (51 `.svelte` outside `bak/`) re-exports 6 dirs, no namespace (11-21 `skins/` · `triage/` cut, zero readers); named: `SIGNAL·FILL·INK·GLYPH` · `strip.fit` · `float.place` · `parseBlocks`.**
- **`panels/Frame.svelte` IS the clients' frame contract: one bag, then `next.mount()` (`:71`; bundle-less `:52`); `teardown` unmounts (`:25`).** A view gets the TERMINAL, never which vector called it (10-12 /"we hand it the terminal."/); REJECTED a props bag · `nature` · `place`.
```svelte
// subsystems/drapes/svelte/panels/Frame.svelte:64
        component = module.default(target, {
          terminal,
          daemon: next.mode.daemon,
          mode: next.mode,
          thread: next.thread,
```
- **`svelte/editor/` is in no export; `vim.js` DEAD.** The Svelte barrel = ONE member; sizes read at `prod: true` (dev ~3x).
- **a DOM view imports `MEMBERS` (paladin `bundle.js:52`), no alias; anima's `viva:members` builds + maps. A `vite.config.mjs` edit needs HIS restart.**

## dapper

- **`lib/` `contrast·emit·design·theme·tokens`; `themes/` `THEMES` (datasette·northsea·parchment·porcelain); `lifecycle/` = `./postcss`; `parts/` = both kits' models; tailwind CUT.** `tokens.kebab · tokens.camel`: two flattenings over ONE fold, THROWS on an unknown theme · zone (10-21 /"the core structure is objects, and then we have two ways of flattening that"/).
```js
// subsystems/dapper/lib/tokens.js:146
export const tokens = { camel: flat(camel), kebab: flat(kebab) };
// subsystems/dapper/tests/emit.test.js:2
import { theme } from "../lib/theme.js";
import { declarations, emit } from "../lib/emit.js";
```
- **the token space IS the contract (m72): `theme(definition)` → static `Theme`; ZONES `0–3` (chrome·body·island·bench), depth inside (`--shape-sunk·-lift`); STEPS `2xs…3xl`; theme = bridge `viva.bridge.theme` → client mask → user `THEMED`** (09-28 /"sunk and lift."/; 11-06 REVERSED 10-19: a setting persists as `persistentAtom("viva.<subject>.<field>")`, drapes `context/preferences.js` = `viva.mode.<slug>`; `vault:<origin>` stays secrets). Emit = `:root[data-theme=X]` + `[data-zone="N"]` (`emit.js:65`): grep the EMITTED `design().output.css`, never source; every ink/ground pair passes on EVERY theme (4.5 · 3).
- a fade = 2 states, a class + `transition`, overlaid; never scroll-linked · cut · dimmed in its box (REJECTED 11-13 ×3 /"i fucking want my fade!"/).
- `composer` ✗ → `dock.input` (11-16).
