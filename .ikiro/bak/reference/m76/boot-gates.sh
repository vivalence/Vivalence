#!/bin/zsh
# the M1/M2 wire gates against a running fresh instance: manifest · signup · login · terminal walls · announce row · handshake enrolls
set -u
PORT=${1:-27601}
DAEMON=${2:-chess}
BASE=http://localhost:$PORT
LH=$BASE/attached/process/service/lighthouse/multiplayer
post() {
  local auth=()
  [[ -n ${3:-} ]] && auth=(-H "authorization: Bearer $3")
  curl -s -X POST -H 'content-type: application/json' "${auth[@]}" -d "$2" "$1"
}
count() { python3 -c 'import sys,json; rows=json.load(sys.stdin); print(len(rows), "rows:", [r.get("slug", r.get("index")) for r in rows])'; }
echo "manifest   $(curl -s $LH/metadata/manifest | cut -c1-120)"
echo "status     $(curl -s $BASE/status | cut -c1-80)"
SIGNUP=$(post $LH/auth/signup '{"username":"m76","password":"m76-pass-word"}')
echo "signup     $(echo $SIGNUP | cut -c1-100)"
LOGIN=$(post $LH/auth/login '{"username":"m76","password":"m76-pass-word"}')
ACCESS=$(echo $LOGIN | python3 -c 'import sys,json; print(json.load(sys.stdin)["authority"]["access"])' 2>/dev/null)
echo "login      status=$(echo $LOGIN | python3 -c 'import sys,json; print(json.load(sys.stdin)["status"])') access=${ACCESS:0:12}…"
echo "terminal/find no bearer   $(post $LH/entities/terminal/find '{"where":{}}' | cut -c1-120)"
echo "terminal/find bearer      $(post $LH/entities/terminal/find '{"where":{}}' $ACCESS | count)"
echo "terminal/create           $(post $LH/entities/terminal/create '{"data":{}}' $ACCESS | cut -c1-200)"
echo "terminal/find widened     $(post $LH/entities/terminal/find '{"where":{"identity":"0000"}}' $ACCESS | count)"
echo "daemon/find before enroll $(post $LH/entities/daemon/find '{"where":{}}' $ACCESS | count)"
echo "handshake                 $(post $BASE/daemon/$DAEMON/userspace/handshake '{}' $ACCESS | cut -c1-160)"
echo "daemon/find after enroll  $(post $LH/entities/daemon/find '{"where":{}}' $ACCESS | cut -c1-220)"
echo "handshake again           $(post $BASE/daemon/$DAEMON/userspace/handshake '{}' $ACCESS | cut -c1-100)"
echo "daemon/status bearer      $(curl -s -H "authorization: Bearer $ACCESS" $BASE/daemon/$DAEMON/status | cut -c1-100)"
echo "verify no embed           $(post $LH/auth/verify "{\"access\":\"$ACCESS\"}" | cut -c1-160)"
