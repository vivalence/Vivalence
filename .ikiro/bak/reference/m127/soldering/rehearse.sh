#!/bin/sh
# limit: 1800 chars
# rehearsal of the guide `soldering`: two fresh copies of his droneaid package under <root>, `base` untouched,
# `edit` built by soldering.build.js; the package's suites on both, red STEP names compared.
# usage: sh .ikiro/reference/m127/soldering/rehearse.sh <root> <pictures dir>
REPO=/Users/finn/vivalence/code/vivalence
TREE=/Users/finn/.viva/registry/droneaid
ROOT=$1
for side in base edit; do
  rm -rf "$ROOT/$side"
  mkdir -p "$ROOT/$side"
  rsync -a --exclude .git --exclude .jj --exclude bak "$TREE/" "$ROOT/$side/droneaid/"
done
cd "$REPO" || exit 1
deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/soldering/soldering.build.js "$ROOT/edit" "$2" || exit 1
diff -rq "$ROOT/base/droneaid" "$ROOT/edit/droneaid"
for side in base edit; do
  D="$ROOT/$side/droneaid"
  NO_COLOR=1 deno test -A --no-check "$D/topographies/" > "$ROOT/$side.txt" 2>&1
  tail -3 "$ROOT/$side.txt" | head -1
  grep 'FAILED' "$ROOT/$side.txt" | grep '^  [PT]-' | sed -E 's/ \([0-9]+(ms|µs|s)\)$//' | sort -u > "$ROOT/$side.steps"
done
echo "red steps only on the edit:"
comm -13 "$ROOT/base.steps" "$ROOT/edit.steps"
echo "red steps only on the base:"
comm -23 "$ROOT/base.steps" "$ROOT/edit.steps"
