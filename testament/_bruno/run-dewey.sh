#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
ENV=localhost

# 1. Login
bru run system/lighthouse/auth/login.bru \
  --env $ENV \
  --reporter-json /tmp/bru-login.json > /dev/null
TOKEN=$(jq -r '.results[0].response.body.authority.access' /tmp/bru-login.json)

# 2. Resolve dewey mode ID
bru run system/daemon/datamap/mode/findOne.bru \
  --env $ENV \
  --env-var accessToken=$TOKEN \
  --reporter-json /tmp/bru-mode.json > /dev/null
MODE_ID=$(jq -r '.results[0].response.body.id' /tmp/bru-mode.json)

# 3. Create thread
bru run system/daemon/userspace/entities/thread/create.bru \
  --env $ENV \
  --env-var accessToken=$TOKEN \
  --env-var DEWEY_MODE_ID=$MODE_ID \
  --reporter-json /tmp/bru-thread.json > /dev/null
THREAD_ID=$(jq -r '.results[0].response.body.id' /tmp/bru-thread.json)

echo "thread: $THREAD_ID"

# 4. Chat
bru run variants/daemons/test-language/modes/teacher/dewey/harness/chat.bru \
  --env $ENV \
  --env-var accessToken=$TOKEN \
  --env-var DEWEY_THREAD_ID=$THREAD_ID

# 5. Trace turns
bru run system/daemon/userspace/entities/turn/find.bru \
  --env $ENV \
  --env-var accessToken=$TOKEN \
  --env-var DEWEY_THREAD_ID=$THREAD_ID
