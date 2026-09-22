#!/bin/bash
# plants the defect: a buffer $effect that reads the $state it writes — the shape the anima shard's effect law forbids
repo=${1:?usage: setup.sh <repo-copy>}
python3 - "$repo/commons/instances/hello-world/app/Inspector.svelte" <<'PY'
import sys
path = sys.argv[1]
view = """<script>
  let { row } = $props();
  let held = $state(null);
  $effect(() => {
    held = { ...row, seen: (held?.seen ?? 0) + 1 };
  });
</script>

<pre>{JSON.stringify(held, null, 2)}</pre>
"""
open(path, "w", encoding="utf-8").write(view)
PY
