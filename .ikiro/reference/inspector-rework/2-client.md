<!-- writer: agent · reference, uncapped · written 2026-11-16 · the client architecture (ghost die + anima/tty chromes) around the telemetry inspector, for a design agent -->
# 2 · the client — architecture census for the inspector rework

Read on the live tree, 2026-11-16. Every claim cites `file:line`, repo-rooted. Code is quoted, trimmed to 100 chars; `…` marks a cut.

The ONE fact to hold: **ghost owns the client** (`systems/ghost/`), anima (`systems/anima/src/`) and the tty chrome (`systems/ghost/surfaces/chrome/`) are two SURFACES over the same `App`.

## 0 · the shape in one tree

```text
App                                   systems/ghost/subjects/app/prototype.js:4
├── client: Client                    systems/ghost/subjects/client/prototype.js:19
│   ├── controller (Span "client")    ← the logger reads its $history
│   ├── mask · instance · register    ← paladin, set by the page/shell die
│   ├── modes {type:{slug:Mode}}      ← LOCAL modes (registry), client/lifecycle/index.js:10
│   ├── aperture: Aperture            ← served BACK over the multiplex, client/prototype.js:3
│   └── runtime: Runtime              systems/ghost/entities/runtime/prototype.js:3
│       ├── $status                   IDLE · MOUNTING · HEALTHY · UNAVAILABLE · ERROR · RELEASED
│       ├── multiplex · connection    ← ONE WebSocket, client/factory.js:21
│       ├── lighthouse: Lighthouse    systems/ghost/entities/lighthouse/prototype.js:4
│       │   └── $authority · $user · $status · $isAuthorized · $isIdentified
│       └── entities: Dataspace       subsystems/typology/prototypes/dataspace.js:15
│           ├── daemon  .$entities    → Daemon { $status, entities (branch), modes }
│           ├── mode    .$entities    → Mode { repl, keymap, call, harness, metadata }
│           ├── thread  .$entities    → Thread { $buffers, $phase, $turns, $activities }
│           ├── terminal.$entities    → Terminal (a SUBJECT, see below)
│           ├── buffer  .$entities    → Buffer { $views $files $data $bundle $traits $trait $label }
│           ├── turn · activity · view · file · literal · symbol · note
├── surface: chrome                   anima: src/surfaces/index.js:4 · tty: ghost surfaces/
├── controller (Span "app")
├── box: Box                          ← drivers.audio · device.microphone · device.speaker
├── bridge: Bridge                    ← 17 screen stores, 3 persisted
└── telemetry: Telemetry              ← $state (persisted) · $logger (getter)

Terminal                              systems/ghost/subjects/terminal/prototype.js:8
├── $thread · $buffer                 ← the seated thread, the framed buffer
├── repl: Repl                        ← $catalog · commands (getter) · dispatch(typed)
├── legend: Legend                    ← $chord · presses (Queue) · keymap (getter)
├── stall: Stall                      ← refills buffers by thread.phase
├── client · repository · controller  ← set at hydration, terminal/hydration.js:8
└── dock (getter)                     ← DEFAULT_DOCK ⊕ mask ⊕ user ⊕ terminal DOCKED
```

The one store graph the panels read is this tree; there is no second state container.

# 1 · boot — page load to a mounted chrome

## 1.1 · the page die (anima)

`systems/anima/src/client.js` is the whole entry: paladin seats the instance, ghost mints the client, the App runs ghost's lifecycle.

```js
// systems/anima/src/client.js:6
const instance = await factories.instance(paladin.instance); // @beef still dont like this.
await paladin.ledger.registry.supply();
const die = {
  controller: new Controller({ stdout: new Span("anima") }),
  instance,
  mask: instance.mask("anima"),
};
die.register = await paladin.ledger.registry.wire(die.mask);
```

```js
// systems/anima/src/client.js:39
  const client = await ghost.client.factory(die);
  client.app = new ghost.app.App({
    client,
    surface: chrome,
    controller: die.controller.branch("app"),
  });
  await steer.dispatch.execute(
    new Vector()
      .graft(ghost.app.lifecycle.execution) //
      .use(logging),
    client.app,
  );
```

- `pagehide` kills the page controller with SIGTERM: `systems/anima/src/client.js:16`.
- `logging` replays the client span's history, then taps it into `console`: `systems/anima/src/client.js:18-36` (only tracks `log` · `fault`, `:20`).
- the tty twin of this die is `systems/ghost/subjects/shell/commands/chrome.js:9-19` (beats `seat` · `ledger` · `runtime`, then the same factory + App).

## 1.2 · the client factory — a kleisli, returns at RUNNING

```js
// systems/ghost/subjects/client/factory.js:46
export const factory = monad.kleisli([
  (shellDie) => new Client({ controller: shellDie.controller.branch("client"), … }),
  (clientDie) =>
    Object.assign(clientDie, {
      runtime: new Runtime({
        remote: new Url(clientDie.instance.runtime.statics.remote),
        lighthouse: Object.assign(new Lighthouse(), { stdout: … }),
      }),
    }),
  connected,
  ...shape.monad.ready(execution),
]);
```

- `ready` = `[idle, dispatch(execution), controlled]`: `subsystems/typology/gestalten/shape/monad.js:24`.
- `controlled` resolves when the client controller goes `RUNNING`: `subsystems/typology/gestalten/belt/control.js:4`.
- So the factory returns after `connected` and the FIRST beat; the rest of the client lifecycle runs while the App mounts. Nobody awaits sign-in; the chrome's cover gates on it (§4.2).

`connected` is the one place the wire is built:

