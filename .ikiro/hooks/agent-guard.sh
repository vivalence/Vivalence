#!/bin/bash
# ikiro scope-inflation rung: A FAN-OUT IS A PROPOSAL (ledger 08-19 four agents, 08-23 six agents).
# PreToolUse[Agent] hook — two subagent launches per session pass free; #3+ is a fleet and
# requires beef's word, recorded by `touch .ikiro/hooks/fanout-go` (valid 60 min, then stale).
input=$(cat)
tool=$(jq -r '.tool_name // empty' <<<"$input")
case "$tool" in Agent|Task) ;; *) exit 0 ;; esac

session=$(jq -r '.session_id // "nosession"' <<<"$input")
count_file="${TMPDIR:-/tmp}/ikiro-fanout-${session}"
token="$(cd "$(dirname "$0")" && pwd)/fanout-go"

if [ -f "$token" ] && [ -n "$(find "$token" -mmin -60 2>/dev/null)" ]; then
  exit 0
fi

count=0
[ -f "$count_file" ] && count=$(wc -l < "$count_file" | tr -d ' ')

log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"
if [ "$count" -ge 2 ] && [ "${IKIRO_GUARD_MODE:-deny}" = "warn" ]; then
  printf '%s agent-guard warn %s\n' "$(date +%s)" "$session" >> "$log" 2>/dev/null
  echo "agent-guard (warn): subagent #$((count+1)) this session — a fan-out is a PROPOSAL unless beef's go is on record." >&2
  echo "$(date +%s)" >> "$count_file"
  exit 0
fi
if [ "$count" -ge 2 ]; then
  printf '%s agent-guard deny %s\n' "$(date +%s)" "$session" >> "$log" 2>/dev/null
  jq -n --arg reason "fan-out is a PROPOSAL (scope-inflation, ledger 08-19/08-23): this session already launched $count subagents. State the count, model tier, split, and what each returns — then wait for beef's go. On go: touch .ikiro/hooks/fanout-go (valid 60 min)." '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
fi

date +%s >> "$count_file"
exit 0
