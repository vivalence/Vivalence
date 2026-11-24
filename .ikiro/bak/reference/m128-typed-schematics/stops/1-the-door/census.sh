#!/bin/sh
S=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/c7863ddc-cbee-486c-89c8-f09ea0847126/scratchpad
T=/Users/finn/vivalence/code/vivalence

cd "$T" || exit 1

run() {
  name=$1
  shift
  empty=$(mktemp -d)
  DENO_DIR="$HOME/Library/Caches/deno" HOME="$empty" NO_COLOR=1 deno test -A --no-check "$@" > "$S/stop1/census.$name.log" 2>&1
  echo "$name rc $?"
  tail -3 "$S/stop1/census.$name.log" | cut -c1-200
}

for copy in s1 s1a; do
  rm -rf "$S/$copy/typology/tests"
  rsync -a "$T/subsystems/typology/tests/" "$S/$copy/typology/tests/"
done

[ "$1" = "copies" ] || run tree subsystems/typology/tests/
run s1 --config "$S/deno.s1.json" "$S/s1/typology/tests/"
run s1a --config "$S/deno.s1a.json" "$S/s1a/typology/tests/"