```js
// systems/ghost/subjects/client/factory.js:19
export const connected = async (clientDie) => {
  const runtime = clientDie.runtime;
  runtime.multiplex = shard.transmitter.multiplex({
    authority: runtime.lighthouse.$authority, vector: clientDie.aperture });
  runtime.connection = new Connection(runtime.remote, shard.transmitter.retry(runtime.multiplex, …))
    .use(shard.track.request())
    .use(shard.track.fault())
    .use(shard.connection.authorize(runtime.lighthouse.$authority))
    .use(shard.connection.timeout(8000));
  …
    runtime.lighthouse.manifest = await runtime.connection.call("/lighthouse/metadata");
    runtime.manifest = await runtime.connection.call("/beacon/manifest");
  …
  runtime.reference = new Path(`/runtime/${runtime.manifest.slug}`);
  runtime.aperture = runtime.connection.branch(runtime.reference.absolute);
  runtime.entities = new Dataspace({ runtime, entities: { daemon, mode, thread, … }, seed });
```

## 1.3 · the client lifecycle — nine beats

```js
// systems/ghost/subjects/client/lifecycle/index.js:91
export const execution = new Vector()
  .use(shard.controller.open)
  .use(modes)
  .use(connection)
  .use(authorized)
  .use(dataspace)
  .use(subscribed)
  .use(hosts)
  .use(terminals)
  .use(staggered)
  .do(shard.controller.hold);
```

| beat | file:line | wire |
|---|---|---|
| `modes` | `systems/ghost/subjects/client/lifecycle/index.js:10` | none (registry `register.modes`) |
| `connection` | `systems/ghost/subjects/client/lifecycle/index.js:22` | `multiplex.close()` in `finally` |
| `authorized` | `systems/ghost/subjects/client/lifecycle/index.js:30` | `/lighthouse/verify` · `/refresh` · … |
| `dataspace` | `systems/ghost/subjects/client/lifecycle/index.js:33` | `/runtime/<slug>/metadata/datamap` |
| `subscribed` | `systems/ghost/subjects/client/lifecycle/index.js:39` | `/find` + `/subscribe` per repository |
| `hosts` | `systems/ghost/subjects/client/lifecycle/index.js:58` | `/status` · `/metadata/*` per host |
| `terminals` | `systems/ghost/subjects/client/lifecycle/index.js:63` | none (`stall.watch()` per terminal) |
| `staggered` | `systems/ghost/subjects/client/lifecycle/index.js:82` | mask traits, e.g. `HOME` |
| `hold` | `systems/ghost/subjects/client/lifecycle/index.js:101` | — |

`authorized` composes the lighthouse lifecycle: restore from the vault, verify, run its traits, then WAIT for `$isAuthorized`:

```js
// systems/ghost/entities/lighthouse/lifecycle/index.js:25
export const authorized = async (lighthouseDie, next) => {
  await Promise.race([
    belt.atom.until(lighthouseDie.client.runtime.lighthouse.$isAuthorized, Boolean, …),
    control.hold(lighthouseDie.controller)]);
```

- `credentials` (vault restore · `verify` · persist on `$authority` change): `systems/ghost/entities/lighthouse/lifecycle/index.js:5-18`.
- lighthouse traits `AUTOLOGIN` · `INVITATIONAL` · `JOINABLE`: `systems/ghost/entities/lighthouse/traits/*.js`; only `AUTOLOGIN` acts (`autologin.js:1`).
- the standings enum: `systems/ghost/entities/lighthouse/standings.js:1`.
- another user's sign-in drops every cached entity and re-subscribes: `systems/ghost/subjects/client/lifecycle/index.js:42-48`.

`hosts` boots the runtime and every daemon as their own kleislis over one host shard:

```js
// systems/ghost/entities/runtime/lifecycle/index.js:4
export const execution = new Vector().use(shard.controller.open).use(host.status("runtime"))
  .use(host.metadata("runtime")).use(host.cortex("runtime")).use(host.mounted("runtime"))
  .do(shard.controller.hold);
```

- `status` sets `MOUNTING`, reads `/status`, subscribes `/status/subscribe`: `systems/ghost/gestalten/shard/host.js:8-29`.
- `metadata` reads `/metadata/manifest` · `/metadata/statics` · `/metadata/aperture`, wires `call`: `systems/ghost/gestalten/shard/host.js:31-37`.
- `cortex` reads `/metadata/cortex`: `systems/ghost/gestalten/shard/host.js:39-42`.
- `mounted` staggers each mode's `REPLING · KEYMAPPED · EXPOSED · HARNESSED`, sets `HEALTHY`: `systems/ghost/gestalten/shard/host.js:44-58`.
- the daemon twin adds an `entities` beat (`literal symbol note mode` branched): `systems/ghost/entities/daemon/lifecycle/index.js:4-9`.

## 1.4 · the App lifecycle — mount is a beat

```js
// systems/ghost/subjects/app/lifecycle.js:30
export const execution = new Vector()
  .use(shard.controller.open)
  .use(client)
  .use(bundle)
  .use(mount)
  .do(shard.controller.hold);
```

- `client` ties App abort to the client's settle: `systems/ghost/subjects/app/lifecycle.js:9-19`.
- `bundle` calls `surface.bundle()`; anima's is a no-op `bytes: 0`: `systems/anima/src/surfaces/index.js:5`.
- `mount` calls `surface.mount(appDie)`, unmounts in `finally`: `systems/ghost/subjects/app/lifecycle.js:21-28`.

## 1.5 · anima's mount — what it seeds before the first paint

```js
// systems/anima/src/surfaces/chrome/mount.jsx:60
  const seated = Object.hasOwn(appDie.telemetry.state, "point")
    ? {}
    : { window: WINDOW, point: "client", folds: {}, picked: {}, queries: {} };
  appDie.telemetry.$state.set({
    ...appDie.telemetry.state,
    ...seated,
    peeks: {},
    since: 0,
    selection: null,
  });
```

