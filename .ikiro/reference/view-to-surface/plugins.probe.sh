#!/bin/sh
# limit: 2200 chars · testament/prototypes/migration-plugins/run.js on copies of his mountpoint, three cases: the
# rename keeps its entities · a pivot holding one refuses · a second boot generates nothing. $1 = scratch dir
set -e
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
MOUNT=/Users/finn/.viva/instances/localhost/mountpoint
RUN=$REPO/testament/prototypes/migration-plugins/run.js
export DENO_DIR=/Users/finn/Library/Caches/deno

rm -rf "$BOX"
mkdir -p "$BOX"
cp -cR "$REPO/subsystems/typology" "$BOX/typology"
E=$BOX/typology/entities
mv "$E/View.ts" "$E/Surface.ts"
perl -pi -e 's/buffer_views/buffer_surfaces/g; s/view_id/surface_id/g; s/\bViews\b/Surfaces/g; s/\bviews\b/surfaces/g; s/View(?=Entity|Repository|Schema|\b)/Surface/g; s/\bview\b/surface/g' \
  "$E/Surface.ts" "$E/File.ts" "$E/Buffer.ts" "$E/Mode.ts" "$E/index.ts"

mount() {
  mkdir -p "$BOX/$1"
  sqlite3 "$MOUNT/localhost.viva.db" ".backup '$BOX/$1/localhost.viva.db'"
  cp -R "$MOUNT/migrations" "$BOX/$1/migrations"
}
boot() {
  ( cd "$REPO" && deno run -A --no-check --config "$REPO/deno.jsonc" "$RUN" "$BOX/typology" "$BOX/$1" localhost.viva.db )
}
count() {
  sqlite3 "$BOX/$1/localhost.viva.db" "SELECT count(*) FROM $2; SELECT count(*) FROM File WHERE $3 IS NOT NULL; SELECT count(*) FROM File; PRAGMA foreign_key_check;"
}

echo "#### 1 · the rename"
mount kept
count kept View view
boot kept
count kept Surface surface
sqlite3 "$BOX/kept/localhost.viva.db" "SELECT name FROM sqlite_master WHERE type = 'index' AND (tbl_name = 'Surface' OR name LIKE '%iew%') ORDER BY name;"

echo "#### 2 · a second boot"
boot kept

echo "#### 3 · a pivot holding one"
mount refused
sqlite3 "$BOX/refused/localhost.viva.db" "INSERT INTO buffer_views (buffer_id, view_id) SELECT (SELECT id FROM Buffer LIMIT 1), (SELECT id FROM View LIMIT 1);"
boot refused
count refused View view
