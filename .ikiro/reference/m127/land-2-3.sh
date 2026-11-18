#!/bin/sh
# limit: 3000 chars
# the land of milestones 2 · 3: the files the rehearsed copy changes, captured from his tree, then copied onto it
# in ONE pass (his watcher restarts the runtime on the first save), then compared byte by byte.
# usage: sh .ikiro/reference/m127/land-2-3.sh <rehearsal root>
ROOT=$1
TREE=/Users/finn/.viva/registry/assembly
BAK=/Users/finn/.viva/bak/registry/assembly-stage-2-3-20261121
[ -d "$ROOT/edit/assembly" ] || { echo "no rehearsal at $ROOT"; exit 1; }
[ -e "$BAK" ] && { echo "capture exists: $BAK"; exit 1; }
diff -rq "$ROOT/base/assembly" "$ROOT/edit/assembly" | sed -E "s|^Files $ROOT/base/assembly/(.*) and .* differ$|\1|" > "$ROOT/files.txt"
grep -c . "$ROOT/files.txt"
grep -v '^[a-z]' "$ROOT/files.txt" && { echo "a row is no path"; exit 1; }
while IFS= read -r path; do
  cmp -s "$TREE/$path" "$ROOT/base/assembly/$path" || { echo "his tree moved since the rehearsal: $path"; exit 1; }
done < "$ROOT/files.txt"
while IFS= read -r path; do
  mkdir -p "$BAK/$(dirname "$path")"
  cp -p "$TREE/$path" "$BAK/$path"
done < "$ROOT/files.txt"
while IFS= read -r path; do
  cp "$ROOT/edit/assembly/$path" "$TREE/$path"
done < "$ROOT/files.txt"
while IFS= read -r path; do
  cmp "$TREE/$path" "$ROOT/edit/assembly/$path" || echo "DIFFERS $path"
done < "$ROOT/files.txt"
diff -rq -x .git -x .jj -x bak "$TREE" "$ROOT/edit/assembly" | grep -v '^Only in /Users' || echo "TREE EQUALS THE REHEARSED COPY"
