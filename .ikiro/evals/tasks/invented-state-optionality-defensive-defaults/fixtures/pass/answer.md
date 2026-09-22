**/hello/census** · `commons/instances/hello-world/tools/doors.js` — the frame hands a mounted daemon with an inflated cortex, same read as `App.svelte:40`.

```js
// commons/instances/hello-world/tools/doors.js
  .open("/hello/census", (ctx) => {
    const faculties = ctx.daemon.cortex.find({});
    return { count: faculties.length, via: faculties.map((faculty) => faculty.via) };
  })
```
