#!/bin/bash
source "$(dirname "$0")/../../lib.sh" "$1"
answer | grep -qE '12\.01_slowstart\.mdx|12_software/12\.01_slowstart' || fail "the page's file never named — its identity lives in the FILENAME, a body grep finds nothing"
written_paths | grep -qE '/README\.md$' && fail "README link rewritten for a page that exists"
readme=$(repo README.md)
[ ! -f "$readme" ] || grep -q '12.01_slowstart' "$readme" || fail "the slowstart link is gone from README.md"
pass "page found by its name, link untouched"
