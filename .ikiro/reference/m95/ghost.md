> Research record 10-19 for m95, written BEFORE the drill. Killed since: "face" → the buffer's component (m95 lock 6); a shared row model across clients (REJECTED, lock 1); "the keymap is a view of the repl" (REJECTED). The quest's rulings win over anything below.

# ghost — research notes for the chrome rewrite (agent "ghost", 10-19)

Repo `/Users/finn/vivalence/code/vivalence`. All paths container-rooted. Read-only pass; no edits.

## 0 · status, measured 10-19

```sh
# from the repo root
viva --help; echo $?                                   # → shape.strip(shell) as "ctx.output: {help, repl, chrome}" · EXIT 0
HOME=$(mktemp -d) deno test -A --no-check systems/ghost/tests/repl.test.js     # ok 1 passed (6 steps)
HOME=$(mktemp -d) deno test -A --no-check systems/ghost/tests/text.test.js     # ok 4 passed
HOME=$(mktemp -d) deno test -A --no-check systems/ghost/tests/keys.test.js     # ok 2 passed (15 steps)
HOME=$(mktemp -d) deno test -A --no-check systems/ghost/tests/console.test.js  # ok 1 passed (1 step)
HOME=$(mktemp -d) deno test -A --no-check systems/ghost/tests/client.test.js   # ok 1 passed (4 steps), 3s, boots the DEMO world
```
- `viva --help` also prints `[instance] daemon[italian].consume.nlp filtered, @commons/service/nlp-stanza — empty key` (this machine's ledger), and the help is printed via the debug `console.log("ctx.output:", …)` at `systems/ghost/shell/lifecycle.js:9`.
- `ghost/scenario` boots nothing — CONFIRMED: `deno.jsonc:45` runs `systems/ghost/tests/scenarios/hello.js`, which only exports `MEMO · RECIPE · DEMO · boot` (24 lines, no `import.meta.main`). known-issues `ghost-scenario-boots-nothing` (`.ikiro/known-issues.org:68`).
- **fresh-tree trap**: `surface/chrome/out/` is gitignored (`surface/chrome/.gitignore:1`), yet `typology.js:1` → `shell/lifecycle.js:3` → `surface/index.js:2` → `surface/chrome/index.js:6` statically imports `./out/panes.mjs`. A fresh checkout without `deno task ghost/bundle` cannot import `@vivalence/ghost` at all — `viva` and every ghost test die module-not-found. Today's `out/panes.mjs` (Oct 16 16:12) is newer than every `.jsx` (latest `frame.jsx` 16:09) → current.

## 1 · the tree (live code, `bak/` excluded)

| area | LOC |
|---|---|
| `client/` | 349 |
| `entities/` | 776 |
| `gestalten/` | 121 |
| `prototypes/` | 33 |
| `shell/` | 29 |
| `surface/repl.js` | 44 |
| `surface/chrome/` (src, no `out/`) | 585 |
| `tests/` | 275 |
| `run.js · typology.js · deno.jsonc` | 69 |
| `surface/chrome/out/panes.mjs` (built) | 685 |
| `bak/` (bak.2 · bak.3 · bak.bak, 280 js/jsx files) | ~16.9k |

```
systems/ghost/
  run.js                 the door: paladin mounts here only
  typology.js            @vivalence/ghost "." — predicative barrel
  deno.jsonc             exports . · ./run · ./host ; tasks run · watch · bundle · test(--watch)
  ghost.sh install.sh    the `viva` shim
  shell/lifecycle.js     `shell` Vector: /help /repl /chrome, .do = repl
  client/                SUBJECT: prototype.js · factory.js · lifecycle/index.js · traits/{home,index}.js · commands/{help,quit,chrome,index}.js
  entities/              daemon/ lighthouse/ mode/ runtime/ terminal/ thread/ (subject dirs) + activity.js buffer.js turn.js (flat)
    terminal/commands/   mode/{list,pick} · application/{start,stop} · turn.js (*)
    mode/traits/         REPLING · EXPOSED · HARNESSED · APPLICATION(+open)
    lighthouse/traits/   AUTOLOGIN · JOINABLE(empty) · INVITATIONAL(empty)
  gestalten/belt/        harness.js (stream) — the WHOLE belt
  gestalten/shard/       host.js (status·metadata·cortex·modes·mounted) · repl.js (message·execution·scoped·compose·dispatch)
  prototypes/            cargo.js only
  surface/               index.js · repl.js · chrome/
    chrome/              index.js paint.js palette.js keys.js text.js views.js bundle.js
      host/              index.js preload.js deno-ffi.js opentui-core.patch
      panes/             chrome.jsx dock.jsx frame.jsx index.js
      views/             Input.jsx JsonTree.jsx Markdown.jsx
      out/panes.mjs      BUILT (gitignored)
  tests/                 client · console · keys · repl · text .test.js · world.js · scenarios/hello.js
  bak/                   bak.2 · bak.3 · bak.bak — prior generations (bak.3 = the rich chrome)
```

```jsonc
// systems/ghost/deno.jsonc:4
  "exports": { ".": "./typology.js", "./run": "./run.js", "./host": "./surface/chrome/host/index.js" },
  "tasks": {
    "run": "deno run -A run.js", "watch": "deno run -A --watch run.js",
    "bundle": "deno run -A surface/chrome/bundle.js",
    "test": "deno test -A --no-check --watch tests/**/*.test.js",
  },
```
Root tasks (`deno.jsonc:36-45`): `ghost/test` · `ghost/run` · `ghost/watch` · `ghost/install` · `ghost/bundle` · `ghost/scenario`.

```js
// systems/ghost/typology.js:14
export { Client } from "./client/prototype.js";
export { Runtime } from "./entities/runtime/prototype.js";
export { Lighthouse, STANDINGS } from "./entities/lighthouse/prototype.js";
export const factories = { client: client.factory };
export const lifecycle = { shell, client: client.lifecycle, terminal: terminal.lifecycle, thread: thread.lifecycle, mode: mode.lifecycle, lighthouse: lighthouse.lifecycle, daemon: daemon.lifecycle, runtime: runtime.lifecycle };
export const traits = { client: client.traits, mode: mode.traits, lighthouse: lighthouse.traits };
export const commands = { client: client.commands, terminal: terminal.commands };
```
Subject-first is real for `client/` only at top level; the other subjects live under `entities/` (each with `prototype.js` · `index.js` · `lifecycle/index.js`, traits/commands where they have them). No subject has `factory.js` except `client`; no `apertures/` anywhere.

## 2 · client lifecycle — door to running repl

```js
// systems/ghost/run.js:5
const instance = await factories.instance(paladin.instance);
await paladin.ledger.registry.supply();
const die = {
  controller: new Controller({ stdout: new Span("ghost") }),
  signal: new Argv(Deno.args),
  instance,
  mask: instance.clients.find((client) => client.manifest.slug === "ghost"),
};
die.register = await paladin.ledger.registry.wire(die.mask);
// :16-18 SIGINT/SIGQUIT/SIGTERM → die.controller.kill("SIGTERM", …)
// :21
  await steer.dispatch.execute(shell, die, die.signal);
// :31
Deno.exit(fromm.controller(die.controller).exit);
```
```js
// systems/ghost/shell/lifecycle.js:5
export const shell = new Vector()
  .use(shard.controller.open)
  .use(async (ctx, next) => { await next(); if (ctx.output) console.log("ctx.output:", JSON.stringify(ctx.output, null, 2)); })
  .use(async (ctx, next) => { if (ctx.signal.flags.help !== true) return next(); ctx.output = shape.strip(shell); })
  .open({ nature: "/help", … }, () => shape.strip(shell))
  .open({ nature: "/repl", … }, clientFactory(surface.repl))
  .open({ nature: "/chrome", … }, clientFactory(surface.chrome))
  .do(clientFactory(surface.repl));
```
```js
// systems/ghost/client/factory.js:6
export const factory = (surface) => async (shellDie) => {
  const clientDie = new Client({ controller: shellDie.controller.branch("client"), mask: shellDie.mask, register: shellDie.register, instance: shellDie.instance, surface });
  clientDie.repl.graft(chrome);
  await steer.dispatch.execute(execution, clientDie);
  if (clientDie.controller.status.is("FAILED")) throw clientDie.controller.status.reflection.error;
};
```
The beats, in order (`systems/ghost/client/lifecycle/index.js:216-231`):
```js
export const execution = new Vector()
  .use(shard.controller.open)
  .use(verbs)       // :39  repl.graft(help, quit)
  .use(modes)       // :44  register.modes → client.modes[type][slug] = new Mode(citizen); run mode.lifecycle (REPLING etc. staggered against the client)
  .use(surface)     // :56  clientDie.unmount = await clientDie.surface(clientDie)  — SURFACE MOUNTS BEFORE THE RUNTIME
  .use(runtime)     // :65  /status unreachable → paladin.ledger.boot(specs) spawns systems/runtime/run.js (integrate/disintegrate)
  .use(connection)  // :81  Runtime + Lighthouse; Connection(remote, retry(multiplex)) .use(track.request · track.fault · authorize · timeout 8000); /lighthouse/metadata
  .use(authorized)  // :100 compose(lighthouse.lifecycle.execution.carry)
  .use(dataspace)   // :103 /metadata/manifest → reference /runtime/<slug>; aperture = connection.branch(reference); new Dataspace({entities:{activity,buffer,daemon,mode,terminal,thread,turn}})
  .use(rows)        // :117 find() ×6 then subscribe() ×5 (daemon not subscribed)
  .use(hosts)       // :138 runtime + every daemon: HOSTS[type] execution, fire-and-forget
  .use(terminals)   // :144 reconcile $entities → each terminal row runs entities/terminal/lifecycle under its own controller
  .use(staggered)   // :168 traits.stagger(mask, clientDie, catalog) — HOME
  .use(thread)      // :177 derive the active terminal's thread → thread lifecycle ($activity)
  .use(active)      // :210 $active = rows[0] or terminal.create({})
  .do(shard.controller.hold);
```
### credentials · login
```js
// systems/ghost/entities/lighthouse/lifecycle/index.js:20
export const credentials = async (lighthouseDie, next) => {
  const file = lighthouseDie.client.instance.paladin.scope.ledger.branch("credentials.json").absolute;   // ~/.viva/credentials.json, keyed by origin, mode 0600
  const origin = lighthouseDie.client.runtime.remote.origin;
  const all = held(file);
  if (Object.hasOwn(all, origin)) lighthouseDie.client.runtime.lighthouse.restore(all[origin]);
  await lighthouseDie.client.runtime.lighthouse.verify();
  const off = …$authority.listen((authority) => { … store(file, { ...kept, [origin]: { user, authority, at } }) });
// :43
export const authorized = async (lighthouseDie, next) => {
  await Promise.race([belt.atom.until(…$isAuthorized, Boolean, …abort.signal), control.hold(lighthouseDie.controller)]);
```
```js
// systems/ghost/entities/lighthouse/traits/autologin.js:1
export const AUTOLOGIN = (lighthouse) => () => lighthouse.isAuthorized || lighthouse.autologin();
```
`Lighthouse` (`entities/lighthouse/prototype.js:6-143`): `$authority · $user · $status(STANDINGS) · signup · login · autologin · verify · refresh · logout`. **No sign-in surface exists**: without AUTOLOGIN on the lighthouse and no cached credential, `authorized` holds forever — the client never reaches `dataspace`. Ghost's prior signin pane lives at `bak/bak.3/chrome/panes/signin.jsx` (75) + `bak/bak.3/chrome/credentials.js`. known-issues `ghost-does-paladins-work` item 3 says `credentials.json` is ledger state (paladin's).

