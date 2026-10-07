---
paths: ["subsystems/paladin/**", "systems/runtime/**", "systems/anima/**", "systems/ghost/**"]
---
<!-- writer: agent · kind: persistent · limit: 17600 chars · traps only; the ledger spine is world/ledger.md -->
# codemap: paladin — the composition compiler; it runs nothing

## env — what a key means

- an env key's fate is its PREFIX: `split()` sends `""` → BLANK (shadows nothing), `SECRET_*` → secret, `VIVA_*`/`PUBLIC_VIVA_*` → held, anything else → ignored; a `claim` evicts every ambient `observe` on its path. (`prototypes/paladin.js:40` · `subsystems/typology/prototypes/env.js:49`)
- `paladin.secret.has(k)` is PRESENCE, not truth: a blank never lands, so `has` of a `""` secret is `false` (`tests/paladin.split.test.js:20`). Never guard `paladin.secret.has(…) && {…}` — list the provider with its own secret thunk and let integrate prune it.
- `paladin.env.vars` holds RAW strings (`VIVA_RUNTIME_SERVE: "${VIVA_RUNTIME_ORIGIN}/"`) → a screen that prints `vars` shows the template. Anything a human reads goes through `paladin.env.get(key)`, which expands. (`subsystems/typology/prototypes/env.js:29` raw · `:62` expands)
- `publish()` copies `PUBLIC_*` through `get()`, never raw `vars` — a child process cannot expand `${…}`. `PUBLIC_VIVA_LIGHTHOUSE_REMOTE` is DECLARED, never guessed from the hosting service (10-06: /"we cant know if the lighthouse service is attached"/); unset = fault `lighthouse must have required properties statics`. (`belt/publish.js:6` · `tests/settle.test.js:449`)
- `hydrate` swaps `paladin.env/secret` for a recording Proxy per thunk, restored in `finally`; secrets fire like everything else, so a mask holds keys in CLEAR → never log a mask, log the slot label. A key in beef's paste → say so BEFORE the technical answer, name rotation as the action (a `console.log({ mask })` printed a live `sk-ant-api03-…`). (`belt/hydrate.js:21` · `feedback_never_log_a_mask`)
- `state.env` upserts by LINE — comments and order are content, never rewrite the file whole. (`belt/state.js:21`)

## scopes and mount

- `populate.scopes` has FIVE scopes — ledger · instance · mountpoint · repository · registry, no `environment`. A bare slug in `VIVA_INSTANCE_MOUNT` THROWS: a `*_MOUNT` is a path; resolve the slug first (`viva instances/use`). (`lifecycle/populate.js:43`)
- `integrate.statements` returns early on an absent home: mounting never scaffolds a directory. (`lifecycle/integrate.js:24`)
- the lifecycle OWNS mount, the prototype is DATA (/"lifecycle doesnt belong into prototype. the other way around."/): `mount = fn.memo(…)` keyed on the instance, so a second `mount(sameInstance)` is a no-op. `remount` is RETIRED (grep → 0 in subsystems/systems) — re-mount = `lifecycle.mount(lifecycle.populate.instance(paladin))`. (`lifecycle/index.js:8` · `systems/ghost/trajectories/instance/init.js:76`)
- `check.instance(held).throw()` fires at THREE edges, one of them `.mjs` (a `*.js` grep misses it): `prototypes/ledger/ledger.js:84` · `systems/runtime/lifecycle/runtime/population.js:11` · `systems/anima/vite.config.mjs:13`. Mount-on-import stays QUESTIONED (m74): `recipe` throws on the home `viva instance/init` is about to create.
- `Ledger.recipe()` reads `<ledger>/ledger.viva.json` (`RECIPE`), manifest DERIVED, memo keyed by home; every top-level slot but `manifest` is content, a path (relative to its file, or absolute) or a `${KEY}` naming either, expanded BEFORE the parse (`belt/read.js` `locate` · `part`; the instance tier reads the same in `populate.recipe`). `instances` · `registry` are RECORDS, never folded: `Ledger.record(slot)` re-reads the current home's recipe per call — absent → `<ledger>/<slot>.json` (empty when missing), declared → a gone file throws, inline → a write throws (beef 10-09: /"default to file beside ledger. else throw."/). `belt/ignore.js:4` skips emacs `.#*` locks (dangling symlinks) — drop that and the reader trips. (`prototypes/ledger/ledger.js:36`)

## the fold and settle

- the ledger → instance fold runs in `populate.recipe` on a COPY BEFORE any thunk fires: a slot the instance declares (even `[]`) is its whole word; `environment` is `v.interface([ledger], own)`: an instance key NARROWS the ledger's (restate its `type` — a typeless override is silently dropped), a retype is `never` → mount throws naming the key; raw JSON gets its `~kind` stamped by `v.environment` (beef 10-09: /"instantiate already the type box and then merge combine"/); `daemons` never fall through (beef 10-09: /"drop c"/). (`lifecycle/populate.js:172-175` · `typology/schematics/primitives/environment.js:5`)
- `instance.snapshot.test.js` mounts the hello-world fixture folded over the REAL `~/.viva` ledger → a broken `~/.viva/*.viva.js` reds a paladin test. (`tests/instance.snapshot.test.js:23`)
- inherit BEFORE cast: each daemon and service gets a `v.clone` COPY of the instance's `datamap`, never the shared object. (`lifecycle/resolve.js:12-16`)
- faults are SENTENCES on `instance.faults`, never throws; `decode` runs only at zero faults. (`lifecycle/integrate.js:107`)
- a blank-secret provider is PRUNED pre-boot, never imported: `alive = (mask) => Boolean(mask) && !Object.values(mask.secrets ?? {}).some(is.empty)` → `instance.dormant.push({ at, module, empty })` + stderr `[instance] <slot> filtered, …` — that line IS the dormancy report. A `false` mask (the `has(…) &&` guard) leaves a module-less `nothing declared` row. (`lifecycle/integrate.js:71` · `:77`)
- a declared mode `mountpoint` must be ABSOLUTE (throws); a declared-but-blank one stays REQUIRED — nothing is minted over it; only silence gets the `mode_<type>_<slug>` seat. (`lifecycle/populate.js:172` · `lifecycle/resolve.js:91`)

