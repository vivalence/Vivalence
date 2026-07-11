---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · derived-from: systems/ghost + corpus read · verified: session testing-purge · limit: 20 lines -->
# codemap: ghost — operator (the `viva` CLI)

- **flow**: `ghost.sh` (`deno run --config <root>`) → `ShellSignal` (argv → signature; `prototypes/shellsignal.js`) → steer dispatch over the trajectory Vector (`mod.js`) → run. `trajectories/` is canonical (`slp/` was slop, deleted); target selection = `trajectories/instance/target.js specs()`. tests/ green post deep-clean (shellsignal + target; old parse/processes/resolve/start/wafer/init.gather tests purged — dead contracts).
- **commands**: `viva instance {init,clone,run,start,stop,status,remove}` · `viva system {init,doctor}` · `viva {list,show,auth,services,web}`.
- **known-issues** ([[known-issues]]): detached spawn dies on parent exit (use `instance/run` or `init`) · `deno task` cwd-rewrite (INIT_CWD workaround) · scope-overwrite warning (cosmetic).
- ghost already mounts registry FLAT: `vip.mount(scope.registry)` (clone.js, doctor.js).
