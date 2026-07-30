import glob
import json
import os
import re

TOPOGRAPHY = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian"


def read_entities(fpath):
    content = open(fpath).read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


symbols = read_entities(f"{TOPOGRAPHY}/dataset/symbols/structural.js")
symbols += read_entities(f"{TOPOGRAPHY}/dataset/symbols/ontological.js")
local_symbols = {s["slug"] for s in symbols}

literals = []
for fpath in sorted(glob.glob(f"{TOPOGRAPHY}/dataset/literals/words/*.js")):
    if not fpath.endswith("index.js"):
        literals += read_entities(fpath)
literals += read_entities(f"{TOPOGRAPHY}/dataset/literals/sentences.js")
bundles = read_entities(f"{TOPOGRAPHY}/dataset/literals/conjugation.js")

findings = []
slugs = set()
examples = {}
for entity in literals + bundles:
    slug = entity["slug"]
    if slug in slugs:
        findings.append(f"DUPE-SLUG {slug}")
    slugs.add(slug)

for entity in literals:
    slug = entity["slug"]
    traits = entity["traits"]
    trait = entity["trait"]
    if sorted(traits) != sorted(trait.keys()):
        findings.append(f"TRAIT-MISMATCH {slug}: {traits} vs {sorted(trait.keys())}")
    translated = trait.get("TRANSLATED")
    if not translated:
        findings.append(f"NO-TRANSLATED {slug}")
        continue
    learning = translated["learning"]
    is_sentence = any(s["slug"] == "sentence" for s in entity["symbols"])
    if not is_sentence and learning != learning.lower():
        findings.append(f"NOT-LOWERCASE {slug}")
    exemplified = trait.get("EXEMPLIFIED")
    if exemplified:
        if learning.lower() not in exemplified["learning"].lower():
            findings.append(f"FORM-NOT-IN-EXAMPLE {slug}")
        prior = examples.get(exemplified["learning"])
        if prior:
            findings.append(f"DUPE-EXAMPLE {slug} = {prior}")
        examples[exemplified["learning"]] = slug
    ranked = trait.get("RANKED")
    if ranked and "zipf" in ranked and ranked["zipf"] == 0:
        findings.append(f"ZERO-ZIPF {slug}")
    vocalized = trait.get("VOCALIZED")
    if vocalized:
        asset = f"{TOPOGRAPHY}/freight/audio/{vocalized['asset']['path']}"
        if not os.path.exists(asset):
            findings.append(f"MISSING-MP3 {slug} -> {vocalized['asset']['path']}")
    for symbol in entity["symbols"]:
        s = symbol["slug"]
        if s.startswith(("proficiency.", "functional.", "domain.")) and s not in local_symbols:
            findings.append(f"ILLEGAL-SYMBOL {slug}: {s}")

for bundle in bundles:
    conjugated = bundle["trait"]["CONJUGATED"]
    for reference in [conjugated["infinitive"], *conjugated["paradigm"].values()]:
        if reference not in slugs:
            findings.append(f"UNRESOLVED-REF {bundle['slug']} -> {reference}")

paradigm_members = set()
for bundle in bundles:
    paradigm_members.update(bundle["trait"]["CONJUGATED"]["paradigm"].values())
for entity in literals:
    slug = entity["slug"]
    if ".verb.indicative.present." in slug and slug not in paradigm_members:
        findings.append(f"ORPHAN-PRESENT-FORM {slug}")

mp3s = {f"sentences/{f}" for f in os.listdir(f"{TOPOGRAPHY}/freight/audio/sentences")} | \
       {f"words/{f}" for f in os.listdir(f"{TOPOGRAPHY}/freight/audio/words")}
referenced = {e["trait"]["VOCALIZED"]["asset"]["path"] for e in literals if e["trait"].get("VOCALIZED")}
orphan_mp3s = mp3s - referenced

print(f"literals {len(literals)} · bundles {len(bundles)} · findings {len(findings)} · orphan-mp3s {len(orphan_mp3s)}")
for finding in findings[:60]:
    print(" ", finding)
if len(findings) > 60:
    print(f"  … +{len(findings) - 60} more")
