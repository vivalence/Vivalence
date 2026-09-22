---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · kind: persistent · limit: 13200 chars · traps only; ~/.viva anatomy is world/ledger.md -->
# codemap: ghost — the operator (`viva`): argv in, one effect out

- `ghost.sh` sources `~/.config/viva/env` — it OUTRANKS the caller's `VIVA_REPOSITORY_MOUNT`; `VIVA_PROCESS_ID` defaults to `$PPID` (the shell that typed `viva`).
- `shellsignal.js`: params + flags hang on segment ZERO; nothing validates — an undeclared flag parses fine and `help` never shows it.
- a handler sets `ctx.effect` or returns it, NEVER prints (`instance/start` · `stop` · `run` still `console.log` a status line — `trajectories/instance/start.js:43`); `ctx.call(argv)` re-enters the same combinator with `rendered` pre-marked, so a chain prints once (`mod.js:67`).
- middleware order is law (`mod.js`): span → catch → `ctx.call` → cwd mount → render; catch INSIDE span, mount INSIDE catch.
- non-interactive `render` THROWS naming the nature; `pick` with N matches in a pipe THROWS listing candidates — a picker in a pipe is a hang. (`mod.js:107` · `belt/pick.js:23`)
- `fail()` is the ONE exit: `NOT_FOUND` → 127, else 1. `--help` is rewritten at the door into `help <nature>`. (`mod.js:147` · `mod.js:137`)
- `registry/bootstrap`: the destination NAMES the package; its declaration is REPLACED, not patched. (`trajectories/registry/bootstrap.js:25` · `trajectories/registry/bootstrap.js:60`)
- `instance/lighthouse` is the auth verb — no `viva auth`; `instance/init` authors `.env` FROM the schema, remounts, asks only blank/INVALID. (`trajectories/instance/lighthouse.js:11` · `trajectories/instance/init.js:87`)
- lens fuzz includes `mount` — a one-letter slug matches every path. `pick` turns `/` into spaces so `@owner/type/slug` resolves headlessly; a filesystem path → `null`. (`belt/lens.js:40` · `belt/pick.js:11`)
- path law: operator-typed → `INIT_CWD ?? PWD ?? Deno.cwd()` (`deno task` rewrites cwd); `pin()` refuses `://` and `@`; instance REFERENCES never pin — `instances.resolve()` reads the record. (`belt/path.js:4` · `mod.js:175`)
- `target.js`: a child env is an ALLOWLIST + `VIVA_*` minus `VIVA_PROCESS_ID`; `instance/start` waits 60 s for `ALIVE`; `run` decodes `128+n` (`deno task` launders signals).
- the `test` task is a watcher — one file by name. Spans in-memory only (`.to(paladin.ledger.pipe)` commented out) — no ghost span on disk. (`deno.jsonc:14` · `mod.js:41`)

- `new Deno.Command(cmd, { detached: true, stdin/stdout/stderr: "null" }).spawn()` + `unref()` = the child takes its own pgid and outlives the parent (Deno 2.9.6; `unref()` alone never detached); `instance/start` detaches the SUPERVISOR ghost this way (`trajectories/instance/start.js:23`), paladin `Process` never detaches; `Deno.kill(-pgid, "SIGTERM")` takes a whole group.
- env schema: `export const environment = v.environment({ KEY: v.url().desc("…").default("…").group("addresses").optional() })` — `.optional()` is the ONLY 'not owed'; `.default` is raw, never validated; a `.default(fn)` fires only while AUTHORING — at scaffold, and as the wizard's preset for an owed key (`trajectories/instance/init.js:36`) — through `belt/envfile.js:5 fallback(held)` (then the `.env` holds it). Groups: addresses · keys · services (free-form: `homes` · `mounts` · `engine` · `office` ride too); the ungrouped wizard section is `unset` (/"not other but unset"/).
- `ctx.interactive` is set ONCE (`mod.js:90` `!flags.json && Deno.stdin.isTerminal() && Deno.stdout.isTerminal()`) — pickers and wizards READ it, never re-derive TTY. A `key:value` facet narrows only when the lens declares it (`belt/lens.js:22` `facets: ["owner", "type"]`); `use` searches the LEDGER, `create` the REGISTRY.

<!-- generated: python3 .ikiro/methods/codemap.py ghost — never hand-edited -->
```jsonc
// systems/ghost
{
 "package": "@vivalence/ghost",
 "exports": {".": "./mod.js", "./typology": "./typology.js"},
 "barrels": {
  "mod.js": [],
  "typology.js": ["* from ./belt/index.js", "* from ./prototypes/index.js", "* as prototypes from ./prototypes/index.js", "* as belt from ./belt/index.js"]
 },
 "tasks": {"run": "deno run -A mod.js", "watch": "deno run -A --watch mod.js"},
 "tasks, one file each (all --watch)": 2,
 "tests": {"tests": 12}
}
```
<!-- /generated -->
