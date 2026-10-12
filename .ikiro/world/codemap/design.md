---
paths: ["systems/anima/**", "subsystems/dapper/**", "subsystems/drapes/**"]
---
<!-- writer: agent · limit: 6100 chars · code is the map · anima (browser) · dapper (tokens) · drapes (dom + tty) -->
# codemap: design — the surfaces

## anima `src` — subject-first (m91, 10-19)

- **`client.js` (`LIGHTHOUSE·BRIDGE·TERMINALS·BOX·build`) · `telemetry/` (`*logger·*inspector`) · `typology.js` read direct=0 — vite aliases `$client` (27) · `$telemetry` (20) · `@vivalence/anima` (31), `vite.config.mjs:123`; paladin mounts at `:12`.** RED: the gone `View`, read by `entities/buffer.js:2` and `entities/mode/traits/application.js:1` (build stops; known-issues `anima-imports-view-from-typology`).
- **subjects in `entities/`: `daemon/` (`Daemon · DaemonDossier`) · `mode/` (`Mode` · `ModeDossier` · `traits/` `APPLICATION·GENERATIVE·EMITTER·EXPOSED·HARNESSED·standalone.open`) · `thread/` (`Thread · ThreadDossier` · `traits/` `aimed·queueing·labeled`; `masked.js` DEAD, `thread/dossier.js:39` writes the string) · `terminal/` (`Terminal·mountSeat·mountStall·TerminalDossier` + `terminals.js` `Terminals`); root: `lighthouse.js` (`STANDINGS·Lighthouse·boot`) · `bridge/` (`prototype·dock·geometry·gesture·panes·start`) · `box/` (`Box`; `device/{microphone,speaker}` + `worklet.js?url`; `drivers/audio`).**
```js
// systems/anima/tests/panes/cards.mount.test.js:5
import { Terminals } from "../../src/entities/terminal/terminals.js";
import { Bridge } from "../../src/bridge/prototype.js";
// systems/anima/tests/panes/cards.mount.test.js:9
import { Thread } from "../../src/entities/thread/prototype.js";
import { Mode } from "../../src/entities/mode/prototype.js";
import { Buffer } from "../../src/entities/buffer.js";
```
- **`entities/`: `activity·buffer·intent·literal·symbol·turn` (`X·XDossier`); `index.js` re-exports the subjects. `prototypes/`: `Entity` (11 direct) · `Cargo` · `Dataspace` · `conversation` · `dictation`; `index.js` omits `Dataspace`.**
```js
// systems/anima/tests/lifecycle-vector.test.js:2
import { Entity } from "../src/prototypes/entity.js";
import { Mode } from "../src/entities/mode/prototype.js";
import { Dataspace } from "../src/prototypes/dataspace.js";
```
- **`gestalten/` (`belt/`): `narrow` (no app importer) · `runner` (`applyTraits`) · `chain`.** `typology.js` keeps every flat name (33 imports) and adds `stores` · `traits`.
```js
// systems/anima/src/typology.js:14
export const stores = { lighthouse, terminals, bridge, box };
export const traits = { mode: ModeTraits, thread: ThreadTraits };
```
- **`app/`: 71 files, tested `gate·activity·audit·sheet·dictate·turns`; `bones/widgets/*.bak.svelte` ×2 DEAD.** It becomes anima's `surface/` the day it moves.
```js
// systems/anima/tests/gate.test.js:2
import { gateFor } from "../src/app/gate.js";
import { STANDINGS } from "../src/lighthouse.js";
```

## drapes — `.` Svelte · `./dom` Solid

- **`mod.js` (78 direct) re-exports 7 dirs + `*skins`, mostly `.svelte`; named: `SIGNAL·FILL·INK·GLYPH` · `strip.fit` · `float.place` · `parseBlocks`.** `decor/bak.text.svelte` DEAD.
```js
// subsystems/drapes/tests/kit.test.js:4
import { fit } from "../display/strip.js";
import { place } from "../panels/float.js";
```
- **`panels/Frame.svelte` IS the clients' frame contract: one bag, then `next.mount()` (`:71`; bundle-less `:52`); `teardown` unmounts (`:25`).**
```svelte
// subsystems/drapes/panels/Frame.svelte:64
        component = module.default(target, {
          terminal,
          daemon: next.mode.daemon,
          mode: next.mode,
          thread: next.thread,
```
- **`editor/` is in no export (`index.js` direct=[]); `vim.js` DEAD; `languages·sync·org` tested.**
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

- **`lib/` `contrast·emit·design·theme·tokens`; `themes/` `THEMES` (datasette·northsea·parchment·porcelain); `lifecycle/` = `./postcss`, `belt/` = `./tailwind`.** `tokens(theme, zone)` THROWS.
```js
// subsystems/dapper/lib/tokens.js:133
export const tokens = (theme, zone) => {
  if (!Object.hasOwn(THEMES, theme)) throw new Error(`[tokens] not a theme: ${JSON.stringify(theme)} · ${Object.keys(THEMES).join(" · ")}`);
// subsystems/dapper/tests/emit.test.js:2
import { theme } from "../lib/theme.js";
import { declarations, emit } from "../lib/emit.js";
```

```jsonc
// anima src — census 10-19 (files · exports · files a test uses)
{ ".": [3, 23, 2], "telemetry": [3, 9, 0], "app/.": [5, 3, 1], "app/bones": [13, 12, 1], "app/design": [4, 13, 2], "app/panels": [43, 57, 2], "app/widgets": [6, 11, 0],
  "box": [11, 9, 0], "bridge": [7, 102, 6], "daemon": [3, 4, 0], "mode": [9, 16, 2], "terminal": [3, 7, 2], "thread": [8, 13, 1],
  "entities": [7, 26, 3], "gestalten": [5, 17, 2], "prototypes": [6, 9, 4] }
```
```jsonc
// drapes · dapper — census 10-16
{
"drapes/context":{"files":3,"exports":7,"tests":1},
"drapes/controls":{"files":14,"exports":3,"tests":0},
"drapes/decor":{"files":7,"exports":1,"tests":0},
"drapes/display":{"files":31,"exports":13,"tests":2},
"drapes/dom":{"files":25,"exports":80,"tests":2},
"drapes/editor":{"files":7,"exports":15,"tests":3},
"drapes/.":{"files":1,"exports":8,"tests":0},
"drapes/panels":{"files":10,"exports":6,"tests":1},
"drapes/skins":{"files":9,"exports":8,"tests":0},
"drapes/stage":{"files":3,"exports":2,"tests":0},
"drapes/triage":{"files":4,"exports":0,"tests":0},
"dapper/belt":{"files":1,"exports":2,"tests":1},
"dapper/lib":{"files":5,"exports":18,"tests":5},
"dapper/lifecycle":{"files":1,"exports":1,"tests":0},
"dapper/.":{"files":1,"exports":8,"tests":0},
"dapper/themes":{"files":7,"exports":17,"tests":3}
}
```
