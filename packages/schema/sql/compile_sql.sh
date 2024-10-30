#!/bin/bash
set -e
out="../dist/compiled.sql"
: > $out

echo '-- EXTENSIONS' >> $out
cat extensions/*.sql >> $out

echo '-- PERMISSIONS' >> $out
cat permissions/*.sql >> $out

echo '-- RLS' >> $out
cat rls/**/*.sql >> $out
cat rls/*.sql >> $out

echo '-- Hooks' >> $out
# cat hooks/**/*.sql >> $out
cat hooks/*.sql >> $out

echo '-- Functions' >> $out
cat functions/**/*.sql >> $out
cat functions/*.sql >> $out

