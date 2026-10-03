---
name: domain
description: >-
  Author a domain barrel the daemon reads at six points — entities · schematics · aperture · tools · manifest,
  plus an optional resolve hook — where routes are repository verbs, tools ride their route through daemon.call
  carrying the caller, and traits are EXPOSED and TOOLING or nothing works. Use when writing a domain, adding
  a route or tool, or when daemon.call / tools / routes silently do nothing.
when_to_use: >-
  "new domain" · "add a route" · "add a tool to the domain" · "the domain barrel" · `domain/<slug>.viva.js` is
  open · "daemon.domain" · "daemon.call is undefined" · "why does this domain have no traits" · "routes are
  verbs".
---
<!-- limit: 6000 chars -->
# domain — "new domain" · "add a route": five keys, six read points, routes are verbs

REJECTED 10-07: *door* — /"Stop using the word doors. … We don't have drivers or doors anywhere."/ An aperture OPENS a route. A domain is a trait SOURCE, never a class, layer or table: /"The domain might configure stuff, but so might any other mode."/

Canon: `subsystems/typology/schematics/primitives/kernel.js:7-15` (the `Domain` cast) · `systems/runtime/lifecycle/daemon/{population,resolution}.js` · `world/codemap/assembly.md`. Exemplars: `~/.viva/registry/assembly/domain/assembly/assembly.viva.js` (the reference, 5 keys) · `chess/domain/chess.viva.js` (5 + `resolve`).

## The barrel — beef's ruling

/"The barrel is `entities · schematics · aperture · tools · manifest` and nothing else."/ · /"wtf are kinds? who and how is the daemon supposed to interpret this"/ · /"why are these exported?!?!?"/ · /"why does this domain not have any traits??? you clearly did not design for vivalence"/

`assembly/domain/assembly/assembly.viva.js:1-17`:

```js
export * from "./entities/index.js";
export * as schematics from "./schematics.js";
export { aperture } from "./aperture/index.js";
export { tools } from "./tools/index.js";
export const manifest = { type: "domain", slug: "assembly", traits: ["EXPOSED", "TOOLING"] };
```

`entities` is ONE named object; `schematics` is the ancestor key, never flat; `aperture` is NAMED — a star re-exports every const in that file, `resolve` included, silently.

| key | read at | what it does |
|---|---|---|
| `entities` | `population.js:11` → `entities/assemble.js` tier fold | the domain's repositories |
| `manifest.traits` | `population.js:80` → `gestalten/belt/stagger.js:3` | a domain IS a kernel Mode; `[]` = no `daemon.call`, no tools, no routes |
| `traits` | `population.js:10` | the domain's implementations WIN over the runtime's |
| `schematics` | `kernel.js:12` | `daemon.domain.schematics.X` — the ONLY runtime path a mode has in |
| `aperture` | `resolution.js:6-9`; `daemon.call = shape.proxy(domain.aperture, steer.strategy.direct)` | the routes |
| `resolve` | `resolution.js:12` `await die.daemon.domain.resolve?.(die.daemon)` — receives the DAEMON | optional hook for the domain's own userspace entities |
| `tools` | `harnessed.js`, armed as `<slug>_*` | the verbs the harness arms |

`additionalProperties: true` on the cast is what lets `aperture`/`tools`/`resolve` survive. Outliers, do not copy: education/vcompany star-export the aperture; stucatch carries no `schematics`/`tools` and puts folds ON the barrel (boots only because the cast defaults `schematics` to `{}` and HARNESSED guards `if (daemon.domain?.tools)`).

## Routes are verbs, tools ride routes — one function

`assembly/domain/assembly/tools/mint.js:7-10`: `through(route)` — the tool calls `daemon.call[route]({user, mode, thread, input})`. The asymmetry: the route's input is `v.object({...VERBS.part, owner: OWNER})`, the tool's is `v.object(VERBS.part)`.

A route is ONE repository call; the route may take an optional `owner`, a tool never does — the caller's mode owns what it mints. The App calls the same route over the wire. /"the domain's aperture never branches an entity capability — a capability is a repository verb"/ A second road to the same rows is the defect. REJECTED: an `owner(kind)` lookup — /"every writer takes the owner from the caller … The domain never looks a topology up"/. Tool-first is a MODE's seat, not the domain's.

## The three failures

1. **a stray `resolve` export is a boot-killer** — assembly's `resolve` was the glTF fold; `Die.resolve` threw `no row named "undefined"` beneath 22 green steps because the rig collated by hand and never built a Die. Pinned: `assembly/domain/assembly/tests/aperture.test.js:13-15` asserts `rig.daemon.domain.resolve` undefined.
2. **`traits: []` silently disables everything** — and a test asserted the absence. `["EXPOSED", "TOOLING"]` (5/5 domains EXPOSED, 4/5 TOOLING).
3. **flat shapes** — /"both of these are too flat?! there should be a ancestor key. schematics."/ `types.js` → `schematics.js`, one key; 23 import sites swept. A careless grep reads `daemon.domain.schematics.*` as dead — 2 of its 4 sites are tests; `education/modes/teacher/francesca/harness.js:26` reads it at runtime.

## Where a domain's things live

Literals, folds, twitches → the domain (`daemon.domain.*`), never a mode. The client stays domain-blind. The domain reaches modes at runtime, never by path; package fixtures sit at `<pkg>/tests/`.

## The rig — mount the way resolution.domain does

`assembly/tests/rig.js:79-94` — bound · slurped · `daemon.call` · the hook · `shape.http` · inline Connection:

```js
daemon.aperture.use(shard.context.bind("daemon", daemon)); domain.aperture.use(shard.context.bind("daemon", daemon));
daemon.aperture.slurp(domain.aperture); daemon.call = shape.proxy(domain.aperture, steer.strategy.direct);
await domain.resolve?.({ good: daemon });
```

`provider` from `@vivalence/runtime/scenarios` gives the in-memory datamap. Known debt: assembly and chess each copy `collate`/`seal` out of `population.js` verbatim — neither is exported; no runtime test calls `lifecycle.mount`, so unit-green over a hand-built rig is not evidence the daemon boots → skill `change`.
