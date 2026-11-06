---
name: mode
description: >-
  Author a mode the way the runtime reads it — modes/<type>/<slug>/<slug>.viva.js from the closed export
  set (buffer + views, VIEWABLE), traits declared not deduced, no import outside the mode's directory, the
  ground seated by paladin, the shelf synced after instance/create. Use when writing a mode, adding an export or trait to one, or when a mode's view or
  tools do not appear.
when_to_use: >-
  "new mode" · "add a mode to <pkg>" · "export X from the mode" · "the mode isn't showing" · "add a tool to
  the mode" · "set the default policy" · a `<slug>.viva.js` under `modes/` is open · "buffer view" ·
  "application".
---
<!-- limit: 7000 chars -->
# mode — closed exports, declared traits, never leave

Canon = the runtime's read sites, never the nearest mode (09-21): `paladin/instance/lifecycle/2-resolution.js:68-111` · `runtime/subjects/mode/traits/*.js` · `commons/instances/hello-world/mode.viva.js`. Package → `package`; domain → `domain`.

## The path is code

`resolve.js:76-80`: `modes/<type>/<slug>/<slug>.viva.js` names type AND slug; any other file names the slug alone. `:93`: every mode gets a seat, `mountpoint = ${host.mountpoint}/mode_<type>_<slug>`, on either host (`:53-58`) — paladin wires the ground, never an invented env var. A ROOT-runtime mode = the recipe's `runtime.modes` (11-09); `inherit` is whole-slot: restate the ledger's `statics` + every mode, never `traits`.

/"the mountpoint should be on EVRERY mode by default as a function of paladin doing its thing."/ · /"no overwrite needed. no custom variable."/ REJECTED: an invented `VIVA_DRONEAID_IMPORT`.

## The closed export set — each read at ONE runtime site

| export | read at | trait |
|---|---|---|
| `manifest` | `registry.js:253` folded over its entry; `systems/runtime/subjects/daemon/lifecycle/1-population.js:64` `new Mode(mask)` | — |
| `aperture` | `mode/lifecycle/1-population.js:20` slurped | EXPOSED |
| `buffer` · `views` | `traits/viewable.js:7` · `:19` | VIEWABLE |
| `harness` | `traits/harnessed.js:244` | HARNESSED |

`yields:` = the client wire STREAMS it (`shape/connection.js:38`), `output:` = one value; prove a leaf over `authedConn.call`, never `scenario.mode.harness` alone (11-09). A slow leaf's caller passes `{ timeout }`; ghost's `timeout(8000)` is the default (11-09). A dom view renders into `element.attachShadow` with its sheet inside: a `<style>` in the light DOM is document-global — `.frame` · `.empty` are anima's (`parts.css:74,82`), the desk collapsed (11-09).
| `tools` | `traits/tooling.js:2-3` | TOOLING |
| `emitter` | `traits/emitter.js:4` | EMITTER |
| `dataset` | `traits/dataset.js:17` · `intented.js:6` · `stamp` `traits/dataset.js:16` | DATASET / INTENTED |
| `datasink` | `traits/datasink.js:9` · cross-check `mode/lifecycle/2-resolution.js:22` | DATASINK |
| `boot` | `traits/booted.js:9` | BOOTED |
| `freight` | `traits/fraught.js:17` | FRAUGHT |
| `repl` | `traits/repling.js:4` | REPLING |
| `statics` | `registry.js:254` merged key-wise; `traits/fraught.js:7` reads `.ignore` | — |
| `provider` | `daemon/lifecycle/1-population.js:41` · `:54` — a SERVICE | — |

**APPLICATION RETIRED (m87, 10-24)** — `buffer = v.buffer({data:{…}})`; `views = [{ slug, mount, mime }]` = View rows, mount against the mode's OWN dir; a buffer shows its pins, else its mode's views. A tty face is a second view `{ slug, mount: "buffer/<slug>.jsx", mime: mime.tty.solid }` exporting `default (element, bag) → { destroy }`; keys via `bag.renderer.keyInput.prependListener` gated on `bag.focused()`. The export NAME is the module key (`Object.assign(this, module)`). A new behavior is a sibling export beef names, never a manifest key — /"never. ever. add to fucking manifest"/ 05-18.

## Traits — declared, never deduced

`stagger` iterates `mode.manifest.traits` only (`gestalten/belt/traits.js:3-16`). Trait → export is REQUIRED; export → trait is not. A new trait joins `ModeTraitsEnum` (`runtime/subjects/mode/Mode.ts:12`) or the mode faults at boot. The trait set IS the capability declaration — `traits: []` = no `mode.call`, tools, routes; a green test asserts the absence.

## `tier · rounds · effort` are the USER's, never the mode's

A thread is born claiming `INTELLIGENT` (`capable` · 12 · `low`, `schematics/traits/intelligent.js`); `/tier · /effort · /rounds` change it; a mode sets none. REJECTED 10-24 m105 Q14 `shard.hal.defaults({ policy: { tier, rounds } })` in a mode — /"keep this under the control of users."/ Order `traits/harnessed.js:244-245`: domain's harness, mode's, `summarizing`.

## No leaving the mode

/"NO. no leaving the mode! stupid. bad."/ — a mode's files never import outside the mode's directory; a domain shape is reached at runtime as `ctx.domain.schematics.X` or not at all. Shared chrome (`buffer/kit/`) is written once and COPIED per mode; `tests/kit.test.js` at the package root pins the copies byte-equal — /"edit one, copy five, the suite says when a copy drifts."/ Sanctioned reach: `tests/ → ../../../../tests/rig.js`.

Tool-first: a capability is a `tools` verb, the aperture WRAPS it for a route, the domain takes it at a second mode; a mode owning files wraps `fs_*` in its OWN coordinates (slugs, not paths), each verb once — /"wrap for context and utility."/ Single-owner rows: unique `(slug, mode)`. A mode guesses nothing (no default import, no product slug); only `.desc` Example: is concrete — /"remove all defaults from the mode"/ 09-21.

## Layout

```
modes/<type>/<slug>/
  <slug>.viva.js
  harness.js · types.js|schematics.js
  aperture/index.js
  tools/index.js
  buffer/<Name>.jsx (mime.dom.solid) · buffer/<name>.jsx (mime.tty.solid)
  tests/*.test.js · fixture.js · scenarios.js
```

`aperture/` only if EXPOSED beyond `/status` `/manifest`; a view is Solid `.jsx`, `export default (element, props) => ({ destroy })` (`painters.jsx:20`); tests mount via `mountMode`. REJECTED 11-09 `.svelte`.

Topology ⇒ `traits: ["DATASET"]`; topography ⇒ `DATASET` (+ `FRAUGHT`/`DATASINK`) → skill `topography`.

## After the first edit on a shelved mode

`~/.viva/instances/<slug>/` is a COPY `instance/create` made once; the runtime bundles the shelf. `diff -q` every touched file, sync by hand, verify by bundling the SHELF entry → `debug`. Hexes in a view: one palette block till the theme is ordered → `design`. An `$effect` fix is proven mounted, not compiled → `change`.

## Landing on a watched tree

`~/.viva/registry` and `commons/` sit under `runtime/watch`: every save DEPLOYS, a file-by-file refactor deploys each broken intermediate; a multi-file change lands in ONE `rsync`. `touch` does not wake `--watch`, a content change does; the recipe is NOT watched, a recipe fault = the next boot dark — `viva instance/doctor` after a recipe edit (11-09 `traits` in `runtime`).

Views complete ⇒ grep my `$effect` bodies for a symbol both sides of `=`, and `onMount(async …)` (cleanup never honoured).
