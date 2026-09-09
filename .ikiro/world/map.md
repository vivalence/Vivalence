# map — the repo at L2: containers, task graph, run surfaces
<!-- writer: agent · derived-from: root + per-container `deno.jsonc`, `import_map.json`, `runtime/{run.js,die.js}`, `paladin/mod.js`, `kajuit/vite.config.mjs`, `ghost/ghost.sh`, `hello-world/instance.viva.js`, `documentation/`, `testament/` · verified: LOC by find+wc (caches out); workspace probe → 9 members, `commons` not one; docs tree → 8 dirs / 23 mdx; `ls testament/` → `_bruno` only · limit: 8000 chars -->

Pointer map; **the map defers to the territory**. Nothing here is deeper than L2 — everything deeper is a pointer into `world/codemap/` (path-gated, mirrored to `.claude/rules/`). Live work: [[frontier]].

## the containers

- **`subsystems/typology`** — the library every container imports: prototypes, gestalten, schematics, `v`, specimen. 251 files / 20 124 LOC; 27 tasks, the repo's finest test surface. → `world/codemap/typology.md` + `codemap/typology/schematics.md`
- **`subsystems/paladin`** — composition: env strata, scopes, instance record, vip→pensieve, skills. 57 / 4 633; the first module any process imports. → `world/codemap/paladin.md`
- **`systems/runtime`** — process: `Die`, daemons, traits, aperture, HTTP. 127 / 12 197. → `world/codemap/runtime.md`
- **`systems/ghost`** — the operator, `viva`. 52 / 4 229. → `world/codemap/ghost.md`; the `~/.viva` spine it drives → `world/ledger.md`.
- **`systems/kajuit`** — the browser surface (SvelteKit + vite). 136 / 15 433, `src/` alone 14 359; `.vite/` and `.svelte-kit/` are caches, not source. → `world/codemap/kajuit.md`
- **`subsystems/dapper`** (themes/tokens, 22 / 3 198) · **`subsystems/drapes`** (Svelte components, 81 / 5 004) — kajuit's two subsystems, in its shard. **`subsystems/sheets`** — the TUI library (react/ink, `mod.jsx`), 34 / 1 457; no shard, ghost renders every effect through it.
- **`commons`** — the checkout's ONE package, `{owner:"@commons", type:"package", slug:"commons"}`. 114 / 12 806. **Not a workspace member**: `@commons/<type>/<slug>` resolves through paladin's pensieve, never through `import_map.json`. → `world/codemap/commons.md`
- **`testament`** — gitignored (`.gitignore:1`); on this disk, only `_bruno/`. → `world/codemap/testament.md`
- Cross-container laws → `world/codemap/invariants.md`. Every third-party pin lives in ONE file, `import_map.json` (svelte 5.39.6 · mikro-orm 6.6.7 · astro 7 · vite 6).

```json
// probe: parse(deno.jsonc).workspace → member: [name, #exports, #tasks]
{"typology": ["@vivalence/typology", 6, 27], "paladin": ["@vivalence/paladin", 2, 3], "dapper": ["@vivalence/dapper", 3, 1],
 "drapes": ["@vivalence/drapes", 1, 0], "sheets": ["@vivalence/sheets", 1, 0], "runtime": ["@vivalence/runtime", 7, 10],
 "kajuit": ["@vivalence/kajuit", 0, 9], "ghost": ["@vivalence/ghost", 2, 4], "documentation": [null, 0, 11]}
```

## the task graph

- **Every root task is a delegation** — `<container>/<verb>` forwards with `--cwd`; the root owns no logic. Learn a container's verbs in its own `deno.jsonc`.
- **`deno task test` never exits** — every `test` task carries `--watch`. One-shot: `deno test -A --no-check <container>/tests/*.test.js`. Root `exclude` keeps `./testament` and `./docs` out of check/fmt.
- **`unstable: ["raw-imports"]`** is what lets a mode import a `.svelte` file as text.
- **Four images, one pipeline** — `{vivalence,runtime,kajuit,documentation}/{build,tag,push}` → `registry.vivalence.org/beef/viva/vivalence/<name>:alpine`; `kajuit/build` stamps `VIVA_STAMP` from `jj` + `git`.

```json
// deno.jsonc — the delegating tasks, verbatim
{"tasks": {
  "typology/test": "deno task --cwd ./subsystems/typology test",
  "runtime/watch": "deno task --cwd ./systems/runtime watch",
  "kajuit/watch":  "deno task --cwd ./systems/kajuit watch",
  "build":   "DOCKER_BUILDKIT=1 deno task vivalence/build && deno task runtime/build && deno task kajuit/build && deno task documentation/build",
  "publish": "deno task build && deno task tag && deno task push"}}
```

