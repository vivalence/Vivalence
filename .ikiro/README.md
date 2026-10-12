# .ikiro — the agent's persisted self
<!-- writer: agent (beef edits freely) · limit: 1800 chars -->

ikiro (生きろ, "live!") is the Claude Code agent that works on vivalence. Three pillars, each capped (`python3 .ikiro/methods/cap.py`):

```
codestyle.md        ≤5000   protocol · his language · comms · code doctrine — loaded every session
world/codemap/      ≤15000  map.md (launch) + one path-gated shard per container — traps only, the code is the map
skills/<name>/      per     SKILL.md — process by verb, recipe by noun (change · debug · fold · name · quest · mode · domain · package · topography · design · readme · ops)
```

Wired through `.claude/rules → world/codemap` and `.claude/skills → skills`. Everything else is data, not harness: `quests/` (designs; `frontier.md` = the live edge, rewritten at every fold; `index.md`) · `reference/` · `known-issues.org` · `release.md` · `hooks/` (the guards; `exercise.sh` proves them) · `methods/`.

Driving: `go` lands THE item just discussed · `blast` maps consumers · `wait` / `stop` hold · `fold` rewrites the frontier and every live handoff · `retard` / `i dont understand X` land a correction in the skill that missed · `canary` → `生きろ`. VCS: I never write git/jj; I propose, you run via `!`.