### the ring — a line
```js
// systems/ghost/client/prototype.js:26
  dispatch(line) { return shard.repl.dispatch(this, this.active, line); }
// systems/ghost/entities/terminal/prototype.js:45
  dispatch(signal) { return shard.repl.dispatch(this.client, this, signal); }
```
```js
// systems/ghost/gestalten/shard/repl.js:23
export const compose = (client, terminal) =>
  new Vector().graft(
    client.repl,
    ...fromm.modes(client.modes).flat.map((mode) => mode.repl),
    ...(terminal === null ? [] : [terminal.repl, ...client.runtime.entities.mode.$entities.get().map(scoped), ...(harnessed(terminal) ? [turn] : [])]),
  );
export const dispatch = (client, terminal, line) => {
  const signal = new ReplSignal(line);
  const replDie = { signal, client, runtime: client.runtime, terminal,
    controller: (terminal === null ? client.controller : terminal.controller).branch(signal.pathname),
    repl: compose(client, terminal), output: undefined };
  return steer.dispatch.execute(execution, replDie).then(() => replDie.output);
};
// :4  message beat: output !== undefined → controller.stdout.message(output)
```
Signal flow: `Deno.args` → `Argv` (`subsystems/typology/prototypes/argv.js:4`, `head` split on `/` into segments, `--x` flags, rest = body, JSON-ish tokens parsed) walks `shell`. A repl line → `ReplSignal` (`subsystems/typology/prototypes/replsignal.js:4`):
```js
// subsystems/typology/prototypes/replsignal.js:6
    [(line) => is.string(line) && !line.startsWith("/") && !line.startsWith("--"), (line) => [{ nature: "*", body: [{ type: "text", text: line }], flags: {} }]],
    [(line) => is.string(line), function (line) { return this.coerce(ReplSignal.tokens(line.startsWith("/") ? line.slice(1) : line)); }],
    ...Argv.coercions,
```
A bare line is `*` with a text PART as body → `entities/terminal/commands/turn.js` streams it via `gestalten/belt/harness.js` only on a HARNESSED terminal mode; otherwise NotFound fault.

