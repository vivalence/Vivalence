#!/bin/sh
# limit: 3000 chars
# rehearsal of milestones 2 · 3 before a land: two fresh copies of his registry package under one temp root,
# `base` untouched, `edit` with the quest's two tangled sections replayed; the suites on both, red STEP names compared.
# usage: sh .ikiro/reference/m127/rehearse-2-3.sh   → prints the temp root on its first row
REPO=/Users/finn/vivalence/code/vivalence
QUEST=$REPO/.ikiro/quests/m127-interceptor-droneaid.org
TREE=/Users/finn/.viva/registry/assembly
ROOT=$(mktemp -d)
echo "$ROOT"
for side in base edit; do
  mkdir -p "$ROOT/$side"
  rsync -a --exclude .git --exclude .jj --exclude modes/bak "$TREE/" "$ROOT/$side/assembly/"
done
grep '^\*\* milestone [23] ' "$QUEST" > "$ROOT/sections.txt"
while IFS= read -r section; do
  python3 "$REPO/.ikiro/methods/apply-diffs.py" "$QUEST" "$section" --write --root "$ROOT/edit" | tail -1
done < "$ROOT/sections.txt"
diff -rq "$ROOT/base/assembly" "$ROOT/edit/assembly" | wc -l
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
