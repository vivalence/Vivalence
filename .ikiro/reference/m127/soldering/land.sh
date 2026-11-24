#!/bin/sh
# limit: 2600 chars
# the land of the guide `soldering`: his droneaid package's changed files and his instance db captured, then the
# rehearsed copy's files copied on in ONE pass: pictures and dataset first (the watcher skips drained targets),
# the code last (its save restarts the runtime, whose boot installs the new entities from the files).
# usage: sh .ikiro/reference/m127/soldering/land.sh <rehearsal root>
ROOT=$1
TREE=/Users/finn/.viva/registry/droneaid
DB=/Users/finn/.viva/instances/localhost/mountpoint/localhost.viva.db
BAK=/Users/finn/.viva/bak/registry/droneaid-soldering-20261121
G=topographies/guides
[ -d "$ROOT/edit/droneaid" ] || { echo "no rehearsal at $ROOT"; exit 1; }
[ -e "$BAK" ] && { echo "capture exists: $BAK"; exit 1; }
for path in $G/dataset/literals/guides.js $G/dataset/literals/steps.js $G/guides.viva.js $G/harvest/harvest.js $G/tests/harvest.test.js; do
  cmp -s "$TREE/$path" "$ROOT/base/droneaid/$path" || { echo "his tree moved since the rehearsal: $path"; exit 1; }
done
[ -e "$TREE/$G/harvest/soldering.js" ] && { echo "soldering.js exists"; exit 1; }
mkdir -p "$BAK"
for path in $G/dataset/literals/guides.js $G/dataset/literals/steps.js $G/guides.viva.js $G/harvest/harvest.js $G/tests/harvest.test.js; do
  mkdir -p "$BAK/$(dirname "$path")"
  cp -p "$TREE/$path" "$BAK/$path"
done
sqlite3 -readonly "$DB" ".backup '$BAK/localhost.viva.db'" || { echo "db capture failed"; exit 1; }
for path in $G/freight/manual/3e32c1fc316b.webp $G/freight/manual/6d8443726d85.webp $G/dataset/literals/guides.js $G/dataset/literals/steps.js $G/harvest/soldering.js $G/harvest/harvest.js $G/tests/harvest.test.js $G/guides.viva.js; do
  cp "$ROOT/edit/droneaid/$path" "$TREE/$path"
done
diff -rq -x .git -x .jj -x bak "$TREE" "$ROOT/edit/droneaid" || true
echo "landed; capture at $BAK"
