#!/bin/sh
T=/Users/finn/vivalence/code/vivalence
L=${1:?a fresh directory for the copy}
mkdir -p "$L/subsystems" "$L/commons/instances"
rsync -a --exclude node_modules --exclude bak "$T/subsystems/typology" "$T/subsystems/paladin" "$L/subsystems/"
rsync -a --exclude node_modules "$T/commons/ledger" "$L/commons/"
rsync -a --exclude node_modules "$T/commons/instances/hello-world" "$L/commons/instances/"
cp "$T/deno.jsonc" "$L/deno.jsonc"
cat > "$L/import_map.json" <<MAP
{
  "imports": {
    "@vivalence/typology": "./subsystems/typology/mod.ts",
    "@vivalence/typology/scenarios": "./subsystems/typology/tests/scenarios/index.js",
    "@vivalence/typology/specimen": "./subsystems/typology/specimen/index.js",
    "@vivalence/paladin": "./subsystems/paladin/mod.js",
    "@vivalence/paladin/typology": "./subsystems/paladin/typology.js",
$(sed -n '2,/^  }/p' "$T/import_map.json" | sed '1d;$d')
  }
}
MAP
printf '{\n  "importMap": "./import_map.json",\n  "lock": false\n}\n' > "$L/deno.json"
echo "$L"
