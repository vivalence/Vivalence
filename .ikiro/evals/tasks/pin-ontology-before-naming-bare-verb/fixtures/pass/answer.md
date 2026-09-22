The verbs already have the noun: `instance/use` says "select this shell's instance" and `instances/list` prints `selected` (`systems/ghost/trajectories/index.js:25`, `instances/index.js:29`). `mounted` is taken — a test helper in `tests/target.test.js` and a branch in `harnessed.js` — so not that.

- `selected(ctx)` — the instance selected for this shell, or throws
- `selection(ctx)` — the noun the slowstart uses
- `selectedInstance(ctx)` — if the bare adjective reads too thin next to `instances`

```
grep -rln '\bselected\b\|\bselection\b' systems/ghost → trajectories/instances/index.js (a column label), nothing else
```
