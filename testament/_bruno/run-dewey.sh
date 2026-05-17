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

# 4. Chat (SSE — curl, bru axios can't stream)
SSE=/tmp/dewey-chat.sse
set +e
curl -sN --max-time 120 -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"thread\":\"$THREAD_ID\",\"parts\":[{\"type\":\"text\",\"text\":\"Oi Dewey! Como se diz 'house' em português?\"}]}" \
  http://localhost:2501/daemon/brazilian/mode/teacher/dewey/harness/dialogue/stream \
  > "$SSE"
CURL_EXIT=$?
set -e
echo "curl exit: $CURL_EXIT (0=ok, 18=partial)"

OPENS=$(grep -c '"event":"/turn/open"' "$SSE" || true)
CLOSES=$(grep -c '"event":"/turn/close"' "$SSE" || true)
DELTAS=$(grep -c '"event":"/part/delta"' "$SSE" || true)
echo "chat sse — opens:$OPENS closes:$CLOSES deltas:$DELTAS"
grep -q "casa" "$SSE" && echo "casa: present" || echo "casa: MISSING"

# 5. Trace turns
bru run system/daemon/userspace/turn/find.bru \
  --env $ENV \
  --env-var accessToken=$TOKEN \
  --env-var DEWEY_THREAD_ID=$THREAD_ID
