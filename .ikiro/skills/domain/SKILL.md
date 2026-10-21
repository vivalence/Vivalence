---
name: domain
description: >-
  Author a domain barrel (traits · schematics · aperture · tools · manifest · twitch), a trait SOURCE: routes are
  repository verbs, tools ride them via ctx.call, manifest traits EXPOSED + TOOLING. Use when writing one, or
  when ctx.call / tools / routes / a trait verb do nothing.
when_to_use: >-
  "new domain" · "add a route" · "add a trait" · "add a tool to the domain" · "the domain barrel" ·
  `domain/<slug>.viva.js` is open · "ctx.domain" · "ctx.call is undefined" · "why does this domain have no
  traits" · "routes are verbs" · "claims no".
---
<!-- limit: 6000 chars -->
# domain — a trait source, routes are verbs

REJECTED 10-07: *door* — /"Stop using the word doors. … We don't have drivers or doors anywhere."/ An aperture OPENS a route. A domain is a trait SOURCE, never a class, layer or table: /"The domain does not play in here. The domain might configure stuff, but so might any other mode."/ REJECTED 10-08 (m80): `entities` on the barrel, a domain table or class, a `resolve` hook over its own routes — the schema is FIXED at the kernel, a daemon is a column and a repository.

Canon: `subsystems/typology/schematics/primitives/kernel.js:7-15` (the `Domain` cast) · `systems/runtime/subjects/daemon/lifecycle/{population,resolution}` · `systems/runtime/gestalten/belt/traits.js` · m80's `* the law`. Exemplars: `~/.viva/registry/chess/domain/chess.viva.js` · `education/domain/domain.viva.js` (+ `twitch`); never vcompany · stucatch (pre-m80 `entities`).

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
| `traits` | `population.js:26` `gather` → `mint` → `strike` | `{ literal, symbol, note, mode }`, arrays of `define(…)` → `die.daemon.entities.<kind>` |
| `manifest.traits` | `gestalten/belt/traits.js:5` | a domain IS a `modes` entry (`registry.js:279`), any mode trait legal (`PRIMER`) — REJECTED 10-19 prohibiting one /"why would we prohibit that?"/; `[]` = no tools, no routes; `daemon.call` comes with any `aperture` |
| `schematics` | `kernel.js:12` | `ctx.domain.schematics.X`, the ONLY runtime path a mode has in |
| `aperture` | `resolution.js:15-18` | grafted under the daemon, host's words spread; `daemon.call` = its proxy |
| `twitch` | `population.js:31` | grafted on the daemon's twitch; ctx carries the host's words flat (`population.js:29`) — /"twiches are rich."/ |
| `tools` | `harnessed.js:73`, armed as `<slug>_*` | the harness's verbs |

`additionalProperties: true` keeps `aperture`/`tools`; `resolution.js:21` `domain.resolve?.(daemon)` catches education's stray star-exported `resolve`.

## A trait — three halves

A trait is SPECIFIC (THEMED · DOCKED · HOMED) /"traits are speciifc"/ 10-03, never a status — REJECTED 10-19 PENDING · CLIENT · FILE /"those are status, not traits"/.

`subsystems/typology/gestalten/belt/traits.js:5` `define(NAME, { schematic, repository, entity })`:

- `schematic` — `row.trait[NAME]`'s payload, held by claim (`traits[]`, `repository.claim(row, NAME)`).
- `repository` — verbs over the one table, `this` = the minted repository, daemon-filtered.
- `entity` — METHODS on the entity class (`word.assess()`), gated by the claim — /"re-add methods as entity"/. Two traits naming one method collide at boot (`traits.js:34`).

A trait never adds a column; a payload sort is `json_extract` (`education/domain/traits/literal/retained.js:20`).

## Routes are verbs, tools ride routes — one function

`education/domain/tools/review.js:42`: the tool calls `ctx.call["/review/literal"]({…})`. A route is ONE repository call; the route may take an optional `owner`, a tool never does — the caller's mode owns what it mints. /"the domain's aperture never branches an entity capability — a capability is a repository verb"/ A second road to the same rows is the defect. REJECTED: an `owner(kind)` lookup — /"every writer takes the owner from the caller … The domain never looks a topology up"/. Tool-first is a MODE's seat, not the domain's.

A tool's subject is its INPUT, never ctx; it takes no field it PRODUCES /"review produces a next date."/ 09-22. A tool contracts with a non-deterministic caller: schema enums + defaults, text `minLength: 1`, a projected paged answer; an error is a RECOVERY — whose fault, the valid set, the next move (`belt/hallucinate.js:52`).

## The three failures

1. **`traits: []` silently disables everything**.
2. **flat shapes** — /"both of these are too flat?! there should be a ancestor key. schematics."/ `francesca/harness.js:26` reads `ctx.domain.schematics.*` at runtime — never grep it dead.
3. **a trait verb on an unclaimed row throws** — `[traits] NAME.verb: … claims no NAME — daemon … speaks …` (`traits.js:40`): the row lacks the claim, or another daemon owns it.

## Where a domain's things live

Literals, folds, twitches → the domain (`ctx.domain.*`), never a mode; the client stays domain-blind; modes reached at runtime, never by path; fixtures in `<pkg>/tests/`.

## The rig — mount the way the daemon does

`chess/tests/rig.js:18-68`:

```js
const traits = Object.fromEntries(Object.keys(sets.traits).map((kind) => [kind, gather(kernel, domain, [], kind)]));
const entities = { ...held.entities, ...strike(mint({ slug: DAEMON, kinds: sets.traits, traits }), em, sets.traits) };
daemon.aperture.graft(domain.aperture); daemon.call = shape.proxy(domain.aperture, steer.strategy.direct);
```

`gather · mint · strike` = `gestalten.belt`; datamap = `@vivalence/runtime/scenarios`. No runtime test calls `factories.instance`: unit-green on a hand rig ≠ the daemon boots → skill `change`.
