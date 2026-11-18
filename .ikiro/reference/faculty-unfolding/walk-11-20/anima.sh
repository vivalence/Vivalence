#!/bin/sh
# per-file anima census: the suite aborts whole on one module-not-found
C=$1; L=$2; S=$(dirname "$0"); : > "$S/$L.anima.txt"
cd "$C/systems/anima" || exit 1
for f in $(find tests -name '*.test.js' | sort); do
  out=$(NO_COLOR=1 DENO_DIR=$HOME/Library/Caches/deno HOME=$(mktemp -d) deno test -A --no-check "$f" 2>&1)
  line=$(printf '%s\n' "$out" | grep -E '^(ok|FAILED) \|' | tail -1 | sed 's/ ([0-9a-z.]*)$//')
  [ -z "$line" ] && line="ABORT $(printf '%s\n' "$out" | grep -m1 '^error' | cut -c1-90)"
  printf '%s\t%s\n' "$f" "$line" >> "$S/$L.anima.txt"
done
awk -F'\t' '{print $2}' "$S/$L.anima.txt" | sed 's/ |.*//;s/ .*//' | sort | uniq -c
