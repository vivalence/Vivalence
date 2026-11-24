---
name: package
description: Build or reshape a registry package under ~/.viva/registry the way paladin reads it.
when_to_use: >-
  "new package" · "write it into the registry" · "move this out of tree" · "tap it" · "instance/create" ·
  a `package.viva.js` is being written · a dependency is added to a registry module
---
<!-- limit: 3200 chars -->
# package — a registry package as paladin reads it

A domain product is its own package under `~/.viva/registry`. Never under `systems/` or `commons/`.

## the recipe

- A package is a directory holding a `*.viva.js` whose `manifest.type` is `"package"`. `package.viva.js` and `<slug>.viva.js` are both legal.
- Paladin walks every `.viva.{js,ts,md,org}` at any depth and filters by `manifest.type`.
- Ignored directories: `bak archive slp node_modules .git`.

```js
export const manifest = { type: "package", slug, owner: "@<slug>", version, traits: [] };
```

## layout

```
<pkg>/
  package.viva.js
  domain/<slug>.viva.js
  modes/<type>/<slug>/<slug>.viva.js
  topologies/<kind>/
  topographies/<body>/
  services/<slug>/<slug>.viva.js
  instances/<slug>/instance.viva.json
  tests/rig.js
```

- `instances/<slug>/` is the template that `viva instance/create` copies to `~/.viva/instances/<slug>/`.
- A mode omits `owner`. Paladin stamps it at mount.

## dependencies

- Bare imports: only `@vivalence/typology`, `@vivalence/drapes`, `@vivalence/paladin`, `@vivalence/runtime`.
- Everything else by URL: `jsr:` first, else `https://esm.sh/<pkg>@<ver>`.
- No package entry in `import_map.json`.
- No `../` past the package root.

## manifest

- The module's manifest is authored. The mounted one is the module's merged with the recipe entry's. The entry wins.
- One module listed twice with two manifests is two modes.

## landing

I write the package and its instance template. He runs:

```sh
viva registry/tap <path>
viva instance/create @<pkg>/instance/<slug> --use --init
```

Check with `viva registry/doctor`, `viva ledger/doctor` and `viva instance/doctor --json`.

- Never edit `registry.json` by hand.
- A package is tapped before a recipe names it. Otherwise the runtime boots without it.

## tests

```sh
deno test --config /Users/finn/vivalence/code/vivalence/deno.jsonc -A --no-check ~/.viva/registry/<pkg>/<dir>/
```

Name the live directories. On the package root `deno test` walks `bak/` and dies.

## version control

Each package has its own. Check first: `git -C <pkg> rev-parse --show-toplevel`. A package without one is copied before any delete.
