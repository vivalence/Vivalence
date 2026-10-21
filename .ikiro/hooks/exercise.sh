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
expect deny  log-guard.sh "$(edit_json /r/systems/runtime/subjects/daemon/populate.js 'console.log({ mask, service, faculties });')" "mask logged whole"
expect deny  log-guard.sh "$(edit_json /r/commons/hallucinators/x/provider/index.js "console.log('boot', die)")"       "die logged"
expect allow log-guard.sh "$(edit_json /r/systems/runtime/subjects/daemon/populate.js 'console.log(`daemon[${slug}].hallucinators[${i}] ${module}`)')" "slot label"
expect allow log-guard.sh "$(edit_json /r/systems/runtime/tests/x.test.js 'console.log(mask)')"                          "test file"
expect allow log-guard.sh "$(edit_json /r/systems/runtime/subjects/daemon/x.js 'const service = ctx.daemon.services.reader;')"    "no log"

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
expect deny  comment-guard.sh "$(edit_json /r/subsystems/paladin/gestalten/belt/check.js '  // verdict = max(declared, observed)
  const x = 1;')" "authored // in product source"
expect allow comment-guard.sh "$(edit_json /r/subsystems/paladin/gestalten/belt/check.js '  const x = 1; // @beef keep')" "beef annotation"
before=$(wc -l < "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null || echo 0)
expect warn comment-guard.sh "$(bash_json 'cat > /r/systems/runtime/subjects/daemon/x.js <<EOF
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

# lifecycle-guard — the 10-08 shape: seven (ctx, next) middlewares written as consts into a trait file
expect deny  lifecycle-guard.sh "$(edit_json /r/systems/runtime/subjects/mode/traits/harnessed.js 'const claiming = async (ctx, next) => { await next(); };')" "shard const in a trait"
expect deny  lifecycle-guard.sh "$(edit_json /r/systems/runtime/subjects/mode/traits/harnessed.js 'const chaining = (mode) => async (ctx, next) => { await next(); };')" "curried shard"
expect deny  lifecycle-guard.sh "$(edit_json /r/systems/runtime/subjects/daemon/lifecycle/integration.js 'const round = (via) => async (ctx) => { ctx.output = 1; };')" "effect factory in a beat file"
expect allow lifecycle-guard.sh "$(edit_json /r/systems/runtime/subjects/daemon/lifecycle/population.js 'export const modes = async (die, next) => { await next(); };')" "a beat"
expect allow lifecycle-guard.sh "$(edit_json /r/systems/runtime/subjects/daemon/lifecycle/resolution.js '  die.daemon.aperture.use(async (ctx, next) => { await next(); });')" "inline use inside a beat"
expect allow lifecycle-guard.sh "$(edit_json /r/systems/runtime/subjects/mode/traits/tooling.js 'export const TOOLING = (mode, host) => { mode.tools.graft(mode.module.tools); };')" "a trait"
expect deny  lifecycle-guard.sh "$(edit_json /r/systems/runtime/subjects/lighthouse/traits/joinable.js 'const gate = async (ctx, next) => { await next(); };')" "shard const in a lighthouse trait (m91 path)"
expect allow lifecycle-guard.sh "$(edit_json /r/systems/runtime/gestalten/shard/harness.js 'export const claiming = (mode) => async (ctx, next) => {};')" "the shard home"
expect allow lifecycle-guard.sh "$(edit_json /r/systems/runtime/tests/x.test.js 'const f = async (ctx, next) => {};')" "test file"

# blast-guard — the 10-19 shape: a consumer grep filtered by --include missed chassis.jsx (WARN only)
expect warn  blast-guard.sh "$(bash_json 'grep -rln "@vivalence/ghost" systems subsystems --include=*.js')" "blast with --include"
expect warn  blast-guard.sh "$(bash_json 'grep -rn paladin.skills subsystems | head')" "blast piped to head"
expect allow blast-guard.sh "$(bash_json 'grep -rnI "@vivalence/ghost" systems subsystems --exclude-dir=node_modules --exclude-dir=bak')" "every text type"
expect allow blast-guard.sh "$(bash_json 'grep -rn "lifecycle/" .ikiro/quests --include=*.org')" "a doc grep over .ikiro"
expect allow blast-guard.sh "$(bash_json 'grep -n include deno.jsonc')" "not recursive"

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

# compact-gate — first /compact of a session refused; the retry passes once quests/frontier.md is newer than the stamp
gate_case() { # gate_case <want exit> <touch-frontier 0|1> <label>
  project=$(mktemp -d); mkdir -p "$project/.ikiro/methods" "$project/.ikiro/quests"
  cp ../methods/cap.py "$project/.ikiro/methods/cap.py"
  session="exercise-compact-$2"; mkdir -p "${TMPDIR:-/tmp}/ikiro-compact-gate"; : > "${TMPDIR:-/tmp}/ikiro-compact-gate/$session"
  [ "$2" = 1 ] && { sleep 1; echo "# frontier" > "$project/.ikiro/quests/frontier.md"; } || { echo "# frontier" > "$project/.ikiro/quests/frontier.md"; touch -t 202001010000 "$project/.ikiro/quests/frontier.md"; }
  jq -cn --arg s "$session" '{session_id:$s,compaction_trigger:"manual"}' | CLAUDE_PROJECT_DIR="$project" bash compact-gate.sh >/dev/null 2>&1
  got=$?
  if [ "$got" = "$1" ]; then echo "PASS compact-gate.sh exit $1  $3"; else echo "FAIL compact-gate.sh want exit $1 got $got  $3"; fail=1; fi
  rm -rf "$project" "${TMPDIR:-/tmp}/ikiro-compact-gate/$session"
}
gate_case 2 0 "retry, frontier untouched since the refusal"
gate_case 0 1 "retry, frontier rewritten after the refusal"

# kernel-guard — m69 3.3, staged: the kernel's two checkable one-liners that had no guard
edit_session() { jq -cn --arg p "$1" --arg s "$2" '{tool_name:"Write",session_id:"exercise",tool_input:{file_path:$p,content:$s}}'; }
expect deny  kernel-guard.sh "$(edit_session /r/docs/superpowers/plans/2026-09-23-m69.md '# plan')"             "a plan written outside the quests"
expect allow kernel-guard.sh "$(edit_session /r/.ikiro/quests/m69-ikiro-ikiro.org '* intent')"                 "a quest in its place"
expect deny  kernel-guard.sh "$(edit_session /r/documentation/src/content/docs/index.mdx 'vivalence is open-source')" "public copy says open-source"
expect allow kernel-guard.sh "$(edit_session /r/documentation/src/content/docs/index.mdx 'fair-source, source-available')" "public copy says fair-source"
expect allow kernel-guard.sh "$(edit_session /r/.ikiro/codestyle.md 'never "open-source"')"                         "the kernel quoting the rule"

# cap-guard — a write past `limit: N chars` is refused; a capped file without a limit is refused; quests are never capped
cap_case() { # cap_case <want> <json> <label>
  out=$(IKIRO_GUARD_MODE=deny bash cap-guard.sh <<<"$2" 2>&1)
  got=allow; grep -q '"deny"' <<<"$out" && got=deny
  if [ "$got" = "$1" ]; then echo "PASS cap-guard.sh $1  $3"; else echo "FAIL cap-guard.sh want $1 got $got  $3"; fail=1; fi
}
capdir=$(mktemp -d); mkdir -p "$capdir/.ikiro/world" "$capdir/.ikiro/quests"
{ echo "<!-- limit: 100 chars -->"; printf 'y%.0s' $(seq 1 60); echo; } > "$capdir/.ikiro/world/small.md"
export CLAUDE_PROJECT_DIR="$capdir"
cap_case deny  "$(jq -cn --arg p "$capdir/.ikiro/world/small.md" --arg c "<!-- limit: 100 chars -->$(printf 'z%.0s' $(seq 1 120))" '{tool_name:"Write",session_id:"exercise",tool_input:{file_path:$p,content:$c}}')" "Write past the limit"
cap_case allow "$(jq -cn --arg p "$capdir/.ikiro/world/small.md" --arg c "<!-- limit: 100 chars -->short" '{tool_name:"Write",session_id:"exercise",tool_input:{file_path:$p,content:$c}}')" "Write under the limit"
cap_case deny  "$(jq -cn --arg p "$capdir/.ikiro/world/small.md" --arg o "yyyy" --arg n "$(printf 'w%.0s' $(seq 1 80))" '{tool_name:"Edit",session_id:"exercise",tool_input:{file_path:$p,old_string:$o,new_string:$n}}')" "Edit whose result passes the limit"
cap_case allow "$(jq -cn --arg p "$capdir/.ikiro/world/small.md" --arg o "yyyy" --arg n "yy" '{tool_name:"Edit",session_id:"exercise",tool_input:{file_path:$p,old_string:$o,new_string:$n}}')" "Edit that shrinks"
cap_case deny  "$(jq -cn --arg p "$capdir/.ikiro/world/nolimit.md" --arg c "# no header" '{tool_name:"Write",session_id:"exercise",tool_input:{file_path:$p,content:$c}}')" "a capped file born without a limit"
cap_case allow "$(jq -cn --arg p "$capdir/.ikiro/quests/big.org" --arg c "$(printf 'q%.0s' $(seq 1 5000))" '{tool_name:"Write",session_id:"exercise",tool_input:{file_path:$p,content:$c}}')" "a quest is never capped"
unset CLAUDE_PROJECT_DIR; rm -rf "$capdir"

exit $fail
