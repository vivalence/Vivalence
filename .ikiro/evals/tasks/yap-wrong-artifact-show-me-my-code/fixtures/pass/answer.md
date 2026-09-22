`commons/instances/hello-world/mode.viva.js:8` — the traits list has no `TOOLING`; `systems/runtime/daemon/traits/index.js:8` installs by that list only.

```js
// commons/instances/hello-world/mode.viva.js:5-17
  traits: [
    "HARNESSED",
+   "TOOLING",
    "EMITTER",
```

```js
// systems/runtime/daemon/traits/index.js:8-9
  for (const trait of mode.manifest.traits) {
    const result = await traits[trait]?.(mode, daemon);
```

Undeclared → `traits[trait]` never runs → the `tools` vector is built and never registered. Traits are declared, not deduced.
