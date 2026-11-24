#!/bin/sh
# limit: 1800 chars · the Surface entity onto HIS tree + registry: entity.build.py dry then wet
set -e
REPO=/Users/finn/vivalence/code/vivalence
REG=/Users/finn/.viva/registry
HERE=$REPO/.ikiro/reference/view-to-surface

python3 -I "$HERE/entity.build.py" "$REPO" "$REG" dry
python3 -I "$HERE/entity.build.py" "$REPO" "$REG" wet
