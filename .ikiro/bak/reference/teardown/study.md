<!-- limit: 5000 chars · measured 2026-11-11 · a STUDY, PARKED by his word · no quest -->
# teardown — how the tree opens and closes, measured

beef, asking: /"I do not like the idea, the way that we have solved it a couple of times now, that we have a terminate function. And especially I don't like that in the way that we handle the surface mounting and dismounting. Although that libraries like Svelte and Solid use this pattern is an indicator that it actually makes sense"/
beef, parking it: /"none of this makes sense and its scope creep. lets go back to the original problem and get just that right and worry about unification later."/ · /"i dont like that we have so many words for this."/

Not understood as told: /"i dont understand the two forms."/ — a retelling starts from ONE example written both ways.

## the four forms

1. the beat that closes itself — setup above `await next()`, teardown in its `finally`. 23 `finally` blocks across the runtime's and ghost's lifecycles and shards. `systems/ghost/subjects/app/lifecycle.js:21`.
2. the returned closer — the opener hands back what undoes it: `subscribe → off` · `listen → unlisten` · `stall.watch() → unwatch` · `surface.mount() → unmount` · Solid `render → dispose` · a view bundle's `{ destroy }` (`subsystems/typology/gestalten/bundle/svelte.js:67`).
3. the registered list — a trait returns `{ finalize, terminate }`, `stagger` stores it on the module (`subsystems/typology/gestalten/belt/traits.js:14`), someone else runs it.
4. methods on an object — paladin's `Wafer`: `populate · resolve · integrate · disintegrate` (`subsystems/typology/prototypes/wafer.js:23`).

The `Controller` decides WHEN (`SIGTERM` → `control.hold` lets go); the `finally` blocks do the work.

## form 3, measured

- producers 3: `systems/runtime/subjects/mode/traits/booted.js:11` · `datasink.js:126` · `systems/ghost/subjects/client/traits/home.js:29`.
- runners 4: `systems/runtime/gestalten/belt/modes.js:15` · `systems/runtime/subjects/service/lifecycle/2-resolution.js:10` (no producer) · `systems/ghost/subjects/client/lifecycle/index.js:87` · `systems/ghost/gestalten/shard/host.js:48`.
- the list sits on the module, in ghost on the mask (`clientDie.mask.terminators`); nothing clears it.
- three runners reverse, `belt.modes.release` does not; no runner guards one terminator from the next.
- cause: a trait is `(module, context)`, no `next`. All three producers are sets fixed at boot.
- the tree composes a child's whole execution into its parent's vector once: `systems/ghost/subjects/client/lifecycle/index.js:62` (`authorized`).

## surfaces

- app level: form 2 consumed by form 1 (`app/lifecycle.js:21`).
- a mode's view inside the Solid tree: ghost waits for the load before destroying (`systems/ghost/surfaces/chrome/panels/frame/frame.jsx:110`); anima does not (`systems/anima/src/surfaces/chrome/widgets/buffer/painters.jsx:23`, `if (handle !== null) handle.destroy()`).
- DEFECT, read from code, not reproduced, UNFILED (`known-issues.org` at 199913 of 200000 chars on 11-11): anima — a view unmounted before its bundle loads is mounted afterwards and never destroyed.
- two shapes of closer: a bare function · a `{ destroy }` handle.
- a hand-kept map of closers per terminal: `systems/ghost/subjects/client/lifecycle/index.js:94` (`terminals`).

## one act, eighteen words — product source, five containers, tests and `bak` out

| word | hits | word | hits |
|---|---|---|---|
| `off` | 64 | `destroy` | 14 |
| `release` | 39 | `detach` | 13 |
| `untap` | 24 | `disintegrate` | 12 |
| `.stop(` | 22 | `dispose` | 11 |
| `teardown` | 21 | `terminate` | 11 |
| `.close(` | 20 | `unsubscribe` | 11 |
| `.abort(` | 15 | `unlisten` | 4 |
| `.kill(` | 14 | `unmount` | 4 |
| | | `unwatch` | 3 |
| | | `restored` | 2 |

## what waits on this

- who closes what a `provider` opened (stockfish's child): `.ikiro/reference/services/formalization.md`, owed. Two answers were shown and neither taken: the provider's own `close` pushed onto `mode.terminators` · stockfish as an `ATTACHED` service (`close.probe.js` · `attached.probe.js` beside the formalization).
- his words for the act: `on/off` fine, `mount/unmount` /"might be too. letssee."/ Killed: the word I used for the probe's example.
