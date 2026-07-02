---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · derived-from: systems/ghost + corpus read · verified: session c795a2f7 · limit: 20 lines -->
# codemap: ghost — operator (the `viva` CLI)

- **flow**: `ghost.sh` (`deno run --config <root>`) → lifecycle parse (argv → Signal) → resolve (trajectory branch) → run. `trajectories/` is canonical (`slp/` was slop, deleted).
- **commands**: `viva instance {init,clone,run,start,stop,status,remove}` · `viva system {init,doctor}` · `viva {list,show,auth,services,web}`.
- **known-issues** ([[known-issues]]): detached spawn dies on parent exit (use `instance/run` or `init`) · `deno task` cwd-rewrite (INIT_CWD workaround) · scope-overwrite warning (cosmetic).
- ghost already mounts registry FLAT: `vip.mount(scope.registry)` (clone.js, doctor.js).
