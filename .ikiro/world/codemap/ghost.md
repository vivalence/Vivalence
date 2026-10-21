---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · limit: 5600 chars · code is the map · @vivalence/ghost = typology.js, paladin-free (deno info typology.js | grep -c paladin → 0); m91: subjects/shell pulls chrome/ in (opentui ×12 · solid-js ×6) -->
# codemap: ghost — `run.js` · the client · the chrome (10-27)

- **paladin mounts at `run.js` only**; `subjects/shell/lifecycle.js` `shell`: `viva help·chrome·instance/tail` + `paladin.commands` (m110; `lifecycle/commanding.js` prints · `call` · `hold`), bare `viva` = chrome → `subjects/shell/commands/chrome.js` `seat · ledger · boot` + `subjects/client/factory.js` (kleisli: `new Client` → `new Runtime` → `connected` → `execution`). No `viva repl`, no `/chrome/on|off` (m98 Q6 · Q7).
- **one `Repl` per terminal** (`entities/terminal/repl.js`): `terminal.repl.commands` is the Vector, `terminal.repl.dispatch(line)` the ONLY entry; no `client.repl`, no `client.dispatch`. The terminal's `commands` beat rebuilds it whole on every mode-list change: client commands (`/shell` · `/quit` only on `paladin.is.tty`) · hosted modes' repls · the terminal's 21 · each runtime mode's `repl` BY REFERENCE at `/mode/<type>/<slug>` + `/mode/<slug>`.
```js
// systems/ghost/entities/terminal/lifecycle/index.js:7
  const { shell, quit, ...everywhere } = clientCommand;
  const tty = paladin.is.tty ? [shell, quit] : [];
```
- **keymap = `harvest(terminal.repl.commands)` first**, then `client.keymap` · the mode's; `catalog` rows carry `valence` (`subjects/client/keymap.js:7` · `:29`).
- **LOOPING**: once per client (`subjects/client/prototype.js:18`), serves `/terminal/:terminal/{metadata/repl,repl}` on `clientDie.aperture`.
```js
// systems/ghost/entities/mode/traits/looping.js:11
    .open("/metadata/repl", (ctx) => shape.strip(ctx.terminal.repl.commands))
    .post({ nature: "/repl", input: v.primitives.harness.Signal }, (ctx) => ctx.terminal.repl.dispatch(new ReplSignal(ctx.input)));
```
- **the factory MINTS the runtime** (10-27): `connected` wires multiplex · connection · the two manifest calls · `new Dataspace` before `execution`, so `client.runtime` is a plain field, never `null` past the factory, its stores read straight (`from(app.client.runtime.lighthouse.$status)`). REJECTED: `client.$runtime` atom — a once-set store is a suspension; `$entities` on `Runtime`. Lifecycle `modes · connection` (multiplex close only) `· authorized · dataspace · subscribed · hosts · terminals · staggered`; the app mounts after the factory, sign-in still gates at `authorized`; another user's sign-in flushes the stores (`subscribed`).
```js
// systems/ghost/subjects/client/factory.js
  (clientDie) => Object.assign(clientDie, { runtime: new Runtime({ remote, lighthouse }) }),
  connected,
  ...shape.monad.ready(execution),
```
- **`run.js` picks its role from the live terminals** (10-27, go): `paladin.is.tty && paladin.is.stderrTerminal` → `piped` re-spawns `run.js` with stderr piped, prints the child's stderr after it exits; else `ghost`. Deno's progress erase (`ESC[0G ESC[2K ESC[J`) on a tty stderr wiped cells OpenTUI never repainted. A `--watch` restart kills the child. REJECTED 10-27: a `stderr` Span on Controller — errors are `stdout.fault`, two homes.
```js
// systems/ghost/run.js
const ROLES = [
  [() => paladin.is.tty && paladin.is.stderrTerminal, piped],
  [() => true, ghost],
];
```
- **tests** (one file, root, `HOME=$(mktemp -d)`; `deno.jsonc` `test` is `--watch`): `look.test.js` (11, design cell oracle over `scenarios/look.js`) · `chrome.test.js` (7, a real opentui frame) · `looping.test.js` (5, real `Socket` over `Deno.serve`) · `commands` 22 · `repl` 7 · `keymap` 7 · `client` 4 (`scenarios/hello.js`).
- **`Vector.branch` RETURNS the child** — `.branch(a, repl).branch(b, repl)` grafts `repl` into itself (stack overflow 10-16); two calls, as `entities/terminal/lifecycle/index.js:17-18`. `subjects/client/traits/home.js:7` seats every threadless terminal from the user's `HOME` (m105 Q4′: a straight read once landed).
- **an env check is `paladin.is.*`** (role · mode · runtime getters, `subsystems/paladin/gestalten/belt/is.js:5`); a new one is a getter there. REJECTED 10-23 m102: inline `"Deno" in globalThis && Deno.stdin.isTerminal()` — /"there is tooling for this in paladin."/ Not in `gestalten/` → the chrome's `RUNS` (REJECTED 10-27 /"gestalten dont import"/).
