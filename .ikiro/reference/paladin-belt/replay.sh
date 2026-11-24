#!/bin/sh
# replay — land the paladin belt quest on a COPY of the tree and a COPY of the registry. Never on either.
#   sh .ikiro/reference/paladin-belt/replay.sh <copy of the tree> <copy of ~/.viva/registry>
set -e
here=/Users/finn/vivalence/code/vivalence/.ikiro
copy=${1:?a copy of the tree}
registry=${2:?a copy of the registry}
quest=$here/quests/paladin-belt-appendix-I-diffs.org
one() { python3 $here/methods/apply-diffs.py $quest "$1" --write --root $2 | tail -1; }
while read kind path; do
  case $kind in
    gone) rm "$copy/$path" ;;
    whole) mkdir -p "$copy/$(dirname $path)"; cp "$here/reference/paladin-belt/new/$path" "$copy/$path" ;;
  esac
done < $here/reference/paladin-belt/manifest.txt
one "* paladin" $copy
one "* runtime · ghost · anima" $copy
one "* commons" $copy
one "* testament" $copy
one "* the registry packages" $registry
