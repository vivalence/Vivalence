# release
<!-- writer: agent · kind: ledger · limit: 60000 chars — the interface changelog; quests feed it, a tag cuts it (skill quest) -->

## unreleased

### client

- changed drapes `<Asset>` — prop `file`, a File row (`mime` · `url`); was `asset` (`type`) · migrate: `<Asset file={row}>` ⟨m113⟩
- fixed assembly's 4 views · education's 4 games in anima — routes via `buffer.mode.connection`, files via the client's File rows ⟨m113⟩
- removed the `/face` · `/design` repl commands (drafted, never shipped) · migrate: none ⟨m95⟩
- changed `@vivalence/drapes/dom` — `mount[pane](client)` over ghost's `Client`, the surface `emit`s into the dock; no boot pane; `data-bearer` → `data-daemon` · migrate: none ⟨10-13⟩

- added themes `porcelain` · `datasette`; `parchment` re-tuned to the designer's values · migrate: none ⟨m73⟩
- renamed themes `nordic` → `northsea` · `paper` → `parchment` — a saved unknown theme name resolves to the default · migrate: a saved `nordic` / `paper` boots the default; pick the theme again ⟨m72⟩
- renamed the browser client `kajuit` → `anima` — directory `systems/anima`, package `@vivalence/anima`, client slug `anima` (`viva instance/run anima`, lock `<instance>_anima.lock`), tasks `anima/*`, image `vivalence/anima:alpine`, CI job `deploy-anima` · migrate: rename `VIVA_CLIENT_KAJUIT_*` · `PUBLIC_VIVA_CLIENT_KAJUIT_REMOTE` → `*_ANIMA_*` in every instance `.env` and in prod, `slug: "kajuit"` → `"anima"` in every instance kernel, and point the prod deploy at the new image ⟨m58-M3⟩

### cli

- fixed `viva chrome` — waits for a booting runtime (`/status` IDLE), never spawns a twin; a spawned one's `start · stop · fault` print as `[runtime] <elapsed> /daemon/<slug> start` · migrate: none ⟨m114⟩
- renamed `/buffer/artifact <n> [name]` → `/frame/set <slug>`, chord `leader/e/a` kept · migrate: a slug, not an index ⟨m111⟩
- added `/cell/set <slug> <name>` ⟨m111⟩
- added `/set terminal.dock.markdown pretty|plain` ⟨m111⟩

- changed `/terminal/close` — closing the last terminal hands a fresh one, from the runtime · migrate: none ⟨m107⟩
- changed `/sidebar` · `/terminal` · `/terminal/new` · `/terminal/close` · `/telemetry` · `/telemetry/clear` · the `leader` keymap — present only with the chrome; a headless repl has none · migrate: none ⟨m107⟩
- removed `/shell` — the cockpit · footer toggle is gone; a shell is `viva <command>` · migrate: none ⟨m107⟩
- renamed `/set surface.sidebar` · `/set surface.hidden` → `/set bridge.sidebar` · `/set bridge.hidden`, present only under the chrome · migrate: type the new path ⟨m107⟩
- removed `viva repl` · `/chrome/on` · `/chrome/off` — bare `viva` opens chrome · migrate: `viva repl` → `viva` ⟨m102 · m98 Q6 Q7⟩
- moved `/shell` · `/quit` — client commands, listed only on a tty; anima's palette lists neither, a tab ends on close · migrate: none ⟨m102 · m104 Q2⟩

- added `ctrl-v ctrl-v` — the `catalog`, every command of the active repl (was m92's "palette") · migrate: none ⟨m95⟩
- added `ctrl-v <key>` — the client's leader on a tty (`leader` in a keymap; the DOM picks the non-paste modifier); `esc` drops a held chord ⟨m92⟩
- renamed the repl's `/mode` → `/modes` · migrate: type `modes` ⟨m86⟩
- removed `--buffer` on every verb; bare `viva` in a pipe without `--json` exits 1 naming `--json`; `viva help` is the listing · migrate: `viva` → `viva help` in scripts ⟨m86⟩
- removed `viva instance/*` · `instances/*` · `ledger/*` · `registry/*` · `variant/*` · `client/repl` — the shell answers `help · chrome · instance/tail` alone (`systems/ghost/subjects/shell/`) · migrate: none, no verb replaces them ⟨consolidated 10-24⟩
- changed every `--flag` that carries a value — given bare it exits 1 with the shape and a `try:` line for the nature you typed (`--instance needs a value: --instance=<slug|path>` · `try: viva instance/run --instance=vivalence`); a bare flag is legal only where the shell or the nature declares a boolean (`--json`, `--use`, `instance/use --ledger`) · migrate: `--instance x` (a space) never worked — it was a stray positional; write `--instance=x` ⟨flags-declare-themselves⟩
- changed `viva help` — the flags row derives from the declarations: `--instance=<slug|path>` (was `<path>`), `--verbose` listed; an exact nature also prints the flags every nature carries; `instance/create --slug=<slug>` and `instances/tap --slug=<slug>` show as flags (they were read, never declared) · migrate: none ⟨flags-declare-themselves⟩

### route

- changed `/status` — answers from beat 4, `IDLE` while booting; was refused until ready · migrate: ready = `code === "RUNNING"`, not an open port ⟨m114⟩
- fixed `/attached/file/:id` · `/attached/view/:id` — an id no row has answers 404 `{ code: "NOT_FOUND" }`; was 500 · migrate: none ⟨known issue `attached-file-missing-answers-500`⟩
- changed `/runtime/<slug>/entities/mode` — lists every host's modes (each daemon's beside the runtime's own; was the runtime's `daemon: null` rows only) · migrate: none ⟨m107 · m109⟩
- added `/runtime/<slug>/entities/daemon` — find · subscribe · the repository routes over the daemon rows, readable as `/entities/mode` · migrate: none ⟨m107⟩
- changed `/emit/<mount>` — `thread` required · migrate: pass `thread` ⟨m105 Q12A⟩
- changed chess `coach/practice` `/turn · /ask` — `thread` input removed, the board's thread answers · migrate: drop `thread` ⟨m105 Q12A⟩
- changed `thread` on memo `/chat` · dealer · oracle `/vision` · aprende · primer · chess practice create · hello `/article` — required · migrate: pass `thread` ⟨m105 Q12B⟩

