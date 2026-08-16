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

Fold the session FIRST, then /compact again (the retry is never blocked).

WALK it, do not recall it — recall is where the recency bias comes from:
  0. spine   run the extractor in .ikiro/methods/compact.md -> N beef turns,
             numbered, INCLUDING queue-operation mid-turn ones a user-walk misses
  1. rows    oldest-first, ~4 turns per window; every n in 1..N accounted for,
             "NOTHING" written where a turn carried nothing durable
  2. compact write .ikiro/compacts/<topic-slug>.org — NO dates, beef verbatim;
             fill each section from the WHOLE table, not top-to-bottom
  3. balance >half the citations in the last third of N = bias survived, redo
  4. then    memory + MEMORY.md pointer · zettelkasten Open/Callouts · frontier

Canon: .ikiro/methods/compact.md · .ikiro/self/rituals.md ## the scribe's duties
GATE
exit 2
