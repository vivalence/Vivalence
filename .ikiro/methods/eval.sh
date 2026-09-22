#!/bin/bash
# eval — run the m69 eval set against one harness ARM, headless, and grade every trial (quest m69 1.4).
#
#   bash .ikiro/methods/eval.sh <arm> [--tasks a,b] [--trials 3] [--jobs 3] [--effort medium] [--max-turns 20]
#
# <arm> is `current` (the live .ikiro + .claude/settings.json + memory, snapshotted at start) or a directory
# holding ikiro/ · claude/settings.json · memory/ (e.g. ~/.viva/bak/ikiro/postcut-20260923). The arm's name is
# its basename. Results append to .ikiro/evals/runs/<YYYYMMDD>-<arm>.jsonl — one row per trial.
#
# Pinned per trial, identical across arms: model claude-opus-5-5 · effort · max turns · a 15-minute timeout ·
# a fresh APFS clone of the repo (never a git worktree — VCS writes are forbidden) with the arm's .ikiro and
# settings dropped in · the arm's memory seeded into the clone's project memory dir · Bash under the Seatbelt
# sandbox (writes: the clone + $TMPDIR only, no network) · Agent and the web tools disallowed · the stale
# ANTHROPIC_API_KEY unset (it answered 401 and shadowed the login). The clone's hooks log into the trial dir,
# never into the real hooks.log — the guards' numerators stay beef's sessions only.
#   bash .ikiro/methods/eval.sh snapshot <dir>   — write the live harness as an arm (the ablation's starting point)
set -u
PROJECT=$(cd "$(dirname "$0")/../.." && pwd)
EVALS="$PROJECT/.ikiro/evals"
arm=${1:?usage: eval.sh <current|arm-dir|snapshot <dir>> [--tasks a,b] [--trials k] [--jobs j] [--effort e] [--max-turns n]}; shift
snapshot() { # snapshot <dir> — ikiro/ (graders excluded) · claude/settings.json · memory/
  mkdir -p "$1/claude"
  rsync -a --exclude .DS_Store --exclude evals "$PROJECT/.ikiro/" "$1/ikiro/"
  cp "$PROJECT/.claude/settings.json" "$1/claude/settings.json"
  rsync -a "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/memory/" "$1/memory/"
}
if [ "$arm" = snapshot ]; then snapshot "${1:?usage: eval.sh snapshot <dir>}"; echo "arm → $1"; exit 0; fi
tasks="" trials=3 jobs=3 effort=medium turns=20 model=claude-opus-5-5 budget=6   # effort: ontology law 11 — medium default
while [ $# -gt 0 ]; do
  case "$1" in
    --tasks) tasks=$2; shift 2;; --trials) trials=$2; shift 2;; --jobs) jobs=$2; shift 2;;
    --effort) effort=$2; shift 2;; --max-turns) turns=$2; shift 2;; --model) model=$2; shift 2;;
    *) echo "eval: unknown flag $1" >&2; exit 2;;
  esac
done
WORK="${IKIRO_EVAL_WORK:-${TMPDIR:-/tmp}/ikiro-eval}"; mkdir -p "$WORK"; WORK=$(cd "$WORK" && pwd -P)
stamp=$(date +%Y%m%d-%H%M%S)

if [ "$arm" = current ]; then
  name=current; armdir="$WORK/arms/current-$stamp"; snapshot "$armdir"
else
  armdir=$(cd "$arm" && pwd); name=$(basename "$armdir")
fi
for part in ikiro claude/settings.json memory; do [ -e "$armdir/$part" ] || { echo "eval: arm lacks $part" >&2; exit 2; }; done
results="$EVALS/runs/$(date +%Y%m%d)-$name.jsonl"; mkdir -p "$EVALS/runs"

# the base: the repo minus node_modules, once per run; the arm's harness replaces .ikiro and settings.json
base="$WORK/base-$name-$stamp"
rsync -a --exclude node_modules --exclude .astro --exclude .DS_Store --exclude /.ikiro "$PROJECT/" "$base/"
rsync -a --delete "$armdir/ikiro/" "$base/.ikiro/"
cp "$armdir/claude/settings.json" "$base/.claude/settings.json"
rm -rf "$base/.ikiro/evals"                           # the subject never sees the graders

