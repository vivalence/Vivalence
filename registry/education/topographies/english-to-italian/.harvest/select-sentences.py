import glob
import json
import re

TOPOGRAPHY = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian"
HARVEST = f"{TOPOGRAPHY}/.harvest"

ELISIONS = {
    "l'": ["la", "lo"], "un'": ["una"], "d'": ["di"], "c'": ["ci"], "m'": ["mi"],
    "t'": ["ti"], "s'": ["si"], "v'": ["vi"], "n'": ["ne"], "dell'": ["della", "dello"],
    "all'": ["alla", "allo"], "dall'": ["dalla", "dallo"], "nell'": ["nella", "nello"],
    "sull'": ["sulla", "sullo"], "quest'": ["questo", "questa"], "quell'": ["quello", "quella"],
    "com'": ["come"], "dov'": ["dove"], "senz'": ["senza"], "po'": ["poco"], "anch'": ["anche"],
}


def read_entities(fpath):
    content = open(fpath).read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


def dataset_forms():
    forms = set()
    for fpath in sorted(glob.glob(f"{TOPOGRAPHY}/dataset/literals/words/*.js")):
        if fpath.endswith("index.js"):
            continue
        for entity in read_entities(fpath):
            forms.add(entity["trait"]["TRANSLATED"]["learning"].lower())
    return forms


def tokenize(text):
    text = text.lower()
    pieces = re.findall(r"[a-zàèéìòù]+'?", text)
    tokens = []
    for piece in pieces:
        if piece.endswith("'"):
            tokens.append(piece)
        else:
            tokens.append(piece)
    return tokens


PROPER = {
    "tom", "mary", "maria", "john", "anna", "marco", "boston", "roma", "milano",
    "firenze", "venezia", "napoli", "torino", "parigi", "londra", "italia", "francia",
    "inghilterra", "germania", "spagna", "giappone", "america", "europa", "kyoto",
}


def covered(token, forms):
    if token in forms or token in PROPER:
        return True
    if token in ELISIONS:
        return any(expansion in forms for expansion in ELISIONS[token])
    return False


forms = dataset_forms()
pool = json.load(open(f"{HARVEST}/nm1-pool.json"))
report = {"selectable": [], "near": {}, "stats": {}}
for record in pool:
    tokens = tokenize(record["text"])
    missing = sorted({t for t in tokens if not covered(t, forms)})
    if not missing:
        report["selectable"].append(record["sid"])
    elif len(missing) <= 2:
        report["near"][record["sid"]] = missing
report["stats"] = {
    "forms": len(forms),
    "pool": len(pool),
    "selectable": len(report["selectable"]),
    "near(≤2 missing)": len(report["near"]),
}
json.dump(report, open(f"{HARVEST}/sentence-coverage.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(report["stats"], ensure_ascii=False))

from collections import Counter
missing_counter = Counter(t for missing in report["near"].values() for t in missing)
print("top missing forms:", missing_counter.most_common(25))
