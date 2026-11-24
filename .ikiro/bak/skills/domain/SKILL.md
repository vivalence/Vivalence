---
name: domain
description: Write a domain barrel. A domain is a source of traits, schematics, routes and tools for a daemon.
when_to_use: >-
  "new domain" · "add a route" · "add a trait" · "add a tool to the domain" · "the domain barrel" ·
  `domain/<slug>.viva.js` is open · "ctx.call is undefined" · "why does this domain have no traits"
---
<!-- limit: 3200 chars -->
# domain — a source of traits

A domain is not a class, a layer or a table. It is a mode entry that gives a daemon its traits, schematics, routes and tools.

Copy from `~/.viva/registry/chess/domain/chess.viva.js` or `~/.viva/registry/education/domain/domain.viva.js`.

## the barrel

```js
// ~/.viva/registry/chess/domain/chess.viva.js
export * as traits from "./traits/index.js";
export * as schematics from "./schematics.js";
export { aperture } from "./aperture/index.js";
export { tools } from "./tools/index.js";
export const manifest = { type: "domain", slug: "chess", traits: ["EXPOSED", "TOOLING"] };
```

- `traits`: `{ literal, symbol, note, mode }`, arrays of `define(…)`. They land on `daemon.entities.<kind>`.
- `manifest.traits`: any mode trait. `[]` means no tools and no routes.
- `schematics`: read as `ctx.domain.schematics.X`. The only way in for a mode.
- `aperture`: grafted under the daemon. `daemon.call` is its proxy.
- `twitch`: grafted on the daemon's twitch.
- `tools`: the harness's tools, armed as `<slug>_*`.

## a trait

A trait is specific (`THEMED`, `DOCKED`, `HOMED`). Never a status.

```js
define(NAME, { schematic, repository, entity })
```

- `schematic`: the payload under `entity.trait[NAME]`.
- `repository`: methods over the one table, filtered to the daemon.
- `entity`: methods on the entity class, there when the entity claims the trait.
- A trait never adds a column. Sort on a payload with `json_extract`.
- Two traits naming one method collide at boot.

## routes and tools

- A route is one repository call.
- A tool calls its route: `ctx.call["/review/literal"]({ … })`. Never a second road to the same entities.
- A tool's subject is its input, never ctx. It takes no field it produces.
- Each input has `.desc()` and `.example()`.
- A tool error tells the caller what was wrong, the valid set and the next move.

## three failures

1. `traits: []` silently disables everything.
2. Flat shapes. Schematics sit under the `schematics` key.
3. A trait method on an entity that does not claim the trait throws.

## tests

Mount the domain the way the daemon does. Copy `~/.viva/registry/chess/tests/rig.js`.

A green unit test on a hand rig does not prove the daemon boots.