Verbs live today (all `.open({nature, valence: "… Example: …"})`):

| nature | owner | file |
|---|---|---|
| `/help` | client | `client/commands/help.js:3` |
| `/quit` | client | `client/commands/quit.js:3` |
| `/chrome/on` · `/chrome/off` | client (grafted in factory) | `client/commands/chrome.js:4` |
| `/modes` | terminal | `entities/terminal/commands/mode/list.js:3` |
| `/mode <words>` | terminal | `entities/terminal/commands/mode/pick.js:8` |
| `/application/start` · `/stop` | terminal | `entities/terminal/commands/application/{start,stop}.js` |
| `*` | terminal, HARNESSED only | `entities/terminal/commands/turn.js:4` |
| `/mode/<type>/<slug>/harness` · `/mode/<slug>/harness` | mode (HARNESSED trait) | `entities/mode/traits/harnessed.js:33` |
| hosted mode verbs (`/hello`, `/whoami`) | REPLING client mode | `entities/mode/traits/repling.js:1` → `commons/fixtures/testing/console/console.viva.js` |

Terminals: rows of `/userspace/entities/terminal`; `HOME` (`client/traits/home.js:5`) seats every threadless terminal on `user.trait.HOME.reference` else `mask.trait.HOME.reference`, waiting for the owner host's `$status` HEALTHY/ERROR. `/chrome/on` calls `ctx.client.unmount()` then remounts — surfaces are hot-swappable over one client.

