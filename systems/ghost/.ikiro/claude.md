> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

# IKIRO — ghost (container)

Operator. CLI shell client. Operator at console; the terminal as a control surface. Renamed from `shell` 2026-05-18.

## architecture

operator at console.

Ghost is the shell-side viva client. It receives shell input, parses argv into a signal, walks a trajectory tree of commands, executes side-effecting operations (install variant, start daemon, list services, query auth), prints output. No daemons run here; ghost talks to the runtime via paladin-resolved Connection.

boot sequence (`systems/ghost/entry.js` → `lifecycle/`):

```
entry.js          parse Deno.args, spawn `deno task ghost/do`
lifecycle/
├── parse.js      argv → signal (command path + flags + positional)
├── resolve.js    resolve trajectory branch for signal; wire ctx (paladin scope, variant)
└── run.js        invoke trajectory handler; print output
```

structure:

```
systems/ghost/
├── mod.js              barrel
├── entry.js            shell entry; spawns `deno task ghost/do`
├── typology.js         re-exports trajectory + Signal + cast
├── trajectories/
│   ├── index.js        root trajectory; branches into each command
│   ├── instance/       instance management (init/start/stop/status/uninstall)
│   │   ├── index.js    branches `/instance`; wires sub-effects
│   │   ├── init.js     `viva instance init <slug|path> [destination]` — copy variant into a mountpoint
│   │   ├── start.js    boot runtime + clients
│   │   ├── stop.js     terminate
│   │   ├── status.js   process inventory
│   │   └── remove.js   remove `.viva.js` marker from variant mount
│   ├── list.js         enumerate installed variants / running daemons / available services
│   ├── show.js         inspect one entity (variant, daemon, service)
│   ├── auth.js         login / token mgmt
│   ├── daemon.js       daemon-namespaced subcommands
│   ├── services.js     service-namespaced subcommands
│   └── web.js          launch web client surfaces
├── lib/
│   ├── variant.js      resolveVariant(slugOrPath) → { slug, path }
│   ├── env.js          env passthrough into spawned subprocesses
│   ├── output.js       JSON / table / pretty printers
│   ├── processes.js    process state mgmt
│   ├── session.js      auth session persistence
│   └── connect.js      runtime Connection bootstrap
├── lifecycle/          parse / resolve / run
└── tests/              init, parse, processes, resolve, start, wafer
```

key concepts:

- **Trajectory** — the routing primitive. Branches expressed as `trajectory.branch("/instance").open("/init", handler)`. Same mechanic as typology Vector but operator-side.
- **Signal** — parsed argv: command path (`/instance/init`), flags (`--force`), positional (`@vivalence/wafer/local`, `./.viva`).
- **Handler** — `async (ctx) => result`. Receives ctx with `.argv`, `.flags`, etc.; returns a JSON-shaped object printed by `lib/output.js`.

key commands (current):

| command | shape | location |
|---------|-------|----------|
| `viva instance init <slug\|path> [destination]` | copy a variant manifest+its tree to a mountpoint (default `VIVA_VARIANT_MOUNT`); refuses if existing variant marker present unless `--force` | `trajectories/instance/init.js` |
| `viva instance remove <name>` | remove `.viva.js` marker from variant mount | `trajectories/instance/remove.js` |
| `viva instance start <slug> [target]` | boot runtime + clients (or specific target) | `trajectories/instance/start.js` |
| `viva instance stop <slug> [target]` | terminate | `trajectories/instance/stop.js` |
| `viva instance status [slug]` | process inventory | `trajectories/instance/status.js` |
| `viva auth <subcommand>` | identity mgmt | `trajectories/auth.js` |

## context

dependencies:
- typology — `Signal`, `Path`, `Vector` (trajectory), cast
- paladin — `paladin.scope.variant`, `paladin.env`, `paladin.find.viva`, `paladin.read.viva`
- `@std/fs` / `@std/path` for filesystem ops

active work:
- `.ikiro/ghost-client.quest.org` — operator interface, design phase
- install/uninstall need M3+ (reference-form slug/path; see root `.ikiro/quests/variant.quest.org`)
- TOOLED trait support on runtime (toolcalling quest) will be visible through ghost via `/tools` trajectory eventually

testing gaps:
- `auth.js`, `daemon.js`, `services.js`, `web.js` trajectories — no test files
- `output.js` printers — untested
- live integration (ghost ↔ running runtime) — no scenario fixtures yet
