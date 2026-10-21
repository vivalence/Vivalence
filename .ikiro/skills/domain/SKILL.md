---
name: domain
description: >-
  Author a domain barrel the daemon reads — traits · schematics · aperture · tools · manifest, plus an optional
  twitch — a trait SOURCE, never a class, layer or table: routes are repository verbs, tools ride their route
  through ctx.call carrying the caller, and manifest traits are EXPOSED and TOOLING or nothing works. Use when
  writing a domain, adding a trait, route or tool, or when ctx.call / tools / routes / a trait verb do nothing.
when_to_use: >-
  "new domain" · "add a route" · "add a trait" · "add a tool to the domain" · "the domain barrel" ·
  `domain/<slug>.viva.js` is open · "ctx.domain" · "ctx.call is undefined" · "why does this domain have no
  traits" · "routes are verbs" · "claims no".
---
<!-- limit: 6000 chars -->
# domain — "new domain" · "add a trait" · "add a route": a trait source, routes are verbs

REJECTED 10-07: *door* — /"Stop using the word doors. … We don't have drivers or doors anywhere."/ An aperture OPENS a route. A domain is a trait SOURCE, never a class, layer or table: /"The domain does not play in here. The domain might configure stuff, but so might any other mode."/ REJECTED 10-08 (m80): `entities` on the barrel, a domain table or class, a `resolve` hook over its own routes — the schema is FIXED at the kernel, a daemon is a column and a repository.

Canon: `subsystems/typology/schematics/primitives/kernel.js:7-15` (the `Domain` cast) · `systems/runtime/subjects/daemon/lifecycle/{population,resolution}` · `systems/runtime/gestalten/belt/traits.js` (`gather · mint · strike`) · m80's `* the law`. Exemplars: `~/.viva/registry/chess/domain/chess.viva.js` · `education/domain/domain.viva.js` (+ `twitch`). vcompany · stucatch still carry pre-m80 `entities`: never copy them.

## The barrel

/"2 b"/ (10-08): a domain keeps `export * as`; `v.cast` copies a module namespace before it fills.

`chess/domain/chess.viva.js:1-4`:

```js
export * as traits from "./traits/index.js";
export * as schematics from "./schematics.js";
export { aperture } from "./aperture/index.js";
export { tools } from "./tools/index.js";
export const manifest = { type: "domain", slug: "chess", traits: ["EXPOSED", "TOOLING"] };
```

| key | read at | what it does |
|---|---|---|
| `traits` | `population.js:26` `gather` → `mint` → `strike` | `{ literal, symbol, note, mode }`, arrays of `define(…)`; the daemon's repositories `die.daemon.entities.<kind>` |
| `manifest.traits` | `gestalten/belt/traits.js:5` | a domain IS a `modes` entry (`registry.js:279`); `[]` = no tools, no routes; `daemon.call` comes with any `aperture` |
| `schematics` | `kernel.js:12` | `ctx.domain.schematics.X`, the ONLY runtime path a mode has in |
| `aperture` | `resolution.js:15-18` | grafted under the daemon, the host's words spread on it; `daemon.call = shape.proxy(domain.aperture, steer.strategy.direct)` |
| `twitch` | `population.js:31` | grafted on the daemon's twitch; ctx carries the host's words flat (`population.js:29`) — /"twiches are rich."/ |
| `tools` | `harnessed.js:73`, armed as `<slug>_*` | the verbs the harness arms |

`additionalProperties: true` on the cast is what lets `aperture`/`tools` survive. `resolution.js:21` still calls `domain.resolve?.(daemon)`: a star-exported aperture (education's) carries a stray `resolve` in.

## A trait — three halves

`subsystems/typology/gestalten/belt/traits.js:5` `define(NAME, { schematic, repository, entity })`:

- `schematic` — the payload under `row.trait[NAME]`; a row HAS the trait by claim (`traits[]`), gated by `repository.claim(row, NAME)`.
- `repository` — verbs over the one table, `this` = the minted repository, the daemon filtered on every verb.
- `entity` — METHODS on the entity class (`word.assess()`), gated by the claim — /"re-add methods as entity"/. Two traits naming one method collide at boot (`traits.js:34`).

A trait never adds a column; a sort over a payload field is `json_extract`. Exemplar: `education/domain/traits/literal/retained.js:20`.

## Routes are verbs, tools ride routes — one function

`education/domain/tools/review.js:42`: the tool calls `ctx.call["/review/literal"]({…})`. A route is ONE repository call; the route may take an optional `owner`, a tool never does — the caller's mode owns what it mints. /"the domain's aperture never branches an entity capability — a capability is a repository verb"/ A second road to the same rows is the defect. REJECTED: an `owner(kind)` lookup — /"every writer takes the owner from the caller … The domain never looks a topology up"/. Tool-first is a MODE's seat, not the domain's.

## The three failures

1. **`traits: []` silently disables everything**: `["EXPOSED", "TOOLING"]`.
2. **flat shapes** — /"both of these are too flat?! there should be a ancestor key. schematics."/ `francesca/harness.js:26` reads `ctx.domain.schematics.*` at runtime — never grep it dead.
3. **a trait verb on an unclaimed row throws** — `[traits] NAME.verb: … claims no NAME — daemon … speaks …` (`traits.js:40`): the row lacks the claim, or belongs to another daemon.

## Where a domain's things live

Literals, folds, twitches → the domain (`ctx.domain.*`), never a mode. The client stays domain-blind. The domain reaches modes at runtime, never by path; package fixtures sit at `<pkg>/tests/`.

## The rig — mount the way the daemon does

`chess/tests/rig.js:18-68`: repositories minted from the domain's traits, the aperture grafted:

```js
const traits = Object.fromEntries(Object.keys(sets.traits).map((kind) => [kind, gather(kernel, domain, [], kind)]));
const entities = { ...held.entities, ...strike(mint({ slug: DAEMON, kinds: sets.traits, traits }), em, sets.traits) };
daemon.aperture.graft(domain.aperture); daemon.call = shape.proxy(domain.aperture, steer.strategy.direct);
```

`gather · mint · strike` = `gestalten.belt`; the datamap = `@vivalence/runtime/scenarios`. No runtime test calls `factories.instance`, so unit-green over a hand-built rig is not evidence the daemon boots → skill `change`.
