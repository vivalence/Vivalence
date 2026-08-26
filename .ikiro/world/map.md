# map — where truth lives
<!-- writer: agent · derived-from: repo root + docs/ + testament/ · verified: session c795a2f7 · limit: 80 lines -->

Derived file: a POINTER map, not a copy. The map defers to the territory — if this contradicts disk, disk wins and this file is the bug. Deep per-container guides: the `codemap/` shards (path-gated, auto-load via `.claude/rules`). Live work state: [[frontier]].

## the OS at L2 (c4)

`@vivalence` — an OS, not an app. Routing into daemons, daemons into a runtime. Modes implement traits. Deno + MikroORM + Svelte.

| container | role | path |
|-----------|------|------|
| typology | library — primitives, gestalten, entities, schematics | `subsystems/typology/` |
| paladin | composition — env/scopes/instance/vip→pensieve | `subsystems/paladin/` |
| runtime | process — daemons, traits, HTTP | `systems/runtime/` |
| registry | marketplace — kernels/modes/services/wafers (M11: → package) | `registry/` |
| kajuit | surface — SvelteKit SPA, decks, pincer | `systems/kajuit/` |
| ghost | operator — `viva` CLI, trajectories | `systems/ghost/` |
| dapper / drapes / sheets | theming / components / TUI | `subsystems/{dapper,drapes,sheets}/` |

Lifecycle everywhere: `construct → populate → resolve → integrate → disintegrate`, parent cascades to children.

## where to READ (before containing anything here, check these)

- **docs/** — the human-facing documentation, johnny-decimal (`40-49_repository/{42_typology…47_integration}`, `50-59_practice/52_tutorials`). NASCENT: 8 files exist (kajuit tree/lifecycle/contexts/typology, buffer-flow, getting-started, docker-walkthrough); dirs 42–45 empty. **I read docs first, contain them never.** Docs are beef's #1 simmering item — every landing should ask "does a docs file want this?" (`quests/` (cut — see frontier "design held only here")).
- **subsystem code** — the ultimate truth; pre-flight grep before asserting any surface.
- **testament/** — the machine run surface: `instance/{.env, test.viva.js, education.js, playground.js, environment/*.jsonc, mountpoint/daemon_*}`, `ledger/{locks/, logs/, instances.json, registry.json}`, `_bruno/` (API testbench).
- **private logs** — `/Users/finn/vivalence/private/logs/<date>.org`; beef's journal. Read-only territory.
- **memory** — `~/.claude/projects/-Users-finn-vivalence-code-vivalence/memory/`.
- **jj** — history via `jj log/show/diff/op log/st` ONLY (read-only, always).

## the web

- `vivalence.com` / `vivalence.org` — the product surface (launch arc pending).
- `registry.vivalence.org` — docker registry (`vivalence/{viva,runtime,kajuit}:alpine`; `deno task build|tag|push`).
- external data: tatoeba.org (audio harvest), jsr/npm via import_map, Anthropic/ElevenLabs/Deepgram APIs (SECRET_VIVA_*).

## run surfaces

```
deno task runtime/run      # :2501 — bundles mode buffers ONCE (restart to re-bundle)
deno task kajuit/watch     # :1794 — vite HMR (app layer only)
deno task {typology,paladin,runtime,kajuit,ghost}/test
viva …                     # ghost CLI (systems/ghost/ghost.sh)
```

Interaction modes, cheap→heavy: scenario (in-memory daemon) → aperture test (real HTTP :2501) → run+log → kajuit+chrome. `:2501 /` 404 ≠ down (no root route).

## loading discipline

Boot: root `claude.md` (auto) → `frontier.md` (what's live) → the container section in `codemap.org` for wherever the task lands → the relevant docs/ file if one exists → code. Self files load on demand by persona.
