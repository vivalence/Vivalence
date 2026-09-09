---
paths: ["subsystems/paladin/**", "systems/runtime/**", "systems/kajuit/**", "systems/ghost/**"]
---
<!-- writer: agent · derived-from: 61 files; 22 tests · verified: heads 177 · fixtures 2 · console.* 10 · throw() sites 3 · limit: 17600 chars -->
# codemap: paladin — the composition compiler: one singleton that resolves environment, packages and an instance declaration into masks; it runs nothing

**The ledger spine (verbs, `~/.viva` anatomy, locks, dies) is OWNED at `world/ledger.md`** — `prototypes/ledger/**` is its territory.

## boot — `mod.js` is fifteen lines, and they are the order

- **`mod.js`**: `new Paladin()` (belt bound, `ledger`/`instance`/`vip` minted as siblings) → attach `skills` → `populate.env` → `populate.scopes` → `integrate.statements` **only if `is.citizen`** (`belt/is.js` holds the whole role algebra). `instance.mount()` is NOT called at boot: it is `fn.once`-wrapped and each consumer awaits it (`systems/runtime/run.js:6`). `paladin.remount()` mints a fresh `Instance` after a verb rewrites the `.env` under it.

## the strata — seven voices, and a KEY decides secrecy

- **`STRATA`** is declared at `prototypes/paladin.js:7` and nowhere else; two `Env` bags share it, `paladin.env` and `paladin.secret`. `Env` itself — first-hit `get`, lazy `${VAR}` expansion, `provenance`, `strati` — is typology's → `world/codemap/typology.md`.
- **`split()` is the law**: `SECRET_*` → secrets, `VIVA_*`/`PUBLIC_VIVA_*` → held, `""` → **blank**, voiced by nobody so it never shadows a real value below; everything else ignored. No file and no caller may override a key's verdict.

```js
// subsystems/paladin/prototypes/paladin.js:7,31-43,52-71
const STRATA = ["flag", "cwd", "instance", ".env", "os", "session", "ledger"];
  split(bag) {
    const held = {}; const secrets = {}; const ignored = []; const blank = [];
    for (const [key, value] of Object.entries(bag ?? {})) {
      if (value === "") blank.push(key);
      else if (SECRET(key)) secrets[key] = value;
      else if (PUBLIC(key)) held[key] = value;
      else ignored.push(key);
    }
    return { held, secrets, ignored, blank };
  }
  // assign: no source · observe: ambient · claim: role. all three split by key.
  claim(bag, stratum, source) { … this.env.claim(held, stratum, source); … }
```

- **Three ingresses over one `split`**: `assign` has no source · `observe` is ambient and provisional, recorded against the file path · `claim` owns that path and **evicts every ambient claim on it**. `populate.env` uses all three: `Deno.env` → `assign@os` · a cwd `.env` → `observe@.env` · `VIVA_ENV_FILE` → `claim@.env`.
- **`populate.scopes`** registers exactly FIVE scopes — `ledger` `instance` `mountpoint` `repository` `registry`, no `environment` — into `belt/scope.js`'s conditional `Proxy`, so a resolver runs only behind its condition. `VIVA_INSTANCE_MOUNT` holding a bare slug **throws**: a `*_MOUNT` is always a path. Its tail reads `sessions/<VIVA_PROCESS_ID>.json` → `assign@session`, then `<ledger>/.env` → `claim@ledger`.
- **`integrate.statements`** mkdirs the DECLARED mountpoints only and **returns early** when the ledger or instance home is absent: **mounting must never scaffold**, or a typo becomes a shelf entry. `ledger/init` is the one creator.

## the pinhole — `hydrate` fires every thunk once, recording what it read

- **`hydrate(node, record, paladin, at)`** (`prototypes/instance.js:29-61`) is the ONE place a declaration's thunks fire. It walks arrays by index and objects by key, labelling each slot, and re-walks a fired thunk's value, so thunks yielding thunks resolve to the bottom. While a thunk runs, `paladin.env`/`paladin.secret` are swapped for a recording `Proxy` and restored in a `finally`, and a thrower restores too. **Secrets fire like everything else**, so every mask downstream holds its keys in CLEAR: never log a mask, log the slot label.

```js
// subsystems/paladin/prototypes/instance.js:16-26,29-49
const watch = (bag, read) => new Proxy(bag, {
  get: (target, prop, receiver) => prop === "get"
    ? (key, ...rest) => { const value = target.get(key, ...rest); read.push({ key, unset: is.empty(value) }); return value; }
    : Reflect.get(target, prop, receiver),
});
export function hydrate(node, record = null, paladin = null, at = "") {
  if (typeof node === "function") {
    if (!record || !paladin) return hydrate(node());
    const read = []; const { env, secret } = paladin;
    paladin.env = watch(env, read); paladin.secret = watch(secret, read);
    let value;
    try { value = node(); } finally { paladin.env = env; paladin.secret = secret; }
    record.push({ at, read: read.map((h) => h.key), unset: read.filter((h) => h.unset).map((h) => h.key) });
    return hydrate(value, record, paladin, at);
  }
```

