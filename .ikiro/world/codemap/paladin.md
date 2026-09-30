---
paths: ["subsystems/paladin/**", "systems/runtime/**", "systems/anima/**", "systems/ghost/**"]
---
<!-- writer: agent · kind: persistent · limit: 17600 chars · traps only; the ledger spine is world/ledger.md -->
# codemap: paladin — the composition compiler; it runs nothing

- `split()` is the law: `SECRET_*` → secret, `VIVA_*`/`PUBLIC_VIVA_*` → held, `""` → BLANK (shadows nothing), else ignored. `claim` evicts every ambient `observe` on its path. (`prototypes/paladin.js:46` · `subsystems/typology/prototypes/env.js:49`)
- `populate.scopes`: FIVE scopes, no `environment`; a bare slug in `VIVA_INSTANCE_MOUNT` THROWS — a `*_MOUNT` is a path. (`lifecycle/populate.js:43`)
- `integrate.statements` returns early on an absent home: mounting never scaffolds. (`lifecycle/integrate.js:24`)
- `hydrate` swaps `paladin.env/secret` for a recording Proxy per thunk (restored in `finally`); secrets fire like everything else — masks hold keys in CLEAR: never log a mask, log the slot label. (`belt/hydrate.js:26`)
- `publish()` copies `PUBLIC_*` through `get()`, never raw `vars` — a child cannot expand `${…}`. (`belt/publish.js:6`)
- a declared kernel `mountpoint` must be ABSOLUTE; blank stays REQUIRED, nothing minted over it. (`lifecycle/populate.js:173` · `lifecycle/resolve.js:91`)
- `Ledger.recipe()`: any depth-0 `.viva.js` IS the ledger, manifest DERIVED, two files throw; `belt/ignore.js` skips emacs `.#` locks or the reader trips.
- the fold runs in `populate.recipe` on a COPY BEFORE hydrate: a slot the instance declares (even `[]`) is its word; `environment` folds by KEY, instance wins; `daemons` never fall through. `instance.snapshot.test.js` mounts the REAL `~/.viva` — a broken ledger file reds it.
- faults are SENTENCES on `instance.faults`, never throws; a blank secret makes a mask DORMANT, not faulty; `decode` only at zero faults; inherit BEFORE cast — each daemon a `v.clone` COPY (`lifecycle/index.js:12`, settle at `lifecycle/integrate.js:107`).
- `check.instance(held).throw()` at THREE edges — `prototypes/ledger/ledger.js:60`, `systems/runtime/lifecycle/runtime/population.js:9` (the runtime's `validate` beat, m74 M5), `systems/anima/vite.config.mjs:13` (a `.js` grep misses the third). Mount-on-import stays QUESTIONED in m74: `recipe` throws on the home `viva instance/init` is about to create.
- registry: `tap` = materialize + record; `untap` drops the record, not the copy. A throw (no slug) keeps a file out (`prototypes/ledger/integrity.js:37`) — but a file under a `ledger/` dir DERIVES its manifest: `commons/ledger/ledger.viva.js` registers as `@commons/ledger/ledger` (`prototypes/ledger/registry.js:109`). `accio` folds mask over module, mask wins, traits ACCUMULATE.
- skills `resolve(root, path)`: a path is not a URL — `encodeURI` in, `decodeURIComponent` out. `shell_run`: a nonzero exit is information. (`skills/fs.js:11` · `skills/shell.js:25`)
- `skip` is a NAME predicate for files AND dirs. (`belt/find.js:10`)
- `state.env` upserts by LINE (comments + order are content). `clone.remote()` BEFORE path resolution or `git@host:path` becomes a cwd path. Never `.branch()` a reused `Path`. (`belt/state.js:21` · `belt/clone.js:30` · `subsystems/typology/prototypes/signature.js:14`)
- `tests/snapshots/` gitignored, rewritten every run, no knob. No span, no drain; stderr `[instance] <slot> filtered` = the dormancy report. (`lifecycle/integrate.js:78` · `tests/instance.snapshot.test.js:26`)

- a key in beef's paste → say so BEFORE the technical answer and name rotation as the action (a `console.log({ mask })` in `acid()` printed a live `sk-ant-api03-…`). · `feedback_never_log_a_mask`
- `prototypes/pensieve.js:39-42` `revelio`/`accio` return `own(module)` (:60) — a per-daemon mint of the pristine declaration, so two daemons sharing `@education/game/flashcard` never share `application`. `own` CLONES mutable descriptors (App · Vector · Freight · Path · Bundle), SHARES functions, classes and typebox schemas (`"~kind" in value` — the `v` Proxy's `.fill` lives in the get TRAP). `structuredClone` stays dead.
- a blank-secret provider is PRUNED pre-boot: `lifecycle/integrate.js:71` `alive = (mask) => Boolean(mask) && !Object.values(mask.secrets ?? {}).some(is.empty)` → `instance.dormant.push({at, module, empty})`, module never imported. List every hallucinator with its own secret thunk; NEVER guard `paladin.secret.has(…) && {…}` — `has` is PRESENCE (a blank never lands, `""` → false: `tests/paladin.split.test.js:20`) and its `false` leaves a module-less `nothing declared` dormant line (`lifecycle/integrate.js:77`).
- `paladin.env.vars` holds RAW declared strings (`VIVA_RUNTIME_SERVE: "${VIVA_RUNTIME_ORIGIN}/"`); anything a human reads goes through `paladin.env.get(key)`, which expands — else the screen prints the template. (`subsystems/typology/prototypes/env.js:29` · `subsystems/typology/prototypes/env.js:62`)
- the lifecycle OWNS mount, the prototype is DATA (/"lifecycle doesnt belong into prototype. the other way around."/): `lifecycle/index.js:8 mount = fn.memo(…)`; `remount` is RETIRED — re-mount = `lifecycle.mount(lifecycle.populate.instance(paladin))` (`systems/ghost/trajectories/instance/init.js:76`).
- `source` = the Path of the FILE a module was read from (`prototypes/ledger/registry.js:106`); `reference` = the SEAT under its parent (`/daemon/<slug>` · `/mode/<type>/<slug>` · `/attached/process/service/<type>/<slug>`, m74 M2 — `mount` is disk only); `url` is full — never `.reference.dirname` for a sibling file. `identifier` = `@owner/type/slug`; the record's verbs say `location` (`registry.locations() · locate()`, m74 M1); a typed slug-or-path is a `token` until it matches; traits and types are an OPEN SET — never add an unknown-trait rule. A `.env` pinning `PUBLIC_VIVA_LIGHTHOUSE_REMOTE` beats the computed remote.
- a package's owner is AUTHORED (`package.viva.js` `manifest.owner`), never derived from its dirname: `prototypes/ledger/registry.js:120` throws `package declares no owner`.

<!-- generated: python3 .ikiro/methods/codemap.py paladin — never hand-edited -->
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
 "tasks": {},
 "tasks, one file each (all --watch)": 3,
 "tests": {"tests": 25}
}
```
<!-- /generated -->