- changed `/harness/dialogue/*` · `/harness/object/*` request — validated by `v.primitives.harness.Request`; `id` renamed `turn`; `terminal` optional beside `thread` · migrate: rename `id` → `turn` at the three callers that sent one ⟨m88⟩
- added client aperture — a ghost client serves `/terminal/<id>/metadata/repl` and `/terminal/<id>/repl` on its multiplex once a `LOOPING` mode mounts · migrate: none ⟨m88⟩
- added `/attached/view/:id` · `/attached/file/:id`; removed `/attached/bundle` · `/metadata/application` · migrate: clients load by row id ⟨m87⟩
- added `/runtime/<slug>/entities/mode` — the runtime's minted modes read like a daemon's (`find · findOne · subscribe`, the same host beat on both rungs) · migrate: none ⟨m86⟩
- added `/lighthouse/autologin` — grafted only when the lighthouse carries `AUTOLOGIN`; signs the caller in as `lighthouse.trait.AUTOLOGIN.username` (default `localhost`, minted on runtime boot); a client with that trait authorizes without a signin · migrate: none ⟨lighthouse-traits 10-12⟩
- renamed lighthouse trait `OPEN` → `JOINABLE`, `INVITED` → `INVITATIONAL`, `OPERATED` dropped (never read) · migrate: `"traits": ["OPEN"]` → `["JOINABLE"]` in `~/.viva/ledger.viva.json` and every instance recipe — the enum refuses `OPEN` at mount ⟨lighthouse-traits 10-12⟩
- changed `/lighthouse/metadata` — answers the lighthouse manifest `{ type: "lighthouse", slug: "lighthouse", traits }`; `/lighthouse/signup` is ABSENT (404) without `JOINABLE`, no more `CLOSED` 403 · migrate: a client reads `lighthouse.manifest` (was `door`), `lighthouse.access()` (was `enter()`), the loop signal is `/lighthouse/access` ⟨lighthouse-traits 10-12⟩
- added `/lighthouse/metadata` — answers `{ traits }`, the door's word (`["OPEN"]` on the shipped ledgers) · migrate: none ⟨m82⟩
- changed `/lighthouse/signup` — refuses `CLOSED` 403 unless the lighthouse slot carries `OPEN`; a recipe that says no `lighthouse` folds `runtime.secrets.jwt` behind a closed door · migrate: add `"lighthouse": { "secrets": { "jwt": "${SECRET_VIVA_JWT}" }, "traits": ["OPEN"] }` to the ledger recipe ⟨m82⟩
- changed `/attached/bundle/<host>/<mode>/<hash>.<target>.<framework>.mjs` — one artifact per mime entry (was `<hash>.svelte.mjs`); `/metadata/application` answers `bundle: { entries[{ mime, hash, mount, integrity, bytes }] }` · migrate: read `entries`, pick by mime ⟨m82⟩
- removed `/userspace/handshake` · `/auth/enroll` · `/daemons/announce` · `/daemon/<slug>/userspace/*`; added `/lighthouse/{signup,login,verify,refresh,logout}` · `/userspace/entities/*` at the runtime's root · migrate: clients call the runtime's root ⟨m80⟩
- removed the root's `/manifest` · `/metadata/modes` · `/metadata/instance`, each host's `/manifest` (`/runtime/<slug>` · `/daemon/<slug>`) and each mode's `/metadata/manifest` — the root answers `/status` and its own `/metadata/{manifest,aperture,datamap,daemons,services}`; a host's modes are at `<host>/metadata/modes` behind the token; a mode's record is its Mode row (`<host>/entities/mode/findOne`) · migrate: `/manifest` → `/metadata/manifest`; root `/metadata/modes` → `/runtime/<slug>/metadata/modes` with a token ⟨m81 M⟩
- added `POST /runtime/<slug>/mode/<type>/<slug>/…` behind the lighthouse · runtime cargo `/attached/cargo/runtime/<slug>/…` — a runtime mode's seat, its listing, its freight · migrate: none (no client reads a runtime mode yet) ⟨m81 R3 · R6⟩
- changed the runtime's reference `/` → `/runtime/<slug>` (`/runtime/runtime` on the default slug), written by paladin into `instance.runtime.reference` · `url`; `Runtime.slug` · `Runtime.reference` come from the record, never hardcoded · migrate: a hand-built runtime die passes `slug` · `reference` ⟨m81 R6⟩
- added `GET /runtime/<slug>/status` · `POST /runtime/<slug>/batch` · `GET /runtime/<slug>/metadata/{manifest,statics,cargo,datamap,aperture,cortex,modes}` · `GET /runtime/<slug>/mode/<type>/<slug>/metadata/*`, behind the token — the runtime host serves what a daemon serves · migrate: none ⟨m81 C1⟩
- changed `GET /daemon/<slug>/metadata/modes` — each row gains `reference`, absolute; both rungs list `{ type, slug, name, traits, reference, metadata }` · migrate: none ⟨m81 C2⟩
- added `POST /runtime/<slug>/cortex/<type>/{render,stream}` — the runtime's cortex, routed like a daemon's · migrate: none ⟨m81 C4⟩
- changed the runtime host's aperture `/runtime/<slug>/…` — the whole branch takes the token (was: only `/mode`) · migrate: none ⟨m81 C1⟩
- changed `POST /daemon/<slug>/cortex/{render,stream}` with `{ type, tune, request }` → `POST /daemon/<slug>/cortex/<type>/{render,stream}`, body = the request with `tune` beside its keys · migrate: typology `belt.cortex.wire` in the same change ⟨m81 pass⟩
- removed `POST /daemon/<slug>/modes/:type/:method` — 0 callers; a mode's record is `POST /daemon/<slug>/entities/mode/findOne` · migrate: none ⟨m81 pass⟩
- renamed `/metadata/daemons` · `/metadata/services` key `mount` → `reference` · migrate: read `reference` ⟨m74 M2⟩
- changed the runtime's `/status` — answers `{ timestamp, code }` with `code: "RUNNING"`; `label` left it; every process's `/status` is its controller's `Status` · migrate: read `code`, drop `label` ⟨m74 M5⟩
- renamed the runtime's stdout readiness line `Status:ALIVE` → `Status:RUNNING` — `viva instance/run` and `paladin.ledger.boot` wait for it · migrate: a supervisor matching `^Status:ALIVE$` matches `^Status:RUNNING$` ⟨m74 M5⟩
### api

- changed `paladin.ledger.boot` readiness — the `[runtime/<slug>] start` track, was `log { listen }`; added `paladin.stamp` `fold` · `tree` (SHA-256 marks) · migrate: a stub prints `start`; DATASET reinstalls once ⟨m114⟩
- added View traits `FRAME` · `CELL` — a mode's `views` entry may carry `traits`; none is `FRAME` · migrate: none ⟨m111⟩
- added buffer trait `RENDERED { frame, cell }` — the per-place view slug · migrate: none ⟨m111⟩
- removed `buffer.data.artifact` — the pick moves to `trait.RENDERED.frame` · migrate: none ⟨m111⟩

