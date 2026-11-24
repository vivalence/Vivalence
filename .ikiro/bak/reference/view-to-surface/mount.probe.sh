#!/bin/sh
# limit: 2000 chars · his mount, copied, boots the datamap of the renamed tree twice: the Surface step is heard once,
# entities kept by id. $1 = the box entity.build.py ran in · $2 = scratch for the mount copy
set -e
BOX=$1
COPY=$2
REPO=/Users/finn/vivalence/code/vivalence
MOUNT=/Users/finn/.viva/instances/localhost/mountpoint
DB=localhost.viva.db
export DENO_DIR=/Users/finn/Library/Caches/deno

rm -rf "$COPY"
mkdir -p "$COPY"
sqlite3 "file:$MOUNT/$DB?mode=ro" ".backup '$COPY/$DB'"
cp -R "$MOUNT/migrations" "$COPY/migrations"
cp "$MOUNT"/.snapshot-* "$COPY/" 2>/dev/null || true

count() {
  sqlite3 "$COPY/$DB" "$1" | tr '\n' ' '
  echo
}
boot() {
  ( cd "$BOX/renamed" && HOME=$(mktemp -d) deno run -A --no-check --config "$BOX/renamed/deno.jsonc" \
    "$REPO/.ikiro/reference/view-to-surface/mount.probe.js" "$BOX/renamed" "$COPY" "$DB" 2>&1 | grep -v '^\[' )
}

echo "#### before: View · Files holding one · Files · pivot"
count "select count(*) from View; select count(*) from File where view is not null; select count(*) from File; select count(*) from buffer_views;"
sqlite3 "$COPY/$DB" "select id from View order by id" > "$COPY/ids.before"
sqlite3 "$COPY/$DB" "select id || ' ' || view from File where view is not null order by id" > "$COPY/held.before"
echo "#### first boot"
boot
echo "#### after: Surface · Files holding one · Files · pivot · foreign_key_check · tables named View"
count "select count(*) from Surface; select count(*) from File where surface is not null; select count(*) from File; select count(*) from buffer_surfaces; select count(*) from pragma_foreign_key_check; select count(*) from sqlite_master where name in ('View', 'buffer_views');"
sqlite3 "$COPY/$DB" "select id from Surface order by id" > "$COPY/ids.after"
sqlite3 "$COPY/$DB" "select id || ' ' || surface from File where surface is not null order by id" > "$COPY/held.after"
echo "#### Modes storing VIEWABLE · GENERATIVE · SURFACED"
count "select count(*) from Mode where traits like '%VIEWABLE%'; select count(*) from Mode where traits like '%GENERATIVE%'; select count(*) from Mode where traits like '%SURFACED%';"
cmp "$COPY/ids.before" "$COPY/ids.after" && echo "ids equal: $(wc -l < "$COPY/ids.after" | tr -d ' ') Surfaces"
cmp "$COPY/held.before" "$COPY/held.after" && echo "holders equal: $(wc -l < "$COPY/held.after" | tr -d ' ') Files"
echo "#### second boot"
boot
echo "#### migrations"
sqlite3 "$COPY/$DB" "select name from _mikro_migrations order by id"
echo "#### the stamped migration, up(), cut to 110"
sed -n '/up():/,/^  }/p' "$COPY"/migrations/*vivalence@*.ts | grep addSql | cut -c1-110