- viewport → `bridge.$viewport` on resize and the `(max-width: 767px)` query: `mount.jsx:40-49`.
- DOM focus → `bridge.$focus` from the nearest `[data-focus]`: `mount.jsx:50-58`.
- sidebar width seeded from `SIDEBAR.width`: `mount.jsx:59`.
- `LOGGED_OUT` clears the sign-in password: `mount.jsx:70-73`.
- dapper tokens emitted into one `<style data-dapper=tokens>`: `mount.jsx:10-19`.
- Solid `render` of `<Cover/>` under the `app` ambient: `mount.jsx:21-37`.

## 1.6 · the wire — what talks to what

ONE WebSocket per origin carries every request; SSE-shaped streams ride its frames.

```js
// subsystems/typology/gestalten/shard/transmitter.js:15
export function multiplex({ authority, mount = "/multiplex", vector, connect } = {}) {
  const open = connect ?? ((address) => new WebSocket(address));
```

```js
// subsystems/typology/gestalten/shard/transmitter.js:106
      if (request.headers.get("accept") === "text/event-stream") {
        response.status = 200;
        response.body = follow(socket, frame, request, abort);
        return;
      }
```

- the token rides the socket URL as `?token=` and each frame: `transmitter.js:32-34` · `:97`.
- `Connection.subscribe` = a reconnecting `stream` with `accept: text/event-stream`: `subsystems/typology/prototypes/connection.js:118` · `:152`.
- `Connection.branch(path)` returns a child connection, middleware inherited: `subsystems/typology/prototypes/connection.js:48-52`.
- the multiplex is BIDIRECTIONAL: `vector: clientDie.aperture` (`factory.js:21`) lets the runtime call the client. The client serves `/terminal/:terminal/repl` + `/metadata/repl` (`systems/ghost/subjects/client/prototype.js:3-17`), armed once by a `LOOPING` mode (`systems/ghost/entities/mode/traits/looping.js:1`).

Endpoints the client calls, by owner:

| endpoint | file:line |
|---|---|
| `/lighthouse/metadata` | `systems/ghost/subjects/client/factory.js:29` |
| `/beacon/manifest` | `systems/ghost/subjects/client/factory.js:30` |
| `/lighthouse/{login,signup,autologin}` | `systems/ghost/entities/lighthouse/prototype.js:50-60` |
| `/lighthouse/{verify,refresh,logout}` | `systems/ghost/entities/lighthouse/prototype.js:80` · `:101` · `:131` |
| `/runtime/<slug>/metadata/datamap` | `subsystems/typology/prototypes/dataspace.js:30` |
| `/userspace/entities/{terminal,thread,buffer}` | `systems/ghost/subjects/terminal/repository.js:4` · `entities/thread/repository.js:4` · `entities/buffer/repository.js:6` |
| `/runtime/<slug>/entities/{mode,daemon}` | `systems/ghost/entities/mode/repository.js:4` · `entities/daemon/repository.js:4` |
| `/daemon/<slug>/…` | `systems/ghost/entities/daemon/hydration.js:5-7` |
| `<host>/mode/<type>/<slug>/metadata/{aperture,harness,repl}` | `entities/mode/traits/exposed.js:4` · `harnessed.js:30` · `repling.js:5` |
| `<mode>/harness/dialogue/stream` | `systems/ghost/gestalten/belt/harness.js:5` |
| `/userspace/entities/activity/<id>/stdin/<SIG>` | `systems/ghost/entities/activity/hydration.js:5-6` |
| `<mode>/metadata/harness/primer/<path>` | `systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:339` |

## 1.7 · entities — RemoteRepository, one store per kind

```js
// subsystems/typology/prototypes/dataspace.js:19
    for (const [name, entity] of Object.entries(entities)) {
      const repository = entity.repository(this);
      const boot = new Vector().use(context.bind("repository", repository))
        .use(context.bind("dataspace", this));
      seed(boot);
      boot.graft(entity.hydration).do(async () => {});
      this.em.register(name, repository, shape.selbstbestimmt(boot, strategy));
      this[name] = repository;
```

- `runtime.entities.<kind>` IS the repository; `.$entities` is its nanostores atom (`entity-manager.js:52`).
- repository verbs: `find` · `findOne` · `create` · `upsert` · `ensure` · `updateOne` · `update` · `removeOne` · `merge` · `subscribe`: `subsystems/typology/prototypes/remote-repository.js:69-184`.
- a subscription event `op: "delete"` drops, else merges: `remote-repository.js:159-169`.
- `dataspace.branch(connection, kinds)` mints repositories scoped to a host or mode, SHARING the em's stores: `dataspace.js:43-45`; used at `entities/mode/hydration.js:8` · `entities/daemon/lifecycle/index.js:5`.
- every hydration gets `client` and `runtime` bound: `systems/ghost/subjects/client/factory.js:40`.

# 2 · the subject model — who owns what

## 2.1 · App — the screen's owner

```js
// systems/ghost/subjects/app/prototype.js:4
export class App {
  client = null;
  surface = null;
  controller = null;
  box = new Box(this);
  bridge = new Bridge();
  telemetry = new Telemetry(this);
```

- theme = bridge › mask `THEMED` › user `THEMED` › `"porcelain"`: `systems/ghost/subjects/app/prototype.js:16-18`.
- `box.device.microphone` · `.speaker` · `drivers.audio`: `systems/ghost/subjects/app/prototypes/box/index.js:5-14`.

## 2.2 · Bridge — the screen's state, one `$atom` each

