---
name: package
description: >-
  Build or reshape a registry package under ~/.viva/registry — the recipe paladin actually sniffs, the layout
  by module type, deps by URL with no relative import past the package root, the manifest as authored
  identity, landing by registry/tap → instance/create. Use when creating a package, adding a module type to
  one, or moving code out of the repo.
when_to_use: >-
  "new package" · "write it into the registry" · "move this out of tree" · "add it to .viva/registry" · a
  `package.viva.js` or `<slug>.viva.js` is being authored · a dependency is being added to a registry module ·
  "tap it" · "instance/create".
---
<!-- limit: 6000 chars -->
# package — "new package" · "tap it": the registry package as paladin reads it

Canon: `subsystems/paladin/gestalten/belt/find.js` · `subsystems/paladin/ledger/registry.js` · `world/codemap/commons.md`. Live: assembly · chess · droneaid · media · stucatch · education · vcompany · young-ladys-primer. Read `world/codemap/paladin.md` first — nothing auto-loads under `~/.viva`. Inside it → skills `mode` · `domain` · `topography`.

## The recipe — content, never a filename

`belt/find.js:48,69-75` walks every `.viva.{js,ts,md,org}` and filters by `manifest.type`; `registry.js:13`: package root = `dirname(declaration)`.

- A package is a DIRECTORY holding a `*.viva.js` whose `manifest.type === "package"`. Two spellings, both legal, do not pick: `package.viva.js` (assembly · chess · droneaid · media · stucatch) · `<slug>.viva.js` (education · vcompany · young-ladys-primer).
- The walk is infinite-depth; stucatch declares at `stucatch/vivaware/package.viva.js` and `registry.tap` heals the reference to the declaration's dirname.
- `~/.viva/ledger.viva.json` is NOT a package — the ledger recipe (m80), manifest DERIVED `{type:"ledger", slug:"ledger"}`; a declared manifest only LOCKS the name.
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
- `modes/` — the convention is CODE: `paladin/instance/lifecycle/resolution.js:76-80`.
- `services/` — a provider, not a mode (`chess/services/stockfish`).
- `instances/<slug>/` — the template `instance/create` COPIES to `~/.viva/instances/<slug>/`.
- `tests/` — package-root fixtures; the domain reaches modes at runtime, never by path.

`manifest.type` for a mode is FREE (16 distinct on disk). `owner` is the manifest key whose VALUE is a package reference; `package` is the module TYPE. Derive by default, lock to override: a mode omits `owner`; paladin stamps it at mount.

## Dependencies — beef's ruling

/"i dont want package specific importmap entries. anything by domain installs via https://jsr"/ · /"threejs and threlte are system level."/

- Bare specifiers: the FOUR workspace members only — `@vivalence/typology` · `@vivalence/drapes` · `@vivalence/paladin` · `@vivalence/runtime` (+ `@vivalence/runtime/scenarios`). They resolve by `deno.jsonc workspace[]`, never by import map.
- Everything else by URL: `jsr:` first, `https://esm.sh/<pkg>@<ver>/…` when not on JSR. ZERO package entries in `import_map.json`.
- **No `../` past the package root.** Inside a mode, no import outside the mode's directory.
- A bundler that ships only JS decides your asset format: a `.mp3` beside the module becomes a base64 data URL or is dropped — `Theme` became a component for that reason.

## Manifest — authored identity, folded at mount

The MODULE's manifest is authored and immutable. The MOUNTING's is minted by paladin: `Manifest.cast({...module.manifest, ...query.manifest})` (`registry.js:253`), modes entry's keys winning, validated at the pinhole; the citizen carries it, the row stays flat. One module listed twice in `modes` with two manifests is two modes. `traits` are DECLARED — nothing deduces them.

## Mount path — read it before touching it

```
systems/runtime/subjects/runtime/lifecycle/population.js:27  paladin.ledger.registry.supply() → reconcile(record) → mount(root) → pensieve.register
systems/runtime/subjects/daemon/lifecycle/population.js:8    die.register = registry.wire(die.mask) → accio() per slot; domain = Domain.cast(modes.find(type==="domain")); the runtime wires its own record the same way (runtime/lifecycle/population.js:123)
~/.viva/registry.json                               { "@<slug>": { slug, mount } }, mount store-relative or absolute
```

Land: `viva registry/tap <path>` → `viva instance/create @<pkg>/instance/<slug> --use --init` → walk it (skill `debug` or `readme`). `viva ledger/doctor` shows `untapped`; `viva instance/doctor --json` the seats.

## Tests — nothing runs them

No `deno.json*` under `~/.viva/registry`; the root `deno.jsonc` names no registry task. The invocation:

```sh
deno test --config /Users/finn/vivalence/code/vivalence/deno.jsonc -A --no-check ~/.viva/registry/<pkg>/<live-dir>/
```

`deno test <dir>` does NOT honour `belt/ignore.js` — it walks `bak/` and dies at module resolution; name the live dirs. Rig: `@vivalence/runtime/scenarios` (`provider` for a domain, `mountMode` for a mode, `daemon` for a whole daemon) → skill `change`.

## Standing hazards

VCS is per package: chess · droneaid · education · young-ladys-primer carry their own `.git`; assembly · media · stucatch · vcompany and `~/.viva/instances` have NONE. `git -C <pkg> rev-parse --show-toplevel` first; a package with a `.git` is read-only for me like the repo; one without gets a capture before any rm/strip (skill `readme`). The shelf copy drifts from the template → skill `debug`.
