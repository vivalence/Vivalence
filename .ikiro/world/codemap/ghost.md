---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · derived-from: systems/ghost, trajectory groups re-verified against disk · verified: 20%-cut loop, re-stamp pass · limit: 20 lines -->
# codemap: ghost — operator (the `viva` CLI)

- **flow**: `ghost.sh` (`deno run --config <root>`) → `ShellSignal` (argv → signature; `prototypes/shellsignal.js`) → steer dispatch over the trajectory Vector (`mod.js`) → run. `trajectories/` is canonical (`slp/` was slop, deleted); target selection = `trajectories/instance/target.js specs()`. tests/ green post deep-clean (shellsignal + target; old parse/processes/resolve/start/wafer/init.gather tests purged — dead contracts).
- **commands** — post-m40 the CLI collapsed to TWO nouns, then the variant→instance rename settled the spelling; trajectory groups on disk are `instance` · `ledger` · `sheets`: `viva instance {create,init,run,start,stop,auth,doctor}` (`create <@owner/instance/slug|path> [target]` — no target shelves under `<ledger>/instances/<slug>`; `auth {signup,login}` reads `instance.lighthouse.statics.remote` → `new Connection(remote).call(...)`; `init` seeds `.env` then wizard-boots) · `viva ledger {init,tap,untap,doctor}` (branch `/ledger` slurps `ledger/index.js`). Old `system`/`variant` groups + `/variant/*` natures are DEAD — killed, no aliases.
- **known-issues** ([[known-issues]]): detached spawn dies on parent exit (use `instance/run` or `init`) · `deno task` cwd-rewrite (INIT_CWD workaround) · scope-overwrite warning (cosmetic).
- registry access rides `vip.supply()` everywhere — the old "mounts registry FLAT via vip.mount(scope.registry)" claim was stale; no raw mount call sites remain outside comments. Effects print only under `--json` (or a JSX view like ledger's `Doctor.jsx`) — a bare nature run exiting 0 silently is by design.
