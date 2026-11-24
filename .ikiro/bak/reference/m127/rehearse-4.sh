#!/bin/sh
# limit: 2200 chars
# rehearsal of milestone 4: two fresh copies of his registry package under <root>, `base` untouched,
# `edit` with the named stops built; the suites on both, red STEP names compared.
# usage: sh .ikiro/reference/m127/rehearse-4.sh <root> s1 [s2 …]
REPO=/Users/finn/vivalence/code/vivalence
TREE=/Users/finn/.viva/registry/assembly
ROOT=$1
shift
for side in base edit; do
  rm -rf "$ROOT/$side"
  mkdir -p "$ROOT/$side"
  rsync -a --exclude .git --exclude .jj --exclude modes/bak "$TREE/" "$ROOT/$side/assembly/"
done
python3 "$REPO/.ikiro/reference/m127/stage-4.build.py" "$ROOT/edit" "$@" || exit 1
diff -rq "$ROOT/base/assembly" "$ROOT/edit/assembly"
cd "$REPO" || exit 1
for side in base edit; do
  A="$ROOT/$side/assembly"
  NO_COLOR=1 deno test -A --no-check "$A/domain/assembly/tests/" "$A/tests/" "$A/modes/guide/" "$A/modes/model/editor/tests/" > "$ROOT/$side.txt" 2>&1
  tail -3 "$ROOT/$side.txt" | head -1
  grep 'FAILED' "$ROOT/$side.txt" | grep '^  [PT]-' | sed -E 's/ \([0-9]+(ms|µs|s)\)$//' | sort -u > "$ROOT/$side.steps"
done
echo "red steps only on the edit:"
comm -13 "$ROOT/base.steps" "$ROOT/edit.steps"
echo "red steps only on the base:"
comm -23 "$ROOT/base.steps" "$ROOT/edit.steps"
grep -n 'P-colour\|P-kit' "$ROOT/edit.txt"