### hosts
```js
// systems/ghost/gestalten/shard/host.js:23
export const metadata = (type) => async (die, next) => {
  const [manifest, statics, aperture] = await Promise.all(["/metadata/manifest", "/metadata/statics", "/metadata/aperture"].map((path) => die[type].aperture.call(path)));
  die[type].call = shape.connection.wire(die[type].aperture, aperture);
  die[type].cargo = new Cargo(die[type].aperture);
// :50 mounted: stagger each mode's traits (catalog = entities/mode/traits), $status HEALTHY, message { [type]: ref, modes }
```

## 3 · surface / chrome today

`surface/repl.js` (44): tails `message · fault · turn` on `clientDie.controller.stdout`, prints, `readline` → `clientDie.dispatch(text)`; prints `shape.strip(clientDie.repl)` at mount.

`surface/chrome/index.js` — the whole chrome mount:
```js
// systems/ghost/surface/chrome/index.js:8
export const chrome = async (client) => {
  if (!Deno.stdin.isTerminal()) throw new Error("chrome needs a terminal — run it in one, or: viva repl");
  const { createCliRenderer } = await opentui();
  const renderer = await createCliRenderer({ exitOnCtrlC: false });
  renderer.keyInput.on("keypress", (event) => { if (event.ctrl && !event.shift && event.name === "c") Deno.kill(Deno.pid, "SIGINT"); });
  (async () => {
    for await (const press of keypresses(renderer).drain())
      if (press.key === "`") renderer.console.toggle();
  })();
  // no repl wired in yet??!!
  const erase = paint(renderer.root, renderer, tokens("northsea", "2"), panes.chrome, { client, accept: [mime.tty.solid, mime.json] });
  return () => { …; erase(); renderer.destroy(); /* replay renderer.console log entries to real stdout */ };
};
```
```js
// systems/ghost/surface/chrome/paint.js:17
export const paint = (slot, renderer, palette, Component, props) => {
  const dispose = _render(provide(renderer, palette, Component, props), slot);   // RendererContext.Provider ⊃ Palette.Provider ⊃ Component
  return () => { dispose(); for (const child of slot.getChildren()) child.destroyRecursively(); };
};
```
`tokens("northsea","2")` = dapper's flat token record (`subsystems/dapper/lib/tokens.js:133`, throws on an unknown theme); `palette.js` `TONES` maps 8 semantic tones → token names (`signalPrimary · signalPositive · signalCaution · signalNegative · textStrong · textInk · textMuted · textLink`), `tone()` throws on an unknown one; views also read `palette.surfaceSunk` directly. The ONLY dapper import in ghost is `surface/chrome/index.js:1`. Ghost does not import drapes at all.

Build: `surface/chrome/bundle.js` — esbuild + babel `babel-preset-solid` `{ generate: "universal", moduleName: "@opentui/solid" }`, entry `views.js` (`panes` + `Palette`), `packages: "external"` → `out/panes.mjs`. The paladin bundler's `mime.tty.solid` row (`subsystems/paladin/gestalten/belt/bundler.js:41`) is the same esbuild shape for MODE faces.

Host shim: `host/preload.js` sets `globalThis.__opentuiNodeFfi = deno-ffi.js` and a module-type `Worker`; `host/opentui-core.patch` (20 lines) patches `node_modules/@opentui/core/chunk-node-*.js` to read that global — OpenTUI runs on Deno only with that patch applied.

Panes:
```jsx
// systems/ghost/surface/chrome/panes/chrome.jsx:6
export function Chrome(props) {
  const buffer = from(belt.atom.chain(props.client.$active, "$buffer"));
  return (
    <box style={{ flexDirection: "row", flexGrow: 1 }}>
      <Show when={buffer() !== null && buffer() !== undefined}>
        <box style={{ flexGrow: 1 }}><Frame client={props.client} accept={props.accept} /></box>
      </Show>
      <box style={{ flexGrow: buffer() ? 0 : 1, width: buffer() ? 48 : "auto" }}><Dock client={props.client} /></box>
    </box>
  );
}
```
- `panes/dock.jsx` (86): `from(client.controller.stdout.tail("message","fault","turn"))` in a `<scrollbox stickyScroll>`; `Turn` (glyph `›` user / `✦` assistant + `Markdown` parts) · `Message` (last path segment + string or `JsonTree`) · `Fault`; a live `stream` tail paints the open turn; `<Input prompt="<<">` → `client.dispatch(line)`.
- `panes/frame.jsx` (76): the frame. Bundle choice + mount:
```jsx
// systems/ghost/surface/chrome/panes/frame.jsx:63
const offered = () => (application() === null ? null : bundle() !== null ? bundle().withUrl(application().url) : application().bundle);
…<Show when={offered() !== null && offered().negotiate(props.accept) !== null ? offered() : null} keyed fallback={<Floor buffer={held} />}>
// :25 Mounted onMount
    renderer.keyInput.prependListener("keypress", toggle);      // ⇥ toggles focus, preventDefault
    props.buffer.mount();
    props.bundle.load(props.accept)
      .then((module) => (handle = module.default(element, { terminal: props.terminal, mode: props.buffer.mode, thread: props.terminal.thread, buffer: props.buffer, renderer, palette, dispatch: props.dispatch, focused })))
