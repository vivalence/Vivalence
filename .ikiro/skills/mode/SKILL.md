---
name: mode
description: >-
  Author a mode the way the runtime reads it — modes/<type>/<slug>/<slug>.viva.js exporting from the closed
  set of twelve names (application, never app), traits declared not deduced, defaults set in the mode's own
  harness vector, no import outside the mode's directory, the ground seated by paladin, the shelf copy synced
  after instance/create. Use when writing a mode, adding an export or trait to one, or when a mode's view or
  tools do not appear.
when_to_use: >-
  "new mode" · "add a mode to <pkg>" · "export X from the mode" · "the mode isn't showing" · "add a tool to
  the mode" · "set the default policy" · a `<slug>.viva.js` under `modes/` is open · "application" ·
  "buffer view".
---
<!-- limit: 7000 chars -->
# mode — "new mode" · "add a tool to the mode": twelve exports, declared traits, never leave

Canon: `subsystems/paladin/lifecycle/resolve.js:68-104` · `systems/runtime/traits/*.js` · `world/codemap/runtime.md` · `commons/instances/hello-world/mode.viva.js` (repo exemplar) · `~/.viva/registry/chess/modes/board/play/` (richest registry exemplar). The package around it → skill `package`; the domain it talks to → skill `domain`.

## The path is code

`resolve.js:76-80`: `modes/<type>/<slug>/<slug>.viva.js` names type AND slug; any other file names the slug alone. `:93`: every mode gets a seat, `mountpoint = ${host.mountpoint}/mode_<type>_<slug>`, on either host (`:53-58`) — paladin wires the ground, never an invented env var.

/"the mountpoint should be on EVRERY mode by default as a function of paladin doing its thing."/ · /"no overwrite needed. no custom variable."/ REJECTED: an invented `VIVA_DRONEAID_IMPORT` — resolved under `instance/run`, `undefined` in his watch shell.

## The closed export set — each read at exactly one runtime site

| export | read at | trait |
|---|---|---|
| `manifest` | `registry.js:253` folded with the modes entry; `gestalten/belt/host.js:13` `new Mode(mask)` | — |
| `aperture` | `lifecycle/mode/population.js:20` slurped | EXPOSED |
| `application` | `traits/application.js:6` | APPLICATION |
| `harness` | `traits/harnessed.js:200` | HARNESSED |
| `tools` | `traits/tooling.js:2-3` | TOOLING |
| `emitter` | `traits/emitter.js:4` | EMITTER |
| `dataset` | `traits/dataset.js:17` · `intented.js:6` · `stamp` `traits/dataset.js:16` | DATASET / INTENTED |
| `datasink` | `traits/datasink.js:9` · cross-check `lifecycle/mode/resolution.js:22` | DATASINK |
| `boot` | `traits/booted.js:9` | BOOTED |
| `freight` | `traits/fraught.js:17` | FRAUGHT |
| `statics` | `registry.js:254` merged key-wise with the modes entry; `traits/fraught.js:7` reads `statics.ignore` | — |
| `provider` | `lifecycle/daemon/population.js:41` · `:54` — a SERVICE, not a mode | — |

**`application`, never `app`** (16 modules export `application`, zero `app`). `new App("buffer/Import.svelte", v.buffer({data:{…}}))` — the entry resolves against the mode's OWN dir. The export NAME is the module key: `Mode` does `Object.assign(this, module)`. A new behavior is a sibling export, never a manifest key.

## Traits — declared, never deduced

`stagger` iterates `mode.manifest.traits` and nothing else (`gestalten/belt/traits.js:3-16`, run in `lifecycle/mode/resolution.js:13`); a declared trait its host does not offer is logged (`:15`) — the runtime's catalog lacks `DATASET · DATASINK`. Trait → export is REQUIRED; export → trait is not (11 benign mismatches on disk). Cross-checks warn only, except MOUNTED-without-mountpoint, which throws and is unreachable since paladin seats every mode. Implemented = `ls systems/runtime/traits/`; a new one ALSO joins `ModeTraitsEnum` (`systems/runtime/entities/Mode.ts:28`) or the mode faults at boot, `Invalid enum array items provided in ModeEntity.traits` (m83 `PRIMER`, 10-10). The trait set IS the capability declaration — `traits: []` means no `mode.call`, no tools, no routes, and a green test can assert the absence.

## Defaults live in the mode's harness vector

`chess/modes/coach/practice/harness.js:13-14` — the primitive; `??=` is a DEFAULT, `=` is a MANDATE:

```js
export const harness = new Vector().use(shard.hal.defaults({ policy: { tune: "capable", rounds: 6 }, settings: { effort: "low" } }))
```

Order at `traits/harnessed.js:199-200`: the DOMAIN's harness slurps first, the mode's second, then `summarizing`. Write the primitive, never a hand `??=`. /"mode sets its own defaults via the harness vector"/ REJECTED: a default proposed at the runtime trait — wrong owner.

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

Topology ⇒ `traits: ["DATASET"]` exactly (11/11); topography ⇒ `DATASET` + optional `FRAUGHT`/`DATASINK` (7/7) → skill `topography`.

## After the first edit on a shelved mode

`~/.viva/instances/<slug>/` is a COPY made once by `instance/create`; the runtime bundles the shelf. `diff -q` every touched file, sync by hand, verify by bundling the SHELF entry → skill `debug`. Hexes in a view: one palette block until the theme is ordered → skill `design`. An `$effect` fix is proven by mounting it, not compiling it → skill `change`.

## Landing on a watched tree

`~/.viva/registry` and `commons/` sit under `runtime/watch`: every save is a DEPLOYMENT, and a refactor saved file by file deploys each broken intermediate (`Watcher Process failed`). `lsof -nP -iTCP:2501 -sTCP:LISTEN` first; a change over more than one file is built in a scratchpad copy of the package and lands in ONE `rsync`.

Before calling views complete: grep my own `$effect` bodies for a symbol on both sides of an assignment, and for an `async` function handed straight to `onMount` (its cleanup is never honoured).
