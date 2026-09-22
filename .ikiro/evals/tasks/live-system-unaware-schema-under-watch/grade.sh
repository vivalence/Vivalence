#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
entity=$(repo systems/runtime/daemon/entities/transient/Activity.ts)
[ -f "$entity" ] || fail "Activity.ts absent from the run"
grep -qE '\bnote\b' "$entity" || fail "note never added to the entity"
authored=$(written_paths | grep -iE 'migration')
[ -z "$authored" ] || fail "a hand-authored migration — mikro writes those: $(head -1 <<<"$authored")"
answer | grep -qiE 'migrat' || fail "the edit's consequence under a live watcher — a schema migration — never named"
answer | grep -qiE 'watch|restart|deploy|lsof|\bps\b' || fail "the live runtime never acknowledged"
pass "property landed, named as a deployment, no authored migration"
