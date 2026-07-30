import glob
import json
import os
import re

os.chdir("/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian")

findings = open(".harvest/staged/briefs/qa2-example-naturalness.md").read()

blocks = re.findall(
    r"\*\*\d+\. `([^`]+)`\*\*[^\n]*\n- current: `([^`]+)`(?: / EN `([^`]+)`)?\n- fix: `([^`]+)`(?: / EN `([^`]+)`)?",
    findings,
)
print(f"parsed {len(blocks)} single-entity proposals")

piovere_fixes = {
    "piovere.verb.indicative.present.first.singular": None,
    "piovere.verb.indicative.present.second.singular": None,
    "piovere.verb.indicative.present.first.plural": None,
    "piovere.verb.indicative.present.second.plural": None,
}


def read_entities(fpath):
    content = open(fpath).read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


def write_entities(fpath, entities):
    open(fpath, "w").write("export default " + json.dumps(entities, indent=2, ensure_ascii=False) + "\n")


index = {}
files = {}
for fpath in glob.glob("dataset/literals/words/*.js"):
    if fpath.endswith("index.js"):
        continue
    entities = read_entities(fpath)
    files[fpath] = entities
    for entity in entities:
        index[entity["slug"]] = (fpath, entity)

applied = 0
skipped = []
for slug, current, current_en, fix, fix_en in blocks:
    found = index.get(slug)
    if not found:
        skipped.append((slug, "missing"))
        continue
    _, entity = found
    exemplified = entity["trait"].get("EXEMPLIFIED")
    if not exemplified or exemplified["learning"] != current:
        skipped.append((slug, "drift"))
        continue
    exemplified["learning"] = fix
    if fix_en:
        exemplified["known"] = fix_en
    applied += 1

print(f"applied {applied}, skipped: {skipped}")
for fpath, entities in files.items():
    write_entities(fpath, entities)
