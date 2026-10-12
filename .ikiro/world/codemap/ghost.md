---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · limit: 5600 chars · code is the map · @vivalence/ghost = typology.js, paladin-free (deno info typology.js | grep -c paladin → 0); m91: lifecycle.shell pulls surface/chrome in (opentui ×12 · solid-js ×6) -->
# codemap: ghost — the door · the client subject-first · the surfaces (m86 10-16 · m91 10-19)

- **`run.js` is the DOOR**: paladin mounts here and nowhere else; `instance · mask · register` ride the shell die; `shell/lifecycle.js` `shell` (one Vector) → `clientFactory(surface.repl|chrome)`; `client/factory.js` `factory` births the `Client`, grafts `commands/chrome.js` (`/chrome/on|off`), runs `client/lifecycle/index.js` `execution`.
```js
// systems/ghost/run.js:5
const instance = await factories.instance(paladin.instance);
// systems/ghost/run.js:12
  mask: instance.clients.find((client) => client.manifest.slug === "ghost"),
};
die.register = await paladin.ledger.registry.wire(die.mask);
```
- **`<subject>/`** = `prototype.js` (class · `repository(dataspace)` · `hydration`) · `lifecycle/index.js` (beats by name, the Vector `execution` last) · `traits/<NAME>.js` + `traits/index.js` (the catalog the lifecycle imports ITSELF; no `traits` key on a die) · `commands/`. Subjects: `client`; `entities/`: `daemon · lighthouse · mode · runtime · terminal · thread` + `activity · buffer · turn`; `shell/` · `surface/` (sibling of `client/`) beside; `prototypes/` · `gestalten/` the rest. `typology.js` is predicative (`belt · shard` also flat: drapes `./dom` reads `belt`); the em's names: `client/lifecycle/index.js:109`.
```js
// systems/ghost/typology.js:17
export const factories = { client: client.factory };
// systems/ghost/typology.js:19
export const traits = { client: client.traits, mode: mode.traits, lighthouse: lighthouse.traits };
export const commands = { client: client.commands, terminal: terminal.commands };
```
- **the ring**: `Client.dispatch(line)` → `shard.repl.dispatch(client, active, line)` builds `compose(client, terminal)` ON EVERY LINE: `client.repl` · hosted repls at the ROOT · `terminal.repl` · every mounted mode's repl `scoped` under `/mode/<type>/<slug>` + `/mode/<slug>` · `entities/terminal/commands/turn.js` (`*`) only when `terminal.mode` is HARNESSED. `message` beat: output → `controller.stdout.message`. A verb reads words from `ctx.signal.body` — `ctx.input` is NOT set on a repl die.
```js
// systems/ghost/gestalten/shard/repl.js:14
export const scoped = (mode) => {
  const vector = new Vector();
  vector.branch(`/mode/${mode.type}/${mode.slug}`, mode.repl);
  vector.branch(`/mode/${mode.slug}`, mode.repl);
  return vector;
};
```
`Vector.branch` RETURNS the child — a chained `.branch(a, repl).branch(b, repl)` grafts `repl` into itself (stack overflow, 10-16).
- **a trait is STAGGERED on its owner and reads its config straight**: `client/traits/home.js` `HOME(mask, clientDie)` seats every threadless terminal in `mask.trait.HOME.reference` (the user's via `v.user.trait`); staggered by `client/lifecycle/index.js` `staggered` over `mask.manifest.traits` (a client's traits ride the MANIFEST, `instance.js`).
- **hosts**: `Runtime` · `Daemon` boot under `gestalten/shard/host.js` (`status · metadata · cortex · modes · mounted`, thunks over `die[type]`); each carries `aperture` = its OWN branch (`/runtime/<slug>` · `/daemon/<slug>`): the runtime ROOT serves only `/metadata/{manifest,aperture}`, the lighthouse, the userspace. Readiness = `$status` HEALTHY set by `mounted` ALONE; the `/status` subscription marks loss/recovery only.
```js
// systems/ghost/client/lifecycle/index.js:106
  clientDie.runtime.aperture = clientDie.runtime.connection.branch(clientDie.runtime.reference.absolute);
```
- **resident rows**: a terminal and a thread are hydrated per merge AND executed under a controller while the client attends them (`terminals` · `thread` beats; `entities/terminal/lifecycle/` grafts `/modes · /mode · /application/*`; `entities/thread/lifecycle/` derives `$activity`). `Dataspace` (`@vivalence/typology`) registers each row module's `repository` + `hydration` on ONE em; `branch(connection, name)` serves a daemon's `/entities/mode`.
- **surfaces**: `surface/repl.js` tails `message · fault · turn` (prints once, `seen`); `surface/chrome/` paints `panes.chrome` (dock ⊕ frame) from the BUILT `out/panes.mjs` — every `.jsx` edit → `deno task ghost/bundle`. The frame mounts a mode's `tty.solid` bundle as `module.default(element, bag)` → `{ destroy }`, bag = `terminal · mode · thread · buffer · renderer · palette · dispatch · focused`, else the Floor (`JsonTree` of `buffer.data`). Keys: `panes/frame.jsx` owns ⇥ (`prependListener`), a view claims a key by `preventDefault` while `focused()`, `views/Input.jsx` yields a `defaultPrevented` key — `stopPropagation` stops no sibling listener. memo's view → Floor (known-issues).
- **tests** (one file, from the root, `HOME=$(mktemp -d)`): `tests/repl.test.js` (no world, 6) · `tests/console.test.js` (`@commons/home/console` via `accio`, 1) · `tests/client.test.js` (the DEMO world from `tests/scenarios/hello.js`: boot · HOME · `/mode srs/memo` · chat on the stub · `/application/start|stop`, 4). `deno.jsonc` `test` is `--watch`.
```js
// systems/ghost/tests/client.test.js:9
  await lifecycle.paladin.scopes(paladin);
  const instance = await factories.instance(lifecycle.paladin.instance(paladin));
```
- **`surface/chrome/host/`** `opentui` ← `preload.js` ← `deno-ffi.js` (`@vivalence/ghost/host`); `keys.js` `press` · `keypresses`; `text.js` ← `views/Input.jsx` (`tests/keys.test.js` · `text.test.js`).
