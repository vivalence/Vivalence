import json, os, re, subprocess, collections

here = os.path.dirname(os.path.abspath(__file__))
rows = json.load(open(os.path.join(here, "imports.json")))
v6 = json.load(open(os.path.join(here, "v6.json")))
v7 = json.load(open(os.path.join(here, "v7.json")))
cache = "/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/11950be0-d9a3-406b-a6f9-1449974984c4/scratchpad/mikro/deno_dir/npm/registry.npmjs.org/@mikro-orm"
v7_package = {"knex": "sql"}

def declared_type(package, name):
    root = os.path.join(cache, package, "7.2.3")
    result = subprocess.run(["grep", "-rlE", rf"(type|interface|class|enum|function|const)\s+{re.escape(name)}\b", root, "--include=*.d.ts"], capture_output=True, text=True)
    return bool(result.stdout.strip())

usage = collections.defaultdict(lambda: {"files": set(), "type": True, "sites": []})
for row in rows:
    if row["dead"]:
        continue
    package = row["package"].split("/")[1]
    for name in row["names"]:
        key = (package, name["name"], bool(name.get("namespace")))
        entry = usage[key]
        entry["files"].add(row["path"])
        entry["type"] = entry["type"] and name["type"]
        entry["sites"].append(f'{row["path"]}:{row["line"]}')

print("package | name | live files | kind | v6 | v7 | first site")
for (package, name, namespace), entry in sorted(usage.items(), key=lambda item: (-len(item[1]["files"]), item[0])):
    target = v7_package.get(package, package)
    if namespace:
        in_v6, in_v7 = package in v6, target in v7
    elif entry["type"]:
        in_v6 = "type"
        in_v7 = "type" if declared_type(target, name) else "MISSING"
    else:
        in_v6 = "yes" if name in v6.get(package, []) else "NO"
        in_v7 = "yes" if name in v7.get(target, []) else ("type-only" if declared_type(target, name) else "MISSING")
    kind = "namespace" if namespace else ("type" if entry["type"] else "value")
    print(f"{package} | {name} | {len(entry['files'])} | {kind} | {in_v6} | {in_v7} | {sorted(entry['sites'])[0]}")

dead_files = {row["path"] for row in rows if row["dead"]}
live_files = {row["path"] for row in rows if not row["dead"]}
print()
print("live files", len(live_files), "dead files", len(dead_files))
by_root = collections.Counter()
for path in live_files:
    parts = path.split("/")
    by_root["registry:" + parts[3] if path.startswith("~/.viva/registry") else parts[0] + "/" + parts[1]] += 1
for root, count in by_root.most_common():
    print(f"  {count:3d} {root}")
