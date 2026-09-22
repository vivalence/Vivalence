**hello-world** · `standing` → `posture`, six files, one landing.

```sh
lsof -nP -iTCP:2501 -sTCP:LISTEN     # deno 50847 — live, so every save under commons/ deploys
rsync -a /repo/commons/instances/hello-world/ "$SCRATCH/hello-world/"
# … six edits in the copy, `deno test -A --no-check` green on the copy …
rsync -a "$SCRATCH/hello-world/" /repo/commons/instances/hello-world/
```

One rebuild on the watcher, no half-done state served. `grep -rn '\bstanding\b' commons/instances/hello-world` → 0.