- added `FileRepository.record({ bytes, …row })` · `.rewrite(file, bytes)` · `.sweep(now?)` — hash · integrity · size on the row, the MISSING claim; the disk write is the caller's · migrate: `record(context)(row)` → `context.entities.file.record(row)`, `rewrite(ctx)(file, bytes)` → `paladin.state.store(file.mount, bytes)` + `ctx.entities.file.rewrite(file, bytes)` ⟨m109 Q5 · Q6⟩
- removed `subjects/mode/traits/filesink.js` `mounted · record · receive · rewrite · Received` and `mode.files.receive` — FILESINK opens `/files/receive` and exports nothing else · migrate: call the route, or `entities.file.record` ⟨m109 Q5⟩
- removed `lifecycle.runtime.patrol` (`sweep` · `files`) — the one `integration.patrol` beat logs `{ service, daemon, files }` once a minute · migrate: `patrol.sweep(context)` → `entities.file.sweep()` inside a datamap scope ⟨m109 Q6⟩
- changed `ghost.client.factory(surface)(die)` → `ghost.client.factory(die)`, hands back the Client RUNNING · migrate: anima's entry, m108 ⟨m107⟩
- removed `Client.surface` · `Client.$terminal` · `Client.terminal` · `Client.theme` → `client.app` (`ghost.app.App`: surface · box · bridge · telemetry · `theme`; `bridge.terminal` the pick) · migrate: anima, m108 ⟨m107⟩
- removed `ghost.terminal.factory` · the terminal's lifecycle → the controller cast at hydration, `terminal.stall.watch()` · migrate: none ⟨m107⟩
- moved `ghost.client.keymap` → `ghost.app.keymap` · migrate: none ⟨m107⟩
- added `Dataspace.subscribe()` (typology) — finds every declared entity in order, subscribes each, returns the off · migrate: none ⟨m107⟩
- added `terminal.stall` — the terminal's Stall: `$buffers · $buffer · $phase`, `refill()`, `toJSON()`; `phases` dispatched on `/<thread.phase>`, `manual` only · migrate: none ⟨m105 Q6K⟩
- changed `thread.$buffers` — sorted by `index`, oldest first · migrate: none ⟨m105 Q6K⟩
- added `thread.$phase` — a store over `thread.phase` · migrate: none ⟨m105 Q6K⟩
- changed `buffer.release()` — the client removes the buffer on the runtime · migrate: none ⟨m105 Q6E⟩
- changed `v.<entity>.trait(entity, NAME)` — removed; a trait is read straight, `entity.trait.NAME`, cast once at the door · migrate: rewrite each call ⟨m105 Q4′⟩
- changed `entity.trait` — holds every vocabulary name filled from its defaults; `traits` alone says what is active · migrate: test `traits.includes(NAME)`, never key presence ⟨m105 Q9 · Q10⟩
- added `client.telemetry` — `.$logger` over the client span · migrate: none ⟨m105 Q0′⟩
- changed `mode.harness.{dialogue,object}.{render,stream}` — `thread` required; a call without one throws `NotFoundError` · migrate: pass the thread the caller holds ⟨m105 Q12B⟩
- renamed `client.active` → `client.terminal` · `client.$active` → `client.$terminal` · migrate: the same read, the new name (chess `play.viva.js:39,41`) ⟨m99 r1⟩
- added `Legend` on every terminal (`terminal.legend`, `@vivalence/ghost` `terminal.Legend`) — `dispatch(event)` · `translation` (a getter) · `keymap` · `presses` · `$chord` · `flush()` · migrate: a surface calls `client.terminal.legend.dispatch(event)` with the raw event ⟨m104 Q0 · m99⟩
- removed `client.presses` · `client.$chord` · `client.chord` · `client.keymap` · `client.$catalog` · `client.catalog` — on the terminal: `terminal.legend.presses` · `.$chord` · `.chord` · `.keymap`; `terminal.repl.$catalog` · `.catalog`; `chord` is the held node's `shape.strip` · migrate: `client.terminal.legend.*` · `client.terminal.repl.$catalog` ⟨m104 Q0 · Q1 · Q3⟩
- changed `terminal.repl.commands` — a getter built at every read (the client's · `/shell` `/quit` on a tty · hosted modes' · the terminal's · the attached mode's); no boot beat, no rebuild on the mode list, nothing assignable · migrate: a rig defines the property (`Object.defineProperty(terminal.repl, "commands", …)`) ⟨m104 Q0 · Q2⟩
- removed `terminal.keymap` · `$keymap` — `terminal.legend.keymap`, a getter: the harvest of `repl.commands`, the client's keymap, the hosted modes', the attached mode's ⟨m104 Q1 · Q2⟩
- removed the repl's `/mode/<type>/<slug>/…` · `/mode/<slug>/…` scopes — the attached mode's commands answer at the root (`/harness ciao`) · migrate: `/mode/memo/harness ciao` → attach memo, `/harness ciao` ⟨m104 Q5⟩
- removed the client's `keymap` boot beat · `subjects/client/lifecycle` `keymap` · the terminal's `commands` beat ⟨m104 Q0 · Q2⟩
- added `paladin.is.browser` · `paladin.is.apple` — the runtime is a browser · the OS is macOS or iOS (`@cross/runtime`) · migrate: none ⟨m104 Q6⟩
- changed the leader key — `meta-v` in a browser off Apple, `ctrl-v` everywhere else, opened by `terminal.legend.translation` (a getter); no surface passes keys · migrate: none ⟨m104 Q6⟩
- changed `keypresses(renderer, client)` · anima `keypresses(window, client)` — forward each press to `client.terminal.legend` ⟨m104 Q4⟩
- moved the client keymap's `harvest` · `catalog` → `shard.keymap.fromRepl` · `shard.keymap.catalog`; removed `navigate` · `navigating` · `listing` · `palette` (a keymap local, `palette(terminal, prefill)`) · migrate: the palette is `legend.dispatch("leader")` twice ⟨m99 · m104 Q3⟩
- changed `KeySignal` — takes an opentui `ParsedKey` or a DOM `KeyboardEvent`; the nature carries the modifiers, W3C `ctrl alt shift meta` in that order, a printable its character · migrate: `new KeySignal(event).nature` replaces `press(event).key` ⟨m99⟩
- changed typology: `Queue.backlog` a getter over `$backlog` · `shape.strip` gives a group edge `meta` · `Vector.graft` merges two patterns for one key · `steer.match.scope` asks `*` last · a pattern filter answers a copy · migrate: none ⟨m99⟩
- renamed sheets `Chord` → `Legend` (props `legend` · `palette`) · drapes `Chord` → `Legend` · migrate: `parts.Legend` ⟨m99⟩
- removed `client.dispatch` · `terminal.dispatch` — a line runs on `terminal.repl.dispatch(line)` · migrate: `client.terminal.repl.dispatch(line)` ⟨m102⟩
- changed `ctx.repl` — the terminal's Repl; its Vector is `ctx.repl.commands` · migrate: `shape.strip(ctx.repl)` → `shape.strip(ctx.repl.commands)` ⟨m102⟩
- removed `client.repl` · the door's `repl` ctx key ⟨m102⟩
- added `paladin.is.tty` — Deno and a terminal stdin · migrate: none ⟨m102⟩
- changed `host` — `import { host } from "@vivalence/ghost/host"`, the one subpath; ghost's root no longer carries it, sheets' root does · migrate: `@vivalence/sheets/host` · `{ host } from "@vivalence/ghost"` → `@vivalence/ghost/host` ⟨m102 · m105⟩

- changed `shard.serve.multiplex(vector)` → `multiplex(vector, trace)` — each socket's span is a child of `trace`; its `request · response` records climb to the owner (the runtime: `[runtime/runtime › socket › …]`) · migrate: none, a socket without `trace` stays a root ⟨m101⟩
- changed `span.*` — `mark(name, data)` · `open() close() note() message()` → one method per track: `start() stop() request() response() fault() log() entity()` + `tracks(more)`; an unknown name throws · migrate: rename at each call ⟨m101⟩
- changed `record.at` — process-relative ms → epoch ms · migrate: drop `timeOrigin +` ⟨m101⟩
- removed `MACHINE.verbs · transitions · signals` · `Verb` — the controller moves its own status · migrate: status handlers ⟨m101⟩
- changed buffer component call — `module.default(target, {terminal, daemon, mode, thread, buffer})` → `module.default(target, { terminal, buffer, surface })` · migrate: read `props.terminal.*` · `props.surface.place` ⟨m95⟩
- changed `DOCKED` payload — `{side, share, collapsed, full}` → `{align, share, view}`; resolution terminal → user → client → default · migrate: none (no writer outside anima) ⟨m95⟩
- changed `@vivalence/ghost` — the barrel is browser-clean; `shell` under `./run` · migrate: `import { shell } from "@vivalence/ghost/run"` ⟨m95⟩
- added `@vivalence/paladin` in a browser (`mod.client.js`, baked at build) · `paladin.vault` (`held · store` by origin) · migrate: none ⟨m95⟩
- added `@vivalence/sheets` — thirteen OpenTUI parts · migrate: none ⟨m95⟩
- added `LOOPING` (mode trait, runtime + ghost) — a terminal's whole repl becomes the harness's tools under `repl_…`, called back over the terminal's own socket · migrate: none ⟨m88⟩
- changed mode export `application = new App(sources, schema)` → `buffer = v.buffer(…)` + `views = [{slug, mount, mime}]`; trait `APPLICATION` → `VIEWABLE` · migrate: re-declare each mode ⟨m87⟩
- changed generative tools `generator_view_*` → `buffer_create · buffer_update · view_create · update · read · list` · migrate: none ⟨m87⟩
- renamed `FRAUGHT` → `FILESET` · `MOUNTED` → `FILESINK` · `mode.freight` → `mode.files` · migrate: re-declare traits ⟨m87⟩
- renamed client buffer hooks `mount · unmount` → `attach · detach` · migrate: none outside ghost · anima ⟨m87⟩
- changed `ctx.hallucination.system` → `ctx.hallucination.primer`, a `Primer`; the request still carries `system`, the loaded record · migrate: `ctx.hallucination.system.<k> = s` → `ctx.hallucination.primer.open("<k>", s)` ⟨m83⟩
- renamed the choice round's `primer` → `system` (`hallucinate.choice({ system, questions })`) · migrate: rename the key ⟨m83⟩
- added `PRIMER` · `primer_read` — a mode exports `primer`; lazy nodes listed in an index, read on demand; an AGENTIC mode lists its siblings' · migrate: none ⟨m83⟩
- added `paladin.prime.directory(path)` — a directory of `.md` as a `Primer`, frontmatter sniffed per file (Agent Skills or ours) · migrate: none ⟨m83⟩
- changed `Path` — reads `file://` (`new Path(import.meta.url)`) and `..` · migrate: none ⟨m83⟩
- added `KEYMAPPED` ghost mode trait, export `keymap` — a hosted mode's module or a runtime mode's view module; function effects over `ctx.mode` ⟨m92⟩
- changed `steer.dispatch.walk` — a consumed signal is spent; `more()` runs once per node (was: re-matched) · migrate: none ⟨m92⟩
- changed `steer.strategy.fire` — a non-function effect is returned as the output · migrate: none ⟨m92⟩
- added `belt.monad.kleisli` · `belt.monad.traverse` · `shape.monad` (`idle` · `dispatch` · `controlled` · `execute` · `ready`) · migrate: none ⟨m93⟩
- added `factories` on `@vivalence/runtime` (runtime · lighthouse · daemon · service · mode) and on `@vivalence/ghost` (+ terminal · thread · mode · daemon · runtime) · migrate: none ⟨m93⟩
- changed `gestalten.belt.modes.resolve(context, factory, traits)` — takes the mode's factory, not its execution · migrate: pass `factories.mode` ⟨m93⟩
- renamed `runtime.traits.<NAME>` → `traits.mode.<NAME>` · `paladin.lifecycle.mount` → `paladin.factories.instance` · `skills` → `tools` (`paladin.tools` · `gestalten.tools` · `@vivalence/paladin/tools`) · `<system>.lifecycle.<subject>.aperture` → `.integration` · `ghost.<subject>` → `ghost.lifecycle.<subject>` · `traits` · `commands` · `factories.client` · `entities.{activity,buffer,turn}` · migrate: rename the read ⟨m91⟩
- removed `mount · populate · resolve · integrate · belt · prototypes` (`@vivalence/paladin/typology`) — `factories.instance` · `lifecycle.{paladin,instance}` · `gestalten.belt` · the classes flat · migrate: rename the import ⟨m91⟩
- moved `lifecycle.process` · `lifecycle.daemon.aperture.{metadata,cortex,entities}` → `gestalten.shard.process` · `gestalten.shard.host.*(context)` per rung; adds `gestalten.shard.cargo` · `gestalten.belt.{traits,modes}`; a mode trait is `(mode, context)` · migrate: a hand-built die passes `{ daemon }` ⟨m81 · 10-13⟩

