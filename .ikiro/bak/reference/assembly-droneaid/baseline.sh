#!/bin/sh
# limit: 2200 chars
# baseline of the two registry packages @assembly · @droneaid: every suite file, serial, on a COPY.
# usage: sh .ikiro/reference/assembly-droneaid/baseline.sh <root>     (a scratch dir; it is emptied)
# out:   <root>/out/summary.txt (one row a file) · <root>/out/reds.txt (red step names) · <root>/out/<file>.log
# Three laws, each met as a false result 11-23:
#   a COPY, never the registry: it is a watched root of his runtime (systems/runtime/watch.js)
#   both packages side by side: droneaid's rig mounts ../../assembly (droneaid/tests/rig.js:9)
#   HOME empty: the rig's ledger is its own; a real HOME holds @assembly already and the pensieve refuses the copy
REPO=/Users/finn/vivalence/code/vivalence
ROOT=${1:?usage: baseline.sh <root>}
OUT="$ROOT/out"
CACHE=$(deno info --json 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin)["denoDir"])')
rm -rf "$ROOT/assembly" "$ROOT/droneaid" "$OUT"
mkdir -p "$OUT"
rsync -a --exclude .git --exclude .jj /Users/finn/.viva/registry/assembly/ "$ROOT/assembly/"
rsync -a --exclude .git --exclude .jj /Users/finn/.viva/registry/droneaid/ "$ROOT/droneaid/"
cd "$REPO" || exit 1
find "$ROOT/assembly" "$ROOT/droneaid" -name '*.test.js' -not -path '*/bak/*' | sort > "$OUT/files.txt"
: > "$OUT/summary.txt"
: > "$OUT/reds.txt"
while read -r file; do
  name=$(echo "${file#$ROOT/}" | tr '/' '_')
  HOME=$(mktemp -d) DENO_DIR="$CACHE" NO_COLOR=1 perl -e 'alarm 600; exec @ARGV' -- \
    deno test -A --no-check "$file" > "$OUT/$name.log" 2>&1
  code=$?
  printf 'exit %-3s %-62s %s\n' "$code" "${file#$ROOT/}" "$(grep -E '^(ok|FAILED) \|' "$OUT/$name.log" | tail -1)" >> "$OUT/summary.txt"
  grep -E '\.\.\. FAILED|\(uncaught error\)$' "$OUT/$name.log" | sed -E 's/ \([0-9]+(ms|µs|s)\)$//; s/^ +//' | sort -u \
    | sed "s|^|${file#$ROOT/}: |" >> "$OUT/reds.txt"
done < "$OUT/files.txt"
cat "$OUT/summary.txt"