selected=()
if [ -n "$tasks" ]; then IFS=, read -r -a selected <<<"$tasks"; else
  for dir in "$EVALS"/tasks/*/; do selected+=("$(basename "$dir")"); done
fi

trial() { # trial <slot> <task> <k>
  local slot="$WORK/slot-$1" task=$2 k=$3 taskdir="$EVALS/tasks/$2"
  local run="$WORK/runs/$name-$stamp/$task/$k"; mkdir -p "$run" "$slot"
  rm -rf "$slot/repo"; cp -Rc "$base" "$slot/repo"
  local repo; repo=$(cd "$slot/repo" && pwd -P)
  mkdir -p "$run/hooks"
  sed -i '' "s#\$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/#$run/hooks/#g" "$repo"/.ikiro/hooks/*.sh
  [ -f "$taskdir/setup.sh" ] && bash "$taskdir/setup.sh" "$repo" >"$run/setup.log" 2>&1
  local key; key="$HOME/.claude/projects/$(sed 's#[^A-Za-z0-9]#-#g' <<<"$repo")"
  mkdir -p "$key/memory"; rsync -a --delete "$armdir/memory/" "$key/memory/"
  local began; began=$(date +%s)
  (cd "$repo" && timeout 900 env -u ANTHROPIC_API_KEY claude -p "$(cat "$taskdir/prompt.md")" \
      --model "$model" --effort "$effort" --max-turns "$turns" --max-budget-usd "$budget" \
      --output-format stream-json --verbose --permission-mode acceptEdits \
      --disallowedTools Agent WebFetch WebSearch "Bash(kill:*)" "Bash(pkill:*)" "Bash(killall:*)" \
      --settings '{"sandbox":{"enabled":true,"allowUnsandboxedCommands":false,"failIfUnavailable":true,"filesystem":{"allowWrite":["~/.config/jj"]}}}' \
      </dev/null >"$run/stream.jsonl" 2>"$run/stderr.log")
  local exitcode=$?
  jq -r 'select(.type == "result") | .result // ""' "$run/stream.jsonl" | sed "s#$repo#/repo#g" >"$run/answer.md"
  jq -c 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use") | {name, input}' \
    "$run/stream.jsonl" | sed "s#$repo#/repo#g" >"$run/tools.jsonl"
  local session; session=$(jq -r 'select(.type == "result") | .session_id' "$run/stream.jsonl" | head -1)
  local transcript="$key/$session.jsonl"
  jq -c 'select(.type == "attachment") | .attachment
         | if .type == "instructions" then .files[] | {file_path: .path, load_reason: "launch"}
           elif .type == "nested_memory" then {file_path: .path, load_reason: "path"} else empty end' \
    "$transcript" 2>/dev/null | sed "s#$repo#/repo#g" >"$run/loaded.jsonl"
  ln -sfn "$repo" "$run/repo"
  local verdict; verdict=$(bash "$taskdir/grade.sh" "$run" 2>&1 | tail -1)
  local prose; prose=$(awk '/^[[:space:]]*```/{f=!f; next} !f' "$run/answer.md" | wc -w | tr -d ' ')
  local row
  row=$(jq -c --arg task "$task" --arg arm "$name" --argjson trial "$k" --arg verdict "$verdict" --arg model "$model" \
     --arg effort "$effort" --argjson exit "$exitcode" --argjson secs $(( $(date +%s) - began )) --argjson prose "$prose" \
     --arg run "$run" --arg answer "$(cat "$run/answer.md")" \
     --argjson loaded "$(jq -sc '[.[].file_path | sub("^/repo/"; "")]' "$run/loaded.jsonl" 2>/dev/null || echo '[]')" \
     'select(.type == "result") | {task: $task, arm: $arm, trial: $trial, pass: ($verdict | startswith("PASS")),
       verdict: $verdict, session: .session_id, model: $model, effort: $effort, turns: .num_turns,
       cost: .total_cost_usd, tokens: .usage, secs: $secs, exit: $exit, prose_words: $prose, loaded: $loaded,
       run: $run, answer: $answer}' "$run/stream.jsonl" | head -1)
  [ -n "$row" ] || row=$(jq -cn --arg task "$task" --arg arm "$name" --argjson trial "$k" --arg run "$run" \
     --argjson exit "$exitcode" '{task: $task, arm: $arm, trial: $trial, pass: false, verdict: "FAIL no result (timeout or crash)", exit: $exit, run: $run}')
  printf '%s\n' "$row" >>"$results.lock.$1"
  rm -rf "$slot/repo" "$run/repo"
  echo "$(date +%H:%M:%S) $name $task #$k $verdict"
}

queue=()
for task in "${selected[@]}"; do for k in $(seq 1 "$trials"); do queue+=("$task $k"); done; done
echo "eval: arm $name · ${#selected[@]} tasks × $trials trials = ${#queue[@]} runs · $jobs slots · $model · effort $effort · → $results"
for s in $(seq 1 "$jobs"); do
  (
    i=0
    for item in "${queue[@]}"; do
      [ $(( i % jobs + 1 )) -eq "$s" ] && trial "$s" $item
      i=$((i + 1))
    done
  ) &
done
wait
cat "$results".lock.* >>"$results" 2>/dev/null; rm -f "$results".lock.*
rm -rf "$base"
jq -rs --arg run "$name-$stamp" 'map(select(.run | contains($run))) | group_by(.task) as $tasks
  | "pass@k \(([$tasks[] | any(.[]; .pass)] | map(if . then 1 else 0 end) | add) / ($tasks | length) * 100 | floor)% · pass^k \(([$tasks[] | all(.[]; .pass)] | map(if . then 1 else 0 end) | add) / ($tasks | length) * 100 | floor)% · trials \(map(.pass) | length) · passed \(map(select(.pass)) | length) · cost $\(map(.cost // 0) | add * 100 | floor / 100)"' "$results"
