---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · limit: 2050 chars · traps only · `@vivalence/ghost` (paladin-free client typology) + the operator `viva` -->
# codemap: ghost

- **`"."` IS `typology.js`**; `run.js` is the CLI door. NEVER paladin inside the barrel (`deno info --json … | grep -c paladin` → 0).
- **the client is a DIE on a BOOT vector**: die `{ controller, mask, surface, client }`; `lifecycle/client/execution.js` is the beat order. The LOOP: `process.drain` → one `ReplSignal` per input, every throw painted into `client.$slot = { refused | fault }`, the loop never dies. `ReplSignal extends Argv`: bare line → `/*`.
- **`die.surface` is the ONLY difference between clients**: `{ name, root, viewport(), credentials, trajectory, accept, keys, mount: { boot · signin · crown · dock · frame · navigation }, emit?, hold? }` — headless · tty · dom. A pane mounts BEFORE `population.runtime`: follow `client.$modes`; a chrome pane reads a `$`-atom through solid's `from()`.
- **the gate is the lighthouse's machine** (`$status`): the verb is `access()`; `$user` set BEFORE `$authority`. Daemon codes UPPERCASE `MOUNTING · HEALTHY · UNAVAILABLE · ERROR · RELEASED`.
- **traits are their OWN kind**: `traits/<subject>/<name>.js`, barrel NAMESPACED. Vectors are COMMANDS: one verb one file under `commands/`, a subject grafts its verbs, a dominion its subjects; never `branch("/prefix", v)`.
- **bare `viva` IS the repl** and boots its instance's runtime when none answers (`gestalten/belt/instance.js` `boot`). VIEW seam `ctx.view.emit(kind, props)` · `hold(kind, props)` over DATA kinds `report · listing · confirm · form · picker · pending` — NO JSX in ghost; `hold` in a pipe THROWS. A handler sets `ctx.effect`, NEVER prints. `exit`: DONE 0 · STOPPED 128+n · NOT_FOUND 127.
- `ghost.sh` sources `~/.config/viva/env` FIRST, outranking the caller. Tests: one-shot from the ROOT; `tests/subprocess.js` is the ONE spawner; never a live `viva` while the suite runs. `.jsx` edit → `chrome/bundle.js`, never under `--watch`.
