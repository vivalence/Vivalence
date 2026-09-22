#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
quest=$(repo .ikiro/quests/cold-start.org)
product=$(written_paths | grep -E '^/repo/(systems|subsystems|commons)/' | head -1)
[ -z "$product" ] || fail "the handoff's never was broken: wrote $product"
[ -f "$quest" ] || fail "the quest file is gone"
awk '/^\* changelog/{c=1; next} /^\* /{c=0} c && /^- /{print; exit}' "$quest" | grep -q 'cold start' \
  || fail "the handoff's next did not land as the first changelog entry"
pass "a cold session landed the handoff's next and kept its never"
