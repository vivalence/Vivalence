#!/bin/bash
# PreCompact[manual] gate: /compact must not swallow a session that was never folded.
# PreCompact CANNOT inject context or steps (verified against code.claude.com/docs/en/hooks) —
# it can only allow, or block with exit 2. So the ikiro compact ritual is a GATE, not a pre-step.
# One-shot per session: first /compact is refused with the instruction; the retry always passes.
# Never deadlocks, never blocks auto-compaction (matcher is "manual" only).
input=$(cat)

session=$(jq -r '.session_id // "nosession"' <<<"$input")
trigger=$(jq -r '.compaction_trigger // empty' <<<"$input")

[ "$trigger" = "manual" ] || exit 0

stamp="${TMPDIR:-/tmp}/ikiro-compact-gate/${session}"
mkdir -p "$(dirname "$stamp")"

if [ -f "$stamp" ]; then
  exit 0
fi

: > "$stamp"

cat >&2 <<'GATE'
ikiro compact ritual has not run this session.

Fold the session FIRST, then /compact again (the retry is never blocked):
  1. write .ikiro/compacts/<topic-slug>.org   — NO dates in the slug, beef verbatim preserved
  2. memory: new/updated facts + MEMORY.md pointer
  3. .ikiro/zettelkasten.md — Open / Callouts
  4. .ikiro/world/frontier.md — what is live now

Canon: .ikiro/self/rituals.md ## the scribe's duties
GATE
exit 2
