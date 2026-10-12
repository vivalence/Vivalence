<!-- writer: agent · limit: 2100 chars · launch (no paths:) · world/codemap totals ≤15000 chars (methods/cap.py) -->
# map — the repo at L2

Shards here, path-gated: `subsystems/typology` (the vocabulary, HOLY) · `subsystems/paladin` (env · scopes · record · `~/.viva`) · `systems/runtime` (Die, `/runtime/<slug>` + `/daemon/<slug>`) · `systems/ghost` (`viva`, the client die) · `systems/anima` + `subsystems/{dapper,drapes,sheets}` (design.md) · `commons` (a package, NOT a workspace member) · `testament` (gitignored scratch). Live edge: `quests/frontier.md`.

- root tasks are `<container>/<verb>`; `deno task test` never exits — one-shot `deno test -A --no-check <file>`. CLI-alive proof first: `viva --help` exit 0. A test reaches another package through `systems/runtime/tests/scenarios/registry.js` `accio(reference)`; ONE module-not-found aborts the suite. A repo test never reads this machine: census = `HOME=<empty dir>`.
- `runtime/watch` watches `commons` + `~/.viva/registry` minus `**/dataset/**`; `--watch` restarts IN-PROCESS — read the log, never `ps`. A save under a watcher IS a deploy.
- ports: runtime `:2501`, anima `:1794`; `:2501/` 404 is not down. Readiness = stdout `Status:RUNNING`.
- VCS = jj over git: READ `jj log` · `jj diff -r <change>`; cite CHANGE ids; subcommand FIRST.
- `import_map.json` is the ROOT's only; no prefix-map into `npm:`; registry packages import by URL.
- mikro 7.2.3 owns the db: migrations off `.snapshot-*.json`; relation targets `() => X`; `pivotTable` · `joinColumns` on every m:n owner; auto-flush only on a queued persist of that type — load what a mutation walks, or flush first; `lazy` props populate BY NAME; a hook cannot flush; filters skip `$none/$some`.
- a trait is a CLAIM: `v.<entity>.trait(row, NAME)`, never `row.trait?.NAME`. The client is domain-blind: domain words arrive as DATA; mode UI only through the APPLICATION bundle.
- docs `documentation/` (Astro 7): never `@deno/vite-plugin`; MDX rejects `<!-- -->`; prod refresh manual. `tests/snapshots/` gitignored, `SNAPSHOT_HOT=1` regenerates; a CAPTURE test cannot go red.
