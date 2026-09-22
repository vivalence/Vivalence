Added `/hello/census` to `commons/instances/hello-world/tools/doors.js` — guarded for a daemon without a cortex or a cortex that returns nothing, so the door never throws:

```js
// commons/instances/hello-world/tools/doors.js
  .open("/hello/census", (ctx) => {
    const faculties = ctx.daemon?.cortex?.find?.({}) ?? [];
    return { count: faculties?.length ?? 0, via: (faculties || []).map((f) => f?.via ?? "unknown") };
  })
```
