---
name: package
description: >-
  Build or reshape a registry package under ~/.viva/registry — the recipe paladin sniffs, layout by module
  type, deps by URL, no `../` past the root, landing package + instance template. Use when creating a package,
  adding a module type, or moving code out of the repo.
when_to_use: >-
  "new package" · "write it into the registry" · "move this out of tree" · "add it to .viva/registry" · a
  `package.viva.js` or `<slug>.viva.js` is being authored · a dependency is being added to a registry module ·
  "tap it" · "instance/create".
---
<!-- limit: 6000 chars -->
# package — "new package" · "tap it": the registry package as paladin reads it

Canon: `subsystems/paladin/gestalten/belt/find.js` · `subsystems/paladin/ledger/registry.js` · `world/codemap/commons.md`. Read `world/codemap/paladin.md` first — nothing auto-loads under `~/.viva`. Inside it → skills `mode` · `domain` · `topography`.

A domain product is its OWN package (/"the whole thing started as its own package in the registry"/) — never `systems/` · `commons` (gateways only: mail · telegram · ocr) — landed in the ledger directly (09-21).

## The recipe — content, never a filename

`belt/find.js:48,69-75` walks every `.viva.{js,ts,md,org}`, filters by `manifest.type`; `registry.js:13`: root = `dirname(declaration)`.

- A package is a DIRECTORY holding a `*.viva.js` whose `manifest.type === "package"`. Two legal spellings, do not pick: `package.viva.js` · `<slug>.viva.js`.
- Infinite-depth walk: stucatch declares at `stucatch/vivaware/package.viva.js`; `registry.tap` heals it to the declaration's dirname.
- `~/.viva/ledger.viva.json` is NOT a package — the ledger recipe (m80), manifest DERIVED `{type:"ledger", slug:"ledger"}`; a declared one only LOCKS the name.
- Invisible dirs: `bak archive slp node_modules .git .DS_Store *.bak .#* #*#` (`belt/ignore.js:4`).

## Layout — the type is the directory

```
<pkg>/
  package.viva.js | <slug>.viva.js
  domain/<slug>.viva.js
  modes/<type>/<slug>/<slug>.viva.js
  topologies/<kind>/…  topographies/<body>/…
  services/<slug>/<slug>.viva.js
  instances/<slug>/instance.viva.json
  tests/rig.js · tests/scenarios.js
```

- the declaration — `{ type:"package", slug, owner:"@<slug>", version, traits:[] }`.
- `modes/` — the convention IS `paladin/instance/lifecycle/2-resolution.js:76-80`.
- `services/` — a provider, not a mode (`chess/services/stockfish`).
- `instances/<slug>/` — the template `instance/create` COPIES to `~/.viva/instances/<slug>/`.
- `tests/` — package-root fixtures; the domain reaches modes at runtime, never by path.

`manifest.type` for a mode is FREE (16 on disk). `owner` is the manifest key whose VALUE is a package reference; `package` is the module TYPE. A mode omits `owner`; paladin stamps it at mount (derive by default, lock to override).

## Dependencies — beef's ruling

/"i dont want package specific importmap entries. anything by domain installs via https://jsr"/ · /"threejs and threlte are system level."/

- Bare specifiers: the FOUR workspace members only — `@vivalence/{typology,drapes,paladin,runtime}` (+ `@vivalence/runtime/scenarios`), by `deno.jsonc workspace[]`, never an import map.
- Everything else by URL: `jsr:` first, else `https://esm.sh/<pkg>@<ver>/…`. ZERO package entries in `import_map.json`.
- **No `../` past the package root.** Inside a mode, no import outside the mode's directory.
- A JS-only bundler decides your asset format: a `.mp3` beside the module becomes base64 or vanishes — hence `Theme` is a component.

## Manifest — authored identity, folded at mount

The MODULE's manifest: authored, immutable. The MOUNTING's is minted by paladin: `Manifest.cast({...module.manifest, ...query.manifest})` (`registry.js:253`), the modes entry winning, validated at the pinhole; the citizen carries it, the row stays flat. One module twice in `modes` with two manifests = two modes. `traits` are DECLARED — nothing deduces them.

## Mount path — read it before touching it

```
systems/runtime/subjects/runtime/lifecycle/1-population.js:27  paladin.ledger.registry.supply() → reconcile(record) → mount(root) → pensieve.register
systems/runtime/subjects/daemon/lifecycle/1-population.js:8    die.register = registry.wire(die.mask) → accio() per slot; domain = Domain.cast(modes.find(type==="domain")); the runtime wires its own record the same way (runtime/lifecycle/1-population.js:123)
~/.viva/registry.json                               { "@<slug>": { slug, mount } }, mount store-relative or absolute
```

Land = MY package + its `instances/<slug>/` template; `viva registry/tap <path>` · `viva instance/create @<pkg>/instance/<slug> --use --init` · VCS init are beef's (09-16), then walk it (skill `debug` · `readme`). REJECTED: hand-editing `registry.json`, a `localhost.viva.js` wiring tail. `viva ledger/doctor` shows `untapped`; `viva instance/doctor --json` the seats.

## Tests — nothing runs them

No `deno.json*` under `~/.viva/registry`, no root task:

```sh
deno test --config /Users/finn/vivalence/code/vivalence/deno.jsonc -A --no-check ~/.viva/registry/<pkg>/<live-dir>/
```

`deno test <dir>` ignores `belt/ignore.js` — it walks `bak/`, dies at module resolution; name the live dirs. Rig: `@vivalence/runtime/scenarios` (`provider` domain · `mountMode` mode · `daemon` whole daemon) → skill `change`.

## Standing hazards

A RESIDENT is not TAPPED: `viva registry/doctor` BEFORE a mode moves into a package — an untapped owner in a recipe = the watcher's reboot binds nothing (11-09 `@media`: `:2501` dark after the move).

VCS is per package — `git -C <pkg> rev-parse --show-toplevel` first; a `.git` package is read-only for me; one without: capture before any rm/strip (skill `readme`). Before proposing a push: `remote -v` + op log + outgoing scan (`.env` · db · key · conflict) — a package `.git` can be a copy of main (chess: 6286 changes). Org move = GitHub TRANSFER, then re-point.

The shelf copy drifts from the template → skill `debug`.
