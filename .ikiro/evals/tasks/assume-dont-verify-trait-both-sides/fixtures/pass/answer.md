Not dead. Traits have two audiences — the daemon side is wiring, the client side is the interaction contract, and CONVERSATIONAL is read there:

```js
// systems/anima/src/app/panels/d/d.svelte:215
(m) => m.implements("application") || m.implements("conversational"),
```

Strip it and hello-world drops out of the sidebar. `commons/instances/hello-world/mode.viva.js:10` stays as is.
