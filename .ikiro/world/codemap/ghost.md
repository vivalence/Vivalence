---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · derived-from: systems/ghost, trajectory groups re-verified against disk · verified: 20%-cut loop, re-stamp pass · limit: 20 lines -->
# codemap: ghost — operator (the `viva` CLI)

- **flow**: `ghost.sh` (`deno run --config <root>`) → `ShellSignal` (argv → signature; `prototypes/shellsignal.js`) → steer dispatch over the trajectory Vector (`mod.js`) → run. `trajectories/` is canonical (`slp/` was slop, deleted); target selection = `trajectories/instance/target.js specs()`. tests/ green post deep-clean (shellsignal + target; old parse/processes/resolve/start/wafer/init.gather tests purged — dead contracts).
- **commands** — trajectory groups on disk are `instance` · `ledger` · `sheets` · `system` · `variant`: `viva instance {init,clone,run,start,stop,status,remove}` · `viva system {init,doctor}` · **`viva ledger install [path]`** (scaffold + `registry.seed`) · **`viva variant clone <@id|path> [target]`** + **`viva variant lighthouse auth {signup,login}`** (reads `variant.lighthouse.statics.remote` → `new Connection(remote).call(...)`; both VERIFIED LIVE) · `viva {list,show,auth,services,web}`. The `ledger`/`variant`/`sheets` groups postdate this shard's original command list. Space-form `viva variant lighthouse auth signup` still needs ShellSignal multi-segment.
- **known-issues** ([[known-issues]]): detached spawn dies on parent exit (use `instance/run` or `init`) · `deno task` cwd-rewrite (INIT_CWD workaround) · scope-overwrite warning (cosmetic).
- ghost already mounts registry FLAT: `vip.mount(scope.registry)` (clone.js, doctor.js).
