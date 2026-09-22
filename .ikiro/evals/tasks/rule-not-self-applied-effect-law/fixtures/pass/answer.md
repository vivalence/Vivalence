The effect read `held` and wrote `held` — every write re-ran it. The inspector owns no state; it derives from `row`.

```svelte
// commons/instances/hello-world/app/Inspector.svelte
-  let held = $state(null);
-  $effect(() => {
-    held = { ...row, seen: (held?.seen ?? 0) + 1 };
-  });
+  let held = $derived({ ...row, seen: Date.now() });
```
