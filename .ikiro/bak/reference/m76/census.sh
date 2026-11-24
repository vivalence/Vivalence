#!/bin/zsh
# one-file runs of every suite in the named dirs; prints only reds, then a count
cd /Users/finn/vivalence/code/vivalence
OUT=/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/11950be0-d9a3-406b-a6f9-1449974984c4/scratchpad/m4/census.txt
: > $OUT
for f in $(find systems/runtime/tests subsystems/typology/tests subsystems/paladin/tests commons/lighthouses/multiplayer/tests -name '*.test.js' | grep -v '/bak/\|interactive/' | sort); do
  line=$(NO_COLOR=1 timeout 180 deno test --config deno.jsonc -A --no-check "$f" 2>&1 | grep -E 'ok \||FAILED \||^error:' | head -2 | tr '\n' ' ')
  echo "$f  $line" >> $OUT
done
echo "green $(grep -c ' ok |' $OUT) · red $(grep -vc ' ok |' $OUT)"
grep -v ' ok |' $OUT
