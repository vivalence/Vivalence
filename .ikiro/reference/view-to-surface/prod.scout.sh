#!/bin/sh
# limit: 1600 chars · READ-ONLY on R000 (ssh stdin): the running runtime's image · mountpoint · every migrations folder · snapshot · db file; no secrets, no writes
C=$(docker ps --format '{{.Names}}' | grep '^runtime-')
V=$(docker volume ls -q | grep '_mountpoint$')
echo "== container $C · volume $V"
docker ps --filter "name=^$C$" --format '{{.Status}} · {{.Image}}'
docker inspect "$C" --format 'image {{.Image}} · created {{.Created}} · started {{.State.StartedAt}}'
echo "== env (VIVA_* bar secrets)"
docker exec "$C" env | grep -E '^(VIVA|PUBLIC_VIVA)_' | grep -v SECRET | sort
echo "== beacon"
docker exec "$C" sh -c 'wget -qO- http://127.0.0.1:2501/beacon/status; echo'
echo "== mountpoint, depth 2"
docker exec "$C" sh -c 'find /viva/mountpoint -maxdepth 2 | sort'
echo "== db files"
docker exec "$C" sh -c 'find /viva/mountpoint -name "*.db*" -exec ls -la {} \;'
echo "== migrations folders"
docker exec "$C" sh -c 'find /viva/mountpoint -type d -name migrations' | while read -r dir; do
  echo "-- $dir"
  docker exec "$C" ls -la "$dir"
done
echo "== snapshots"
docker exec "$C" sh -c 'find /viva/mountpoint -name ".snapshot-*" -exec ls -la {} \;'
echo "== migrations config in the image"
docker exec "$C" sh -c 'grep -rn "migrations" /viva/repository/subsystems/typology/libsql.viva.js /viva/repository/subsystems/typology/*.viva.js 2>&1 | head -40'
