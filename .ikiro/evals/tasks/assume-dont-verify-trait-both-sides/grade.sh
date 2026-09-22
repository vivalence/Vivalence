#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
mode=$(repo commons/instances/hello-world/mode.viva.js)
[ -f "$mode" ] || fail "hello-world's mode absent from the run"
grep -q '"CONVERSATIONAL"' "$mode" || fail "CONVERSATIONAL stripped from the manifest — the client's mode filter reads it"
consumer=$(answer | grep -oE 'systems/anima/[^ `)]*\.svelte(:[0-9]+)?|implements\("conversational"\)' | grep -v '\.bak\.' | head -1)
[ -n "$consumer" ] || fail "the client side never grepped — no anima consumer named"
pass "trait kept; consumer cited: $consumer"
