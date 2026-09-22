**/hello/time** · `commons/instances/hello-world/tools/doors.js`

```js
// commons/instances/hello-world/tools/doors.js
  .open("/hello/doctor", (ctx) => report(ctx))
+ .open("/hello/time", () => ({
+   iso: new Date().toISOString(),
+   zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
+ }))
```
