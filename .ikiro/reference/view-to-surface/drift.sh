#!/bin/sh
# limit: 1400 chars · before the land: every file the rename writes (pristine vs renamed, both trees) compared to HIS live file; a row = a file that moved since the copy
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
REG=/Users/finn/.viva/registry
moved=0
total=0
diff -rq "$BOX/pristine" "$BOX/renamed" | grep '^Files ' | sed -E 's/^Files (.*) and .* differ$/\1/' | sed "s#^$BOX/pristine/##" > "$BOX/../drift.repo.txt"
diff -rq "$BOX/pristine-registry" "$BOX/renamed-registry" | grep '^Files ' | sed -E 's/^Files (.*) and .* differ$/\1/' | sed "s#^$BOX/pristine-registry/##" > "$BOX/../drift.registry.txt"
while read -r rel; do
  total=$((total + 1))
  cmp -s "$BOX/pristine/$rel" "$REPO/$rel" || { echo "MOVED repo $rel"; moved=$((moved + 1)); }
done < "$BOX/../drift.repo.txt"
while read -r rel; do
  total=$((total + 1))
  cmp -s "$BOX/pristine-registry/$rel" "$REG/$rel" || { echo "MOVED registry $rel"; moved=$((moved + 1)); }
done < "$BOX/../drift.registry.txt"
echo "$moved moved of $total files the rename writes"
