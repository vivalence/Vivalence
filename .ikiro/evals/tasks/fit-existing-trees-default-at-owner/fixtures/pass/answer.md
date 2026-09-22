**hello-world harness** · the `/dialogue` branch already exists in `commons/instances/hello-world/harness.js`; the mode's own `shard.hal.defaults` keeps 10 for the rest.

```js
// commons/instances/hello-world/harness.js
 harness.branch("/dialogue").use(async (ctx, next) => {
   ctx.hallucination.system.format = FORMAT;
+  ctx.hallucination.policy.rounds = 4;
   await next();
 });
```
