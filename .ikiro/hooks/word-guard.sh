#!/bin/bash
# family:dead-word (10-25 /"door does not exist … just like verb or line"/ — a written rule failed four times).
# PreToolUse[Write|Edit]: product source (strings stripped) and the code blocks of .org/.md files.
# Stop: the code fences of my last reply — a dead word in a fence is a quote I did not rename.
# A diff's `-` line is the kill, never a hit. IKIRO_GUARD_MODE=warn → log + allow; default → deny/block.
input=$(cat)
event=$(jq -r '.hook_event_name // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"
DEAD='\b(door|doors|doorDie|verb|verbs|place|places|line|lines)\b'

fenced() { awk '/^[[:space:]]*(```|#\+BEGIN_SRC|#\+begin_src)/{inside=!inside; next} /^[[:space:]]*#\+(END|end)_SRC/{inside=0; next} inside' | grep -vE '^[[:space:]]*-'; }
bare() { sed -E 's/`[^`]*`/``/g; s/"[^"]*"/""/g; s/'"'"'[^'"'"']*'"'"'/'"''"'/g'; }

case "$event" in
  Stop)
    [ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0
    transcript=$(jq -r '.transcript_path // empty' <<<"$input")
    [ -f "$transcript" ] || exit 0
    reply=$(jq -rs '[.[] | select(.type == "assistant") | .message.content[]? | select(.type == "text") | .text] | last // empty' "$transcript")
    hits=$(fenced <<<"$reply" | grep -niwE "$DEAD" || true)
    ;;
  *)
    path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
    content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
    case "$path" in
      */bak/*|*/codestyle.md|*/skills/*|*/hooks/*) exit 0 ;;
      *.org|*.md) hits=$(fenced <<<"$content" | grep -niwE "$DEAD" || true) ;;
      */commons/*|*/systems/*|*/subsystems/*) hits=$(bare <<<"$content" | grep -vE '^[[:space:]]*(//|\*)' | grep -niwE "$DEAD" || true) ;;
      *) exit 0 ;;
    esac
    ;;
esac
[ -n "$hits" ] || exit 0

reason="dead word in code: door · verb · place · line do not exist (codestyle names). Rename to the thing — the die's owner (shellDie), a route, a signal, an input. Hits: $(head -3 <<<"$hits" | tr '\n' ' ')"
mode=${IKIRO_GUARD_MODE:-deny}
printf '%s word-guard %s %s %s\n' "$(date +%s)" "$mode" "$session" "${event:-PreToolUse}" >> "$log" 2>/dev/null
if [ "$mode" = "warn" ]; then echo "word-guard (warn): $reason" >&2; exit 0; fi
if [ "$event" = "Stop" ]; then jq -n --arg reason "$reason" '{decision:"block",reason:$reason}'; exit 0; fi
jq -n --arg reason "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$reason}}'
exit 0
