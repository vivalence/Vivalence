#!/bin/sh
# limit: 1600 chars · a renamed typology clone + a copy of his mountpoint, migrated through generator.probe.js; rows
# counted before · after. $1 = scratch dir
set -e
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
MOUNT=/Users/finn/.viva/instances/localhost/mountpoint
HERE=$REPO/.ikiro/reference/view-to-surface
export DENO_DIR=/Users/finn/Library/Caches/deno

rm -rf "$BOX"
mkdir -p "$BOX/mount"
cp -cR "$REPO/subsystems/typology" "$BOX/typology"
sqlite3 "$MOUNT/localhost.viva.db" ".backup '$BOX/mount/localhost.viva.db'"
cp -R "$MOUNT/migrations" "$BOX/mount/migrations"

E=$BOX/typology/entities
mv "$E/View.ts" "$E/Surface.ts"
perl -pi -e 's/buffer_views/buffer_surfaces/g; s/view_id/surface_id/g; s/\bViews\b/Surfaces/g; s/\bviews\b/surfaces/g; s/View(?=Entity|Repository|Schema|\b)/Surface/g; s/\bview\b/surface/g' \
  "$E/Surface.ts" "$E/File.ts" "$E/Buffer.ts" "$E/Mode.ts" "$E/index.ts"

echo "#### before"
sqlite3 "$BOX/mount/localhost.viva.db" "SELECT count(*) FROM View; SELECT count(*) FROM File WHERE view IS NOT NULL; SELECT count(*) FROM File;"

( cd "$REPO" && deno run -A --no-check --config "$REPO/deno.jsonc" "$HERE/generator.probe.js" \
    "$BOX/typology" "$BOX/mount" localhost.viva.db )

echo "#### after"
sqlite3 "$BOX/mount/localhost.viva.db" "SELECT count(*) FROM Surface; SELECT count(*) FROM File WHERE surface IS NOT NULL; SELECT count(*) FROM File; PRAGMA foreign_key_check;"
echo "#### File's foreign key row"
sqlite3 "$BOX/mount/localhost.viva.db" "SELECT sql FROM sqlite_master WHERE name = 'File';" | grep -o 'constraint `File_[a-z]*_foreign` foreign key (`[a-z]*`) references `[A-Za-z]*`' | tail -1
