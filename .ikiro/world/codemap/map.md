<!-- writer: agent · limit: 3600 chars · launch (no paths:) · codemap total ≤52000 (cap.py) -->
# map — the repo in one page

A shard loads when a file under its path is read: `typology` (the vocabulary, ask before touching core types) · `runtime` · `testing` · `paladin` (the environment, `~/.viva`) · `ghost` (the `viva` client) · `design` (anima, dapper, drapes) · `commons`.

The live edge is `.ikiro/quests/frontier.md`. Core is typology, paladin and runtime. A feature is a registry package.

## tasks and tests

Root tasks are `<container>/<verb>`. A container's `test` task watches and never exits. Run one file, one shot, from the root:

```sh
deno test -A --no-check systems/runtime/tests/daemon/smoke.test.js
DENO_DIR=~/Library/Caches/deno HOME=$(mktemp -d) deno test -A --no-check <file>
viva --help; echo $?
```

- `viva --help` must exit 0 before any suite count means anything.
- A repo test reaches another package only through `accio`. One missing module aborts the suite.
- `tests/snapshots/` is ignored by git. A fresh tree runs `SNAPSHOT_HOT=1` once.

## the running system

- The runtime is on `:2501`, anima on `:1794`. A 404 on `:2501/` does not mean down.
- A save under `runtime/watch` is a deploy. Vite on `:1794` too. Check `lsof` first.
- A change of several files lands in one pass. Done means a new route answers.

## version control

jj over git. I read, never write.

```sh
jj log --ignore-working-copy -n 8
jj diff -r <change>
git show <id>:<path>
```

## dependencies

`import_map.json` at the root is the only one. A repo dependency enters there, exact. Never an inline `npm:`. Registry packages import by URL.

## the database: mikro-orm 7

- Migrations come from the snapshot files, never by hand.
- Relation targets are `() => X`. Every many-to-many owner names `pivotTable` and `joinColumns`.
- A hook cannot flush.
- `wrap(x).assign` throws on an entity that was created but not flushed.
- A rebuilt table copies an added column as `null`: make it `nullable: true`.
- A failed `up()` lands half. Restore it, never retry.

## shapes that hold everywhere

- A trait is cast once at hydration. Reads are `entity.trait.NAME`.
- The client is domain-blind. Domain words are data.
- One dispatch shape. Every effect returns `{ condition, output }`.

## docs

`documentation/` is Astro. MDX rejects `<!-- -->`. Never run `deno fmt`.
