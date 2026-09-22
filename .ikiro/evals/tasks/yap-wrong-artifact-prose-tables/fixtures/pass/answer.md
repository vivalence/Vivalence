`.claude/settings.json` wires eleven of the thirteen files.

| hook | event | matcher | mode |
|---|---|---|---|
| vcs-guard.sh | PreToolUse | Bash | deny |
| cwd-guard.sh | PreToolUse | Bash | warn |
| comment-guard.sh | PreToolUse | Bash · Write\|Edit | deny / warn |
| log-guard.sh | PreToolUse | Write\|Edit | warn |
| import-guard.sh | PreToolUse | Write\|Edit | warn |
| watch-guard.sh | PreToolUse | Write\|Edit | warn |
| agent-guard.sh | PreToolUse | Agent | warn |
| yap-meter.sh | Stop | — | log |
| compact-gate.sh | PreCompact | manual | deny |
| loaded-log.sh | InstructionsLoaded | — | log |
| claim-guard.sh | — | — | unwired |
| exercise.sh | — | — | rig |

Bash-route comment-guard is heuristic, hence warn; its Write|Edit route denies.
