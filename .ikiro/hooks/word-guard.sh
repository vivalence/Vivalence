#!/bin/bash
# family:dead-word (10-25 /"door does not exist … just like verb or line"/ — a written rule failed four times).
# PreToolUse[Write|Edit]: product source (strings stripped) and the code blocks of .org/.md files.
# Stop: the code fences of my last reply — a dead word in a fence is a quote I did not rename; the PROSE too for the made-up family (door, 11-09 /"its a property"/ — the fenced-only arm let it through twice); a `//` row carrying → inside a fence is prose-in-code (11-09 /"one off incoherent disintegrated yap"/).
# A diff's `-` line is the kill, never a hit. A part-of-speech (words/verb.js · part-of-speech.verb · ser.verb.infinitive) is grammar, never a hit (11-06). IKIRO_GUARD_MODE=warn → log + allow; default → deny/block.
input=$(cat)
event=$(jq -r '.hook_event_name // empty' <<<"$input")
session=$(jq -r '.session_id // "nosession"' <<<"$input")
log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log"
DEAD='\b(door|doors|doorDie|verb|verbs|place|places|line|lines)\b'

fenced() { awk '/^[[:space:]]*(```|#\+BEGIN_SRC|#\+begin_src)/{inside=!inside; next} /^[[:space:]]*#\+(END|end)_SRC/{inside=0; next} inside' | grep -vE '^[[:space:]]*-'; }
bare() { sed -E 's/`[^`]*`/``/g; s/"[^"]*"/""/g; s/'"'"'[^'"'"']*'"'"'/'"''"'/g'; }
root=$(cd "$(dirname "$0")/../.." && pwd)
undeclared() { local known; known=$( { grep -hoE '^[[:space:]]+(async )?[a-zA-Z]+\(' "$root"/subsystems/typology/entities/*.ts | sed -E 's/^[[:space:]]+(async )?//; s/\($//'; printf '%s\n' find findAll findOne findOneOrFail findAndCount create insert upsert nativeUpdate nativeDelete count persist flush fork getReference assign merge map populate updateOne deleteOne; } | sort -u | tr '\n' '|' | sed 's/|$//'); grep -oE 'entities\.[a-z]+\.[a-zA-Z]+\(' | sed -E 's/.*\.([a-zA-Z]+)\($/\1/' | sort -u | grep -vxE "($known)" || true; }
grammar() { sed -E 's#words/[a-z-]+\.js##g; s/part-of-speech\.[a-z-]+//g; s/\.verb\././g'; }

case "$event" in
  Stop)
    [ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0
    transcript=$(jq -r '.transcript_path // empty' <<<"$input")
    [ -f "$transcript" ] || exit 0
    reply=$(jq -rs '[.[] | select(.type == "assistant") | .message.content[]? | select(.type == "text") | .text] | last // empty' "$transcript")
    hits=$(fenced <<<"$reply" | grammar | grep -niwE "$DEAD" || true)
    prose=$(grep -niwE '\b(door|doors|doorDie)\b' <<<"$reply" || true)
    [ -n "$prose" ] && hits="$hits${hits:+
}$prose"
    yap=$(fenced <<<"$reply" | grep -nE '^[[:space:]]*//.*→' || true)
    [ -n "$yap" ] && hits="$hits${hits:+
}prose row inside a fence (a // row with →): an option is a WHOLE unit, prose goes above it (drill-me 11-09): $yap"
    ghosts=$(fenced <<<"$reply" | undeclared)
    [ -n "$ghosts" ] && hits="$hits${hits:+
}a repository method no entity declares (11-09 /"what is develop??"/ — grep entities/*.ts first): $ghosts"
    ;;
  *)
    path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
    content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
    case "$path" in
      */bak/*|*/codestyle.md|*/skills/*|*/hooks/*) exit 0 ;;
      *.org|*.md) hits=$(fenced <<<"$content" | grammar | grep -niwE "$DEAD" || true)
                  ghosts=$(fenced <<<"$content" | undeclared); [ -n "$ghosts" ] && hits="$hits${hits:+
}a repository method no entity declares: $ghosts"
                  dead=$(grep -m1 '^#+dead:' "$path" 2>/dev/null | sed 's/^#+dead: *//')
                  [ -n "$dead" ] && buried=$(fenced <<<"$content" | grep -nE "$dead" || true) && [ -n "$buried" ] && hits="$hits${hits:+
}a name this quest KILLED (#+dead, quest rule 6: out of every block THAT turn): $buried" ;;
      */commons/*|*/systems/*|*/subsystems/*) hits=$(bare <<<"$content" | grammar | grep -vE '^[[:space:]]*(//|\*)' | grep -niwE "$DEAD" || true) ;;
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
