#!/bin/bash
# m69 1.2 — the channel census's numerator. InstructionsLoaded fires when a CLAUDE.md or a .claude/rules file
# enters context: at session start, on a path-glob match, on nested traversal, at compaction. Observe-only.
# One JSON line per load; the transcript path is dropped, everything else kept as the harness sent it.
jq -c '{t: now | floor} + del(.transcript_path)' 2>/dev/null >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log-loaded"
exit 0