```json
// probe: paladin.instance.requirements after mounting commons/instances/hello-world — 7 rows, 3 shown
[ { "at": "runtime.statics.serve", "read": ["VIVA_RUNTIME_SERVE"], "unset": ["VIVA_RUNTIME_SERVE"] },
  { "at": "lighthouse.statics.remote", "read": ["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"], "unset": ["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"] },
  { "at": "daemon[hello].hallucinators[0].secrets.key", "read": ["SECRET_VIVA_ANTHROPIC_API_KEY"], "unset": [] } ]
```

- **`resolve(instance)`** finds exactly ONE `manifest.type === "instance"` module under the home via `find.type` — 0 or 2 throws, an absent home reads as `instance.mount: no instance at <path>`, `instance.environment` must be `v.environment({…})`. Afterwards **`publish()`** copies every `PUBLIC_*` key into `Deno.env` **through `get()`**, never from raw `vars` — a receiving process cannot expand `${…}`.
- **Kernel entries** pass `reference(module.source)`: absolute kept, `./`/`../` resolved against the declaring file's dirname, a bare string kept as a registry identifier, an object stamped with `mount`. An object-form entry hydrates then `dress`es — a declared `mountpoint` must be **absolute**, blank stays REQUIRED, **nothing is minted over it**. [[project_m52_schematic_pinhole]]

## `settle` — dormant → cast → faults → decode → inherit

- Faults are **sentences on `instance.faults`**, never throws — `instance/doctor` must mount a bare recipe. A JSON-pointer fault is relabelled into the slot grammar the requirements record speaks (`daemon[hello].statics.serve`). **A blank secret makes a mask dormant, not faulty**: off the daemon's roster, named on `instance.dormant`, still in the record so the doctor can ask for the key.
- **`decode` runs only when there are no faults**; a refused value stays as the pinhole left it. **Inheritance is after decode**, so a daemon inherits the *decoded* lighthouse; none anywhere is a fault by name. **`Mask`** is typology's (→ `world/codemap/typology.md`); paladin MINTS one — `new Mask({ ...declaration, mount: scope.mountpoint.branch("/<kind>_<slug>") })` — and a `datamap` without a mount inherits the mask's.

```js
// subsystems/paladin/prototypes/instance.js:145-167
function settle(instance) {
  const { Instance } = v.primitives.instance;
  for (const daemon of instance.daemons) {
    daemon.hallucinators = (daemon.hallucinators ?? []).filter((mask, index) =>
      alive(mask) || dormant(instance, `daemon[${daemon.slug}].hallucinators[${index}]`, mask));
    daemon.consume = object.filter(daemon.consume ?? {}, (slug) => alive(daemon.consume[slug]) || dormant(…));
  }
  Instance.cast(instance);
  instance.faults = Instance.faults(instance).map(({ at, reason }) => `${label(instance, at)} ${reason}`);
  if (!instance.faults.length) Instance.decode(instance);
  for (const daemon of instance.daemons) { daemon.lighthouse ??= instance.lighthouse; … }
}
```

```json
// probe: paladin.instance.daemons[0] — a daemon Mask at rest (secret elided)
{ "manifest": { "type": "daemon", "slug": "hello", "version": "0.0.1", "traits": [] },
  "mount": "…/hello-world/mountpoint/daemon_hello", "source": null, "slug": "hello", "statics": {},
  "hallucinators": [ { "module": "@commons/hallucinator/anthropic", "secrets": { "key": "…" } } ],
  "kernel": [ "…/hello-world/mode.viva.js" ],
  "datamap": { "module": "@commons/datamap/libsql", "statics": { "db": { "file": "hello.viva.db" } }, "mount": "…/daemon_hello" },
  "lighthouse": { "module": "@commons/lighthouse/multiplayer", "statics": { "remote": "null" } } }
```

## `check` — the authored schema against what the thunks read

- **`check.environment(instance)`** joins `instance.environment.properties` with `instance.requirements`, one row PER SITE; a key described but never read gets `at: null`. A `SECRET_*` row reports `"***"` or `null`, **never itself**, but is validated against its real value. `UNDOCUMENTED · REQUIRED · INVALID` fail; `ok · optional · documented` pass.
- **`check.instance(held)`** is the whole verdict — schematic faults plus wrong env rows, faults suppressed at any slot an env row names. `.throw()` is called at exactly THREE edges: `Ledger.boot` (`prototypes/ledger/ledger.js:29`), `systems/runtime/run.js:7` and `systems/kajuit/vite.config.mjs:13` (a `.js`-only grep misses the third). `check.wrong` is the ONE list `instance/doctor` and `instance/init` read.

