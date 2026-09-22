#!/bin/bash
# exercise every guard against the ledger shapes it was built from — deny on the offending line,
# allow on the neighbouring legitimate one. "An unexercised gate is a claim about a gate."
#   bash .ikiro/hooks/exercise.sh        → prints PASS/FAIL per case, exit 1 on any FAIL
cd "$(dirname "$0")" || exit 1
fail=0
expect() { # expect <deny|warn|allow> <hook> <json> — allow is SILENT, warn is allow + a message: errors only (m69 3.3)
  out=$(IKIRO_GUARD_MODE=deny bash "$2" <<<"$3" 2>&1)
  got=allow; grep -q '"deny"' <<<"$out" && got=deny
  [ "$got" = allow ] && [ -n "$out" ] && got=warn
  if [ "$got" = "$1" ]; then echo "PASS $2 $1  $4"; else echo "FAIL $2 want $1 got $got  $4"; fail=1; fi
}
bash_json() { jq -cn --arg c "$1" '{tool_name:"Bash",session_id:"exercise",tool_input:{command:$c}}'; }
edit_json() { jq -cn --arg p "$1" --arg s "$2" '{tool_name:"Edit",session_id:"exercise",tool_input:{file_path:$p,new_string:$s}}'; }

# cwd-guard — the 10-compact shape
expect deny  cwd-guard.sh "$(bash_json 'cd systems/ghost && deno test -A tests/')"           "relative cd at head"
expect deny  cwd-guard.sh "$(bash_json 'ls; cd subsystems/paladin; grep -rn x .')"           "relative cd after ;"
expect allow cwd-guard.sh "$(bash_json '(cd systems/ghost && deno test -A tests/)')"         "subshell"
expect allow cwd-guard.sh "$(bash_json 'cd /Users/finn/vivalence/code/vivalence && ls')"     "absolute cd"
expect allow cwd-guard.sh "$(bash_json 'cd ~/.viva && ls')"                                  "home cd"
expect allow cwd-guard.sh "$(bash_json 'echo cd systems/ghost')"                             "cd as an argument"

# log-guard — the mask print that leaked a key
expect deny  log-guard.sh "$(edit_json /r/systems/runtime/daemon/populate.js 'console.log({ mask, service, faculties });')" "mask logged whole"
expect deny  log-guard.sh "$(edit_json /r/commons/hallucinators/x/provider/index.js "console.log('boot', die)")"       "die logged"
expect allow log-guard.sh "$(edit_json /r/systems/runtime/daemon/populate.js 'console.log(`daemon[${slug}].hallucinators[${i}] ${module}`)')" "slot label"
expect allow log-guard.sh "$(edit_json /r/systems/runtime/tests/x.test.js 'console.log(mask)')"                          "test file"
expect allow log-guard.sh "$(edit_json /r/systems/runtime/daemon/x.js 'const service = ctx.daemon.services.reader;')"    "no log"

# import-guard — "no leaving the mode"
expect deny  import-guard.sh "$(edit_json /r/commons/modes/vdex/tools/index.js "import { TEXT } from '../../../domain/voffice/index.js';")" "climbs past the mode"
expect deny  import-guard.sh "$(edit_json /r/commons/modes/vdex/mode.viva.js "import { x } from '../other/mode.viva.js';")"                "sibling module"
expect allow import-guard.sh "$(edit_json /r/commons/modes/vdex/tools/index.js "import { style } from '../page/style.js';")"                "inside the mode"
expect allow import-guard.sh "$(edit_json /r/commons/modes/vdex/tools/index.js "import { v } from '@vivalence/typology';")"                "package identifier"
expect allow import-guard.sh "$(edit_json /r/commons/modes/vdex/tests/x.test.js "import { a } from '../../../scenarios/registry.js';")"    "test file"

# vcs-guard — reads pass, writes deny, prose hint present
expect allow vcs-guard.sh "$(bash_json 'git show HEAD:systems/ghost/x.js | grep alive')"      "show HEAD: read"
expect allow vcs-guard.sh "$(bash_json 'git log --all --oneline -- systems/')"                "log --all read"
expect allow vcs-guard.sh "$(bash_json 'git merge-base HEAD master')"                         "merge-base read"
expect deny  vcs-guard.sh "$(bash_json 'git commit -m x')"                                    "commit"
expect deny  vcs-guard.sh "$(bash_json 'jj rebase -s @ -d trunk')"                            "jj rebase"

