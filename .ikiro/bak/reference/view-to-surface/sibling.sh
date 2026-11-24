#!/bin/sh
# limit: 1000 chars · per sibling-edited assembly file: surface · plane · skin counts in the tested copy vs HIS live file, and any rename-target left
BOX=$1
REG=/Users/finn/.viva/registry
sh "$(dirname "$0")/verify.sh" "$BOX" 2>/dev/null | grep '^Files @assembly' | sed -E 's/^Files @(.*) and .*$/\1/' | while read -r rel; do
  c=$(grep -oiE 'surface|plane|skin' "$BOX/check-registry/$rel" | sort | uniq -c | tr -s ' ' | tr '\n' ' ')
  l=$(grep -oiE 'surface|plane|skin' "$REG/$rel" | sort | uniq -c | tr -s ' ' | tr '\n' ' ')
  left=$(grep -cE -- '--[a-z0-9-]*surface|surface(Sunk|Lift)|buffer, surface|surface: \{ place' "$REG/$rel")
  echo "$rel | check: $c| live: $l| left: $left"
done