## Vip + Pensieve

- **`Vip.supply()`** reconciles `registry.json` — a dead location inside the checkout heals by rediscovering `<checkout>/commons`, a dead one outside is kept and flagged on `vip.stale`, no record seeds from `commons` — then `mount`s each. **`tap` = materialize + record only**; `untap` drops the record, not the working copy.
- **`Vip.mount(root)`** walks `find.viva` and requires the mount's `"package"` declaration to carry an **`owner`**, else `package declares no owner`. It stamps that owner on a COPY of each module (`read.viva` returns the live namespace), and a module's own `manifest.owner` LOCKS it.
- **`accio`** throws twice, distinguishably: `package <owner> not supplied on this system` ≠ `Module 404`. **`accioOne`** is the kernel-entry pinhole — an absolute path is read and mount-stamped, an inline `{manifest}` passes verbatim, and a `{module,…}` mask folds identity: `statics: {...service.statics, ...query.statics}` and `manifest: Manifest.cast({...service.manifest, ...query.manifest})` gated by `.faults()`, so a bad slug throws AT the pinhole. `service.manifest` is untouched — `mode.module.manifest` is REGISTRY identity, `mode.manifest` the mounting's. [[project_manifest_is_identity]]
- **`Pensieve extends Map`** — the nested Map IS the index, `owner → type → slug → version → module`. `register` throws on a missing owner (mount must stamp) and on a **second file** claiming a held identity; the same file re-registers idempotently. `revelio` returns `own(module)`, a per-daemon MINT that clones mutable descriptors, SHARES anything carrying `~kind`, and cycle-guards with a `WeakMap` so `Vector.ancestor` relinks into the copy.

```js
// subsystems/paladin/prototypes/pensieve.js:12-28
    const { owner, type, slug, version } = module.manifest;
    if (!this.has(owner)) this.set(owner, new Map());
    const ownerMap = this.get(owner);
    …
    const slugMap = typeMap.get(slug);
    const held = slugMap.get(version);
    if (held && held.mount?.absolute !== module.mount?.absolute)
      throw new Error(`[Pensieve] register: ${owner}/${type}/${slug}@${version} already registered from …`);
    slugMap.set(version, module);
```

```json
// probe: pensieve key paths (owner→type→slug→version) after vip.mount(<repo>/commons) — 22 keys, 4 shown
[ "@commons/package/commons@0.0.1", "@commons/instance/hello-world@0.0.1",
  "@commons/playground/automaton@0.1.0", "@commons/hallucinator/anthropic@undefined" ]
```

## skills

- **`paladin.skills`** is `{ fs, shell }`, two `Vector`s slurped by `systems/runtime/daemon/traits/harnessed.js:56-60` behind `mode.module?.mount?.dirname`, binding `ctx.root` there. `fs_tree` · `fs_find` · `fs_read` · `fs_write` · `fs_stat` · `fs_move` · `fs_delete` · `shell_run` (8 kB tail — **a nonzero exit code is information, not failure**).
- **`resolve(root, path)` is EXPORTED — the root guard.** A URL is only the normaliser — `encodeURI` in, `decodeURIComponent` out, so a `%20` in a real filename survives: a path is not a URL. Escapes throw naming the root.

