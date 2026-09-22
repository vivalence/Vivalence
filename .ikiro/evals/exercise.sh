#!/bin/bash
# m69 1.3 gate — every grader BITES: FAIL on the ledger's own failing artifact, PASS on the corrected one.
# "An unexercised gate is a claim about a gate" (hooks/exercise.sh) — a task whose grader passes both, or
# fails both, grades nothing and is not in the set.
#   bash .ikiro/evals/exercise.sh            → one line per task, exit 1 on any grader that does not bite
#   bash .ikiro/evals/exercise.sh <slug>...  → only those tasks
cd "$(dirname "$0")/tasks" || exit 1
tasks=("$@"); [ ${#tasks[@]} -gt 0 ] || tasks=(*/)
bad=0 n=0
# the do-nothing run: a grader that only checks for the ABSENCE of the defect passes an agent that did nothing
idle=$(mktemp -d); mkdir -p "$idle/repo"; echo "done." > "$idle/answer.md"; : > "$idle/tools.jsonl"
trap 'rm -rf "$idle"' EXIT
for task in "${tasks[@]}"; do
  task=${task%/}
  [ -f "$task/grade.sh" ] || { echo "MISS $task no grade.sh"; bad=1; continue; }
  for part in prompt.md source.md fixtures/fail fixtures/pass; do
    [ -e "$task/$part" ] || { echo "MISS $task no $part"; bad=1; continue 2; }
  done
  fail_line=$(bash "$task/grade.sh" "$task/fixtures/fail" 2>&1); fail_exit=$?
  pass_line=$(bash "$task/grade.sh" "$task/fixtures/pass" 2>&1); pass_exit=$?
  idle_line=$(bash "$task/grade.sh" "$idle" 2>&1); idle_exit=$?
  fail_line=$(tail -1 <<<"$fail_line") pass_line=$(tail -1 <<<"$pass_line") idle_line=$(tail -1 <<<"$idle_line")
  n=$((n + 1))
  if [ "$fail_exit" -ne 0 ] && [ "$pass_exit" -eq 0 ] && [ "$idle_exit" -ne 0 ]; then
    echo "BITES $task"
  else
    echo "BLUNT $task  fail → ${fail_line:-exit $fail_exit}  ·  pass → ${pass_line:-exit $pass_exit}  ·  idle → ${idle_line:-exit $idle_exit}"
    bad=1
  fi
done
echo "$n tasks"
exit $bad
