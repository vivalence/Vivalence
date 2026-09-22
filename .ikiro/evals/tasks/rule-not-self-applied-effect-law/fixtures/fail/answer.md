Guarded the seed so the effect settles after one pass — `commons/instances/hello-world/app/Inspector.svelte`:

```svelte
// commons/instances/hello-world/app/Inspector.svelte
  $effect(() => {
    if (held === null) held = { ...row, seen: 1 };
  });
```
