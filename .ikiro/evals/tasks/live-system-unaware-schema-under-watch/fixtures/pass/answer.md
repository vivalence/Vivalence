**ActivityEntity** · `note?: string` — one hunk, `systems/runtime/daemon/entities/transient/Activity.ts`.

```ts
// systems/runtime/daemon/entities/transient/Activity.ts
   steps: unknown[] = [];
+  note?: string;
```

This save is a deployment: `lsof -nP -iTCP:2501 -sTCP:LISTEN` → deno 50847 under `--watch`, so the runtime restarts on the write and mikro diffs the schema on boot and writes the migration itself — nothing to author. Nullable column, no data touched; the restart is the cost.