## the boot chain — the same gate in every entrypoint

```js
// systems/runtime/run.js
await paladin.instance.mount();                    // paladin/mod.js already ran env + scopes at import
paladin.check.instance(paladin.instance).throw();  // ONE gate; an invalid record never reaches a Die
const die = new Die({ good: new Runtime() });
await die.populate(); await die.resolve(); await die.integrate(); await die.perpetuate();

// systems/kajuit/vite.config.mjs:11-15 — the client boots through the SAME gate
await paladin.instance.mount(); paladin.check.instance(paladin.instance).throw();
const client = paladin.instance.clients.kajuit;    // host + port come from the RECORD, strictPort

// systems/runtime/die.js:15-41
populate(){ wiring · registry · daemons · processes · aperture }
resolve(){ for (die of [...daemons, ...processes]) populate→resolve→integrate; then attach · expose · metadata }
integrate(){ launch · wake · announce; status = "alive" }
```

- **Lifecycle everywhere**: `construct → populate → resolve → integrate → disintegrate`, parent cascading to children. `perpetuate()` traps `SIGTERM/SIGINT/SIGQUIT` → `disintegrate()` → `Deno.exit(0)`.

## documentation — Astro 7 on Deno, serving docs.vivalence.org

24 files / 1 915 LOC; a workspace member with NO `name` — tasks only.

```sh
$ find documentation/content -maxdepth 2 -type d     # 23 *.mdx total
content/10-19_about/{11_identity,12_software,13_economics,14_license}
content/30-39_architecture/{32_daemon,33_ledger}
content/40-49_repository/41_tour
content/50-59_practice/51_guides
content/bak.2029-grammar/21_vocabulary               # parked, not routed
content/.tangled                                     # code captured from the repo
```

- **Live pages**: `11.01` · `12.01_slowstart` · `13.01` · `32.01` · `33.01` · `41.01` · `51.02`, each `XX.00` index, `home.mdx`, `jdex.mdx`. `src/pages/[...slug].astro` routes flat BY BASENAME → `docs.vivalence.org/12.01_slowstart`. Parked: `bak/content-scaffold/` (33 pages), 6 `*.mdx.bak`.
- **`capture` runs before every docs build** (`src/tangle.js`) — marked blocks are re-read from the repo, so a stale example is a build artefact, not a doc edit. **Read docs before containing anything; every landing asks whether a docs file wants it.**

## run surfaces

```sh
deno task runtime/run     # :2501 — bundles mode buffers ONCE; restart to re-bundle
deno task runtime/watch   # same, --watch=../../commons,$HOME/.viva/registry
deno task kajuit/watch    # :1794 — vite dev, VIVA_SYSTEM_ROLE=CLIENT, strictPort
deno task documentation/watch   # astro dev; no port set in astro.config.mjs → astro's default
viva …                    # systems/ghost/ghost.sh → deno run --config "$VIVA_REPOSITORY_MOUNT/deno.jsonc"
```

- **The ports are the RECORD's, not constants** — `hello-world/instance.viva.js` sets `runtime.statics.serve = paladin.env.get("VIVA_RUNTIME_SERVE")`, and its `v.environment` defaults `VIVA_RUNTIME_ORIGIN` to `:2501` and `VIVA_CLIENT_KAJUIT_ORIGIN` to `:1794`; every other address interpolates off those two.
- **Escalation, cheap → heavy**: scenario (in-memory daemon, the `*/scenarios` export) → aperture test over real HTTP → `runtime/run` + logs → kajuit + browser. `:2501/` 404 is NOT down — no root route.

## where to read the live system

- **`console.*` census** (source only): runtime 102 · typology 70 · commons 36 · kajuit 13 · ghost 11 · paladin 9 · dapper 6 · drapes 6 · sheets 0. Sites named per container shard.
- **spans/drains**: 125 `new Span(`/`.mark(`/`drain(` sites repo-wide. Root tap `systems/ghost/mod.js:24-36` — every `viva` call opens a `Span("ghost")`, marks the signal, faults on error.
- **taps at L2**: `viva instance/doctor --json` (state without booting) · `/metadata/*` on a live runtime · `~/.viva/logs/<slug>/` + the locks → `world/ledger.md` · `testament/_bruno/` (API testbench).
