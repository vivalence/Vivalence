---
name: mode-development
description: >-
  Author a mode the way the runtime reads it — modes/<type>/<slug>/<slug>.viva.js exporting from the closed
  set of twelve names (application, never app), traits declared not deduced, defaults set in the mode's own
  harness vector, no import outside the mode's directory, the ground seated by paladin, the shelf copy synced
  after instance/create. Use when writing a mode, adding an export or trait to one, or when a mode's view or
  tools do not appear.
when_to_use: >-
  "new mode" · "add a mode to <pkg>" · "export X from the mode" · "the mode isn't showing" · "add a tool to the
  mode" · "set the default policy" · a `<slug>.viva.js` under `modes/` is open · "application" · "buffer view".
---

# mode-development — twelve exports, declared traits, no leaving the mode

Canon (measured 09-22): `subsystems/paladin/lifecycle/resolve.js:46-66` · `systems/runtime/daemon/traits/*.js` · `world/codemap/runtime.md` · `commons/instances/hello-world/mode.viva.js` (the repo exemplar) · `~/.viva/registry/chess/modes/board/play/` (the richest registry exemplar). The package around it → [[package-development]]; the domain it talks to → [[domain-development]].

## The path is code

```js
// subsystems/paladin/lifecycle/resolve.js:46-51 — modes/<type>/<slug>/<slug>.viva.js names type AND slug; any other file names the slug alone
// :62-66 — every mode gets a seat: mountpoint = `${daemon.mountpoint}/mode_${id}` — paladin wires the ground, never an invented env var
```

beef: *"the mountpoint should be on EVRERY mode by default as a function of paladin doing its thing."* · *"no overwrite needed. no custom variable."* — an invented `VIVA_DRONEAID_IMPORT` resolved under `instance/run` and was `undefined` in his watch shell.

## The closed export set — each read at exactly one runtime site

| export | read at | trait |
|---|---|---|
| `manifest` | `registry.js:189` folded with the kernel entry; `population.js:120` | — |
| `aperture` | `daemon/lifecycle/resolution.js:48` | EXPOSED |
| `application` | `daemon/traits/application.js:6` `mode.module.application` | APPLICATION |
| `harness` | `daemon/traits/harnessed.js:180` | HARNESSED |
| `tools` | `daemon/traits/tooling.js:2-3` | TOOLING |
| `emitter` | `daemon/traits/emitter.js` | EMITTER |
| `dataset` | `daemon/traits/dataset.js:34` · `intented.js:6` | DATASET / INTENTED |
| `datasink` | `resolution.js:64` | DATASINK |
| `boot` | `daemon/traits/booted.js` | BOOTED |
| `freight` | `daemon/traits/index.js:74` | FRAUGHT |
| `statics` | `daemon/traits/index.js:56`, merged key-wise with the kernel entry | — |
| `provider` | `population.js:110` — a SERVICE, not a mode | — |

**`application`, never `app`** (m58 landed 09-17; 16 modules export `application`, zero `app`). `new App("buffer/Import.svelte", v.buffer({data:{…}}))` — the entry resolves against the mode's OWN dir. The export NAME is the module key: `Mode` does `Object.assign(this, module)`.

## Traits — declared, never deduced

`stagger` iterates `mode.manifest.traits` and nothing else (`daemon/traits/index.js:5-21`). Trait → export is REQUIRED; export → trait is not (11 benign mismatches on disk). Cross-checks warn only, except MOUNTED-without-mountpoint which throws and is unreachable since paladin seats every mode. Sixteen implemented: `AGENTIC APPLICATION BOOTED CONVERSATIONAL DATASET DATASINK EMITTER EXPOSED FRAUGHT GENERATIVE HARNESSED INTENTED MOUNTED SELFEVIDENT STANDALONE TOOLING`. The trait set IS the capability declaration — `traits: []` means no `daemon.call`, no tools, no doors, and a green test can assert the absence.

## Defaults live in the mode's harness vector

```js
// chess/modes/coach/practice/harness.js:13-14 — the primitive; ??= is a DEFAULT, = is a MANDATE
export const harness = new Vector().use(shard.hal.defaults({ policy: { tune: "capable", rounds: 6 }, settings: { effort: "low" } }))
```

Order at `harnessed.js:179-180`: the DOMAIN's harness slurps first, the mode's second, then `summarizing`. Two idioms live (`shard.hal.defaults` ×4 · hand `??=` ×2 in education) — the primitive is the one to write. beef: *"mode sets its own defaults via the harness vector"* — never a default proposed at the runtime trait (`fit-existing-trees`, OWNER axis).

## No leaving the mode

*"@beef NO. no leaving the mode! stupid. bad. bad claude. retard retard retard"* — a mode's files never import outside the mode's directory; a domain shape is reached at runtime as `daemon.domain.schematics.X` or not at all; an App's buffer schema is declared at load, so the shape is RESTATED in the mode and pinned equal by a suite. Shared chrome (`buffer/kit/`) is written once and COPIED per mode; `tests/kit.test.js` at the package root pins the five copies byte-equal — *"edit one, copy five, the suite says when a copy drifts."* Sanctioned reach: `tests/ → ../../../../tests/rig.js`.

Tool-first at the mode: a capability is a `tools` verb; the aperture WRAPS it when the App needs a door; promote to the domain when a second mode wants it (m67 ruling 4 — a MODE's seat, not the domain's). Single-owner rows: unique `(slug, mode)` (`project_mode_owns_rows`).

## Layout

```
modes/<type>/<slug>/
  <slug>.viva.js          the barrel; flat .js helpers beside it (harness.js · types.js|schematics.js)
  aperture/index.js       doors, if EXPOSED beyond /status /manifest
  tools/index.js          verbs
  buffer/<Name>.svelte    the App entry; buffer/parts/*.svelte (or buffer/kit/ + buffer/panels/ — chess)
  tests/*.test.js · fixture.js · scenarios.js    rig: mountMode from @vivalence/runtime/scenarios; chess renders views offline via npm:svelte/server
```

Topology ⇒ `traits: ["DATASET"]` exactly (11/11); topography ⇒ `DATASET` + optional `FRAUGHT`/`DATASINK` (7/7) → [[topography-development]].

## After the first edit on a shelved mode

`~/.viva/instances/<slug>/` is a COPY made once by `instance/create`; the runtime bundles the shelf. `diff -q` every touched file, sync by hand, verify by bundling the SHELF entry → [[shelf-sync]]. A hex literal in a rendered view is a defect once the theme is ordered; a design port runs on the comp's hexes in one palette block until then (`feedback_design_port_verbatim_first`). An `$effect` fix is proven by mounting it, not compiling it → [[testing]].

## Landing on a watched tree

`~/.viva/registry` and `commons/` sit under `runtime/watch`: every save is a DEPLOYMENT, and a refactor saved file by file deploys each broken intermediate — 09-23 a mode's pure modules lost five exports before their importers were rewritten and the runtime died (`Watcher Process failed`); hours later a sibling saved a tab and four class renames one by one on the same tree. `lsof -nP -iTCP:2501 -sTCP:LISTEN` first; a change over more than one file is built in a scratchpad copy of the package and lands in ONE `rsync` (`feedback_watched_tree_lands_in_one_burst`).

Before calling views complete: grep my own `$effect` bodies for a symbol on both sides of an assignment, and for an `async` function handed straight to `onMount` (its cleanup is never honoured). 09-22: the assembly editor shipped both while its own codemap shard carried the law.