```js
// subsystems/paladin/skills/fs.js:8-16
export const resolve = (root, path = ".") => {
  const base = root.endsWith("/") ? root : `${root}/`;
  const full = decodeURIComponent(new URL(encodeURI(path.replace(/^\/+/, "")), `file://${base}`).pathname);
  if (full !== root && `${full}/` !== base && !full.startsWith(base))
    throw new Error(`path '${path}' escapes the root — paths are relative to ${root}`);
  return full;
};
```

## the ignore doctrine

```js
// subsystems/paladin/belt/ignore.js:3-8
export const IGNORE = ["bak", "archive", "slp", "node_modules", ".git", ".DS_Store", "*.bak"];
export const skip = (globs = IGNORE) => {
  const rules = globs.map((glob) => globToRegExp(glob));
  return (name) => rules.some((rule) => rule.test(name));
};
```

- `skip` compiles once into a **NAME** predicate answering for files AND directories; nothing is unioned into a caller's list. `belt/find.js` threads it through every walk, the fs skill compiles `ctx.ignore` per call. Never a gitignore-style file: index-ignore ≠ vcs-ignore.

## the belt

- **`find`**: `viva(dir)` · `walk(pattern, ignore?)(path, depth)` · `type(path, type)` (read + filter by `manifest.type`, stamping `source`) · `data(dir)`, the corpus walk: `index.js` skipped, a codec per extension. **`read`**: `file` dispatches by extension, `viva` is `import` + `cast.viva`, `json` is **jsonc**, a fallback makes a missing ledger file `null` not a throw.
- **`state`**: `scribe` is the fixpoint primitive (write-if-changed, tmp+rename). `env` upserts **by LINE** — an authored `.env`'s comments and order are content — `line(key, value)` is the one grammar: a value is claimed, a blank written `# KEY=""`, a `${VAR}` kept verbatim.
- **`source(reference)`** answers four styles: absolute as-is · `./`/`../` against `INIT_CWD` · `{file, source}` against the declaring file · a bare segment repo-root-relative. **`clone.remote(source)`** is the ONE remote-spec test, asked BEFORE path resolution or `git@host:path` becomes a cwd path. **`bundler(directory)`** → `{bundle, serve, inspect}`, svelte or html to a content-addressed `View` at `<directory>/bundle/<hash16>.<kind>.mjs`. Never `.branch()` a reused `Path` — [[project_signature_branch_mutates]].
- The checkout ships ONE package (`commons/`, `@commons`); all else is TAPPED into the store, and supply is SYSTEM-level — an instance declares nothing about them (→ `world/codemap/commons.md`). Dev env = the instance's `.env` at `claim@instance` plus `<ledger>/.env` at `claim@ledger`; docker = `VIVA_*_MOUNT`.

## how it is tested

22 test files · 177 `Deno.test(`/`it(` heads. Run one: `deno test -A --config deno.jsonc subsystems/paladin/tests/<f>` — `settle` `ok | 2 passed (19 steps)`, `check.environment` `ok | 1 passed (17 steps)`.

- **boot · split · scopes** — `tests/boot.test.js` *"lifecycle.mount is memoized per instance …"* · `tests/paladin.split.test.js` *"a blank at a higher stratum does not shadow a real value below it"* · `tests/ledger.test.js` *"VIVA_INSTANCE_MOUNT bare slug THROWS …"*.
- **pinhole · settle** — `tests/hydrate.test.js` *"restores the real bags after every thunk, including one that throws"* · `tests/settle.test.js` *"inheritance happens before settle: … its OWN decoded copy"* · `tests/kernel.test.js` *"… nothing is minted over it"*.

```js
// test: subsystems/paladin/tests/settle.test.js:163-164
expect(instance.dormant).toEqual(["daemon[probe].hallucinators[1]"]);
expect(instance.requirements.map((row) => row.at)).toContain("daemon[probe].hallucinators[1].secrets.key");
```

- **check · Vip · skills** — `tests/check.environment.test.js` *"the wrong-list is published once, for doctor and init to read"* · `tests/pensieve.test.js` *"a second file claiming a held identity cannot register …"* · `tests/vip.test.js` *"a package declaration WITHOUT owner throws …"* · `tests/skills.test.js` *"escapes throw naming the root"*.
- **fixtures · gaps** — `tests/snapshots/` is GITIGNORED, rewritten every run, no `UPDATE_SNAPSHOTS` knob; the instance fixture redacts each `secrets` bag to `"***"`, asserted `not.toContain("sk-ant")`. Untested, each grep `→ 0` repo-wide AND in `~/.viva/registry`: `integrate.statements` · `remount` · `scribe` · `check.path` · `state.dir` · `is.citizen`.

## where to read the live system

- **spans / drains**: paladin emits no span and `grep -rn "drain(" subsystems/paladin` → **0** — no drain, no soma here. `Ledger.log(slug).append(span)` (`prototypes/ledger/log.js:8`) writes `~/.viva/logs/<slug>/spans.jsonl` and `.open(process, stream)` opens `<process>.<stream>.log` beside it. Tap: `tail -f` those.
- **`console.*`**: 10 in the territory, 3 live outside tests — `prototypes/instance.js:140` warns `[instance] <slot> filtered, <module> — empty <keys>` per dormant mask (read stderr: the dormancy report) · `belt/check.js:12` dumps `[CONFIG.CHECK ERROR]` · `belt/scope.js:9` warns `paladin.scope overwrite`.
- **verbs**: `viva instance/doctor --json` prints `check.environment` rows verbatim, secrets `***` → `world/codemap/ghost.md`. `deno test subsystems/paladin/tests/instance.snapshot.test.js` re-derives `tests/snapshots/paladin-{instance,scope}.snapshot.json`.
