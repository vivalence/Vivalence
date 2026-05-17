#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
ENV=localhost

# 1. Login
bru run system/lighthouse/auth/login.bru \
  --env $ENV \
  --reporter-json /tmp/bru-login.json > /dev/null
TOKEN=$(jq -r '.[0].results[0].response.data.authority.access' /tmp/bru-login.json)

# 2. Resolve dewey mode ID
bru run system/daemon/datamap/mode/findOne.bru \
  --env $ENV \
  --env-var accessToken=$TOKEN \
  --reporter-json /tmp/bru-mode.json > /dev/null
MODE_ID=$(jq -r '.[0].results[0].response.data.id' /tmp/bru-mode.json)

# 3. Create thread
bru run system/daemon/userspace/thread/create.bru \
  --env $ENV \
  --env-var accessToken=$TOKEN \
  --env-var DEWEY_MODE_ID=$MODE_ID \
  --reporter-json /tmp/bru-thread.json > /dev/null
THREAD_ID=$(jq -r '.[0].results[0].response.data.id' /tmp/bru-thread.json)

echo "thread: $THREAD_ID"

# 4. Chat with tool-forcing prompt (SSE — curl, bru axios can't stream)
SSE=/tmp/dewey-tool.sse
set +e
curl -sN --max-time 180 -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"thread\":\"$THREAD_ID\",\"parts\":[{\"type\":\"text\",\"text\":\"Olha o meu progresso — quais palavras estou mais fraco e o que tenho para revisar agora? Use a ferramenta de estado do aluno para me dizer.\"}],\"tune\":\"unleashed\"}" \
  http://localhost:2501/daemon/brazilian/mode/teacher/dewey/harness/dialogue/stream \
  > "$SSE"
CURL_EXIT=$?
set -e
echo "curl exit: $CURL_EXIT (0=ok, 18=partial)"

OPENS=$(grep -c '"event":"/turn/open"' "$SSE" || true)
CLOSES=$(grep -c '"event":"/turn/close"' "$SSE" || true)
TOOL_USE=$(grep -c '"type":"tool_use"' "$SSE" || true)
TOOL_RESULT=$(grep -c '"type":"tool_result"' "$SSE" || true)

echo
echo "=== TOOL-LOOP ASSERTIONS ==="
echo "/turn/open  : $OPENS  (expect 3)"
echo "/turn/close : $CLOSES (expect 3)"
echo "tool_use part: $TOOL_USE  (expect >=1)"
echo "tool_result  : $TOOL_RESULT  (expect >=1)"

FIRST_STOP=$(grep -o '"event":"/turn/close"[^}]*"stop":"[^"]*"' "$SSE" | head -1 | grep -o '"stop":"[^"]*"' | head -1)
LAST_STOP=$(grep -o '"event":"/turn/close"[^}]*"stop":"[^"]*"' "$SSE" | tail -1 | grep -o '"stop":"[^"]*"' | tail -1)
echo "first close   : $FIRST_STOP (expect tool_use)"
echo "last close    : $LAST_STOP (expect end_turn)"

grep -q "histogram" "$SSE" && echo "histogram: present in stream" || echo "histogram: MISSING"

# 5. Trace turns
echo
bru run system/daemon/userspace/turn/find.bru \
  --env $ENV \
  --env-var accessToken=$TOKEN \
  --env-var DEWEY_THREAD_ID=$THREAD_ID
