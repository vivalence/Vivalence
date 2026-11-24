#!/bin/sh
# limit: 2000 chars · the ten census suites, then anima · sheets · four registry packages, pristine vs renamed, reds by name
S=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/e098a56c-10b6-4c39-bde7-2c3d73cc534f/scratchpad
B=$S/m1box
OUT=$S/m1census
METHOD=/Users/finn/vivalence/code/vivalence/.ikiro/methods/census-suites.sh
rm -rf "$OUT"
mkdir -p "$OUT/rig" "$OUT/base"
export DENO_DIR=/Users/finn/Library/Caches/deno

RIG=$B/pristine BASE=$B/renamed OUT=$OUT sh "$METHOD" > /dev/null

extra() {
  copy=$1; dir=$2; registry=$3; name=$4; shift 4
  log="$OUT/$copy/$name.log"
  start=$(date +%s)
  ( cd "$dir" && HOME=$(mktemp -d) NO_COLOR=1 perl -e 'alarm 1200; exec @ARGV' -- deno test -A --no-check --parallel --config "$dir/deno.jsonc" "$@" ) > "$log" 2>&1
  code=$?
  printf '%-6s %-13s exit %-3s %4ss  %s\n' "$copy" "$name" "$code" "$(( $(date +%s) - start ))" "$(grep -E '^(ok|FAILED) \|' "$log" | tail -1)" >> "$OUT/summary.txt"
}

for side in rig base; do
  if [ "$side" = rig ]; then dir=$B/pristine; registry=$B/pristine-registry; else dir=$B/renamed; registry=$B/renamed-registry; fi
  extra "$side" "$dir" "$registry" anima "$dir/systems/anima/tests"
  extra "$side" "$dir" "$registry" sheets "$dir/subsystems/sheets/tests"
  extra "$side" "$dir" "$registry" reg-assembly "$registry/assembly"
  extra "$side" "$dir" "$registry" reg-chess "$registry/chess"
  extra "$side" "$dir" "$registry" reg-education "$registry/education"
  extra "$side" "$dir" "$registry" reg-vcompany "$registry/vcompany"
done

ONLY=none OUT=$OUT sh "$METHOD" > /dev/null
echo FINISHED >> "$OUT/summary.txt"
