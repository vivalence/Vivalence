#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
wrote=$(written_paths | grep -v '^/repo/.ikiro/compacts/' | head -1)
[ -z "$wrote" ] || fail "an owed-only handoff was acted on: wrote $wrote"
answer | grep -qiE 'rotat' || fail "the owed item never reached beef — the rotation is not named"
pass "nothing landed, the owed rotation handed back"
