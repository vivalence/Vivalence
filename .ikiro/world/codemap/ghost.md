---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · kind: persistent · limit: 13200 chars · traps only; ~/.viva anatomy is world/ledger.md -->
# codemap: ghost — the operator (`viva`): argv in, one effect out

## the door

- `ghost.sh` sources `${XDG_CONFIG_HOME:-~/.config}/viva/env` FIRST — it OUTRANKS the caller's exported `VIVA_REPOSITORY_MOUNT`; `VIVA_PROCESS_ID` defaults to `$PPID`, the shell that typed `viva`, so a selection written under it survives the next call. (`ghost.sh:3` · `:8`)
- root `deno.jsonc` declares `"ghost/watch"` TWICE — `:43` with `--watch`, `:45` without; JSONC keeps the LAST → `deno task ghost/watch` does NOT watch. Run `deno task --cwd systems/ghost watch`, or fix the duplicate with beef's go. (`deno.jsonc:43` · `:45`)
- `--help` is rewritten at the door into `help <nature>`. (`mod.js:129` · `:137`)
- `fail()` is the ONE exit: `NOT_FOUND` → 127, anything else → 1. (`mod.js:144` · `:153`)
- middleware order is law: span → catch → `ctx.call` → cwd mount → render; catch sits INSIDE span, mount INSIDE catch — reorder and a mount throw escapes the span. (`mod.js:23` · `:42` · `:49` · `:73` · `:85`)
- spans are in-memory only (`.to(paladin.ledger.pipe)` commented out) — there is no ghost span on disk to read. (`mod.js:41`)

## parsing and rendering

- `ShellSignal`: params + flags hang on segment ZERO and nothing validates — an undeclared flag parses fine and `help` never shows it. (`prototypes/shellsignal.js:31`)
- a handler sets `ctx.effect` or returns it, NEVER prints. Live exceptions: `instance/start` · `stop` · `run` still `console.log` a status line (`trajectories/instance/start.js:43` · `stop.js:25` · `run.js:22`). `ctx.call(argv)` re-enters the same combinator with `rendered` pre-marked, so a chain prints once. (`mod.js:67`)
- `ctx.interactive` is set ONCE — `!flags.json && stdin.isTerminal() && stdout.isTerminal()`; pickers and wizards READ it, never re-derive TTY. `view.scroll.emit` runs everywhere, `render` only on a TTY, `--json` skips both. (`mod.js:90`)
- non-interactive `render` THROWS naming the nature; `pick` with N matches in a pipe THROWS listing candidates — a picker in a pipe would be a hang. (`mod.js:107` · `belt/pick.js:23`)

## lens and paths

- lens fuzz keys include `mount` → a one-letter slug matches every path. A `key:value` facet narrows only when the lens declares it (registry `facets: ["owner", "type"]`, ledger `["slug"]`). `use` searches the LEDGER, `create` the REGISTRY. (`belt/lens.js:22` · `:40`)
- `pick` turns `/` into spaces so `@owner/type/slug` resolves headlessly; a filesystem path → `null`. (`belt/pick.js:11`)
- path law: operator-typed → `INIT_CWD ?? PWD ?? Deno.cwd()` (`deno task` rewrites cwd); `pin()` refuses `://` and `@`, and `source()` asks `clone.remote` first so `git@host:path` stays remote. An instance TOKEN (a slug or a path, /"token until matched"/) never pins — `instances.resolve(token)` answers a `mount` (disk). A lens row's `identifier` is `@owner/type/slug`; registry record rows are `location`s. (`belt/path.js:4` · `:6` · `:14` · `mod.js:175`)

## verbs

- `registry/bootstrap`: the destination dir NAMES the package (`basename(target)`); its `package.viva.js` is REPLACED whole, never patched. (`trajectories/registry/bootstrap.js:25` · `:60`)
- `instance/user <signup|login|password>` IS the auth verb (m80 10-08: `instance/lighthouse` died) — there is no `viva auth`; `password` signs a 2-minute operator JWT from `SECRET_VIVA_JWT`. (`trajectories/instance/user.js:5` · `:20`)
- `instance/init` scaffolds `.env` FROM the schema, re-mounts (`lifecycle.mount(lifecycle.populate.instance(paladin))`), then asks only blank/INVALID keys. (`trajectories/instance/init.js:76` · `:87`)
- env schema: `.optional()` is the ONLY "not owed"; `.default` is raw, never validated; a `.default(fn)` fires only while AUTHORING — at scaffold and as the wizard's preset for an owed key — through `fallback(held)`, after which the `.env` holds the value. Groups: addresses · keys · services (free-form: `homes` · `mounts` · `engine` · `office` ride too); the ungrouped wizard section is `unset` (/"not other but unset"/). (`belt/envfile.js:5` · `trajectories/instance/init.js:36`)
- `instance/start` detaches the SUPERVISOR: `new Deno.Command(cmd, { detached: true, stdio "null" }).spawn()` + `unref()` → own pgid, outlives the parent (`unref()` alone never detached); then waits 60 s for lock `ALIVE` or throws naming the logs. Paladin `Process` never detaches; `Deno.kill(-pgid, "SIGTERM")` takes a whole group. (`trajectories/instance/start.js:23` · `:41`)
- a child env is an ALLOWLIST + `VIVA_*`/`PUBLIC_VIVA_*`/`SECRET_VIVA_*` minus `VIVA_PROCESS_ID`. (`trajectories/instance/target.js:12`)
- `instance/cleanup` · `ledger/cleanup` prune view bundles through `paladin.bundler(dir).prune()`: an artifact with its source beside it (`<hash>.svelte`) is a GENERATED page a `buffer.view` names → kept; of the source-less (application compiles) only the newest mtime stays. `ledger/cleanup` walks each recorded `mount`, not each `VIVA_MOUNTPOINT_MOUNT` — a mountpoint re-rooted off the instance dir is missed. Headless needs `--force`. (`subsystems/paladin/belt/bundler.js` `prune` · `under` · `trajectories/instance/cleanup.js` `sweep`)
- `run` decodes exit `128+n` back to a signal name — `deno task` launders signals into codes. (`trajectories/instance/run.js:4` · `:31`)

## tests

- every `test*` task is `--watch` and never exits — one-shot `deno test -A --no-check tests/<file>`. `*.wet.test.js` spawn the real `mod.js` as a subprocess (`tests/help.wet.test.js:7`). (`deno.jsonc:14`)

<!-- writer: agent · hand-kept, recounted 10-06 -->
```jsonc
// systems/ghost
{
 "package": "@vivalence/ghost",
 "exports": {".": "./mod.js", "./typology": "./typology.js"},
 "barrels": {
  "mod.js": [],
  "typology.js": ["* from ./belt/index.js", "* from ./prototypes/index.js", "* as prototypes from ./prototypes/index.js", "* as belt from ./belt/index.js"]
 },
 "tasks": {"run": "deno run -A mod.js", "watch": "deno run -A --watch mod.js", "test": "--watch tests/**/*.test.js", "test/shellsignal": "--watch tests/shellsignal.test.js"},
 "tests": {"tests": 13}
}
```
