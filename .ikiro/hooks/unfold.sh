#!/bin/bash
# SessionStart instrument (observe-only): the census skill `unfold` step 1 owes, MEASURED by the harness at
# startup · resume · clear · compact, so the session opens on the tree as it IS and never on recall.
# Reads only: jj runs --ignore-working-copy (no snapshot, no op). Stdout becomes session context.
# Wire: SessionStart → "$CLAUDE_PROJECT_DIR/.ikiro/hooks/unfold.sh" (settings.json, beef's).
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" 2>/dev/null || exit 0
printf 'unfold census — measured %s; skill `unfold` owes edge · area · baseline\n' "$(date '+%m-%d %H:%M')"
printf 'tree (jj, newest first):\n'
jj log --ignore-working-copy -n 5 --no-graph \
  -T 'change_id.shortest(8) ++ " " ++ if(description, description.first_line(), "(no description)") ++ "\n"' 2>/dev/null \
  | sed 's/^/  /'
printf 'his wip: %s paths on disk\n' "$(git --no-optional-locks status --short 2>/dev/null | wc -l | tr -d ' ')"
printf 'live:\n'
for port in 2501 1794; do
  held=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | awk 'NR==2 {print $1 " pid " $2}')
  printf '  :%s %s\n' "$port" "${held:-nothing listening}"
done
printf 'watchers: %s (a save under one IS a deploy)\n' "$(ps -axo command | grep -cE -- '[-]-watch|[ /]watch\.js')"
printf 'frontier:\n'
sed -n '4,$p' .ikiro/quests/frontier.md 2>/dev/null | cut -c1-240 | sed 's/^/  /'
exit 0
