<!-- limit: 700 chars -->
# hooks — ikiro's guards; beef wires them in `.claude/settings.json`

- a warn speaks on STDOUT, exit 0: `jq -n --arg reason "$reason" '{ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: $reason } }'` (`land-guard.sh:14`). Stderr at exit 0 never reaches the model: a warn there is a guard that never fired (REJECTED 11-17: cap-guard 16009/16000 unseen, unreported).
- a deny: the same object, `permissionDecision: "deny"` + `permissionDecisionReason`.
