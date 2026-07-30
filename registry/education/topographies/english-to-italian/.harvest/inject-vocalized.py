import glob
import json
import os
import re

HARVEST = os.path.dirname(os.path.abspath(__file__))
TOPOGRAPHY = os.path.dirname(HARVEST)


def read_entities(fpath):
    raw = open(fpath).read().replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


def write_entities(fpath, entities):
    open(fpath, "w").write("export default " + json.dumps(entities, indent=2, ensure_ascii=False) + "\n")


inject = json.load(open(f"{HARVEST}/vocalized-inject.json"))

injected = already = 0
for fpath in sorted(glob.glob(f"{TOPOGRAPHY}/dataset/literals/words/*.js")):
    if fpath.endswith("index.js"):
        continue
    entities = read_entities(fpath)
    changed = False
    for entity in entities:
        path = inject.get(entity["slug"])
        if not path:
            continue
        assert os.path.exists(f"{TOPOGRAPHY}/freight/audio/{path}"), path
        if entity["trait"].get("VOCALIZED", {}).get("asset", {}).get("path") == path:
            already += 1
            continue
        entity["trait"]["VOCALIZED"] = {"asset": {"path": path}}
        if "VOCALIZED" not in entity["traits"]:
            entity["traits"].append("VOCALIZED")
        injected += 1
        changed = True
    if changed:
        write_entities(fpath, entities)

print(f"injected {injected}, already-current {already}, map total {len(inject)}")
