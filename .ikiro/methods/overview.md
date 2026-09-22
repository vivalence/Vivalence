# method: overview — the state snapshot, derived in four commands

`ikiro overview` — one read tells a cold session what is live, what is owed, what is drifting. Every number comes from a command; nothing is recalled.

```sh
python3 .ikiro/methods/quest-report.py --format md      # live quests: progress · status · next · sibling sessions
python3 .ikiro/methods/scoreboard.py | head -12         # the ledger fold: top families, n, entries
grep -c '^\* .*OPEN' .ikiro/known-issues.org            # open issues (RESOLVED ones are cut, not kept)
python3 .ikiro/methods/budget.py                        # budgets, CHARS — OVER / NOLIMIT rows only
python3 .ikiro/methods/markers.py | head -8            # QA markers by bucket; pending-in-done = drift
```

Then `world/frontier.md` (gates · owed · strands) and `git status --short | wc -l` (uncommitted radius). Report = the four outputs + one line: the dominant thing right now.

Lite: quest report only.
