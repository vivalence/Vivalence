#!/bin/sh
# limit: 1800 chars · free surface onto HIS tree: rename.py dry then wet
set -e
REPO=/Users/finn/vivalence/code/vivalence
REG=/Users/finn/.viva/registry
HERE=$REPO/.ikiro/reference/view-to-surface

python3 "$HERE/rename.py" "$REPO" "$REG" dry
python3 "$HERE/rename.py" "$REPO" "$REG" wet
