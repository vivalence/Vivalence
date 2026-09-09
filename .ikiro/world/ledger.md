<!-- writer: agent · MANDATE: beef 09-01 — "i want you to maintain some significant ownership over the way the ledger works and with a solid meta on the subcomponents of this system, reaching up all the way into paladin. you need to understand and be able to control/interpret the ledger and you can assume ~/.viva as default here. let have it teach you." · derived-from: ~/.viva + `prototypes/ledger/*.js` + `trajectories/{ledger,instance,instances,registry}/**` + tests · verified: `instance/doctor --json` RUN · lock probe on a scratch ledger RUN · console.* in territory = 5 · limit: 18000 chars -->
# ledger — the machine record at ~/.viva (paladin owns the prototypes, ghost owns the verbs)

## anatomy — the ledger home

```sh
# ls -1 ~/.viva  ~/.viva/{instances,registry,sessions,locks,logs}
instances.json   registry.json   .env
instances/  hello-world italian language-learning stucatch vivalence
registry/   education stucatch vcompany young-ladys-primer
sessions/   49449.json
locks/      (empty)
logs/       (empty)
# ls -1 ~/.viva/instances/hello-world/mountpoint/*/
daemon_hello/       bundles  hello.viva.db  migrations
service_multiplayer/ lighthouse.viva.db  migrations  tokens.json
```

- **`instances.json`** — the sole identity: `{slug: {mount, createdAt, updatedAt, valence?}}`. A `*_MOUNT` is ALWAYS a path; the record is the only slug→path map.
- **`registry.json`** — a flat array of package references, absolute or store-relative (resolved against `scope.registry`, default `<ledger>/registry`).
- **`.env`** — the ledger stratum (machine-wide keys). Its schema is declared in `systems/ghost/trajectories/ledger/index.js`, not on a module, because the ledger has no declaration to hang a sibling export on.
- **`locks/<slug>.lock`** — ONE per instance, written by the supervising `Die`. **`sessions/<shell-pid>.json`** — per-shell env bags, pid-keyed by `VIVA_PROCESS_ID`. **`logs/<slug>/`** — `<process>.out.log` (attachment `logged`) and `spans.jsonl`.
- **`instances/<slug>/`** — the shelf. An instance dir off the shelf is *tapped*: the operator's ground, which `delete`/`rename` will not move.
- **`~/.config/viva/env`** is sourced by `systems/ghost/ghost.sh` **before** the exec and its lines are unconditional `export`s — a caller-supplied `VIVA_LEDGER_MOUNT` is OVERRIDDEN. A scratch ledger needs `XDG_CONFIG_HOME` pointed at an empty dir.
- Strata, secrecy split, `hydrate`, `settle`, `check.*` are **paladin's** — → `world/codemap/paladin.md`. Only three call sites throw on a bad instance: `prototypes/ledger/ledger.js:29` (`Ledger.boot`), `systems/runtime/run.js:7`, `systems/kajuit/vite.config.mjs:13`.

## the record — `instances.resolve` is the ONE reference reader

```js
// subsystems/paladin/prototypes/ledger/instances.js:6,37-47
const local = (reference) => reference.includes("/") || reference.startsWith(".");
async resolve(reference) {
  if (!reference) throw new Error(NOTHING);
  if (local(reference)) {
    const token = isAbsolute(reference) || reference.startsWith(".") ? reference : `./${reference}`;
    const mount = this.paladin.source(token).absolute;
    return (await this.lookup(mount)) ?? { slug: null, mount };
  }
  const held = await this.read(reference);
  if (!held) throw new Error(`instance: no record '${reference}' — viva instances/list`);
  return { slug: reference, ...held };
}
```

