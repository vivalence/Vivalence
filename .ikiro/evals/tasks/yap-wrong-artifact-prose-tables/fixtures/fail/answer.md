| hook | event | what it does |
|---|---|---|
| vcs-guard.sh | PreToolUse on Bash | denies every git or jj mutation and allows the read-only surface, logging the verb it matched |
| cwd-guard.sh | PreToolUse on Bash | warns when a command chains a cd with something else so the cwd does not drift between calls |
| comment-guard.sh | PreToolUse on Bash and Write/Edit | denies an authored // line in product source, warns on the Bash route since it is heuristic |
| log-guard.sh | PreToolUse on Write/Edit | warns when a log line would print a mask, a die, a register or a service object |
| import-guard.sh | PreToolUse on Write/Edit | warns on a relative import that crosses a package boundary instead of riding the registry |
| watch-guard.sh | PreToolUse on Write/Edit | warns when a second file of one watched package is written within ten minutes while :2501 listens |
| agent-guard.sh | PreToolUse on Agent | warns beyond two subagents because a fan-out is a proposal and not an implementation detail |
| yap-meter.sh | Stop | logs the words outside fences of every final message so the family can be measured instead of trusted |
| compact-gate.sh | PreCompact manual | refuses a manual compact until the markers file and the budgets have been walked |
| loaded-log.sh | InstructionsLoaded | counts every instruction file load and its reason so the channel census has a numerator |
| claim-guard.sh | not wired | retired 09-19, still on disk |