## registry and modules

- `source` is never a mask's word: `anchor` stamps the recipe's home ONLY on an inline module (no `module` key); a reference `{ module, mountpoint }` passes bare. Stamp it and `accio`'s `...query` lays the recipe path over the module's own → the bundle resolves `<recipe dir>/buffer/X.svelte` (`Could not resolve "svelte"`). (`lifecycle/populate.js:128` · `prototypes/ledger/registry.js:210` · `tests/kernel.test.js:86`)
- `accio` folds mask over module once: mask wins by key, traits ACCUMULATE (a mask never strips one), secrets and seat are the mask's alone. (`prototypes/ledger/registry.js:207`)
- `revelio` returns `own(module)` — a per-call mint of the pristine declaration, so two daemons sharing `@education/game/flashcard` never share `application`. `own` CLONES mutable descriptors, SHARES functions, classes and typebox schemas (`"~kind" in value` — the `v` Proxy's `.fill` lives in the get TRAP). `structuredClone` stays dead (grep → 0 in paladin). (`prototypes/pensieve.js:39` · `own` at `:60`)
- a file with no `manifest.slug` THROWS out of registration (the walk continues) — except a file under a `ledger/` dir, which DERIVES its manifest (`commons/ledger/ledger.viva.json`). Every `*.viva.*`, JSON included, rides ONE path: `find.viva` → `read.viva`, `read.module` parsing `.json` (10-09). (`belt/find.js:48` · `belt/read.js:29` · `prototypes/ledger/registry.js:103-111`)
- a package's owner is AUTHORED (`package.viva.js` `manifest.owner`), never derived from its dirname: `mount` throws `package declares no owner`. (`prototypes/ledger/registry.js:120`)
- `tap` = materialize + record; `untap` drops the record, NOT the copy.
- `source` = the Path of the FILE a module was read from (`prototypes/ledger/registry.js:106`); `reference` = the SEAT under its parent (`/runtime/<slug>` · `/daemon/<slug>` · `/mode/<type>/<slug>` · `/attached/process/service/<type>/<slug>`; `mount` is disk only) — paladin writes the runtime's too, `reference` + `url` + `attach` (`lifecycle/resolve.js:46-51` `root`, `/runtime/runtime` on the default slug), and `ground` seats `runtime.modes` the way it seats a daemon's; `url` is full — never `.reference.dirname` for a sibling file. `identifier` = `@owner/type/slug`; the record is keyed by `owner` (`registry.tapped()` `:50` · `untap(owner)` `:208`), its `mount` relative to the record file (`resolve` `:86` · `locate` `:81`); a tap ARGUMENT is a `location` in the store's frame (`stored` `:90`); a typed slug-or-path is a `token` until it matches.
- traits and types are an OPEN SET → never add an unknown-trait rule. `TRAITS` names the export a trait travels with (`EXPOSED: "aperture"` · `ATTACHED: "attachment"` · `PROVIDER: "provider"` …); two SERVICE rules fault: a non-`ATTACHED` `SERVICE` exports `control`, a `PROVIDER` is a `SERVICE`. (`prototypes/ledger/integrity.js:6` · `:44`)

## belt and skills

- skills `resolve(root, path)`: a path is not a URL — `encodeURI` in, `decodeURIComponent` out, or a space breaks it. `shell_run`: a nonzero exit is information, not failure. (`skills/fs.js:11` · `skills/shell.js:25`)
- `skip` is a NAME predicate for files AND dirs. (`belt/find.js:10`)
- `clone.remote()` BEFORE path resolution, or `git@host:path` becomes a cwd path. (`belt/clone.js:30`)
- never `.branch()` off a reused `Path`: `new Path(existingPath)` returns the SAME instance re-traced, so `branch(p)` mutates `p`'s trace. (`subsystems/typology/prototypes/signature.js:14` · `:64`)
- `tests/snapshots/` is gitignored and rewritten every run, no knob. (`.gitignore:30`)
- the `test/vip` task points at `tests/vip.test.js`, which does not exist (vip folded into `registry.js`, `:100`) — run `test` or one file. (`deno.json`)

<!-- writer: agent · hand-kept, recounted 10-06 -->
```jsonc
// subsystems/paladin
{
 "package": "@vivalence/paladin",
 "exports": {".": "./mod.js", "./typology": "./typology.js", "./skills": "./skills/index.js"},
 "barrels": {
  "mod.js": ["default", "lifecycle"],
  "typology.js": ["* from ./prototypes/index.js", "* from ./lifecycle/index.js", "* as prototypes from ./prototypes/index.js", "* as lifecycle from ./lifecycle/index.js", "* as belt from ./belt/index.js"],
  "skills/index.js": ["* as fs from ./fs.js", "* as shell from ./shell.js"]
 },
 "tasks (all --watch)": {"test": "tests/**/*.test.js", "test/pensieve": "tests/pensieve.test.js", "test/vip": "tests/vip.test.js (MISSING)"},
 "tests": {"tests": 25}
}
```
