# !/bin/bash

cat rls/meta/*.sql > combined.sql
cat rls/*.sql >> combined.sql
cat hooks/*.sql >> combined.sql
cat db-functions/*.sql >> combined.sql
cat db-functions/**/*.sql >> combined.sql