- **Frame law** — a token with a separator (`dir/sub` ≡ `./dir/sub`) resolves in the shell cwd; a bare slug is a RECORD lookup, never a shelf guess. `tests/ledger.test.js:126-147` pins all four arms.
- **`shelf(slug)`** (`instances.js:18`) is the ONLY place that maps a slug onto `<ledger>/instances/<slug>` — and only to name a NEW dir or to ask "is this mount shelved?" (`create`, `rename`, `delete`, the doctor's `shadowed` flag).
- **`write` merges** — `{...(all[slug] ?? {createdAt: now}), ...partial, updatedAt: now}`; `register()` (`trajectories/instance/target.js:27`) is a lookup-by-mount that throws the tap line and touches only `updatedAt`.

```json
// ~/.viva/instances.json
{
  "language-learning": { "createdAt": "2026-08-26T20:51:37.224Z",
    "mount": "/Users/finn/.viva/instances/language-learning",
    "updatedAt": "2026-09-01T15:38:55.880Z", "valence": "the italian daemon lives here" },
  "italian":     { "createdAt": "2026-09-01T14:15:05.583Z", "mount": "/Users/finn/.viva/instances/italian",     "updatedAt": "2026-09-06T13:27:55.357Z" },
  "vivalence":   { "createdAt": "2026-09-06T15:42:08.112Z", "mount": "/Users/finn/.viva/instances/vivalence",   "updatedAt": "2026-09-08T11:09:15.378Z" },
  "hello-world": { "createdAt": "2026-09-08T10:25:12.287Z", "mount": "/Users/finn/.viva/instances/hello-world", "updatedAt": "2026-09-08T16:32:10.201Z" }
}
```

```json
// ~/.viva/registry.json — `stucatch` is store-relative, the checkout entry is pinned absolute
["education", "stucatch", "/Users/finn/vivalence/code/vivalence/commons", "vcompany"]
```

- `~/.viva/instances/stucatch` holds no record row → the doctor prints `orphan — tap it`. `~/.viva/registry/young-ladys-primer` holds no reference → `untapped resident`. Both are live on this machine right now.

## sessions and the `.env` line upsert

```json
// ~/.viva/sessions/49449.json — one shell's selection, keyed by VIVA_PROCESS_ID
{ "VIVA_INSTANCE_MOUNT": "/Users/finn/.viva/instances/vivalence" }
```

```js
// subsystems/paladin/belt/state.js:20-37 — a .env is AUTHORED, so comments and ordering are content
line: (key, value) => (value == null || value === "" ? `# ${key}=""` : `${key}="${value}"`),
env: async (path, bag) => {
  let text = (await Deno.readTextFile(file).catch(() => null)) ?? "";
  for (const [key, value] of Object.entries(bag)) {
    const line = paladin.state.line(key, value);
    const held = new RegExp(`^[ \\t]*(?:(?:export[ \\t]+)?${key}[ \\t]*=.*|#[ \\t]*${key}[ \\t]*=[ \\t]*(?:""|'')?[ \\t]*)$`, "m");
    const tail = text ? text.replace(/\n*$/, "\n") : "";
    text = held.test(text) ? text.replace(held, () => line) : `${tail}${line}\n`;
  }
  await Deno.writeTextFile(file, text);
}
```

- **UNSET IS COMMENTED** — the regex matches a live line OR its commented form, so the wizard fills in place and a blank never lands as `KEY=""`. A blank at a higher stratum SHADOWS the ledger; that is how a machine-wide key vanishes.
- **A session is machine state → JSON; the ledger `.env` is authored → line upsert.** `instance/use` picks by `--ledger` (`trajectories/instance/use.js:37-45`).

## the lock — one per instance, `read()` prunes the dead

```js
// subsystems/paladin/prototypes/ledger/lock.js:9-19
async read() {
  const lock = await this.paladin.read.json(this.path, null);
  if (!lock) return null;
  try { Deno.kill(lock.pid, "SIGURG"); return lock; }
  catch { await this.remove(); return null; }
}
```

```json
// probe: Die.resolve() on a scratch ledger → <ledger>/locks/probe.lock (status BOOTING → ALIVE)
{ "pid": 14293, "token": "3e769a0f-91f0-452c-b376-6f34d391387c", "instance": "probe",
  "status": "ALIVE", "processes": [{ "process": "runtime", "pid": 14443 }],
  "started": "2026-09-09T22:59:48.708Z" }
```

- **SIGURG is the liveness probe** — a dead pid is not a lock, and reading it DELETES the file. Every reader inherits that: `instances/list`, `instance/{doctor,start,stop,delete,rename}`, `ledger/doctor`. There is no read of a lock that cannot write.
- **A die releases only its own `token`** (`die.js:37-41`) — a second supervisor never unlocks the first.

## `ledger.boot(specs) → Die` — the ledger holds no live state

```js
// subsystems/paladin/prototypes/ledger/ledger.js:28-35 — the CALLER integrates
async boot(specs, { instance = null, attachment = "inherit" } = {}) {
  this.paladin.check.instance(this.paladin.instance).throw();
  this.paladin.publish();
  const die = new Die({ ledger: this, specs, instance, attachment });
  await die.populate();
  await die.resolve();
  return die;
}
```

```js
// subsystems/paladin/prototypes/ledger/die.js:43-53,66-74 — resolve refuses on a live lock
async resolve() {
  const held = await this.lock?.read();
  if (held) throw new Error(`${this.instance} already running (supervisor ${held.pid}) — viva instance/stop`);
  this.token = crypto.randomUUID();
  for (const process of this.good.processes) await process.resolve();
  await this.claim("BOOTING");
}
async perpetuate() {
  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) Deno.addSignalListener(signal, () => this.disintegrate(signal));
  const exits = await Promise.all(this.good.processes.map((process) => process.perpetuate()));
  await this.release();
}
```

```js
// subsystems/paladin/prototypes/ledger/process.js:5-6,50-68 — readiness is a LINE, not a port
const STDIO = { inherit: "inherit", piped: "piped", logged: "piped" };
const ALIVE = /^Status:ALIVE$/;
async integrate() {
  const deadline = this.command.deadline ?? 60_000;
  const alive = this.attachment === "inherit" ? Promise.resolve()
    : new Promise((resolve) => this.out.tap((line) => ALIVE.test(line.trim()) && resolve()));
  const exited = this.child.status.then((exit) => { throw Object.assign(new Error(`${this.slug} exited ${exit.code}`), { exit }); });
  await Promise.race([alive, exited, late]);   // `late` rejects after `deadline`
}
```

- **Four beats**: `populate` (spec → `Process`, attachment validated) · `resolve` (spawn + claim `BOOTING`) · `integrate` (every child ALIVE, else `disintegrate` and rethrow; then claim `ALIVE`) · `perpetuate` (arm signals, await exits, release). `disintegrate` = SIGTERM → `grace` 5 s → SIGKILL.
- **`clearEnv: true`** (`process.js:33`) — a child sees only what `specs()` composed: `INHERITED` (PATH HOME TMPDIR XDG_CONFIG_HOME TERM LANG DENO_DIR NO_COLOR) plus `VIVA_*`/`PUBLIC_VIVA_*`/`SECRET_VIVA_*` minus `VIVA_PROCESS_ID`, plus the three mounts. `cwd = mount` — so a cwd `.env` outranks the `os` stratum for every child.
- **`Status:ALIVE`** is the child's own `Status.toString()` on stdout (`subsystems/typology/prototypes/status.js:49`) — an `inherit` child is alive at spawn and is never waited for.

## verbs — who writes what

| verb | writes | note |
|---|---|---|
| ledger/init | mkdirs `SCAFFOLD`, `instances.json`, scaffolds `.env`, optional shell-config line | the ONE creator of the ledger home; a boot never creates it |
| ledger/doctor | **reaps dead-pid `sessions/*.json`; prunes dead locks** | a MUTATING read — never a "safe probe". No `supply()`. Organs + `dangling · orphan · shadowed · blank` |
| registry/list | `vip.supply()` FIRST — seeds an absent record, heals a checkout-internal dead entry | the fresh-ledger SEEDER |
| registry/doctor | `vip.supply()` | record ⟷ store ⟷ pensieve: `vip.stale`, untapped residents (OUTERMOST declaration roots), census by owner |
| registry/tap · untap | `registry.json` (+ clone if remote) · record removal only | the store keeps an untapped working copy |
| registry/bootstrap | `package.viva.js` named by DESTINATION, then taps it | basename = slug, `@`+slug = owner; a clone never shadows its source in the pensieve |
| instance/create | `clone.tree` + record row; `--use` · `--init` chain | `--slug=<name>`; a held slug is a hard error, no suffixing |
| instance/use | `sessions/<pid>.json`, or `.env` line upsert under `--ledger` | trailing params chain under `/instance`; `--ledger` declared on the nature as a boolean flag (the mount `--ledger=<path>` is a separate flag sharing the spelling) |
| instances/tap | record row only | `--slug` required; the path must be a PATH (`./name`), never a bare slug |
| instance/rename | record key move (+ `logs/`, shelf dir, selecting sessions) | refuses while a lock is alive; an off-shelf dir stays put |
| instance/init | `.env` scaffold + fills, then boot · integrate · ONE signup · disintegrate | `remount()` before and after every write — `mount` is `fn.once` |
| instance/run · start · stop | lock + `logs/` | run = supervise in the foreground, throws naming the failed child; start = a DETACHED ghost `instance/run <target> --instance=<mount> --logged`, polls the lock for `ALIVE` ≤60 s; stop = SIGTERM the lock's pid, ≤15 s |
| instance/delete | record rm · `logs/<slug>` · selecting sessions · the dir ONLY when shelved | refuses under a live lock; needs a terminal to confirm, or `--force` |
| instance/doctor | **only what `lock.read()` prunes** | otherwise the read-only probe — my control surface; `doctor <target> <filter>` rides `locate()` |

## invariants

1. **MOUNT MEANS PATH, never slug** — populate throws on a slug-shaped `VIVA_INSTANCE_MOUNT` (`ledger.test.js:188`); the `--instance` flag and `resolve` obey the same law at the door.
2. **`instances.json` is the sole identity** — `register()` is a record lookup or a throw; `create`/`tap` write the row at birth; the doctor flags `dangling | orphan — tap it | shadowed`.
3. **A lock read is a lock write.** SIGURG prune is unconditional, so no verb that inspects a lock is side-effect free.
4. **`ledger/doctor` mutates, `instance/doctor` (almost) doesn't.** The session reap RACES a sibling shell mid-boot — the structural fix (sweep moves into `instance/use`) is GATED on beef → [[known-issues]].
5. **`fn.once` returns `undefined` on the second call**, not the memo — hence `paladin.instance.mount()` wrapped in `Promise.resolve(...).catch(() => null)` at `ledger/index.js:86`, and `remount()` in `instance/init`.
6. **`mountpoint` is FS, `mount` is an internal reference** (beef: *"mountpoint fs. mount internal reference."*) — `Daemon.mount` a Path, `mode.mount` a ROUTE, `mode.mountpoint` the FS data dir under `<instance>/mountpoint/<type>_<slug>/`. The outlier is `module.mount` (the mode's own `.viva.js` FILE). `undefined` = no slot declared; `null` = declared, unfilled → REQUIRED. → [[project_freight_vs_mountpoint]]
7. **A row may carry a hand-authored `valence`** — the doctor and `instances/list` render it; nothing else reads it.
8. **The ledger holds no live state** — every runtime fact is either in a lock (pids) or in a child's stdout. Delete `~/.viva/locks` and the machine forgets what is running, not what exists.

## where to read the live system

- `viva instance/doctor --json` — the probe I steer by:

```json
// viva instance/doctor --json (trimmed) — env rows carry the winning stratum, secrets already masked
{ "mount": "/Users/finn/.viva/instances/hello-world",
  "manifest": { "type": "instance", "slug": "hello-world", "version": "0.0.1", "traits": [] },
  "daemons": ["hello"], "services": ["multiplayer"], "clients": ["kajuit"],
  "env": [{ "!": null, "key": "SECRET_VIVA_ANTHROPIC_API_KEY", "value": "***", "stratum": "ledger", "reason": null }],
  "problems": [], "faults": [], "dormant": ["daemon[hello].hallucinators[1]"], "lock": null }
```

- `viva ledger/doctor` / `viva registry/doctor` — richer, but they REAP and `supply()`. Read their trajectory before running one.
- `<ledger>/logs/<slug>/<process>.out.log` — only written under attachment `logged` (i.e. `instance/start`). `tail -f` it while a detached supervisor boots.
- `<ledger>/logs/<slug>/spans.jsonl` — `Log.append` (`log.js:7`) has NO production caller; the wire is stubbed out at `systems/ghost/mod.js:25`. The file exists only in tests. **The tap is built and unplugged.**
- `ctx.span.branch("run/<process>")` + `mark("subject", {schema:"process", id:<pid>})` — `trajectories/instance/run.js:13-18`; the only span emission in this territory, faulted on a non-zero exit.
- `console.*` in territory: **5**, all in ghost, all operator-facing — `run.js:22` (child pids), `start.js:43,46` (supervisor pid + the stop hint), `stop.js:11,25` (not-running / stopped). Nothing in `prototypes/ledger/**` prints.
- `Process.out` is a `Pipe`: `out.tap(...)` is the drain — one tap writes the log file, one watches for `Status:ALIVE` (`process.js:39,54`). `trajectories/instance/Init.jsx:37` taps the same pipe to render a live 12-line tail during the wizard.

## launching the runtime from this checkout

1. **pick the instance** — repo-root `.env` (`VIVA_INSTANCE_MOUNT`) OUTRANKS `viva instance/use`; `viva instances/list` marks the effective mount with `*`. Today the session says `vivalence` and the doctor answers `hello-world`: that is the repo `.env` winning.
2. **doctor first** — `problems —` and `faults —` must be empty; `dormant` names what boot will drop (right now `daemon[hello].hallucinators[1]`, an empty OpenRouter key).
3. **boot** — `deno task runtime/watch` → `launching on http://localhost:2501/` → `Status:ALIVE`. The watcher is `--watch=../../commons,$HOME/.viva/registry` on top of the module graph, so a `commons/` or store edit DOES restart it — but the INSTANCE copy is what gets bundled, so an edit in the repo still needs the copy refreshed.
4. **secrets** — `~/.viva/.env` is the machine-wide stratum; the instance `.env` wins per key. Never log a hydrated mask — it holds its key in clear ([[feedback_never_log_a_mask]]).
5. **trap** — a `readmen*` container publishing `127.0.0.1:2501` shadows the local runtime bound on `[::1]`; `docker ps` + `lsof` before blaming the code ([[project_readmen_container_port_shadow]]).

## ownership protocol (mine)

- Any landing in `subsystems/paladin/**` or `systems/ghost/trajectories/{ledger,instance,instances,registry}/**` → restamp THIS file the same turn; the stamp names the CHECK that was run.
- Verify by reading `~/.viva` directly plus `instance/doctor --json`; never run a verb without reading its trajectory first; never write `~/.viva` by hand — the verbs are the write path. `~/.viva/registry` is NOT version controlled: capture before deleting.
- Never run a live `viva` while the ghost suite runs (two concurrent `supply()`s = phantom reds); verdicts come from a one-shot `deno test -A --no-check tests/*.test.js` in `systems/ghost` — `deno task test` is a watcher and never exits.
