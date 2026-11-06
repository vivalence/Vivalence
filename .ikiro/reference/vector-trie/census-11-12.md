<!-- writer: agent · limit: 4000 chars · the BEFORE pin of quests/done/vector-trie.org milestone 1 -->
# collision census — 11-12, before any edit

Every time `branch` · `open` · `do` · `graft` lands on a nature (or a node) that is already taken, the instrument writes one entry. Rich = the pattern carries a declared key (`valence` · `input` · `chord` · `rank` · …); bare = a path segment only.

```sh
# from the repo root; the instrument is census.preload.js, the table is census.py
export CENSUS_OUT=$(mktemp) DENO_DIR=~/Library/Caches/deno HOME=$(mktemp -d)
for suite in systems/ghost/tests systems/runtime/tests/mode subsystems/typology/tests commons/instances/hello-world/tests; do
  deno test -A --no-check --preload .ikiro/reference/vector-trie/census.preload.js $suite
done
python3 .ikiro/reference/vector-trie/census.py $CENSUS_OUT
```

Suites, all green: ghost 33 passed (111 steps) · runtime `tests/mode` 12 (65) · typology 162 (701) · hello-world 19 (64). Two full passes gave the same total.

total 2267

| via | class | hits | top natures |
|---|---|---|---|
| branch | bare → bare | 1452 | fs 224 · leader 193 · widget 95 · toggle 95 |
| branch | rich → bare | 578 | filter 95 · repl 76 · buffer 76 · terminal 57 |
| graft | rich → rich | 125 | new 100 · create 11 · update 10 · h 1 |
| graft | bare → rich | 69 | a 31 · d 31 · h 4 · e 1 |
| graft | bare → bare | 29 | view 11 · hello 8 · buffer 3 · dialogue 2 |
| graft | effect over effect | 3 | (node) 3 |
| graft | rich → bare | 2 | d 2 |
| open | effect over effect | 9 | SIGTERM 2 · SIGSTOP 2 · SIGCONT 2 · SIGKILL 2 |

| effect over effect, by caller | hits |
|---|---|
| open SIGTERM — systems/ghost/entities/activity/hydration.js:6:83 | 2 |
| open SIGSTOP — systems/ghost/entities/activity/hydration.js:6:83 | 2 |
| open SIGCONT — systems/ghost/entities/activity/hydration.js:6:83 | 2 |
| open SIGKILL — systems/ghost/entities/activity/hydration.js:6:83 | 2 |
| graft (node) — systems/ghost/subjects/terminal/legend.js:39:25 | 1 |
| open x — subsystems/typology/tests/vector.test.js:40:32 | 1 |
| graft (node) — subsystems/typology/tests/vector.test.js:103:44 | 1 |
| graft (node) — subsystems/typology/tests/vector.test.js:157:45 | 1 |

same pattern object on both sides: 52 (one vector grafted twice onto one target; 50 of them `new`)

What the table says:

- `branch` never meets a rich pattern with a rich one (0) and never fills a bare one (0): merging in `branch` changes no measured case.
- `do` never lands on a taken node (0): dropping its early return changes no measured case.
- the drill's first count was 2215 — it skipped the 52 same-object grafts; this instrument counts them.
- one ghost pass went red once in three (32 passed, 1 failed), with and without the instrument green after: the standing lifecycle flake, `ghost-base-tree-reds-11-06`.
