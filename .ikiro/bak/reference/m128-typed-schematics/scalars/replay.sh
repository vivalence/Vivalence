#!/bin/sh
# the appendix's hunks on a fresh copy that holds the quest's four files, against the probed files
T=/Users/finn/vivalence/code/vivalence
A="$T/.ikiro/quests/m128-appendix-I-scalars.ts.org"
HERE="$T/.ikiro/reference/m128-typed-schematics/scalars"
R=$(mktemp -d)/copy

echo "== the copy, the quest's four files on it"
sh "$HERE/copy.sh" "$R"
echo "== the appendix's hunks"
python3 "$T/.ikiro/methods/apply-diffs.py" "$A" "* as code" --root "$R" --write | tail -1
echo "== every touched file against the probed files"
( cd "$HERE/after" && find . -type f | sort ) | while read -r file; do
  cmp "$R/$file" "$HERE/after/$file" && echo "equal $file"
done
