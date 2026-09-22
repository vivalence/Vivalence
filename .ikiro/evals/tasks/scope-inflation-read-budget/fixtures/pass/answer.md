**instances/count** · `systems/ghost/trajectories/instances/index.js` — one sibling of `/list` on the same vector.

```js
// systems/ghost/trajectories/instances/index.js
instances.open(
  { nature: "/count", valence: "how many instances the shelf holds", schema: v.object({}) },
  async (ctx) => {
    ctx.effect = { count: (await paladin.ledger.instances.list()).length };
  },
);
```

Read: the ghost shard, the instances vector, one sibling verb. `viva instances/count` → `{ count: 3 }` on this shelf.
