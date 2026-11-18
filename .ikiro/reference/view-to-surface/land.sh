#!/bin/sh
# limit: 1800 chars · free surface onto HIS tree: refuses unless repo + four jj registry packages sit on an empty @; captures the two no-VCS packages; rename.py dry then wet
set -e
REPO=/Users/finn/vivalence/code/vivalence
REG=/Users/finn/.viva/registry
HERE=$REPO/.ikiro/reference/view-to-surface
BAK=/Users/finn/.viva/bak/view-to-surface

for dir in "$REPO" "$REG/assembly" "$REG/chess" "$REG/education" "$REG/young-ladys-primer"; do
  changed=$(cd "$dir" && jj diff --stat -r @ | grep -c '|' || true)
  echo "$dir: $changed changed in @"
  [ "$changed" = 0 ] || { echo "REFUSED: $dir @ holds work; jj new first"; exit 2; }
done

for pkg in media vcompany; do
  target="$BAK/$pkg-20261121"
  [ -e "$target" ] && { echo "REFUSED: $target exists"; exit 2; }
  mkdir -p "$BAK"
  cp -cR "$REG/$pkg" "$target"
  echo "captured $REG/$pkg -> $target"
done

python3 "$HERE/rename.py" "$REPO" "$REG" dry | grep -v ALLOW
python3 "$HERE/rename.py" "$REPO" "$REG" wet | grep -v ALLOW
