#!/bin/sh
# after.sh — chars before (the backup) and after (the tree) for every document the prune rewrote.
bak="$HOME/.viva/bak/ikiro/prune-20261123"
cd "$(dirname "$0")/../../.." || exit 1
total_before=0
total_after=0
row() {
  before=$(wc -m < "$1" | tr -d ' ')
  after=$(wc -m < "$2" | tr -d ' ')
  total_before=$((total_before + before))
  total_after=$((total_after + after))
  printf '%-28s %7s %7s\n' "$3" "$before" "$after"
}
row "$bak/codestyle.md" codestyle.md codestyle.md
row "$bak/world/codemap/map.md" world/codemap/map.md map.md
row "$bak/README.md" README.md README.md
for dir in skills/*/; do
  name=$(basename "$dir")
  [ -f "$bak/skills/$name/SKILL.md" ] || continue
  row "$bak/skills/$name/SKILL.md" "skills/$name/SKILL.md" "skills/$name"
done
printf '%-28s %7s %7s\n' total "$total_before" "$total_after"
