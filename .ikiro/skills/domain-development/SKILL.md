---
name: domain-development
description: >-
  Author a domain barrel the daemon reads at six points — entities · schematics · aperture · tools · manifest,
  plus an optional resolve hook — where doors are repository verbs, tools ride their door through daemon.call
  carrying the caller, and traits are EXPOSED and TOOLING or nothing works. Use when writing a domain, adding
  a door or tool, or when daemon.call / tools / doors silently do nothing.
when_to_use: >-
  "new domain" · "add a door" · "add a tool to the domain" · "the domain barrel" · `domain/<slug>.viva.js` is
  open · "daemon.domain" · "daemon.call is undefined" · "why does this domain have no traits" · "doors are verbs".
---

# domain-development — five keys, six read points, doors are verbs

Canon (measured 09-22): `subsystems/typology/schematics/primitives/kernel.js:7-15` (the `Domain` cast) · `systems/runtime/lifecycle/daemon/{population,resolution}.js` · `world/codemap/assembly.md` · memory `project_domain_barrel_contract` · `m67-assembly-ontology.org` rulings 13 · 14. Exemplars: `~/.viva/registry/assembly/domain/assembly/assembly.viva.js` (the reference, 5 keys) · `chess/domain/chess.viva.js` (5 + `resolve`).

## The barrel — beef's ruling

*"The barrel is `entities · schematics · aperture · tools · manifest` and nothing else."* · *"wtf are kinds? who and how is the daemon supposed to interpret this"* · *"why are these exported?!?!?"* · *"why does this domain not have any traits??? you clearly did not design for vivalence"*

```js
// assembly/domain/assembly/assembly.viva.js:1-17 — the reference shape
export * from "./entities/index.js";              // → entities: { literal, symbol, … }  ONE named object
export * as schematics from "./schematics.js";    // the ancestor key — never flat
export { aperture } from "./aperture/index.js";   // NAMED — a star re-exports every const in that file, resolve included, silently
export { tools } from "./tools/index.js";
export const manifest = { type: "domain", slug: "assembly", …, traits: ["EXPOSED", "TOOLING"] };
```

| key | read at | what it does |
|---|---|---|
| `entities` | `population.js:11` assembled into the tier fold (`entities/assemble.js`) | the domain's repositories |
| `manifest.traits` | `population.js:80` → `gestalten/belt/stagger.js:3` (`stagger`) | a domain IS a kernel Mode; `[]` = no `daemon.call`, no tools, no doors |
| `traits` (implementations) | `population.js:10` — the domain's WIN over the runtime's | |
| `schematics` | declared on the cast, `kernel.js:12` | `daemon.domain.schematics.X` — the ONLY runtime path a mode has into the domain |
| `aperture` | `resolution.js:6-9` slurped; `daemon.call = shape.proxy(domain.aperture, steer.strategy.direct)` | the doors |
| `resolve` | `resolution.js:12` `await die.daemon.domain.resolve?.(die.daemon)` — receives the DAEMON (m74 M5) | optional hook for the domain's OWN userspace entities |
| `tools` | `harnessed.js` armed as `<slug>_*` | the verbs the harness arms |

`additionalProperties: true` on the cast is what lets `aperture`/`tools`/`resolve` survive. Two outliers on disk, do not copy: education/vcompany star-export the aperture; stucatch carries no `schematics`/`tools` and puts folds ON the barrel (boots only because the cast defaults `schematics` to `{}` and HARNESSED guards `if (daemon.domain?.tools)`).

## Doors are verbs, tools ride doors — one function

```js
// assembly/domain/assembly/tools/mint.js:7-10 — through(door): the tool calls daemon.call[door]({user, mode, thread, input})
// the asymmetry: the door's input is v.object({...VERBS.part, owner: OWNER}); the tool's is v.object(VERBS.part)
```

A door is ONE repository call; the door may take an optional `owner`, a tool never does — the caller's mode owns what it mints. The App calls the same door over the wire. *"the domain's aperture never branches an entity capability — a capability is a repository verb"* (m61 D16). A second road to the same rows is the defect. **Never an `owner(kind)` lookup** — *"every writer takes the owner from the caller … The domain never looks a topology up"* (m67 ruling 13, strikes m61 D11). Tool-first is a MODE's seat, not the domain's (ruling 14).

## The three failures with a measured ledger behind them

1. **a stray `resolve` export is a boot-killer** — assembly's `resolve` was the glTF fold; `Die.resolve` threw `no row named "undefined"` beneath 22 green steps because the rig collated by hand and never built a Die. Pinned: `assembly/domain/assembly/tests/aperture.test.js:13-15` asserts `rig.daemon.domain.resolve` undefined.
2. **`traits: []` silently disables everything** — and a test asserted the absence. `["EXPOSED", "TOOLING"]` (5/5 domains EXPOSED, 4/5 TOOLING).
3. **flat shapes** — *"both of these are too flat?! there should be a ancestor key. schematics."* `types.js` → `schematics.js`, one key; 23 import sites swept. A careless grep reads `daemon.domain.schematics.*` as dead — 2 of its 4 sites are tests; `education/modes/teacher/francesca/harness.js:26` reads it at runtime.

## Where a domain's things live

Literals, folds, twitches → the domain (`daemon.domain.*`), never a mode (`feedback_hand_knows_foot` · `fit-existing-trees`). The client stays domain-blind (`feedback_client_domain_blind`). The domain reaches modes at runtime, never by path; package fixtures sit at `<pkg>/tests/`.

## The rig — mount the way resolution.domain does

```js
// assembly/tests/rig.js:79-94 — bound · slurped · daemon.call · the hook · shape.http · inline Connection
daemon.aperture.use(shard.context.bind("daemon", daemon)); domain.aperture.use(shard.context.bind("daemon", daemon));
daemon.aperture.slurp(domain.aperture); daemon.call = shape.proxy(domain.aperture, steer.strategy.direct);
await domain.resolve?.({ good: daemon });
```

`provider` from `@vivalence/runtime/scenarios` gives the in-memory datamap. Known debt: assembly and chess each copy `collate`/`seal` out of `population.js` verbatim — neither is exported from the runtime; and no runtime test calls `lifecycle.mount`, so unit-green over a hand-built rig is not evidence the daemon boots ([[testing]]).
