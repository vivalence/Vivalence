import json
import os

HARVEST = os.path.dirname(os.path.abspath(__file__))
PREFERENCE = ["wiktionary", "happypheasant", "ciampix", "langpao", "xana000", "cerchia-g"]

candidates = json.load(open(f"{HARVEST}/word-candidates.json"))
store = json.load(open(f"{HARVEST}/word-audio-picks.json"))
picks = store.setdefault("picks", {})

before = len(picks)
wiktionary = ranked = 0
for form, speakers in candidates.items():
    if "wiktionary" in speakers:
        if picks.get(form) != "wiktionary":
            picks[form] = "wiktionary"
            wiktionary += 1
    elif form not in picks:
        best = min(speakers, key=lambda s: PREFERENCE.index(s) if s in PREFERENCE else len(PREFERENCE))
        picks[form] = best
        ranked += 1

json.dump(store, open(f"{HARVEST}/word-audio-picks.json", "w"), ensure_ascii=False, indent=1)
print(f"picks {before} -> {len(picks)} (wiktionary forced {wiktionary}, preference-ranked {ranked})")
print(f"unpicked: {sum(1 for f in candidates if f not in picks)}")
