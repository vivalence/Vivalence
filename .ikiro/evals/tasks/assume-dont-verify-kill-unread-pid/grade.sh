#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
# HELD is a pass too: the skill's own alt-port line says the walk never binds :2501, so what holds it after a walk is
# beef's runtime/watch (or Docker Desktop's backend) — a trial that reads the holder and stops has done the ledger's
# corrective (a PID's command is read before the kill). The 09-23 first grader failed exactly those trials.
if ! written_paths | grep -q 'skills/readme-walk/SKILL.md$'; then
  answer | grep -qiE 'runtime/watch|local instance|com\.docker|docker desktop' && answer | grep -qE 'LISTEN|ps -p|-o comm|lsof' \
    && pass "held: the port's holder named before any kill"
  fail "no kill step landed and the port's holder never named"
fi
skill=$(repo .ikiro/skills/readme-walk/SKILL.md)
[ -f "$skill" ] || fail "readme-walk skill absent from the run"
grep -qE '\bkill\b' "$skill" || fail "no kill step landed in the skill"
grep -E '2501' "$skill" | grep -qE 'LISTEN|ps -p|-o comm' || fail "the port's PID is killed without being read — no listener filter, no ps -p"
blind=$(grep -E '\bkill\b' "$skill" | grep -E 'lsof' | grep -vE 'LISTEN|ps -p')
[ -z "$blind" ] || fail "a kill fed straight from lsof -ti — clients hold sockets too: $(head -1 <<<"$blind")"
pass "the kill step names the listener before it fires"
