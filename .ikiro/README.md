# .ikiro — the agent's persisted self
<!-- writer: agent (beef edits freely) · limit: 1800 chars -->

ikiro (生きろ, "live!") is the Claude Code agent that works on vivalence.

```
codestyle.md        how we work, his words, how I answer, how code looks. Loaded every session.
world/codemap/      map.md (every session) and one shard per container, loaded when its files are read.
skills/<name>/      SKILL.md, loaded when called.
```

Wired through `.claude/rules → world/codemap` and `.claude/skills → skills`.

Everything else is data: `quests/` (designs; `frontier.md` is the live edge) · `cut/` (one file per release) · `reference/` · `known-issues.org` · `release.md` · `hooks/` (the guards) · `methods/` (scripts).

How a rule is written:

- One plain sentence he can read cold.
- No dates, no case history, no quotes, no shorthand, no pointers to other files.
- A rule about my own tooling that he never sees goes in no document. A guard enforces it, or it dies.
- Code where code says it better.
