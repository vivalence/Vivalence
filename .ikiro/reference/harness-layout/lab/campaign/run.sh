#!/bin/bash
S=$(cd "$(dirname "$0")" && pwd); H=${CAMPAIGN_HOME:?"a HOME holding ~/.viva/registry/{commons,education} + registry.json"}
cd /Users/finn/vivalence/code/vivalence || exit 9
for f in "$@"; do
  log="$S/logs/$(echo "$f" | tr '/' '-' | sed 's/\.test\.js$//').log"
  mkdir -p "$S/logs"
  DENO_DIR=~/Library/Caches/deno HOME=$H timeout 300 deno test -A --no-check --frozen --config deno.jsonc "$S/$f" > "$log" 2>&1
  rc=$?
  echo "$f rc=$rc $(sed 's/\x1b\[[0-9;]*m//g' "$log" | grep -E '^(ok|FAILED) \|' | tail -1)"
done
