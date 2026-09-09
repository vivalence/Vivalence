# method: overview — the state snapshot, derived in four commands

`ikiro overview` — one read tells a cold session what is live, what is owed, what is drifting. Every number comes from a command; nothing is recalled.

```sh
python3 .ikiro/methods/quest-report.py --format md      # live quests: progress · status · next · sibling sessions
python3 .ikiro/methods/scoreboard.py | head -12         # the ledger fold: top families, n, entries
grep -c '^\* .*OPEN' .ikiro/known-issues.org            # open issues (RESOLVED ones are cut, not kept)
for f in .ikiro/self/*.md .ikiro/world/*.md .ikiro/world/codemap/*.md; do   # budgets, CHARS
  l=$(grep -oE 'limit: [0-9]+ chars' "$f" | grep -oE '[0-9]+'); [ -n "$l" ] && [ "$(wc -c <"$f")" -gt "$l" ] && echo "OVER $f"; done
```

Then `world/frontier.md` (gates · owed · strands) and `git status --short | wc -l` (uncommitted radius). Report = the four outputs + one line: the dominant thing right now.

Lite: quest report only.