- added typology `Signal` argv row (`new Signal(["instance/use", "x", "--ledger"])`), `signal.flags` · `params` · `argv` for the fin, `Signal.tokens(line)`, `rebase(signature)`; `steer.trie.at(vector, path)`; `atom.until(store, predicate, signal)`; `traits.stagger` (the runtime re-exports); `contexts.client` · `contexts.Loop` · migrate: none ⟨m86⟩
- changed client status codes — `MOUNTING · HEALTHY · UNAVAILABLE · ERROR · RELEASED` (uppercase, like the controller machine) · migrate: a pane matching `"healthy"` matches nothing ⟨m86⟩
- removed typology `View` · `prototypes/view.js` — `App` declares sources by mime, compiles to a `Bundle`; a client calls `bundle.load(accept)` (`Bundle.negotiate`) · migrate: `view.load()` → `bundle.load(accept)`, `view.hash` → `bundle.entries[0].hash` ⟨m82⟩
- changed `paladin.bundler(dir).bundle({ mime, source | entry })` — keyed by mime (`mime.dom.svelte` = `application/vnd.vivalence.dom.svelte+javascript`, `mime.dom.html`); `kind` is dead · migrate: `{ kind: "svelte" }` → `{ mime: mime.dom.svelte }` ⟨m82⟩
- added typology `mime` (`schematics/scalars/mime.js`) · `bundle.pure` (the esbuild plugin marking `subsystems/typology/` side-effect-free) · `v.primitives.credentials.{Credential,Credentials}` · `v.primitives.instance.{Lighthouse,LighthouseTraitsEnum}` · migrate: none ⟨m82⟩
- renamed typology `trace.chronicle.seed` · `trace.chronicle.step` → `trace.seed` · `trace.step`; `merge.withOptions` → `mergeWithOptions` — sibling exports, no load-time assignment · migrate: rename ⟨m82⟩
- changed typology's own imports — every module names its owner (`import * as is from "../is/index.js"`), the barrel is for consumers; `is.url` · `is.signature` live in `is/scalars.js` (same `is.*` surface); `atom` through the barrel weighs ≤ 1 KB under esbuild and vite · migrate: none ⟨m82⟩
- changed `entity_find` · `entity_count` · `entity_schema` on `user` and `activity` — a signed-in caller reads only their own user row and their own runs, before: every user's · migrate: none ⟨m81 F7⟩
- removed `ctx.daemon` · `ctx.runtime` — the host's words ride flat: `ctx.entities · call · cortex · modes · services · statics · domain · mountpoint · reference · cargo` · migrate: `.ikiro/methods/flatten-ctx.py <tree> --all --write`, then the hand blocks ⟨m81 flatten⟩
- removed `daemon.flatmodes()` · `runtime.flatmodes()` → `fromm.modes(modes).flat` · migrate: the same script ⟨m81 flatten⟩
- added `contexts` (typology) — every ctx key a schematic, six contexts · `shard.context.{lift, spread, conform}` · migrate: none ⟨m81 flatten⟩
- changed `mode_find`'s first line `[Daemon <slug>]` → `[Host <reference>]` · migrate: none ⟨m81 flatten⟩
- renamed `lifecycle.mode.traits` → `traits` (`@vivalence/runtime`) · migrate: imports, `.ikiro/quests/done/m81-runtime-harness.org` registry blocks ⟨m81 traits⟩
- changed the runtime's root server `die.runtime.aperture` → `die.aperture`; `die.runtime.aperture` is the runtime-as-host, mounted at `/runtime/<slug>` · migrate: a hand-built runtime die passes `aperture` ⟨m81 R6⟩
- fixed `Url.branch("/")` — identity, like `Aperture.branch("/")`; a root-seated host's cargo url no longer ends in `//` · migrate: none ⟨m81 R3⟩
- renamed `gestalten.belt.stagger(mode, daemon, traits)` → `stagger(module, context, traits)`; `belt.stamp` → `lifecycle.mode.traits.stamp` · migrate: imports ⟨m81 pass⟩
- fixed `Signature.lua` — walked from `undefined`, always returned `undefined` · migrate: none ⟨m81 K, landed 10-09⟩
- fixed `thread_update` — returns `{ id, phase, traits, trait, counter, cursor }`, never the row · migrate: none ⟨m81⟩
- removed `systems/runtime/lifecycle/runtime/aperture/cortex.js` — an orphan · migrate: none ⟨m81 F2⟩
- added `@vivalence/typology` `v.interface(heritage, props, opts)` · `v.isNever(schema)` — TypeBox `Interface` and `IsNever`, enhanced · migrate: none ⟨m80⟩
- added `@vivalence/drapes` `place` — the float placement (`panels/float.js`) · migrate: none ⟨m73⟩
- added `@vivalence/drapes` `Key` `size="bone"` · `stack` — 31 px across a bone, the face stacked on a standing one; anima's `Glyph` takes a `set` (`carbon/32` the default); `static/icons/anima/` holds the comp's `brain` · `chat/lines` · `chat/prompt` · `eye-off` · migrate: none ⟨m73⟩
- added the `@vivalence/typology` `theme` primitive's `brand` group (`Brand` · `Glow` · `Filter`: `outline · glow · filter`); `@vivalence/dapper` emits `--brand-outline` · `--brand-glow` · `--brand-filter` in every theme root and zone block (94 root keys, 106 declarations per zone); anima's pincer reads them · migrate: none ⟨m73⟩
- added the `@vivalence/typology` `theme` primitive's `font` group (`Font` · `Family`) — a `Definition` may state families, a `Theme` holds six per zone · migrate: none ⟨m73⟩
- changed `@vivalence/dapper` `emit` — six `--font-family-*` names in every theme root and zone block (91 root keys, 103 declarations per zone), none under the bare `:root`; 56 scales · migrate: a page reads the families under a `data-theme` root ⟨m73⟩
- changed `@vivalence/drapes` — gains `Key` (rewritten: `tone` · `size` · `latched` · `led` · `hold`) · `Segmented` · `Stepper` · `Row` · `Reading` · `Well` · `ToolRow` · `Pressed` · `Strip` · `Meter` · `Spinner` · `Status` · `Float`; `Tag` · `Card` · `Empty` · `Chip` · `Section` · `Input` repainted; `Frame` takes a `children` snippet in place of its slot · migrate: `Key tone="danger"` → `tone="negative"`; a `Frame` slot → a `children` snippet ⟨m73⟩
- added `@vivalence/dapper/contrast` · migrate: none ⟨m73⟩
- added `@vivalence/anima` `TONES` · `settled`; `bridge.view` gains `fold` · `strip` with `setFold` · `setStrip`; a terminal gains `$settling` · migrate: none ⟨m73⟩
- added the `@vivalence/typology` `theme` primitive (`Definition` · `Theme` and their scalars) · migrate: none ⟨m72⟩
- added `@vivalence/dapper` `theme` · `emit` — emits `[data-zone="0..3"]` blocks (97 declarations) and zone 1 whole on the theme root · migrate: none ⟨m72⟩
- removed `@vivalence/dapper` `skeleton` · `interactive` · `box` · `generateZoneCSS` · `ZONE` · `ZONE_COUNT` and the CSS names `--colors-*` · `--text-{primary,body,support}` · `--shadow-{soft,strong}` · `--zone-*` · migrate: read the zone's slots by name inside a `data-zone` container ⟨m72⟩
- changed `@vivalence/dapper/tailwind` — maps slots; `safelist` removed · migrate: drop `safelist` ⟨m72⟩
- removed `@vivalence/drapes` `SkeletonProvider` · `useSkeleton` · `Zone` · `Decorum` · migrate: a `data-zone` attribute on the container ⟨m72⟩
- added `@vivalence/typology/entities` (`DataEntity` · `VirtualEntity` · `trait` · `lighthouse.{identity,daemon}`) and the typology prototype `Datamap` — mikro stays off the browser through `mod.client.js` · migrate: none ⟨m74 M3⟩
- renamed the datamap's words `introspect()` → `getMetadata()` · `subscribe(s)` → `registerSubscriber(s)` · `disintegrate()` → `close()` · `shard.context` → `shard.scope`; a provider is `provider(mask, { entities, subscribers })` and answers a typology `Datamap` · migrate: rename; a provider returns `new Datamap(orm)` ⟨m74 M3⟩
- removed `@vivalence/runtime/daemon` · `./daemon/{aperture,traits,skills}` · `./process` · `./run` — `@vivalence/runtime` exports `.` and `./scenarios`: traits at `lifecycle.mode.traits`, skills at `gestalten.skills`, `stagger` · `stamp` at `gestalten.belt` · migrate: `import { lifecycle, gestalten } from "@vivalence/runtime"` ⟨m74 M4 · M5⟩
- removed `Die` · `daemon.Die` · `process.Die` — a boot is `steer.dispatch.execute(lifecycle.<type>.execution, die)` over a bag `{ controller, mask, <type> }` · migrate: `die.good.X` → `die.<type>.X`; a domain's `resolve(die)` → `resolve(daemon)` ⟨m74 M5⟩
- added a sixth faculty type `choice` — `cortex.hallucinate.choice.render({ controller, primer, questions })`: several questions of ONE primer, each tagged `choice` (`options`) · `score` (`levels`) · `noul` (a proposition), an absent tag filled from the shape; the verdict is one distribution per key in the question's shape; a faculty declares caps flat beside `context` — `options` (depth) · `choices` (width, `null` unbounded; floor 26 · 1) — the avenue refuses past them naming the faculty · migrate: none ⟨m70-choice-faculty⟩
- added `harness.choice.render({ primer, questions })` on every HARNESSED mode; `/cortex/render` accepts a `{ primer, questions }` round; the `/metadata/cortex` strip carries `options · choices` · migrate: none ⟨m70-choice-faculty⟩
- added an openrouter `choice` faculty on `typesafe/jev-1.13` over `POST /api/alpha/decisions` (plain fetch, the same key; `options: 255`, `choices: null`); `statics.choosers` replaces the chooser table; `fault` retries 529 · migrate: none ⟨m70-choice-faculty⟩
- renamed the APPLICATION carrier `app` → `application` — kernel export `export const application = new App(…)`, `mode.module.application` · `mode.application`, the client atom `$application`, route `/metadata/app` → `/metadata/application` · migrate: rename the export in every kernel declaring an App; `app` throws at `traits/application.js` ⟨m58-M1⟩
- renamed the trait `TOOLED` → `TOOLING` — enum member, `traits/tooling.js`, the manifest string in every kernel; `Mode.traits` rows MIRROR the manifest at boot (was: accumulate), so a renamed or dropped trait leaves no ghost · migrate: flip the string in every manifest (a kernel on `TOOLED` boots DECLARED BUT UNIMPLEMENTED, empty `mode.tools`), restart each instance; `TOOLED` stays a deprecated enum member until every instance has booted once ⟨m58-M2⟩