# comment-guard — Write|Edit denies; the Bash route is WARN (allow + log), so assert allow but check the log grows
expect deny  comment-guard.sh "$(edit_json /r/subsystems/paladin/belt/check.js '  // verdict = max(declared, observed)
  const x = 1;')" "authored // in product source"
expect allow comment-guard.sh "$(edit_json /r/subsystems/paladin/belt/check.js '  const x = 1; // @beef keep')" "beef annotation"
before=$(wc -l < "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null || echo 0)
expect warn comment-guard.sh "$(bash_json 'cat > /r/systems/runtime/daemon/x.js <<EOF
// the mint — one place
export const x = 1;
EOF')" "Bash heredoc route (warn)"
after=$(wc -l < "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null || echo 0)
if [ "$after" -gt "$before" ]; then echo "PASS comment-guard.sh logged  Bash route wrote a warn row"; else echo "FAIL comment-guard.sh Bash route logged nothing"; fail=1; fi

# agent-guard — third launch denies without the token, warn mode allows + logs; the token file bypasses both
expect allow agent-guard.sh "$(jq -cn '{tool_name:"Read",session_id:"exercise",tool_input:{}}')" "non-agent tool"
count_file="${TMPDIR:-/tmp}/ikiro-fanout-exercise-fleet"; printf '1\n2\n' > "$count_file"
agent_json=$(jq -cn '{tool_name:"Agent",session_id:"exercise-fleet",tool_input:{prompt:"x"}}')
if [ -f fanout-go ] && [ -n "$(find fanout-go -mmin -60 2>/dev/null)" ]; then
  echo "SKIP agent-guard.sh deny  fanout-go token is live (beef's go on record) — deny case not testable now"
else
  expect deny agent-guard.sh "$agent_json" "third subagent, no token"
fi
out=$(IKIRO_GUARD_MODE=warn bash agent-guard.sh <<<"$agent_json" 2>/dev/null)
if grep -q '"deny"' <<<"$out"; then echo "FAIL agent-guard.sh warn mode denied"; fail=1; else echo "PASS agent-guard.sh allow  warn mode third subagent"; fi
rm -f "$count_file"

# watch-guard — the 09-23 shapes: buffer/cli.js then buffer/fold.js of one mode under a live watcher
rm -f "${TMPDIR:-/tmp}/ikiro-watch-exercise"
reg=/Users/finn/.viva/registry/assembly/modes/editor/assembly
IKIRO_WATCH_LIVE=1 expect allow watch-guard.sh "$(edit_json $reg/buffer/cli.js 'export const GENERATORS = {};')"  "first file of the change"
IKIRO_WATCH_LIVE=1 expect allow watch-guard.sh "$(edit_json $reg/buffer/cli.js 'export const HINT = "";')"      "same file again"
IKIRO_WATCH_LIVE=1 expect deny  watch-guard.sh "$(edit_json $reg/buffer/fold.js 'export const lanes = [];')"   "second file, same package, live"
IKIRO_WATCH_LIVE=0 expect allow watch-guard.sh "$(edit_json $reg/schematics.js 'export const ISOLATES = {};')"  "no listener on :2501"
IKIRO_WATCH_LIVE=1 expect allow watch-guard.sh "$(edit_json /Users/finn/.viva/registry/chess/mode.viva.js 'x')"  "first file of another package"
IKIRO_WATCH_LIVE=1 expect allow watch-guard.sh "$(edit_json /r/systems/anima/src/app/x.svelte 'x')"              "outside the watched trees"
rm -f "${TMPDIR:-/tmp}/ikiro-watch-exercise"

# compact-gate — m69 3.1: the retry is refused while a THROUGHPUT file sits above baseline, and passes over a
# PERSISTENT file above 15% (rebuilt, never drained). Exit 2 is the refusal; each case is a throwaway project.
gate_case() { # gate_case <want exit> <kind> <label>
  project=$(mktemp -d); mkdir -p "$project/.ikiro/methods" "$project/.ikiro/world"
  cp ../methods/budget.py "$project/.ikiro/methods/budget.py"
  { echo "# fixture"; echo "<!-- kind: $2 · limit: 1000 chars · drain: a quest -->"; printf 'x%.0s' $(seq 1 500); echo; } > "$project/.ikiro/world/fixture.md"
  session="exercise-compact-$2"; mkdir -p "${TMPDIR:-/tmp}/ikiro-compact-gate"; : > "${TMPDIR:-/tmp}/ikiro-compact-gate/$session"
  jq -cn --arg s "$session" '{session_id:$s,compaction_trigger:"manual"}' | CLAUDE_PROJECT_DIR="$project" bash compact-gate.sh >/dev/null 2>&1
  got=$?
  if [ "$got" = "$1" ]; then echo "PASS compact-gate.sh exit $1  $3"; else echo "FAIL compact-gate.sh want exit $1 got $got  $3"; fail=1; fi
  rm -rf "$project" "${TMPDIR:-/tmp}/ikiro-compact-gate/$session"
}
gate_case 2 throughput "retry, throughput 500/1000 above its 150 baseline"
gate_case 0 persistent "retry, persistent 500/1000 above 15% — rebuilt, not drained"

# kernel-guard — m69 3.3, staged: the kernel's two checkable one-liners that had no guard
edit_session() { jq -cn --arg p "$1" --arg s "$2" '{tool_name:"Write",session_id:"exercise",tool_input:{file_path:$p,content:$s}}'; }
expect deny  kernel-guard.sh "$(edit_session /r/docs/superpowers/plans/2026-09-23-m69.md '# plan')"             "a plan written outside the quests"
expect allow kernel-guard.sh "$(edit_session /r/.ikiro/quests/m69-ikiro-ikiro.org '* intent')"                 "a quest in its place"
expect deny  kernel-guard.sh "$(edit_session /r/documentation/src/content/docs/index.mdx 'vivalence is open-source')" "public copy says open-source"
expect allow kernel-guard.sh "$(edit_session /r/documentation/src/content/docs/index.mdx 'fair-source, source-available')" "public copy says fair-source"
expect allow kernel-guard.sh "$(edit_session /r/.ikiro/ikiro.md 'never "open-source"')"                         "the kernel quoting the rule"

# outside-rules.py — m69 2.3: `.claude/rules` paths never fire outside the repo; the hook delivers ONE shard per call,
# most specific glob first, each shard once per session, and stays silent inside the repo
rules_case() { # rules_case <want shard|-> <path> <label>
  got=$(jq -cn --arg p "$2" '{session_id:"exercise-rules",tool_name:"Read",tool_input:{file_path:$p}}' \
    | CLAUDE_PROJECT_DIR="$(cd .. && cd .. && pwd)" python3 outside-rules.py | jq -r '.hookSpecificOutput.additionalContext' 2>/dev/null \
    | sed -nE '1s/^<!-- rules via outside-rules.py: (.+) -->$/\1/p')
  if [ "${got:--}" = "$1" ]; then echo "PASS outside-rules.py ${got:--}  $3"; else echo "FAIL outside-rules.py want $1 got ${got:--}  $3"; fail=1; fi
}
rm -rf "${TMPDIR:-/tmp}/ikiro-outside-rules/exercise-rules"
rules_case world/codemap/assembly.md "$HOME/.viva/registry/assembly/package.viva.js" "registry package → its own shard first"
rules_case self/connoisseur.md "$HOME/.viva/registry/assembly/package.viva.js" "same session, next call → the next shard"
rules_case - "$(cd ../.. && pwd)/systems/runtime/run.js" "inside the repo → silent (the path channel works there)"
rm -rf "${TMPDIR:-/tmp}/ikiro-outside-rules/exercise-rules"

# the observe-only hooks — each case asserts its log grew by one row, the numerator it exists to write
grows() { # grows <log> <hook> <json> <label>
  log="$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/$1"
  before=$(wc -l < "$log" 2>/dev/null || echo 0)
  bash "$2" <<<"$3" >/dev/null 2>&1
  after=$(wc -l < "$log" 2>/dev/null || echo 0)
  if [ "$after" -gt "$before" ]; then echo "PASS $2 logged  $4"; else echo "FAIL $2 wrote no row  $4"; fail=1; fi
}
grows hooks.log-yap yap-meter.sh "$(jq -cn '{session_id:"exercise",last_assistant_message:"one two three\n```\ncode\n```"}')" "a turn's words outside fences"
grows hooks.log-loaded loaded-log.sh "$(jq -cn '{session_id:"exercise",hook_event_name:"InstructionsLoaded",file_path:"/r/.ikiro/ikiro.md",load_reason:"session_start"}')" "an instruction file entering context"

exit $fail
