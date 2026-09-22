#!/bin/bash
# PreCompact[manual] gate: /compact must not swallow a session that was never folded.
# PreCompact CANNOT inject context or steps (verified against code.claude.com/docs/en/hooks) —
# it can only allow, or block with exit 2. So the ikiro compact ritual is a GATE, not a pre-step.
# First /compact of a session is refused with the ritual. The retry passes — unless a THROUGHPUT file still
# sits above its 15% baseline (m69 3.1): then it is refused again with the drain it owes, until drained.
# A PERSISTENT file above 15% never blocks: it is rebuilt, not drained (ontology law 7).
# Escape: beef's `touch .ikiro/hooks/compact-go` (valid 60 min). Never blocks auto-compaction (matcher "manual").
input=$(cat)

session=$(jq -r '.session_id // "nosession"' <<<"$input")
trigger=$(jq -r '.compaction_trigger // empty' <<<"$input")

[ "$trigger" = "manual" ] || exit 0

stamp="${TMPDIR:-/tmp}/ikiro-compact-gate/${session}"
mkdir -p "$(dirname "$stamp")"
root="${CLAUDE_PROJECT_DIR:-.}/.ikiro"
owed=$(python3 "$root/methods/budget.py" --baseline | sed -nE 's/^ABOVE +throughput +/  /p')
token="$(cd "$(dirname "$0")" && pwd)/compact-go"

if [ -f "$stamp" ]; then
  [ -z "$owed" ] && exit 0
  [ -f "$token" ] && [ -n "$(find "$token" -mmin -60 2>/dev/null)" ] && exit 0
  printf '%s compact-gate deny %s throughput\n' "$(date +%s)" "$session" >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null
  { echo "throughput above baseline — drain each to its owner, then /compact again:"; echo "$owed"; } >&2
  exit 2
fi

: > "$stamp"

# derived-canon-drift, mechanical: the three counts that rotted while every reminder was in force
files=$(ls "$root"/compacts/*.org 2>/dev/null | wc -l | tr -d ' ')
indexed=$(grep -cE '^ ?[0-9]+\. ' "$root/compacts/index.md" 2>/dev/null)
stray=$(awk '/^## Callouts/{c=1} /^### /{if(!c) n++} END{print n+0}' "$root/zettelkasten.md")
over=$(python3 "$root/methods/budget.py" | awk '/^(OVER|NOLIMIT|NOKIND)/{printf "%s %s ", $3, $4}')   # CHARS; NOLIMIT: no budget · NOKIND: no kind
fired=$(python3 "$root/methods/skills.py" "$session" 2>/dev/null | awk 'NR>1 && /^  turn /{printf "%s ", $4}')  # the session's Skill firings — each owes a verdict row
{
  echo "ikiro compact ritual has not run this session."
  echo
  echo "drift (fix in the fold, do not carry):"
  echo "  compacts on disk $files · indexed $indexed  → python3 .ikiro/methods/compact-index.py"
  echo "  ### headings above ## Callouts: $stray  (must be 0)"
  echo "  over char budget: ${over:-none}"
  echo "  skills fired, each owes a verdict row: ${fired:-none}"
  echo "  throughput above baseline, each owes its drain:"; echo "${owed:-  none}"
} >&2
cat >&2 <<'GATE'

Fold the session FIRST, then /compact again (the retry passes once every throughput file is at baseline).

WALK it, do not recall it — recall is where the recency bias comes from:
  0. spine   python3 .ikiro/methods/spine.py <session-id> -> N beef turns,
             numbered, INCLUDING queue-operation mid-turn ones a user-walk misses
  0b.skills  python3 .ikiro/methods/skills.py <session-id> -> the Skill firings,
             aligned to the turn under each; verdicts -> ** skills organ, then
             every non-HELD row appended to .ikiro/skills/LEDGER.md
  1. rows    oldest-first, ~4 turns per window; every n in 1..N accounted for,
             "NOTHING" written where a turn carried nothing durable
  2. compact write .ikiro/compacts/<topic-slug>.org — NO dates, beef verbatim;
             fill each section from the WHOLE table, not top-to-bottom
  3. balance >half the citations in the last third of N = bias survived, redo
  4. then    zettelkasten Open/Callouts · python3 .ikiro/methods/budget.py --baseline (drain every throughput row)
  5. handoff the compact ENDS in * handoff (quest · goal · done · next · never · owed),
             then python3 .ikiro/methods/handoff.py --write derives world/frontier.md

Skill: compact-walk (the runner) · callout · known-issues · budget-eviction

Canon: .ikiro/methods/compact.md · .ikiro/skills/compact-walk
GATE
exit 2
