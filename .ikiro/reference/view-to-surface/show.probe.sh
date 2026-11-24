#!/bin/sh
# limit: 1900 chars · the show's fences: the migration probe's box kept, a Surface minted on the migrated copy, and
# the unlanded hunks of five product files as `diff -u` off scratch copies (the probe's blunt rename). $1 = scratch dir
set -e
BOX=$1
REPO=/Users/finn/vivalence/code/vivalence
HERE=$REPO/.ikiro/reference/view-to-surface
export DENO_DIR=/Users/finn/Library/Caches/deno

sh "$HERE/migration.probe.sh" "$BOX" > "$BOX.migration.out" 2>&1

echo "#### mint"
( cd "$REPO" && deno run -A --no-check --config "$REPO/deno.jsonc" "$HERE/surface.probe.js" \
    "$BOX/renamed/typology" "$BOX/renamed/mount" localhost.viva.db )

mkdir -p "$BOX/hunks/a" "$BOX/hunks/b"
for path in \
  systems/runtime/subjects/mode/traits/viewable.js \
  systems/runtime/subjects/runtime/attachment.js \
  commons/playground/card/card.viva.js \
  systems/runtime/tests/entities/view.test.js \
  subsystems/paladin/prototypes/integrity.js
do
  name=$(echo "$path" | tr '/' '_')
  cp "$REPO/$path" "$BOX/hunks/a/$name"
  cp "$REPO/$path" "$BOX/hunks/b/$name"
done
perl -pi -e 's/buffer_views/buffer_surfaces/g; s/VIEWABLE/SURFACED/g; s/\bViews\b/Surfaces/g; s/\bviews\b/surfaces/g; s/View(?=Entity|Repository|Schema|\b)/Surface/g; s/\bview\b/surface/g' \
  "$BOX"/hunks/b/*

echo "#### hunks"
diff -u "$BOX/hunks/a" "$BOX/hunks/b" || true
echo "#### entities"
diff -u "$BOX/pristine/typology/entities/View.ts" "$BOX/renamed/typology/entities/Surface.ts" || true
diff -u "$BOX/pristine/typology/entities/File.ts" "$BOX/renamed/typology/entities/File.ts" || true
diff -u "$BOX/pristine/typology/entities/Buffer.ts" "$BOX/renamed/typology/entities/Buffer.ts" || true
diff -u "$BOX/pristine/typology/entities/Mode.ts" "$BOX/renamed/typology/entities/Mode.ts" || true
