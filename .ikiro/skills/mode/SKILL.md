---
name: mode
description: >-
  Author a mode the way the runtime reads it — modes/<type>/<slug>/<slug>.viva.js exporting from the closed
  set of names (buffer + views, VIEWABLE), traits declared not deduced, defaults set in the mode's own
  harness vector, no import outside the mode's directory, the ground seated by paladin, the shelf copy synced
  after instance/create. Use when writing a mode, adding an export or trait to one, or when a mode's view or
  tools do not appear.
when_to_use: >-
  "new mode" · "add a mode to <pkg>" · "export X from the mode" · "the mode isn't showing" · "add a tool to
  the mode" · "set the default policy" · a `<slug>.viva.js` under `modes/` is open · "buffer view" ·
  "application".
---
<!-- limit: 7000 chars -->
# mode — "new mode" · "add a tool to the mode": twelve exports, declared traits, never leave

Canon: `subsystems/paladin/instance/lifecycle/resolution.js:68-111` · `systems/runtime/subjects/mode/traits/*.js` · `commons/instances/hello-world/mode.viva.js` · `~/.viva/registry/chess/modes/board/play/`. Package → `package`; its domain → skill `domain`.

## The path is code

`resolve.js:76-80`: `modes/<type>/<slug>/<slug>.viva.js` names type AND slug; any other file names the slug alone. `:93`: every mode gets a seat, `mountpoint = ${host.mountpoint}/mode_<type>_<slug>`, on either host (`:53-58`) — paladin wires the ground, never an invented env var.

/"the mountpoint should be on EVRERY mode by default as a function of paladin doing its thing."/ · /"no overwrite needed. no custom variable."/ REJECTED: an invented `VIVA_DRONEAID_IMPORT` — `undefined` in his watch shell.

## The closed export set — each read at exactly one runtime site

| export | read at | trait |
|---|---|---|
| `manifest` | `registry.js:253` folded over its entry; `systems/runtime/subjects/daemon/lifecycle/population.js:64` `new Mode(mask)` | — |
| `aperture` | `mode/lifecycle/population.js:20` slurped | EXPOSED |
| `buffer` · `views` | `traits/viewable.js:7` · `:19` | VIEWABLE |
| `harness` | `traits/harnessed.js:244` | HARNESSED |
| `tools` | `traits/tooling.js:2-3` | TOOLING |
| `emitter` | `traits/emitter.js:4` | EMITTER |
| `dataset` | `traits/dataset.js:17` · `intented.js:6` · `stamp` `traits/dataset.js:16` | DATASET / INTENTED |
| `datasink` | `traits/datasink.js:9` · cross-check `mode/lifecycle/resolution.js:22` | DATASINK |
| `boot` | `traits/booted.js:9` | BOOTED |
| `freight` | `traits/fraught.js:17` | FRAUGHT |
| `repl` | `traits/repling.js:4` | REPLING |
| `statics` | `registry.js:254` merged key-wise; `traits/fraught.js:7` reads `.ignore` | — |
| `provider` | `daemon/lifecycle/population.js:41` · `:54` — a SERVICE, not a mode | — |

**APPLICATION RETIRED (m87, 10-24)** — `buffer = v.buffer({data:{…}})` → `mode.buffer(desc)`; `views = [{ slug, mount, mime }]` → View rows, mount against the mode's OWN dir; a buffer shows its pins, else its mode's views. A tty face is a second view `{ slug, mount: "buffer/<slug>.jsx", mime: mime.tty.solid }` exporting `default (element, bag) → { destroy }` — no kit import, keys via `bag.renderer.keyInput.prependListener` gated on `bag.focused()`; exemplar `chess/modes/board/play/buffer/play.jsx` + `tests/tty{,.render}.test.js`. The export NAME is the module key: `Mode` does `Object.assign(this, module)`. A new behavior is a sibling export, never a manifest key.

## Traits — declared, never deduced

`stagger` iterates `mode.manifest.traits` and nothing else (`gestalten/belt/traits.js:3-16`, run in `mode/lifecycle/resolution.js:13`); a declared trait its host does not offer is logged (`:15`). Trait → export is REQUIRED; export → trait is not. Cross-checks warn only; MOUNTED-without-mountpoint throws, unreachable since paladin seats every mode. Implemented = `ls systems/runtime/subjects/mode/traits/`; a new one joins `ModeTraitsEnum` (`systems/runtime/subjects/mode/Mode.ts:12`) or the mode faults at boot, `Invalid enum array items provided in ModeEntity.traits` (m83 `PRIMER`, 10-10). The trait set IS the capability declaration — `traits: []` means no `mode.call`, no tools, no routes, and a green test can assert the absence.

## `tune · rounds · effort` are the USER's, never the mode's

A thread is born claiming `INTELLIGENT` (`capable` · 12 · `low`, `schematics/traits/intelligent.js`); `/tune · /effort · /rounds` change it; a mode sets none. REJECTED 10-24 m105 Q14 `shard.hal.defaults({ policy: { tune, rounds } })` in a mode — /"keep this under the control of users."/ Order `traits/harnessed.js:244-245`: domain's harness, mode's, `summarizing`.

## No leaving the mode

/"@beef NO. no leaving the mode! stupid. bad. bad claude. retard retard retard"/ — a mode's files never import outside the mode's directory; a domain shape is reached at runtime as `ctx.domain.schematics.X` or not at all; an App's buffer schema is declared at load, so the shape is RESTATED in the mode and pinned equal by a suite. Shared chrome (`buffer/kit/`) is written once and COPIED per mode; `tests/kit.test.js` at the package root pins the copies byte-equal — /"edit one, copy five, the suite says when a copy drifts."/ Sanctioned reach: `tests/ → ../../../../tests/rig.js`.

Tool-first at the mode: a capability is a `tools` verb; the aperture WRAPS it when the App needs a route; promote to the domain when a second mode wants it — tool-first is a MODE's seat, not the domain's. Single-owner rows: unique `(slug, mode)`.

## Layout

```
modes/<type>/<slug>/
  <slug>.viva.js
  harness.js · types.js|schematics.js
  aperture/index.js
  tools/index.js
  buffer/<Name>.svelte · buffer/parts/*.svelte | buffer/kit/ + buffer/panels/
  tests/*.test.js · fixture.js · scenarios.js
```

The barrel takes flat `.js` helpers beside it; `aperture/` only if EXPOSED beyond `/status` `/manifest`; `buffer/<Name>.svelte` is the App entry; tests mount via `mountMode` from `@vivalence/runtime/scenarios` (chess renders offline via `npm:svelte/server`).

Topology ⇒ `traits: ["DATASET"]` exactly; topography ⇒ `DATASET` + optional `FRAUGHT`/`DATASINK` → skill `topography`.

## After the first edit on a shelved mode

`~/.viva/instances/<slug>/` is a COPY made once by `instance/create`; the runtime bundles the shelf. `diff -q` every touched file, sync by hand, verify by bundling the SHELF entry → skill `debug`. Hexes in a view: one palette block until the theme is ordered → skill `design`. An `$effect` fix is proven by mounting it, not compiling it → skill `change`.

## Landing on a watched tree

`~/.viva/registry` and `commons/` sit under `runtime/watch`: every save is a DEPLOYMENT, and a refactor saved file by file deploys each broken intermediate (`Watcher Process failed`). a change over more than one file is built in a scratchpad copy of the package and lands in ONE `rsync`.

Before calling views complete: grep my `$effect` bodies for a symbol on both sides of an assignment, and for an `async` handed to `onMount` (its cleanup is never honoured).
