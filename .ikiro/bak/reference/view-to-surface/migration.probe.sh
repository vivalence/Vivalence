#!/bin/sh
# limit: 2600 chars · rename vs drop+create: a pristine and a renamed typology clone, each against its own copy of his
# mountpoint (db + migrations + snapshot). $1 = scratch dir. The clone's rename is the PROBE's (five entity files, blunt).
set -e
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
MOUNT=/Users/finn/.viva/instances/localhost/mountpoint
HERE=$REPO/.ikiro/reference/view-to-surface
export DENO_DIR=/Users/finn/Library/Caches/deno

rm -rf "$BOX"
mkdir -p "$BOX/pristine" "$BOX/renamed"
for side in pristine renamed; do
  cp -cR "$REPO/subsystems/typology" "$BOX/$side/typology"
  mkdir -p "$BOX/$side/mount"
  sqlite3 "$MOUNT/localhost.viva.db" ".backup '$BOX/$side/mount/localhost.viva.db'"
  cp -R "$MOUNT/migrations" "$BOX/$side/mount/migrations"
done

E=$BOX/renamed/typology/entities
mv "$E/View.ts" "$E/Surface.ts"
perl -pi -e 's/buffer_views/buffer_surfaces/g; s/view_id/surface_id/g; s/\bViews\b/Surfaces/g; s/\bviews\b/surfaces/g; s/View(?=Entity|Repository|Schema|\b)/Surface/g; s/\bview\b/surface/g' \
  "$E/Surface.ts" "$E/File.ts" "$E/Buffer.ts" "$E/Mode.ts" "$E/index.ts"
echo "== the clone's rename, rows changed"
diff -r "$BOX/pristine/typology/entities" "$BOX/renamed/typology/entities" | grep -c '^>' || true

scout() {
  sqlite3 "$1" <<SQL
.headers on
SELECT name FROM sqlite_master WHERE type = 'table' AND (name LIKE '%iew%' OR name LIKE '%urface%') ORDER BY name;
SELECT count(*) AS files FROM File;
SELECT name FROM pragma_table_info('File') WHERE name IN ('view', 'surface');
SQL
}

for side in pristine renamed; do
  echo "#### $side"
  ( cd "$REPO" && deno run -A --no-check --config "$REPO/deno.jsonc" "$HERE/migration.probe.js" \
      "$BOX/$side/typology" "$BOX/$side/mount" localhost.viva.db up )
  echo "== after"
  scout "$BOX/$side/mount/localhost.viva.db"
done

echo "#### counts, renamed"
sqlite3 "$BOX/renamed/mount/localhost.viva.db" "SELECT count(*) AS surfaces FROM Surface; SELECT count(*) AS with_surface FROM File WHERE surface IS NOT NULL; SELECT count(*) AS pivots FROM buffer_surfaces;" || true
echo "#### counts, his db now"
sqlite3 -readonly "$MOUNT/localhost.viva.db" "SELECT count(*) FROM View; SELECT count(*) FROM File WHERE view IS NOT NULL; SELECT count(*) FROM File; SELECT count(*) FROM buffer_views;"
