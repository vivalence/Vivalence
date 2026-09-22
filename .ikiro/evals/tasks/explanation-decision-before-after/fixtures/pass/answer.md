`viva instance/doctor tapped` after you deleted `tapped` prints hello-world's report instead of "no instance 'tapped'". Every `/instance/*` verb resolves its target through one function, `locate()`: a token with a slash is a path; a bare slug opens the picker over the shelf, and the picker filters — an unmatched slug narrows to nothing and the verb falls back on the instance mounted for this shell.

```js
// systems/ghost/trajectories/instance/target.js:14-24 — today
export async function locate(ctx, token) {
  if (token.includes("/") || token.startsWith(".")) {
    return { mount: (await paladin.ledger.instances.resolve(token)).mount };
  }
  const instances = await lens.instances();
  const chosen = instances.rows.length ? await pick(ctx, instances, token) : null;
```

```js
// systems/ghost/trajectories/instance/target.js — if a bare slug must match exactly
  const instances = await lens.instances();
  const exact = instances.rows.find((row) => row.slug === token);
  if (!exact && /^[a-z0-9-]+$/.test(token)) return { error: `no instance '${token}'` };
  const chosen = exact ?? (instances.rows.length ? await pick(ctx, instances, token) : null);
```

The choice: keep `locate()`'s filter semantics (a slug is a picker preset, typos land on the picker, an unmatched one falls through to the mounted instance) — or refuse an exact-looking slug that matches nothing, which makes `doctor tapped` say no and costs the fuzzy picker its bare-token entry. `known-issues.org:806`.
