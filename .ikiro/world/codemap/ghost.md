---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · limit: 5600 chars · code is the map · @vivalence/ghost = typology.js, paladin-free (deno info typology.js | grep -c paladin → 0); m91: subjects/shell pulls chrome/ in (opentui ×12 · solid-js ×6) -->
# codemap: ghost — `run.js` · the client · the chrome (10-27)

- **paladin mounts at `run.js` only**; `subjects/shell/lifecycle/` (11-04) `index.js` `execution` · `1-population.js` `seat` · `2-resolution.js` `runtime` (reach or `ledger.boot(instance.specs("runtime"))`) · `3-integration.js` `ledger · commanding` (prints an outline · `call` · `hold`, JSON on `--json`); `commands/` `help.js` `usage(shellDie, vector)` · `chrome.js` · `tail.js` · `index.js` `/help` + `paladin.commands` (m110); NO env · mask · spawn in the shell (cwd recipe = paladin's instance scope); bare `viva` RELAYS → `commands/chrome.js` → `subjects/client/factory.js` → `new App`. No `viva repl` · `/chrome/on|off` (m98 Q6 · Q7); REJECTED 10-25 app as a client beat /"why is app a lifecycle on client?"/
- **a CLI verb is flat**: noun · verb · positionals (/"these are too deep."/); a flag names its field (`--slug` /"as is not flag"/); `Argv` body ALWAYS an array /"just an array. period."/; help · doctors · record ops also ride the repl; up·down·start·stop·install stay shell (10-13).
- **ghost OWNS client structure**, anima imports it /"they write their own Chrome over shared tooling."/ 10-05; Deno beats at ghost's door, tty in `surfaces/` /"out of the subsystems. all of it."/
- **one `Repl` per terminal; `repl.commands` · `legend.keymap` are GETTERS** (`subjects/terminal/repl.js:23` · `legend.js:38`): ONE vector: client · app · client modes · terminal · attached mode, later wins; `fromRepl` first, `catalog` rows carry `valence`. `terminal.repl.dispatch(line)` the ONLY entry; `ctx.output` marked on `terminal.controller` (`:8`). `belt.completions.listed` (palette rows | a chooser's words) bounds `/repl/next`; anima reads `bridge.selected`. Bridge persists `$terminal` · `$theme` as `persistentAtom("viva.bridge.<field>")` (11-06). REJECTED 10-24 a `commands` beat · `/mode/<type>/<slug>` /"we attach them in order … one vector."/
- **a miss is a verb**: traverse falls to the nearest `*`; a word walks only if the input takes the rest (`quit smoking` ≠ `/quit`); `/mode` · `/thread` never guess, >1 left IS the answer. REJECTED 10-13 precomputed argv /"Our signal here is shit."/
- **legend**: `dispatch` only enqueues; `$backlog` walks a PRESS (/"chord is not the right unit"/): effect → `flush`+run · dead end → `flush` · prefix → `$chord` /"lock. rename abort to flush."/; a mode's keymap plainly grafts (REJECTED 10-21 `MOUNTS` /"Nah, fuck that"/).
- **ONE aperture per client** (`subjects/client/prototype.js:3`): `/terminal/:terminal` resolves in a `.use` or `NotFound` /"resolve the terminal on the request in the middleware"/ 10-16.
- **the factory MINTS the runtime** (10-27): `connected` wires ONE multiplex (/"we multiplex on runtime"/) · the two manifest calls · `new Dataspace` (`file` rows /"download them all up front"/) before `execution`: `client.runtime` is a plain field, never `null`. REJECTED: `client.$runtime` atom — a once-set store is a suspension; `$entities` on `Runtime`. Nobody awaits the client; the app mounts after it, sign-in gates at `authorized`; past the lighthouse a beat marks, never throws; another user's sign-in DROPS every cached row, re-subscribes /"clients arent per user"/.
```js
// systems/ghost/subjects/client/factory.js
  (clientDie) => Object.assign(clientDie, { runtime: new Runtime({ remote, lighthouse }) }),
  connected,
  ...shape.monad.ready(execution),
```
- **ONE deno per `viva`** (11-04; `piped` · `ROLES` · `stderrTerminal` cut): `ghost.sh` execs `deno run -q`, Deno silent on stderr; `run.js` = mint · `paladin.control` (signals, `paladin/gestalten/belt/control.js`) · execute · `fromm.controller(...).exit`; runtime's same, exit `STOPPED ? 0 : 1` (`runtime/tests/runtime/hello.test.js:184`).
```js
// systems/ghost/run.js
const die = {
  controller: paladin.control(new Controller({ stdout: new Span("ghost") })),
  signal: new Argv(Deno.args),
};
```
- **tests** (one file, root, `HOME=$(mktemp -d)`; `deno.jsonc` `test` is `--watch`): `look` (design cell oracle, `scenarios/look.js`) · `chrome` (a real opentui frame) · `looping` (real `Socket` over `Deno.serve`) · `commands` · `repl` · `keymap` · `client` (`scenarios/hello.js`).
- **`Vector.branch` RETURNS the child** — `.branch(a, repl).branch(b, repl)` grafts `repl` into itself (stack overflow 10-16); two calls.
- **the daemon knows threads, the client terminals** /"terminal is a function of thread."/: entities on `client.runtime.entities.terminal`, shown = `app.bridge.$terminal`; `terminal.setThread` (`seat` ✗) · `setBuffer`: the framed buffer is `Terminal.buffer`, saved (11-11 /"Terminal owns the cursor"/; `Thread.cursor` ✗, `counter` mints the label); `/terminal/close` keeps the thread; `home.js:6` seats from HOME.
- **chrome**: the CLIENT owns its `accept` /"How the fuck should the runtime … decide what a client can accept?"/; the frame is SURFACE, never the buffer; `DOCKED` field-wise terminal > user > client > `DEFAULT_DOCK`.
- **an env check is `paladin.is.*`** (role · mode · runtime getters, `subsystems/paladin/gestalten/belt/is.js:5`); a new one is a getter there. REJECTED 10-23 m102: inline `"Deno" in globalThis && Deno.stdin.isTerminal()` — /"there is tooling for this in paladin."/ Not in `gestalten/` → the chrome's `RUNS` (REJECTED 10-27 /"gestalten dont import"/).