```js
// systems/ghost/subjects/app/prototypes/bridge.js:5
  $terminal = persistentAtom("viva.bridge.terminal", null, { encode: …, decode: … });
  $viewport = atom({ width: null, height: null, narrow: false });
  $focus = atom("dock.input");
  $focusHistory = atom([]);
  $sidebar = atom({ open: false, width: 39 });
  $draft = atom("");
  $selected = atom(0);
  $hidden = atom([]);
  $theme = persistentAtom("viva.bridge.theme", null, …);
  $font = persistentAtom("viva.bridge.font", "base", …);
  $popover = atom(null);
  $phonePane = atom("dock");
  $widget = atom(null);
  $float = atom({});
  $selection = atom(null);
  $signin = atom({ user: "", pass: "" });
  $sections = atom({ filter: {}, expand: {}, peeks: {}, pick: null, hostsOff: …, traits: … });
```

- each store ships a plain getter: `bridge.js:27-93`.
- focus history keeps the last 6: `bridge.js:24`.

## 2.3 · Telemetry — the inspector's own subject

```js
// systems/ghost/subjects/app/prototypes/telemetry.js:3
export class Telemetry {
  $state = persistentAtom(
    "viva.telemetry.state",
    { open: false, view: "logger", filter: "all", selection: null, since: 0,
      window: { x: 0, y: 3, width: 77, height: 23 } },
    { encode: JSON.stringify, decode: JSON.parse },
  );
  …
  get $logger() {
    return this.app.client.controller.stdout.$history;
  }
```

- `$logger` is the CLIENT span's history; every child span (`terminal/<id>`, a repl signal's pathname, a mode's reference, `lighthouse`) taps into it: `subsystems/typology/prototypes/span.js:30-33`.
- the history caps at `Span.limit = 1000` records: `subsystems/typology/prototypes/span.js:24` · `:32`.
- record tracks: `start stop request response fault log entity status`: `subsystems/typology/prototypes/span.js:13-21`.
- `$state` fields written anywhere: `open view filter selection since window` (here) + `point folds picked queries peeks` (`systems/anima/src/surfaces/chrome/mount.jsx:62-68`).

## 2.4 · Client — the die everything hangs off

- fields: `controller instance mask register app modes aperture looping runtime`: `systems/ghost/subjects/client/prototype.js:19-32`.
- `user` getter falls to `{}` before sign-in: `systems/ghost/subjects/client/prototype.js:38-44`.
- `client.modes` are LOCAL (registry) modes; host modes live on `runtime.entities.mode`: `systems/ghost/subjects/client/lifecycle/index.js:11-12` vs `systems/ghost/entities/runtime/prototype.js:25-27`.
- client trait `HOME` seats a fresh thread on every terminal with `thread === null`: `systems/ghost/subjects/client/traits/home.js:4-30`.

## 2.5 · Terminal — an entity that RUNS

```js
// systems/ghost/subjects/terminal/prototype.js:16
  client = null;
  repository = null;
  controller = null;
  repl = new Repl(this);
  legend = new Legend(this);
  stall = new Stall(this);
  $thread = atom(null);
  $buffer = atom(null);
```

```js
// systems/ghost/subjects/terminal/prototype.js:43
  get dock() {
    return { ...belt.dock.DEFAULT_DOCK, ...this.client.mask.trait.DOCKED,
      ...this.client.runtime.lighthouse.user.trait.DOCKED, ...this.trait.DOCKED };
  }
```

- persisted on the runtime (`/userspace/entities/terminal`); the shown one is `bridge.$terminal`: `systems/ghost/subjects/terminal/repository.js:4`.
- writes go through the repository: `setThread` · `setBuffer`: `systems/ghost/subjects/terminal/prototype.js:56-66`.
- hydration casts `DOCKED`, binds `client` · `repository` · `controller` (`terminal/<id>` span): `systems/ghost/subjects/terminal/hydration.js:3-11`.
- `DEFAULT_DOCK` `{align: right, share: 0.38, view: full, shown: full, lens: [turns, harness], markdown: pretty}`: `systems/ghost/gestalten/belt/dock.js:3`.
- the stall's one live phase `/manual`: `systems/ghost/subjects/terminal/stall.js:11-26` (`/inert` · `/continuous` commented out, `:5` · `:28`).

## 2.6 · Thread · Mode · Buffer — derived stores at hydration

```js
// systems/ghost/entities/thread/hydration.js:6
  ctx.entity.trait = belt.traits.cast(ctx.entity, v.thread.traits);
  ctx.entity.$buffers = computed(ctx.runtime.entities.buffer.$entities, (buffers) => …);
  ctx.entity.$phase = computed(ctx.runtime.entities.thread.$entities, () => ctx.entity.phase);
  ctx.entity.$turns = computed(ctx.runtime.entities.turn.$entities, (turns) => …);
  ctx.entity.$activities = computed(ctx.runtime.entities.activity.$entities, …);
```

- `thread.word` = `LABELED.name` › `"thread"` › mode slug, a `[[predicate, tag]]` table: `systems/ghost/entities/thread/prototype.js:3-8`.
- mode hydration gives `reference` · `connection` · `entities` (8 kinds branched): `systems/ghost/entities/mode/hydration.js:3-9`.
- mode fields `repl keymap metadata connection call harness status stdout`: `systems/ghost/entities/mode/prototype.js:3-20`.
- buffer stores `$views $files $data $bundle $traits $trait $label`: `systems/ghost/entities/buffer/prototype.js:4-56`.
- activity status = its controller's code; signals go to `/stdin/<SIG>`: `systems/ghost/entities/activity/prototype.js:13-21` · `hydration.js:6`.
- daemon · runtime carry `$status` and `metadata {manifest, statics, aperture}`: `systems/ghost/entities/daemon/prototype.js:10-16` · `systems/ghost/entities/runtime/prototype.js:8-16`.
- lighthouse stores `$authority $user $status $isAuthorized $isIdentified`: `systems/ghost/entities/lighthouse/prototype.js:5-9`.

