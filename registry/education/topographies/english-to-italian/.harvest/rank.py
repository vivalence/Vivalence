import glob
import json
import re
import sys

import wordfreq

WORDS = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/words"


def read_entities(fpath):
    with open(fpath) as f:
        content = f.read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


def write_entities(fpath, entities):
    body = json.dumps(entities, indent=2, ensure_ascii=False)
    with open(fpath, "w") as f:
        f.write(f"export default {body}\n")


def sigfig(value, figures=3):
    if value == 0:
        return 0.0
    from math import floor, log10
    return round(value, -int(floor(log10(abs(value)))) + figures - 1)


top = {form: position + 1 for position, form in enumerate(wordfreq.top_n_list("it", 200000))}

targets = sys.argv[1:] or sorted(glob.glob(f"{WORDS}/*.js"))
for fpath in targets:
    if fpath.endswith("index.js"):
        continue
    entities = read_entities(fpath)
    if not entities:
        continue
    changed = 0
    for entity in entities:
        learning = entity["trait"]["TRANSLATED"]["learning"]
        zipf = wordfreq.zipf_frequency(learning, "it")
        if zipf == 0:
            print(f"  ZERO-FREQ (RANKED dropped): {entity['slug']} ({learning})")
            entity["trait"].pop("RANKED", None)
            if "RANKED" in entity["traits"]:
                entity["traits"].remove("RANKED")
            continue
        ranked = {
            "rank": top.get(learning.lower(), 0),
            "zipf": zipf,
            "fpm": sigfig(10 ** (zipf - 3)),
        }
        entity["trait"]["RANKED"] = ranked
        if "RANKED" not in entity["traits"]:
            entity["traits"].append("RANKED")
        changed += 1
    write_entities(fpath, entities)
    print(f"{fpath.split('/')[-1]}: {changed} ranked")
