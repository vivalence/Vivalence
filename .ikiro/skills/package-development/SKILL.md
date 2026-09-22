---
name: package-development
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

# package-development — the registry package as paladin reads it

Canon (all measured on disk 09-22, `scratchpad/minions/registry.md`): `subsystems/paladin/belt/find.js` · `subsystems/paladin/prototypes/ledger/registry.js` · `world/codemap/commons.md` · memory `project_m11_package_ontology` · `feedback_registry_deps_by_url` · `feedback_no_cross_module_relative_imports`. Eight packages live today: assembly · chess · droneaid · media · stucatch · education · vcompany · young-ladys-primer. A mode inside it → [[mode-development]]; a domain → [[domain-development]]; a topology/topography → [[topography-development]].

## The recipe — content, never a filename

```js
// subsystems/paladin/belt/find.js:48,69-75 — walk every .viva.{js,ts,md,org}, filter by manifest.type
// subsystems/paladin/prototypes/ledger/registry.js:65-66 — package root = dirname(declaration)
```

- A package is a DIRECTORY holding a `*.viva.js` whose `manifest.type === "package"`. Two spellings live, both legal, do not pick: `package.viva.js` (assembly · chess · droneaid · media · stucatch) · `<slug>.viva.js` (education · vcompany · young-ladys-primer).
- The walk is infinite-depth; stucatch's declaration sits at `stucatch/vivaware/package.viva.js` and `registry.tap` heals the tapped reference to the declaration's dirname.
- `~/.viva/ledger.viva.js` is NOT a package — it is the ledger's declaration: ANY `.viva.js` at ledger root, depth 0, manifest DERIVED `{type:"ledger", slug:<stem>}`; an exported manifest only LOCKS the name (`project_ledger_recipe`).
- Invisible dirs: `bak archive slp node_modules .git .DS_Store *.bak .#* #*#` (`belt/ignore.js:4`).

## Layout — the type is the directory

```
<pkg>/
  package.viva.js | <slug>.viva.js        manifest: { type:"package", slug, owner:"@<slug>", version, traits:[] }
  domain/<slug>.viva.js                   the barrel → domain-development
  modes/<type>/<slug>/<slug>.viva.js      the convention is CODE: paladin/lifecycle/resolve.js:46-51 → mode-development
  topologies/<kind>/…  topographies/<body>/…                        → topography-development
  services/<slug>/<slug>.viva.js          a provider, not a mode (chess/services/stockfish)
  instances/<slug>/{instance.viva.js, daemon.js}   the template instance/create COPIES to ~/.viva/instances/<slug>/
  tests/rig.js · tests/scenarios.js       package-root fixtures; the domain reaches modes at runtime, never by path
```

`manifest.type` for a mode is FREE — 16 distinct types on disk (`feedback_modes_are_general`). `owner` is the manifest key whose VALUE is a package reference; `package` is the module TYPE (m11 fork 7). Derive by default, lock to override: a mode omits `owner`; paladin stamps it at mount.

## Dependencies — beef's ruling

*"i dont want package specific importmap entries. anything by domain installs via https://jsr"* · *"threejs and threlte are system level."*

- Bare specifiers allowed: the FOUR workspace members only — `@vivalence/typology` · `@vivalence/drapes` · `@vivalence/paladin` · `@vivalence/runtime` (+ `@vivalence/runtime/scenarios`, the rig). They resolve by `deno.jsonc workspace[]`, never by import map.
- Everything else by URL: `jsr:` first, `https://esm.sh/<pkg>@<ver>/…` when not on JSR (chessops ×17). ZERO package entries in `import_map.json` — measured zero.
- **No `../` past the package root.** 7 crossings on disk, 4 broken today (education → a `fixtures/` that does not exist; droneaid → topologies deleted in the 09-22 rewrite). Inside a mode, no import outside the mode's directory ([[mode-development]]).
- A bundler that ships only JS decides your asset format: a `.mp3` beside the module becomes a base64 data URL or is dropped — `Theme` became a component for the same reason.

## Manifest — authored identity, folded at mount

The MODULE's manifest is authored and immutable. The MOUNTING's manifest is minted by paladin: `Manifest.cast({...module.manifest, ...query.manifest})` (`registry.js:189`), the kernel entry's keys winning, validated at the pinhole; the citizen carries it, the row stays flat (`project_manifest_is_identity`). One module kernelled twice with two manifests is two modes. `traits` are DECLARED — nothing deduces them (three warn-only cross-checks, one throw).

## Mount path — read it before touching it

```
systems/runtime/lifecycle/populate.js:7            paladin.ledger.registry.supply()   → reconcile(record) → mount(root) → pensieve.register
systems/runtime/daemon/lifecycle/population.js:11  die.register = registry.wire(die.mask)  → accio() per slot; domain = Domain.cast(kernel.find(type==="domain"))
~/.viva/registry.json                              flat array of references, store-relative or absolute (the checkout is pinned absolute)
```

Land: `viva registry/tap <path>` → `viva instance/create @<pkg>/instance/<slug> --use --init` → walk it ([[live-validation]] or [[readme-walk]]). `viva ledger/doctor` shows `untapped` packages; `viva instance/doctor --json` the seats.

## Tests — nothing runs them

No `deno.json*` anywhere under `~/.viva/registry`; the root `deno.jsonc` names no registry task. The invocation that works:

```sh
deno test --config /Users/finn/vivalence/code/vivalence/deno.jsonc -A --no-check ~/.viva/registry/<pkg>/<live-dir>/
```

`deno test <dir>` does NOT honour `belt/ignore.js` — it walks `bak/` and education dies at module resolution before step one; name the live dirs. Measured today: chess 21/109 green · media 5/33 green · assembly 10 passed 2 failed · vcompany 25/2 · education 32/6 · droneaid unrunnable. The rig is `@vivalence/runtime/scenarios` (`provider` for a domain, `mountMode` for a mode, `daemon` for a whole daemon) → [[testing]].

## Standing hazards

VCS is per package, not per ledger — measured 09-22: chess · droneaid · education · young-ladys-primer carry their own `.git`; assembly · media · stucatch · vcompany and `~/.viva/instances` have NONE. `git -C <pkg> rev-parse --show-toplevel` first; a package with a `.git` is read-only for me like the repo (the vcs-guard denied a `git mv` on droneaid 09-22 — it would have moved tracked files); a package without one gets [[capture-before-delete]] before any rm/strip. The shelf copy drifts from the template → [[shelf-sync]]. A live sibling may be writing the same package → [[sibling-reconcile]].
