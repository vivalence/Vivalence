#!/bin/sh
# limit: 1900 chars · testament/prototypes/migration-plugins/hops.js on a copy of his mountpoint: the entity renamed
# straight to Panel (0.3.0), the mount still at View; then the three plugin cases again (the utility changed). $1 = scratch
set -e
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
MOUNT=/Users/finn/.viva/instances/localhost/mountpoint
export DENO_DIR=/Users/finn/Library/Caches/deno

rm -rf "$BOX"
mkdir -p "$BOX/mount"
cp -cR "$REPO/subsystems/typology" "$BOX/typology"
sqlite3 "$MOUNT/localhost.viva.db" ".backup '$BOX/mount/localhost.viva.db'"
cp -R "$MOUNT/migrations" "$BOX/mount/migrations"

E=$BOX/typology/entities
mv "$E/View.ts" "$E/Panel.ts"
perl -pi -e 's/buffer_views/buffer_panels/g; s/view_id/panel_id/g; s/\bViews\b/Panels/g; s/\bviews\b/panels/g; s/View(?=Entity|Repository|Schema|\b)/Panel/g; s/\bview\b/panel/g' \
  "$E/Panel.ts" "$E/File.ts" "$E/Buffer.ts" "$E/Mode.ts" "$E/index.ts"

echo "#### before"
sqlite3 "$BOX/mount/localhost.viva.db" "SELECT count(*) FROM View; SELECT count(*) FROM File WHERE view IS NOT NULL; SELECT count(*) FROM File;"
( cd "$REPO" && deno run -A --no-check --config "$REPO/deno.jsonc" "$REPO/testament/prototypes/migration-plugins/hops.js" \
    "$BOX/typology" "$BOX/mount" localhost.viva.db )
echo "#### after"
sqlite3 "$BOX/mount/localhost.viva.db" "SELECT count(*) FROM Panel; SELECT count(*) FROM File WHERE panel IS NOT NULL; SELECT count(*) FROM File; PRAGMA foreign_key_check; SELECT name FROM _mikro_migrations ORDER BY id;"
echo "#### the two migrations, up() statements cut to 110"
for f in "$BOX"/mount/migrations/*vivalence*; do
  echo "== $(basename "$f")"
  sed -n '/up():/,/^  }/p' "$f" | grep addSql | cut -c1-110
done
