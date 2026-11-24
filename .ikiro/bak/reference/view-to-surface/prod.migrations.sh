#!/bin/sh
# limit: 900 chars · READ-ONLY on R000 (ssh stdin): View rows in the two older migrations, the snapshot's View · File · buffer_views keys, the image's migrations config
C=$(docker ps --format '{{.Names}}' | grep '^runtime-')
echo "-- view in migrations"
docker exec "$C" grep -n -i 'view' /viva/mountpoint/migrations/Migration20261106183423.ts /viva/mountpoint/migrations/Migration20261111171244.ts
echo "-- snapshot tables"
docker exec "$C" grep -n '"name": "\(View\|File\|buffer_views\)"' /viva/mountpoint/migrations/.snapshot-prod.viva.db.json
echo "-- migrations config in the image"
docker exec "$C" sh -c 'grep -rn "migrations" /viva/repository/subsystems/typology --include=*.js --include=*.ts -l'
