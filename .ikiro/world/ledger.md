---
paths: ["subsystems/paladin/prototypes/ledger/**", "systems/ghost/trajectories/**", "**/.viva/**"]
---
<!-- writer: agent · mandate beef 09-01: "maintain some significant ownership over the way the ledger works" · kind: persistent · limit: 18000 chars -->
# ledger — `~/.viva` (paladin owns the prototypes, ghost owns the verbs)

Probe: `viva instance/doctor --json` — the read I steer by. Code: `subsystems/paladin/prototypes/ledger/*` · `systems/ghost/trajectories/{ledger,instance,instances,registry}/`.

Traps:
- **MOUNT is a PATH, never a slug**; `instances.json` is the sole slug→path identity; a bare slug is a record lookup, `./x` resolves in the shell cwd (`instances.resolve`).
- **a lock read is a lock write** — `lock.read()` SIGURGs the pid and deletes a dead lock; `ledger/doctor` also reaps dead-pid sessions — never a "safe probe". (`subsystems/paladin/prototypes/ledger/lock.js:13` · `systems/ghost/trajectories/ledger/index.js:189`)
- `~/.config/viva/env` is sourced by `ghost.sh` with unconditional exports: a caller's `VIVA_LEDGER_MOUNT` is overridden; a scratch ledger needs `XDG_CONFIG_HOME` pointed empty. (`systems/ghost/ghost.sh:4` · `systems/ghost/belt/config.js:26`)
- a `.env` is AUTHORED: line upsert, unset = commented; a blank at a higher stratum SHADOWS the ledger key. (`subsystems/paladin/belt/state.js:20` · `subsystems/typology/prototypes/env.js:64`)
- children run `clearEnv` with `cwd = mount`: a cwd `.env` outranks the os stratum; readiness is the stdout line `Status:ALIVE`, not a port. (`subsystems/paladin/prototypes/ledger/process.js:33` · `systems/ghost/trajectories/instance/target.js:56` · `subsystems/paladin/prototypes/ledger/process.js:6`)
- ANY depth-0 `.viva.js` at the ledger root IS the ledger recipe (`~/.viva/ledger.viva.js`): `runtime · lighthouse · datamap · hallucinators · clients · services` fall through WHOLE to every instance that omits the slot (a declared `[]` is "none"), `environment` merges by KEY; `instance/doctor` `inherited` names what fell. Slimming an instance to `manifest · daemons · environment` moves its addresses and keys UP — edit the ledger file, not the instance. (`subsystems/paladin/prototypes/ledger/ledger.js:41` · `subsystems/paladin/lifecycle/populate.js:162`)
- `mountpoint` = FS data dir, `mount` = internal reference (beef: /"mountpoint fs. mount internal reference."/).
- `spans.jsonl` has no production writer — the tap is unplugged. (`subsystems/paladin/prototypes/ledger/log.js:8` · `systems/ghost/mod.js:28`)
- never run a live `viva` while the ghost suite runs (concurrent `supply()` = phantom reds). · compact the-checkout-ships-one-package

- `~/.viva/registry/chess` (@chess): domain · 4 topologies · 2 topographies · stockfish service · 5 modes on one copied `buffer/kit/` (pinned equal by `tests/kit.test.js`); `deno test --config deno.jsonc -A --no-check ~/.viva/registry/chess/` → `21 passed (111 steps)`. TAPPED (`registry.json`), shelf instance `chess` created (`instances.json`), never walked inside anima: owed the Chrome walk in nordic AND paper. Engine home (WASM by URL · brew `/opt/homebrew/bin/stockfish` · container) is beef's fork. · quest chess-ui-pass
- a daemon slug lives in SEVERAL instances (`instances/italian/…/daemon_italian` 0 traces vs `instances/language-learning/…/daemon_italian` 426; italian's shelf is gone since, its `instances.json` row dangles — today `daemon_playground` sits in `instances/playground` AND `instances/language-learning`) — an empty db answers correctly with zero rows. Pick by row count, never by name: `for f in $(find ~/.viva/instances -name "*.viva.db"); do echo "$(sqlite3 "file:$f?mode=ro" 'select count(*) from Buffer') $f"; done` `project_daemon_slug_lives_in_many_instances`
- TWO manifests name a daemon's mounts: the registry instance recipe AND the shelf `~/.viva/instances/<slug>/daemon.js` — rename a topology in one and the boot 404s. A daemon's http root is `/daemon/<slug>/…` (bare `/mode/…` 404s); a bad relative import in a registry `.svelte` fails the bundle and the daemon never listens — boot `systems/runtime/run.js` in the foreground to read it.
- VCS is PER PACKAGE — the generated block's `registry` row is today's reading; re-read it with `for p in ~/.viva/registry/*; do git -C $p rev-parse --show-toplevel >/dev/null 2>&1 && echo "$p git" || echo "$p NO-VCS"; done`. `git` = read-only for me; NO-VCS (and every `~/.viva/instances/*`) = capture before delete (skill `capture-before-delete`) — a scratchpad copy is not a capture; never write `~/.viva` by hand, the verbs are the write path. `project_ledger_has_no_vcs`
- a db file is DERIVED `<slug>.viva.db` (`subsystems/paladin/lifecycle/resolve.js:29` `db: { file: \`${slug}.viva.db\`, ...statics?.db }`): a copy under an old slug boots GREEN on an EMPTY db. A populated sqlite meeting a schema diff goes through road A (known-issues `mikro-sqlite-migration-generator-glues-pragma…`), never the migrator.
- a lock claim carries a TOKEN (`subsystems/paladin/prototypes/ledger/die.js:48` `this.token = crypto.randomUUID()`, `:40` release only `if (held?.token === this.token)`): two dies in one process share a pid — without the token a failed `run` deleted the supervisor's lock.

<!-- generated: python3 .ikiro/methods/codemap.py ledger — never hand-edited -->
```jsonc
// ~/.viva
{
 "~/.viva": ["bak", "instances", "instances.json", "ledger.viva.js", "locks", "logs", "registry", "registry.json", "sessions"],
 "verbs (systems/ghost/trajectories)": ["help", "instance", "instance/create", "instance/delete", "instance/doctor", "instance/init", "instance/lighthouse", "instance/rename", "instance/run", "instance/start", "instance/stop", "instance/target", "instance/use", "instances", "instances/tap", "ledger", "registry", "registry/bootstrap", "sheets"],
 "instances.json — slug → mount": {
  "language-learning": "~/.viva/instances/language-learning",
  "italian": "~/.viva/instances/italian",
  "vivalence": "~/.viva/instances/vivalence",
  "hello-world": "~/.viva/instances/hello-world",
  "playground": "~/.viva/instances/playground",
  "chess": "~/.viva/instances/chess",
  "media": "~/.viva/instances/media",
  "droneaid": "~/.viva/instances/droneaid"
 },
 "registry — package: tapped · vcs": {
  "assembly": "tapped · NO VCS",
  "chess": "tapped · git",
  "droneaid": "tapped · git",
  "education": "tapped · git",
  "media": "tapped · NO VCS",
  "stucatch": "tapped · NO VCS",
  "vcompany": "tapped · NO VCS",
  "young-ladys-primer": "untapped · git"
 },
 "registry.json, off-registry taps": ["~/vivalence/code/vivalence/commons"]
}
```
<!-- /generated -->
