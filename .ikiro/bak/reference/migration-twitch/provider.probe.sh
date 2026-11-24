#!/bin/sh
# limit: 2600 chars · testament/prototypes/migration-plugins/libsql/ (the two files as they would stand) through
# `provider`: 1 a mount at View meets Panel at 0.3.0, 0.2.0 skipped · 2 the same mount boots again · 3 a FRESH
# mount · 4 a dev diff at an unchanged version (pristine tree, no ears, his mount). Then the diff to the tree. $1 = scratch
set -e
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
MOUNT=/Users/finn/.viva/instances/localhost/mountpoint
RUN=$REPO/testament/prototypes/migration-plugins/provider.js
export DENO_DIR=/Users/finn/Library/Caches/deno

rm -rf "$BOX"
mkdir -p "$BOX/mount" "$BOX/fresh" "$BOX/same"
cp -cR "$REPO/subsystems/typology" "$BOX/typology"
for side in mount same; do
  sqlite3 "$MOUNT/localhost.viva.db" ".backup '$BOX/$side/localhost.viva.db'"
  cp -R "$MOUNT/migrations" "$BOX/$side/migrations"
done

E=$BOX/typology/entities
mv "$E/View.ts" "$E/Panel.ts"
perl -pi -e 's/buffer_views/buffer_panels/g; s/view_id/panel_id/g; s/\bViews\b/Panels/g; s/\bviews\b/panels/g; s/View(?=Entity|Repository|Schema|\b)/Panel/g; s/\bview\b/panel/g' \
  "$E/Panel.ts" "$E/File.ts" "$E/Buffer.ts" "$E/Mode.ts" "$E/index.ts"

boot() {
  ( cd "$REPO" && deno run -A --no-check --config "$REPO/deno.jsonc" "$RUN" "$@" 2>&1 | grep -v 'migrator' )
}
ledger() {
  sqlite3 "$1/localhost.viva.db" "SELECT name FROM _mikro_migrations ORDER BY id;" | sed -E 's/^Migration[0-9]+/Migration…/' | tail -3 | tr '\n' ' '
  echo
}

echo "#### 1 · View meets Panel, 0.2.0 skipped"
boot "$BOX/typology" "$BOX/mount" localhost.viva.db 0.3.0 panel
sqlite3 "$BOX/mount/localhost.viva.db" "SELECT count(*) FROM Panel; SELECT count(*) FROM File WHERE panel IS NOT NULL; SELECT count(*) FROM File; PRAGMA foreign_key_check;" | tr '\n' ' '
echo
ledger "$BOX/mount"
echo "#### 2 · the same mount boots again"
boot "$BOX/typology" "$BOX/mount" localhost.viva.db 0.3.0 panel
echo "#### 3 · a fresh mount"
boot "$BOX/typology" "$BOX/fresh" localhost.viva.db 0.3.0 panel
ledger "$BOX/fresh"
echo "#### 5 · a fresh mount at a prerelease, then the release"
mkdir -p "$BOX/pre"
boot "$BOX/typology" "$BOX/pre" localhost.viva.db 0.3.0-alpha.1 panel
boot "$BOX/typology" "$BOX/pre" localhost.viva.db 0.3.0 panel
ledger "$BOX/pre"
echo "#### 4 · his mount, the tree as it stands, no ears, version 0.1.0"
boot "$REPO/subsystems/typology" "$BOX/same" localhost.viva.db 0.1.0 none
ledger "$BOX/same"
echo "#### diff to the tree"
diff -u "$REPO/commons/datamaps/libsql/libsql.viva.js" "$REPO/testament/prototypes/migration-plugins/libsql/libsql.viva.js" || true
