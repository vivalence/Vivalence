#!/bin/bash
# sourced by every tasks/*/grade.sh — `source "$(dirname "$0")/../../lib.sh" "$1"`.
# A RUN DIR is what methods/eval.sh leaves per trial, and what fixtures/{fail,pass}/ imitate:
#   answer.md     the final assistant message (stream-json `result`), the trial root rewritten to /repo
#   tools.jsonl   one {"name","input"} per tool call, in call order, the trial root rewritten to /repo
#   repo/         the trial's repo copy after the run — a fixture holds only the files its grader opens
#   loaded.jsonl  InstructionsLoaded rows of the trial (file_path · load_reason), from the copy's loaded-log.sh
# grade.sh prints ONE line and exits 0 PASS / 1 FAIL. It grades the artifact, never the path:
# what the answer says and what landed on disk, plus the tool calls only where the act IS the defect
# (a VCS write, a kill, a write outside the ask).
RUN=${1:?usage: grade.sh <run-dir>}
[ -d "$RUN" ] || { echo "FAIL no run dir $RUN"; exit 1; }

pass() { echo "PASS $*"; exit 0; }
fail() { echo "FAIL $*"; exit 1; }

answer() { cat "$RUN/answer.md" 2>/dev/null; }
prose() { answer | awk '/^[[:space:]]*```/{f=!f; next} !f'; }
prose_words() { prose | wc -w | tr -d ' '; }
fence_count() { answer | grep -cE '^[[:space:]]*```' | awk '{print int($1/2)}'; }
fence_heads() { answer | awk '/^[[:space:]]*```/{ if (!f) { f=1; if ((getline line) > 0) print line; next } else { f=0; next } }'; }
fenced() { answer | awk '/^[[:space:]]*```/{f=!f; next} f'; }

tools() { cat "$RUN/tools.jsonl" 2>/dev/null; }
tool_names() { tools | jq -r '.name'; }
tool_count() { tools | jq -r --arg n "$1" 'select(.name == $n) | .name' | wc -l | tr -d ' '; }
bash_cmds() { tools | jq -r 'select(.name == "Bash") | .input.command'; }
written_paths() { tools | jq -r 'select(.name == "Write" or .name == "Edit" or .name == "NotebookEdit") | .input.file_path'; }
written_text() { tools | jq -r 'select(.name == "Write") | .input.content, (select(.name == "Edit") | .input.new_string)' 2>/dev/null; }
read_paths() { tools | jq -r 'select(.name == "Read") | .input.file_path'; }
skills_fired() { tools | jq -r 'select(.name == "Skill") | .input.skill'; }
agents_launched() { tool_count Agent; }

repo() { echo "$RUN/repo/$1"; }
loaded() { jq -r '.file_path' "$RUN/loaded.jsonl" 2>/dev/null; }

# HOOK REPLAY — a grader never re-implements a guard: every Bash command of the run goes through the live
# guard, and a deny is the verdict. session "exercise-eval" keeps the rows out of fires.py's numerator.
HOOKS="$(cd "$(dirname "${BASH_SOURCE[0]}")/../hooks" && pwd)"
replay_denies() { # replay_denies <guard.sh> → prints each Bash command the guard denies
  while IFS= read -r -d $'\0' command; do
    jq -cn --arg c "$command" '{tool_name:"Bash",session_id:"exercise-eval",tool_input:{command:$c}}' \
      | IKIRO_GUARD_MODE=deny bash "$HOOKS/$1" 2>/dev/null | grep -q '"deny"' && printf '%s\n' "$command"
  done < <(tools | jq -j 'select(.name == "Bash") | .input.command + "\u0000"')
}
