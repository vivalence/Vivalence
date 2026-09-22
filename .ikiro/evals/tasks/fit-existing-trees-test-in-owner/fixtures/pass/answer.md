**persona.test.js** · `commons/instances/hello-world/tests/persona.test.js` — the mode's tests live in the mode (eleven siblings there, `rig.js` mounts it).

```js
// commons/instances/hello-world/tests/persona.test.js
Deno.test("persona without a hallucinator", async () => {
  const ctx = { daemon: { cortex: { findOne: () => null } }, input: { user: "hi" } };
  assertEquals(await persona(ctx), { greeting: "No hallucinator attached. Bot says high." });
});
```

`deno test -A --no-check commons/instances/hello-world/tests/persona.test.js` → 1 passed | 0 failed.
