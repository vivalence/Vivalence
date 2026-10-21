<!-- writer: agent · limit: 4000 chars · launch (no paths:) · codemap total ≤52000 (cap.py) · code is the map -->
# map — the repo at L2

Shards, path-gated (`.claude/rules → world/codemap`): `typology` (the vocabulary, HOLY) · `runtime` (Die, `/runtime/<slug>` + `/daemon/<slug>`) · `testing` (scenarios = rigs, specimen = toolbox) · `paladin` (env · scopes · record · `~/.viva`) · `ghost` (`viva`, the client die) · `design` (anima · dapper · drapes; tty via ghost) · `commons` (a package, NOT a workspace member). Edge: `quests/frontier.md`. Doctrine: `codestyle.md`. CORE = `typology` · `paladin` · `runtime`, a count names its cut (/"ghost not considered core. only typology · paladin · runtime"/); a feature = a registry package.

- **root tasks are `<container>/<verb>`; every container `test` but dapper's is `--watch`, never exits** — one file, one-shot, from the root. CLI-alive proof first.
```sh
# not deno.jsonc:33
deno test -A --no-check systems/runtime/tests/daemon/smoke.test.js   # one-shot
DENO_DIR=~/Library/Caches/deno HOME=$(mktemp -d) deno test -A --no-check <file>  # census, DENO_DIR first
viva --help; echo $?                                                  # 0 before any suite count
```
- **a repo test reaches another package ONLY through `accio`**; ONE module-not-found aborts the suite; `tests/snapshots/` gitignored: a fresh tree runs `SNAPSHOT_HOT=1` once.
```js
// systems/runtime/tests/scenarios/registry.js:8
export async function accio(identifier) {
  supplied ??= paladin.ledger.registry.supply();
  await supplied;
  return await paladin.ledger.registry.accio(identifier);
```
- **`runtime/watch` watches `commons` + `~/.viva/registry` minus `**/dataset/**`; a save under a watcher IS a deploy** (`lsof -nP -iTCP:2501 -sTCP:LISTEN` before the first write); `--watch` restarts IN-PROCESS — read `Restarting!`, never `ps`.
```jsonc
// systems/runtime/deno.jsonc
"watch": "deno run -A --watch=../../commons,$HOME/.viva/registry --watch-exclude=**/dataset/** run.js",
```
- **ports from the ledger recipe**: runtime `:2501`, anima `:1794`; `:2501/` 404 ≠ down. `viva --help` rc 0, HOME empty: `seat` runs after `help`; a shell verb is `.open`ed (`traverse` skips a leaf branch's steps, m96 #22). Ready = the `start` track (`process.js:6`); bind at beat 4, `/status` `IDLE` till then.
- **VCS = jj colocated over git** — READ only, subcommand FIRST, cite CHANGE ids; `@` IS a commit, no staging; bookmarks only to push.
```sh
jj log -n 8 --no-graph
jj diff -r <change>
git show <id>:<path>          # pre-edit text: <id> from jj evolog, HEAD is @-
```
- **`import_map.json` is the ROOT's only**: a repo dep enters HERE, exact, never a prefix-map or inline `npm:`; a registry package imports by URL; a twin runs `--no-lock --reload=<origin>` or `deno.lock` eats localhost. REJECTED `node-gyp` to hush a warning — relocks vite 8, exit 1.
- **mikro 7.2.3 owns the db**: migrations off `.snapshot-*.json`, never by hand; relation targets `() => X`; `pivotTable` · `joinColumns` on every m:n owner; auto-flush only on a queued persist of THAT type; `lazy` props populate BY NAME; a hook cannot flush; filters skip `$none/$some`; **a rebuild copies an ADDED column as `null`** → `nullable: true`; a faulted `up()` lands half (`transactional: false`) and the snapshot hides the diff; `loadStrategy` declared ONCE (`libsql.viva.js:15`).
- **a trait is CAST once, loud, at hydration** (m105 Q4′); reads `entity.trait.NAME`. Client domain-blind: domain words are DATA; mode UI only via View rows (m87 Q10′).
- **one dispatch shape everywhere**, every effect returns `{condition, output}`, ctx is FLAT (`contexts.host` words, never `ctx.daemon`).
```js
// subsystems/typology/gestalten/belt/hallucinate.js:92
steer.dispatch.invoke(armed, new ToolCall(call.name).signal, steer.strategy.guarded)(call.input),
```
- **docs `documentation/` (Astro 7)**: never `@deno/vite-plugin`; MDX rejects `<!-- -->`; CSS proven on `astro build` + `preview`; NEVER `deno fmt` (~120 cols).
