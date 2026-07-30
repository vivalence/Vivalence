import json
import os
import re

os.chdir("/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian")

findings = open(".harvest/staged/briefs/qa2-nm1-translations.md").read()
blocks = re.findall(
    r"### \d+\. `([^`]+)`\n- learning: `[^`]*`\n- current known: `([^`]*)`\n- proposed known: `([^`]*)`",
    findings,
)
print(f"parsed {len(blocks)} proposals")


def read_entities(fpath):
    content = open(fpath).read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


entities = read_entities("dataset/literals/sentences.js")
by_slug = {e["slug"]: e for e in entities}
applied = 0
mismatched = []
for slug, current, proposed in blocks:
    entity = by_slug.get(slug)
    if not entity:
        mismatched.append((slug, "missing"))
        continue
    if entity["trait"]["TRANSLATED"]["known"] != current:
        mismatched.append((slug, "current-drift"))
        continue
    entity["trait"]["TRANSLATED"]["known"] = proposed
    applied += 1
open("dataset/literals/sentences.js", "w").write("export default " + json.dumps(entities, indent=2, ensure_ascii=False) + "\n")
print(f"applied {applied}, mismatched {mismatched}")