# 3 · the dispatch shape

## 3.1 · one repl per terminal; `commands` is a GETTER

```js
// systems/ghost/subjects/terminal/repl.js:34
  get commands() {
    return steer.trie.sieve(new Vector().graft(
      commands.system.anima,
      …
      ...(this.terminal.client.app === null ? [] : [
        commands.surface.filter,
        …
        commands.surface.telemetry,
        …
      ]),
      ...fromm.modes(this.terminal.client.modes).flat.map((mode) => mode.repl),
      commands.content.activity,
      …
      ...(is.object(this.terminal.mode) ? [this.terminal.mode.repl] : []),
    ), (pattern) => pattern.rank !== "void");
  }
```

- the order IS the precedence: system → surface (only with an App) → local modes → content → the seated mode; later wins: `systems/ghost/subjects/terminal/repl.js:35-70`.
- `/quit` only on a tty: `repl.js:40`.

```js
// systems/ghost/subjects/terminal/repl.js:73
  dispatch(typed) {
    const signal = new ReplSignal(typed);
    const replDie = {
      signal,
      client: this.terminal.client,
      runtime: this.terminal.client.runtime,
      terminal: this.terminal,
      controller: this.terminal.controller.branch(signal.pathname),
      repl: this,
      output: undefined,
    };
    return steer.dispatch.execute(execution, replDie).then(() => replDie.output);
  }
```

- every signal gets its own span `terminal/<id>/<pathname>`; `answered` logs a non-undefined output as an outline: `repl.js:7-11`.
- a bare line (no `/`) becomes nature `*`: `subsystems/typology/prototypes/replsignal.js:6`; `*` is the turn command → `belt.harness.stream`: `systems/ghost/gestalten/commands/content/turn.js:4-11`.
- the palette: `narrow` · `submit`, both reset `bridge.$draft` · `$selected`: `repl.js:87-105`.
- `/repl` fills `$catalog` from `shard.keymap.catalog(commands)`: `systems/ghost/gestalten/commands/system/repl.js:9-15`.
- a `rank: "hidden"` command stays out of the catalog: `systems/ghost/gestalten/shard/keymap.js:34`.

## 3.2 · commands — files are OBJECTS, three folders

```text
systems/ghost/gestalten/commands/
├── system/   anima doctor help leader lighthouse quit repl runtime set
├── surface/  cell dock filter focus font frame popover sidebar telemetry theme widget
└── content/  activity buffer detach dictate harness mode terminal thread turn
```

A command is a Vector leaf: `nature` · `valence` · `input` · `chord` · `rank`, body `(ctx)`.

```js
// systems/ghost/gestalten/commands/surface/sidebar.js:22
  .open(
    { nature: "/sidebar/toggle", rank: "hidden", valence: "the sidebar flipped — …",
      chord: "leader/d/b" },
    (ctx) => shown(ctx, !ctx.client.app.bridge.sidebar.open),
  )
```

## 3.3 · keys — the legend walks presses over a keymap GETTER

```js
// systems/ghost/subjects/terminal/legend.js:38
  get keymap() {
    return new Vector().graft(
      keymap.fromRepl(this.terminal.repl.commands),
      ...(this.terminal.client.app === null ? [] : [app.keymap]),
      ...fromm.modes(this.terminal.client.modes).flat.map((mode) => mode.keymap),
      ...(is.object(this.terminal.mode) ? [this.terminal.mode.keymap] : []),
      ...(this.terminal.repl.catalog === null ? [] : [app.closing, app.selecting]),
    );
  }
```

- `fromRepl` turns every command's `chord` into a key leaf whose effect is the command's signal: `systems/ghost/gestalten/shard/keymap.js:7-10`.
- `dispatch(event)` only enqueues; the leader is `ctrl-v` (`meta-v` in a non-apple browser): `legend.js:26-36` · `:48-50`.
- `traverse`: effect → flush + run · dead end → flush · prefix → `$chord` = the stripped node: `legend.js:52-59`.
- a string effect becomes `ctx.output` and is re-dispatched as a repl signal: `legend.js:61-66` + `subsystems/typology/gestalten/steer/strategy.js:13-17`.
- the leader's six groups `e a h d s w`: `systems/ghost/subjects/app/keymap.js:4-10`.
- anima binds `keydown` inside the shown terminal's keyed `Show`: `systems/anima/src/surfaces/chrome/layout.jsx:138-142`; tty: `useKeyboard`, `systems/ghost/surfaces/chrome/layout.jsx:106`.

## 3.4 · how a panel sends a signal — `sent`

Each panel inlines the same one-liner; a fault lands on the terminal's span (so in the logger):

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:260
  const sent = (signal) => terminal.repl.dispatch(signal)
    .catch((error) => terminal.controller.stdout.fault(error));