- changed paladin `instance.mount` — a daemon without a `lighthouse` mask inherits the instance's (`held.lighthouse ?? instance.lighthouse`, the already-hydrated object); `v.primitives.instance.Instance.lighthouse` (new) and `Daemon.lighthouse` are `Mask.optional()`; a daemon left with `{}` fails validate as `daemon[<slug>]/lighthouse: must have required properties module` · migrate: none ⟨lighthouse-declared-once⟩
- changed `Vip.supply()` — a dead record location under the checkout is rediscovered from `<repository>/commons`, the record rewritten; a dead external one is kept, skipped, reported (`vip.stale`, `viva ledger/doctor` `present:false`); a missing `commons/` yields nothing, `accio` says `not supplied` · migrate: none ⟨m47-commons⟩
- changed `Pensieve.register` — a second file claiming an already-registered owner/type/slug/version throws instead of silently winning; the package walker skips `*.bak` directories as well as `bak/` · migrate: rename any duplicate declaration dir to `*.bak` or remove it ⟨m47-commons⟩
- added `v.environment(props)` · `v.url()` · `.group()` · `v.isOptional()` · `v.convert()` — an instance declares its environment as a v schema; keys outside the VIVA law throw at import; `v.url()` is an RFC 3986 URI with an authority (any scheme, localhost included; `v.scalars.PATTERN` is the grammar); `.properties` come back plain · migrate: rewrite `export const environment = { KEY: { describe, default, group } }` → `v.environment({ KEY: v.<type>().desc(…).default(…).group(…) })`; `required: false` → `.optional()` ⟨m48⟩
- changed paladin `instance.mount` — refuses an `environment` export that is not a v schema · migrate: as line 1 ⟨m48⟩
- changed `paladin.ledger.boot(specs, { instance, attachment })` — returns a populated + resolved `Die` (the caller integrates); specs are `{ identity: {process, mount}, command: {bin, args, cwd, env} }`; children get an EXPLICIT env (`clearEnv`, `VIVA_PROCESS_ID` never carried) and run with `cwd = mount` · migrate: `boot(...)` then `await die.integrate()` ⟨m49⟩
- removed `paladin.ledger.spawn` · `ledger.kill` · `ledger.locks` · `ledger.arm` · `ledger.teardown` · `Lock.alive()` — the ledger holds no live state; `ledger.lock(instance)` takes ONE arg · migrate: `lock(i, p).alive()` → `(await lock(i).read()) !== null`; `spawn` → `boot` ⟨m49⟩
- added `paladin.ledger.instances.lookup(mount)` · `.rename(prior, next)` · `.remove(slug)` — identity ops on the record; ghost `register()` returns the slug and throws on a miss · migrate: none ⟨m44⟩
- added `paladin.assign(bag, stratum)` — folds a key bag into the env at a named stratum; the one ingress every source (`--env`, `VIVA_ENV_FILE`, cwd `.env`, `<instance>/.env`, os, session, ledger) goes through · migrate: none ⟨picker-names-its-lens⟩
- removed `paladin.ledger.mount` — `ledger.instances` / `ledger.registry` are per-access getters on the scope; `publish()` runs at spawn head · migrate: `paladin.ledger.mount(…)` → read `paladin.ledger.instances` / `.registry` directly ⟨m41⟩
- removed `paladin.vip` — the registry is `paladin.ledger.registry` (record + pensieve, held once) · migrate: `paladin.vip.X` → `paladin.ledger.registry.X` ⟨m68⟩
- renamed `registry.list()` (the record) → `references()` · migrate: rename ⟨m68 M1⟩
- added `registry.accio(query)` returns the folded citizen; `registry.wire(mask)` the daemon's bag · migrate: a runtime no longer folds `mask ⊕ module` ⟨m68 M2⟩
- changed four runtime throws are settle faults (`runtime.statics.remote required — N daemons announce under it` and kin) · migrate: read `viva instance/doctor` ⟨m68 M4⟩
- added the runtime's door: `run.js` faults when `instance.runtime` is absent · migrate: none ⟨m68 M4b⟩
- added `registry.integrity` (Map path → faults) and `assert` on every road out — a faulted module throws `[registry] <path>: <sentences>` at its consumer · migrate: fix the module the sentence names ⟨m68 M6⟩
- renamed a registry module's `.mount` (the file it was read from) → `.source`; `.mount` is the seat · migrate: `mode.module.mount.dirname` → `mode.module.source.dirname` ⟨m68 M7⟩
- renamed `citizen.reference` → `citizen.identifier`; `registry.module(identifier)` · migrate: rename ⟨m68 M7⟩
- removed the runtime's `[trait] <type>/<slug> declares X, which nothing implements` warn — traits are an open set · migrate: none ⟨m68 M7⟩
- added a manifest-less file under `<package>/ledger/` registers as `ledger/<name>` · migrate: none ⟨m68 M7⟩
- added typology slots `Daemon.mount · url · attach`, `Mode.mount · url · bundles`, `Service.mount` — every seat paladin mints at settle; a recipe MAY declare any of them and its word wins. `mount` is the path under the PARENT: a daemon's under the runtime (`/daemon/<slug>`), a mode's under its daemon (`/mode/<type>/<slug>`), a service's under the runtime (`/attached/process/service/<type>/<slug>`); `url` is always full · migrate: a runtime consumer that read `mode.mount.absolute` as a runtime-rooted path composes `daemon.mount + mode.mount` ⟨m68 M2b⟩
- fixed the daemon's mode apertures and `/metadata/*` were slurped at a doubled prefix after the seats moved (`[multiplex] no route for /daemon/<slug>/mode/…/metadata/aperture`); a mode's `mount` is under its daemon again, and the two runtime-rooted readers (`/attached/bundle/…`) compose the daemon's mount in front · migrate: none ⟨m68 M2b, post-sunset⟩
- renamed `@vivalence/ghost` root — `Client` · `Thread` · `Runtime` · `Lighthouse` · `STANDINGS` · `factories.*` · `lifecycle.*` · `traits.*` · `commands.*` · `keymap` → per subject or entity (Q47): `client.Client` · `entities.thread.Thread` · `entities.runtime.Runtime` · `entities.lighthouse.Lighthouse` · `entities.lighthouse.STANDINGS` · `<subject>.factory` · `<subject>.lifecycle` · `<subject>.traits` · `<subject>.commands` · `client.keymap` · migrate: `import * as ghost from "@vivalence/ghost"`, then `ghost.client.Client` ⟨m98⟩
- added `@vivalence/ghost/scenarios` — `hello` · `look` · `chrome` · `world` · migrate: none ⟨m98⟩
- moved `entities.activity.loudest` · `owed` · `send` → `belt.activity.*` · migrate: `ghost.belt.activity.loudest(activities)` ⟨m98⟩
- added `traits.patch(entity, data)` (typology) — the change for one trait write: the claimed names, the whole trait with the touched one deep-merged · migrate: none ⟨m98⟩
- changed `new Argv("<line>")` — a line reads as its words, the same signal as its argv array; `flags` `{}` when none typed · migrate: none ⟨m98⟩
- changed `new <Kind>(signalOfAnotherKind)` — the path, `body` and `flags` carry over (was the head's nature only) · migrate: none ⟨m98⟩
- removed `Terminal.write` — `terminal.repository.updateOne({ id }, data)` · migrate: the same call ⟨m98⟩

### entity

- changed a mode's `installed` stamp — covers `fileset.path`; FILESET skips when installed · migrate: one reinstall per mode ⟨m114⟩
- added `terminal.client.runtime.entities.file` — the client's File repository: every row at boot, live; a row carries `url` (`/attached/file/:id`) · migrate: none ⟨m113⟩
- added `Daemon.id` — the slug, serialized, never a column; the client's identity map keys on it · migrate: none ⟨m109 · m107 Q33F⟩
- moved `ModeEntity` · `DaemonEntity` (+ Schema · Repository) to `systems/runtime/entities/`; the `subjects/mode` · `subjects/daemon` barrels stop re-exporting them · migrate: import from `@vivalence/runtime` ⟨m109⟩
- changed `Terminal` — a user is born holding terminal 0; `/userspace/entities/terminal/create` for a new user answers index 1; `TerminalRepository.ensure` · migrate: none ⟨m107⟩
- changed `user` trait `THEMED` — defaults `"northsea"` · migrate: none ⟨m107⟩
- added `AIMED · MASKED · QUEUEING` — declared thread traits, validated when claimed · migrate: none ⟨m105 Q7′⟩
- changed a thread write — an invalid claimed trait is refused on create and update · migrate: none ⟨m105 Q7⟩
- changed `Buffer.thread` — required; a buffer without a thread is refused at the flush · migrate: mint on a thread; rows with a null thread fail the migration ⟨m105 Q12A⟩

- added `View` entity — code a mode ships or the model writes: `slug · mime · entry`, its bytes as File rows (`file.view`) · migrate: none ⟨m87⟩
- added `File` entity — a file the system holds: `mode · path · mount · mime · hash · integrity · bytes`, m:n with Buffer · migrate: none ⟨m87⟩
- changed `Buffer` entity — gains `mime · files · turns`; loses `bundle` · migrate: the mikro migration drops `buffer.bundle` ⟨m87⟩
- removed `ModeTraitsEnum` (`Mode.ts`) · `ThreadTraitsEnum` — a `traits` column is `string[]` json; a mode's vocabulary is the table `v.traits.mode` (`subsystems/typology/schematics/traits/index.js:13`; APPLICATION · DATASINK membership owed → m96 open #17) · migrate: read `v.traits.<entity>` ⟨m94⟩
- changed `ProcessRepository.kill` — awaits `controller.settled` of the processes it signalled, not every `process.execution` · migrate: none ⟨m93⟩
- removed `ProcessEntity.execute` · `ProcessEntity.execution` — boot through `factories.daemon` · `factories.service` · migrate: `process.execute(execution, ctx)` → `factories.<type>(process)(parentDie)` ⟨m93⟩
- renamed `Buffer.view` → `Buffer.bundle` (json, nullable) — one `Bundle` per buffer, entries keyed by mime; anima's `Buffer.$bundle` · migrate: a restart migrates the column; readers use `bundle` ⟨m82⟩
- changed `User` — the lighthouse's `Identity` folds into the runtime's `User` (traits · trait; authentication hidden on the wire); `Daemon` is a row (`mask`), `User ↔ Daemon` through `User_daemons`, written on first use · migrate: sign up again — no user survives ⟨m80⟩
- added `Note` with traits `RETAINED` · `TRACED` (a child per review); removed `Retention` · `Trace` · migrate: none — no row survives ⟨m80⟩
- changed the datamap — ONE runtime db with a fixed kernel schema, a repository per (daemon, kind) scoped by mikro's `daemon` filter; every per-daemon `.viva.db` dropped · migrate: restart on a fresh mountpoint, sign up again ⟨m80⟩
- added trait `HOME` (`trait.HOME.reference`) on user ⟨m81⟩ and client, user's first · migrate: `clients[].home: X` → `traits: ["HOME"]`, `trait.HOME.reference: X` ⟨m86⟩
- changed `Mode.daemon` — nullable, a runtime mode's row has none · migrate: restart every instance (schema delta) ⟨m81 H3⟩
- changed `Turn` — reads carry the `user` filter through `thread.user`: a bound user sees only their own threads' turns, chains onto no other user's thread, and an unbound read throws · migrate: none ⟨m78⟩
- renamed an instance record mask's `mount` → `reference` — `v.primitives.instance.{Mode,Service,Daemon}.reference`, the route under the parent (`/daemon/chess`); `mount` means disk · migrate: a recipe declaring `mount:` on a daemon · mode · service declares `reference:` ⟨m74 M2⟩
- renamed `sets.network` → `sets.lighthouse` (`identity · daemon`); `sets.daemon` (`user · mode`) folds into `sets.traits` (`user · mode · literal · symbol`) · migrate: `sets.network` → `sets.lighthouse`, `sets.daemon.X` → `sets.traits.X` ⟨m74 M6⟩
- fixed dataset install — `Literal.ontology` and `Literal.symbol` derive again on install: the link phase writes pivots through the ORM (per-chunk populate · add · `updatedAt`), so `LiteralSubscriber` fires; the install stamp folds the installer's own source, so this change reinstalls every DATASET mode at next boot and backfills the rows · migrate: none, boot once ⟨a-blank-never-claims⟩
- changed instance recipe `export const lighthouse` — carries `module` and is the ONE consumed-lighthouse declaration; a daemon's `lighthouse` mask is an override; `clients.<slug>.statics.lighthouse` is gone (never read — the browser takes `PUBLIC_VIVA_LIGHTHOUSE_REMOTE` through `publish()`) · migrate: REQUIRED — add `module:` to the top-level `lighthouse`, delete the `lighthouse` mask from every daemon that bound the same module, delete `clients.*.statics.lighthouse`; prod instance at M5 ⟨lighthouse-declared-once⟩
- renamed module lookups `@viva/*` · `@development/*` · `@testing/*` → `@commons/*` — every `module:` string and kernel entry in instance recipes · migrate: REQUIRED — every pre-m47 recipe dies at its next `instance/up` with `package @viva not supplied` until the three prefixes are sed'd (`~/.viva/instances/*`, every tapped recipe, the prod instance); `viva instance/doctor` names each unresolved module ⟨m47-commons⟩
- changed `Mode.installed` — a stamp string naming the installer's source (was a boolean); the datasink trait writes it, a changed installer reinstalls at the next boot · migrate: none — rows re-stamp at boot ⟨italian-datasink⟩

### env

- added `VIVA_CLIENT_GHOST_CREDENTIALS_FILE` (default `<ledger>/credentials.json`) — where ghost holds its credentials by origin · migrate: none ⟨m95⟩
- added ledger slot `lighthouse` (`{ secrets: { jwt }, traits }`) — the runtime signs with it; `runtime.secrets.jwt` is read only when the slot is absent, one release · migrate: move `secrets.jwt` from `runtime` to `lighthouse` in `ledger.viva.json` ⟨m82⟩
- added ledger `runtime.modes: ["@commons/home/home"]` · `clients[].home: "/runtime/runtime/mode/home/home"` — the home mode seats on the runtime host; a client lands there · migrate: none ⟨m82⟩
- removed `PUBLIC_VIVA_LIGHTHOUSE_REMOTE` · `VIVA_LIGHTHOUSE_MOUNT` — the lighthouse is the runtime's own; the browser reads `PUBLIC_VIVA_RUNTIME_REMOTE` · migrate: set `PUBLIC_VIVA_RUNTIME_REMOTE` where the lighthouse key stood, prod's Coolify included ⟨m80⟩
- changed the ledger → instance environment fold — an instance key composes with the ledger's as a TypeBox interface: it narrows (restating `type`), a retype throws at mount, a typeless override is dropped · migrate: restate `type` on every overriding key ⟨m80⟩
- changed instance settle — a consumed service (`daemon.consume.<slug>`) whose secret is blank is dormant like a hallucinator: dropped at mount, named `daemon[<slug>].consume.<name>` by the doctor, `daemon.services.<slug>` absent; the nlp provider names what it misses (`statics.remote` / `secrets.key`) · migrate: none ⟨a-blank-never-claims⟩
- changed env fold — a blank value (`KEY=""`) never claims: paladin's ingress drops it, so a lower stratum voices the key and a blank REQUIRED secret reads as absent (dormant hallucinator, not a gate failure); the writer already wrote unset as `# KEY=""` · migrate: none ⟨a-blank-never-claims⟩
- removed `VIVA_REGISTRY_MOUNT` from the image (F2) — the store is the ledger volume's `registry/` · migrate: none ⟨m47-commons⟩
- removed `required:` on environment entries (lived one session, never released) · migrate: `.optional()` for false, nothing for true ⟨m48⟩
- renamed `VIVA_VARIANT_MOUNT` → `VIVA_INSTANCE_MOUNT` — always a PATH; a bare slug resolves to `<ledger>/instances/<slug>` at the CLI and is never stored · migrate: swap the key in every shell profile, compose file and prod env ⟨variant-to-instance⟩
- changed env resolution — seven strata, strongest first: `--env` flag › cwd `.env` › instance (`<instance>/.env`) › repo-root `.env` › os › shell session (`instances/use`) › machine ledger (`~/.viva/environment.json`); `viva instance/doctor` names each key's stratum · migrate: none; a repo-root `.env` now outranks the shell's selected instance ⟨m41⟩
- renamed `SERVICE_*` → `VIVA_SERVICE_*` — every service key wears the VIVA prefix (`VIVA_SERVICE_NLP_{SERVE,REMOTE,PORT,KEY}`) · migrate: rename the keys in every env file ⟨picker-names-its-lens⟩
- removed `<instance>/environment/*.jsonc` + `VIVA_ENVIRONMENT_MOUNT` — the instance's `.env` is read at mount, at the `instance` stratum · migrate: move each jsonc value into `<instance>/.env`; drop the variable ⟨picker-names-its-lens⟩
- added `<ledger>/<any>.viva.js` — a ledger declares `runtime · lighthouse · datamap · hallucinators · clients · services · environment` once; every instance on it inherits a slot it does not declare, its environment keys merge under the instance's ; no `manifest` export needed — type and slug derive from the file's place, an exported `manifest` locks · migrate: none (absent ledger recipe = today's behaviour); `viva ledger/init` now writes `ledger.viva.js` ⟨ledger-recipe⟩

### other

- changed the journal's buffer card: no JSON; a cell view mounts under it; a click is `/buffer/full` ⟨m111⟩
- removed anima `surface.place` · `surface.places` ⟨m111⟩

- removed anima's legacy `src/` (`app · box · bridge · entities · gestalten · prototypes · telemetry` · `lighthouse.js · typology.js`) · migrate: none, captured to `~/.viva/bak/anima/src-20261024/` ⟨m105 Q8⟩
- changed the client's boot — the surface mounts after `connection`, before `authorized`; until signed in it is the sign-in screen alone; the pane calls `lighthouse.login`, no line · migrate: none ⟨m102 Q14⟩
- changed sign-in as another user — the client flushes threads · buffers · turns · activities · terminals, reads the new user's, and seats their first terminal · migrate: none ⟨m102 Q16 · walk⟩
- changed a logout — the sign-in form keeps the username, forgets the password; the tty focuses the password · migrate: none ⟨m102 Q18⟩
- changed a held chord — per terminal: a tab switch shows the other terminal's (empty) chord and palette · migrate: none ⟨m104 Q4⟩

- removed the `raw-imports` unstable flag — `import x from "./x.md" with { type: "text" }` no longer loads · migrate: `paladin.prime.directory(new Path(import.meta.resolve("./primer")))` + PRIMER ⟨m83⟩
- changed the DATASET install — the `[DATASET:install]` lines are gone: the span `<mode>/install` on the mode's stdout, a child per phase noting `{ done, total }`; `@vivalence/sheets/plain` `trace` draws it · migrate: none ⟨m86⟩
- changed `<ledger>/logs/<instance>/spans.jsonl` — holds the whole boot (the tap opens after the record check); every DATASET mode reinstalls once (`traits/dataset.js` re-stamps) · migrate: none ⟨m86⟩
- added `@memo` (`commons/fixtures/memo/`) — the demo, m32's package whole on today's runtime: `@memo/instance/memo` · `@memo/domain/srs` (SM-2; literal verbs `feed · novel · due · byStrength · byStatus · sample · leeches · review · preview · history`; `/pick/literal/*` · `/review|preview|history|suspend|resume/literal`; tools `srs_*`) · `@memo/topography/latin` (269 literals · 242 symbols · 20 freight) · `@memo/srs/memo` (tty + svelte; `/deck · /grade · /stats · /chat`; `/session`; the Magister's `review · grade · progress · add · explain · session`) · migrate: none ⟨m86⟩
- fixed `@commons/hallucinator/stub` — a scripted tool round folds whole: the delta carries `input` alone, `name` · `id` no longer double · migrate: none ⟨m86⟩
- changed the instance recipe — JSON reconciled at boot (was the `instance.viva.js` module), nothing written back · migrate: convert each shelf by hand ⟨m80⟩
- removed mode trait `STANDALONE` — every mode is an entrypoint; a manifest still declaring it logs `[trait] … declares STANDALONE, which … does not offer` at boot, the enum keeps the word so old rows hydrate · migrate: drop it from `manifest.traits` ⟨m81 N⟩
- added `runtime.modes` in the instance record · renamed `daemons[].kernel` → `daemons[].modes` — a mode runs on the runtime rung · migrate: every `instance.viva.json` and ledger declaring `kernel` ⟨m81 H⟩
- removed `DATASET` · `DATASINK` from the runtime's catalog — a runtime mode declaring them is skipped · migrate: none ⟨m81 traits⟩
- added `RUNTIME` to a mode's traits — the mode declares it runs on the runtime rung · migrate: none ⟨m81 R1⟩
- fixed the runtime host's reference — a runtime slot naming no manifest mounted at `/runtime/undefined` (the slug's default came after the reference was written); now `/runtime/runtime` · migrate: none ⟨m81⟩
- changed `commons/datamaps/libsql` — mikro-orm 7.2.3 over better-sqlite3 (was 6.6.7 over sqlite3 + knex); a populated db meeting a schema delta is migrated by mikro's own migrator; a two-statement `execute` throws · migrate: `deno task dependencies` ⟨m78⟩
- changed mikro's auto-flush — a query flushes only queued creates and removes of its type, never a changed loaded row (6.6.9 flushed it): `row.slug = x` then `find({ slug: x })` misses, and a lazy `collection.init()` drops pending changes on the rows it loads · migrate: flush first, or populate up front ⟨m78⟩
- removed `npm:sqlite3` · `@mikro-orm/knex` from the import map · migrate: none ⟨m78⟩
- changed `registry.json` — a JSON list of locations → an object keyed by owner: `{ "@chess": { "slug": "chess", "mount": "./registry/chess", "remote": "git@…" } }`; `mount` is relative to the record file, or absolute; the list shape throws on read · migrate: rewrite the record by hand (`~/.viva/bak/ikiro/registry-record-20261009/` holds this machine's list) ⟨registry-record⟩
- changed the `runtime` slot — `manifest` defaults to `{ "slug": "runtime" }`; a recipe states it only to rename the runtime, and a stated manifest still names its slug · migrate: none ⟨m80⟩
- changed `ledger.viva.json` · `instance.viva.json` — a top-level slot is its content, a path (relative to the file, or absolute) or a `${KEY}` naming either; the ledger declares `instances` · `registry` (inline = read-only, a declared file that is gone throws) and `environment` moves to `./environment.json` · migrate: `viva ledger/init` copies `environment.json`; a ledger without the keys keeps its files beside it ⟨m80⟩
- renamed `instance.json` → `instance.viva.json` · `ledger.json` → `ledger.viva.json` — paladin finds every `*.viva.*` through one `find.viva` → `read.viva` path · migrate: `mv` the recipe on every shelf and ledger ⟨m80⟩
- changed `commons/instances/{hello-world,playground}` — they declare only what differs from the shipped ledger (hello-world: manifest + daemons) · migrate: a shelf boots on a ledger that holds `runtime · datamap · clients · environment` (`viva ledger/init` writes one) ⟨m80⟩
- changed education/riddler — `resolved` is the choice verdict (`verdict.resolved.yes > 0.9`), no longer the assistant's own flag · migrate: none ⟨m70-choice-faculty⟩
- added `three@0.186.0` (+ exact `three/addons/loaders/GLTFLoader.js` · `three/addons/controls/OrbitControls.js`) · `@threlte/core@8.6.0` · `@threlte/extras@9.21.1` to `import_map.json` — a Deno import map cannot prefix-map into `npm:`, so addon subpaths are exact entries; the browser bundler resolves them from `node_modules` regardless · migrate: none ⟨a-package-is-born-out-of-tree⟩

- renamed `registry/` → `commons/` — the checkout's package dir; ONE package `@commons/package/commons` replaces `@viva/package/commons` · `@testing/package/testing` · `@development/package/development`; `development/modes/*` → `commons/playground/*`, `testing/{data,language-learning}` → `commons/fixtures/`, `testing/instances/fixture` → `commons/instances/fixture` · migrate: none for the record (`supply()` heals a stale checkout location on first boot); images `COPY commons/`, compose `VIVA_INSTANCE_MOUNT=/viva/repository/commons/instances/starter/` ⟨m47-commons⟩
- changed `.dockerignore` — every image drops `commons/playground`, `commons/fixtures`, `**/tmp`; the runtime suite's `corpus.snapshot.json` moved beside its test at `systems/runtime/tests/fixtures/`, so the suite no longer writes into the shipped package · migrate: none ⟨m47-commons⟩
- changed `<ledger>/locks/<slug>.lock` — `{ pid: supervisor, token, instance, status: BOOTING|ALIVE, processes: [{process, pid}], started }` replaces `<slug>_<process>.lock` per child · migrate: stale `*_*.lock` files are ignored — delete by hand ⟨m49⟩
- added `<ledger>/logs/<slug>/<process>.out.log` — written under `instance/run --logged` and by every `instance/start` · migrate: none ⟨m49⟩
- changed `<ledger>/instances.json` — `{ <slug>: { mount, createdAt, updatedAt } }` is the ONE instance identity every reader resolves through; `manifest.slug` names the recipe only · migrate: none for shelved instances (`create` wrote them); `viva ledger/doctor` names the orphans to tap ⟨m44⟩
- changed `viva instance/run` — refuses before spawning when the instance is not bootable (a schematic fault or a wrong env row), prints the list, points at the doctor; exit 1 · migrate: none ⟨m52⟩
- changed `viva instance/doctor` — `--json` gains `faults` (schematic misses per slot) and `dormant` (hallucinators dropped for a blank secret); a fresh instance mounts and reports instead of throwing on an unset address · migrate: none ⟨m52⟩
- changed `v.prototypes.Url()` — wire grammar is `v.url()` (RFC 3986 with an authority); `"NaN"` / `""` no longer decode · migrate: none ⟨m52⟩
- added `v.primitives.instance.Lighthouse` — `{module, statics.remote: Url}`; `Daemon.lighthouse` and `Instance.lighthouse` use it · migrate: none ⟨m52⟩
- changed `v.primitives.instance.{Runtime,Service}.statics.serve` · `Client.statics.serve` · `Lighthouse.statics.remote` — typed `Url` codecs (Runtime/Service required); `Daemon.hallucinators` defaults to `[]` · migrate: a recipe hands the pinhole a STRING — `serve: () => paladin.env.get(KEY)` — never `new Url(…)` ⟨m52⟩
- added `paladin.instance.faults` · `.dormant` · `paladin.check.instance(instance)` (faults ∪ wrong env rows; `.fails` / `.throw()`) — `mount()` never throws on a value; the gate is ONE line at `Ledger.boot`, runtime `run.js`, kajuit `vite.config.mjs`; ghost `instance/run` mounts before `boot` · migrate: a caller that awaited a `mount()` rejection on a schema miss now reads `faults` ⟨m52⟩
- changed instance recipe `hallucinators` — a plain array; an entry whose secret is blank is dormant (dropped at mount, named by the doctor); `statics: {}` / `consume: {}` / `hallucinators: []` need not be authored · migrate: replace `hallucinators: () => key ? [...] : []` with the array; drop `new Url(…)` around `serve` / `remote` ⟨m52⟩
- changed `deno task dependencies` — allow-scripts gains better-sqlite3+argon2 (signup hashing on fresh machines) · migrate: none ⟨compact-79-readme-walk⟩
- changed `kajuit dev` — SSR off (`src/app/+layout.js` ssr=false, SPA mode; dev routes no longer 500 on the barrel race) · migrate: none ⟨compact-79-readme-walk⟩
- changed `@viva/instance/hello-world` — playground-only (education daemon + nlp-stanza service removed; env schema 17→10 keys, wizard asks 2 secrets) · migrate: education setups start from `starter/` or a private recipe ⟨compact-79-readme-walk⟩

- removed `shard.secure` (`authority` · `authenticate` · `authorize`) — the daemon's auth middlewares are `die.daemon.lighthouse.shard.authenticate` · `.authorize` on the new `Lighthouse` prototype (`@vivalence/runtime`) · migrate: `shard.secure.authenticate()` → `die.daemon.lighthouse.shard.authenticate`; the `authority` line goes ⟨m76 M1⟩
- changed the daemon's request ctx — `ctx.identity` (a session handle) → `ctx.lighthouse` `{ getUser, enroll }`; `ctx.user` unchanged · migrate: `ctx.identity.enroll()` → `ctx.lighthouse.enroll()` ⟨m76 M1⟩
- changed `shard.datamap.scoped` — the route's scope NARROWS a client `where` (a scalar under an object wall becomes `{ id, …wall }`), it never merges under it · migrate: none; a client that widened past its wall now reads its own rows ⟨m76 M1⟩
- changed `shard.datamap.reactive(repo, twitch, { scope, filter })` — resolvers for `repo` and `twitch`, `filter` names the ORM filter stamped on the wire (`user` default) · migrate: none for the daemon's call sites ⟨m76 M1⟩
- added `/entities/terminal/*` (the repository verbs, two walls) and `/entities/terminal/subscribe` (SSE, identity-scoped) · migrate: none ⟨m76 M2⟩
- changed `Dataspace.init()` — reads `/metadata/datamap`; the lighthouse dataspace initializes before populate · migrate: a mocked lighthouse answers `/metadata/datamap` ⟨m76 M3⟩
- moved ghost `chrome/` → `surfaces/chrome/`; `deno task ghost/bundle` writes `surfaces/chrome/out/panes.mjs` · migrate: rebuild after pulling ⟨m98⟩