// :48 Floor = <JsonTree data={buffer.$data} />
```
- `views/Input.jsx` (44): global `useKeyboard`, `EDITS` `[[predicate, edit]]` over `text.js` (`insert · backspace · move`), skips `defaultPrevented`. known-issue: a frame-focused face's unclaimed key still reaches the dock Input (`.ikiro/known-issues.org:52`).
- `views/JsonTree.jsx` (37) `LEAVES` table; `views/Markdown.jsx` (34) fence fold + `BLOCKS` table.

Faces that exist for `tty.solid`:
- `commons/fixtures/memo/mode/buffer/memo.jsx` — imports `@vivalence/sheets` (DEAD; only `subsystems/sheets/bak/` remains) and exports the OLD signature `export default (element, terminal, { renderer, palette })` (`:84`) → never mounts on today's frame (the "memo's view → Floor" known issue).
- `~/.viva/registry/education/modes/games/dojo/buffer/dojo.jsx:288` and `~/.viva/registry/chess/modes/board/play/buffer/play.jsx:268` — `export default (element, bag)`, the current contract; dojo imports `_render, createComponent, RendererContext` from `@opentui/solid` directly (each face repaints its own provider stack — the paint.js shape duplicated).
- Three bags in the wild (`.ikiro/known-issues.org:82`): ghost frame `{terminal mode thread buffer renderer palette dispatch focused}` · drapes `Frame.svelte:64` `{terminal daemon mode thread buffer}` · drapes `dom/panes/frame.jsx:23` `{buffer dispatch}`.

## 4 · keys and m92

```js
// systems/ghost/surface/chrome/keys.js:9
const CHORDS = [
  [(event) => event.ctrl, (event) => `ctrl-${named(event)}`],
  [(event) => event.meta, (event) => `meta-${named(event)}`],
  [(event) => PRINTABLE.test(event.sequence), (event) => event.sequence],
  [() => true, named],
];
export const press = (event) => ({ key: CHORDS.find(([test]) => test(event))[1](event) });
export const keypresses = (renderer) => { const queue = new Queue(); … renderer.keyInput.on("keypress", listener); renderer.once("destroy", () => { off; queue.close(); }); return queue; };
```
Consumer today: only backtick → `renderer.console.toggle()` (`chrome/index.js:17-20`); ctrl-c a raw listener outside the queue (`:13`); Tab owned by frame.jsx; text by Input.jsx.

m92 (`.ikiro/quests/m92-keymap.org`, DESIGNED 10-19, no go) — milestone 1 = the two typology hunks (HOLY, his go):
```diff
// subsystems/typology/gestalten/steer/strategy.js:6
 export function fire(effect, context) {
+  if (!is.fn(effect)) return effect;
// subsystems/typology/gestalten/steer/dispatch.js:108   (walk: a consumed signal is spent)
-  let signal;
-    if (!signal?.nature) signal = await more(position.patterns);
+    const signal = await more(position.patterns);
```
plus `subsystems/typology/gestalten/shape/keymap.js` new (`strip ⟷ wire`, a function effect throws). Milestones 2-4: `Press` + `gestalten/shard/keymap.js` (`harvest · compose · navigate`) · the chrome (minibuffer `client.$chord`, palette `client.$palette`, leader `ctrl-v`) · `KEYMAPPED` on both catalogs.
- What it replaces: `chrome/index.js:17-21` drain → `shard.keymap.navigate(client, press, more)`; `keys.js:9` gains the `leader` row FIRST (`ctrl-v` on tty; DOM picks the non-paste modifier); backtick → `leader/\``.
- New owners: `client.keymap` · `terminal.keymap` · `mode.keymap` Vectors; `client/keymap.js` (leader broken out); `chord:` on repl patterns (`/help leader/?` · `/quit leader/q` · `/chrome/on leader/c` · `/mode leader/m`).
- **`press.js` placement is OWED, his call** (`m92-keymap.org` handoff): the tangle writes `systems/ghost/prototypes/press.js` (`class Press extends Signature`, `coercions = [[is.string, key => [{ nature: key }]]]`), but `prototypes/` holds only `cargo.js` since `Argv · ReplSignal` moved to typology. Since anima/drapes `./dom` needs the same Press, the precedent (`ReplSignal` in `subsystems/typology/prototypes/`) argues typology.

Current `walk` (pre-hunk), the composer m92 relies on:
```js
// subsystems/typology/gestalten/steer/dispatch.js:108
export async function walk(vector, more) {
  let position = vector; let carry = middleware.forward; let steps = []; let signal;
  while (position.patterns.length) {
    if (steps.length >= 20) throw new Long();
    if (!signal?.nature) signal = await more(position.patterns);
    if (!signal.nature) throw new Short(position);
    const [effect, luggage, path, trajectory] = traverse(position, signal);
    if (!effect && path.length < signal.array.length) throw new NotFound(signal);
    carry = middleware.chain(carry, luggage); steps.push(...path);
    if (effect) return [effect, carry, steps, trajectory];
    position = trajectory;
  }
}
```

## 5 · typology pieces both clients lean on

NOT shared: `Client · Terminal · Buffer · Mode · Thread · Turn · Activity · Daemon · Runtime · Lighthouse` are each client's OWN classes (ghost `systems/ghost/entities/*`, anima `systems/anima/src/entities/*`); anima also has its own `prototypes/dataspace.js` and `prototypes/entity.js`. Shared = typology:

| piece | path | role |
|---|---|---|
| `Entity` | `subsystems/typology/prototypes/entity.js:1` | base class: `toJSON` collapses m:1/1:m/m:n to `{id}`, drops class instances |
| `RemoteRepository` | `subsystems/typology/prototypes/remote-repository.js:3` | mikro verbs over a Connection: `find findOne findAndCount count create upsert ensure updateOne update removeOne remove subscribe merge cast drop epoch persist` |
| `RemoteEntityManager` | `subsystems/typology/prototypes/entity-manager.js:10` | identity map `name:id`, one nanostores `atom` per entity name (`stores[name]` = `$entities`), `$<field>` computed per 1:m, dirty/flush |
| `Dataspace` | `subsystems/typology/prototypes/dataspace.js:15` | registers each module's `repository(dataspace)` + `hydration` Vector on ONE em; `init()` reads `<ref>/metadata/datamap`; `branch(connection, name)` |
| `Bundle` | `subsystems/typology/prototypes/bundle.js:5` | `entries[{mime, mount, integrity}]` · `merge` · `withUrl` · `negotiate(accept)` · `load(accept)` = fetch `url+mount`, sha256 check, blob-import, memo by integrity |
| `App` | `@vivalence/typology` (`commons/fixtures/memo/mode/memo.viva.js:17`) | a mode's `application` = entries + `v.buffer` schema |
| `mime` | `subsystems/typology/schematics/scalars/mime.js:13` | `dom.{svelte,html,react,solid}` · `tty.{react,solid}` · `markdown plain html svg json` |
| `shape.connection.wire` | `subsystems/typology/gestalten/shape/connection.js:1` | strip-node → callable api over a Connection (`:param` proxy, `yields` → stream, `feeds` → converse); the ana of `shape.strip` |
| `shape.strip` | `subsystems/typology/gestalten/shape/strip.js:15` | Vector → `{branches, effect}` JSON (`/help` output) |
| `steer.dispatch.execute · walk · traverse` | `subsystems/typology/gestalten/steer/dispatch.js:9,108` | the one dispatch; `walk` = press-by-press |
| `Signal · Argv · ReplSignal · Signature` | `subsystems/typology/prototypes/{signal,argv,replsignal,signature}.js` | the signal grammars (coercion tables) |
| `Controller · Span · Queue · Pipe` | `subsystems/typology/prototypes/{controller,span,queue,pipe}.js` | stdout span + `tail(...verbs)` atoms the surfaces paint; Queue for keys |
| `contexts.host` | `subsystems/typology/schematics/primitives/contexts.js:61` | `{entities call cortex modes services statics domain mountpoint reference cargo}`; `contexts.repl` (`:49`) documents the per-line composition; `contexts.runtime` (`:52`) the client Runtime |
| `traits.stagger` | `subsystems/typology/gestalten/belt/traits.js:6` | runs `module.manifest.traits` against a catalog, collects finalizers |
| `belt.atom.chain · until` | `subsystems/typology/gestalten/belt/atom.js:25` | `chain($active, "$buffer")` drives chrome/frame |

`repl` Vector on three owners: `Client.repl` (`client/prototype.js:14`) · `Terminal.repl` (`entities/terminal/prototype.js:17`) · `Mode.repl` (`entities/mode/prototype.js:16`), composed per line by `shard.repl.compose`.

## 6 · drapes / dapper for tty

- drapes has NO `./tty`: `subsystems/drapes/deno.jsonc` exports `.` (Svelte) and `./dom` (Solid DOM) only. tty panes live solely in `systems/ghost/surface/chrome/`.
- drapes `./dom` reaches INTO ghost: `subsystems/drapes/dom/chassis.jsx:3` `import { belt } from "@vivalence/ghost"; const dock = belt.dock;` — ghost's belt is `harness` only (`gestalten/belt/index.js:1`) → `./dom` RED.
- dapper: ghost uses `tokens(theme, zone)` once; the palette record IS the token set; no tty-specific dapper layer (hex → ANSI is OpenTUI's).

## 7 · reusable vs dead

Reusable (green, small, on-contract):
- the whole ring: `client/` lifecycle beats, `gestalten/shard/repl.js` compose/dispatch, `gestalten/shard/host.js`, `entities/*` (rows, traits, commands) — UI-free, tested by `client.test.js` against a world.
- `surface/repl.js` as the plain-lines surface; the `surface(clientDie) → unmount` contract (`client/lifecycle/index.js:56`) — a new chrome plugs in here, and `/chrome/on|off` hot-swaps.
- `surface/chrome/host/*` (Deno FFI shim + core patch) — required for any OpenTUI on Deno.
- `paint.js` (provider stack) · `palette.js` (`TONES`/`tone`) · `keys.js` (`press`/`keypresses`, m92's base) · `text.js` · `views/{Input,JsonTree,Markdown}.jsx` · `bundle.js`.
- `panes/frame.jsx` bundle negotiation + `module.default(element, bag)` mount — the one place the application-bundle-by-mime contract (m82/m87) is realised on tty.
- tests: `tests/world.js` (`testRender` 100×30, `settle`), `keys.test.js`, `repl.test.js`, `console.test.js`, `client.test.js`.

Dead / slop:
- `bak/` entire (bak.2 · bak.3 · bak.bak, ~280 js/jsx files, incl. sqlite dbs and logs). bak.3 holds the prior rich chrome — `chrome/panes/{crown,dock,frame,navigation,pips,signin}.jsx`, `commands/{dock,key,entity,runtime,paladin}/…`, `gestalten/belt/{dock,panes,view}.js` — prior art only, never imported.
- `chrome/index.js:21-23` comments; `shell/lifecycle.js:9` debug `console.log("ctx.output:")` (is how `viva --help` prints); `surface/repl.js:16` comment.
- `JOINABLE` · `INVITATIONAL` empty traits (`entities/lighthouse/traits/`).
- `commons/fixtures/memo/mode/buffer/memo.jsx` (imports dead `@vivalence/sheets`, old default signature).
- `drapes/dom/chassis.jsx:3` reading `belt.dock`.
- `prototypes/cargo.js` `resolve` (no live caller in ghost found beyond construction/refetch in host.js).

Gaps a chrome rewrite meets: no sign-in pane (AUTOLOGIN or nothing); surface mounts BEFORE runtime/auth so it must render a pre-runtime state (`client.runtime === null`); keys are unrouted (m92); the face bag is three different shapes across clients; `out/` must be built before ghost imports at all.
