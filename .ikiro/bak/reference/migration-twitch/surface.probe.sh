#!/bin/sh
# limit: 2000 chars · the Surface entity file AS IT WOULD STAND (testament/prototypes/migration-plugins/typology/
# Surface.ts: View.ts renamed + its step on its twitch) inside a typology clone whose four neighbours are renamed
# bluntly, through `provider` with the twitches collected off the entity descriptors. His mount, version 0.2.0. $1 = scratch
set -e
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
MOUNT=/Users/finn/.viva/instances/localhost/mountpoint
RUN=$REPO/testament/prototypes/migration-plugins/provider.js
export DENO_DIR=/Users/finn/Library/Caches/deno

rm -rf "$BOX"
mkdir -p "$BOX/mount"
cp -cR "$REPO/subsystems/typology" "$BOX/typology"
sqlite3 "$MOUNT/localhost.viva.db" ".backup '$BOX/mount/localhost.viva.db'"
cp -R "$MOUNT/migrations" "$BOX/mount/migrations"

E=$BOX/typology/entities
rm "$E/View.ts"
cp "$REPO/testament/prototypes/migration-plugins/typology/Surface.ts" "$E/Surface.ts"
perl -pi -e 's/buffer_views/buffer_surfaces/g; s/view_id/surface_id/g; s/\bViews\b/Surfaces/g; s/\bviews\b/surfaces/g; s/View(?=Entity|Repository|Schema|\b)/Surface/g; s/\bview\b/surface/g' \
  "$E/File.ts" "$E/Buffer.ts" "$E/Mode.ts" "$E/index.ts"

boot() {
  ( cd "$REPO" && deno run -A --no-check --config "$REPO/deno.jsonc" "$RUN" "$BOX/typology" "$BOX/mount" localhost.viva.db 0.2.0 entities 2>&1 | grep -v 'migrator' )
}

echo "#### before"
sqlite3 "$BOX/mount/localhost.viva.db" "SELECT count(*) FROM View; SELECT count(*) FROM File WHERE view IS NOT NULL; SELECT count(*) FROM File;" | tr '\n' ' '
echo
echo "#### first boot"
boot
sqlite3 "$BOX/mount/localhost.viva.db" "SELECT count(*) FROM Surface; SELECT count(*) FROM File WHERE surface IS NOT NULL; SELECT count(*) FROM File; PRAGMA foreign_key_check;" | tr '\n' ' '
echo
echo "#### second boot"
boot
echo "#### the migration, up(), cut to 100"
sed -n '/up():/,/^  }/p' "$BOX"/mount/migrations/*vivalence@0.2.0.ts | grep addSql | cut -c1-100
