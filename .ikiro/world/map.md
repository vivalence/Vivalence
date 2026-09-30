# map — the repo at L2
<!-- writer: agent · kind: persistent · limit: 8000 chars -->

Containers, each with a path-gated shard in `world/codemap/`: `subsystems/typology` (the vocabulary, holy) · `subsystems/paladin` (env, scopes, instance record) · `systems/runtime` (Die, daemons, traits, aperture) · `systems/ghost` (`viva`; `~/.viva` → `world/ledger.md`) · `systems/anima` (SvelteKit client) · `subsystems/{dapper,drapes,sheets}` (design: tokens · Svelte components · ink TUI kit) · `commons` (a package, NOT a workspace member — resolves through paladin) · `testament` (gitignored). Laws across all: `codemap/invariants.md`.

- root tasks are `<container>/<verb>` + aggregates — build · tag · push · stamp run at root (`docker`, `jj log`), ghost's run · watch · install call `systems/ghost` directly, the rest delegate (`--cwd`); `deno task test` never exits (`--watch`) — one-shot `deno test -A --no-check <file>`. `project_test_suite_baseline`
- `runtime/watch` watches `commons` + `~/.viva/registry`: every save there deploys. `feedback_watched_tree_lands_in_one_burst`
- ports come from the instance record: runtime `:2501`, anima `:1794`; `:2501/` 404 is not down. (`commons/instances/hello-world/instance.viva.js:61`)
- every entrypoint boots through `lifecycle.mount(paladin.instance)`; the runtime checks the record in its first lifecycle beat, `paladin.check.instance(…).throw()` (`systems/runtime/run.js:7` · `systems/runtime/lifecycle/runtime/population.js:9`, m74 M5). `run.js` executes `lifecycle.runtime.execution` on a die `{ controller, mask, runtime }`; readiness is the stdout line `Status:RUNNING`.
- docs: `documentation/` (Astro), `capture` re-runs every `content/**/*.example.js` into its `.snapshot.json` before every build. (`documentation/src/tangle.js:33`)

- docs (`documentation/`, Astro 7 on Deno): never `@deno/vite-plugin` (rejects `virtual:`); npm deps only in ROOT `import_map.json`; `rm -rf .astro` under `documentation/watch` kills the dev store for good — `astro build --force` / restart; MDX rejects `<!-- -->` (use `{/* */}`); `src/tangle.js` capture cannot fail (errors → snapshot, exit 0); prove CSS on `astro build` + `astro preview --port 4322`, never dev HMR; the image builds on glibc (Rolldown has no musl binding under deno); prod refresh is manual (no `deploy-documentation` CI stage). (`documentation/src/tangle.js:38`)
- VCS = jj colocated over git (`.jj/` + `.git/`): READ with `jj log` · `jj diff -r <change>` · `jj show`; `@` IS a commit, no staging; cite CHANGE ids; bookmarks exist only to push (/"we only do bookmarks for special occasions"/) — every graph op is beef's (ikiro.md VCS law). (`.ikiro/hooks/vcs-guard.sh:49`)
- `deno … --watch` restarts IN-PROCESS: same PID, same etime — `ps` is never restart evidence; read the watcher's log line. · compact the-app-that-never-wrote-its-note
- NEVER `deno fmt`: `deno.jsonc` has no `fmt` block, files are hand-kept ~120 cols, fmt reflows the WHOLE file to 80. Mangled → `git show HEAD:<path> > scratch`, reapply the hunk by hand. `project_no_deno_fmt`
- `subsystems/sheets` — the TUI kit (ink@5 + react@18 JSX, deps via root `import_map.json`): `state/*.js` pure reducers (the TDD surface) · `components/*.jsx` thin views; ghost renders a trajectory's own `*.jsx` (`Init` · `Doctor` · `Help`, sheets atoms inside) through `ctx.view.scroll.render(props, null, Component)`; never `minHeight = stdout.rows` (full repaint per key). (`systems/ghost/trajectories/instance/init.js:149`)
- CLI-alive proof before any suite count: `viva /help` (every verb imports ghost's belt at module scope). A test reaches another package through `systems/runtime/tests/scenarios/registry.js` `accio(reference)`, never a relative path; ONE module-not-found in a collected file aborts the whole suite.
- Deno cannot prefix-map into `npm:` — `"three/addons/": "npm:three/addons/"` fails; only exact entries work (`"three/addons/controls/OrbitControls.js": "npm:three@…/examples/jsm/controls/OrbitControls.js"`). A registry package adds nothing to the repo's `import_map.json` and imports by URL. (`chess/topographies/puzzles/harvest.js:12`)

<!-- generated: python3 .ikiro/methods/codemap.py map — never hand-edited -->
```jsonc
// deno.jsonc — the workspace
{
 "workspace": ["systems/runtime", "systems/anima", "systems/ghost", "subsystems/typology", "subsystems/paladin", "subsystems/dapper", "subsystems/drapes", "subsystems/sheets", "documentation"],
 "not members": {"commons": "package.viva.js", "testament": "(no manifest)"},
 "excluded": ["./testament", "./docs"],
 "root tasks by container": {
  "tree": ["(root)"],
  "gource": ["(root)"],
  "dependencies": ["(root)"],
  "install": ["(root)"],
  "paladin": ["test"],
  "typology": ["test", "test/snapshots"],
  "runtime": ["test", "test/snapshots", "run", "watch", "build", "tag", "push"],
  "anima": ["test", "run", "watch", "bundle", "stamp", "build", "tag", "push"],
  "ghost": ["test", "run", "watch", "install"],
  "documentation": ["run", "watch", "stop", "bundle", "build", "tag", "push"],
  "vivalence": ["build", "tag", "push"],
  "build": ["(root)"],
  "tag": ["(root)"],
  "push": ["(root)"],
  "publish": ["(root)"]
 }
}
```
<!-- /generated -->