```

- the same line: `panels/dock/textarea.jsx:59` · `panels/dock/journal.jsx:240`; inline at `panels/headline/headline.jsx:20` · `panels/sidebar/sidebar.jsx:49` · `layout.jsx:33-37`.
- `systems/anima/src/surfaces/chrome/send.js:1` exports the same as `send(terminal, signal)`; grep shows ZERO importers.
- a part never dispatches: it calls `onLine(signal)` and the panel passes `sent` (e.g. `telemetry.jsx:273` · `:361`).
- a palette key goes through the legend, never the repl: `terminal.legend.dispatch("leader")` at `panels/modeline/modeline.jsx:22-23` · `panels/sidebar/sidebar.jsx:28-29`.

# 4 · the surface

## 4.1 · ambient — two slots, ghost-owned

```js
// systems/ghost/gestalten/ambient.js:3
export const ambient = (key, schema) => {
  const slot = createContext();
  const consume = () => {
    const value = useContext(slot);
    if (value === undefined) throw new Error(`[ambient] ${key}: consumed outside its Provider`);
    return value;
  };
  return { key, schema, Provider: slot.Provider, consume, Consumer: … };
};
```

- anima declares `app` and `terminal`: `systems/anima/src/surfaces/chrome/ambient/index.js:4-5`; tty, the same two: `systems/ghost/surfaces/chrome/ambient/index.js:4-5`.
- `app` is provided at mount (`mount.jsx:27`), `terminal` inside the keyed `Show` (`layout.jsx:144`).

## 4.2 · the cover — a `[[predicate, Pane]]` table

```js
// systems/anima/src/surfaces/chrome/panels/cover/cover.jsx:14
export const COVERS = [
  [(app) => !app.client.runtime.lighthouse.isAuthorized && settled(app.client.runtime.lighthouse),
    Signin],
  [(app) => !app.client.runtime.lighthouse.isAuthorized ||
      app.client.runtime.entities.terminal.$entities.get().length === 0,
    Booting],
  [() => true, Layout],
];
```

- `Cover` sets `data-theme` on `<html>` and the root font size from `FONTS[bridge.font]`: `cover.jsx:48-56`.
- the tty twin, same table: `systems/ghost/surfaces/chrome/mount.jsx:23-29`.

## 4.3 · the layout — `<Show>` IS the lifecycle

```js
// systems/anima/src/surfaces/chrome/layout.jsx:132
export function Layout() {
  const app = ambient.app.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const id = from(app.bridge.$terminal);
  const shown = () => terminals().find((terminal) => terminal.id === id()) ?? terminals()[0];
  return (
    <Show when={shown()} keyed fallback={<Booting />}>
```

`Seated` stacks the regions; the telemetry window is the last one:

```text
Seated                              systems/anima/src/surfaces/chrome/layout.jsx:88
├── Headline                        (not narrow)               :103-105
├── .body
│   ├── Sidebar + Sbseam            (sidebar.open | pane)      :107-112
│   └── Split                       :27-51
│       ├── Frame                   (dock.view ≠ full)
│       ├── Seam                    (docked)
│       └── Dock                    (dock.view ≠ closed)
├── Panel = Legend + Repl           (hidden unless $chord | $catalog) :76-86
├── Modeline                        :118
├── [data-r=widget]   Widget        :119-121
├── [data-r=popover]  Popover       :122-124
└── [data-r=telemetry] Telemetry    :125-127
```

- `layout({dock})` maps `dock.view` to `floating · frame · dock · both`: `layout.jsx:18-23`.
- the dock divider dispatches `/split <share>`: `layout.jsx:33-37`.
- the sidebar seam writes `bridge.$sidebar` directly during the drag: `layout.jsx:55-74`.

## 4.4 · panels — the barrel

```js
// systems/anima/src/surfaces/chrome/panels/index.js:1
export * as authentication from "./authentication/signin.jsx";
export * as booting from "./booting/booting.jsx";
export * as cover from "./cover/cover.jsx";
export * as dock from "./dock/dock.jsx";
…
export * as telemetry from "./telemetry/telemetry.jsx";
export * as trees from "./telemetry/trees.js";
```

16 entries, `systems/anima/src/surfaces/chrome/panels/index.js:1-16`. The layout imports panels by path, not via this barrel (`layout.jsx:5-14`).

## 4.5 · drapes parts — props in, `on*` out

```js
// subsystems/drapes/parts.js:39
export { Tele, TABS as TELE_TABS, placed } from "./Tele.jsx";
export { Logger, TONES as LOGGER_TONES, ms, tone } from "./Logger.jsx";
export { Inspector, KINDS as INSPECTOR_KINDS, grouped, setting, stepped } from "./Inspector.jsx";
export { Tree } from "./Tree.jsx";
```

- `@vivalence/drapes/parts` → `parts.js`, 43 export rows: `subsystems/drapes/deno.jsonc:6` · `subsystems/drapes/parts.js:1-43`.
- `grep -lw client subsystems/drapes/*.jsx` → 0; `grep ambient subsystems/drapes/*.jsx` → 0. A part takes plain data and callbacks; ambient is consumed by the CLIENT's panels only.
- `listing(store)` reads a Solid accessor to an array, `[]` when absent: `subsystems/drapes/hold.js:48`.
- a part writes a signal string and hands it up, never dispatches:

```js
// subsystems/drapes/Inspector.jsx:18
export const setting = (row, value) => `/set ${row.path} ${value}`;
```

- the inspector's row kinds `ro enum bool num text set act`: `subsystems/drapes/Inspector.jsx:22-123`; unknown kind THROWS: `:125-128`.
- `Tele` clamps its frame to the viewport (`FLOOR 320×200`, `GUTTER 4`): `subsystems/drapes/Tele.jsx:4-14`; it sits in zone `3`: `Tele.jsx:43`.
- CSS lives in `@vivalence/drapes/parts.css`, imported once at `systems/anima/src/surfaces/chrome/mount.jsx:4`.

## 4.6 · persistence — `persistentAtom("viva.<subject>.<field>")`

| key | file:line |
|---|---|
| `viva.bridge.terminal` | `systems/ghost/subjects/app/prototypes/bridge.js:5` |
| `viva.bridge.theme` | `systems/ghost/subjects/app/prototypes/bridge.js:13` |
| `viva.bridge.font` | `systems/ghost/subjects/app/prototypes/bridge.js:14` |
| `viva.telemetry.state` | `systems/ghost/subjects/app/prototypes/telemetry.js:4-8` |
| `viva.mode.<slug>` | `subsystems/drapes/context/preferences.js:4` |

Everything else on the Bridge is session-only (`atom`). Terminal dock and thread settings persist on the RUNTIME through repository writes (§5.4), not in local storage.

# 5 · the telemetry panel in all this

## 5.1 · where it sits

- mounted inside `Seated`, so only with a shown terminal and past sign-in: `systems/anima/src/surfaces/chrome/layout.jsx:125-127`.
- opens on `telemetry.state.open`: `systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:369`.
- a floating window, `x y width height` in px, default `WINDOW = {x: 0, y: 48, width: 600, height: 420}`: `telemetry.jsx:17`.
- two tabs `logger` · `inspector`: `subsystems/drapes/Tele.jsx:4`; the panel maps them via `TABS`: `telemetry.jsx:366`.

## 5.2 · the commands that drive it

```js
// systems/ghost/gestalten/commands/surface/telemetry.js:17
const SHOWN = [
  [(view) => view === undefined, (held) => ({ ...held, open: !held.open })],
  [(view) => view === "off", (held) => ({ ...held, open: false })],
  [() => true, (held, view) => ({ ...held, open: true, view })],
];
```

| signal | input | chord | file:line |
|---|---|---|---|
| `/telemetry` | `logger · inspector · off · ∅` | `leader/s/t` | `commands/surface/telemetry.js:24-32` |
| `/inspector` | `client · runtime · lighthouse · terminal · thread · buffers · activities · telemetry · modes · harness` | — | `commands/surface/telemetry.js:33-44` |
| `/telemetry/clear` | — | — | `commands/surface/telemetry.js:45-50` |
| `/set <path> <value>` | 11 paths | — | `commands/system/set.js:66-74` |
| `/pause · /resume · /stop · /abort` | — | `leader/a/{p,c,s,k}` | `commands/content/activity.js:10-22` |

- `/telemetry/clear` only moves `since`; records stay in the span: `commands/surface/telemetry.js:47-48`.
- `/set` paths: `terminal.dock.{view,align,lens,share,markdown}` · `thread.{label,tier,effort,rounds}` → repository `updateOne` with `traits.patch`: `commands/system/set.js:6-44`.
- `/set` adds `bridge.sidebar` · `bridge.hidden` only with an App: `commands/system/set.js:46-62`.
- an unknown path THROWS, listing the writable ones: `commands/system/set.js:60`.

## 5.3 · the logger — a fold over span records + activities

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:31
export const story = (records, prefix, clock) => {
  const nodes = new Map();
  const roots = [];
  for (const record of records) {
    const id = `${prefix}${trace.key(record.path)}`;
    …
    MARKS.find(([test]) => test(record))[1](node, record);
```

- input: `app.telemetry.$logger` filtered to `TRACKS`: `telemetry.jsx:11` · `:243`.
- activities become nodes from their `steps`: `enacted`, `telemetry.jsx:61-80`.
- filters `all activity repl net faults`: `telemetry.jsx:14` · `:87`; at most `LIMIT = 180` rows: `:15` · `:92`.
- detail of a selected activity carries its four signal buttons → `/pause` … `/abort`: `telemetry.jsx:144-147`.

## 5.4 · the inspector — tables by hand, trees by fold

`inspect(...)` returns 8 hand-written tables, one per `point`:

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:186
    {
      id: "terminal",
      title: "terminal",
      meta: terminal.dock.view,
      rows: [
        ro("terminal", `${terminals.indexOf(terminal) + 1} of ${terminals.length}`),
        writable("view", "terminal.dock.view", terminal.dock.view, VIEWS),
        writable("align", "terminal.dock.align", terminal.dock.align, SIDES),
        …
        act("new terminal", "/terminal/new", false, ""),
        act("close terminal", "/terminal/close", terminals.length < 2, "neg"),
      ],
    },
```

- the 8 table ids: `client runtime lighthouse terminal thread buffers activities telemetry`: `telemetry.jsx:171-237`.
- a writable cell's kind is chosen by a `[[predicate, row]]` table over the value: `telemetry.jsx:155-167`.
- two TREES, `modes` and `harness`, built in `trees.js`: `telemetry.jsx:303-320`.
- `trees.modes` = runtime + each daemon + the client's local modes, each with `manifest · aperture · repl · keymap · harness`: `panels/telemetry/trees.js` (`moded`, `hosted`, `modes`).
- `trees.harnesses` = per HARNESSED mode: `tools · primer · references`, plus the terminal's repl as tools when LOOPING: `panels/telemetry/trees.js` (`harnesses`).
- tree acts `signal · copy · peek`; `peek` reads `/metadata/harness/primer/<path>` for the seated thread: `telemetry.jsx:337-346`.

The panel reads 15 stores (`telemetry.jsx:242-257`):

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:242
  const telemetry = from(app.telemetry.$state);
  const records = from(computed(app.telemetry.$logger, (held) => …));
  const activities = from(app.client.runtime.entities.activity.$entities);
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const status = from(app.client.runtime.$status);
  const user = from(app.client.runtime.lighthouse.$user);
  const standing = from(app.client.runtime.lighthouse.$status);
  const thread = from(terminal.$thread);
  const seated = from(terminal.$buffer);
  const turns = from(typology.atom.chain(terminal.$thread, "$turns"));
  const buffers = from(typology.atom.chain(terminal.$thread, "$buffers"));
  …
```

## 5.5 · how the panel writes — two paths

```js
// systems/anima/src/surfaces/chrome/panels/telemetry/telemetry.jsx:259
  const patch = (delta) => app.telemetry.$state.set({ ...app.telemetry.state, ...delta });
  const sent = (signal) => terminal.repl.dispatch(signal)
    .catch((error) => terminal.controller.stdout.fault(error));
```

| gesture | path | file:line |
|---|---|---|
| tab | `patch` | `telemetry.jsx:375` |
| close | `sent("/telemetry off")` | `telemetry.jsx:376` |
| move · resize | `patch` | `telemetry.jsx:377` |
| filter · select · fold | `patch` | `telemetry.jsx:270-272` |
| point · pick · query | `patch` | `telemetry.jsx:352-359` |
| a writable cell | `sent("/set …")` | `telemetry.jsx:361` |
| an act | `sent(signal)` | `telemetry.jsx:343` |

# 6 · ghost tty vs anima — what is twinned

Shared CODE (ghost): App · Bridge · Telemetry · Box · Client · Terminal · Repl · Legend · Stall · entities · commands · keymap · ambient. Shared FOLDER NAMES, separate code: `surfaces/chrome/{mount,layout,ambient,panels,widgets}`.

| chrome piece | anima | tty |
|---|---|---|
| entry | `systems/anima/src/client.js:39-53` | `systems/ghost/subjects/shell/commands/chrome.js:13-19` |
| `surface.bundle` | `bytes: 0` (`src/surfaces/index.js:5`) | esbuild → `bundle/app.mjs` (`surfaces/chrome/bundle.js:37`) |
| `mount` | Solid `render` (`mount.jsx:39`) | opentui `_render` (`surfaces/chrome/mount.jsx:77`) |
| cover table | `cover.jsx:14` | `surfaces/chrome/mount.jsx:23` |
| key binding | `keydown` (`layout.jsx:140`) | `useKeyboard` (`surfaces/chrome/layout.jsx:106`) |
| zones | dapper CSS `[data-zone]` | `ZONES` → `tokens.camel` (`surfaces/chrome/mount.jsx:9-16`) |
| telemetry panel | 382 rows (`panels/telemetry/telemetry.jsx`) | 15 rows, a swatch (`panels/telemetry/telemetry.jsx:5-14`) |

The tty telemetry panel paints only a labeled box at `telemetry.window`:

```js
// systems/ghost/surfaces/chrome/panels/telemetry/telemetry.jsx:5
export function Telemetry(props) {
  const telemetry = from(ambient.app.consume().telemetry.$state);
  return (
    <widgets.swatch.Swatch
      name="telemetry"
      …
      style={{ position: "absolute", left: telemetry().window.x, top: telemetry().window.y, … }}
    />
  );
}
```

- tty panel set: `authentication booting dock frame headline legend modeline repl sidebar telemetry` (10): `systems/ghost/surfaces/chrome/panels/index.js:1-10`; anima adds `cover` and splits `journal · textarea · view · sections · trees` (16).
- tty wraps every panel in an `ErrorBoundary` that faults to the terminal span: `systems/ghost/surfaces/chrome/layout.jsx:27-44`; anima has none.
- the legend/repl twin: tty shows ONE of legend or repl (`surfaces/chrome/layout.jsx:138-140`); anima shows both inside `Panel`, hidden together (`layout.jsx:76-86`).
- `/telemetry`, `/inspector`, `/set` are the same commands on both (`repl.js:42-54`); only anima paints the inspector.

# 7 · what an inspector rework touches

- STATE: `viva.telemetry.state` (`systems/ghost/subjects/app/prototypes/telemetry.js:4`) + anima's seed (`mount.jsx:60-69`).
- COMMANDS: `systems/ghost/gestalten/commands/surface/telemetry.js` · `systems/ghost/gestalten/commands/system/set.js`.
- PANEL: `systems/anima/src/surfaces/chrome/panels/telemetry/{telemetry.jsx,trees.js}`.
- PARTS: `subsystems/drapes/{Tele,Logger,Inspector,Tree}.jsx` + `parts.css`.
- TTY TWIN: `systems/ghost/surfaces/chrome/panels/telemetry/telemetry.jsx` (a stub today).
- SOURCES: span history (`span.js:30`), the Dataspace stores (§1.7), host `metadata` (`host.js:31-37`), mode `metadata.harness` (`harnessed.js:30`).

# 8 · facts the tree shows that a designer should not miss

- **the window's units differ per surface.** The ghost default is columns (`{x:0, y:3, width:77, height:23}`, `telemetry.js:6`); anima seeds px `WINDOW` ONLY when `point` is absent (`mount.jsx:60-62`). Both persist under the one key `viva.telemetry.state`.
- **`since` · `selection` · `peeks` reset on every anima mount** (`mount.jsx:66-68`); the span history is in memory, so a reload starts the logger empty anyway.
- **most inspector gestures bypass the repl**: tab, move, filter, select, fold, point, pick, query write `$state` directly (§5.5). Only close, `/set` cells and acts dispatch.
- **the `net` filter has no visible source on the client wire.** `shard.track.request()` records only when `ctx.span` exists (`subsystems/typology/gestalten/shard/track.js:28-33`); `Connection.request` builds `ctx = {request, response, state}` with no span (`subsystems/typology/prototypes/connection.js:66-70`). By read, not probed live.
- **`/inspector` has no chord**; `/telemetry` is `leader/s/t` (`commands/surface/telemetry.js:25` · `:33-37`).
- **`/telemetry` and `/telemetry/clear` are `rank: "hidden"`** → absent from the repl catalog (`shard/keymap.js:34`); `/inspector` is listed.
- **`send.js` is dead**: `systems/anima/src/surfaces/chrome/send.js:1`, zero importers; every panel inlines `sent`.
