---
name: mode
description: Write a mode the way the runtime reads it. A closed set of exports, declared traits, no import outside the mode.
when_to_use: >-
  "new mode" · "add a mode to <pkg>" · "export X from the mode" · "the mode isn't showing" ·
  "add a tool to the mode" · a `<slug>.viva.js` under `modes/` is open · "buffer view"
---
<!-- limit: 3800 chars -->
# mode — how the runtime reads a mode

## the path

`modes/<type>/<slug>/<slug>.viva.js` names the type and the slug.

Paladin gives every mode a directory on disk: `<mountpoint>/mode_<type>_<slug>`. Never invent an env var for it.

## the exports: a closed set

An export is read when its trait is declared.

```
export         trait
manifest       -
aperture       EXPOSED
buffer, surfaces  SURFACED
harness        HARNESSED
tools          TOOLING
emitter        EMITTER
dataset        DATASET, INTENTED
datasink       DATASINK
boot           BOOTED
freight        FRAUGHT
repl           REPLING
statics        -
provider       -   (a service)
```

- A new behaviour is a new export he names. Never a new manifest key.
- The export's name is the module key.

## traits are declared

- The runtime runs only the traits in `manifest.traits`. `traits: []` means no tools, no routes, no calls.
- A new trait is added in three places: `v.traits.mode` in typology, paladin's `TRAITS`, and `systems/runtime/subjects/mode/traits/index.js`.
- `tier`, `rounds` and `effort` belong to the user. A mode sets none.

## views

```js
export const buffer = v.buffer({ data: { … } });
export const surfaces = [{ slug, mount: "buffer/<Name>.jsx", mime: mime.dom.solid }];
```

- A view is Solid `.jsx`: `export default (element, props) => ({ destroy })`.
- A terminal face is a second view with `mime.tty.solid`.
- A dom view renders into a shadow root, with its stylesheet inside.
- `yields:` streams over the client wire. `output:` is one value.

## never leave the mode

- A mode's files import nothing outside the mode's directory.
- A domain shape is reached at runtime: `ctx.domain.schematics.X`.
- Shared view code is copied per mode, line for line; the mode's suite holds a step that the copy still equals its source.
- A capability is a tool first. The aperture wraps it for a route.
- A mode guesses nothing: no default import, no product slug.

## layout

```
modes/<type>/<slug>/
  <slug>.viva.js
  harness.js
  schematics.js
  aperture/index.js
  tools/index.js
  buffer/<Name>.jsx
  tests/*.test.js
```

## after an edit

- The runtime bundles the installed copy under `~/.viva/instances/<slug>/`. Sync the touched files there (skill `debug`).
- `~/.viva/registry` and `commons/` are watched. Every save deploys. A change of several files lands in one copy.
- The recipe is not watched. After a recipe edit run `viva instance/doctor`.
