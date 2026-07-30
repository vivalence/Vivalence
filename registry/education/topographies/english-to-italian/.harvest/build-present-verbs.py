import glob
import json
import re

BASE = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals"
STAGED = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged"

CELLS = [
    ("first", "singular"), ("second", "singular"), ("third", "singular"),
    ("first", "plural"), ("second", "plural"), ("third", "plural"),
]
SLOTS = ["firstSingular", "secondSingular", "thirdSingular", "firstPlural", "secondPlural", "thirdPlural"]


def read_entities(fpath):
    content = open(fpath).read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


def write_entities(fpath, entities):
    open(fpath, "w").write("export default " + json.dumps(entities, indent=2, ensure_ascii=False) + "\n")


def symbol(slug):
    return {"slug": slug}


def entity(slug, row, symbols):
    learning, known, known_example, learning_example = row
    return {
        "slug": slug,
        "traits": ["TRANSLATED", "EXEMPLIFIED"],
        "trait": {
            "TRANSLATED": {"known": known, "learning": learning},
            "EXEMPLIFIED": {"known": known_example, "learning": learning_example},
        },
        "symbols": symbols,
    }


word_entities = []
bundles = []
for staged_path in sorted(glob.glob(f"{STAGED}/verbs-present-*.json")):
    for verb in json.load(open(staged_path)):
        lemma = verb["lemma"]
        band = verb.get("band", "a2")
        base = [
            symbol("word"), symbol(f"word.lemma.{lemma}"), symbol("word.part-of-speech.verb"),
            symbol(f"word.suffix.{verb['suffix']}"), symbol(f"word.regularity.{verb['regularity']}"),
        ]
        proficiency = [symbol(f"proficiency.cefr.{band}")]
        word_entities.append(entity(
            f"{lemma}.verb.infinitive", verb["infinitive"],
            base + [symbol("word.verb-form.infinitive")] + proficiency,
        ))
        word_entities.append(entity(
            f"{lemma}.verb.participle.past", verb["participle"],
            base + [symbol("word.verb-form.participle")] + proficiency,
        ))
        for (person, number), row in zip(CELLS, verb["present"]):
            word_entities.append(entity(
                f"{lemma}.verb.indicative.present.{person}.{number}", row,
                base + [
                    symbol("word.verb-form.finite"), symbol("word.mood.indicative"),
                    symbol("word.tense.present"), symbol(f"word.person.{person}"),
                    symbol(f"word.number.{number}"), symbol("word.voice.active"),
                ] + proficiency,
            ))
        bundles.append({
            "slug": f"{lemma}.present.indicative",
            "traits": ["RANKED", "CONJUGATED"],
            "trait": {
                "RANKED": {"rank": 0},
                "CONJUGATED": {
                    "infinitive": f"{lemma}.verb.infinitive",
                    "paradigm": {
                        slot: f"{lemma}.verb.indicative.present.{person}.{number}"
                        for slot, (person, number) in zip(SLOTS, CELLS)
                    },
                },
            },
            "symbols": [
                symbol("conjugation"), symbol(f"word.lemma.{lemma}"),
                symbol("word.mood.indicative"), symbol("word.tense.present"),
                symbol(f"word.suffix.{verb['suffix']}"), symbol(f"word.regularity.{verb['regularity']}"),
                symbol(f"proficiency.cefr.{band}"),
            ],
        })

existing_words = read_entities(f"{BASE}/words/verb.js")
existing_lemmas = {e["slug"].split(".")[0] for e in existing_words}
fresh = [e for e in word_entities if e["slug"].split(".")[0] not in existing_lemmas]
write_entities(f"{BASE}/words/verb.js", existing_words + fresh)

existing_bundles = read_entities(f"{BASE}/conjugation.js")
existing_bundle_slugs = {e["slug"] for e in existing_bundles}
fresh_bundles = [b for b in bundles if b["slug"] not in existing_bundle_slugs]
for offset, bundle in enumerate(fresh_bundles):
    bundle["trait"]["RANKED"]["rank"] = len(existing_bundles) + offset + 1
write_entities(f"{BASE}/conjugation.js", existing_bundles + fresh_bundles)

print(f"verb literals +{len(fresh)} (total {len(existing_words) + len(fresh)}), bundles +{len(fresh_bundles)} (total {len(existing_bundles) + len(fresh_bundles)})")
