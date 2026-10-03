#!/bin/bash
# PreCompact[manual] gate: /compact must not swallow a session that was never folded.
# PreCompact can only allow, or block with exit 2 — so the fold is a GATE, not a pre-step.
# The first /compact of a session is refused with the fold; the retry passes once world/frontier.md was
# rewritten after that refusal. Escape: beef's `touch .ikiro/hooks/compact-go` (valid 60 min).
input=$(cat)
session=$(jq -r '.session_id // "nosession"' <<<"$input")
trigger=$(jq -r '.compaction_trigger // empty' <<<"$input")
[ "$trigger" = "manual" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-.}/.ikiro"
stamp="${TMPDIR:-/tmp}/ikiro-compact-gate/${session}"
token="$(cd "$(dirname "$0")" && pwd)/compact-go"
mkdir -p "$(dirname "$stamp")"

if [ -f "$stamp" ]; then
  [ "$root/world/frontier.md" -nt "$stamp" ] && exit 0
  [ -f "$token" ] && [ -n "$(find "$token" -mmin -60 2>/dev/null)" ] && exit 0
  echo "world/frontier.md was not rewritten since the refusal — fold first (skill: fold), then /compact again." >&2
  exit 2
fi

: > "$stamp"
over=$(python3 "$root/methods/cap.py" 2>/dev/null)
{
  echo "ikiro fold has not run this session. Fold FIRST, then /compact again:"
  echo "  1. rewrite world/frontier.md whole — one line per live quest: next step + owed"
  echo "  2. update each live quest's * handoff"
  echo "  3. every correction of the session → ≤2 lines into the skill that should have fired, or self.md"
  echo "  4. grep every name that moved this session to zero"
  echo "  5. python3 .ikiro/methods/cap.py → no OVER"
  [ -n "$over" ] && { echo; echo "cap today:"; echo "$over"; }
  echo; echo "Skill: fold"
} >&2
exit 2
