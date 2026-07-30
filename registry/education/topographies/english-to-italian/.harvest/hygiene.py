import glob
import json
import os
import re

os.chdir("/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian")


def read_entities(fpath):
    content = open(fpath).read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


problems = {"whitespace": [], "mojibake": [], "empty": [], "trailing-punct": [], "known-missing-in-example": []}
for fpath in sorted(glob.glob("dataset/literals/words/*.js")) + ["dataset/literals/sentences.js"]:
    if fpath.endswith("index.js"):
        continue
    for entity in read_entities(fpath):
        slug = entity["slug"]
        translated = entity["trait"].get("TRANSLATED")
        exemplified = entity["trait"].get("EXEMPLIFIED")
        for trait_name, trait in (("TRANSLATED", translated), ("EXEMPLIFIED", exemplified)):
            if not trait:
                continue
            for field in ("known", "learning"):
                value = trait[field]
                if not value or not value.strip():
                    problems["empty"].append((slug, trait_name, field))
                    continue
                if value != value.strip() or "  " in value:
                    problems["whitespace"].append((slug, trait_name, field))
                if any(marker in value for marker in ("Ã", "â", "�")):
                    problems["mojibake"].append((slug, trait_name, field))
                if value[-1] in ",;:":
                    problems["trailing-punct"].append((slug, trait_name, field, value[-25:]))
        if translated and exemplified:
            known = translated["known"].lower()
            head = re.split(r"[/(]", known)[0].strip()
            head_words = [w for w in re.findall(r"[a-z']+", head) if w not in
                          {"to", "the", "a", "an", "of", "in", "on", "at", "it", "he", "she", "himself", "herself", "oneself", "masc", "fem", "pl", "sing", "informal", "formal", "stressed"}]
            example_known = exemplified["known"].lower()
            if head_words and not any(w[:4] in example_known for w in head_words):
                problems["known-missing-in-example"].append((slug, head, exemplified["known"][:40]))

for key, rows in problems.items():
    print(key, len(rows))
    for row in rows:
        print("  ", row)
