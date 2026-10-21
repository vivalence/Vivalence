#!/bin/sh
# census-suites.sh — the ten suites, serial, NO_COLOR=1, HOME an empty temp dir per suite (a test never reads this machine)
#
#     RIG=<untouched copy> BASE=<replayed copy> [ONLY="rig base"] OUT=<dir> sh .ikiro/methods/census-suites.sh
#
# One summary line per (copy, suite) in $OUT/summary.txt; the full log in $OUT/<copy>/<suite>.log.
# hello-world snapshots: a fresh tree runs SNAPSHOT_HOT=1 once on commons/instances/hello-world/tests before the census.
# A suite walks a whole tests/ dir but memo (memo.test · memo.snapshot.test ride outside, green since m102 landed) and stub.
OUT=${OUT:-/tmp/census}
ONLY=${ONLY:-rig base}
CACHE=${DENO_DIR:-$(deno info --json 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin)["denoDir"])')}
mkdir -p "$OUT/rig" "$OUT/base"

suite() { # name target...  — HOME empty per suite (a test never reads this machine); DENO_DIR is the module cache only, carried so nothing re-downloads
  name=$1; shift
  log="$OUT/$copy/$name.log"
  start=$(date +%s)
  ( cd "$dir" && HOME=$(mktemp -d) DENO_DIR="$CACHE" NO_COLOR=1 perl -e 'alarm 1200; exec @ARGV' -- deno test -A --no-check --parallel "$@" ) > "$log" 2>&1
  code=$?
  printf '%-6s %-13s exit %-3s %4ss  %s\n' "$copy" "$name" "$code" "$(( $(date +%s) - start ))" "$(grep -E '^(ok|FAILED) \|' "$log" | tail -1)" | tee -a "$OUT/summary.txt"
}

run() {
  suite typology      subsystems/typology/tests
  suite paladin       subsystems/paladin/tests
  suite runtime       systems/runtime/tests
  suite ghost         systems/ghost/tests
  suite dapper        subsystems/dapper/tests
  suite drapes        subsystems/drapes/tests
  suite hello-world   commons/instances/hello-world/tests
  suite hallucinators commons/hallucinators
  suite memo          commons/fixtures/memo/tests/dataset.test.js commons/fixtures/memo/tests/domain.snapshot.test.js commons/fixtures/memo/tests/sm2.test.js commons/fixtures/memo/tests/tablet.snapshot.test.js
  suite stub          commons/fixtures/testing/hal/stub/tests
}

: > "$OUT/summary.txt"
case " $ONLY " in *" rig "*)  [ -n "$RIG" ]  || { echo "RIG=<dir> required";  exit 2; }; copy=rig;  dir=$RIG;  run;; esac
case " $ONLY " in *" base "*) [ -n "$BASE" ] || { echo "BASE=<dir> required"; exit 2; }; copy=base; dir=$BASE; run;; esac
echo DONE >> "$OUT/summary.txt"
