#!/bin/bash
# exercise every guard against the ledger shapes it was built from — deny on the offending line,
# allow on the neighbouring legitimate one. "An unexercised gate is a claim about a gate."
#   bash .ikiro/hooks/exercise.sh        → prints PASS/FAIL per case, exit 1 on any FAIL
cd "$(dirname "$0")" || exit 1
fail=0
expect() { # expect <deny|allow> <hook> <json>
  out=$(IKIRO_GUARD_MODE=deny bash "$2" <<<"$3" 2>/dev/null)
  got=allow; grep -q '"deny"' <<<"$out" && got=deny
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
expect allow comment-guard.sh "$(bash_json 'cat > /r/systems/runtime/daemon/x.js <<EOF
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

exit $fail
