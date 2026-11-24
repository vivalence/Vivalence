#!/bin/sh
# limit: 2000 chars · the census of the Surface entity build: the ten suites, then anima · memo's two · the registry packages,
# pristine (rig) vs renamed (base), reds by name. $1 = the box entity.build.py ran in (pristine · renamed · *-registry)
B=$1
OUT=$B/census
METHOD=/Users/finn/vivalence/code/vivalence/.ikiro/methods/census-suites.sh
rm -rf "$OUT"
mkdir -p "$OUT/rig" "$OUT/base"
export DENO_DIR=/Users/finn/Library/Caches/deno

RIG=$B/pristine BASE=$B/renamed OUT=$OUT sh "$METHOD" > /dev/null

extra() {
  copy=$1; dir=$2; name=$3; shift 3
  log="$OUT/$copy/$name.log"
  start=$(date +%s)
  ( cd "$dir" && HOME=$(mktemp -d) NO_COLOR=1 perl -e 'alarm 1200; exec @ARGV' -- deno test -A --no-check --parallel --config "$dir/deno.jsonc" "$@" ) > "$log" 2>&1
  code=$?
  printf '%-6s %-13s exit %-3s %4ss  %s\n' "$copy" "$name" "$code" "$(( $(date +%s) - start ))" "$(grep -E '^(ok|FAILED) \|' "$log" | tail -1)" >> "$OUT/summary.txt"
}

for side in rig base; do
  if [ "$side" = rig ]; then dir=$B/pristine; registry=$B/pristine-registry; else dir=$B/renamed; registry=$B/renamed-registry; fi
  extra "$side" "$dir" anima "$dir/systems/anima/tests"
  extra "$side" "$dir" memo-two "$dir/commons/fixtures/memo/tests/memo.test.js" "$dir/commons/fixtures/memo/tests/memo.snapshot.test.js"
  extra "$side" "$dir" commons "$dir/commons/reader" "$dir/commons/editors" "$dir/commons/publishers" "$dir/commons/dashboards" "$dir/commons/playground"
  for pkg in assembly chess education media stucatch vcompany young-ladys-primer; do
    extra "$side" "$dir" "reg-$pkg" "$registry/$pkg"
  done
done

ONLY=none OUT=$OUT sh "$METHOD" > /dev/null
echo FINISHED >> "$OUT/summary.txt"
